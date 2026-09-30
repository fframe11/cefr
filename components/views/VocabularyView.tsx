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
  TactileButton,
} from '../ui';
import { useTranslation } from '../../i18n';
import { ExtendedUniverseView } from '../vocabulary/ExtendedUniverseView';

interface VocabularyViewProps {
  masteredWordIds?: string[];
  onToggleMastery?: (wordId: string, isMastered: boolean) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  masteredWordIds = [],
  onToggleMastery,
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
    setLoading(true);
    setError(null);
    try {
      const res = await getVocabulary({
        cefr_level: selectedLevel === 'ALL' ? undefined : selectedLevel,
        part_of_speech: selectedPos === 'ALL' ? undefined : selectedPos.toLowerCase(),
        search: searchQuery.trim() || undefined,
        page: 1,
        limit: 100,
      });

      if (res && res.items && res.items.length > 0) {
        const mapped = res.items.map((dto) => mapVocabularyDtoToWord(dto, masteredWordIds));
        setWords(mapped);
        if (res.pagination?.total) {
          setTotalCatalogCount(res.pagination.total);
        }
      } else {
        const fallback = VOCABULARY_BANK.filter((w) => {
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
        setWords(fallback);
      }
    } catch (err: any) {
      console.warn('[VocabularyView] API fetch failed, falling back to static vocabulary:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดข้อมูลคำศัพท์จากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setWords(VOCABULARY_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedPos, searchQuery, masteredWordIds]);

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
      const distractors = shuffledOthers.slice(0, 3).map((w) => w.meaningTh);
      const allChoices = [target.meaningTh, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({
        id: `vq_local_${target.id}_${Date.now()}`,
        skill: 'vocabulary',
        cefrLevel: target.cefrLevel,
        type: 'multiple_choice',
        interactionType: 'meaning_recognition',
        promptEn: `What is the meaning of "${target.word}"?`,
        promptTh: `คำว่า "${target.word}" มีความหมายตรงกับข้อใด?`,
        contextPassage: target.exampleSentenceEn ? `"${target.exampleSentenceEn}"` : undefined,
        targetWord: target.word,
        options: allChoices.map((text, idx) => ({
          key: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
          text,
        })),
        difficultyWeight: 2,
      });

      // 4 additional questions from level pool
      for (let i = 0; i < Math.min(4, shuffledOthers.length); i++) {
        const cur = shuffledOthers[i];
        const rest = pool.filter((w) => w.id !== cur.id);
        const d = rest.slice(0, 3).map((w) => w.meaningTh);
        const c = [cur.meaningTh, ...d].sort(() => 0.5 - Math.random());
        questions.push({
          id: `vq_local_${cur.id}_${Date.now()}_${i + 1}`,
          skill: 'vocabulary',
          cefrLevel: cur.cefrLevel,
          type: 'multiple_choice',
          interactionType: 'meaning_recognition',
          promptEn: `What is the meaning of "${cur.word}"?`,
          promptTh: `คำว่า "${cur.word}" มีความหมายตรงกับข้อใด?`,
          contextPassage: cur.exampleSentenceEn ? `"${cur.exampleSentenceEn}"` : undefined,
          targetWord: cur.word,
          options: c.map((text, idx) => ({
            key: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
            text,
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
    AudioService.speak(word, { lang: 'en-GB', rate: 0.9 });
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
      const correctOpt = currentQ.options.find((opt) => opt.text === targetObj?.meaningTh) || currentQ.options[0];
      const isCorrect = optionKey === correctOpt.key;

      setAnswerResult({
        question_id: currentQ.id,
        target_word_id: currentQ.targetWord || currentWord?.id || '',
        selected_key: optionKey,
        correct_key: correctOpt.key,
        is_correct: isCorrect,
        explanation_th: `ความหมายของ "${currentQ.targetWord || currentWord?.word}" คือ "${targetObj?.meaningTh || correctOpt.text}"`,
        explanation_en: `"${currentQ.targetWord || currentWord?.word}" means "${targetObj?.meaningEn || 'correct option'}"`,
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
    <div className="w-full space-y-6 pb-16">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GlovaSectionHeader
          eyebrow="ACTIVE VOCABULARY LAB"
          title={isEn ? 'CEFR Vocabulary Lab & Active Review' : 'คลังคำศัพท์และการจำแบบ Spaced Repetition'}
          description={
            isEn
              ? 'Study 3,860 verified vocabulary units with native phonetic stress, contextual examples, collocations, and server-graded practice.'
              : 'เรียนรู้คำศัพท์มาตรฐาน 3,860 คำที่ผ่านการตรวจสอบ พร้อมเสียงอ่านและสัทศาสตร์ บริบทการใช้งานจริง และโหมดทดสอบความจำ'
          }
        />

        {/* Status Indicators & View Mode Toggle */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
          {/* Mastered Counter */}
          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-medium text-foreground flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span>{isEn ? 'Mastered:' : 'เชี่ยวชาญแล้ว:'}</span>
            <span className="font-bold text-emerald-500">
              {isEn ? `${masteredWordIds.length} words` : `${masteredWordIds.length} คำ`}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('study')}
              className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'study'
                  ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20'
                  : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
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
              className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'practice'
                  ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20'
                  : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
              }`}
              aria-label={isEn ? 'Quick Practice' : 'โหมดทดสอบความจำ'}
            >
              <BrainCircuit className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Practice Quiz' : 'โหมดฝึกจำ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('browse')}
              className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'browse'
                  ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20'
                  : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
              }`}
              aria-label={isEn ? 'Browse Word Bank' : 'โหมดคลังคำศัพท์'}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Word Bank' : 'คลังรายการ'}</span>
            </button>
          
            <button
              type="button"
              onClick={() => setViewMode('universe')}
              className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'universe'
                  ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20'
                  : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
              }`}
              aria-label={isEn ? 'Lexical Universe' : 'คลังจักรวาลศัพท์ 121k'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{isEn ? 'Lexical Universe (121k)' : 'จักรวาลศัพท์ 121k'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level & POS Filter Bar */}
      {viewMode !== 'universe' && (
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 shadow-xs">
        {/* CEFR Level Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-muted-foreground font-bold flex items-center gap-1 mr-1 shrink-0">
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
              className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-[#5B5CE2] text-white border-t border-white/20 shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none'
                  : 'bg-slate-100 hover:bg-indigo-50 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318] active:translate-y-[2px] active:shadow-none'
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
            className="px-2.5 py-1.5 rounded-lg bg-background border border-border/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{isEn ? 'All Parts of Speech' : 'ทุกชนิดคำ'}</option>
            <option value="noun">{isEn ? 'Nouns' : 'คำนาม'}</option>
            <option value="verb">{isEn ? 'Verbs' : 'คำกริยา'}</option>
            <option value="adjective">{isEn ? 'Adjectives' : 'คำคุณศัพท์'}</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[180px] sm:min-w-[220px] w-full">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder={isEn ? 'Search word, Thai meaning...' : 'ค้นหาคำศัพท์ หรือความหมายไทย...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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

      {/* Error State */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchVocabularyData}
        />
      )}

      {/* Empty State */}
      {!loading && viewMode !== 'universe' && filteredWords.length === 0 && (
        <EmptyState
          title={isEn ? 'No matching vocabulary found' : 'ไม่พบคำศัพท์ที่ตรงกับการค้นหา'}
          description={
            isEn
              ? 'Try adjusting your CEFR level filter, part of speech, or search keywords.'
              : 'ลองปรับตัวกรองระดับ CEFR หรือคำค้นหาเพื่อเข้าถึงคำศัพท์อื่น'
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
              {isEn ? 'Reset Filter' : 'ล้างตัวกรอง'}
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
                  {isEn ? currentPracticeQ.promptEn : currentPracticeQ.promptTh}
                </h3>
                {currentPracticeQ.contextPassage && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-sm font-medium text-foreground italic">
                    {currentPracticeQ.contextPassage}
                  </div>
                )}
              </div>

              {/* Multiple Choice Options with Uiverse tactile press */}
              <div className="grid grid-cols-1 gap-3">
                {currentPracticeQ.options.map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  let optionStyle =
                    'bg-slate-50 hover:bg-indigo-50/70 dark:bg-[#1C2430] dark:hover:bg-[#253040] border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#EDEBE8] shadow-[0_4px_0_0_#CBD5E1] dark:shadow-[0_4px_0_0_#0D1318] active:translate-y-[4px] active:shadow-none';

                  if (answerResult) {
                    if (opt.key === answerResult.correct_key) {
                      optionStyle =
                        'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20 shadow-[0_4px_0_0_#059669]';
                    } else if (isSelected && !answerResult.is_correct) {
                      optionStyle =
                        'bg-rose-500/15 border-2 border-rose-500 text-rose-800 dark:text-rose-200 font-bold ring-2 ring-rose-500/20 shadow-[0_4px_0_0_#E11D48]';
                    } else {
                      optionStyle = 'opacity-40 border-2 border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-[#141A22]/50 text-slate-400 dark:text-[#94A3B8] shadow-none';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-[#5B5CE2]/15 border-2 border-[#5B5CE2] text-[#5B5CE2] dark:text-[#A5A6F6] font-bold ring-2 ring-[#5B5CE2]/20 shadow-[0_4px_0_0_#38399E] active:translate-y-[4px] active:shadow-none';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={Boolean(selectedOption) || isSubmittingAnswer}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-white dark:bg-[#1C2430] flex items-center justify-center text-xs font-mono font-bold text-slate-900 dark:text-[#EDEBE8] shrink-0 border border-slate-200 dark:border-white/10">
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
                explanation={answerResult?.explanation_th || answerResult?.explanation_en}
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
                      ? 'CONTINUE'
                      : 'ข้อถัดไป'
                    : isEn
                    ? 'FINISH SESSION'
                    : 'เสร็จสิ้นการฝึก'
                }
              />
            </GlovaCard>
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-border/60 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {isEn ? 'Practice session completed!' : 'จบแบบฝึกจำชุดนี้เรียบร้อยแล้ว!'}
              </p>
              <GlovaButton variant="primary" size="sm" onClick={() => startPracticeSession()}>
                {isEn ? 'Start Next Session' : 'เริ่มฝึกชุดใหม่'}
              </GlovaButton>
            </div>
          )}
        </div>
      )}

      {/* 3. MODE: Active Study Mode (Flashcard & Pronunciation) */}
      {!loading && viewMode === 'study' && currentWord && (
        <div className="max-w-2xl mx-auto space-y-4">
          <GlovaCard
            variant="bubble"
            elevation="bubble"
            className="min-h-[400px] p-6 sm:p-9 flex flex-col justify-between transition-all relative overflow-hidden"
          >
            {/* Card Header Context */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentWord.cefrLevel} size="sm" />
                <GlovaBadge variant="secondary" size="sm" className="capitalize rounded-full px-2.5">
                  {currentWord.partOfSpeech}
                </GlovaBadge>
                {currentWord.topic && (
                  <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
                    {isEn ? `Topic: ${currentWord.topic}` : `หมวด: ${currentWord.topic}`}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono font-semibold text-slate-700 dark:text-[#94A3B8] bg-slate-100 dark:bg-[#1C2430] px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                {isEn
                  ? `Word ${currentIndex + 1} of ${filteredWords.length}`
                  : `คำที่ ${currentIndex + 1} / ${filteredWords.length}`}
              </div>
            </div>

            {/* Word Central Area - Word as the Hero */}
            <div className="py-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-[#EDEBE8] tracking-tight font-sans">
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
                  className="touch-target w-12 h-12 rounded-2xl bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white flex items-center justify-center transition-all shadow-[0_3.5px_0_0_#38399E] active:translate-y-[3.5px] active:shadow-none border-t border-white/25 shrink-0"
                >
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {currentWord.ipa && (
                <div className="inline-block px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#1C2430] text-xs font-mono font-medium text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
                  {currentWord.ipa}
                </div>
              )}

              {/* Immediate Meaning & Definition (ADHD-Friendly: Zero Friction, Direct Display) */}
              <div className="pt-4 space-y-4 animate-in fade-in duration-150">
                {/* Thai Meaning Highlight & English Definition */}
                <div className="p-5 sm:p-6 rounded-[24px] bg-indigo-50/80 dark:bg-[#1C2430] border border-indigo-200/90 dark:border-white/10 space-y-1.5 text-center shadow-xs">
                  <div className="text-[11px] font-bold text-[#5B5CE2] dark:text-[#A5A6F6] uppercase tracking-wider">
                    {isEn ? 'Meaning in Thai' : 'ความหมายภาษาไทย'}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#5B5CE2] dark:text-[#A5A6F6]">
                    {currentWord.meaningTh}
                  </h3>
                  {currentWord.meaningEn && (
                    <p className="text-xs sm:text-sm text-[#6E6870] dark:text-[#94A3B8] leading-relaxed font-medium pt-1">
                      {currentWord.meaningEn}
                    </p>
                  )}
                </div>

                {/* Example in Context */}
                {(currentWord.exampleSentenceEn || currentWord.exampleSentenceTh) && (
                  <div className="p-5 rounded-[22px] bg-amber-50/70 dark:bg-[#1C2430] border border-amber-200/90 dark:border-white/10 text-left space-y-2 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {isEn ? 'Example sentence in context:' : 'ตัวอย่างประโยคในบริบทจริง:'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-foreground font-semibold leading-relaxed">
                      {currentWord.exampleSentenceEn}
                    </p>
                    {currentWord.exampleSentenceTh && (
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {currentWord.exampleSentenceTh}
                      </p>
                    )}
                  </div>
                )}

                {/* Collocations */}
                {currentWord.collocations && currentWord.collocations.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs text-muted-foreground font-bold mr-1">Collocations:</span>
                    {currentWord.collocations.map((c, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-[#1C2430] text-xs font-mono font-bold text-emerald-800 dark:text-[#EDEBE8] border border-emerald-200 dark:border-white/10 shadow-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Test Prompt (3D Tactile Button) */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('practice');
                      startPracticeSession(currentWord.word || currentWord.id);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_4px_0_0_#38399E] active:translate-y-[4px] active:shadow-none border-t border-white/20 cursor-pointer"
                  >
                    <BrainCircuit className="w-4 h-4" aria-hidden="true" />
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
          </GlovaCard>
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
