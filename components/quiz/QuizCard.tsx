'use client';

import { useState } from 'react';
import { Question } from './AdaptiveEngine';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  tier: string;
  onAnswer: (isCorrect: boolean) => void;
  onExplain?: (question: Question, userAnswer: string) => void;
}

export function QuizCard({ question, tier, onAnswer, onExplain }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelectedOption(opt);
    setAnswered(true);
  };

  const isCorrect = selectedOption === question.answer;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] rounded-[12px] p-6 md:p-8 shadow-md text-slate-900 dark:text-white">
      {/* Title Space Grotesk */}
      <div className="mb-6">
        <span className="micro-cap text-slate-500 dark:text-white/50 block mb-2">// SOAL KUIS ADAPTIF</span>
        <h3 className="font-display text-xl font-bold leading-relaxed text-slate-900 dark:text-white">
          {question.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          let optionStyle = "bg-slate-50 dark:bg-[#1f1633] text-slate-800 dark:text-white/90 border-slate-200 dark:border-[#362d59] hover:border-[#6a5fc1]";
          
          if (answered) {
            if (opt === question.answer) {
              optionStyle = "bg-[#65a30d]/15 text-[#65a30d] border-2 border-[#65a30d] dark:bg-[#c2ef4e]/15 dark:text-[#c2ef4e] dark:border-[#c2ef4e] font-bold";
            } else if (opt === selectedOption) {
              optionStyle = "bg-[#d946ef]/15 text-[#d946ef] border-2 border-[#d946ef] dark:bg-[#fa7faa]/15 dark:text-[#fa7faa] dark:border-[#fa7faa] font-bold";
            } else {
              optionStyle = "bg-slate-100/50 dark:bg-[#1f1633]/50 text-slate-400 dark:text-white/40 border-slate-200/50 dark:border-[#362d59]/50";
            }
          }
          
          return (
            <button 
              key={i} 
              className={`w-full justify-start text-left h-auto py-3.5 px-5 rounded-[8px] border font-sans text-sm transition-all flex items-center justify-between ${optionStyle}`}
              onClick={() => handleSelect(opt)}
              disabled={answered}
            >
              <span>{opt}</span>
              {answered && opt === question.answer && (
                <span className="font-mono text-xs text-[#65a30d] dark:text-[#c2ef4e] uppercase font-bold ml-2 shrink-0">[BENAR]</span>
              )}
              {answered && opt === selectedOption && opt !== question.answer && (
                <span className="font-mono text-xs text-[#d946ef] dark:text-[#fa7faa] uppercase font-bold ml-2 shrink-0">[SALAH]</span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Feedback Section */}
      {answered && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#362d59] flex flex-col gap-4 bg-slate-100 dark:bg-[#1f1633] -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-[12px]">
           <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 {isCorrect ? (
                   <>
                     <div className="w-8 h-8 rounded-[6px] bg-[#65a30d]/20 dark:bg-[#c2ef4e]/20 text-[#65a30d] dark:text-[#c2ef4e] flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="font-mono text-sm font-bold text-[#65a30d] dark:text-[#c2ef4e]">JAWABAN BENAR!</p>
                       <p className="font-mono text-xs text-slate-500 dark:text-white/50">Tingkat kecerdasan Theta diperbarui (+)</p>
                     </div>
                   </>
                 ) : (
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-[6px] bg-[#d946ef]/20 dark:bg-[#fa7faa]/20 text-[#d946ef] dark:text-[#fa7faa] flex items-center justify-center shrink-0">
                       <XCircle className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="font-mono text-sm font-bold text-[#d946ef] dark:text-[#fa7faa]">JAWABAN SALAH</p>
                       <p className="font-mono text-xs text-slate-600 dark:text-white/70">YANG BENAR: <strong className="text-[#65a30d] dark:text-[#c2ef4e]">{question.answer}</strong></p>
                     </div>
                   </div>
                 )}
              </div>

              <Button 
                onClick={() => onAnswer(isCorrect)}
                className="button-cap h-11 px-6 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase shrink-0 transition-all"
              >
                SOAL BERIKUTNYA
              </Button>
           </div>
           
           {/* Tombol Explain hanya untuk tier PRO */}
           {tier === 'pro' && (
             <div className="pt-4 border-t border-slate-200 dark:border-[#362d59]/50 flex justify-end">
               <Button 
                  onClick={() => onExplain && selectedOption && onExplain(question, selectedOption)} 
                  className="button-cap h-10 px-4 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-[#422082] dark:hover:bg-[#6a5fc1] border border-slate-900 dark:border-[#362d59] rounded-[8px] font-bold tracking-[0.2px] uppercase flex items-center gap-2 text-xs"
               >
                 <Sparkles className="w-4 h-4 text-[#65a30d] dark:text-[#c2ef4e]" />
                 <span>JELASKAN LOGIKA SOAL INI</span>
               </Button>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
