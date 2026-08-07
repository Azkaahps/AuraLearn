import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { Terminal, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Home',
};

export default async function LandingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect('/dashboard');
  }

  const pillars = [
    {
      title: "KUIS ADAPTIF IRT 1PL",
      desc: "Tingkat kesulitan soal beradaptasi secara real-time berdasarkan respons Anda menggunakan Teori Respons Butir Rasch Model.",
      icon: Cpu,
      tag: "ENGINE CORE"
    },
    {
      title: "FLASHCARD LEITNER BOX",
      desc: "Algoritma pengulangan berkala (Spaced Repetition) otomatis memilah kartu hafalan sesuai tingkat penguasaan memori Anda.",
      icon: Zap,
      tag: "MEMORY SYSTEM"
    },
    {
      title: "CHAT TUTOR AI MATERIAL",
      desc: "Ajukan pertanyaan langsung pada materi PDF Anda. AI memberikan jawaban dengan kutipan halaman & konteks presisi.",
      icon: Terminal,
      tag: "CONTEXTUAL AI"
    },
    {
      title: "SHARED QUIZ CONSOLE",
      desc: "Bagikan kuis interaktif ke teman sekelas via tautan instan. Pantau perolehan skor tanpa perlu registrasi akun.",
      icon: ShieldCheck,
      tag: "PUBLIC ACCESS"
    }
  ];

  return (
    <div className="min-h-screen bg-[#150f23] text-white selection:bg-[#6a5fc1]/40 flex flex-col justify-between">
      
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Value Proposition / Feature Pillars Console Grid */}
      <section id="features" className="py-20 px-4 md:px-8 border-t border-[#362d59] bg-[#150f23] relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
             <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-3">
               FITUR UNGGULAN
             </div>
             <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
               Arsitektur Pembelajaran Adaptif
             </h2>
             <p className="font-sans text-base text-white/70 leading-[1.8]">
               Empat pilar teknologi cerdas yang dirancang untuk mengoptimalkan memori jangka panjang dan efisiensi studi Anda.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {pillars.map((pillar, idx) => (
               <div 
                 key={idx}
                 className="bg-[#1f1633] border border-[#362d59] hover:border-[#6a5fc1] rounded-[18px] p-6 shadow-xl transition-all flex flex-col justify-between group hover:-translate-y-1 duration-200"
               >
                 <div>
                   <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-[8px] bg-[#150f23] border border-[#362d59] text-[#c2ef4e] flex items-center justify-center group-hover:border-[#6a5fc1] transition-colors">
                        <pillar.icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#fa7faa] bg-[#fa7faa]/10 border border-[#fa7faa]/20 px-2.5 py-1 rounded-[4px] uppercase tracking-wider">
                        {pillar.tag}
                      </span>
                   </div>

                   <h3 className="font-display text-lg font-bold text-white mb-3 tracking-wide">
                     {pillar.title}
                   </h3>

                   <p className="font-sans text-sm text-white/70 leading-[1.6]">
                     {pillar.desc}
                   </p>
                 </div>
               </div>
             ))}
          </div>

        </div>
      </section>

      {/* 4. How It Works Workflow */}
      <HowItWorks />

      {/* 5. Pricing Section */}
      <Pricing />

      {/* 6. Footer Section */}
      <Footer />

    </div>
  );
}
