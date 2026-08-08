# AuraLearn — Sentry Design System Specification (100% Pure Dark Mode Console Aesthetic)

Dokumen ini mendefinisikan arsitektur sistem desain AuraLearn berbasis **Sentry Pure Dark Mode Console Aesthetic** dengan skema warna konsol malam kontras tinggi (`#150f23` & `#1f1633`).

---

## 🎨 1. Sentry Dark Console Architecture

Sistem antarmuka AuraLearn secara permanen mengusung **100% Pure Dark Mode Console Aesthetic** (`forcedTheme="dark"`) untuk pengalaman belajar berfokus tinggi tanpa gangguan visual:

### Dark Console Canvas (`#1f1633` / `#150f23`)
- **Peruntukan**: Seluruh halaman aplikasi (Landing Hero, Dasbor Utama, Katalog Dokumen, Kuis Adaptif, Dek Flashcard, Chat AI Tutor, Settings, dan Form Autentikasi).
- **Warna Latar Utama**: `surface-canvas-dark` (`#1f1633`) & `surface-night` (`#150f23`).
- **Teks Utama**: White (`#ffffff`) & Translucent White (`rgba(255,255,255,0.70)`).
- **Kartu Konsol**: Night Surface (`#150f23`) & Ink Surface (`#1f1633`) dibingkai 1px Hairline Violet border (`#362d59`) dan border hover (`#6a5fc1`).
- **Accent Primary**: Electric Lime (`#c2ef4e`), Hot Pink (`#fa7faa`), Deep Violet (`#422082`), dan Soft Violet (`#6a5fc1`).
- **Primary CTA**: Tombol berlatar putih (`#ffffff`) dengan teks gelap (`#150f23`) bertipe uppercase (`.button-cap`).

---

## 🗂️ 2. Comprehensive Token Mapping

### CSS Variables & Palette Tokens (`app/globals.css`)

```css
/* ─── Pure Dark Mode Console Tokens ─── */
:root, .dark {
  --background: 262 40% 14%;           /* #1f1633 Dark Canvas */
  --foreground: 0 0% 100%;            /* #ffffff White Text */
  --card: 262 50% 10%;                /* #150f23 Night Surface Card */
  --card-foreground: 0 0% 100%;
  --primary: 0 0% 100%;               /* #ffffff Inverted Primary CTA */
  --primary-foreground: 262 50% 10%;  /* #150f23 Dark type on Primary CTA */
  --secondary: 261 60% 32%;           /* #422082 Deep Violet */
  --secondary-foreground: 0 0% 100%;
  --muted: 254 33% 26%;               /* #362d59 Hairline Violet border */
  --muted-foreground: 0 0% 72%;       /* rgba(255,255,255,0.72) */
  --accent: 77 82% 62%;               /* #c2ef4e Electric Lime */
  --accent-foreground: 262 50% 10%;
  --destructive: 340 93% 74%;         /* #fa7faa Hot Pink */
  --border: 254 33% 26%;              /* #362d59 Hairline Violet */
  --input: 254 33% 26%;
  --ring: 217 91% 60%;                /* rgba(59,130,246,0.5) Focus Ring */
  --radius: 0.5rem;                   /* 8px */
}
```

---

## 🔤 3. Tipografi & Standardisasi Tab Titles

### Font Families (`next/font/google`)
- **Display Sans**: `Space Grotesk` (`var(--font-space-grotesk)`) — Headlines, judul halaman, dan pertanyaan kuis.
- **UI Sans**: `Rubik` (`var(--font-rubik)`) — Teks body, label tombol uppercase (`button-cap`), dan status badge.
- **Code / Monospace**: `JetBrains Mono` (`var(--font-mono)`) — Metadata konsol, telemetry, dan token data.

### Standardisasi Title Tab Peramban
Format judul tab peramban diatur secara seragam tanpa em-dash:
- Format Template: `AuraLearn - namahalaman`
- Contoh: `AuraLearn - Home`, `AuraLearn - Dashboard`, `AuraLearn - Dokumen Saya`, `AuraLearn - Upload Dokumen`, `AuraLearn - Pengaturan`, `AuraLearn - Login`, `AuraLearn - Daftar`, `AuraLearn - Kuis`, `AuraLearn - Flashcard`, `AuraLearn - AI Tutor Chat`.

---

## 🔘 4. Hirarki Komponen & Responsivitas Layout

1. **`button-primary` (`.button-cap`)**:
   - Berlatar putih `#ffffff` dengan teks gelap `#150f23`.
   - Huruf selalu Uppercase dengan `0.2px` letter-spacing dan `font-bold`.
2. **Input Autentikasi dengan Show/Hide Password**:
   - Field password pada halaman Login & Register dilengkapi tombol ikon interaktif `<Eye />` / `<EyeOff />` dari `lucide-react` dengan padding kanan `pr-11` agar teks password tidak terpotong.
3. **Navigasi Kembali ke Beranda pada Autentikasi**:
   - Halaman `/login` dan `/register` dilengkapi tombol navigasi `← KEMBALI KE BERANDA` di bagian atas kartu form.
4. **Grid Dokumen Responsif (`DocumentCardGrid.tsx`)**:
   - Menggunakan breakpoint `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6`.
   - Pada layar laptop/skala Windows 125%/150% (rentang 1024px–1535px), grid secara cerdas menampilkan 3 kolom luas sehingga tombol toolbar aksi (`KUIS`, `KARTU`, `Chat`, `Share`) tidak pernah terpotong atau meluap.
5. **Toast Sonner Console Style**:
   - Latar `#150f23`, border `#362d59`, indikator sukses `#c2ef4e`, dan error `#fa7faa`.
