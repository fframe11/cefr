import { describe, it, expect } from "vitest";
import { evaluateSpeech } from "@/lib/speaking/evaluator";

describe("AI Speech Evaluation Pipeline", () => {
  it("evaluates speech and returns complete Notion specification data contract", async () => {
    const referenceText = "I enjoy studying English because it helps me communicate globally.";
    const audioBuffer = new Uint8Array(16000 * 2 * 4); // 4 seconds dummy buffer

    const result = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr: "B2",
      promptId: "prompt_test_01",
      clientDurationSec: 4.5,
    });

    // Check top-level properties
    expect(result.attempt_id).toMatch(/^spk_[a-f0-9]+$/);
    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(100);
    expect(["A1", "A2", "B1", "B2", "C1", "C2"]).toContain(result.cefr_band);

    // Check 4-dimension metrics
    expect(result.metrics.pronunciation_score).toBeDefined();
    expect(result.metrics.fluency_score).toBeDefined();
    expect(result.metrics.completeness_score).toBeDefined();
    expect(result.metrics.prosody_score).toBeDefined();

    // Check words analysis
    expect(result.words_analysis.length).toBeGreaterThan(0);
    const globallyWord = result.words_analysis.find(
      (w) => w.word.toLowerCase() === "globally"
    );
    expect(globallyWord).toBeDefined();
    if (globallyWord && globallyWord.error_type !== "None") {
      expect(globallyWord.phonetic_hint).toBe("/ˈɡloʊ.bəl.i/");
      expect(globallyWord.tip_th).toContain("GLO-buh-lee");
    }

    // Check feedback
    expect(typeof result.feedback_th).toBe("string");
    expect(result.feedback_th.length).toBeGreaterThan(10);
  });

  it("produces deterministic metrics when simulated scores are passed", async () => {
    const referenceText = "I enjoy studying English.";
    const audioBuffer = new Uint8Array(1000);

    const result = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr: "B2",
      promptId: "prompt_test_02",
      simulatedScores: {
        pronunciation_score: 85,
        fluency_score: 78,
        completeness_score: 90,
        prosody_score: 76,
      },
    });

    expect(result.metrics.pronunciation_score).toBe(85);
    expect(result.metrics.fluency_score).toBe(78);
    expect(result.metrics.completeness_score).toBe(90);
    expect(result.metrics.prosody_score).toBe(76);
    expect(result.cefr_band).toBe("B2");
  });
});
