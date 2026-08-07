/**
 * middleware.ts
 * Next.js Middleware — Auth guard dan proteksi route.
 *
 * Alur redirect:
 *  1. User BELUM login mengakses /(app)/* → redirect ke /login
 *  2. User SUDAH login mengakses /          → redirect ke /dashboard (FR-00)
 *  3. User SUDAH login mengakses /login     → redirect ke /dashboard
 *  4. User SUDAH login mengakses /register  → redirect ke /dashboard
 *  5. /share/[token] dan /guest/result      → publik, tidak diproteksi
 *  6. /api/* route handlers                 → tidak diproteksi di middleware
 *     (setiap Route Handler memverifikasi session sendiri via createServerClient)
 *
 * Source:
 *  - docs/ARCHITECTURE.md §2 (middleware.ts)
 *  - docs/PRD.md §FR-00 (redirect ke /dashboard jika sudah login)
 *  - docs/AI-CONTEXT.md §Keputusan Final Tambahan (Landing Page behavior)
 *
 * ATURAN KEAMANAN:
 *  - Middleware HANYA membaca session — tidak melakukan operasi DB.
 *  - Service role key TIDAK digunakan di sini.
 *  - Supabase session di-refresh otomatis via updateSession().
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Buat Supabase client khusus middleware (menggunakan request/response cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookie ke request agar bisa dibaca di server
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Set cookie ke response agar browser menyimpannya
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // PENTING: Panggil getUser() — ini me-refresh session token jika expired.
  // Jangan panggil getSession() di middleware (tidak aman untuk server-side).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ─── RULE 1: Halaman publik khusus (tidak perlu auth check) ───────────────
  // /share/[token], /guest/result, /api/* dibiarkan lewat
  const isPublicRoute =
    pathname.startsWith('/share/') ||
    pathname.startsWith('/guest/') ||
    pathname.startsWith('/api/');

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // ─── RULE 2: User SUDAH login mengakses landing page atau auth pages ───────
  // Redirect ke /dashboard (PRD FR-00, AI-CONTEXT Keputusan Final Tambahan)
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/';

  if (user && isAuthPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // ─── RULE 3: User BELUM login mengakses route yang diproteksi ─────────────
  // Route group (app) mencakup: /dashboard, /upload, /quiz/*, /flashcard/*,
  // /chat/*, /settings
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/upload') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/flashcard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/settings');

  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    // Simpan URL tujuan asal agar bisa di-redirect balik setelah login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Semua kondisi lain: lanjutkan ke halaman tujuan
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua path KECUALI:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - File statis dengan ekstensi (png, jpg, svg, dll.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
