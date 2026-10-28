export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type WordErrorType = "None" | "Mispronunciation" | "Omission" | "Insertion";

export interface WordAnalysis {
  word: string;
  accuracy_score: number; // 0 - 100
  error_type: WordErrorType;
  phonetic_hint?: string;
  tip_th?: string;
}

export interface SpeakingMetrics {
  pronunciation_score: number; // 0 - 100
  fluency_score: number;       // 0 - 100
  completeness_score: number;  // 0 - 100
  prosody_score: number;       // 0 - 100
}

export interface SpeakingEvaluationData {
  attempt_id: string;
  overall_score: number;
  cefr_band: CEFRLevel;
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
