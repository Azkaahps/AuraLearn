'use client';

import { FileText, Play, Layers, MessageCircle, Share2, Loader2, Code2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface DocumentType {
  id: string;
  title: string | null;
  page_count: number | null;
  created_at: string;
}

interface DocumentCardGridProps {
  documents: DocumentType[];
}

export function DocumentCardGrid({ documents }: DocumentCardGridProps) {
  const [loadingShareId, setLoadingShareId] = useState<string | null>(null);

  const handleShare = async (documentId: string) => {
    try {
      setLoadingShareId(documentId);

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal membuat tautan bagikan.');
        return;
      }

      if (data.share_url) {
        await navigator.clipboard.writeText(data.share_url);
        toast.success('TAUTAN KUIS DISALIN KE CLIPBOARD!', {
          description: data.share_url,
        });
      }
    } catch (err) {
      console.error('Share Error:', err);
      toast.error('Terjadi kesalahan saat membagikan kuis.');
    } finally {
      setLoadingShareId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="bg-[#150f23] border border-[#362d59] hover:border-[#6a5fc1] rounded-[18px] p-5 sm:p-6 shadow-xl transition-all flex flex-col justify-between group hover:-translate-y-1 duration-200 min-w-0 overflow-hidden"
        >
          <div>
            {/* Header Status Bar */}
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 rounded-[8px] bg-[#1f1633] border border-[#362d59] text-[#c2ef4e] flex items-center justify-center shrink-0 group-hover:border-[#6a5fc1] transition-colors">
                 <FileText className="w-5 h-5" />
               </div>
               <span className="font-mono text-[10px] font-bold text-[#fa7faa] bg-[#fa7faa]/10 border border-[#fa7faa]/20 px-2.5 py-1 rounded-[4px] uppercase tracking-wider">
                 INDEXED DOC
               </span>
            </div>

            {/* Document Title (Space Grotesk 20px) */}
            <h3 
              className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#c2ef4e] transition-colors line-clamp-2 mb-3 leading-snug break-words" 
              title={doc.title || 'Untitled Document'}
            >
              {doc.title || 'UNTITLED_DOCUMENT.PDF'}
            </h3>

            {/* Console Metadata (Monospace font-mono) */}
            <div className="font-mono text-xs text-white/60 space-y-1.5 mb-6">
              <p className="flex items-center gap-1.5 truncate">
                <Code2 className="w-3.5 h-3.5 text-[#6a5fc1] shrink-0" />
                <span className="truncate">{doc.page_count || 'BEBERAPA'} HAL // 10 SOAL // 15 KARTU</span>
              </p>
              <p className="text-white/40 text-[11px]">
                DIUNGGAH: {new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Action Toolbar with UPPERCASE button-cap */}
          <div className="mt-auto pt-4 border-t border-[#362d59] flex items-center justify-between gap-2 w-full min-w-0">
             <div className="flex items-center gap-1.5 flex-1 min-w-0">
               <Button className="button-cap flex-1 h-9 px-2 text-xs bg-[#422082] text-white hover:bg-[#6a5fc1] border border-[#362d59] rounded-[8px] font-bold tracking-[0.2px] uppercase flex items-center justify-center gap-1 transition-all min-w-0" asChild>
                  <Link href={`/quiz/${doc.id}`}>
                    <Play className="w-3.5 h-3.5 text-[#c2ef4e] fill-[#c2ef4e] shrink-0" />
                    <span className="truncate">KUIS</span>
                  </Link>
               </Button>

               <Button variant="outline" className="button-cap flex-1 h-9 px-2 text-xs bg-[#1f1633] text-white border border-[#362d59] hover:border-[#6a5fc1] rounded-[8px] font-bold tracking-[0.2px] uppercase flex items-center justify-center gap-1 transition-all min-w-0" asChild>
                  <Link href={`/flashcard/${doc.id}`}>
                    <Layers className="w-3.5 h-3.5 text-[#a89fe0] shrink-0" />
                    <span className="truncate">KARTU</span>
                  </Link>
               </Button>
             </div>

             <div className="flex items-center gap-1 shrink-0">
               <Button 
                 size="sm" 
                 variant="outline" 
                 className="button-cap h-9 w-9 p-0 bg-[#1f1633] text-white border border-[#362d59] hover:border-[#fa7faa] hover:bg-[#fa7faa]/10 rounded-[8px] flex items-center justify-center transition-all shrink-0" 
                 asChild 
                 title="Chat AI Tutor Material"
               >
                  <Link href={`/chat/${doc.id}`}>
                    <MessageCircle className="w-4 h-4 text-[#fa7faa]" />
                  </Link>
               </Button>

               <Button 
                 size="sm" 
                 variant="outline" 
                 className="button-cap h-9 w-9 p-0 bg-[#1f1633] text-white border border-[#362d59] hover:border-[#c2ef4e] hover:bg-[#c2ef4e]/10 rounded-[8px] flex items-center justify-center transition-all shrink-0" 
                 title="Bagikan Tautan Kuis"
                 disabled={loadingShareId === doc.id}
                 onClick={() => handleShare(doc.id)}
               >
                  {loadingShareId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#c2ef4e]" />
                  ) : (
                    <Share2 className="w-4 h-4 text-[#c2ef4e]" />
                  )}
               </Button>
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}
