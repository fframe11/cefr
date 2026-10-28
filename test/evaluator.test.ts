import { describe, it, expect } from "vitest";
import { evaluateSpeech } from "@/lib/speaking/evaluator";

describe("AI Speech Evaluation Pipeline", () => {
  it("enforces No-Fake-Score invariant by returning not_ready when model is uncalibrated", async () => {
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
    expect(result.completeness_score).toBe(100);

    // Pronunciation score must be null (not fake) while in benchmark phase
    expect(result.pronunciation_result.status).toBe("not_ready");
    expect(result.pronunciation_result.pronunciationScore).toBeNull();
    expect(result.overall_score).toBeNull();
    expect(result.cefr_band).toBeNull();

    // Check words analysis
    expect(result.words_analysis.length).toBeGreaterThan(0);
    expect(typeof result.feedback_th).toBe("string");
  });

  it("abstains with status 'abstained' when silence or no speech is detected", async () => {
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

    expect(silentResult.pronunciation_result.status).toBe("abstained");
    expect(silentResult.pronunciation_result.pronunciationScore).toBeNull();
    expect(silentResult.completeness_score).toBe(0);
    expect(silentResult.feedback_th).toContain("ตรวจไม่พบเสียงพูด");
  });

  it("scores partial speech text coverage accurately with omission tracking", async () => {
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

    expect(partialResult.completeness_score).toBeLessThan(50);

    const missingWord = partialResult.words_analysis.find(
      (w) => w.word.toLowerCase() === "globally"
    );
    expect(missingWord?.error_type).toBe("Omission");
  });

  it("produces verified scores when external model inference passes quality gate", async () => {
    const referenceText = "I enjoy studying English.";
    const audioBuffer = new Uint8Array(1000);

    const result = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr: "B2",
      promptId: "prompt_test_02",
      externalPronunciationResult: {
        status: "scored",
        pronunciationScore: 86,
        scale: "0-100",
        modelVersion: "E2E-GOP-SpeechOcean762",
        validationVersion: "v1.0",
        words: [
          {
            text: "enjoy",
            phonemeScores: [{ phoneme: "IH0", score: 1.8, scale: "0-2" }],
          },
        ],
      },
    });

    expect(result.pronunciation_result.status).toBe("scored");
    expect(result.pronunciation_result.pronunciationScore).toBe(86);
    expect(result.overall_score).toBeDefined();
    expect(result.cefr_band).toBeDefined();
  });

  it("abstains with status 'abstained' when learner speaks off-target language (e.g. Thai) with 0% completeness", async () => {
    const referenceText = "I enjoy studying English because it helps me communicate globally.";
    const audioBuffer = new Uint8Array(16000 * 2 * 3);

    // User spoke in Thai (none of the English reference words matched)
    const thaiResult = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr: "B2",
      promptId: "prompt_thai_speech",
      clientDurationSec: 3.5,
      userTranscript: "สวัสดีครับผมชื่อจอห์น วันนี้อากาศดีมาก",
      acousticMetrics: {
        volume_rms: 0.12,
        silence_ratio: 0.2,
      },
      externalPronunciationResult: {
        status: "scored",
        pronunciationScore: 61,
        scale: "0-100",
        modelVersion: "anonym-coling2027/E2E-GOP-SpeechOcean762",
        validationVersion: "v1.0",
        words: [],
      },
    });

    // Content relevance gate MUST prevent fake 61% score on Thai speech!
    expect(thaiResult.completeness_score).toBe(0);
    expect(thaiResult.pronunciation_result.status).toBe("abstained");
    expect(thaiResult.pronunciation_result.pronunciationScore).toBeNull();
    expect(thaiResult.overall_score).toBeNull();
    expect(thaiResult.feedback_th).toContain("ภาษาที่พูดไม่ตรงกับโจทย์");
  });
});
