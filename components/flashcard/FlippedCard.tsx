'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flashcard } from './FlashcardDeck';
import { RotateCcw } from 'lucide-react';

interface FlippedCardProps {
  card: Flashcard;
  onResult: (isRemembered: boolean) => void;
}

export function FlippedCard({ card, onResult }: FlippedCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
      {/* Container Efek 3D Flip */}
      <div 
        className={`relative w-full aspect-[4/3] md:aspect-[3/2] [perspective:1000px] ${!flipped ? 'cursor-pointer group' : ''}`} 
        onClick={() => !flipped && setFlipped(true)}
      >
        <div 
           className={`w-full h-full transition-all duration-500 ease-out [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
           {/* Tampak Depan */}
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden] bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] hover:border-[#6a5fc1] transition-colors rounded-[18px] shadow-md text-slate-900 dark:text-white">
              <span className="micro-cap text-slate-400 dark:text-white/40 mb-4">// SISI DEPAN (PERTANYAAN)</span>
              <h3 className="font-display text-2xl md:text-3xl font-bold leading-relaxed text-slate-900 dark:text-white">
                {card.front}
              </h3>
              {!flipped && (
                <div className="absolute bottom-6 flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-white/50 group-hover:text-[#65a30d] dark:group-hover:text-[#c2ef4e] transition-colors animate-pulse">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>KLIK KARTU UNTUK MEMBALIK</span>
                </div>
              )}
           </div>

           {/* Tampak Belakang */}
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-50 dark:bg-[#1f1633] border-2 border-[#6a5fc1] rounded-[18px] shadow-2xl text-slate-900 dark:text-white">
              {card.type === 'cloze_deletion' ? (
                <>
                  <p className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px] mb-4">// JAWABAN BAGIAN RUMPANG</p>
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-[#65a30d] dark:text-[#c2ef4e]">{card.back}</h3>
                </>
              ) : (
                <>
                  <p className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px] mb-4">// JAWABAN / SISI BALIK</p>
                  <h3 className="font-display text-2xl md:text-3xl font-bold leading-relaxed text-slate-900 dark:text-white">{card.back}</h3>
                </>
              )}
           </div>
        </div>
      </div>

      {/* Tombol Aksi Leitner */}
      <div 
         className={`flex gap-4 w-full transition-all duration-300 transform ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
         <Button 
            onClick={() => onResult(false)}
            className="button-cap flex-1 h-14 bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200 dark:bg-[#fa7faa]/15 dark:text-[#fa7faa] dark:border-[#fa7faa]/40 dark:hover:bg-[#fa7faa]/30 rounded-[8px] font-bold tracking-[0.2px] uppercase text-base transition-all"
         >
           LUPA
         </Button>
         <Button 
            onClick={() => onResult(true)}
            className="button-cap flex-1 h-14 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-[#c2ef4e] dark:text-[#150f23] dark:hover:bg-[#c2ef4e]/90 rounded-[8px] font-bold tracking-[0.2px] uppercase text-base transition-all"
         >
           INGAT
         </Button>
      </div>
    </div>
  );
}
