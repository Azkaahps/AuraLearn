'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdaptiveEngine, Question } from '@/components/quiz/AdaptiveEngine';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Button } from '@/components/ui/button';
import { MarkdownText } from '@/components/ui/markdown-text';
import { SessionTopBar } from '@/components/ui/SessionTopBar';
import { toast } from 'sonner';
import { Loader2, Printer, Sparkles } from 'lucide-react';

export default function QuizSessionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Mempersiapkan Sesi Kuis...");
  const [tier, setTier] = useState('free');
  const [engine, setEngine] = useState<AdaptiveEngine | null>(null);
  const [quizId, setQuizId] = useState<string>(''); // ID kuis aktual dari DB (bukan document_id)
  const [docTitle, setDocTitle] = useState<string>('');
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  const [explainText, setExplainText] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tier, user_theta')
          .eq('id', user.id)
          .single();
          
        setTier(profile?.tier || 'free');
        const initialTheta = profile?.user_theta || 0.0;

        // Ambil judul dokumen untuk breadcrumb navigasi
        const { data: docData } = await supabase
          .from('documents')
          .select('title')
          .eq('id', id)
          .single();
        if (docData?.title) setDocTitle(docData.title);

        // 1. Coba cari kuis berdasarkan document_id terlebih dahulu
        let { data: quiz } = await supabase
          .from('quizzes')
          .select('id, questions')
          .eq('document_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!quiz) {
          // 2. Jika tidak ketemu, coba cari berdasarkan quiz_id
          const { data: quizById } = await supabase
            .from('quizzes')
            .select('id, questions')
            .eq('id', id)
            .single();
            
          if (quizById) {
            quiz = quizById;
          } else {
            // 3. Jika benar-benar tidak ada, picu pembuatan kuis (Lazy Generation)
            setLoadingText("Sedang menyusun soal kuis dengan AI. Ini mungkin memakan waktu hingga 30 detik...");
            const res = await fetch('/api/generate/quiz', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ document_id: id })
            });
            
            if (!res.ok) {
               toast.error("Sesi kuis tidak ditemukan dan gagal dibuat baru.");
               router.push('/dashboard');
               return;
            }
            
            const result = await res.json();
            quiz = { id: result.quiz_id, questions: result.questions };
            toast.success("Kuis berhasil dibuat!");
          }
        }

        // Shuffle posisi options setiap sesi untuk menghilangkan bias posisi AI.
        // answer string tidak berubah — QuizCard mencocokkan berdasarkan teks, bukan indeks.
        const shuffledQuestions: Question[] = (quiz.questions as any[]).map((q) => {
          const opts = [...q.options];
          for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
          }
          return { ...q, options: opts };
        });

        const newEngine = new AdaptiveEngine(initialTheta, shuffledQuestions);
        
        setQuizId(quiz.id);
        setEngine(newEngine);
        setProgress({ current: 0, total: shuffledQuestions.length });
        setCurrentQuestion(newEngine.getNextQuestion());
      } catch (err) {
        console.error("Gagal memuat sesi kuis:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [id, router, supabase]);

  const handleAnswer = (isCorrect: boolean) => {
    if (!engine || !currentQuestion) return;
    
    if (isCorrect) setScore(s => s + 1);
    
    // Update Theta (engine calculation)
    engine.submitAnswer(currentQuestion, isCorrect);
    setExplainText(null); // Bersihkan penjelasan saat beralih soal
    
    if (engine.isFinished()) {
      setIsFinished(true);
      finishSession(engine.getCurrentTheta());
    } else {
      setProgress(p => ({ ...p, current: p.current + 1 }));
      setCurrentQuestion(engine.getNextQuestion());
    }
  };

  const finishSession = async (finalTheta: number) => {
    try {
      // Sinkronisasi akhir profil: kirim theta final ke server
      const res = await fetch(`/api/quiz/${id}/theta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theta: finalTheta })
      });
      
      if (res.ok) {
        toast.success("Kuis selesai! Kalibrasi adaptif Anda telah diperbarui.");
      } else {
        throw new Error("Gagal menyimpan kalibrasi.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyinkronkan data kuis.");
    }
  };

  const handleExplain = async (q: Question, userAnswer: string) => {
     setLoadingExplain(true);
     try {
       const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             quiz_id: quizId,   // Gunakan quizId (ID kuis aktual), BUKAN id (document_id)
             question_idx: q.idx, 
             jawaban_user: userAnswer 
          })
       });
       
       if (res.ok) {
          const data = await res.json();
          setExplainText(data.explanation);
       } else {
          setExplainText("Gagal memuat penjelasan dari AI. Pastikan Anda berlangganan Pro.");
       }
     } catch(e) {
       setExplainText("Gagal tersambung ke server.");
     } finally {
       setLoadingExplain(false);
     }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background text-foreground bg-console-grid">
        <SessionTopBar sessionLabel="KUIS ADAPTIF" contextTitle={docTitle || undefined} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#65a30d] dark:text-[#c2ef4e] mb-4" />
          <p className="font-mono text-sm text-slate-600 dark:text-white/70 font-medium text-center px-4">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background text-foreground bg-console-grid">
        <SessionTopBar sessionLabel="KUIS ADAPTIF" contextTitle={docTitle || undefined} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg text-center space-y-6 bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] p-8 md:p-12 rounded-[18px] shadow-xl text-slate-900 dark:text-white">
            <div className="w-20 h-20 bg-slate-100 dark:bg-[#1f1633] text-[#65a30d] dark:text-[#c2ef4e] border border-slate-200 dark:border-[#362d59] rounded-[12px] flex items-center justify-center mx-auto mb-4 text-3xl font-display font-bold">
               {score}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">KUIS SELESAI!</h1>
            <p className="font-sans text-base text-slate-800 dark:text-white/90">Skor Akhir: <strong className="text-[#65a30d] dark:text-[#c2ef4e]">{score}</strong> dari {progress.total} soal benar.</p>
            <p className="font-sans text-sm text-slate-600 dark:text-white/70 mb-8 leading-[1.5]">
              Engine AI telah mengkalkulasi dan menyesuaikan tingkat kecerdasan (Theta) Anda 
              sebagai referensi kuis adaptif masa mendatang.
            </p>
            <Button className="button-cap h-12 px-8 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all" onClick={() => router.push('/dashboard')}>
              KEMBALI KE DASBOR
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col">
      <SessionTopBar
        sessionLabel="KUIS ADAPTIF"
        contextTitle={docTitle || undefined}
        rightAction={
          tier === 'pro' && quizId ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="button-cap h-8 text-xs bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 dark:bg-[#1f1633] dark:text-white dark:border-[#362d59] dark:hover:border-[#6a5fc1] rounded-[6px] px-3 font-bold tracking-[0.2px] uppercase transition-all print-hidden flex items-center gap-1.5"
              onClick={() => window.open(`/quiz/${quizId}/print`, '_blank')}
            >
              <Printer className="w-3.5 h-3.5 text-[#65a30d] dark:text-[#c2ef4e]" />
              <span>CETAK</span>
            </Button>
          ) : undefined
        }
      />
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center relative">
      
      {/* Progress Bar Sentry Style */}
      <div className="w-full max-w-2xl mb-8">
         <div className="flex justify-between items-center mb-2 font-mono text-xs">
            <span className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px]">// PROGRES ADAPTIF IRT</span>
            <span className="font-bold text-[#65a30d] dark:text-[#c2ef4e]">{progress.current + 1} / {progress.total} SOAL</span>
         </div>
         <div className="h-2.5 w-full bg-slate-100 dark:bg-[#1f1633] border border-slate-200 dark:border-[#362d59] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#65a30d] dark:bg-[#c2ef4e] transition-all duration-300 ease-out" 
              style={{ width: `${((progress.current) / progress.total) * 100}%` }}
            />
         </div>
      </div>

      {/* Active Quiz Card */}
      {currentQuestion && (
        <QuizCard 
           key={currentQuestion.idx}
           question={currentQuestion}
           tier={tier}
           onAnswer={handleAnswer}
           onExplain={handleExplain}
        />
      )}

      {/* Loading Indicator for AI Explanation */}
      {loadingExplain && (
        <div className="mt-6 w-full max-w-2xl flex items-center gap-3 px-5 py-4 rounded-[12px] border border-slate-200 dark:border-[#362d59] bg-white dark:bg-[#150f23] text-slate-900 dark:text-white shadow-sm font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-[#65a30d] dark:text-[#c2ef4e] flex-shrink-0" />
          <span className="text-slate-600 dark:text-white/70">GEMINI SEDANG MENYUSUN PENJELASAN MATERIAL...</span>
        </div>
      )}
      
      {/* Explanation Result */}
      {explainText && (
        <div className="mt-6 w-full max-w-2xl rounded-[12px] border border-slate-200 dark:border-[#362d59] bg-white dark:bg-[#150f23] text-slate-900 dark:text-white shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          {/* Console Header */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 dark:border-[#362d59] bg-slate-50 dark:bg-[#1f1633]">
            <Sparkles className="w-4 h-4 text-[#65a30d] dark:text-[#c2ef4e] flex-shrink-0" />
            <span className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px]">PENJELASAN LOGIKA SOAL (AI TUTOR)</span>
          </div>
          {/* Body */}
          <div className="px-5 py-5 leading-[1.8] text-slate-800 dark:text-white/90 text-sm">
            <MarkdownText 
              content={explainText} 
              className="text-slate-800 dark:text-white/90"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
