'use client';

import { useState, useEffect } from 'react';
import { FlippedCard } from './FlippedCard';
import { LeitnerIndicator } from './LeitnerIndicator';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';

export interface Flashcard {
  idx: number;
  type: "front_back" | "cloze_deletion";
  front: string;
  back: string;
  cloze_text: string | null;
  leitner_box: number; // Harus 1, 2, atau 3
}

interface FlashcardDeckProps {
  initialCards: Flashcard[];
  onFinishRound: (updatedCards: Flashcard[], currentRound: number) => void;
  onFinishSession: (updatedCards: Flashcard[]) => void;
}

export function FlashcardDeck({ initialCards, onFinishRound, onFinishSession }: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [round, setRound] = useState(1);
  const [activeQueue, setActiveQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [allMastered, setAllMastered] = useState(false);

  // Menentukan urutan review berdasarkan nomor putaran dan kotak Leitner
  useEffect(() => {
    const active = cards.filter(c => {
       if (c.leitner_box === 1) return true; // Box 1: diulang tiap ronde
       if (c.leitner_box === 2 && round % 2 === 0) return true; // Box 2: diulang tiap 2 ronde (ronde genap)
       if (c.leitner_box === 3 && round % 3 === 0) return true; // Box 3: diulang tiap 3 ronde
       return false;
    });

    if (active.length > 0) {
      const shuffled = [...active].sort(() => Math.random() - 0.5);
      setActiveQueue(shuffled);
      setCurrentIndex(0);
      setIsRoundFinished(false);
    } else {
      const box3Count = cards.filter(c => c.leitner_box === 3).length;
      if (box3Count === cards.length) {
         setAllMastered(true);
      } else {
         setRound(r => r + 1);
      }
    }
  }, [round, cards]);

  const handleResult = (isRemembered: boolean) => {
    const card = activeQueue[currentIndex];
    
    setCards(prev => prev.map(c => {
       if (c.idx === card.idx) {
          let newBox = c.leitner_box;
          if (isRemembered) {
             newBox = Math.min(3, c.leitner_box + 1);
          } else {
             newBox = 1;
          }
          return { ...c, leitner_box: newBox };
       }
       return c;
    }));

    if (currentIndex < activeQueue.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsRoundFinished(true);
    }
  };

  const handleNextRound = () => {
    onFinishRound(cards, round); 
    setRound(r => r + 1);
  };

  const handleFinishSession = () => {
    onFinishSession(cards);
  };

  const counts: [number, number, number] = [
    cards.filter(c => c.leitner_box === 1).length,
    cards.filter(c => c.leitner_box === 2).length,
    cards.filter(c => c.leitner_box === 3).length,
  ];

  if (allMastered) {
    return (
      <div className="w-full max-w-2xl text-center space-y-6 bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] p-12 rounded-[18px] text-slate-900 dark:text-white shadow-xl">
        <div className="w-16 h-16 bg-slate-100 dark:bg-[#1f1633] text-[#65a30d] dark:text-[#c2ef4e] border border-slate-200 dark:border-[#362d59] rounded-[12px] flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">PENGUASAAN PENUH!</h2>
        <p className="font-sans text-base text-slate-600 dark:text-white/70 max-w-md mx-auto leading-[1.5]">
          Luar biasa. Semua informasi telah terekam kuat di ingatan Anda (Semua {cards.length} kartu berpindah ke Box 3).
        </p>
        <div className="pt-4">
          <Button onClick={handleFinishSession} className="button-cap h-12 px-8 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all">
            SELESAIKAN SESI INI
          </Button>
        </div>
      </div>
    );
  }

  if (isRoundFinished) {
    return (
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in-95 bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] p-12 rounded-[18px] text-slate-900 dark:text-white shadow-xl">
        <div className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px]">// ROUND COMPLETED</div>
        <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Putaran {round} Selesai</h2>
        
        <div className="flex justify-center my-8">
           <LeitnerIndicator counts={counts} />
        </div>
        
        <p className="font-sans text-sm text-slate-600 dark:text-white/70 max-w-md mx-auto leading-[1.5]">
          Istirahat sejenak. Lanjutkan ke putaran berikutnya untuk memastikan ingatan Anda berpindah ke memori jangka panjang.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
           <Button variant="outline" onClick={handleFinishSession} className="button-cap h-12 px-6 bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 dark:bg-[#1f1633] dark:text-white dark:border-[#362d59] dark:hover:border-[#6a5fc1] rounded-[8px] font-bold tracking-[0.2px] uppercase">
             AKHIRI SESI SEKARANG
           </Button>
           <Button onClick={handleNextRound} className="button-cap h-12 px-6 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase">
             MULAI PUTARAN {round + 1}
           </Button>
        </div>
      </div>
    );
  }

  if (activeQueue.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6 md:gap-10">
       <div className="w-full max-w-2xl flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
          <span className="font-mono text-xs font-bold text-[#c2ef4e] uppercase tracking-wider bg-[#150f23] border border-[#362d59] px-4 py-2 rounded-[4px]">
            PUTARAN {round} • KARTU {currentIndex + 1} / {activeQueue.length}
          </span>
          <LeitnerIndicator counts={counts} />
       </div>
       
       <FlippedCard 
          key={activeQueue[currentIndex].idx} 
          card={activeQueue[currentIndex]} 
          onResult={handleResult} 
       />
    </div>
  );
}
