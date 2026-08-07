# Stack — Aplikasi Belajar AI

_Versi: 1.6 | Tanggal: 06 Agustus 2026_

---

## 1. Antarmuka (Frontend Stack)

| Layer | Pilihan Teknologi | Deskripsi & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Mengaktifkan fitur hibrida React Server Components (RSC) untuk efisiensi render serta optimalisasi SEO. Route Handlers digunakan sebagai API endpoint monorepo. |
| **Styling** | Tailwind CSS v3 | Desain responsif utility-first yang mempercepat proses pembuatan purwarupa (*prototyping*) UI. |
| **Component Library**| Shadcn UI | Komponen antarmuka modular yang fleksibel tanpa keterikatan dependensi berat (*zero layout lock-in*). |
| **Theme Management** | `next-themes` | Mengatur siklus hidrasi tema terang/gelap (*dark mode*) via komponen `ThemeToggle` yang dipasang di Navbar, Sidebar, dan Settings. |
| **Bahasa** | TypeScript | Menjamin keamanan tipe (*type safety*) dan mencegah bug tak terduga pada siklus produksi (*runtime*). |

---

## 2. Server & Logika Bisnis (Backend Stack)

| Layer | Pilihan Teknologi | Deskripsi & Alasan Pemilihan |
| :--- | :--- | :--- |
| **API Architecture** | Next.js Route Handlers | Penggunaan folder `/app/api/` terintegrasi langsung dalam monorepo tanpa memerlukan pemeliharaan server backend sekunder. |
| **Runtime** | Node.js (Vercel Serverless) | Model fungsi serverless berbasis Vercel untuk performa auto-scaling instan dan efisiensi biaya. |
| **Document Parsers** | `pdf-parse` (PDF) + `mammoth` (DOCX) + `officeparser` (PPTX) + `sharp` (Images) | Pustaka parsing lokal berbobot ringan untuk meminimalkan kebutuhan browser headless pada backend. |
| **PDF Scan Logic** | Gemini Native PDF (Multimodal) | Berkas PDF hasil pindaian berukuran besar dikirim langsung ke Gemini Pro/Vision sebagai buffer inline data untuk performa ekstraksi teks superior. |

> **Catatan:** Next.js Route Handlers sudah sangat memadai untuk ruang lingkup v1. Penggunaan framework server tambahan seperti Express/Fastify/Hono dihindari demi kesederhanaan arsitektur.

---

## 3. Kecerdasan Buatan (AI / LLM Stack)

| Layer | Pilihan Teknologi | Deskripsi & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Provider SDK** | `@google/generative-ai` | Pustaka resmi Google Generative AI untuk integrasi API Gemini yang optimal. |
| **Default Model** | `gemini-3.1-flash-lite` | Model utama untuk generation teks (quiz, flashcard, chat, explain). 15 RPM / 250K TPM / 500 RPD di Free Tier. |
| **Vision Model** | `gemini-3-flash` | Digunakan hanya untuk OCR: upload PDF scan & gambar. Quota terbatas (20 RPD) — hemat penggunaan. |
| **Error Fallback** | Retry MAX 3x | Jika generation gagal (invalid JSON/503 overloaded), retry hingga 3x dengan delay progresif sebelum return status error ke client. |

---

## 4. Basis Data & Autentikasi (Database & Auth)

| Layer | Pilihan Teknologi | Deskripsi & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Database Engine** | Supabase (PostgreSQL) | Layanan database PostgreSQL terkelola yang andal, dilengkapi dengan fitur realtime dan Row Level Security (RLS) bawaan. |
| **Autentikasi** | Supabase Auth | Penanganan sesi masuk (login/register) menggunakan skema Email/Password dan Google OAuth. |
| **Query Engine** | Supabase JS Client | Menggunakan pustaka resmi `@supabase/supabase-js` untuk interaksi database langsung tanpa kompleksitas ORM berat seperti Prisma standalone atau Drizzle. |
| **File Storage** | *Tidak Ada (Zero Storage)* | Berkas dokumen asli langsung dihapus dari memory pasca-proses ekstraksi. Hanya metadata dan teks hasil ekstraksi yang disimpan di database PostgreSQL. |

---

## 5. Deployment & Infrastruktur

* **Hosting Provider:** Vercel (Free/Pro Plan) — Integrasi Next.js native terbaik dengan skalabilitas otomatis.
* **Kunci Rahasia & Environtment:** Manajemen variabel lingkungan Vercel untuk menyimpan `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY`.
* **Content Delivery Network:** Jaringan Vercel Edge Network diaktifkan secara default untuk menjamin akses cepat dari berbagai wilayah geografis.

---

## 6. Library Tambahan yang Digunakan

* `next-themes`: Mengatur siklus hidrasi tema terang/gelap (*dark mode*) yang aman dari isu SSR flashing.
* `uuid`: Digunakan untuk menghasilkan token UUID v4 acak pada pembuatan tautan berbagi (*share link*).
* `zod`: Pustaka validasi skema runtime yang ketat untuk menguji integritas respon API dan output JSON dari Gemini.
* `sonner`: Toast notification modern beranimasi halus yang terintegrasi dengan Shadcn UI.
* `@radix-ui/react-*`: Kumpulan *headless UI primitives* (`slot`, `label`, `separator`, dsb.) yang digunakan untuk memastikan kompatibilitas Shadcn UI dengan **Tailwind CSS v3**.
* `tailwindcss-animate`: Plugin animasi untuk Tailwind CSS yang dibutuhkan oleh komponen interaktif Shadcn UI.
* `tw-animate-css`: Library utilitas animasi Tailwind CSS tambahan sebagai suplemen `tailwindcss-animate`.
* `@base-ui/react`: Headless UI primitives dari tim Base UI — digunakan khusus untuk komponen `Progress` yang memerlukan dukungan properti kustom (`indicatorColor`, dll.).

---

## 7. Teknologi yang Sengaja TIDAK Dipakai (Architectural Exclusions)

* **Prisma / Drizzle ORM:** Dihindari karena manipulasi data menggunakan Supabase JS client sudah cukup tangguh dan lebih ringan.
* **Redis / Upstash Cache:** Tidak diperlukan pada lingkup v1 karena data sesi kuis adaptif dan spaced repetition dapat dikelola secara optimal menggunakan React State di sisi client dan query PostgreSQL sederhana.
* **Puppeteer / Playwright:** Terlalu berat dan berisiko mengalami kendala *out-of-memory* di lingkungan serverless Vercel. Pilihan cetak dialihkan ke `window.print()` + media CSS query print.
* **LangChain / LlamaIndex:** Kerangka kerja RAG yang terlalu kompleks untuk kebutuhan MVP. Aplikasi menggunakan teknik *in-memory context* yang lebih efisien dan murah.
* **Docker:** Deployment dilakukan langsung via Vercel integration.
