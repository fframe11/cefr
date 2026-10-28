export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type WordErrorType = "None" | "Mispronunciation" | "Omission" | "Insertion";

export interface PhonemeScore {
  phoneme: string;
  score: number;
  scale: "0-2";
}

export interface WordAnalysis {
  word: string;
  accuracy_score: number | null; // null if uncalibrated
  error_type: WordErrorType;
  phonetic_hint?: string;
  tip_th?: string;
  phonemeScores?: PhonemeScore[];
}

export interface SpeakingMetrics {
  pronunciation_score: number | null; // null if model not calibrated
  fluency_score: number | null;       // null if model not calibrated
  completeness_score: number;        // 0 - 100 based strictly on text coverage
  prosody_score: number | null;       // null if model not calibrated
}

export interface AcousticMetrics {
  volume_rms?: number;      // 0.0 - 1.0
  silence_ratio?: number;   // 0.0 - 1.0
  pitch_variance?: number;  // 0.0 - 1.0
  snr_db?: number;
  clipping_ratio?: number;
}

export type PronunciationStatus = "scored" | "not_ready" | "abstained";

export interface PronunciationResult {
  status: PronunciationStatus;
  pronunciationScore: number | null;
  scale: "0-100" | null;
  modelVersion: string | null;
  validationVersion: string | null;
  reason?: string;
  words?: Array<{
    text: string;
    phonemeScores?: Array<{
      phoneme: string;
      score: number;
      scale: "0-2";
    }>;
  }>;
}

export interface SpeakingEvaluationData {
  attempt_id: string;
  overall_score: number | null; // null if pronunciation score is not yet calibrated
  cefr_band: CEFRLevel | null;  // null if overall score cannot be verified
  completeness_score: number;   // 0 - 100 empirically grounded on text coverage
  pronunciation_result: PronunciationResult;
  metrics: SpeakingMetrics;
  transcription: string;
  words_analysis: WordAnalysis[];
  feedback_th: string;
}

export interface EvaluationSuccessResponse {
  success: true;
  data: SpeakingEvaluationData;
}

export interface EvaluationErrorResponse {
  success: false;
  error: {
    code: "BAD_REQUEST" | "UNAUTHORIZED" | "PAYLOAD_TOO_LARGE" | "TOO_MANY_REQUESTS" | "INTERNAL_SERVER_ERROR";
    message: string;
    details?: unknown;
  };
}

export type EvaluationResponse = EvaluationSuccessResponse | EvaluationErrorResponse;

export interface SpeakingPrompt {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  topic: string;
  question: string;
  reference_text: string;
  target_duration_sec: number;
  keywords: string[];
}
