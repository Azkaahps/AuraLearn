# AuraLearn — Navigasi & Alur Interaksi Pengguna (Navigation Architecture)

Dokumen ini menjelaskan struktur navigasi, komponen header/bar, dan alur perpindahan halaman di seluruh aplikasi AuraLearn.

---

## 🗺️ 1. Peta Rute & Akses Halaman (Route Structure)

```
AuraLearn App
├── (Landing Area)
│   ├── /                         -> Landing Page (Public)
│   ├── /login                    -> Halaman Login
│   └── /register                 -> Halaman Registrasi Akun
│
├── (Guest Area)
│   └── /guest/result             -> Hasil Ekstraksi Kuis Demo (Public/Guest)
│
├── (Public Shared Area)
│   └── /share/[token]            -> Kuis Berbagi via Token UUID (Public Rate-Limited)
│
├── (Authenticated App Area) — Menggunakan AppShell & Sidebar
│   ├── /dashboard                -> Dasbor Utama (Katalog & Kuota)
│   ├── /documents                -> Katalog Seluruh Dokumen
│   ├── /upload                   -> Halaman Unggah Dokumen (PDF, DOCX, PPTX)
│   └── /settings                 -> Pengaturan Akun & Paket Langganan
│
├── (Study Session Area) — Menggunakan SessionTopBar
│   ├── /quiz/[id]                -> Sesi Kuis Adaptif IRT
│   ├── /flashcard/[id]           -> Sesi Flashcard Spaced Repetition (Leitner)
│   └── /chat/[documentId]        -> Sesi AI Tutor Terkunci Konteks Materi
│
└── (Print & Export Area) — Menggunakan Print Layout & HandleBack
    ├── /quiz/[id]/print          -> Pratinjau & Cetak PDF Kuis (Pro Tier)
    └── /flashcard/[id]/print     -> Pratinjau & Cetak PDF Flashcard (Pro Tier)
```

---

## 🧭 2. Komponen Navigasi Utama

### A. `SessionTopBar` (`components/ui/SessionTopBar.tsx`)
Komponen navigasi sticky universal untuk seluruh halaman sesi belajar.

#### Props Specification:
```typescript
interface SessionTopBarProps {
  sessionLabel: string;        // Contoh: "KUIS ADAPTIF", "FLASHCARD", "TUTOR AI"
  contextTitle?: string;       // Nama dokumen / judul materi (akan dipotong otomatis di mobile)
  backHref?: string;           // Target URL tombol kembali (default: "/dashboard")
  backLabel?: string;          // Teks label tombol kembali (default: "DASBOR")
  rightAction?: React.Node;    // Aksion tambahan di kanan (misal: Tombol Cetak PRO)
  className?: string;          // Opsional styling ekstra
}
```

#### Penggunaan pada Halaman Kuis:
```tsx
<SessionTopBar
  sessionLabel="KUIS ADAPTIF"
  contextTitle={docTitle || undefined}
  rightAction={
    tier === 'pro' && quizId ? (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => window.open(`/quiz/${quizId}/print`, '_blank')}
      >
        <Printer className="w-3.5 h-3.5" /> CETAK
      </Button>
    ) : undefined
  }
/>
```

---

### B. `AppShell` & Responsive `Sidebar` (`components/dashboard/AppShell.tsx`)
Struktur pembungkus area aplikasi setelah login yang menangani responsivitas layar mobile dan desktop.

- **Desktop Layout**:
  - `Sidebar` (`w-64`) dirender secara permanen di sebelah kiri.
  - Halaman konten mengisi sisa area di kanan (`flex-1`).
- **Mobile Layout**:
  - `MobileHeader` (tinggi 56px) muncul di bagian atas layar dengan ikon hamburger.
  - Saat diklik, `AppShell` mengubah state `sidebarOpen = true`.
  - `Sidebar` dirender sebagai slide-over drawer dari kiri dengan efek transisi dan backdrop overlay gelap.
  - Memilih menu apapun di sidebar akan otomatis menutup drawer (`onClose()`).

---

### C. `handleBack` pada Halaman Cetak PDF (`app/(print)/*`)
Halaman pratinjau cetak dibuka di **tab baru** (`window.open(..., '_blank')`). Karena tab baru memiliki *history stack* kosong, navigasi standar `router.back()` tidak akan mempan.

Oleh karena itu, tombol kembali pada halaman cetak dikendalikan oleh fungsi helper `handleBack`:

```typescript
const handleBack = () => {
  try {
    // 1. Coba tutup tab pratinjau cetak langsung
    window.close();
  } catch (e) {}
  
  // 2. Jika tab tidak ditutup oleh browser, beralih ke fallback navigasi
  setTimeout(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/quiz/${id}`); // Atau /flashcard/${id}
    }
  }, 100);
};
```
