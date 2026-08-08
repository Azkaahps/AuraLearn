# AI Context — Ground Truth Dokumen
# Aplikasi Belajar AI

_Baca file ini SEBELUM menulis kode apapun. Ini adalah sumber kebenaran tunggal untuk project ini._  
_Versi: 1.4 | Tanggal: 08 Agustus 2026_

---

## Apa Aplikasi Ini

Aplikasi web full-stack yang mengubah dokumen (PDF/DOCX/PPTX/gambar) menjadi kuis adaptif dan flashcard menggunakan AI (Gemini). Target: mahasiswa/pelajar yang ingin belajar aktif dari materi kuliah.

---

## Keputusan Final yang TIDAK Boleh Diubah AI

Daftar ini adalah hasil grilling session. Jangan override tanpa konfirmasi owner.

### Stack
- **Framework:** Next.js 14+ dengan App Router. BUKAN Pages Router.
- **Styling:** Tailwind CSS v3 + `tailwindcss-animate` + `tw-animate-css`. BUKAN styled-components, BUKAN MUI, BUKAN Chakra.
- **Tema Visual:** 100% Pure Dark Mode Console Aesthetic (`forcedTheme="dark"`). BUKAN Light Mode. Toggle tema dinonaktifkan.
- **Component Library:** Shadcn UI (downgrade ke sintaks Radix UI untuk kompatibilitas Tailwind v3). `@base-ui/react` HANYA untuk komponen Progress (bukan sebagai pengganti Shadcn/Radix).
- **Database:** Supabase (PostgreSQL). BUKAN Prisma standalone, BUKAN MongoDB, BUKAN Firebase.
- **Auth:** Supabase Auth. BUKAN NextAuth, BUKAN Clerk, BUKAN Auth.js.
- **ORM:** Supabase JS Client langsung. BUKAN Drizzle, BUKAN Prisma.
- **AI:** Gemini API via `@google/generative-ai`. BUKAN OpenAI, BUKAN Anthropic, BUKAN LangChain.
- **Deployment:** Vercel. BUKAN Railway, BUKAN Render, BUKAN AWS.
- **Git Remote Repositori:** `https://github.com/Azkaahps/AuraLearn.git` dengan folder `auralearn` sebagai root proyek.
- **Toast:** Sonner. BUKAN react-hot-toast, BUKAN react-toastify.
- **File parsing:** pdf-parse + mammoth + officeparser + sharp. BUKAN textract, BUKAN unstructured.io, BUKAN pdf2pic.
- **next.config.mjs `serverComponentsExternalPackages`:** `['pdf-parse', 'officeparser', 'file-type']` — ketiga library ini wajib tetap terdaftar di sana agar tidak di-bundle oleh webpack (Node.js native modules).

### Storage
- File asli (PDF/DOCX/PPTX/gambar) **TIDAK PERNAH disimpan** ke disk atau object storage.
- File diproses **in-memory** lalu dibuang.
- Yang disimpan ke DB: **hanya teks hasil ekstraksi**.
- TIDAK ada Vercel Blob, TIDAK ada Supabase Storage untuk file user.

### Model Gemini

**Aturan penggunaan model (WAJIB DIIKUTI — jangan diubah tanpa alasan kuat):**

| Model | Dipakai untuk | Quota Free Tier |
|---|---|---|
| `gemini-3.1-flash-lite` | **Semua tugas generation teks**: generate quiz, generate flashcard, chat, explain | 15 RPM │ 250K TPM │ 500 RPD ✅ |
| `gemini-3-flash` | **OCR/Vision saja**: upload PDF scan & gambar di `api/upload` dan `api/guest/upload` | 5 RPM │ 250K TPM │ 20 RPD ⚠️ hemat |
| `gemini-2.x` / `gemini-1.5-x` | Quota habis / deprecated / not found | ❌ Tidak digunakan |

**Aturan kritis yang sering salah:**
- `doc.model_used` di tabel `documents` **HANYA mencatat model OCR saat upload**. Nilainya (`'flash'`/`'pro'`) **TIDAK menentukan model yang dipakai saat generate quiz/flashcard/chat/explain**.
- Semua route `generate/quiz`, `generate/flashcard`, `chat`, `explain` wajib hardcode `'gemini-3.1-flash-lite'`.
- `gemini-3-flash` hanya boleh muncul di `api/upload/route.ts` dan `api/guest/upload/route.ts` untuk bagian OCR.

### Export PDF
- **TIDAK** menggunakan `@react-pdf/renderer`.
- **TIDAK** menggunakan Puppeteer atau Playwright.
- Implementasi: `window.print()` + CSS `@media print`. Titik.

### Tutor AI / Chat
- **ADA di v1** dengan nama fitur **"Chat dengan Materi"**.
- Entry point: tombol per dokumen di Dashboard & Katalog Dokumen.
- Arsitektur: **Ephemeral In-Memory Context** — teks dokumen (`documents.extracted_text`) di-inject ke `systemInstruction` Gemini API (`gemini-3.1-flash-lite`). TIDAK ada RAG, TIDAK ada Vector DB, TIDAK ada embedding pipeline.
- Scope jawaban AI: **hanya berdasarkan dokumen yang dipilih**. Jika user tanya di luar konteks dokumen, AI wajib menjawab: "Maaf, saya hanya bisa menjawab berdasarkan dokumen ini."
- Response mode: **Streaming** (kata per kata via `ReadableStream`).
- History: **persist ke DB** (tabel `chat_sessions` + `chat_messages`).
- Tier Free: **5 pesan/hari** (tracking by `user_id` + `date`).
- Tier Pro: **unlimited**.

---

## Batas Tier (Jangan Salah Hardcode)

| Parameter | Free | Pro |
|---|---|---|
| Dokumen per bulan | **3** | **50** |
| Halaman/slide/foto per file | **10** | **100** |
| Soal per kuis | **10** | **30** |
| Flashcard per sesi | **15** | **50** |
| Share Link | ✓ | ✓ |
| Tombol Jelaskan Soal | ✗ | ✓ |
| Chat dengan Materi | 5 pesan/hari | Unlimited |
| Export/Print | ✗ | ✓ |

---

## Share Link Rules

- Tracking by **IP hash** (bukan user_id, bukan cookie).
- Cap: **3 attempt per hari per IP per link**.
- API `/api/share` menerima payload `document_id` atau `quiz_id` dan mengembalikan JSON `{ token, share_url }`.
- Klik ikon Share pada kartu dokumen langsung menyalin tautan publik (`/share/[token]`) ke clipboard dengan notifikasi toast success.

---

## Adaptive Difficulty Rules (IRT 1PL — Rasch Model)

```
State per sesi (client-side React state):
  θ (theta): float  — diambil dari DB (user_profiles.user_theta, default 0.0)

Per soal:
  difficulty_b: float (-2.0 s/d +2.0) — di-generate Gemini, BUKAN angka bulat
  difficulty_label: derive dari b
    b < -0.67       → 'easy'
    -0.67 ≤ b ≤ 0.67 → 'medium'
    b > 0.67        → 'hard'

Randomisasi posisi jawaban:
  Setiap sesi kuis memuat soal, pilihan jawaban (options[]) diacak menggunakan Fisher-Yates Shuffle
  di sisi client sebelum masuk ke AdaptiveEngine.

Update theta per jawaban (Online Gradient Descent):
  P     = 1 / (1 + Math.exp(-(θ - b)))  // probabilitas benar
  θ_new = θ_old + 0.3 * (actual - P)   // actual: 1=benar, 0=salah
```

---

## Security Rules

1. `GEMINI_API_KEY` — server-side only. Tidak boleh ada di variabel dengan prefix `NEXT_PUBLIC_`.
2. `SUPABASE_SERVICE_ROLE_KEY` — server-side only. Client hanya boleh pakai `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Semua Route Handlers yang butuh auth harus verifikasi session dengan Supabase server client.
4. Upload endpoint: validasi tipe file (whitelist: pdf, docx, pptx, jpg, png, webp) + fallback ekstensi berkas.
5. Upload endpoint: validasi ukuran file maksimal (50MB) sebelum parsing.

---

## File-file Dokumentasi Project

| File | Isi |
|---|---|
| `docs/PRD.md` | Problem statement, goals, user stories, functional & non-functional requirements, scope v1 vs v2 |
| `docs/STACK.md` | Semua library dan teknologi yang dipakai + alasan yang TIDAK dipakai |
| `docs/ARCHITECTURE.md` | Folder structure, data flow, DB schema, JSONB schemas, model selection logic |
| `docs/DESIGN.md` | Design principles, Sentry Dark Console theme, components, UX states |
| `docs/AI-CONTEXT.md` | File ini — ground truth untuk AI agar tidak halusinasi |
| `docs/LOG.md` | Log aktivitas harian pencatatan prompt dan output yang dilakukan pengembang/AI |

---

## Keputusan Final Tambahan

- **Nama Aplikasi:** AuraLearn
- **Standard Judul Tab Tab Peramban:** Format `AuraLearn - namahalaman` pada seluruh halaman.
- **Tema Visual:** 100% Pure Dark Mode Console Aesthetic (`#150f23` night surface, `#1f1633` dark canvas, `#362d59` hairline, `#c2ef4e` electric lime).
- **Alur Autentikasi & Registrasi:**
  - Form Login & Register dilengkapi ikon toggle Show/Hide Password (`<Eye />` / `<EyeOff />`).
  - Halaman Autentikasi (`/login` & `/register`) dilengkapi tombol `← KEMBALI KE BERANDA` di bagian atas.
  - Jika "Confirm Email" dinonaktifkan di Supabase Dashboard, pendaftaran akun otomatis melakukan **auto-login** dan **instant redirect ke `/dashboard`**.
- **Grid Dokumen Responsif:** Breakpoint `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6` untuk menjamin tampilan 3 kolom yang luas pada layar laptop / skala Windows 125%/150%.
- **Route `/documents`:** Halaman katalog dokumen user terpisah yang mem-fetch daftar dokumen milik user dan merender `DocumentCardGrid`.
- **Render Markdown Output AI:** Digunakan komponen `MarkdownText` (`components/ui/markdown-text.tsx`) untuk merender penjelasaan AI dengan format heading, list, dan penekanan bold/italic yang rapi.
