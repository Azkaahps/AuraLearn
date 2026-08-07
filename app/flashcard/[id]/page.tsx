'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FlashcardDeck, Flashcard } from '@/components/flashcard/FlashcardDeck';
import { SessionTopBar } from '@/components/ui/SessionTopBar';
import { toast } from 'sonner';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FlashcardSessionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Mempersiapkan Algoritma Leitner...");
  const [tier, setTier] = useState('free');
  const [docTitle, setDocTitle] = useState<string>('');

  useEffect(() => {
    async function loadDeck() {
      // 1. Otorisasi Profil (Client-side)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Tarik tier user
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', user.id)
        .single();
      
      setTier(profile?.tier || 'free');

      // Ambil judul dokumen untuk breadcrumb navigasi
      const { data: docData } = await supabase
        .from('documents')
        .select('title')
        .eq('id', id)
        .single();
      if (docData?.title) setDocTitle(docData.title);

      // 2. Ambil data cards berbasis document_id terlebih dahulu
      let { data, error } = await supabase
        .from('flashcard_sets')
        .select('id, cards')
        .eq('document_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) {
        // Coba by id jika bukan document_id
        const { data: deckById } = await supabase
          .from('flashcard_sets')
          .select('id, cards')
          .eq('id', id)
          .single();
          
        if (deckById) {
          data = deckById;
        } else {
           // Picu pembuatan flashcard
           setLoadingText("Sedang menyusun flashcard cerdas dengan AI. Proses ini memakan waktu...");
           const res = await fetch('/api/generate/flashcard', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ document_id: id })
           });
           
           if (!res.ok) {
              toast.error("Gagal memuat kumpulan flashcard. Mungkin data telah dihapus atau Anda tidak memiliki akses.");
              router.push('/dashboard');
              return;
           }
           
           const result = await res.json();
           data = { id: result.flashcard_set_id, cards: result.cards };
           toast.success("Flashcard berhasil dibuat!");
        }
      }

      // Validasi struktur dan injeksi default state Leitner = 1 jika terlahir cacat (failsafe)
      const sanitizedCards = (data.cards as Flashcard[]).map(c => ({
        ...c,
        leitner_box: c.leitner_box || 1 
      }));

      setCards(sanitizedCards);
      setLoading(false);
    }
    loadDeck();
  }, [id, router, supabase]);

  // Method Re-usable untuk Update DB via Supabase JSONB Overwrite
  const handleSyncToDatabase = async (updatedCards: Flashcard[]) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ cards: updatedCards })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Sinkronisasi gagal:", err);
      toast.error("Gagal menyinkronkan memori progres Anda ke server.");
    }
  };

  // Terpicu setiap putaran di FlashcardDeck selesai (Intermediate Auto-save)
  const handleFinishRound = (updatedCards: Flashcard[], round: number) => {
    handleSyncToDatabase(updatedCards);
  };

  // Terpicu saat pengguna memilih keluar atau telah menuntaskan penguasaan penuh
  const handleFinishSession = async (updatedCards: Flashcard[]) => {
    setLoading(true); // Tampilkan loader saat menyimpan langkah terakhir
    await handleSyncToDatabase(updatedCards);
    toast.success("Sesi Spaced-Repetition selesai. Progres terbaru telah tersimpan otomatis!");
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background text-foreground bg-console-grid">
        <SessionTopBar sessionLabel="FLASHCARD" contextTitle={docTitle || undefined} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#65a30d] dark:text-[#c2ef4e] mb-4" />
          <p className="font-mono text-xs text-slate-600 dark:text-white/70 font-medium text-center px-4">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col">
      <SessionTopBar
        sessionLabel="FLASHCARD"
        contextTitle={docTitle || undefined}
        rightAction={
          tier === 'pro' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="button-cap h-8 text-xs bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 dark:bg-[#1f1633] dark:text-white dark:border-[#362d59] dark:hover:border-[#6a5fc1] rounded-[6px] px-3 font-bold tracking-[0.2px] uppercase transition-all print-hidden flex items-center gap-1.5"
              onClick={() => window.open(`/flashcard/${id}/print`, '_blank')}
            >
              <Printer className="w-3.5 h-3.5 text-[#65a30d] dark:text-[#c2ef4e]" />
              <span>CETAK</span>
            </Button>
          ) : undefined
        }
      />
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center pt-6 md:pt-12 relative">
       <FlashcardDeck 
          initialCards={cards}
          onFinishRound={handleFinishRound}
          onFinishSession={handleFinishSession}
       />
      </div>
    </div>
  );
}
