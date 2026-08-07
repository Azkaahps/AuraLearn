# Product Requirements Document (PRD)
# AuraLearn — Document-to-Quiz & Flashcard Engine

_Versi: 1.2 | Tanggal: 06 Agustus 2026 | Status: Production Active_

---

## 1. Problem Statement

Pelajar dan mahasiswa menghadapi tiga masalah utama menjelang ujian:

1. **Overload Informasi** — Materi kuliah sangat tebal dan sulit dirangkum secara efisien.
2. **Belajar Pasif** — Metode membaca ulang materi terbukti menghasilkan retensi memori yang rendah dibandingkan dengan *active recall*.
3. **Pembuatan Soal Manual** — Pembuatan flashcard dan soal latihan secara mandiri memakan waktu berjam-jam.

**Dampak:** Mahasiswa menghabiskan terlalu banyak waktu dan energi untuk *membuat alat belajar*, bukan pada *proses belajarnya* sendiri.

---

## 2. Goals

### Business Goals
* Memenangkan lomba inovasi teknologi dengan demo produk yang kuat dan diferensiasi fitur yang jelas.
* Memvalidasi model bisnis freemium berbasis kredit pemrosesan dokumen.
* Mencapai "Aha! Moment" dalam waktu kurang dari 2 menit setelah pengguna mengunggah dokumen pertama mereka.

### Product Goals
* Pengguna dapat mengunggah dokumen dan mendapatkan kuis serta flashcard siap pakai dalam waktu kurang dari 30 detik.
* Menerapkan sistem kuis adaptif (IRT 1PL Rasch Model) untuk meningkatkan atau menurunkan kesulitan soal berdasarkan performa riil pengguna.
* Menyediakan fitur berbagi tautan (*share link*) instan dari katalog dokumen agar pengguna dapat berkolaborasi belajar tanpa gesekan (*friction*).

---

## 3. Target Users

### Primary Users
**Mahasiswa aktif (usia 18–25 tahun)** yang sedang menghadapi masa ujian, mahir menggunakan gawai, serta terbiasa menggunakan solusi digital untuk menunjang aktivitas akademik.

### Secondary Users
**Siswa SMA/SMK (usia 15–18 tahun)** dengan kebutuhan belajar yang serupa namun memiliki sensitivitas harga yang lebih tinggi (*price-sensitive*).

### Anti-target (v1 Scope)
* Instruktur/Dosen yang membutuhkan generator bank soal untuk ujian resmi (memiliki use-case yang berbeda).
* Sektor korporat/perusahaan (out of scope).

---

## 4. User Stories

### Onboarding & Upload
* **Sebagai guest (belum terdaftar):** Saya ingin dapat mengunggah dokumen langsung di landing page tanpa harus mendaftar terlebih dahulu, agar saya bisa langsung mencoba nilai utama dari aplikasi ini.
* **Sebagai guest:** Setelah mengunggah dokumen demo, saya ingin langsung diarahkan ke halaman kuis interaktif demo (`/guest/result`) dan melihat modal ajakan mendaftar saat kuis selesai.
* **Sebagai pengguna terdaftar:** Saya ingin melihat sisa kuota dokumen bulanan saya di dashboard dengan indikator visual dan teks yang jelas untuk mempermudah perencanaan belajar.

### Pemrosesan Dokumen
* **Sebagai pengguna:** Saya ingin mengunggah file PDF/DOCX/PPTX materi kuliah saya dan secara otomatis mendapatkan kuis latihan yang relevan.
* **Sebagai pengguna:** Saya ingin mengunggah screenshot/gambar slide materi presentasi dan mendapatkan flashcard belajar.

### Kuis Latihan
* **Sebagai pengguna:** Saya ingin mengerjakan kuis berupa pilihan ganda (4 opsi) yang bersumber langsung dari materi dokumen saya dengan distribusi opsi jawaban yang teracak secara adil.
* **Sebagai pengguna:** Saya ingin tingkat kesulitan soal yang disajikan beradaptasi secara otomatis sesuai dengan kemampuan saya menjawab.
* **Sebagai pengguna Pro:** Saya ingin dapat menekan tombol "💡 Jelaskan Logika Soal Ini" untuk mendapatkan analisis mendalam AI yang terformat rapi (heading, bullet, bold text) mengenai alasan jawaban tersebut benar.
* **Sebagai pengguna Free:** Saya ingin langsung melihat jawaban yang benar setelah menjawab soal tanpa penjelasan panjang.
* **Sebagai pengguna:** Saya ingin membuka obrolan langsung dengan materi (*Chat dengan Materi*) untuk mengajukan pertanyaan kontekstual seputar isi dokumen.

### Flashcard
* **Sebagai pengguna:** Saya ingin mengulang flashcard menggunakan sistem *spaced repetition* sederhana demi meningkatkan retensi ingatan jangka panjang.
* **Sebagai pengguna:** Saya ingin menggunakan flashcard dengan format *cloze deletion* (mengisi bagian yang kosong) untuk menguji pemahaman kontekstual.

### Kolaborasi & Berbagi
* **Sebagai pengguna:** Saya ingin mengklik tombol Share pada kartu dokumen di dashboard/dokumen saya untuk langsung membuat tautan kuis publik dan menyalinnya ke clipboard.
* **Sebagai penerima tautan:** Saya ingin dapat langsung mencoba kuis tersebut tanpa kewajiban mendaftar akun terlebih dahulu (dibatasi 3 kali per hari per IP).

### Fitur Pro & Pengaturan
* **Sebagai pengguna Pro:** Saya ingin mencetak kuis atau flashcard ke format fisik atau PDF melalui browser print terintegrasi (`/(print)/quiz/[id]/print`).
* **Sebagai pengguna:** Saya ingin mengubah mode tampilan terang/gelap melalui toggle di Navbar, Sidebar, atau Pengaturan.
* **Sebagai pengguna:** Saya ingin dengan mudah meng-upgrade akun ke tier Pro (Rp 29.000/bulan) saat kuota gratis bulanan saya telah habis.

---

## 5. Functional Requirements

### FR-00: Landing Page & Beranda Publik
* Halaman utama publik di `/` yang dapat diakses secara instan tanpa autentikasi.
* **Navbar:** Menampilkan Logo, Link Fitur, Harga, Tombol Masuk, Tombol Daftar, dan `ThemeToggle`.
* **Hero Section:** Judul utama, subjudul yang memikat, dan area *dropzone* unggah langsung untuk guest demo.
* Jika pengguna sudah terautentikasi mengakses `/`, secara otomatis dialihkan (*redirect*) ke `/dashboard`.

### FR-00b: Guest Upload Flow
* Guest diizinkan mengunggah dokumen dari Landing Page.
* Hasil eksekusi disimpan ke `sessionStorage` dengan kunci `guest_data` dan pengguna langsung di-redirect ke `/guest/result`.
* Halaman `/guest/result` memuat soal kuis dari `guest_data` dan memunculkan modal ajakan mendaftar saat kuis selesai.

### FR-01: Upload & Ekstraksi Dokumen
* Format yang didukung: PDF (selectable & scanned), DOCX, PPTX, JPG, PNG, WEBP.
* Kebijakan Privasi: **File fisik asli tidak disimpan ke database/storage server**. Sistem hanya mengekstrak teks, menyimpannya ke database, kemudian membuang file aslinya dari memory.
* Batas halaman: Free maksimal 10 halaman/file, Pro maksimal 100 halaman/file.
* Batas dokumen bulanan: Free maksimal 3 dokumen, Pro maksimal 50 dokumen.

### FR-02: Dashboard & Pengaturan Kuota
* Menampilkan ringkasan sisa kuota dokumen bulanan dengan bar indikator ber-kontras tinggi dan label *"Dokumen Diunggah: X dari Y"*.
* Pengecekan bulan berjalan dihitung dengan perbandingan bulan & tahun (`now.getMonth() === quotaDate.getMonth()`).
* Menyediakan katalog dokumen dengan tombol aksi instan Kuis, Flashcard, Chat, dan Share.

### FR-03: Share Link Feature
* Tombol Share pada kartu dokumen memanggil API `/api/share` yang menerima `document_id` atau `quiz_id`.
* Jika kuis belum pernah dibuat untuk dokumen tersebut, kuis dibuatkan otomatis terlebih dahulu.
* Tautan publik `http://<domain>/share/<token>` disalin otomatis ke clipboard pengguna dengan notifikasi toast success.
