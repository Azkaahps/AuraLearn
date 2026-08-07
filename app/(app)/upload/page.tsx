'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UploadPage() {
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
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
         const errorData = await res.json().catch(() => ({}));
         throw new Error(errorData.error || "Gagal mengunggah berkas");
      }
      
      toast.success("BERKAS BERHASIL DIUNGGAH DAN DIEKSTRAKSI!");
      router.push('/dashboard');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Terjadi kesalahan saat memproses berkas Anda.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full text-center mb-10">
        <div className="eyebrow-cap text-xs text-[#d946ef] dark:text-[#fa7faa] font-mono tracking-[0.2px] mb-2">
          // DOCUMENT INGESTION CONSOLE
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white">
          UNGGAH DOKUMEN BARU
        </h1>
        <p className="font-sans text-sm text-slate-600 dark:text-white/70 max-w-lg mx-auto leading-[1.5]">
          Sistem akan membedah teks dari dokumen Anda menggunakan engine AI in-memory. Format yang didukung: PDF, DOCX, PPTX, dan Gambar.
        </p>
      </div>

      <div className="w-full max-w-xl mx-auto relative">
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full aspect-[4/3] sm:aspect-video rounded-[18px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#150f23] shadow-xl ${
              isDragging 
                ? 'border-[#c2ef4e] bg-[#c2ef4e]/10 scale-[1.01]' 
                : 'border-slate-200 dark:border-[#362d59] hover:border-[#6a5fc1]'
            }`}
        >
            <div className="w-16 h-16 rounded-[12px] bg-slate-100 dark:bg-[#1f1633] border border-slate-200 dark:border-[#362d59] flex items-center justify-center mb-6 text-[#65a30d] dark:text-[#c2ef4e]">
              <UploadCloud className="w-8 h-8" />
            </div>
            
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
              SERET FILE KE SINI
            </h3>
            <p className="font-sans text-sm text-slate-600 dark:text-white/70 mb-8 max-w-[260px] leading-[1.5]">
              Maksimal 50MB per dokumen file.
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".pdf,.docx,.pptx,.jpg,.png,.webp"
              onChange={handleFileChange}
            />
            
            <Button 
              className="button-cap h-12 px-8 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all z-20"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin text-white dark:text-[#150f23]" /> SEDANG MENGEKSTRAK...</>
              ) : (
                "PILIH DARI KOMPUTER"
              )}
            </Button>
            
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-[#362d59] w-full flex items-center justify-between text-xs font-mono text-slate-500 dark:text-white/50">
              <span>PDF / DOCX / PPTX</span>
              <span className="text-[#65a30d] dark:text-[#c2ef4e] font-bold">100% IN-MEMORY SECURITY</span>
            </div>
        </div>
      </div>
    </div>
  );
}
