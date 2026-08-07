'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { SessionTopBar } from '@/components/ui/SessionTopBar';
import { Loader2, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatSessionPage() {
  const { documentId } = useParams() as { documentId: string };
  const router = useRouter();
  const supabase = createClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [docTitle, setDocTitle] = useState<string>('');

  useEffect(() => {
    async function initChat() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
           router.push('/login');
           return;
        }

        // 1. Mengambil atau Menciptakan session_id untuk dokumen ini
        const res = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id: documentId })
        });
        
        if (!res.ok) throw new Error("Gagal menginisialisasi sesi database");
        const { session_id } = await res.json();
        setSessionId(session_id);

        // Ambil judul dokumen untuk breadcrumb navigasi
        const { data: docData } = await supabase
          .from('documents')
          .select('title')
          .eq('id', documentId)
          .single();
        if (docData?.title) setDocTitle(docData.title);

        // 2. Memuat Riwayat Percakapan Masa Lalu
        const histRes = await fetch(`/api/chat/session?session_id=${session_id}`);
        if (histRes.ok) {
           const { messages: pastMsgs } = await histRes.json();
           setMessages(pastMsgs);
        }

        // 3. Memeriksa Pemblokiran Batas Pesan Harian
        const { data: profile } = await supabase
           .from('user_profiles')
           .select('tier')
           .eq('id', user.id)
           .single();
           
        if (profile?.tier !== 'pro') {
           const today = new Date().toISOString().split('T')[0];
           const { data: usage } = await supabase
              .from('chat_daily_usage')
              .select('msg_count')
              .eq('user_id', user.id)
              .eq('usage_date', today)
              .single();
              
           if (usage && usage.msg_count >= 5) {
               setLimitReached(true);
           }
        }

      } catch (err) {
        toast.error("Server gagal memuat jembatan komunikasi ke Tutor AI.");
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    
    initChat();
  }, [documentId, router, supabase]);

  if (loading || !sessionId) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background text-foreground bg-console-grid">
        <SessionTopBar sessionLabel="TUTOR AI" contextTitle={docTitle || undefined} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#65a30d] dark:text-[#c2ef4e] mb-4" />
          <p className="font-mono text-xs text-slate-600 dark:text-white/70 font-medium">MEMULAI SESI IN-MEMORY CONTEXT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col">
      <SessionTopBar sessionLabel="TUTOR AI" contextTitle={docTitle || undefined} />
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center pt-6 md:pt-8">
       {/* Headings */}
       <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#362d59]">
         <div>
           <div className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px] mb-1">
             // CONTEXT-LOCKED AI TUTOR
           </div>
           <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
             {docTitle ? `TUTOR DOKUMEN: ${docTitle.toUpperCase()}` : 'TUTOR AI MATERIAL'}
           </h1>
         </div>
       </div>
       {/* Chat Body */}
       <ChatWindow 
          sessionId={sessionId} 
          initialMessages={messages} 
          isLimitReached={limitReached} 
       />
      </div>
    </div>
  );
}
