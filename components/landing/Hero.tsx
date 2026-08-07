'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, ArrowRight, CheckCircle2, Loader2, Code2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Hero() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadGuestFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadGuestFile(file);
    }
  };

  const uploadGuestFile = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/guest/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengunggah berkas");
        return;
      }
      
      sessionStorage.setItem('guest_data', JSON.stringify(data));
      
      toast.success("BERKAS BERHASIL DIPROSES!");
      router.push('/guest/result');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Terjadi kesalahan saat memproses berkas Anda.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section className="relative min-h-[100dvh] pt-20 pb-16 px-4 md:px-8 flex items-center justify-center overflow-hidden bg-starfield border-b border-[#362d59]">
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        
        {/* Kolom Kiri: Copywriting & Actions */}
        <div className="flex flex-col items-start text-left">
          
          {/* Display Headline with EXACTLY ONE Lime Keyword Highlight Chip */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6 text-white">
            Ubah Dokumen Kuliah Jadi <span className="chip-lime-keyword">Kuis & Flashcard</span> dalam Detik.
          </h1>
          
          {/* Marketing Subtext: body-lg with 2.0 Line-Height */}
          <p className="font-sans text-base text-white/75 mb-10 max-w-[580px] leading-[2.0]">
            Tidak perlu lagi membuat ringkasan manual. Engine AI membedah materi PDF/DOCX Anda dan mengompilasi latihan soal berbasis Teori Respons Butir (IRT 1PL) secara otomatis.
          </p>
          
          {/* Action Buttons: UPPERCASE button-cap */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <Button 
                onClick={() => fileInputRef.current?.click()}
                className="button-cap h-13 px-8 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] transition-all flex items-center justify-center gap-2"
             >
                <span>COBA GRATIS SEKARANG</span>
                <ArrowRight className="w-4 h-4 text-[#150f23]" />
             </Button>
             
             <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="button-cap h-13 px-8 bg-[#150f23] text-white border border-[#362d59] hover:border-[#6a5fc1] rounded-[8px] font-bold tracking-[0.2px] transition-all"
             >
                LIHAT DEMO
             </Button>
          </div>

        </div>

        {/* Kolom Kanan: Interactive Guest Dropzone / Console UI Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto relative">
          
          {/* Floating Sticker Mascot Badge — hanya tampil di layar lg+ untuk hindari overflow mobile */}
          <div className="absolute -left-10 -top-6 bg-[#150f23] border-2 border-[#fa7faa] p-3 rounded-[8px] shadow-2xl z-20 hidden lg:flex items-center gap-3">
             <div className="bg-[#fa7faa]/20 p-2 rounded-[4px] text-[#fa7faa]">
                <CheckCircle2 className="w-5 h-5" />
             </div>
             <div>
                <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">15 SOAL ADAPTIF</p>
                <p className="font-mono text-[10px] text-white/60">AUTO GENERATED</p>
             </div>
          </div>

          {/* Console Dropzone Surface */}
          <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             className={`relative w-full rounded-[18px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center bg-[#150f23] shadow-xl ${
               isDragging 
                 ? 'border-[#c2ef4e] bg-[#c2ef4e]/10 scale-[1.01]' 
                 : 'border-[#362d59] hover:border-[#6a5fc1]'
             }`}
          >
             <div className="w-16 h-16 rounded-[12px] bg-[#1f1633] border border-[#362d59] flex items-center justify-center mb-6 text-[#c2ef4e]">
                <UploadCloud className="w-8 h-8" />
             </div>
             
             <h3 className="font-display text-xl font-bold text-white mb-2 uppercase tracking-wide">
               SERET FILE KE SINI
             </h3>
             <p className="font-sans text-sm text-white/70 mb-6 max-w-[260px] leading-[1.5]">
               Unggah PDF, DOCX, atau PPTX. Ekstraksi otomatis in-memory.
             </p>
             
             <input 
               type="file" 
               ref={fileInputRef}
               className="hidden" 
               accept=".pdf,.docx,.pptx"
               onChange={handleFileChange}
             />

             <Button 
               className="button-cap w-full h-12 bg-[#422082] text-white border border-[#362d59] hover:bg-[#6a5fc1] rounded-[8px] tracking-[0.2px] uppercase font-bold"
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
             >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin text-[#c2ef4e]" /> MEMPROSES...</>
                ) : (
                  "PILIH DOKUMEN DEMO"
                )}
             </Button>
             
             <div className="mt-6 pt-4 border-t border-[#362d59] w-full flex items-center justify-between text-xs font-mono text-white/50">
               <span>TANPA DAFTAR</span>
               <span className="text-[#fa7faa] font-bold">100% GRATIS DEMO</span>
             </div>
          </div>

        </div>
        
      </div>
    </section>
  );
}
