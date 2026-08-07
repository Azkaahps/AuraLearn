'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Printer, ArrowLeft, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Flashcard {
  idx?: number;
  id?: string;
  type?: 'front_back' | 'cloze_deletion';
  front?: string | null;
  back?: string | null;
  cloze_text?: string | null;
  leitner_box?: number;
}

export default function PrintFlashcardPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Flashcard Belajar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tier')
          .eq('id', user.id)
          .single();

        if (profile?.tier !== 'pro') {
          alert('Fitur Cetak PDF hanya tersedia untuk tier Pro.');
          router.push('/settings');
          return;
        }

        // 1. Coba cari flashcard set berdasarkan document_id
        let { data: deck } = await supabase
          .from('flashcard_sets')
          .select('cards, document_id')
          .eq('document_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 2. Jika tidak ketemu, coba cari berdasarkan ID flashcard set
        if (!deck) {
          const { data: deckById } = await supabase
            .from('flashcard_sets')
            .select('cards, document_id')
            .eq('id', id)
            .maybeSingle();
          if (deckById) deck = deckById;
        }

        if (!deck || !deck.cards || (deck.cards as Flashcard[]).length === 0) {
          setError('Data flashcard tidak ditemukan atau masih kosong.');
          setLoading(false);
          return;
        }

        setCards(deck.cards as Flashcard[]);

        // 3. Ambil judul dokumen
        if (deck.document_id) {
          const { data: doc } = await supabase
            .from('documents')
            .select('title')
            .eq('id', deck.document_id)
            .single();
          if (doc?.title) setDocTitle(doc.title);
        }

      } catch (err) {
        console.error("Gagal memuat data cetak flashcard:", err);
        setError("Terjadi kesalahan saat mengambil data flashcard.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router, supabase]);

  const handleBack = () => {
    try {
      window.close();
    } catch (e) {}
    setTimeout(() => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(`/flashcard/${id}`);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#150f23] bg-console-grid text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#c2ef4e] mb-4" />
        <p className="font-mono text-xs text-white/70 font-medium">MEMPERSIAPKAN LEMBAR CETAK LEITNER...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#150f23] bg-console-grid text-white">
        <div className="bg-[#150f23] border border-[#362d59] p-8 rounded-[18px] text-center max-w-md shadow-xl">
          <p className="font-mono text-sm text-[#fa7faa] mb-4">{error}</p>
          <Button onClick={handleBack} className="button-cap bg-white text-[#150f23] hover:bg-white/90 font-bold uppercase">
            KEMBALI
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#150f23] bg-console-grid text-white p-3 sm:p-6 md:p-10 flex flex-col items-center print:bg-white print:text-black print:p-0 print:block">
      
      <div className="w-full max-w-5xl">
        
        {/* Sentry Console Toolbar (Screen Mode Only - Hidden on Print) */}
        <div className="bg-[#1f1633] border border-[#362d59] p-3 sm:p-4 rounded-[14px] sm:rounded-[18px] mb-6 sm:mb-8 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              className="button-cap h-9 sm:h-10 px-3 sm:px-4 bg-[#150f23] text-white border border-[#362d59] hover:border-[#6a5fc1] rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all text-xs"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2 shrink-0" />
              <span className="hidden sm:inline">KEMBALI</span>
            </Button>
            <div className="font-mono text-xs hidden xs:block">
              <span className="text-[#c2ef4e] font-bold block sm:inline">// PRO EXPORT PREVIEW</span>
              <span className="text-white/60 text-[11px] sm:text-xs block">{cards.length} KARTU LEITNER SIAP DICETAK</span>
            </div>
          </div>

          <Button 
            onClick={() => window.print()}
            className="button-cap h-9 sm:h-10 px-4 sm:px-6 bg-[#c2ef4e] text-[#150f23] hover:bg-[#b0df3e] rounded-[8px] font-bold tracking-[0.2px] uppercase shadow-md transition-all flex items-center gap-2 text-xs ml-auto sm:ml-0"
          >
            <Printer className="w-4 h-4 text-[#150f23] shrink-0" />
            <span>CETAK <span className="hidden sm:inline">/ SIMPAN PDF</span></span>
          </Button>
        </div>

        {/* Console Sheet Frame */}
        <div className="bg-[#150f23] border border-[#362d59] rounded-[14px] sm:rounded-[18px] p-4 sm:p-6 md:p-10 shadow-2xl print:border-0 print:p-0 print:bg-white print:shadow-none">
          
          {/* Printable Sheet Header */}
          <header className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-[#362d59] print:border-b-2 print:border-zinc-900 flex flex-col md:flex-row justify-between md:items-end gap-3 sm:gap-4">
            <div>
              <div className="eyebrow-cap text-[11px] sm:text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-2 print:text-zinc-600 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c2ef4e] print:text-zinc-900 shrink-0" />
                <span>// AURALEARN PRO // FLASHCARD LEITNER EXPORT</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white print:text-zinc-950 uppercase break-words">
                {docTitle}
              </h1>
            </div>
            <div className="font-mono text-xs text-white/60 print:text-zinc-600 md:text-right shrink-0">
              <p className="font-bold text-white print:text-zinc-900">TOTAL: {cards.length} KARTU</p>
              <p>TANGGAL: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </header>

          {/* Grid of Flashcards */}
          <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 print:grid-cols-2">
            {cards.map((card, idx) => {
              const frontText = card.front || card.cloze_text?.replace(/{{(.*?)}}/g, '________') || 'Pertanyaan';
              const backText = card.back || 'Jawaban';

              return (
                <div 
                  key={card.id || idx}
                  className="bg-[#1f1633] border border-[#362d59] rounded-[12px] p-4 sm:p-5 shadow-sm flex flex-col justify-between print:bg-white print:border-2 print:border-zinc-900 print:rounded-xl print:shadow-none print:break-inside-avoid"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#362d59] print:border-zinc-200 font-mono text-xs">
                      <span className="font-bold text-[#c2ef4e] print:text-zinc-900 text-xs sm:text-sm">KARTU #{idx + 1}</span>
                      <span className="text-[#fa7faa] font-bold print:text-zinc-600 text-[11px] sm:text-xs">BOX {card.leitner_box || 1}</span>
                    </div>
                    <div className="mb-4">
                      <span className="font-mono text-[10px] uppercase font-bold text-white/50 print:text-zinc-400 block mb-1">
                        PERTANYAAN / ISTILAH:
                      </span>
                      <p className="font-display font-bold text-sm sm:text-base text-white print:text-zinc-950 leading-snug break-words">
                        {frontText}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-[#362d59] bg-[#150f23] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-[12px] print:bg-zinc-50 print:border-zinc-300 print:rounded-b-xl">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#fa7faa] print:text-zinc-500 block mb-1">
                      JAWABAN / PENJELASAN:
                    </span>
                    <p className="font-sans text-xs sm:text-sm text-white/90 print:text-zinc-900 leading-relaxed font-medium break-words">
                      {backText}
                    </p>
                  </div>
                </div>
              );
            })}
          </main>

          {/* Footer */}
          <footer className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-[#362d59] print:border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[11px] sm:text-xs text-white/50 print:text-zinc-500 text-center sm:text-left">
            <p>© {new Date().getFullYear()} AURALEARN — PLATFORM ADAPTIF EDTECH</p>
            <p className="font-bold text-[#c2ef4e] print:text-zinc-900">LEITNER SPACED REPETITION ENGINE</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
