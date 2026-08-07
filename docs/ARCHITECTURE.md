# Architecture — Aplikasi Belajar AI

_Versi: 1.3 | Tanggal: 06 Agustus 2026_

---

## 1. Overview Arsitektur

Aplikasi ini menggunakan arsitektur **Next.js Full-Stack Monorepo**. Tidak ada server backend terpisah. Semua logika sisi server dijalankan melalui **Next.js Route Handlers** (`app/api/`). Database dan autentikasi dikelola oleh **Supabase (PostgreSQL)**, sedangkan pemrosesan AI dijalankan di sisi server menggunakan **Google Gemini API**.

```
                           ┌──────────────────┐
                           │ Browser (Client) │
                           └────────┬─────────┘
                                    │ (HTTP / SSE)
                                    ▼
                        ┌──────────────────────┐
                        │ Next.js App (Vercel) │
                        └──────────┬───────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────┐                               ┌──────────────────┐
│ Supabase DB/Auth │                               │  Google Gemini   │
│   (PostgreSQL)   │                               │    API (SDK)     │
└──────────────────┘                               └──────────────────┘
```

---

## 2. Struktur Folder & Modul

```
/
├── app/
│   ├── page.tsx                       ← Landing Page (publik, auto-redirect jika login)
│   ├── (auth)/
│   │   ├── login/page.tsx             ← Autentikasi Masuk
│   │   └── register/page.tsx          ← Pendaftaran Akun Baru
│   ├── (app)/
│   │   ├── layout.tsx                     ← App layout (Sidebar + auth guard server-side)
│   │   ├── dashboard/page.tsx             ← Panel Utama & Dasbor Kuota
│   │   ├── documents/page.tsx             ← Galeri semua dokumen user (client component)
│   │   ├── upload/page.tsx                ← Dropzone Unggah Dokumen (multi-state)
│   │   ├── quiz/[id]/page.tsx             ← Sesi Kuis Adaptif (Client-side Shuffle + QuizId fix)
│   │   ├── flashcard/[id]/page.tsx        ← Sesi Flashcard Leitner
│   │   ├── chat/[documentId]/page.tsx     ← Chat dengan Materi
│   │   └── settings/page.tsx             ← Pengaturan Akun & Upgrade Tier (termasuk Tema Tampilan)
│   ├── share/[token]/page.tsx         ← Public share link (tanpa login)
│   ├── guest/result/page.tsx          ← Hasil Kuis Sementara untuk Guest (reads guest_data)
│   └── api/
│       ├── upload/route.ts            ← Ekstraksi file, simpan teks dokumen, deduct kuota
│       ├── guest/upload/route.ts      ← Pemrosesan instan dokumen guest
│       ├── generate/quiz/route.ts     ← Pembuatan soal kuis berbasis AI (hardcode gemini-3.1-flash-lite)
│       ├── generate/flashcard/route.ts← Pembuatan kartu flashcard berbasis AI
│       ├── explain/route.ts           ← Logika penjelasan soal on-demand (Pro only, accepts quiz_id)
│       ├── chat/route.ts              ← Obrolan streaming context dokumen (systemInstruction separation)
│       ├── chat/session/route.ts      ← Inisiasi sesi chat dokumen
│       ├── share/route.ts             ← Pembuatan token public share (supports document_id & quiz_id)
│       ├── quiz/[id]/theta/route.ts   ← Sinkronisasi parameter theta IRT 1PL
│       ├── upgrade/route.ts           ← Mock payment hook — set tier user ke 'pro'
│       └── flag/route.ts              ← Sistem pelaporan soal kuis
├── app/(print)/                   ← Route group cetak (tanpa Sidebar, latar putih bersih)
│   ├── layout.tsx                     ← Layout minimal tanpa nav untuk printer
│   ├── quiz/[id]/print/page.tsx       ← Halaman cetak kuis — query by quiz_id / fallback document_id
│   └── flashcard/[id]/print/page.tsx  ← Halaman cetak flashcard grid — Pro only
├── components/
│   ├── ui/                            ← Library UI Shadcn + progress.tsx + markdown-text.tsx
│   ├── theme-toggle.tsx               ← Komponen toggle Dark Mode / Light Mode
│   ├── landing/                       ← Komponen Landing Page (Hero, Testimonials, Pricing, Navbar, Footer)
│   ├── quiz/                          ← QuizCard, AdaptiveEngine
│   ├── flashcard/                     ← FlashcardDeck, FlippedCard, LeitnerIndicator
│   ├── chat/                          ← ChatWindow, BubbleMessage, InputStreaming
│   ├── dashboard/                     ← Sidebar, QuotaProgressBar, DocumentCardGrid
│   ├── guest/                         ← migration-hook.tsx
│   ├── settings/                      ← SettingsClient.tsx (Mock Upgrade Flow UI + Theme Settings)
│   └── share/                         ← SharedQuizClient.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  ← Supabase Client untuk Browser Context
│   │   └── server.ts                  ← Supabase Client Server-Side (Service Role)
│   ├── gemini/
│   │   ├── client.ts                  ← Inisiasi SDK Google Generative AI (Model 3.x)
│   │   ├── model-selector.ts          ← Logika penentuan model OCR (gemini-3-flash vs 3.1-flash-lite)
│   │   └── prompts.ts                 ← System instruction & prompt AI dengan aturan acak jawaban
│   ├── parsers/
│   │   ├── pdf.ts                     ← Parser PDF teks & deteksi scan otomatis
│   │   ├── docx.ts                    ← Parser file Word (.docx)
│   │   ├── pptx.ts                    ← Parser file PowerPoint (.pptx)
│   │   └── image.ts                   ← Metadata Extraction & Buffer Base64
│   ├── adaptive/
│   │   └── irt.ts                     ← Algoritma Matematika IRT 1PL (Theta & Information)
│   ├── chat/
│   │   └── limit.ts                   ← Utilitas pengecekan & pembatasan chat harian
│   └── quota/
│       └── check.ts                   ← Utilitas limitasi kredit unggah dokumen
├── types/
│   └── index.ts                       ← Pendefinisian Tipe TypeScript Global
└── middleware.ts                      ← Middleware Autentikasi & Proteksi Route Group (app)
```

---

## 3. Diagram Aliran Data (Data Flow)

### A. Alur Unggah Dokumen Tamu (Guest Upload Flow)
```
[Guest Uploads File] ──► [POST /api/guest/upload]
                                │
                                ├─► [Parser] EKSTRAKSI TEKS (In-Memory)
                                └─► [Gemini 3.1 Flash Lite] PEMBUATAN SOAL KUIS (Max 10)
                                │
                                ▼ (Return JSON)
                         [Save payload to sessionStorage('guest_data')]
                                │
                                ▼ (Redirect)
                         [/guest/result] ──► [Interactive Demo Quiz & Modal Register]
```

### B. Alur Unggah & Pembuatan Kuis Pengguna Terdaftar
1. **Unggah Berkas:** Pengguna mengunggah berkas ke dashboard `/upload` $\rightarrow$ Kirim berkas ke `/api/upload`.
2. **Pengecekan Kuota:** Backend memeriksa sisa kuota pengguna di Supabase Database (`user_profiles.docs_used`). Pengecekan bulan berjalan dihitung dengan membandingkan kesamaan bulan & tahun (`now.getMonth() === quotaDate.getMonth()`).
3. **Ekstraksi & Seleksi Model:** Teks diekstrak. Model Gemini OCR ditentukan oleh `selectGeminiModel` (`gemini-3.1-flash-lite` untuk teks, `gemini-3-flash` untuk scan/gambar).
4. **Penyimpanan:** Teks yang berhasil diekstrak disimpan di tabel `documents`. Berkas fisik langsung dihapus. `docs_used` ditambah 1.
5. **Pembuatan Kuis:** Client memanggil `/api/generate/quiz` $\rightarrow$ Gemini API (`gemini-3.1-flash-lite`) membuat soal $\rightarrow$ Validasi Zod $\rightarrow$ Options di-shuffle $\rightarrow$ Simpan ke tabel `quizzes`.

### C. Alur Kuis Adaptif (IRT 1PL + Client Shuffle)
1. **Inisiasi:** Sesi kuis memuat nilai kemampuan belajar pengguna $\theta$ (theta) awal dari database dan data soal kuis.
2. **Client-side Options Shuffle:** Sebelum masuk ke `AdaptiveEngine`, urutan `options[]` setiap soal diacak menggunakan algoritma Fisher-Yates di browser untuk menghilangkan bias posisi LLM.
3. **Seleksi Soal:** Aplikasi memilih soal berikutnya dari daftar soal yang tersedia menggunakan aturan **Maximum Information Selection**, yaitu soal yang memiliki tingkat kesulitan $b$ terdekat dengan $\theta$ saat ini ($|difficulty\_b - \theta|$).
4. **Pengerjaan & Remount State:** `QuizCard` di-render dengan `key={currentQuestion.idx}` agar state internal (`answered`, `selectedOption`) ter-reset bersih pada setiap soal baru.
5. **Kalkulasi Theta:** Jawaban diverifikasi $\rightarrow$ Nilai $\theta$ diperbarui langsung di sisi client menggunakan rumus *Online Gradient Descent*:
   $$\theta_{new} = \theta_{old} + 0.3 \times (actual - P)$$
6. **Sinkronisasi:** Setelah seluruh soal selesai dijawab, nilai $\theta$ final dikirimkan via `PATCH /api/quiz/[id]/theta` untuk diperbarui di profil pengguna di database.

---

## 4. Skema Database (Supabase / PostgreSQL)

```sql
-- Profil Pengguna & Tiering
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  tier        TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  docs_used   INT NOT NULL DEFAULT 0,
  quota_reset DATE NOT NULL DEFAULT date_trunc('month', now()),
  user_theta  FLOAT NOT NULL DEFAULT 0.0
);

-- Dokumen Hasil Ekstraksi
CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  title          TEXT,
  extracted_text TEXT NOT NULL,
  page_count     INT,
  model_used     TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Kumpulan Soal Kuis
CREATE TABLE quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  questions   JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Kumpulan Kartu Flashcard
CREATE TABLE flashcard_sets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  cards       JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tautan Berbagi Publik (Kuis ATAU Flashcard)
CREATE TABLE share_links (
  token            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id          UUID REFERENCES quizzes(id),
  flashcard_set_id UUID REFERENCES flashcard_sets(id),
  owner_id         UUID NOT NULL REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT share_target_check CHECK (
    (quiz_id IS NOT NULL AND flashcard_set_id IS NULL) OR
    (quiz_id IS NULL AND flashcard_set_id IS NOT NULL)
  )
);

-- Pelacakan Pembatasan Akses Share Link (Rate Limit by IP Hash)
CREATE TABLE share_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token        UUID NOT NULL REFERENCES share_links(token),
  ip_hash      TEXT NOT NULL,
  attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(token, ip_hash, attempt_date)
);

-- Laporan Kualitas Soal Kuis
CREATE TABLE flagged_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID NOT NULL REFERENCES quizzes(id),
  question_idx INT NOT NULL,
  user_id      UUID REFERENCES auth.users(id),
  reason       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Sesi Obrolan Dokumen (Chat)
CREATE TABLE chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  document_id UUID NOT NULL REFERENCES documents(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Pesan Obrolan Dokumen (Chat Messages)
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pelacakan Limit Obrolan Harian User Free
CREATE TABLE chat_daily_usage (
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  msg_count  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);
```

---

## 5. Skema Struktur Data JSONB

### Kuis Soal (`quizzes.questions`)
```json
{
  "idx": 0,
  "type": "multiple_choice",
  "difficulty_b": -0.73,
  "difficulty_label": "easy",
  "question": "Apa nama model matematika yang digunakan untuk kuis adaptif di AuraLearn?",
  "options": [
    "IRT 1PL (Rasch Model)",
    "IRT 3PL",
    "KNN Classification",
    "Linear Regression"
  ],
  "answer": "IRT 1PL (Rasch Model)",
  "source_hint": "AuraLearn menggunakan model adaptif IRT 1PL Rasch Model."
}
```

### Kartu Flashcard (`flashcard_sets.cards`)
```json
{
  "idx": 0,
  "type": "front_back",
  "front": "Tahun berdirinya BITSMIKRO",
  "back": "2026",
  "cloze_text": null,
  "leitner_box": 1
}
```

---

## 6. Kebijakan Keamanan data (Security Policies)
* **Zero Storage of Physical Files:** Berkas dokumen asli diproses *in-memory* di sisi serverless API, tidak disimpan dalam bentuk berkas di penyimpanan cloud (Vercel Blob / Supabase Storage). Hanya string teks hasil ekstraksi yang disimpan.
* **Row Level Security (RLS):** Seluruh query database terikat oleh kebijakan RLS `user_id = auth.uid()` guna mengamankan data pribadi pengguna dari akses luar.
* **API Secrets Protection:** Variabel environment kredensial penting seperti `GEMINI_API_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` disimpan secara aman di Server-Side Vercel Config dan tidak akan pernah diekspos ke antarmuka client.
