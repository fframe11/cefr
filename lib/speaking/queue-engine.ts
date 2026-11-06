import { CEFRLevel, PracticeQueueState, SpeakingMode, SpeakingSentence } from "./types";
import { getSentencesByFilter, SPEAKING_SENTENCE_BANK } from "./sentence-bank";

/**
 * Standard Fisher-Yates (Knuth) Shuffle algorithm.
 * Guarantees uniform, unbiased permutations without replacement.
 */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a randomized practice queue from an array of sentences.
 */
export function createPracticeQueue(sentences: SpeakingSentence[]): SpeakingSentence[] {
  return shuffle(sentences);
}

/**
 * Generates initial queue state for a given CEFR level, topic, and mode.
 */
export function initPracticeQueueState(
  cefrLevel: CEFRLevel,
  topic: string = "all",
  mode: SpeakingMode = "read_aloud"
): PracticeQueueState {
  const matching = getSentencesByFilter({ cefrLevel, topic, mode });
  const shuffled = createPracticeQueue(matching);
  const activeIds = shuffled.map((s) => s.id);

  return {
    cefrLevel,
    topic,
    mode,
    activeQueue: activeIds,
    practicedIds: [],
    roundNumber: 1,
    totalInBank: matching.length,
  };
}

export interface NextSentenceResult {
  sentence: SpeakingSentence | null;
  updatedState: PracticeQueueState;
  isNewRound: boolean;
  progress: {
    currentInRound: number;
    totalInRound: number;
    roundNumber: number;
  };
}

/**
 * Retrieves the next sentence from the queue using Shuffle Without Replacement.
 * When the queue is exhausted, it automatically initiates a new round by reshuffling
 * the bank while ensuring the first sentence of the new round differs from the last sentence.
 */
export function popNextPracticeSentence(
  currentState: PracticeQueueState,
  bank: SpeakingSentence[] = SPEAKING_SENTENCE_BANK
): NextSentenceResult {
  const matchingBank = bank.filter((s) => {
    if (!s.isActive) return false;
    if (s.cefrLevel !== currentState.cefrLevel) return false;
    if (currentState.topic && currentState.topic !== "all" && s.topic !== currentState.topic) return false;
    if (s.mode !== currentState.mode) return false;
    return true;
  });

  if (matchingBank.length === 0) {
    return {
      sentence: null,
      updatedState: currentState,
      isNewRound: false,
      progress: {
        currentInRound: 0,
        totalInRound: 0,
        roundNumber: currentState.roundNumber,
      },
    };
  }

  let queue = [...currentState.activeQueue];
  let practiced = [...currentState.practicedIds];
  let roundNumber = currentState.roundNumber;
  let isNewRound = false;

  // If queue is exhausted, start a fresh round without repeating the last practiced item
  if (queue.length === 0) {
    const lastId = practiced[practiced.length - 1];
    let newShuffled = shuffle(matchingBank);

    // If more than 1 item and first item equals last practiced item, swap it
    if (newShuffled.length > 1 && newShuffled[0].id === lastId) {
      const swapIdx = 1 + Math.floor(Math.random() * (newShuffled.length - 1));
      [newShuffled[0], newShuffled[swapIdx]] = [newShuffled[swapIdx], newShuffled[0]];
    }

    queue = newShuffled.map((s) => s.id);
    practiced = [];
    roundNumber += 1;
    isNewRound = true;
  }

  // Pop next sentence ID
  const nextId = queue.shift()!;
  practiced.push(nextId);

  const sentence = matchingBank.find((s) => s.id === nextId) || null;

  const updatedState: PracticeQueueState = {
    cefrLevel: currentState.cefrLevel,
    topic: currentState.topic,
    mode: currentState.mode,
    activeQueue: queue,
    practicedIds: practiced,
    roundNumber,
    totalInBank: matchingBank.length,
  };

  return {
    sentence,
    updatedState,
    isNewRound,
    progress: {
      currentInRound: practiced.length,
      totalInRound: matchingBank.length,
      roundNumber,
    },
  };
}

/**
 * Storage key generator for client-side persistence.
 */
export function getQueueStorageKey(cefrLevel: CEFRLevel, topic: string, mode: SpeakingMode): string {
  return `glova_spk_queue_${cefrLevel}_${topic || "all"}_${mode}`;
}

/**
 * Loads queue state from browser LocalStorage if available.
 */
export function loadLocalQueueState(
  cefrLevel: CEFRLevel,
  topic: string = "all",
  mode: SpeakingMode = "read_aloud"
): PracticeQueueState | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const key = getQueueStorageKey(cefrLevel, topic, mode);
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as PracticeQueueState;
  } catch {
    return null;
  }
}

/**
 * Saves queue state to browser LocalStorage.
 */
export function saveLocalQueueState(state: PracticeQueueState): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    const key = getQueueStorageKey(state.cefrLevel, state.topic, state.mode);
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
