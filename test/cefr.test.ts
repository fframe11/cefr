import { describe, it, expect } from "vitest";
import {
  calculateOverallScore,
  scoreToCefrBand,
  generateThaiFeedback,
  CEFR_THRESHOLDS,
} from "@/lib/speaking/cefr";
import { SpeakingMetrics } from "@/lib/speaking/types";

describe("CEFR Band Calculation & Score Mapping", () => {
  it("correctly maps boundary scores to CEFR bands", () => {
    // A1: 0 - 39
    expect(scoreToCefrBand(0)).toBe("A1");
    expect(scoreToCefrBand(39)).toBe("A1");

    // A2: 40 - 54
    expect(scoreToCefrBand(40)).toBe("A2");
    expect(scoreToCefrBand(54)).toBe("A2");

    // B1: 55 - 69
    expect(scoreToCefrBand(55)).toBe("B1");
    expect(scoreToCefrBand(69)).toBe("B1");

    // B2: 70 - 84
    expect(scoreToCefrBand(70)).toBe("B2");
    expect(scoreToCefrBand(82)).toBe("B2");
    expect(scoreToCefrBand(84)).toBe("B2");

    // C1: 85 - 94
    expect(scoreToCefrBand(85)).toBe("C1");
    expect(scoreToCefrBand(94)).toBe("C1");

    // C2: 95 - 100
    expect(scoreToCefrBand(95)).toBe("C2");
    expect(scoreToCefrBand(100)).toBe("C2");
  });

  it("handles out of bounds scores with clamping", () => {
    expect(scoreToCefrBand(-10)).toBe("A1");
    expect(scoreToCefrBand(150)).toBe("C2");
  });

  it("calculates weighted overall score correctly according to 4 dimensions", () => {
    // Test case matching Notion example:
    // pronunciation: 85 (0.35) = 29.75
    // fluency: 78 (0.25) = 19.5
    // completeness: 90 (0.25) = 22.5
    // prosody: 76 (0.15) = 11.4
    // total = 83.15 -> rounds to 83 (or 82 with exact float tolerances)
    const metrics: SpeakingMetrics = {
      pronunciation_score: 85,
      fluency_score: 78,
      completeness_score: 90,
      prosody_score: 76,
    };

    const overall = calculateOverallScore(metrics);
    expect(overall).toBe(83);
    expect(scoreToCefrBand(overall!)).toBe("B2");
  });

  it("calculates extreme metrics accurately", () => {
    const perfectMetrics: SpeakingMetrics = {
      pronunciation_score: 100,
      fluency_score: 100,
      completeness_score: 100,
      prosody_score: 100,
    };
    expect(calculateOverallScore(perfectMetrics)).toBe(100);
    expect(scoreToCefrBand(100)).toBe("C2");

    const zeroMetrics: SpeakingMetrics = {
      pronunciation_score: 0,
      fluency_score: 0,
      completeness_score: 0,
      prosody_score: 0,
    };
    expect(calculateOverallScore(zeroMetrics)).toBe(0);
    expect(scoreToCefrBand(0)).toBe("A1");
  });

  it("generates actionable Thai pedagogical feedback tailored to weak areas", () => {
    const metrics: SpeakingMetrics = {
      pronunciation_score: 60,
      fluency_score: 65,
      completeness_score: 80,
      prosody_score: 55,
    };

    const feedback = generateThaiFeedback(metrics, 65, "B1", "B2");

    // Should include advice on pronunciation, fluency, and prosody
    expect(feedback).toContain("เสียงลงท้าย");
    expect(feedback).toContain("การหยุดคิด");
    expect(feedback).toContain("น้ำเสียงสูงต่ำ");
    expect(feedback).toContain("B2");
  });
});
