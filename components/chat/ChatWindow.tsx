'use client';

import { useState, useRef, useEffect } from 'react';
import { BubbleMessage } from './BubbleMessage';
import { InputStreaming } from './InputStreaming';
import { toast } from 'sonner';
import { Sparkles, MessageSquareText } from 'lucide-react';

export type Message = { role: 'user' | 'assistant', content: string };

interface ChatWindowProps {
  sessionId: string;
  initialMessages: Message[];
  isLimitReached: boolean;
}

export function ChatWindow({ sessionId, initialMessages, isLimitReached }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(isLimitReached);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat pesan baru muncul atau stream berjalan
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (msg: string) => {
    // Optimistic UI untuk pesan pengguna
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: msg })
      });

      if (res.status === 429) {
        toast.error("Limit interaksi obrolan harian habis.");
        setLimitReached(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("API merespons dengan kesalahan.");
      if (!res.body) throw new Error("Body respons streaming kosong.");

      // Mempersiapkan parser Chunking (ReadableStream text/plain)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      
      // Inject bubble kosong untuk AI, lalu diisi secara dinamis (Streaming)
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantMsg += chunk;
        
        setMessages(prev => {
           const next = [...prev];
           next[next.length - 1].content = assistantMsg;
           return next;
        });
      }

    } catch (e) {
      console.error(e);
      toast.error("Gagal menerima respons dari Tutor AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-4xl mx-auto border border-slate-200 dark:border-[#362d59] rounded-[18px] overflow-hidden bg-white dark:bg-[#150f23] text-slate-900 dark:text-white shadow-2xl relative">
       {/* Area Render Bubble Chat */}
       <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
         {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-600 dark:text-white/70 animate-in fade-in zoom-in-95">
             <div className="w-16 h-16 bg-slate-100 dark:bg-[#1f1633] text-[#65a30d] dark:text-[#c2ef4e] border border-slate-200 dark:border-[#362d59] rounded-[14px] flex items-center justify-center shadow-lg">
               <Sparkles className="w-8 h-8" />
             </div>
             <div className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px]">
               // CONTEXT-LOCKED TUTOR ENGINE
             </div>
             <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">
               TUTOR AI SIAP BERDIALOG
             </h3>
             <p className="font-sans text-sm max-w-md leading-relaxed text-slate-600 dark:text-white/70">
               Tanyakan segala hal seputar informasi dari dokumen ini. Mesin terikat secara ketat dan dilarang mengarang penjelasan di luar materi.
             </p>
           </div>
         )}

         {messages.map((m, i) => (
           <BubbleMessage key={i} role={m.role} content={m.content} />
         ))}
         
         {/* Anchor scroll */}
         <div ref={bottomRef} className="h-2" />
       </div>
       
       {/* Area Input */}
       <InputStreaming onSend={handleSend} loading={loading} disabled={limitReached} />
    </div>
  );
}
