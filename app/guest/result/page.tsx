'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { SessionTopBar } from '@/components/ui/SessionTopBar';
import { Loader2, CheckCircle2, XCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function GuestResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('guest_data');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col">
        <SessionTopBar sessionLabel="DEMO KUIS" backHref="/" backLabel="HALAMAN UTAMA" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#65a30d] dark:text-[#c2ef4e] mb-4" />
          <p className="font-mono text-xs text-slate-600 dark:text-white/70">MEMUAT DATA KUIS DEMO...</p>
        </div>
      </div>
    );
  }

  const questions = data.questions || [];
  const question = questions[currentIdx];

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    if (option === question.answer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOption(null);
      } else {
        setQuizFinished(true);
        setShowModal(true);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col select-none">
      <SessionTopBar sessionLabel="DEMO KUIS" backHref="/" backLabel="HALAMAN UTAMA" />
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative">
      
      {/* Top Header Eyebrow */}
      <div className="text-center mb-8">
        <div className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px] mb-1">
          // GUEST DEMO KUIS ADAPTIF
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          SESI KUIS HASIL EKSTRAKSI DEMO
        </h1>
      </div>

      {!quizFinished ? (
        <div className="w-full max-w-2xl flex flex-col items-center">
          
          {/* Sentry Progress Bar */}
          <div className="w-full mb-6">
             <div className="flex justify-between items-center mb-2 font-mono text-xs">
                <span className="text-[#d946ef] dark:text-[#fa7faa] uppercase font-bold tracking-wider">// SOAL DEMO</span>
                <span className="font-bold text-[#65a30d] dark:text-[#c2ef4e]">{currentIdx + 1} / {questions.length}</span>
             </div>
             <div className="h-2.5 w-full bg-slate-100 dark:bg-[#1f1633] border border-slate-200 dark:border-[#362d59] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#65a30d] dark:bg-[#c2ef4e] transition-all duration-300 ease-out" 
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
             </div>
          </div>

          {/* Sentry Console Card */}
          <div className="w-full bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] rounded-[18px] p-6 md:p-8 shadow-xl text-slate-900 dark:text-white">
            <div className="mb-6">
              <span className="micro-cap text-slate-400 dark:text-white/50 block mb-2">
                SOAL KE-{currentIdx + 1}
              </span>
              <h2 className="font-display text-xl md:text-2xl font-bold leading-relaxed text-slate-900 dark:text-white">
                {question?.question}
              </h2>
            </div>

            <div className="space-y-3">
              {question?.options?.map((opt: string, i: number) => {
                let optionStyle = "bg-slate-50 dark:bg-[#1f1633] text-slate-800 dark:text-white/90 border-slate-200 dark:border-[#362d59] hover:border-[#6a5fc1]";
                
                if (selectedOption) {
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
                    className={`w-full justify-start text-left h-auto py-4 px-5 rounded-[8px] border font-sans text-sm md:text-base transition-all flex items-center justify-between ${optionStyle}`}
                    onClick={() => !selectedOption && handleAnswer(opt)}
                    disabled={!!selectedOption}
                  >
                    <span>{opt}</span>
                    {selectedOption && opt === question.answer && (
                      <span className="font-mono text-xs text-[#65a30d] dark:text-[#c2ef4e] uppercase font-bold ml-2 shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> [BENAR]
                      </span>
                    )}
                    {selectedOption && opt === selectedOption && opt !== question.answer && (
                      <span className="font-mono text-xs text-[#d946ef] dark:text-[#fa7faa] uppercase font-bold ml-2 shrink-0 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> [SALAH]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] rounded-[18px] p-8 md:p-12 text-center text-slate-900 dark:text-white shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-slate-100 dark:bg-[#1f1633] text-[#65a30d] dark:text-[#c2ef4e] border border-slate-200 dark:border-[#362d59] rounded-[12px] flex items-center justify-center mx-auto mb-4 text-3xl font-display font-bold">
            {score}/{questions.length}
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">DEMO KUIS SELESAI!</h2>
          <p className="font-sans text-base text-slate-600 dark:text-white/70 max-w-md mx-auto leading-[1.5]">
            Bagus sekali! Anda telah menuntaskan simulasi kuis adaptif dari dokumen Anda.
          </p>
          <div className="pt-4">
            <Button 
              className="button-cap h-12 px-8 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all"
              onClick={() => setShowModal(true)}
            >
              SIMPAN HASIL & DAFTAR GRATIS
            </Button>
          </div>
        </div>
      )}

      {/* Sentry Modal Dialog Ajakan Daftar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#1f1633] border border-slate-200 dark:border-[#362d59] text-slate-900 dark:text-white rounded-[18px] p-6 md:p-8 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-[#422082] text-[#65a30d] dark:text-[#c2ef4e] rounded-[8px] border border-slate-200 dark:border-[#362d59] flex items-center justify-center mb-1">
               <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              SIMPAN HASIL BELAJAR ANDA
            </DialogTitle>
            <DialogDescription className="font-sans text-sm text-slate-600 dark:text-white/70 leading-[1.5]">
              Hasil kuis ini masih tersimpan sementara di browser Anda. Buat akun gratis untuk mengamankan data kuis ini secara permanen, membuka fitur Flashcard Leitner Box, dan mengunggah dokumen baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
             <Button 
               variant="outline" 
               onClick={() => setShowModal(false)} 
               className="button-cap h-11 px-5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-[#150f23] dark:text-white/70 dark:border-[#362d59] dark:hover:border-[#6a5fc1] rounded-[8px] font-bold tracking-[0.2px] uppercase flex-1"
             >
               NANTI SAJA
             </Button>
             <Button 
               onClick={() => router.push('/register')} 
               className="button-cap h-11 px-6 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase flex-1 flex items-center justify-center gap-2"
             >
               <span>DAFTAR SEKARANG</span>
               <ArrowRight className="w-4 h-4 text-white dark:text-[#150f23]" />
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
}
