'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface InputStreamingProps {
  onSend: (msg: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export function InputStreaming({ onSend, loading, disabled }: InputStreamingProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <form 
       onSubmit={handleSubmit} 
       className="flex gap-3 p-4 md:p-5 bg-slate-100 dark:bg-[#150f23] border-t border-slate-200 dark:border-[#362d59] relative z-10"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "Kapasitas interaksi harian telah habis." : "Tanyakan sesuatu tentang dokumen ini..."}
        disabled={loading || disabled}
        className="flex-1 bg-white dark:bg-[#1f1633] text-slate-900 dark:text-white border border-slate-200 dark:border-[#362d59] focus:border-[#6a5fc1] h-12 text-sm px-5 rounded-[12px] font-sans placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none transition-colors"
        autoComplete="off"
      />
      <Button 
         type="submit" 
         disabled={loading || !text.trim() || disabled} 
         className="button-cap h-12 w-12 rounded-[12px] shrink-0 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 font-bold uppercase transition-all flex items-center justify-center p-0"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-white dark:text-[#150f23]" /> : <SendHorizontal className="w-5 h-5 text-white dark:text-[#150f23]" />}
      </Button>
    </form>
  );
}
