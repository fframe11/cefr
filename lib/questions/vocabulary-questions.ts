/**
 * ==============================================================================
 * GLOVA Server-Authoritative Question Generation Engine
 * ==============================================================================
 *
 * Generates verified pedagogical vocabulary questions across 6 distinct
 * interaction types from the 3,860 production candidates.
 *
 * Security Invariant:
 * Answer keys are protected on the server side; client-facing questions
 * never leak `isCorrect` flags before submission.
 * ==============================================================================
 */

import { CEFRLevel, Question, QuestionOption, QuestionType } from '../../types';
import {
  getAllProductionVocabulary,
  getProductionVocabularyByCefr,
  getProductionVocabularyById,
  ProductionVocabularyRecord,
} from '../vocabulary/production-vocabulary';

export type VocabularyQuestionInteractionType =
  | 'meaning_recognition'
  | 'reverse_meaning'
  | 'sentence_completion'
  | 'collocation_matching'
  | 'part_of_speech_id'
  | 'pronunciation_stress';

export interface GeneratedVocabQuestion extends Question {
  targetWordId: string;
  targetWord: string;
  interactionType: VocabularyQuestionInteractionType;
  serverAnswerKey: string; // 'A' | 'B' | 'C' | 'D'
}

export interface ClientSanitizedVocabQuestion {
  id: string;
  skill: 'vocabulary';
  cefrLevel: CEFRLevel;
  type: QuestionType;
  interactionType: VocabularyQuestionInteractionType;
  promptTh: string;
  promptEn: string;
  contextPassage?: string;
  targetWord?: string;
  ipa?: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  difficultyWeight: number;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

/**
 * Pick 3 plausible distractors of the same CEFR level and/or part of speech.
 */
function getDistractors(
  target: ProductionVocabularyRecord,
  field: 'meaning_th' | 'meaning_en' | 'word' | 'ipa',
  count = 3
): string[] {
  const cefrPool = getProductionVocabularyByCefr(target.cefr_level);
  const samePosPool = cefrPool.filter((w) => w.id !== target.id && w.part_of_speech === target.part_of_speech);
  const fallbackPool = getAllProductionVocabulary().filter((w) => w.id !== target.id);

  const primaryList = samePosPool.length >= count ? samePosPool : cefrPool.filter((w) => w.id !== target.id);
  const candidates = primaryList.length >= count ? primaryList : fallbackPool;

  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  const selected: string[] = [];
  const targetVal = target[field];

  for (const item of shuffled) {
    const val = item[field];
    if (val && val !== targetVal && !selected.includes(val)) {
      selected.push(val);
      if (selected.length === count) break;
    }
  }

  // If still need more, fallback
  while (selected.length < count) {
    selected.push(
      field === 'meaning_th'
        ? 'ความหมายอื่น'
        : field === 'meaning_en'
        ? 'alternative definition'
        : field === 'word'
        ? 'alternate'
        : '/ˈæltənət/'
    );
  }

  return selected;
}

/**
 * Question Type 1: Meaning Recognition (Word -> Thai Meaning)
 */
function createMeaningRecognitionQuestion(target: ProductionVocabularyRecord): GeneratedVocabQuestion {
  const targetMeaning = target.meaning_en || target.meaning_th;
  const distractors = getDistractors(target, 'meaning_en', 3);
  const allTexts = [targetMeaning, ...distractors].sort(() => 0.5 - Math.random());
  const correctIndex = allTexts.indexOf(targetMeaning);
  const correctKey = OPTION_KEYS[correctIndex];

  const options: QuestionOption[] = allTexts.map((text, idx) => ({
    key: OPTION_KEYS[idx],
    text,
    isCorrect: idx === correctIndex,
    feedbackTh: idx === correctIndex ? 'Correct!' : `Incorrect. The meaning of "${target.word}" is "${targetMeaning}".`,
  }));

  return {
    id: `vq_mr_${target.id}_${Date.now()}`,
    targetWordId: target.id,
    targetWord: target.word,
    interactionType: 'meaning_recognition',
    serverAnswerKey: correctKey,
    skill: 'vocabulary',
    cefrLevel: target.cefr_level,
    type: 'multiple_choice',
    promptEn: `What is the meaning of "${target.word}"?`,
    promptTh: `What is the meaning of "${target.word}"?`,
    contextPassage: target.example_sentence_en ? `"${target.example_sentence_en}"` : undefined,
    options,
    explanationEn: `"${target.word}" (${target.part_of_speech}) means "${target.meaning_en}". IPA: ${target.ipa}. Example: "${target.example_sentence_en}"`,
    explanationTh: `"${target.word}" (${target.part_of_speech}) means "${target.meaning_en}". Example: "${target.example_sentence_en}"`,
    weaknessTag: 'vocabulary_meaning',
    difficultyWeight: target.cefr_level === 'A1' ? 1 : target.cefr_level === 'A2' ? 2 : target.cefr_level === 'B1' ? 3 : 4,
  };
}

/**
 * Question Type 2: Reverse Meaning (Definition -> English Word)
 */
function createReverseMeaningQuestion(target: ProductionVocabularyRecord): GeneratedVocabQuestion {
  const distractors = getDistractors(target, 'word', 3);
  const allTexts = [target.word, ...distractors].sort(() => 0.5 - Math.random());
  const correctIndex = allTexts.indexOf(target.word);
  const correctKey = OPTION_KEYS[correctIndex];

  const options: QuestionOption[] = allTexts.map((text, idx) => ({
    key: OPTION_KEYS[idx],
    text,
    isCorrect: idx === correctIndex,
    feedbackTh: idx === correctIndex ? 'Correct!' : `Incorrect. "${target.meaning_en || target.meaning_th}" is "${target.word}".`,
  }));

  return {
    id: `vq_rm_${target.id}_${Date.now()}`,
    targetWordId: target.id,
    targetWord: target.word,
    interactionType: 'reverse_meaning',
    serverAnswerKey: correctKey,
    skill: 'vocabulary',
    cefrLevel: target.cefr_level,
    type: 'multiple_choice',
    promptEn: `Which English word matches the definition: "${target.meaning_en || target.meaning_th}"?`,
    promptTh: `Which English word matches the definition: "${target.meaning_en || target.meaning_th}"?`,
    options,
    explanationEn: `"${target.word}" is the English term for "${target.meaning_en}". IPA: ${target.ipa}.`,
    explanationTh: `"${target.word}" means "${target.meaning_en}". Pronunciation: ${target.ipa}`,
    weaknessTag: 'vocabulary_recall',
    difficultyWeight: target.cefr_level === 'A1' ? 1 : target.cefr_level === 'A2' ? 2 : target.cefr_level === 'B1' ? 3 : 4,
  };
}

/**
 * Question Type 3: Sentence Completion (Cloze / Blank in Example)
 */
function createSentenceCompletionQuestion(target: ProductionVocabularyRecord): GeneratedVocabQuestion {
  const sentence = target.example_sentence_en;
  // Replace target word (case-insensitive) with blank
  const regex = new RegExp(`\\b${target.word}\\b`, 'i');
  let blankedSentence = sentence.replace(regex, '_____');

  // Fallback if exact word wasn't regex matched (e.g. inflected forms)
  if (!blankedSentence.includes('_____')) {
    const lemmaRegex = new RegExp(`\\b${target.lemma}\\b`, 'i');
    blankedSentence = sentence.replace(lemmaRegex, '_____');
  }
  if (!blankedSentence.includes('_____')) {
    blankedSentence = `Please choose the word: "_____ (${target.meaning_th})".`;
  }

  const distractors = getDistractors(target, 'word', 3);
  const allTexts = [target.word, ...distractors].sort(() => 0.5 - Math.random());
  const correctIndex = allTexts.indexOf(target.word);
  const correctKey = OPTION_KEYS[correctIndex];

  const options: QuestionOption[] = allTexts.map((text, idx) => ({
    key: OPTION_KEYS[idx],
    text,
    isCorrect: idx === correctIndex,
    feedbackTh: idx === correctIndex ? 'ถูกต้อง!' : `คำที่เหมาะสมที่สุดในบริบทนี้คือ "${target.word}"`,
  }));

  return {
    id: `vq_sc_${target.id}_${Date.now()}`,
    targetWordId: target.id,
    targetWord: target.word,
    interactionType: 'sentence_completion',
    serverAnswerKey: correctKey,
    skill: 'vocabulary',
    cefrLevel: target.cefr_level,
    type: 'fill_blank',
    promptEn: 'Choose the word that best completes the sentence:',
    promptTh: 'Choose the word that best completes the sentence:',
    contextPassage: blankedSentence,
    options,
    explanationEn: `Full sentence: "${target.example_sentence_en}". "${target.word}" fits contextually as a ${target.part_of_speech}.`,
    explanationTh: `ประโยคที่สมบูรณ์: "${target.example_sentence_en}" (${target.example_sentence_th})`,
    weaknessTag: 'vocabulary_context',
    difficultyWeight: target.cefr_level === 'A1' ? 2 : target.cefr_level === 'A2' ? 2 : 3,
  };
}

/**
 * Question Type 4: Collocation Matching
 */
function createCollocationQuestion(target: ProductionVocabularyRecord): GeneratedVocabQuestion {
  const collocations = target.collocations || [];
  const chosenCollocation = collocations.length > 0 ? collocations[0] : `${target.word} pattern`;

  // Create a blank in the collocation
  const wordsInColloc = chosenCollocation.split(/\s+/);
  let promptText = '';
  let correctChoice = target.word;

  if (wordsInColloc.length > 1) {
    // If target word is in collocation, blank it
    const hasTarget = wordsInColloc.some((w) => w.toLowerCase() === target.word.toLowerCase());
    if (hasTarget) {
      promptText = chosenCollocation.replace(new RegExp(`\\b${target.word}\\b`, 'i'), '_____');
      correctChoice = target.word;
    } else {
      // Blank the last word
      const lastWord = wordsInColloc[wordsInColloc.length - 1];
      promptText = chosenCollocation.replace(new RegExp(`\\b${lastWord}\\b`, 'i'), '_____');
      correctChoice = lastWord;
    }
  } else {
    promptText = `Common phrase: _____ ${target.word}`;
    correctChoice = target.word;
  }

  const distractors = getDistractors(target, 'word', 3);
  const allTexts = [correctChoice, ...distractors].sort(() => 0.5 - Math.random());
  const correctIndex = allTexts.indexOf(correctChoice);
  const correctKey = OPTION_KEYS[correctIndex];

  const options: QuestionOption[] = allTexts.map((text, idx) => ({
    key: OPTION_KEYS[idx],
    text,
    isCorrect: idx === correctIndex,
    feedbackTh: idx === correctIndex ? 'ถูกต้อง!' : `Collocation ที่เป็นธรรมชาติคือ "${chosenCollocation}"`,
  }));

  return {
    id: `vq_cl_${target.id}_${Date.now()}`,
    targetWordId: target.id,
    targetWord: target.word,
    interactionType: 'collocation_matching',
    serverAnswerKey: correctKey,
    skill: 'vocabulary',
    cefrLevel: target.cefr_level,
    type: 'multiple_choice',
    promptEn: 'Complete the common English collocation:',
    promptTh: 'Complete the common English collocation:',
    contextPassage: `"${promptText}"`,
    options,
    explanationEn: `"${chosenCollocation}" is a natural native English collocation.`,
    explanationTh: `กลุ่มคำสัมพันธ์ (Collocation): "${chosenCollocation}" แสดงการใช้งานร่วมกันที่ถูกต้องตามหลักภาษา`,
    weaknessTag: 'vocabulary_collocations',
    difficultyWeight: 3,
  };
}

/**
 * Question Type 5: Part of Speech Identification
 */
function createPosQuestion(target: ProductionVocabularyRecord): GeneratedVocabQuestion {
  const posOptions = ['noun', 'verb', 'adjective', 'adverb'];
  const correctPos = target.part_of_speech;
  const filtered = posOptions.includes(correctPos) ? posOptions : ['noun', 'verb', 'adjective', correctPos];

  const allTexts = [...filtered].sort(() => 0.5 - Math.random());
  const correctIndex = allTexts.indexOf(correctPos);
  const correctKey = OPTION_KEYS[correctIndex];

  const options: QuestionOption[] = allTexts.map((text, idx) => ({
    key: OPTION_KEYS[idx],
    text: text.toUpperCase(),
    isCorrect: idx === correctIndex,
    feedbackTh: idx === correctIndex ? 'ถูกต้อง!' : `คำว่า "${target.word}" ทำหน้าที่เป็น ${correctPos}`,
  }));

  return {
    id: `vq_pos_${target.id}_${Date.now()}`,
    targetWordId: target.id,
    targetWord: target.word,
    interactionType: 'part_of_speech_id',
    serverAnswerKey: correctKey,
    skill: 'vocabulary',
    cefrLevel: target.cefr_level,
    type: 'multiple_choice',
    promptEn: `In the sentence below, what part of speech is the word "${target.word}"?`,
    promptTh: `In the sentence below, what part of speech is the word "${target.word}"?`,
    contextPassage: `"${target.example_sentence_en}"`,
    options,
    explanationEn: `"${target.word}" functions as a ${correctPos} in this context.`,
    explanationTh: `"${target.word}" functions as a ${correctPos} in this context.`,
    weaknessTag: 'grammar_part_of_speech',
    difficultyWeight: 2,
  };
}

/**
 * Question Type 6: Pronunciation & IPA Identification
 */
function createPronunciationQuestion(target: ProductionVocabularyRecord): GeneratedVocabQuestion {
  const distractors = getDistractors(target, 'ipa', 3);
  const allTexts = [target.ipa, ...distractors].sort(() => 0.5 - Math.random());
  const correctIndex = allTexts.indexOf(target.ipa);
  const correctKey = OPTION_KEYS[correctIndex];

  const options: QuestionOption[] = allTexts.map((text, idx) => ({
    key: OPTION_KEYS[idx],
    text,
    isCorrect: idx === correctIndex,
    feedbackTh: idx === correctIndex ? 'Correct!' : `Standard IPA for "${target.word}" is ${target.ipa}`,
  }));

  return {
    id: `vq_pr_${target.id}_${Date.now()}`,
    targetWordId: target.id,
    targetWord: target.word,
    interactionType: 'pronunciation_stress',
    serverAnswerKey: correctKey,
    skill: 'vocabulary',
    cefrLevel: target.cefr_level,
    type: 'multiple_choice',
    promptEn: `Which phonetic transcription (IPA) matches the correct pronunciation of "${target.word}"?`,
    promptTh: `Which phonetic transcription (IPA) matches the correct pronunciation of "${target.word}"?`,
    options,
    explanationEn: `The verified standard pronunciation for "${target.word}" is ${target.ipa}.`,
    explanationTh: `การออกเสียงที่ถูกต้องตามพจนานุกรมสากลของ "${target.word}" คือ ${target.ipa}`,
    weaknessTag: 'pronunciation_phonetics',
    difficultyWeight: 3,
  };
}

/**
 * Master generator function for a target vocabulary word.
 */
export function generateQuestionForWord(
  target: ProductionVocabularyRecord,
  preferredType?: VocabularyQuestionInteractionType
): GeneratedVocabQuestion {
  const type = preferredType || getRandomInteractionType(target);

  switch (type) {
    case 'reverse_meaning':
      return createReverseMeaningQuestion(target);
    case 'sentence_completion':
      return createSentenceCompletionQuestion(target);
    case 'collocation_matching':
      return target.collocations && target.collocations.length > 0
        ? createCollocationQuestion(target)
        : createMeaningRecognitionQuestion(target);
    case 'part_of_speech_id':
      return createPosQuestion(target);
    case 'pronunciation_stress':
      return createPronunciationQuestion(target);
    case 'meaning_recognition':
    default:
      return createMeaningRecognitionQuestion(target);
  }
}

function getRandomInteractionType(target: ProductionVocabularyRecord): VocabularyQuestionInteractionType {
  const weights: { type: VocabularyQuestionInteractionType; weight: number }[] = [
    { type: 'meaning_recognition', weight: 35 },
    { type: 'sentence_completion', weight: 30 },
    { type: 'reverse_meaning', weight: 15 },
    { type: 'collocation_matching', weight: target.collocations?.length ? 10 : 0 },
    { type: 'part_of_speech_id', weight: 5 },
    { type: 'pronunciation_stress', weight: 5 },
  ];

  const total = weights.reduce((acc, w) => acc + w.weight, 0);
  let rand = Math.random() * total;
  for (const item of weights) {
    if (rand < item.weight) return item.type;
    rand -= item.weight;
  }
  return 'meaning_recognition';
}

/**
 * Strips secret answer key and correctness booleans from questions before sending to client.
 */
export function sanitizeQuestionForClient(q: GeneratedVocabQuestion): ClientSanitizedVocabQuestion {
  return {
    id: q.id,
    skill: 'vocabulary',
    cefrLevel: q.cefrLevel,
    type: q.type,
    interactionType: q.interactionType,
    promptTh: q.promptTh,
    promptEn: q.promptEn,
    contextPassage: q.contextPassage,
    targetWord: q.targetWord,
    options: (q.options || []).map((opt) => ({
      key: opt.key,
      text: opt.text,
    })),
    difficultyWeight: q.difficultyWeight,
  };
}

/**
 * Generate a practice quiz session with N questions.
 */
export function generatePracticeSession(params: {
  cefrLevel?: CEFRLevel;
  count?: number;
  wordIds?: string[];
  types?: VocabularyQuestionInteractionType[];
}): {
  questions: GeneratedVocabQuestion[];
  clientQuestions: ClientSanitizedVocabQuestion[];
} {
  const count = Math.max(1, Math.min(20, params.count || 5));
  let targets: ProductionVocabularyRecord[] = [];

  if (params.wordIds && params.wordIds.length > 0) {
    for (const wid of params.wordIds) {
      const w = getProductionVocabularyById(wid);
      if (w) targets.push(w);
    }
  }

  if (targets.length < count) {
    const level = params.cefrLevel || 'B1';
    const pool = getProductionVocabularyByCefr(level);
    const fallback = pool.length > 0 ? pool : getAllProductionVocabulary();
    const remaining = count - targets.length;
    const shuffled = [...fallback].sort(() => 0.5 - Math.random());
    targets.push(...shuffled.slice(0, remaining));
  }

  const allowedTypes = params.types && params.types.length > 0 ? params.types : undefined;
  const questions: GeneratedVocabQuestion[] = targets.slice(0, count).map((t, idx) => {
    const prefType = allowedTypes ? allowedTypes[idx % allowedTypes.length] : undefined;
    return generateQuestionForWord(t, prefType);
  });

  return {
    questions,
    clientQuestions: questions.map(sanitizeQuestionForClient),
  };
}
