/**
 * lib/supabase/server.ts
 * Supabase client untuk server context (Server Components, Route Handlers, middleware).
 *
 * ATURAN:
 *  - createServerClient: gunakan di Server Components dan Route Handlers.
 *    Membaca/menulis cookie via Next.js cookies() API.
 *  - createServiceClient: gunakan HANYA untuk operasi yang butuh bypass RLS
 *    (contoh: admin actions, trigger manual). JANGAN ekspos ke client.
 *
 * Security: SUPABASE_SERVICE_ROLE_KEY hanya digunakan di createServiceClient.
 * Source: docs/AI-CONTEXT.md §Security Rules L178-L184
 */
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server client dengan cookie-based session management.
 * Gunakan di Server Components dan Route Handlers untuk operasi user-scoped.
 * RLS policies aktif berdasarkan session cookie user.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll dipanggil dari Server Component — cookies sudah
            // dikirim, tidak bisa di-set. Diabaikan jika middleware
            // sudah me-refresh session.
          }
        },
      },
    },
  );
}

/**
 * Service role client — bypass semua RLS policy.
 * JANGAN gunakan di Client Components atau ekspos ke browser.
 * Hanya untuk operasi admin/server-internal.
 *
 * Security: SUPABASE_SERVICE_ROLE_KEY server-side only.
 * Source: docs/AI-CONTEXT.md §Security Rules L179
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
