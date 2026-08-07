-- ═══════════════════════════════════════════════════════════════════════════
-- AuraLearn v1 — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Source  : docs/ARCHITECTURE.md §4 (DB Schema) & §5 (JSONB Schemas)
-- Decisions: docs/LOG.md Sesi 4 (share_links scope, quota_reset lazy eval)
-- Security : docs/AI-CONTEXT.md §Security Rules
--
-- CARA PAKAI:
--   Jalankan seluruh file ini di Supabase SQL Editor (satu kali eksekusi).
--   Pastikan project Supabase sudah aktif sebelum menjalankan.
--
-- ATURAN ARSITEKTUR:
--   1. File fisik user TIDAK PERNAH disimpan (Zero Storage Policy)
--   2. Semua tabel mengaktifkan Row Level Security (RLS)
--   3. Service role otomatis bypass RLS (Supabase default behavior)
--   4. Tidak ada CREATE BUCKET / storage.objects
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 1: user_profiles
-- Profil pengguna & tiering. Relasi 1:1 dengan auth.users.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE user_profiles (
  id          UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier        TEXT  NOT NULL DEFAULT 'free'
                    CHECK (tier IN ('free', 'pro')),
  docs_used   INT   NOT NULL DEFAULT 0,
  -- Lazy Eval: cek saat upload, reset jika bulan berubah
  quota_reset DATE  NOT NULL DEFAULT date_trunc('month', now()),
  -- IRT 1PL θ (theta): kemampuan user. Default 0.0.
  -- Di-update secara batch di akhir sesi kuis.
  user_theta  FLOAT NOT NULL DEFAULT 0.0
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles: self access only"
  ON user_profiles
  FOR ALL
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 2: documents
-- Teks hasil ekstraksi dokumen. File fisik TIDAK disimpan.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT,
  extracted_text TEXT        NOT NULL,
  page_count     INT,
  -- 'flash' = gemini-1.5-flash | 'pro' = gemini-1.5-pro
  model_used     TEXT        CHECK (model_used IN ('flash', 'pro')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents: owner only"
  ON documents
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 3: quizzes
-- Kumpulan soal kuis per dokumen.
-- ─────────────────────────────────────────────────────────────────────────
-- JSONB Schema (quizzes.questions[] — array of objects):
-- {
--   "idx":              0,                  -- integer, zero-based index
--   "type":             "multiple_choice",  -- literal, v1 hanya MCQ
--   "difficulty_b":     -0.73,             -- float -2.0 s/d +2.0 (BUKAN integer)
--   "difficulty_label": "easy",            -- 'easy' | 'medium' | 'hard'
--   "question":         "Teks soal...",    -- string
--   "options":          ["A","B","C","D"], -- array tepat 4 string
--   "answer":           "A",              -- harus cocok dengan salah satu options
--   "source_hint":      "Kalimat dari..." -- verbatim dari extracted_text
-- }
CREATE TABLE quizzes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes: owner only"
  ON quizzes
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 4: flashcard_sets
-- Kumpulan kartu flashcard per dokumen.
-- ─────────────────────────────────────────────────────────────────────────
-- JSONB Schema (flashcard_sets.cards[] — array of objects):
-- {
--   "idx":          0,               -- integer, zero-based index
--   "type":         "front_back",    -- 'front_back' | 'cloze_deletion'
--   "front":        "Istilah...",    -- teks depan kartu (konsep/term)
--   "back":         "Definisi...",   -- teks belakang kartu (jawaban)
--   "cloze_text":   null,            -- string untuk cloze_deletion, null untuk front_back
--   "leitner_box":  1                -- integer: 1 | 2 | 3 (mulai di Box 1)
-- }
CREATE TABLE flashcard_sets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cards       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flashcard_sets: owner only"
  ON flashcard_sets
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 5: share_links
-- Tautan berbagi publik — menarget KUIS atau FLASHCARD (tidak keduanya).
-- CHECK constraint memastikan tepat satu kolom target yang terisi.
-- Keputusan Final: LOG.md Sesi 4.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE share_links (
  token            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Tepat salah satu dari quiz_id atau flashcard_set_id harus terisi (CHECK di bawah)
  quiz_id          UUID        REFERENCES quizzes(id) ON DELETE CASCADE,
  flashcard_set_id UUID        REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  owner_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT share_target_check CHECK (
    (quiz_id IS NOT NULL AND flashcard_set_id IS NULL) OR
    (quiz_id IS NULL     AND flashcard_set_id IS NOT NULL)
  )
);

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- SELECT publik: diperlukan agar halaman /share/[token] bisa diakses tanpa login
CREATE POLICY "share_links: public read"
  ON share_links
  FOR SELECT
  USING (true);

-- INSERT: hanya owner yang bisa membuat share link
CREATE POLICY "share_links: owner insert"
  ON share_links
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: hanya owner
CREATE POLICY "share_links: owner update"
  ON share_links
  FOR UPDATE
  USING     (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: hanya owner
CREATE POLICY "share_links: owner delete"
  ON share_links
  FOR DELETE
  USING (owner_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 6: share_attempts
-- Rate limiting share link berdasarkan IP hash.
-- Cap: 3 attempt per hari per IP per token (dicek di application layer).
-- UNIQUE constraint mencegah duplicate row per hari.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE share_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token        UUID NOT NULL REFERENCES share_links(token) ON DELETE CASCADE,
  -- IP address di-hash sebelum disimpan (bukan raw IP) untuk privasi
  ip_hash      TEXT NOT NULL,
  attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(token, ip_hash, attempt_date)
);

ALTER TABLE share_attempts ENABLE ROW LEVEL SECURITY;

-- INSERT publik: route handler (tanpa login) harus bisa insert attempt record
CREATE POLICY "share_attempts: public insert"
  ON share_attempts
  FOR INSERT
  WITH CHECK (true);

-- SELECT / UPDATE / DELETE: tidak ada policy = DENY untuk semua role selain service_role
-- Hanya service_role yang bisa membaca data ini (untuk admin/audit)


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 7: flagged_questions
-- Laporan soal ambigu/tidak relevan. Hanya user login yang bisa flag.
-- user_id nullable untuk mendukung edge case (akun dihapus setelah flag).
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE flagged_questions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID        NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_idx INT         NOT NULL,
  -- Nullable: user bisa dihapus setelah melakukan flag (ON DELETE SET NULL)
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE flagged_questions ENABLE ROW LEVEL SECURITY;

-- Hanya user login yang bisa flag (Q1: hanya logged-in user)
CREATE POLICY "flagged_questions: owner only"
  ON flagged_questions
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 8: chat_sessions
-- Sesi obrolan per dokumen.
-- Frontend policy: 1 sesi aktif per dokumen (append terus).
-- Backend schema mendukung multiple sessions per dokumen.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE chat_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions: owner only"
  ON chat_sessions
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 9: chat_messages
-- Pesan individual dalam sesi chat.
-- RLS via JOIN ke chat_sessions karena tidak ada user_id langsung.
-- 20 pesan terakhir di-inject ke Gemini system prompt per request.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE chat_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS via subquery JOIN ke chat_sessions (tidak ada user_id di tabel ini)
CREATE POLICY "chat_messages: owner only via session"
  ON chat_messages
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────
-- TABLE 10: chat_daily_usage
-- Tracking limit pesan harian untuk tier Free (5 pesan/hari).
-- Tier Pro: unlimited (tidak di-track / tidak dicek).
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE chat_daily_usage (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  msg_count  INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE chat_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_daily_usage: owner only"
  ON chat_daily_usage
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: auto-create user_profiles saat user baru register
-- Dipanggil oleh Supabase Auth setelah INSERT ke auth.users.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- SELESAI
-- Total: 10 tabel, 10 RLS enabled, 16 policies, 1 trigger
-- ═══════════════════════════════════════════════════════════════════════════
