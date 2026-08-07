export function Testimonials() {
  const testimonials = [
    {
      quote: "Saya biasanya butuh 3 jam untuk membuat flashcard anatomi dari slide dosen. Dengan sistem AI ini, saya bisa langsung tes pemahaman dalam hitungan detik. Benar-benar efisien untuk materi kedokteran.",
      name: "Rizky D.",
      role: "MAHASISWA KEDOKTERAN",
      initial: "R"
    },
    {
      quote: "Fitur kuis adaptifnya membuat saya tahu kelemahan spesifik saya di mata kuliah Hukum Perdata. Jika saya salah, penjelasan AI-nya sangat tajam merujuk pada ketentuan di dalam dokumen sumber.",
      name: "Amanda S.",
      role: "MAHASISWA HUKUM",
      initial: "A"
    },
    {
      quote: "Sistem Spaced Repetition (Leitner Box) yang otomatis dibuat sungguh membantu saya mengingat rumus Kalkulus menjelang UAS. Antarmukanya sangat konsolidatif dan minim distraksi.",
      name: "Kevin W.",
      role: "MAHASISWA INFORMATIKA",
      initial: "K"
    }
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-[#150f23] border-b border-[#362d59]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-3">
            // TESTIMONIALS & FEEDBACK
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Dipercaya oleh Mahasiswa
          </h2>
          <p className="font-sans text-sm font-mono text-white/50 max-w-xl mx-auto">
            (Simulasi Portofolio Testimoni Pengguna)
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#1f1633] border border-[#362d59] p-8 rounded-[12px] flex flex-col justify-between hover:border-[#6a5fc1] transition-colors shadow-xl">
               <div>
                 <div className="flex gap-1 mb-6 text-[#fa7faa]">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <span key={star} className="text-lg">★</span>
                   ))}
                 </div>
                 {/* Quote body-lg with 2.0 Line Height */}
                 <p className="font-sans text-base text-white/80 leading-[2.0] mb-8">
                   "{t.quote}"
                 </p>
               </div>

               <div className="flex items-center gap-4 pt-4 border-t border-[#362d59]">
                 <div className="w-10 h-10 rounded-[6px] bg-[#422082] border border-[#362d59] text-[#c2ef4e] flex items-center justify-center font-bold text-sm font-mono shrink-0">
                   {t.initial}
                 </div>
                 <div>
                   <p className="font-display font-bold text-white text-sm">{t.name}</p>
                   <p className="font-mono text-xs text-white/50 uppercase tracking-wider">{t.role}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

