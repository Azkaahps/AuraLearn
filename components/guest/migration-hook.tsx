'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Komponen tanpa UI yang berjalan di background.
 * Berguna untuk mendeteksi apabila ada sesi pendaftaran baru dari guest.
 * Memigrasikan data kuis `sessionStorage` ke dalam database permanen user (tabel `documents` dan `quizzes`).
 */
export function GuestMigrationHook() {
  const supabase = createClient();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function migrateData() {
      const stored = sessionStorage.getItem('guest_data');
      if (!stored) return; // Tidak ada data tamu yang perlu dimigrasi

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Belum terautentikasi penuh

      try {
        const guestData = JSON.parse(stored);
        
        // 1. Simpan dokumen
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            title: guestData.title,
            extracted_text: guestData.extracted_text,
            page_count: guestData.page_count,
            model_used: guestData.model_used,
          })
          .select('id')
          .single();

        if (docError || !doc) {
          throw new Error("Gagal menyimpan riwayat dokumen");
        }

        // 2. Simpan kuis
        const { error: quizError } = await supabase
          .from('quizzes')
          .insert({
            document_id: doc.id,
            user_id: user.id,
            questions: guestData.questions,
          });

        if (quizError) {
          throw new Error("Gagal menyimpan kuis");
        }

        // 3. Bersihkan memori dan state lokal agar tidak termigrasi dua kali
        sessionStorage.removeItem('guest_data');
        sessionStorage.removeItem('guest_upload_count'); 
        
        toast.success("Kuis perdana Anda berhasil dipindahkan ke akun baru!");
      } catch (err) {
        console.error("Migration Error:", err);
      }
    }

    migrateData();
  }, [supabase]);

  return null;
}
