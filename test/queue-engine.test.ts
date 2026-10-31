import { describe, it, expect } from "vitest";
import {
  shuffle,
  initPracticeQueueState,
  popNextPracticeSentence,
} from "@/lib/speaking/queue-engine";
import {
  SPEAKING_SENTENCE_BANK,
  getSentencesByFilter,
  getAvailableTopics,
} from "@/lib/speaking/sentence-bank";
import { SpeakingSentence } from "@/lib/speaking/types";

describe("Speaking Sentence Bank & Practice Queue Engine", () => {
  it("contains curated sentences across all CEFR bands A1 to C1", () => {
    const levels = ["A1", "A2", "B1", "B2", "C1"] as const;
    levels.forEach((level) => {
      const sentences = getSentencesByFilter({ cefrLevel: level });
      expect(sentences.length).toBeGreaterThan(0);
      sentences.forEach((s) => {
        expect(s.cefrLevel).toBe(level);
        expect(s.sentence.length).toBeGreaterThan(5);
        expect(s.targetKeywords.length).toBeGreaterThan(0);
        expect(s.difficulty).toBeGreaterThan(0);
        expect(["read_aloud", "free_speaking"]).toContain(s.mode);
      });
    });
  });

  it("separates Read Aloud and Free Speaking modes correctly", () => {
    const readAloud = getSentencesByFilter({ cefrLevel: "B1", mode: "read_aloud" });
    const freeSpeaking = getSentencesByFilter({ cefrLevel: "B1", mode: "free_speaking" });

    expect(readAloud.length).toBeGreaterThan(0);
    expect(freeSpeaking.length).toBeGreaterThan(0);

    readAloud.forEach((item) => expect(item.mode).toBe("read_aloud"));
    freeSpeaking.forEach((item) => {
      expect(item.mode).toBe("free_speaking");
      expect(item.contextOrQuestion).toBeDefined();
    });
  });

  it("extracts unique topics per CEFR level", () => {
    const a1Topics = getAvailableTopics("A1");
    expect(a1Topics).toContain("Daily Life");
    expect(a1Topics).toContain("Food & Drink");

    const b1Topics = getAvailableTopics("B1");
    expect(b1Topics).toContain("Travel & Culture");

    const c1Topics = getAvailableTopics("C1");
    expect(c1Topics).toContain("Technology & Ethics");
  });

  it("Fisher-Yates shuffle produces valid permutation without data loss", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffle(original);

    expect(shuffled.length).toBe(original.length);
    expect(new Set(shuffled).size).toBe(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it("enforces Shuffle Without Replacement (zero repetition in the same round)", () => {
    const testBank: SpeakingSentence[] = [
      {
        id: "test_01",
        cefrLevel: "A1",
        topic: "Daily Life",
        promptTitle: "Test 1",
        sentence: "Sentence 1",
        targetKeywords: ["one"],
        difficulty: 10,
        mode: "read_aloud",
        isActive: true,
      },
      {
        id: "test_02",
        cefrLevel: "A1",
        topic: "Daily Life",
        promptTitle: "Test 2",
        sentence: "Sentence 2",
        targetKeywords: ["two"],
        difficulty: 12,
        mode: "read_aloud",
        isActive: true,
      },
      {
        id: "test_03",
        cefrLevel: "A1",
        topic: "Daily Life",
        promptTitle: "Test 3",
        sentence: "Sentence 3",
        targetKeywords: ["three"],
        difficulty: 14,
        mode: "read_aloud",
        isActive: true,
      },
      {
        id: "test_04",
        cefrLevel: "A1",
        topic: "Daily Life",
        promptTitle: "Test 4",
        sentence: "Sentence 4",
        targetKeywords: ["four"],
        difficulty: 16,
        mode: "read_aloud",
        isActive: true,
      },
    ];

    let state = initPracticeQueueState("A1", "Daily Life", "read_aloud");
    // Override activeQueue to match test bank
    state.activeQueue = testBank.map((s) => s.id);
    state.totalInBank = testBank.length;

    const seenIdsInRound1: string[] = [];

    // Pop all 4 items
    for (let i = 0; i < 4; i++) {
      const result = popNextPracticeSentence(state, testBank);
      expect(result.sentence).not.toBeNull();
      expect(seenIdsInRound1).not.toContain(result.sentence!.id);
      seenIdsInRound1.push(result.sentence!.id);
      state = result.updatedState;
    }

    // Round 1 must contain all 4 distinct IDs
    expect(seenIdsInRound1.length).toBe(4);
    expect(new Set(seenIdsInRound1).size).toBe(4);
    expect(state.activeQueue.length).toBe(0);

    // 5th pop should automatically trigger Round 2
    const round2FirstResult = popNextPracticeSentence(state, testBank);
    expect(round2FirstResult.isNewRound).toBe(true);
    expect(round2FirstResult.progress.roundNumber).toBe(2);
    expect(round2FirstResult.updatedState.activeQueue.length).toBe(3); // 4 total - 1 popped
  });
});
