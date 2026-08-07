'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Printer, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  idx: number;
  question: string;
  options: string[];
  answer: string;
  difficulty?: number;
  explanation?: string;
}

export default function PrintQuizPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [docTitle, setDocTitle] = useState<string>('Lembar Kuis Adaptif');
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

        // 1. Coba ambil quiz langsung berdasarkan quiz ID
        let { data: quiz } = await supabase
          .from('quizzes')
          .select('questions, document_id, documents ( title )')
          .eq('id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        // 2. Jika tidak ketemu dengan quiz ID, coba cari berdasarkan document_id
        if (!quiz) {
          const { data: quizByDoc } = await supabase
            .from('quizzes')
            .select('questions, document_id, documents ( title )')
            .eq('document_id', id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (quizByDoc) {
            quiz = quizByDoc;
          }
        }

        if (!quiz || !quiz.questions || (quiz.questions as Question[]).length === 0) {
          setError('Data kuis tidak ditemukan atau masih kosong.');
          setLoading(false);
          return;
        }

        setQuestions(quiz.questions as Question[]);
        // @ts-ignore
        if (quiz.documents?.title) setDocTitle(quiz.documents.title);

      } catch (err) {
        console.error('Print load error:', err);
        setError('Terjadi kesalahan saat memuat data kuis.');
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
        router.push(`/quiz/${id}`);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#150f23] bg-console-grid text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#c2ef4e] mb-4" />
        <p className="font-mono text-xs text-white/70 font-medium">MEMPERSIAPKAN LEMBAR KUIS ADAPTIF...</p>
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
              <span className="text-white/60 text-[11px] sm:text-xs block">{questions.length} SOAL SIAP DICETAK</span>
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
                <span>// AURALEARN PRO // ADAPTIVE IRT QUIZ EXPORT</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white print:text-zinc-950 uppercase break-words">
                LEMBAR KUIS: {docTitle}
              </h1>
            </div>
            <div className="font-mono text-xs text-white/60 print:text-zinc-600 md:text-right shrink-0">
              <p className="font-bold text-white print:text-zinc-900">TOTAL: {questions.length} SOAL</p>
              <p>TANGGAL: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </header>

          {/* List of Questions */}
          <main className="space-y-4 sm:space-y-6">
            {questions.map((q, idx) => (
              <div 
                key={q.idx || idx}
                className="bg-[#1f1633] border border-[#362d59] rounded-[12px] p-4 sm:p-6 shadow-sm print:bg-white print:border-2 print:border-zinc-900 print:rounded-xl print:shadow-none print:break-inside-avoid"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 font-mono text-xs text-white/60 print:text-zinc-600 pb-2 border-b border-[#362d59] print:border-zinc-200">
                  <span className="font-bold text-[#c2ef4e] print:text-zinc-900 text-xs sm:text-sm">SOAL NOMOR #{idx + 1}</span>
                  <span className="text-[#fa7faa] font-bold print:text-zinc-700 text-[11px] sm:text-xs">DIFFICULTY: {q.difficulty ? q.difficulty.toFixed(1) : 'NORMAL'}</span>
                </div>

                <h3 className="font-display font-bold text-sm sm:text-base text-white print:text-zinc-950 mb-4 leading-relaxed break-words">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = opt === q.answer;
                    return (
                      <div 
                        key={optIdx}
                        className={`p-2.5 sm:p-3 rounded-[8px] border text-xs sm:text-sm flex items-start gap-2.5 font-sans transition-colors break-words ${
                          isCorrect 
                            ? 'border-[#c2ef4e] bg-[#c2ef4e]/10 text-white font-semibold print:border-zinc-900 print:bg-zinc-100 print:text-zinc-950' 
                            : 'border-[#362d59] bg-[#150f23] text-white/80 print:border-zinc-300 print:bg-white print:text-zinc-800'
                        }`}
                      >
                        <span className="font-mono font-bold text-xs bg-[#1f1633] border border-[#362d59] px-2 py-0.5 rounded text-[#c2ef4e] print:bg-zinc-200 print:border-zinc-300 print:text-zinc-800 shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 min-w-0">{opt}</span>
                        {isCorrect && (
                          <span className="ml-auto font-mono text-[9px] sm:text-[10px] bg-[#c2ef4e] text-[#150f23] px-1.5 py-0.5 rounded uppercase font-bold print:bg-zinc-900 print:text-white shrink-0">
                            BENAR
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 pt-3 border-t border-dashed border-[#362d59] print:border-zinc-300 font-sans text-xs text-white/80 print:text-zinc-700 bg-[#150f23] print:bg-zinc-50 p-3 sm:p-4 rounded-[8px] print:rounded-lg">
                    <strong className="font-mono uppercase text-[#fa7faa] print:text-zinc-900 block mb-1 text-[11px] sm:text-xs">// PENJELASAN LOGIKA SOAL:</strong>
                    <p className="leading-relaxed break-words">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </main>

          {/* Footer */}
          <footer className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-[#362d59] print:border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[11px] sm:text-xs text-white/50 print:text-zinc-500 text-center sm:text-left">
            <p>© {new Date().getFullYear()} AURALEARN — PLATFORM ADAPTIF EDTECH</p>
            <p className="font-bold text-[#c2ef4e] print:text-zinc-900">RASCH 1PL ITEM RESPONSE THEORY</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
