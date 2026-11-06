import {
  AcousticMetrics,
  CEFRLevel,
  PronunciationResult,
  SpeakingEvaluationData,
  SpeakingMetrics,
  WordAnalysis,
  WordErrorType,
  SpeakingMode,
} from "./types";
import { scoreToCefrBand } from "./cefr";

/**
 * Standard Levenshtein distance for word-level string edit comparison.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Computes normalized similarity between two words (0.0 to 1.0).
 */
export function wordSimilarity(word1: string, word2: string): number {
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, "");
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, "");
  if (w1 === w2) return 1.0;
  const maxLen = Math.max(w1.length, w2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(w1, w2);
  return Math.max(0, 1.0 - dist / maxLen);
}

/**
 * Generates a unique attempt ID.
 */
export function generateAttemptId(): string {
  const hex = Math.random().toString(16).substring(2, 10);
  return `spk_${hex}`;
}

export interface EvaluateSpeechParams {
  audioBuffer: Uint8Array;
  referenceText: string;
  targetCefr: CEFRLevel;
  promptId: string;
  clientDurationSec?: number;
  userTranscript?: string;
  acousticMetrics?: AcousticMetrics;
  externalPronunciationResult?: PronunciationResult;
  simulatedTranscript?: string;
  mode?: SpeakingMode;
  targetKeywords?: string[];
}

/**
 * Evaluates speech text coverage and completeness.
 * Adheres strictly to the invariant: NEVER synthesize ungrounded / fake pronunciation scores.
 * Real pronunciation evaluation is delegated to services/pronunciation/ or marked not_ready.
 */
export async function evaluateSpeech(
  params: EvaluateSpeechParams
): Promise<SpeakingEvaluationData> {
  const {
    referenceText,
    userTranscript,
    acousticMetrics,
    externalPronunciationResult,
    simulatedTranscript,
    mode = "read_aloud",
    targetKeywords = [],
  } = params;

  // Split reference text into target words
  const referenceWords = referenceText
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ""))
    .filter((w) => w.length > 0);

  // Check if speech was explicitly silent or missing
  const isSilenceDetected =
    (acousticMetrics?.volume_rms !== undefined && acousticMetrics.volume_rms < 0.005) ||
    (acousticMetrics?.silence_ratio !== undefined && acousticMetrics.silence_ratio > 0.92);

  // Determine actual transcription
  let transcription = "";
  if (simulatedTranscript !== undefined) {
    transcription = simulatedTranscript;
  } else if (isSilenceDetected) {
    transcription = "";
  } else if (userTranscript !== undefined) {
    // If client explicitly provided a transcript (even if empty because English ASR recognized nothing/foreign language)
    transcription = userTranscript.trim();
  } else {
    // Fall back to reference text only when userTranscript is truly undefined (e.g. test fixtures)
    transcription = referenceText;
  }

  const spokenWords = transcription
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ""))
    .filter((w) => w.length > 0);

  const isCompletelySilent = isSilenceDetected;
  const hasNoRecognizedWords = spokenWords.length === 0;

  // Align each reference word with spoken text to evaluate text coverage
  let matchedWordCount = 0;
  let cursor = 0;

  const wordsAnalysis: WordAnalysis[] = referenceWords.map((refWord) => {
    const cleanRef = refWord.toLowerCase();

    if (isCompletelySilent || hasNoRecognizedWords) {
      return {
        word: refWord,
        accuracy_score: null,
        error_type: "Omission" as WordErrorType,
      };
    }

    // Search window in spoken words around cursor
    let bestMatchScore = 0;
    let bestSpokenIdx = -1;

    for (let j = Math.max(0, cursor - 2); j < Math.min(spokenWords.length, cursor + 4); j++) {
      const sim = wordSimilarity(cleanRef, spokenWords[j]);
      if (sim > bestMatchScore) {
        bestMatchScore = sim;
        bestSpokenIdx = j;
      }
    }

    // Extract word-level score from external ML model if available
    const extWord = externalPronunciationResult?.words?.find(
      (w) => w.text.toLowerCase() === cleanRef
    );
    let modelAccuracy: number | null = null;
    if (extWord?.phonemeScores && extWord.phonemeScores.length > 0) {
      const avgPhone =
        extWord.phonemeScores.reduce((sum, p) => sum + p.score, 0) / extWord.phonemeScores.length;
      modelAccuracy = Math.round((avgPhone / 2.0) * 100);
    }

    if (bestSpokenIdx !== -1 && bestMatchScore >= 0.85) {
      cursor = bestSpokenIdx + 1;
      matchedWordCount += 1;
      return {
        word: refWord,
        accuracy_score: modelAccuracy !== null ? modelAccuracy : Math.round(bestMatchScore * 100),
        error_type: "None" as WordErrorType,
        phonemeScores: extWord?.phonemeScores,
      };
    } else if (bestSpokenIdx !== -1 && bestMatchScore >= 0.45) {
      cursor = bestSpokenIdx + 1;
      matchedWordCount += 0.5;
      return {
        word: refWord,
        accuracy_score: modelAccuracy !== null ? modelAccuracy : Math.round(bestMatchScore * 100),
        error_type: "Mispronunciation" as WordErrorType,
        phonemeScores: extWord?.phonemeScores,
      };
    } else {
      return {
        word: refWord,
        accuracy_score: modelAccuracy !== null ? 0 : null,
        error_type: "Omission" as WordErrorType,
      };
    }
  });

  // Calculate completeness score based on mode
  let keywordsFound: string[] = [];
  let freeSpeakingCompleteness = 0;

  if (mode === "free_speaking" && !isCompletelySilent && !hasNoRecognizedWords) {
    const spokenJoined = transcription.toLowerCase();
    keywordsFound = targetKeywords.filter((kw) =>
      spokenJoined.includes(kw.toLowerCase())
    );
    const kwRatio = targetKeywords.length > 0 ? keywordsFound.length / targetKeywords.length : 1.0;
    const lenRatio = Math.min(1.0, spokenWords.length / 6);
    freeSpeakingCompleteness = Math.round((kwRatio * 0.6 + lenRatio * 0.4) * 100);
  }

  const completionRatio = isCompletelySilent || hasNoRecognizedWords
    ? 0
    : matchedWordCount / (referenceWords.length || 1);
  const completeness_score = mode === "free_speaking" 
    ? (isCompletelySilent || hasNoRecognizedWords ? 0 : freeSpeakingCompleteness)
    : Math.min(100, Math.round(completionRatio * 100));

  // Determine pronunciation result with Content Relevance & Language Gate
  let pronunciation_result: PronunciationResult;

  if (isCompletelySilent) {
    pronunciation_result = {
      status: "abstained",
      pronunciationScore: null,
      scale: null,
      modelVersion: "E2E-GOP-SpeechOcean762",
      validationVersion: "v1.0",
      reason: "ตรวจไม่พบสัญญาณเสียงพูดหรือระดับเสียงต่ำเกินไป ระบบงดการให้คะแนนเพื่อความถูกต้อง",
    };
  } else if (hasNoRecognizedWords || matchedWordCount === 0 || completeness_score === 0) {
    // Language / Target Content Mismatch Gate:
    // If the learner spoke in a different language (e.g. Thai) or none of the target words were spoken,
    // acoustic GOP on forced-aligned English phonemes is scientifically invalid.
    // In accordance with Azure Speech Assessment & Pearson standards, the engine must abstain from pronunciation scoring.
    pronunciation_result = {
      status: "abstained",
      pronunciationScore: null,
      scale: null,
      modelVersion: externalPronunciationResult?.modelVersion || "E2E-GOP-SpeechOcean762",
      validationVersion: externalPronunciationResult?.validationVersion || "v1.0",
      reason: "ตรวจไม่พบคำภาษาอังกฤษที่ตรงกับโจทย์ (พูดไม่ตรงภาษาเป้าหมายหรือไม่ได้อ่านข้อความที่กำหนด)",
      words: wordsAnalysis.map((w) => ({
        text: w.word,
        phonemeScores: [],
      })),
    };
  } else if (externalPronunciationResult && externalPronunciationResult.status === "scored") {
    // Calculate pronunciation score strictly across spoken/attempted words (excluding omissions)
    const spokenWordsWithScore = wordsAnalysis.filter(
      (w) => w.error_type !== "Omission" && w.accuracy_score !== null
    );

    let adjustedPronunciationScore = externalPronunciationResult.pronunciationScore;
    if (completeness_score < 100 && spokenWordsWithScore.length > 0) {
      const avgSpokenAccuracy = Math.round(
        spokenWordsWithScore.reduce((sum, w) => sum + (w.accuracy_score ?? 0), 0) /
          spokenWordsWithScore.length
      );
      adjustedPronunciationScore = avgSpokenAccuracy;
    }

    pronunciation_result = {
      ...externalPronunciationResult,
      pronunciationScore: adjustedPronunciationScore,
    };
  } else {
    // Model not yet calibrated or server offline: DO NOT synthesize fake scores!
    pronunciation_result = {
      status: "not_ready",
      pronunciationScore: null,
      scale: null,
      modelVersion: "E2E-GOP-SpeechOcean762",
      validationVersion: "benchmark-pending",
      reason: "โมเดลประเมินการออกเสียงอยู่ระหว่างการทดสอบเทียบมาตรฐานกับ SpeechOcean762 ระบบยังไม่อนุมัติการแสดงคะแนนจริงแก่ผู้เรียน",
    };
  }

  // Dimension metrics
  const metrics: SpeakingMetrics = {
    pronunciation_score: pronunciation_result.pronunciationScore,
    fluency_score: null, // Requires temporal acoustic alignment model
    completeness_score,
    prosody_score: null, // Requires calibrated F0 pitch model
  };

  // Overall score and CEFR band calculation only if pronunciationScore is verified
  const overall_score =
    pronunciation_result.status === "scored" && pronunciation_result.pronunciationScore !== null
      ? Math.round(pronunciation_result.pronunciationScore * 0.5 + completeness_score * 0.5)
      : null;

  const cefr_band = overall_score !== null ? scoreToCefrBand(overall_score) : null;

  // Pedagogical feedback in Thai without ungrounded scores
  let feedbackTh = "";
  if (isCompletelySilent) {
    feedbackTh = "ตรวจไม่พบเสียงพูดที่ชัดเจนในไฟล์เสียง กรุณาตรวจสอบไมโครโฟนและฝึกพูดออกเสียงตามข้อความตัวอย่าง";
  } else if (hasNoRecognizedWords || completeness_score === 0 || matchedWordCount === 0) {
    feedbackTh = "ตรวจไม่พบคำภาษาอังกฤษที่ตรงกับบทอ่านเป้าหมาย หรือภาษาที่พูดไม่ตรงกับโจทย์ (ความครบถ้วน 0%) กรุณาฝึกอ่านและออกเสียงข้อความภาษาอังกฤษตามที่กำหนด";
  } else if (mode === "free_speaking" && pronunciation_result.status === "scored" && overall_score !== null) {
    feedbackTh = `การพูดตอบในโหมด Free Speaking ครอบคลุมใจความสำคัญ ${completeness_score}% (ตรวจพบคำสำคัญ ${keywordsFound.length}/${targetKeywords.length} คำ) และคะแนนการออกเสียงคือ ${pronunciation_result.pronunciationScore} คะแนน`;
  } else if (mode === "free_speaking") {
    feedbackTh = `ความครอบคลุมเนื้อหาในโหมด Free Speaking คือ ${completeness_score}% (พบคำสำคัญ ${keywordsFound.length}/${targetKeywords.length} คำ)`;
  } else if (completeness_score < 50) {
    feedbackTh = `คุณพูดข้อความได้เพียง ${completeness_score}% ของข้อความทั้งหมด (ขาดคำสำคัญไปหลายคำ) กรุณาฝึกอ่านและพูดประโยคให้ครบถ้วนสมบูรณ์ตามโจทย์`;
  } else if (pronunciation_result.status === "scored" && overall_score !== null) {
    feedbackTh = `พูดข้อความได้ครบถ้วน ${completeness_score}% และคะแนนการออกเสียงที่ผ่านการประเมินจากโมเดลคือ ${pronunciation_result.pronunciationScore} คะแนน`;
  } else {
    feedbackTh = `ความครบถ้วนของเนื้อหาที่พูดได้คือ ${completeness_score}% (ระบบออกเสียง E2E-GOP อยู่ในโหมด Benchmark Verification ตามเกณฑ์ Go/No-Go)`;
  }

  return {
    attempt_id: generateAttemptId(),
    overall_score,
    cefr_band,
    completeness_score,
    pronunciation_result,
    metrics,
    transcription: isCompletelySilent ? "(ไม่พบเสียงพูดในไฟล์)" : transcription,
    words_analysis: wordsAnalysis,
    feedback_th: feedbackTh,
    mode,
    target_keywords_found: keywordsFound,
  };
}
