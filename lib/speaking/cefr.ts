import { CEFRLevel, SpeakingMetrics } from "./types";

export const CEFR_THRESHOLDS: Record<CEFRLevel, { min: number; max: number; label: string }> = {
  A1: { min: 0, max: 39, label: "A1 Breakthrough" },
  A2: { min: 40, max: 54, label: "A2 Waystage" },
  B1: { min: 55, max: 69, label: "B1 Threshold" },
  B2: { min: 70, max: 84, label: "B2 Vantage" },
  C1: { min: 85, max: 94, label: "C1 Effective Operational Proficiency" },
  C2: { min: 95, max: 100, label: "C2 Mastery" },
};

export const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Calculates weighted overall score based on the 4 Speaking dimensions:
 * - Pronunciation: 35%
 * - Fluency: 25%
 * - Completeness: 25%
 * - Prosody: 15%
 */
export function calculateOverallScore(metrics: SpeakingMetrics): number {
  const weighted =
    metrics.pronunciation_score * 0.35 +
    metrics.fluency_score * 0.25 +
    metrics.completeness_score * 0.25 +
    metrics.prosody_score * 0.15;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

/**
 * Converts a numerical score (0-100) into a CEFR Level band.
 */
export function scoreToCefrBand(score: number): CEFRLevel {
  const clamped = Math.min(100, Math.max(0, score));

  if (clamped >= 95) return "C2";
  if (clamped >= 85) return "C1";
  if (clamped >= 70) return "B2";
  if (clamped >= 55) return "B1";
  if (clamped >= 40) return "A2";
  return "A1";
}

/**
 * Generates tailored Thai pedagogical feedback based on individual metrics
 * and target CEFR level.
 */
export function generateThaiFeedback(
  metrics: SpeakingMetrics,
  overallScore: number,
  calculatedCefr: CEFRLevel,
  targetCefr?: CEFRLevel
): string {
  const insights: string[] = [];

  // Overall impression
  if (overallScore >= 85) {
    insights.push("การออกเสียงโดยรวมชัดเจนดีมาก จังหวะการพูดเป็นธรรมชาติและสื่อสารได้อย่างคล่องแคล่ว");
  } else if (overallScore >= 70) {
    insights.push("การออกเสียงโดยรวมดี สามารถสื่อสารใจความสำคัญได้ชัดเจนและเป็นธรรมชาติ");
  } else if (overallScore >= 50) {
    insights.push("การออกเสียงอยู่ในระดับปานกลาง สื่อสารได้พอเข้าใจแต่ยังมีจุดติดขัดในบางช่วง");
  } else {
    insights.push("ควรฝึกฝนการออกเสียงพื้นฐานและการเชื่อมคำเพิ่มเติม เพื่อเพิ่มความมั่นใจในการสนทนา");
  }

  // Dimension specific coaching
  if (metrics.pronunciation_score < 70) {
    insights.push("เน้นระวังเสียงลงท้ายและเสียงควบกล้ำพยัญชนะ");
  }

  if (metrics.fluency_score < 70) {
    insights.push("พยายามลดจังหวะการหยุดคิดนาน และฝึกพูดเชื่อมคำเป็นวลีต่อเนื่อง");
  }

  if (metrics.prosody_score < 70) {
    insights.push("ปรับปรุงน้ำเสียงสูงต่ำและการเน้นเสียงหนักเบาในระดับประโยค");
  }

  if (metrics.completeness_score < 70) {
    insights.push("ตอบคำถามให้ครอบคลุมใจความสำคัญตามที่โจทย์กำหนดให้ครบถ้วนยิ่งขึ้น");
  }

  // Target delta context
  if (targetCefr) {
    const targetIdx = CEFR_ORDER.indexOf(targetCefr);
    const calculatedIdx = CEFR_ORDER.indexOf(calculatedCefr);

    if (calculatedIdx >= targetIdx) {
      insights.push(`ยินดีด้วย! คุณทำผลงานได้ถึงเกณฑ์ระดับเป้าหมาย (${targetCefr}) แล้ว`);
    } else {
      insights.push(`เหลืออีกเพียงเล็กน้อยเพื่อยกระดับสู่เป้าหมาย ${targetCefr} ลองฝึกซ้ำอีกครั้ง`);
    }
  }

  return insights.join(" ");
}
