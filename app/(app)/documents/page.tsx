'use client';

import { DocumentCardGrid } from '@/components/dashboard/DocumentCardGrid';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DocumentType {
  id: string;
  title: string | null;
  page_count: number | null;
  created_at: string;
}

export default function DocumentsPage() {
  const supabase = createClient();
  const [tier, setTier] = useState('free');
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [profileRes, docsRes] = await Promise.all([
          supabase.from('user_profiles').select('tier').eq('id', user.id).single(),
          supabase
            .from('documents')
            .select('id, title, page_count, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (profileRes.data) setTier(profileRes.data.tier);
        if (docsRes.data) setDocuments(docsRes.data);
      } catch (err) {
        console.error('Gagal memuat dokumen:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#362d59]">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#6a5fc1]" />
            DOKUMEN SAYA
          </h1>
          <p className="font-sans text-sm text-white/70 mt-1">
            Katalog seluruh dokumen materi yang telah Anda unggah dan proses dengan AI.
          </p>
        </div>
        
        <Button className="button-cap h-11 px-6 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase shrink-0 transition-all shadow-md" asChild>
          <Link href="/upload">
            <Upload className="w-4 h-4 mr-2 text-[#150f23]" />
            UNGGAH DOKUMEN
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/70 font-mono text-xs gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#c2ef4e]" />
          <span>MEMUAT KATALOG DOKUMEN...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-[#150f23] border border-dashed border-[#362d59] rounded-[12px] text-center shadow-xl">
          <div className="w-16 h-16 rounded-[12px] bg-[#1f1633] border border-[#362d59] flex items-center justify-center text-[#c2ef4e] mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2 uppercase">BELUM ADA DOKUMEN INDEX</h3>
          <p className="font-sans text-sm text-white/70 max-w-md mb-8 leading-[1.5]">
            Unggah materi pertama Anda dan biarkan AI membuatkan kuis adaptif, flashcard, dan tutor dialog otomatis.
          </p>
          <Button className="button-cap h-12 px-8 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all" asChild>
            <Link href="/upload">
              <Upload className="w-4 h-4 mr-2 text-[#150f23]" />
              UNGGAH DOKUMEN PERTAMA
            </Link>
          </Button>
        </div>
      ) : (
        <DocumentCardGrid documents={documents} />
      )}
    </div>
  );
}
