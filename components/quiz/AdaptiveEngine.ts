export interface Question {
  idx: number;
  type: string;
  difficulty_b: number;
  difficulty_label: string;
  question: string;
  options: string[];
  answer: string;
  source_hint: string;
}

/**
 * AdaptiveEngine
 * Mesin utama yang mengatur alur kuis menggunakan pendekatan Teori Respons Butir (IRT) - 1PL.
 */
export class AdaptiveEngine {
  private theta: number;
  private questions: Question[];
  private answeredIds: Set<number>;

  constructor(initialTheta: number = 0.0, questions: Question[]) {
    this.theta = initialTheta;
    this.questions = questions;
    this.answeredIds = new Set<number>();
  }

  /**
   * Pemilihan Soal Adaptif (Maximum Information Selection)
   * Memilih soal berikutnya yang memiliki difficulty_b paling mendekati theta (kemampuan) saat ini.
   */
  public getNextQuestion(): Question | null {
    const available = this.questions.filter(q => !this.answeredIds.has(q.idx));
    if (available.length === 0) return null; // Kuis selesai

    let bestQuestion = available[0];
    let minDiff = Math.abs(bestQuestion.difficulty_b - this.theta);

    for (let i = 1; i < available.length; i++) {
      const diff = Math.abs(available[i].difficulty_b - this.theta);
      if (diff < minDiff) {
        minDiff = diff;
        bestQuestion = available[i];
      }
    }

    return bestQuestion;
  }

  /**
   * Memproses jawaban dan memperbarui (Update) Theta
   * Rumus Pembaruan: theta_new = theta_old + learning_rate * (actual - P)
   * Di mana P = probabilitas menjawab benar (1 / (1 + e^(-(theta - b))))
   */
  public submitAnswer(question: Question, isCorrect: boolean) {
    this.answeredIds.add(question.idx);
    
    const b = question.difficulty_b;
    const actual = isCorrect ? 1 : 0;
    
    // Probabilitas prediksi IRT 1-Parameter Logistic Model (1PL)
    const P = 1 / (1 + Math.exp(-(this.theta - b)));
    
    // Update langkah pemelajaran adaptif (learning_rate = 0.3 ditetapkan di PRD)
    const learningRate = 0.3;
    this.theta = this.theta + learningRate * (actual - P);

    // Mencegah nilai Theta melampaui batas ekstrem (Bounds clamping: -3.0 to +3.0)
    if (this.theta > 3.0) this.theta = 3.0;
    if (this.theta < -3.0) this.theta = -3.0;
  }

  public getCurrentTheta(): number {
    return this.theta;
  }

  public isFinished(): boolean {
    return this.answeredIds.size === this.questions.length;
  }
}
