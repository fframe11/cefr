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
      userTranscript: "I enjoy studying English because it helps me communicate globally",
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
    expect(typeof result.feedback_th).toBe("string");
    expect(result.feedback_th.length).toBeGreaterThan(10);
  });

  it("drastically reduces scores when silence or no speech is detected", async () => {
    const referenceText = "I enjoy studying English because it helps me communicate globally.";
    const audioBuffer = new Uint8Array(16000 * 2 * 4);

    const silentResult = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr: "B2",
      promptId: "prompt_silent",
      clientDurationSec: 4.0,
      userTranscript: "",
      acousticMetrics: {
        volume_rms: 0.001,
        silence_ratio: 0.98,
      },
    });

    // Silent audio should receive very low score and A1 band
    expect(silentResult.overall_score).toBeLessThan(20);
    expect(silentResult.cefr_band).toBe("A1");
    expect(silentResult.metrics.completeness_score).toBe(0);
    expect(silentResult.feedback_th).toContain("ตรวจไม่พบเสียงพูด");
  });

  it("scores partial speech accurately with omission penalties", async () => {
    const referenceText = "I enjoy studying English because it helps me communicate globally.";
    const audioBuffer = new Uint8Array(16000 * 2 * 4);

    // User only said 3 words out of 9
    const partialResult = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr: "B2",
      promptId: "prompt_partial",
      clientDurationSec: 4.0,
      userTranscript: "I enjoy studying",
      acousticMetrics: {
        volume_rms: 0.08,
        silence_ratio: 0.3,
      },
    });

    expect(partialResult.overall_score).toBeLessThan(60);
    expect(partialResult.metrics.completeness_score).toBeLessThan(50);

    const missingWord = partialResult.words_analysis.find(
      (w) => w.word.toLowerCase() === "globally"
    );
    expect(missingWord?.error_type).toBe("Omission");
    expect(missingWord?.accuracy_score).toBe(10);
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
