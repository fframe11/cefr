import { CEFRLevel, CambridgeExamCode } from '../validation/common-schemas';

export interface CefrEstimationResult {
  estimatedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimatedCambridgeScore: number;
  recommendedExam: 'KET' | 'PET' | 'FCE' | 'CAE';
  percentage: number;
  estimationMethod: 'platform_diagnostic_heuristic';
  isOfficial: false;
  disclaimer: string;
}

/**
 * Platform Diagnostic CEFR & Cambridge English Scale Estimation (Provisional Heuristic)
 * 
 * IMPORTANT ARCHITECTURAL & PSYCHOMETRIC PRINCIPLES:
 * 1. CEFR Standard Boundary:
 *    The Council of Europe (CoE) Common European Framework of Reference defines proficiency
 *    via descriptors and illustrative "can-do" statements. It DOES NOT prescribe an official universal
 *    percentage-correct conversion formula for arbitrary diagnostic quizzes.
 * 2. Cambridge English Scale Boundary:
 *    The Cambridge English Scale is an exam-specific reporting system (range 80-230). In official
 *    Cambridge examinations, scale scores are established through rigorous psychometric calibration
 *    and equating procedures per examination paper (e.g. A2 Key, B1 Preliminary, B2 First, etc.).
 * 3. Platform Heuristic Nature:
 *    The raw accuracy thresholds below (<25%, 25-44%, 45-64%, 65-79%, 80-91%, >=92%) represent
 *    an internal platform diagnostic heuristic intended solely for initial learner placement and
 *    recommended learning path orientation within this platform.
 * 4. Transparency:
 *    This result MUST NEVER be presented as an official Cambridge certificate score or official CEFR
 *    credential. It is explicitly flagged with `isOfficial: false` and `estimationMethod: 'platform_diagnostic_heuristic'`.
 */
export function estimatePlatformCefr(correctCount: number, totalQuestions: number): CefrEstimationResult {
  const disclaimerText = 'Platform diagnostic estimate based on internal placement heuristics; not an official Cambridge English examination result or CEFR certificate.';

  if (totalQuestions <= 0) {
    return {
      estimatedLevel: 'A1',
      estimatedCambridgeScore: 80,
      recommendedExam: 'KET',
      percentage: 0,
      estimationMethod: 'platform_diagnostic_heuristic',
      isOfficial: false,
      disclaimer: disclaimerText,
    };
  }

  const clampedCorrect = Math.max(0, Math.min(totalQuestions, correctCount));
  const percentage = Math.round((clampedCorrect / totalQuestions) * 100);

  let estimatedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  let estimatedCambridgeScore: number;
  let recommendedExam: 'KET' | 'PET' | 'FCE' | 'CAE';

  // Platform Diagnostic Heuristic Calibration Curve
  // Note: These reference bands map to nominal Cambridge English Scale score intervals
  // (A1: 80-119, A2: 120-139, B1: 140-159, B2: 160-179, C1: 180-199, C2: 200-230)
  // as an internal platform estimate; NOT an official examination result or psychometrically equated score.
  if (percentage < 25) {
    // A1 band: Scale 80 - 119 (Associated study recommendation: KET)
    estimatedLevel = 'A1';
    recommendedExam = 'KET';
    const subRatio = percentage / 25;
    estimatedCambridgeScore = Math.round(80 + subRatio * (119 - 80));
  } else if (percentage < 45) {
    // A2 band: Scale 120 - 139 (Associated study recommendation: KET)
    estimatedLevel = 'A2';
    recommendedExam = 'KET';
    const subRatio = (percentage - 25) / (45 - 25);
    estimatedCambridgeScore = Math.round(120 + subRatio * (139 - 120));
  } else if (percentage < 65) {
    // B1 band: Scale 140 - 159 (Associated study recommendation: PET)
    estimatedLevel = 'B1';
    recommendedExam = 'PET';
    const subRatio = (percentage - 45) / (65 - 45);
    estimatedCambridgeScore = Math.round(140 + subRatio * (159 - 140));
  } else if (percentage < 80) {
    // B2 band: Scale 160 - 179 (Associated study recommendation: FCE)
    estimatedLevel = 'B2';
    recommendedExam = 'FCE';
    const subRatio = (percentage - 65) / (80 - 65);
    estimatedCambridgeScore = Math.round(160 + subRatio * (179 - 160));
  } else if (percentage < 92) {
    // C1 band: Scale 180 - 199 (Associated study recommendation: CAE)
    estimatedLevel = 'C1';
    recommendedExam = 'CAE';
    const subRatio = (percentage - 80) / (92 - 80);
    estimatedCambridgeScore = Math.round(180 + subRatio * (199 - 180));
  } else {
    // C2 band: Scale 200 - 230 (Associated study recommendation: CAE)
    estimatedLevel = 'C2';
    recommendedExam = 'CAE';
    const subRatio = (percentage - 92) / (100 - 92);
    estimatedCambridgeScore = Math.round(200 + Math.min(1, subRatio) * (230 - 200));
  }

  // Bound within Cambridge English Scale range (>= 80, <= 230)
  estimatedCambridgeScore = Math.max(80, Math.min(230, estimatedCambridgeScore));

  return {
    estimatedLevel,
    estimatedCambridgeScore,
    recommendedExam,
    percentage,
    estimationMethod: 'platform_diagnostic_heuristic',
    isOfficial: false,
    disclaimer: disclaimerText,
  };
}
