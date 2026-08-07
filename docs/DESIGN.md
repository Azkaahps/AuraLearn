# AuraLearn — Sentry Design System Specification (Two-Polarity Canvas System)

Dokumen ini mendefinisikan arsitektur sistem desain AuraLearn berbasis **Sentry Two-Polarity Canvas System** yang mendukung mode **Light Canvas** (`#ffffff`) dan **Dark Canvas** (`#1f1633` / `#150f23`).

---

## 🎨 1. Sentry Two-Polarity Canvas Architecture

Sistem ini tidak memaksakan satu warna latar tunggal, melainkan membagi halaman berdasarkan dua polaritas kanvas utama:

### A. Dark Canvas (`#1f1633` / `#150f23`)
- **Peruntukan**: Marketing Hero, fitur produk utama, konsol dasbor, sesi kuis adaptif, dek flashcard, chat tutor AI, dan blok kode.
- **Warna Latar**: `{colors.surface-canvas-dark}` (`#1f1633`) & `{colors.surface-night}` (`#150f23`).
- **Teks**: `{colors.on-primary}` (`#ffffff`) dan `{colors.on-dark-muted}` (`rgba(255,255,255,0.72)`).
- **Kartu**: Surface `{colors.ink-deep}` (`#1f1633`) / `{colors.surface-night}` (`#150f23`) dengan 1px Hairline Violet border (`#362d59`).
- **Primary CTA**: Tombol terisi warna putih `{colors.on-primary}` (`#ffffff`) dengan teks gelap `{colors.ink-deep}` (`#1f1633`) (inverted primary).

### B. Light Canvas (`#ffffff` / `#f0f0f0`)
- **Peruntukan**: Halaman Harga (Pricing), Kontak/Setting, Tabel katalog dokumen padat, dan materi referensi kontekstual.
- **Warna Latar**: `{colors.surface-canvas-light}` (`#ffffff`).
- **Teks**: `{colors.ink}` (`#1f1633` — hex warna dark canvas yang di-repurpose sebagai teks gelap pada kanvas terang).
- **Kartu**: Kartu putih (`#ffffff`) dengan Hairline Cloud border (`#e5e7eb` / `{colors.hairline-cool}` `#cfcfdb`).
- **Primary CTA**: Tombol terisi warna Midnight Violet `{colors.primary}` (`#150f23`) dengan teks putih `{colors.on-primary}` (`#ffffff`).
- **Pricing Rhythm**: Rangkaian kartu harga berwarna terang (cream-white) dengan **SATU kartu "Featured" bertema Dark Inverted (`#150f23`)** yang merepresentasikan suara otentik brand.

---

## 🗂️ 2. Comprehensive Token Mapping

### CSS Variables (`app/globals.css`)

```css
/* ─── Light Mode Tokens (Light Canvas #ffffff) ─── */
:root {
  --background: 0 0% 100%;             /* #ffffff Light Canvas */
  --foreground: 262 40% 14%;           /* #1f1633 Ink Violet text */
  --card: 0 0% 100%;                  /* #ffffff White card surface */
  --card-foreground: 262 40% 14%;     /* #1f1633 Ink Violet */
  --primary: 262 50% 10%;             /* #150f23 Midnight Violet filled primary CTA */
  --primary-foreground: 0 0% 100%;    /* #ffffff White type on primary button */
  --secondary: 0 0% 94%;              /* #f0f0f0 Surface Press Light */
  --secondary-foreground: 262 40% 14%;
  --muted: 220 13% 91%;               /* #e5e7eb Hairline Cloud */
  --muted-foreground: 250 10% 40%;
  --accent: 77 82% 62%;               /* #c2ef4e Electric Lime */
  --accent-foreground: 262 50% 10%;
  --destructive: 340 93% 65%;         /* #fa7faa Hot Pink */
  --border: 220 13% 91%;              /* #e5e7eb Hairline Cloud border */
  --input: 215 16% 84%;               /* #cfcfdb Hairline Cool input border */
  --ring: 217 91% 60%;                /* rgba(59,130,246,0.5) Focus ring */
  --radius: 0.5rem;                   /* 8px */
}

/* ─── Dark Mode Tokens (Dark Canvas #1f1633 / #150f23) ─── */
.dark {
  --background: 262 40% 14%;           /* #1f1633 Dark Canvas */
  --foreground: 0 0% 100%;            /* #ffffff On Primary */
  --card: 262 50% 10%;                /* #150f23 Night surface card */
  --card-foreground: 0 0% 100%;
  --primary: 0 0% 100%;               /* #ffffff Inverted CTA on dark */
  --primary-foreground: 262 50% 10%;  /* #150f23 Dark type on inverted CTA */
  --secondary: 261 60% 32%;           /* #422082 Deep Violet */
  --secondary-foreground: 0 0% 100%;
  --muted: 254 33% 26%;               /* #362d59 Hairline Violet border */
  --muted-foreground: 0 0% 72%;       /* rgba(255,255,255,0.72) */
  --accent: 77 82% 62%;               /* #c2ef4e Electric Lime */
  --accent-foreground: 262 50% 10%;
  --destructive: 340 93% 74%;         /* #fa7faa Hot Pink */
  --border: 254 33% 26%;              /* #362d59 Hairline Violet */
  --input: 254 33% 26%;
  --ring: 217 91% 60%;                /* rgba(59,130,246,0.5) */
}
```

---

## 🔤 3. Tipografi & Syntax Highlighting Device

### Font Families (`next/font/google`)
- **Display Sans**: `Space Grotesk` (`var(--font-space-grotesk)`) — Headlines, section titles, kuis.
- **UI Sans**: `Rubik` (`var(--font-rubik)`) — Body, label tombol uppercase (`0.2px` tracking), eyebrow caps.
- **Code**: `JetBrains Mono` (`var(--font-mono)`) — Monaco/Menlo fallback untuk data telemetri & blok kode.

### Signature Keyword Highlight Chip (`.chip-lime-keyword`)
- Background: `{colors.accent-lime}` (`#c2ef4e`)
- Teks: `{colors.ink-deep}` (`#150f23`)
- Corner: `{rounded.xs}` (`4px`)
- Padding: `0px` vertical, `12px` horizontal.
- Penggunaan: Membungkus kata kunci penting di dalam headline sebagai perangkat sintaksis (bukan sekadar swatch warna).

---

## 🔘 4. Komponen & Hirarki Affordance

1. **`button-primary`**:
   - Pada Light Canvas: Terisi `#150f23` dengan teks putih `#ffffff`.
   - Pada Dark Canvas: Terisi `#ffffff` dengan teks gelap `#150f23`.
   - Huruf selalu Uppercase dengan `0.2px` letter spacing (`button-cap`).
2. **`text-input`**:
   - Background `#ffffff` (light) / `#1f1633` (dark), border `#cfcfdb` / `#362d59`, dan ring focus translucent blue `rgba(59,130,246,0.5)` (`--ring`).
3. **`ThemeToggle`**:
   - Komponen toggle tema responsif di Navbar & Settings untuk beralih antara Mode Terang (Light), Mode Gelap (Dark), atau Sistem (System).
