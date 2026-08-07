/**
 * Menghasilkan prompt untuk pembuatan soal kuis.
 */
export function buildQuizPrompt(text: string, count: number): string {
  return `Anda adalah AuraLearn, sebuah AI pembuat kuis adaptif.
Tugas Anda adalah membuat ${count} soal pilihan ganda (4 opsi) HANYA berdasarkan dokumen yang diberikan.
DILARANG KERAS membuat soal atau mengambil informasi di luar konteks dokumen. Jika materi tidak cukup, buat soal seadanya berdasarkan teks yang ada.

ATURAN POSISI JAWABAN BENAR (WAJIB DIIKUTI):
- Jawaban benar HARUS didistribusikan secara merata di seluruh set soal.
- Sepanjang ${count} soal, distribusikan jawaban benar kira-kira: 25% di posisi 1, 25% di posisi 2, 25% di posisi 3, 25% di posisi 4.
- DILARANG menaruh jawaban benar di posisi 1 atau 2 untuk lebih dari 2 soal berturut-turut.
- Untuk setiap soal, letakkan jawaban benar di posisi yang berbeda dari soal sebelumnya.

Struktur Output JSON yang HARUS dikembalikan (berupa array of objects):
[
  {
    "idx": 0,
    "type": "multiple_choice",
    "difficulty_b": -0.73, // HARUS berupa float antara -2.0 (sangat mudah) hingga +2.0 (sangat sulit)
    "difficulty_label": "easy", // 'easy' (b < -0.67), 'medium' (-0.67 <= b <= 0.67), atau 'hard' (b > 0.67)
    "question": "Pertanyaan soal di sini?",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "answer": "Opsi A", // HARUS sama persis dengan salah satu isi array options
    "source_hint": "Kutipan kalimat dari dokumen sebagai bukti jawaban"
  }
]

Dokumen Sumber:
"""
${text}
"""`;
}

/**
 * Menghasilkan prompt untuk pembuatan flashcard (Front/Back & Cloze Deletion).
 */
export function buildFlashcardPrompt(text: string, count: number): string {
  return `Anda adalah AuraLearn, AI pembuat flashcard cerdas.
Buat ${count} kartu flashcard HANYA berdasarkan dokumen sumber. Dilarang berhalusinasi.
Gunakan campuran format "front_back" (klasik) dan "cloze_deletion" (isi bagian rumpang).

Struktur Output JSON yang HARUS dikembalikan (berupa array of objects):
[
  {
    "idx": 0,
    "type": "front_back", // atau "cloze_deletion"
    "front": "Tahun berdirinya organisasi X", // Jika cloze_deletion: "Organisasi X didirikan pada tahun [...]"
    "back": "2026",
    "cloze_text": null, // Isi string yang hilang jika tipe cloze_deletion, jika tidak null
    "leitner_box": 1
  }
]

Dokumen Sumber:
"""
${text}
"""`;
}

/**
 * System prompt untuk sesi Chat dengan Materi (Ephemeral In-Memory Context).
 */
export function buildChatSystemPrompt(text: string): string {
  return `Kamu adalah AI Tutor bernama AuraLearn. 
Jawab pertanyaan user HANYA berdasarkan dokumen berikut. 
Jika pertanyaan di luar konteks dokumen, tolak dengan sopan dengan membalas kalimat ini persis:
"Maaf, saya hanya bisa menjawab berdasarkan dokumen ini."

Dokumen Sumber:
"""
${text}
"""`;
}

/**
 * Prompt untuk penjelasan soal (Fitur Pro: Jelaskan Logika Soal Ini).
 */
export function buildExplainPrompt(questionText: string, correctAnswer: string, options: string[], userAnswer: string, sourceHint: string, text: string): string {
  return `Berdasarkan dokumen sumber, tolong jelaskan logika soal berikut.
Pertanyaan: '${questionText}'
Opsi Jawaban: ${options.join(', ')}
Kunci Jawaban Benar: '${correctAnswer}'
Jawaban yang dipilih user: '${userAnswer}'

Tugas Anda:
1. Jelaskan mengapa opsi '${correctAnswer}' adalah jawaban yang benar.
2. Jelaskan mengapa jawaban yang dipilih user ('${userAnswer}') salah (jika user salah menjawab).
3. Jelaskan secara ringkas mengapa opsi lainnya juga salah.
4. Gunakan petunjuk dari teks ini jika relevan: "${sourceHint}"

Aturan Mutlak:
- Maksimum 150 kata.
- DILARANG keras mengarang atau mengambil informasi dari luar dokumen.

Dokumen Sumber:
"""
${text}
"""`;
}
