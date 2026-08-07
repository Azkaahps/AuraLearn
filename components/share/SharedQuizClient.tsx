'use client';

import { useState } from 'react';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Button } from '@/components/ui/button';

export function SharedQuizClient({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border/50 w-full max-w-xl mx-auto mt-8">
        <h2 className="text-3xl font-bold tracking-tight">Kuis Selesai!</h2>
        <div className="text-7xl font-black text-primary">
          {score} <span className="text-3xl text-muted-foreground font-medium">/ {questions.length}</span>
        </div>
        <p className="text-muted-foreground">Ini adalah skor akhir Anda untuk sesi kuis publik ini.</p>
        <div className="pt-4 flex gap-4">
           <Button onClick={() => window.location.reload()} variant="outline" size="lg">Ulangi Kuis</Button>
           <Button onClick={() => window.location.href = '/'} size="lg">Buat Kuis Anda Sendiri</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-2xl mb-8">
         <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Progres Kuis</span>
            <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full">{currentIndex + 1} / {questions.length}</span>
         </div>
         <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
         </div>
      </div>
      
      {/* Menggunakan key supaya state terjaga saat berganti soal */}
      <QuizCard 
         key={questions[currentIndex].idx}
         question={questions[currentIndex]}
         tier="free" // Pengunjung share link tidak punya akses explain AI (Pro feature)
         onAnswer={handleAnswer}
      />
    </div>
  );
}
