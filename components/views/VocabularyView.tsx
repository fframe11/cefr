'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VOCABULARY_BANK } from '../../data/vocabularyBank';
import { VocabularyWord, CEFRLevel } from '../../types';
import {
  Volume2,
  Search,
  Filter,
  CheckCircle,
  RotateCw,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Check,
  BrainCircuit,
  Award,
  ArrowRight,
  HelpCircle,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import {
  getVocabulary,
  mapVocabularyDtoToWord,
  getVocabularyQuestions,
  submitVocabularyAnswer,
  ClientVocabularyQuestionDTO,
  VocabularyAnswerSubmissionResult,
} from '../../lib/api/content/vocabulary';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import {
  GlovaSectionHeader,
  GlovaLevelBadge,
  GlovaButton,
  GlovaIconButton,
  GlovaBadge,
  GlovaCard,
  GlovaCardContent,
  LessonFeedbackDrawer,
} from '../ui';
import { useTranslation } from '../../i18n';
import { ExtendedUniverseView } from '../vocabulary/ExtendedUniverseView';

interface VocabularyViewProps {
  masteredWordIds?: string[];
  onToggleMastery?: (wordId: string, isMastered: boolean) => void;
  embedded?: boolean;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  masteredWordIds = [],
  onToggleMastery,
  embedded = false,
}) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'study' | 'practice' | 'browse' | 'universe'>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Content API State
  const [words, setWords] = useState<VocabularyWord[]>(VOCABULARY_BANK);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(3860);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Practice Mode State
  const [practiceQuestions, setPracticeQuestions] = useState<ClientVocabularyQuestionDTO[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<VocabularyAnswerSubmissionResult | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [totalXpGained, setTotalXpGained] = useState(0);
  const [practiceLoading, setPracticeLoading] = useState(false);

  const fetchVocabularyData = useCallback(async () => {
    setError(null);
    try {
      const res = await getVocabulary({
        cefr_level: selectedLevel === 'ALL' ? undefined : selectedLevel,
        part_of_speech: selectedPos === 'ALL' ? undefined : selectedPos.toLowerCase(),
        page: 1,
        limit: 100,
      });

      if (res && res.items && res.items.length > 0) {
        const mapped = res.items.map((dto) => mapVocabularyDtoToWord(dto, masteredWordIds));
        setWords(mapped);
        if (res.pagination?.total) {
          setTotalCatalogCount(res.pagination.total);
        }
      }
    } catch (err: any) {
      console.warn('[VocabularyView] API fetch failed, using instant local vocabulary catalog:', err?.message || err);
      // Resilient silent fallback to instant local verified catalog
      if (words.length === 0) {
        setWords(VOCABULARY_BANK);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedPos, masteredWordIds, words.length]);

  useEffect(() => {
    fetchVocabularyData();
  }, [fetchVocabularyData]);

  // Generate instant resilient local questions for zero loading lag and 100% offline/ADHD responsiveness
  const generateResilientQuestions = useCallback(
    (targetWordOrId?: string): ClientVocabularyQuestionDTO[] => {
      const pool = words.length >= 4 ? words : VOCABULARY_BANK;
      const target = targetWordOrId
        ? pool.find(
            (w) =>
              w.id === targetWordOrId ||
              w.word.toLowerCase() === targetWordOrId.toLowerCase()
          ) || pool[0]
        : pool[Math.floor(Math.random() * pool.length)];

      const otherWords = pool.filter((w) => w.id !== target.id);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const questions: ClientVocabularyQuestionDTO[] = [];

      // Primary target word question
      const targetMeaning = target.meaningEn || target.meaningTh;
      const distractors = shuffledOthers.slice(0, 3).map((w) => w.meaningEn || w.meaningTh);
      const allChoices = [targetMeaning, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({
        id: `vq_local_${target.id}_${Date.now()}`,
        skill: 'vocabulary',
        cefrLevel: target.cefrLevel,
        type: 'multiple_choice',
        interactionType: 'meaning_recognition',
        promptEn: `What is the meaning of "${target.word}"?`,
        promptTh: `What is the meaning of "${target.word}"?`,
        contextPassage: target.exampleSentenceEn ? `"${target.exampleSentenceEn}"` : undefined,
        targetWord: target.word,
        options: allChoices.map((text, idx) => ({
          key: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
          text,
          isCorrect: text === targetMeaning,
        })),
        difficultyWeight: 2,
      });

      // 4 additional questions from level pool
      for (let i = 0; i < Math.min(4, shuffledOthers.length); i++) {
        const cur = shuffledOthers[i];
        const rest = pool.filter((w) => w.id !== cur.id);
        const curMeaning = cur.meaningEn || cur.meaningTh;
        const d = rest.slice(0, 3).map((w) => w.meaningEn || w.meaningTh);
        const c = [curMeaning, ...d].sort(() => 0.5 - Math.random());
        questions.push({
          id: `vq_local_${cur.id}_${Date.now()}_${i + 1}`,
          skill: 'vocabulary',
          cefrLevel: cur.cefrLevel,
          type: 'multiple_choice',
          interactionType: 'meaning_recognition',
          promptEn: `What is the meaning of "${cur.word}"?`,
          promptTh: `What is the meaning of "${cur.word}"?`,
          contextPassage: cur.exampleSentenceEn ? `"${cur.exampleSentenceEn}"` : undefined,
          targetWord: cur.word,
          options: c.map((text, idx) => ({
            key: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
            text,
            isCorrect: text === curMeaning,
          })),
          difficultyWeight: 2,
        });
      }

      return questions;
    },
    [words]
  );

  // Load Practice Questions when entering practice mode
  const startPracticeSession = useCallback(
    async (targetWordId?: string) => {
      setPracticeLoading(true);
      setSelectedOption(null);
      setAnswerResult(null);
      setPracticeIndex(0);

      try {
        const res = await getVocabularyQuestions({
          cefr_level: selectedLevel === 'ALL' ? undefined : selectedLevel,
          count: 5,
          word_ids: targetWordId,
        });

        if (res && res.questions && res.questions.length > 0) {
          setPracticeQuestions(res.questions);
          return;
        }
      } catch (err) {
        console.warn('[VocabularyView] Failed to fetch practice questions, using resilient instant quiz:', err);
      } finally {
        setPracticeLoading(false);
      }

      // Instant resilient fallback
      setPracticeQuestions(generateResilientQuestions(targetWordId));
    },
    [selectedLevel, generateResilientQuestions]
  );

  useEffect(() => {
    if (viewMode === 'practice' && practiceQuestions.length === 0) {
      startPracticeSession();
    }
  }, [viewMode, practiceQuestions.length, startPracticeSession]);

  // Filtered words based on current selection
  const filteredWords = words.filter((w) => {
    const matchesLevel = selectedLevel === 'ALL' || w.cefrLevel === selectedLevel;
    const matchesPos = selectedPos === 'ALL' || w.partOfSpeech.toLowerCase() === selectedPos.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      w.word.toLowerCase().includes(q) ||
      w.meaningTh.toLowerCase().includes(q) ||
      w.topic.toLowerCase().includes(q);
    return matchesLevel && matchesPos && matchesSearch;
  });

  const currentWord = filteredWords[currentIndex] || filteredWords[0];
  const isMastered = currentWord ? masteredWordIds.includes(currentWord.id) : false;

  const handleSpeak = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    AudioService.speak(word, { lang: 'en-GB', rate: 1.0 });
  };

  const handleNext = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
  };

  const handlePrev = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, filteredWords.length)) % Math.max(1, filteredWords.length));
  };

  // Keyboard navigation for active study
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'study') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsRevealed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredWords.length]);

  // Handle Practice Answer Submission
  const handleSelectOption = async (optionKey: string) => {
    if (selectedOption || isSubmittingAnswer) return;
    const currentQ = practiceQuestions[practiceIndex];
    if (!currentQ) return;

    setSelectedOption(optionKey);
    setIsSubmittingAnswer(true);

    try {
      const result = await submitVocabularyAnswer({
        question_id: currentQ.id,
        selected_key: optionKey,
        target_word_id: currentQ.targetWord,
      });

      setAnswerResult(result);

      if (result.is_correct) {
        setPracticeScore((prev) => prev + 1);
        setPracticeStreak((prev) => prev + 1);
        setTotalXpGained((prev) => prev + 10);
      } else {
        setPracticeStreak(0);
        setTotalXpGained((prev) => prev + 2);
      }
    } catch (err) {
      console.warn('[VocabularyView] Failed to submit answer to server, evaluating locally with dictionary match:', err);
      // High-fidelity fallback evaluation based on word bank dictionary
      const pool = words.length > 0 ? words : VOCABULARY_BANK;
      const targetObj = pool.find((w) => w.word.toLowerCase() === currentQ.targetWord?.toLowerCase());
      const correctOpt = currentQ.options.find((opt: any) => opt.isCorrect || opt.text === targetObj?.meaningEn || opt.text === targetObj?.meaningTh) || currentQ.options[0];
      const isCorrect = optionKey === correctOpt.key;

      setAnswerResult({
        question_id: currentQ.id,
        target_word_id: currentQ.targetWord || currentWord?.id || '',
        selected_key: optionKey,
        correct_key: correctOpt.key,
        is_correct: isCorrect,
        explanation_th: `ความหมายของ "${currentQ.targetWord || currentWord?.word}" คือ "${targetObj?.meaningTh || ''}"`,
        explanation_en: `"${currentQ.targetWord || currentWord?.word}" means "${targetObj?.meaningEn || correctOpt.text}"`,
      });

      if (isCorrect) {
        setPracticeScore((prev) => prev + 1);
        setPracticeStreak((prev) => prev + 1);
        setTotalXpGained((prev) => prev + 10);
      } else {
        setPracticeStreak(0);
        setTotalXpGained((prev) => prev + 2);
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextPracticeQuestion = () => {
    if (practiceIndex + 1 < practiceQuestions.length) {
      setPracticeIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerResult(null);
    } else {
      // Re-fetch next 5 questions
      startPracticeSession();
    }
  };

  const currentPracticeQ = practiceQuestions[practiceIndex];

  return (
    <div className={`w-full space-y-6 ${embedded ? 'pb-8' : 'pb-16'}`}>
      {/* 1. TOP SUB-NAV BAR (EduMaster Style) */}
      {!embedded ? (
        <nav
          aria-label="Vocabulary sub-navigation"
          className="w-full bg-[#FAF8F3] dark:bg-[#1E1B28] backdrop-blur-md rounded-[28px] p-3 sm:p-4 border border-[#EAE4D5] dark:border-white/10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 shadow-sm"
        >
          {/* Brand & Studio Identity */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-sm shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  Vocabulary Studio
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                  ACTIVE VOCABULARY LAB // 3,860 WORDS
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block mx-1" />

            {/* Mode Switcher Pills */}
            <div className="flex items-center p-1 rounded-full bg-white dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('study')}
                className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'study'
                    ? 'bg-[#FA5D5D] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
                aria-label={isEn ? 'Study Flashcards' : 'โหมดการ์ดคำศัพท์'}
              >
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEn ? 'Flashcards' : 'การ์ดคำศัพท์'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('practice');
                  if (practiceQuestions.length === 0) startPracticeSession();
                }}
                className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'practice'
                    ? 'bg-[#FA5D5D] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
                aria-label={isEn ? 'Quick Practice' : 'โหมดทดสอบความจำ'}
              >
                <BrainCircuit className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEn ? 'Practice Quiz' : 'โหมดฝึกจำ'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('browse')}
                className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'browse'
                    ? 'bg-[#FA5D5D] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
                aria-label={isEn ? 'Browse Word Bank' : 'โหมดคลังคำศัพท์'}
              >
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEn ? 'Word Bank' : 'คลังรายการ'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('universe')}
                className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'universe'
                    ? 'bg-[#FA5D5D] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
                aria-label={isEn ? 'Lexical Universe' : 'คลังจักรวาลศัพท์'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>{isEn ? 'Lexical Universe' : 'คลังจักรวาลศัพท์'}</span>
              </button>
            </div>
          </div>

          {/* Mastered Counter Capsule & Spaced Repetition Indicator */}
          <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
            <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Mastered:' : 'เชี่ยวชาญแล้ว:'}</span>
              <span className="font-black text-slate-950 dark:text-white">
                {`${masteredWordIds.length} ${isEn ? 'words' : 'คำ'}`}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPACED REPETITION ENGINE</span>
            </div>
          </div>
        </nav>
      ) : (
        <div className="flex items-center justify-between gap-3 flex-wrap pb-1">
          {/* Mode Switcher Pills */}
          <div className="flex items-center p-1 rounded-full bg-white dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('study')}
              className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'study'
                  ? 'bg-[#FA5D5D] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Flashcards' : 'การ์ดคำศัพท์'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('practice');
                if (practiceQuestions.length === 0) startPracticeSession();
              }}
              className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'practice'
                  ? 'bg-[#FA5D5D] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Practice Quiz' : 'โหมดฝึกจำ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('browse')}
              className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'browse'
                  ? 'bg-[#FA5D5D] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Word Bank' : 'คลังรายการ'}</span>
            </button>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? 'Mastered:' : 'เชี่ยวชาญแล้ว:'}</span>
            <span className="font-black text-slate-950 dark:text-white">
              {`${masteredWordIds.length} ${isEn ? 'words' : 'คำ'}`}
            </span>
          </div>
        </div>
      )}

      {/* Main Title & Hero Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {isEn ? 'CEFR Vocabulary Lab & Spaced Review' : 'คลังคำศัพท์และการจำแบบ Spaced Repetition'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-sans">
          {isEn
            ? 'Study 3,860 verified vocabulary units with native phonetic stress, contextual examples, collocations, and server-graded practice.'
            : 'เรียนรู้คำศัพท์คัดสรร 3,860 คำที่ผ่านการตรวจสอบ พร้อมเสียงอ่านและสัทศาสตร์ บริบทการใช้งานจริง และโหมดทดสอบความจำ'}
        </p>
      </div>

      {/* Level & POS Filter Bar */}
      {viewMode !== 'universe' && (
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-200">
        {/* CEFR Level Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? 'Level:' : 'ระดับ:'}</span>
          </span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setIsRevealed(false);
              }}
              className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#FA5D5D] text-white shadow-xs'
                  : 'bg-[#FAF8F3] hover:bg-[#F3EFE6] dark:bg-[#252131] dark:hover:bg-[#2E293D] text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10'
              }`}
            >
              {lvl === 'ALL' ? (isEn ? 'All' : 'ทั้งหมด') : `CEFR ${lvl}`}
            </button>
          ))}
        </div>

        {/* POS Selector & Search Input */}
        <div className="flex items-center gap-2">
          {/* POS Selector */}
          <select
            value={selectedPos}
            onChange={(e) => {
              setSelectedPos(e.target.value);
              setCurrentIndex(0);
            }}
            aria-label={isEn ? 'Filter by part of speech' : 'กรองตามชนิดคำ'}
            className="px-3 py-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/20 cursor-pointer"
          >
            <option value="ALL">{isEn ? 'All Parts of Speech' : 'ทุกชนิดคำ'}</option>
            <option value="noun">{isEn ? 'Nouns' : 'คำนาม'}</option>
            <option value="verb">{isEn ? 'Verbs' : 'คำกริยา'}</option>
            <option value="adjective">{isEn ? 'Adjectives' : 'คำคุณศัพท์'}</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[180px] sm:min-w-[220px] w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder={isEn ? 'Search word, Thai meaning...' : 'ค้นหาคำศัพท์ หรือความหมายไทย...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/20"
            />
          </div>
        </div>
      </div>
      )}

      {/* Loading State */}
      {loading && words.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="กำลังโหลดคลังคำศัพท์..." />
        </div>
      )}

      {/* Error State: Only show if catalog is completely empty */}
      {error && words.length === 0 && (
        <ErrorMessage
          message={error}
          onRetry={fetchVocabularyData}
        />
      )}

      {/* Empty State */}
      {!loading && viewMode !== 'universe' && filteredWords.length === 0 && (
        <EmptyState
          title={isEn ? 'No matching vocabulary found' : 'ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา'}
          description={
            isEn
              ? 'No words match your current filters. Clear all filters to view the complete vocabulary repository.'
              : 'ยังไม่มีคำศัพท์ที่ตรงกับตัวกรองปัจจุบัน กดปุ่มด้านล่างเพื่อล้างตัวกรองและดูคำศัพท์ทั้งหมด'
          }
          action={
            <GlovaButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedLevel('ALL');
                setSelectedPos('ALL');
                setSearchQuery('');
              }}
            >
              {isEn ? 'Clear filters to view all words' : 'ล้างตัวกรองเพื่อดูคำศัพท์ทั้งหมด'}
            </GlovaButton>
          }
        />
      )}

      {/* 2. MODE: Interactive Practice Quiz (Spaced Review Learning Loop) */}
      {!loading && viewMode === 'practice' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
          {practiceLoading ? (
            <div className="min-h-[340px] flex items-center justify-center p-12 bg-card rounded-2xl border border-border/60">
              <LoadingSpinner size="md" text="กำลังเตรียมคำถามทดสอบความจำ..." />
            </div>
          ) : currentPracticeQ ? (
            <GlovaCard
              variant="bubble"
              elevation="bubble"
              className="p-6 sm:p-8 space-y-6"
            >
              {/* Practice Header with Streak & Score */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentPracticeQ.cefrLevel} size="sm" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {currentPracticeQ.interactionType.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {practiceStreak > 1 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{practiceStreak} Streak!</span>
                    </div>
                  )}
                  <div className="text-xs font-mono font-bold text-foreground">
                    Question {practiceIndex + 1} / {practiceQuestions.length}
                  </div>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {currentPracticeQ.promptEn || currentPracticeQ.promptTh}
                </h3>
                {currentPracticeQ.contextPassage && (
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-muted/40 border border-slate-200/80 dark:border-border/40 text-sm font-semibold text-slate-800 dark:text-foreground italic">
                    {currentPracticeQ.contextPassage}
                  </div>
                )}
              </div>

              {/* Multiple Choice Options with Mondly soft pill design */}
              <div className="grid grid-cols-1 gap-3">
                {currentPracticeQ.options.map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  let optionStyle =
                    'bg-slate-50 dark:bg-[#13111C]/60 hover:bg-slate-100 dark:hover:bg-[#252233] border border-slate-200 dark:border-border/80 text-slate-800 dark:text-slate-200';

                  if (answerResult) {
                    if (opt.key === answerResult.correct_key) {
                      optionStyle =
                        'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs';
                    } else if (isSelected && !answerResult.is_correct) {
                      optionStyle =
                        'bg-rose-500/10 border-2 border-rose-500 text-rose-800 dark:text-rose-300 font-bold shadow-xs';
                    } else {
                      optionStyle = 'opacity-40 border border-slate-200/60 dark:border-border/40 bg-slate-50/50 dark:bg-[#13111C]/30 text-slate-500';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-[#FA5D5D]/10 border-2 border-[#FA5D5D] text-[#FA5D5D] dark:text-[#FF8080] font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={Boolean(selectedOption) || isSubmittingAnswer}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                          isSelected
                            ? 'bg-[#FA5D5D] text-white border-[#FA5D5D]'
                            : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border-border/80'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="text-sm sm:text-base font-bold">{opt.text}</span>
                      </div>

                      {answerResult && opt.key === answerResult.correct_key && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
                      )}
                      {answerResult && isSelected && !answerResult.is_correct && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Duolingo-inspired Bottom Feedback Drawer */}
              <LessonFeedbackDrawer
                isOpen={Boolean(answerResult)}
                isCorrect={Boolean(answerResult?.is_correct)}
                explanation={
                  answerResult?.explanation_en
                    ? `${answerResult.explanation_en} (แปลไทย: ${answerResult.explanation_th})`
                    : answerResult?.explanation_th
                }
                correctAnswerText={
                  answerResult && !answerResult.is_correct
                    ? currentPracticeQ.options.find((o) => o.key === answerResult.correct_key)?.text
                    : undefined
                }
                xpEarned={practiceStreak > 2 ? 15 : 10}
                streakBonus={practiceStreak > 2}
                onContinue={handleNextPracticeQuestion}
                ctaText={
                  practiceIndex + 1 < practiceQuestions.length
                    ? isEn
                      ? 'CONTINUE TO NEXT QUESTION'
                      : 'ทำแบบทดสอบข้อถัดไป'
                    : isEn
                    ? 'VIEW PRACTICE SUMMARY'
                    : 'ดูสรุปผลการฝึกฝน'
                }
              />
            </GlovaCard>
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-border/60 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {isEn ? 'Practice session completed!' : 'จบแบบฝึกจำชุดนี้เรียบร้อยแล้ว!'}
              </p>
              <GlovaButton variant="primary" size="sm" onClick={() => startPracticeSession()}>
                {isEn ? 'Start Next Practice Set' : 'เริ่มฝึกคำศัพท์ชุดใหม่'}
              </GlovaButton>
            </div>
          )}
        </div>
      )}

      {/* 3. MODE: Active Study Mode (Flashcard & Pronunciation) */}
      {!loading && viewMode === 'study' && currentWord && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Authentic Outcrowd Mondly Vocabulary Studio Context Banner */}
          <div className="relative w-full aspect-[24/9] rounded-[22px] overflow-hidden border border-[#EAE4D5] dark:border-white/10 shadow-xs bg-slate-100 dark:bg-slate-800">
            <img
              src="/images/learning/vocab_hero.jpg"
              alt="Students collaborating and acquiring CEFR language vocabulary"
              width={800}
              height={300}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
              <span className="px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold border border-white/20">
                Active Lexical Acquisition
              </span>
              <span className="px-3 py-0.5 rounded-full bg-[#FA5D5D] text-white text-[11px] font-bold shadow-xs">
                CEFR {currentWord.cefrLevel} Studio
              </span>
            </div>
          </div>

          <div className="min-h-[400px] p-6 sm:p-9 flex flex-col justify-between transition-all relative overflow-hidden rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            {/* Card Header Context */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentWord.cefrLevel} size="sm" />
                <span className="capitalize rounded-full px-2.5 py-0.5 text-xs font-mono font-bold bg-[#FA5D5D]/15 text-[#FA5D5D] border border-[#FA5D5D]/30">
                  {currentWord.partOfSpeech}
                </span>
                {currentWord.topic && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                    {isEn ? `Topic: ${currentWord.topic}` : `หมวด: ${currentWord.topic}`}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-[#FAF8F3] dark:bg-[#252131] px-3 py-1 rounded-full border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                {isEn
                  ? `Word ${currentIndex + 1} of ${filteredWords.length}`
                  : `คำที่ ${currentIndex + 1} / ${filteredWords.length}`}
              </div>
            </div>

            {/* Word Central Area - Word as the Hero */}
            <div className="py-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                  {currentWord.word}
                </h2>
                <button
                  type="button"
                  onClick={(e) => handleSpeak(currentWord.word, e)}
                  aria-label={
                    isEn
                      ? `Listen to pronunciation for ${currentWord.word}`
                      : `ฟังการออกเสียงคำว่า ${currentWord.word}`
                  }
                  className="touch-target w-12 h-12 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 text-white" aria-hidden="true" />
                </button>
              </div>

              {currentWord.ipa && (
                <div className="inline-block px-3.5 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#252131] text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10">
                  {currentWord.ipa}
                </div>
              )}

              {/* Immediate Meaning & Definition */}
              <div className="pt-4 space-y-4 animate-in fade-in duration-150">
                {/* Thai Meaning Highlight & English Definition */}
                <div className="p-5 sm:p-6 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-1.5 text-center shadow-xs">
                  <div className="text-[11px] font-bold text-[#FA5D5D] uppercase tracking-wider font-mono">
                    {isEn ? 'Meaning in Thai' : 'ความหมายภาษาไทย'}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {currentWord.meaningTh}
                  </h3>
                  {currentWord.meaningEn && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pt-1">
                      {currentWord.meaningEn}
                    </p>
                  )}
                </div>

                {/* Example in Context */}
                {(currentWord.exampleSentenceEn || currentWord.exampleSentenceTh) && (
                  <div className="p-5 rounded-[22px] bg-[#FEF5E5] dark:bg-[#2B2010] border border-[#FDE5BC] dark:border-amber-500/20 text-left space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D98200] dark:text-[#FFBA38]">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {isEn ? 'Example sentence in context:' : 'ตัวอย่างประโยคในบริบทจริง:'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      {currentWord.exampleSentenceEn}
                    </p>
                    {currentWord.exampleSentenceTh && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {currentWord.exampleSentenceTh}
                      </p>
                    )}
                  </div>
                )}

                {/* Collocations */}
                {currentWord.collocations && currentWord.collocations.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mr-1">Collocations:</span>
                    {currentWord.collocations.map((c, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#252131] text-xs font-mono font-bold text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 shadow-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Test Prompt (Tactile Button) */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('practice');
                      startPracticeSession(currentWord.word || currentWord.id);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <BrainCircuit className="w-4 h-4 text-white" aria-hidden="true" />
                    <span>{isEn ? 'Test yourself on this word' : 'ทดสอบความจำคำนี้ทันที'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Mastery & Navigation */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <GlovaButton
                variant={isMastered ? 'primary' : 'outline'}
                size="sm"
                leftIcon={isMastered ? <Check className="w-4 h-4 text-white" aria-hidden="true" /> : <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
                onClick={() => onToggleMastery?.(currentWord.id, !isMastered)}
                className="rounded-full"
              >
                {isMastered
                  ? isEn
                    ? 'Mastered'
                    : 'จำได้แล้ว'
                  : isEn
                  ? 'Mark as Mastered'
                  : 'ทำเครื่องหมายว่าจำได้'}
              </GlovaButton>

              <div className="flex items-center gap-2">
                <GlovaButton
                  variant="secondary"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
                  onClick={handlePrev}
                  aria-label={isEn ? 'Previous word' : 'คำก่อนหน้า'}
                  className="rounded-full"
                >
                  <span className="hidden sm:inline">{isEn ? 'Previous' : 'ก่อนหน้า'}</span>
                </GlovaButton>
                <GlovaButton
                  variant="primary"
                  size="sm"
                  rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
                  onClick={handleNext}
                  aria-label={isEn ? 'Next word' : 'คำถัดไป'}
                  className="rounded-full"
                >
                  <span>{isEn ? 'Next Word' : 'คำถัดไป'}</span>
                </GlovaButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODE: Browse Word Bank Grid */}
      {!loading && viewMode === 'browse' && filteredWords.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-between px-1">
            <span>
              {isEn ? `Showing ${filteredWords.length} words` : `แสดง ${filteredWords.length} คำศัพท์`}
            </span>
            <span className="font-mono">
              {totalCatalogCount.toLocaleString()} {isEn ? 'verified catalog units' : 'คำในระบบคลัง'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredWords.map((w, idx) => {
              const mastered = masteredWordIds.includes(w.id);
              return (
                <GlovaCard
                  key={w.id}
                  elevation="subtle"
                  interactive
                  className="p-4 flex flex-col justify-between"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('study');
                    setIsRevealed(true);
                  }}
                >
                  <GlovaCardContent className="p-0 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GlovaLevelBadge level={w.cefrLevel} size="sm" />
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {w.partOfSpeech}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMastery?.(w.id, !mastered);
                        }}
                        className={`min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center rounded-md transition-colors ${
                          mastered ? 'text-emerald-500' : 'text-muted-foreground/40 hover:text-muted-foreground'
                        }`}
                        aria-label={
                          mastered
                            ? isEn
                              ? 'Mark as unmastered'
                              : 'บันทึกว่ายังจำไม่ได้'
                            : isEn
                            ? 'Mark as mastered'
                            : 'บันทึกว่าจำได้แล้ว'
                        }
                      >
                        <CheckCircle className="w-4 h-4 fill-current/10" aria-hidden="true" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-foreground">
                          {w.word}
                        </span>
                        <GlovaIconButton
                          icon={<Volume2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                          ariaLabel={
                            isEn ? `Listen to pronunciation for ${w.word}` : `ฟังเสียงคำว่า ${w.word}`
                          }
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleSpeak(w.word, e)}
                        />
                      </div>
                      {w.ipa && (
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {w.ipa}
                        </p>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-primary">
                      {isEn && w.meaningEn ? w.meaningEn : w.meaningTh}
                    </p>

                    {w.exampleSentenceEn && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 pt-1 border-t border-border/30">
                        {w.exampleSentenceEn}
                      </p>
                    )}
                  </GlovaCardContent>
                </GlovaCard>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MODE: Extended Lexical Universe (121k Candidates) */}
      {viewMode === 'universe' && (
        <ExtendedUniverseView isEn={isEn} />
      )}
    </div>
  );
};
