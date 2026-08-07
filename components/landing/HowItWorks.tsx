import { Upload, Cpu, Award } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "UNGGAH DOKUMEN",
      desc: "Seret atau pilih file materi perkuliahan/sekolah Anda (PDF, PPTX, DOCX) tanpa perlu konfigurasi.",
      icon: Upload,
      color: "text-[#c2ef4e]",
      border: "border-[#c2ef4e]/30"
    },
    {
      num: "02",
      title: "EXTRACT & BUILD",
      desc: "Mesin IRT Rasch Model dan Leitner Engine otomatis menguraikan teks menjadi kuis dan flashcard.",
      icon: Cpu,
      color: "text-[#fa7faa]",
      border: "border-[#fa7faa]/30"
    },
    {
      num: "03",
      title: "EVALUASI ADAPTIF",
      desc: "Jawab kuis dan latih memori jangka panjang dengan flashcard 3-box serta pendampingan AI Tutor.",
      icon: Award,
      color: "text-[#6a5fc1]",
      border: "border-[#6a5fc1]/30"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 md:px-8 bg-starfield border-b border-[#362d59] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-3">
             ALUR KERJA PRAKTIS
           </div>
           <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
             Cara Kerja AuraLearn
           </h2>
           <p className="font-sans text-base text-white/75 max-w-xl mx-auto leading-[2.0]">
             Hanya 3 langkah sederhana untuk mengubah dokumen statis Anda menjadi alat uji pemahaman yang adaptif.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="bg-[#150f23] border border-[#362d59] p-8 rounded-[18px] hover:border-[#6a5fc1] transition-all relative flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-bold text-white/30 group-hover:text-white transition-colors">
                      {s.num}
                    </span>
                    <div className={`w-10 h-10 rounded-[8px] bg-[#1f1633] border ${s.border} ${s.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-3 tracking-tight">
                    {s.title}
                  </h3>

                  <p className="font-sans text-sm text-white/70 leading-[1.8]">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
