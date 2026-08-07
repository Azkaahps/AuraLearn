# AI Context — Ground Truth Dokumen
# Aplikasi Belajar AI

_Baca file ini SEBELUM menulis kode apapun. Ini adalah sumber kebenaran tunggal untuk project ini._  
_Versi: 1.3 | Tanggal: 06 Agustus 2026_

---

## Apa Aplikasi Ini

Aplikasi web full-stack yang mengubah dokumen (PDF/DOCX/gambar) menjadi kuis adaptif dan flashcard menggunakan AI (Gemini). Target: mahasiswa/pelajar yang ingin belajar aktif dari materi kuliah.

---

## Keputusan Final yang TIDAK Boleh Diubah AI

Daftar ini adalah hasil grilling session. Jangan override tanpa konfirmasi owner.

### Stack
- **Framework:** Next.js 14+ dengan App Router. BUKAN Pages Router.
- **Styling:** Tailwind CSS v3 + `tailwindcss-animate` + `tw-animate-css`. BUKAN styled-components, BUKAN MUI, BUKAN Chakra.
- **Component Library:** Shadcn UI (downgrade ke sintaks Radix UI untuk kompatibilitas Tailwind v3). `@base-ui/react` HANYA untuk komponen Progress (bukan sebagai pengganti Shadcn/Radix).
- **Database:** Supabase (PostgreSQL). BUKAN Prisma standalone, BUKAN MongoDB, BUKAN Firebase.
- **Auth:** Supabase Auth. BUKAN NextAuth, BUKAN Clerk, BUKAN Auth.js.
- **ORM:** Supabase JS Client langsung. BUKAN Drizzle, BUKAN Prisma.
- **AI:** Gemini API via `@google/generative-ai`. BUKAN OpenAI, BUKAN Anthropic, BUKAN LangChain.
- **Deployment:** Vercel. BUKAN Railway, BUKAN Render, BUKAN AWS.
- **Toast:** Sonner. BUKAN react-hot-toast, BUKAN react-toastify.
- **File parsing:** pdf-parse + mammoth + officeparser + sharp. BUKAN textract, BUKAN unstructured.io, BUKAN pdf2pic.
- **next.config.mjs `serverComponentsExternalPackages`:** `['pdf-parse', 'officeparser', 'file-type']` — ketiga library ini wajib tetap terdaftar di sana agar tidak di-bundle oleh webpack (Node.js native modules).

### Storage
- File asli (PDF/DOCX/gambar) **TIDAK PERNAH disimpan** ke disk atau object storage.
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

**Aturan model selector (`lib/gemini/model-selector.ts`):**
- Digunakan hanya oleh `api/upload` untuk menentukan model OCR saat memproses file baru.
- Gambar (JPG/PNG/WEBP) → selalu `gemini-3-flash`.
- PDF scan (avg char/hal < 50) → selalu `gemini-3-flash`.
- PDF teks >= 50 char/hal → default `gemini-3.1-flash-lite`, trigger `gemini-3-flash` jika > 15 halaman.
- DOCX/PPTX → default `gemini-3.1-flash-lite`, trigger `gemini-3-flash` jika teks > 25.000 karakter.
- **Catatan:** `gemini-3-flash` sangat hemat (20 RPD) — hanya gunakan saat file benar-benar memerlukan Vision.

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
- System prompt template ada di `lib/gemini/prompts.ts` (tidak hardcode di Route Handler).
- v1 juga tetap punya tombol "💡 Jelaskan Logika Soal Ini" yang on-demand per soal (Pro only).

### RAG / Vector Database
- **TIDAK ADA** RAG di v1.
- Tidak perlu pgvector, Pinecone, Weaviate, atau embedding.
- Teks dokumen dikirim langsung ke Gemini dalam prompt (context window cukup untuk dokumen ≤ 100 hal).
- Fitur "Chat dengan Materi" menggunakan **Ephemeral In-Memory Context** — bukan RAG. Seluruh `extracted_text` dokumen di-inject ke system prompt setiap request chat.

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

> 1 slide PPTX = 1 halaman PDF = 1 foto = 1 "halaman" untuk keperluan kuota.

---

## Share Link Rules

- Tracking by **IP hash** (bukan user_id, bukan cookie).
- Cap: **3 attempt per hari per IP per link**.
- API `/api/share` menerima payload `document_id` atau `quiz_id`. Jika kuis untuk `document_id` belum ada, kuis dibuat otomatis sebelum token dibagikan.
- Klik ikon Share pada kartu dokumen langsung menyalin tautan publik (`/share/[token]`) ke clipboard dengan notifikasi toast success.
- Semua penerima diperlakukan sama — tidak dibedakan logged-in atau tidak.
- Token: UUID v4 random.
- Share link tidak mengonsumsi kuota generasi penerima.

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
  di sisi client sebelum masuk ke AdaptiveEngine. Ini menghilangkan bias posisi LLM (seperti kecenderungan jawaban benar di pilihan 1/2).

Soal selection (Maximum Information Selection):
  Pilih soal dengan |difficulty_b - θ| terkecil dari questions[]

Update theta per jawaban (Online Gradient Descent):
  P     = 1 / (1 + Math.exp(-(θ - b)))  // probabilitas benar
  θ_new = θ_old + 0.3 * (actual - P)   // actual: 1=benar, 0=salah

Batch update ke DB saat sesi selesai:
  PATCH /api/quiz/[id]/theta  { theta: θ_final }
  UPDATE user_profiles SET user_theta = θ_final WHERE id = auth.uid()
```

State theta **disimpan ke DB** (`user_profiles.user_theta`) — persist antar sesi (Longitudinal Learning Tracking).

---

## Leitner Box Rules (Simplified, BUKAN SM-2 penuh)

```
3 box. Kartu mulai di Box 1.
  - Jawab "Ingat" → pindah ke box lebih tinggi (max Box 3).
  - Jawab "Lupa"  → kembali ke Box 1.

Urutan review dalam sesi:
  Box 1 → review setiap putaran
  Box 2 → review setiap 2 putaran
  Box 3 → review setiap 3 putaran

State disimpan di DB (kolom leitner_box di JSONB cards).
```

---

## Prompt Engineering Guidelines

Semua prompt ada di `lib/gemini/prompts.ts`. Jangan hardcode prompt di Route Handlers.

### Output format Gemini harus selalu JSON
- Gunakan `response_mime_type: 'application/json'` di Gemini config.
- Selalu validasi struktur JSON output sebelum simpan ke DB (gunakan Zod).
- Jika Gemini return JSON invalid → retry MAX 3x dengan delay progresif, jika masih gagal → return status error yang sesuai.

### Prompt untuk kuis harus include:
1. Teks dokumen sumber (full extracted text)
2. Jumlah soal yang diminta
3. Distribusi difficulty (misal: 30% easy, 50% medium, 20% hard)
4. Aturan posisi jawaban: instruksi eksplisit merotasi jawaban benar secara acak di 4 posisi.
5. Format output JSON yang diharapkan (sertakan contoh 1 soal)
6. Instruksi: jangan buat soal di luar konteks dokumen
7. Instruksi: setiap soal HARUS memiliki field `difficulty_b` berupa float antara -2.0 hingga +2.0.

### Prompt untuk "Chat dengan Materi" harus include:
1. `systemInstruction` pada config `getGenerativeModel()`: "Kamu adalah AI Tutor bernama AuraLearn. Jawab pertanyaan user HANYA berdasarkan dokumen berikut..."
2. Teks dokumen penuh (`extracted_text` dari DB) di-inject di `systemInstruction`.
3. History percakapan sebelumnya dari `chat_messages` (max 20 pesan).
4. Pesan user terbaru.
5. Response via Streaming (`ReadableStream`).

---

## Security Rules (Jangan Skip)

1. `GEMINI_API_KEY` — server-side only. Tidak boleh ada di variabel dengan prefix `NEXT_PUBLIC_`.
2. `SUPABASE_SERVICE_ROLE_KEY` — server-side only. Client hanya boleh pakai `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Semua Route Handlers yang butuh auth harus verifikasi session dengan Supabase server client.
4. Semua query DB yang menyentuh data user harus include `user_id = auth.uid()` filter (RLS backup).
5. Upload endpoint: validasi tipe file (whitelist: pdf, docx, pptx, jpg, png, webp). Tolak ekstensi lain dengan 400.
6. Upload endpoint: validasi ukuran file maksimal (50MB) sebelum parsing.

---

## Environment Variables yang Dibutuhkan

```env
# Server only
GEMINI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Public (aman di client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## File-file Dokumentasi Project

| File | Isi |
|---|---|
| `docs/PRD.md` | Problem statement, goals, user stories, functional & non-functional requirements, scope v1 vs v2 |
| `docs/STACK.md` | Semua library dan teknologi yang dipakai + alasan yang TIDAK dipakai |
| `docs/ARCHITECTURE.md` | Folder structure, data flow, DB schema, JSONB schemas, model selection logic |
| `docs/DESIGN.md` | Design principles, component inventory, UX states, design tokens |
| `docs/AI-CONTEXT.md` | File ini — ground truth untuk AI agar tidak halusinasi |
| `docs/LOG.md` | Log aktivitas harian pencatatan prompt dan output yang dilakukan pengembang/AI |

---

## Keputusan Final Tambahan

- **Nama aplikasi:** AuraLearn
- **Landing Page:** Ada di `/`. Berisi Hero (dengan demo upload instant), Features, Pricing, Testimonials, Footer.
- **Guest Upload Flow:**
  - Guest upload dari Landing Page menyimpan hasil kuis ke `sessionStorage` dengan key `guest_data` dan mengarahkan ke `/guest/result`.
  - Halaman `/guest/result` memuat kuis dari `guest_data` dan memunculkan modal ajakan mendaftar saat kuis selesai.
- **Dark Mode:** Didukung via `next-themes`. Toggle (`ThemeToggle`) tersedia di Navbar landing, Sidebar dashboard, dan halaman Settings.
- **Kuota Reset & Bar:** Lazy evaluation berbasis kesamaan Bulan & Tahun (`now.getMonth() === quotaDate.getMonth()`). Track bar indikator memiliki kontras tinggi (`bg-zinc-200 dark:bg-zinc-800` + `h-3.5`) dengan label *"Dokumen Diunggah: X dari Y"*.
- **Route `/documents`:** Halaman katalog dokumen user terpisah yang mem-fetch daftar dokumen milik user dan merender `DocumentCardGrid`.
- **Render Markdown Output AI:** Digunakan komponen `MarkdownText` (`components/ui/markdown-text.tsx`) untuk merender penjelasaan AI (Jelaskan Logika Soal & Chat) dengan format heading, list, dan penekanan bold/italic yang rapi.
