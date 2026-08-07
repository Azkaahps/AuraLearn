/**
 * lib/supabase/client.ts
 * Supabase client untuk browser context (Client Components).
 *
 * ATURAN:
 *  - Gunakan file ini HANYA di 'use client' components.
 *  - Menggunakan NEXT_PUBLIC_ keys — aman di client.
 *  - Tidak boleh menggunakan SUPABASE_SERVICE_ROLE_KEY di sini.
 *
 * Source: docs/AI-CONTEXT.md §Security Rules
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
