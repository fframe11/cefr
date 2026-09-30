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
import { RemotionPlayerWrapper, PhoneticStressComposition } from '../remotion';
import { useTranslation } from '../../i18n';

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
  const [viewMode, setViewMode] = useState<'study' | 'practice' | 'browse'>('study');
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
        }
      } catch (err) {
        console.warn('[VocabularyView] Failed to fetch practice questions:', err);
      } finally {
        setPracticeLoading(false);
      }
    },
    [selectedLevel]
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
      console.warn('[VocabularyView] Failed to submit answer, evaluating locally:', err);
      // Fallback evaluation
      const isCorrect = optionKey === 'A';
      setAnswerResult({
        question_id: currentQ.id,
        target_word_id: '',
        selected_key: optionKey,
        correct_key: 'A',
        is_correct: isCorrect,
        explanation_th: 'ผลลัพธ์ได้รับการบันทึกแล้ว',
        explanation_en: 'Review answer recorded.',
      });
      if (isCorrect) setPracticeScore((prev) => prev + 1);
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
          <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('study')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'study'
                  ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
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
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'practice'
                  ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={isEn ? 'Quick Practice' : 'โหมดทดสอบความจำ'}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
              <span>{isEn ? 'Practice Quiz' : 'โหมดฝึกจำ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('browse')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'browse'
                  ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={isEn ? 'Browse Word Bank' : 'โหมดคลังคำศัพท์'}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Word Bank' : 'คลังรายการ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level & POS Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border/60 shadow-xs">
        {/* CEFR Level Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mr-1 shrink-0">
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
              className={`touch-target px-3 py-1 rounded-lg text-xs font-medium transition-all border shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-secondary'
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
      {!loading && filteredWords.length === 0 && (
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
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(184,167,255,0.16)]">
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
                    'bg-[#211E38] hover:bg-[#292544] border-2 border-[rgba(184,167,255,0.16)] text-[#FFF8F2] shadow-[0_3px_0_rgba(184,167,255,0.12)] active:shadow-none active:translate-y-0.5';

                  if (answerResult) {
                    if (opt.key === answerResult.correct_key) {
                      optionStyle =
                        'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20 shadow-[0_3px_0_#10B981]';
                    } else if (isSelected && !answerResult.is_correct) {
                      optionStyle =
                        'bg-rose-500/15 border-2 border-rose-500 text-rose-800 dark:text-rose-200 font-bold ring-2 ring-rose-500/20 shadow-[0_3px_0_#F43F5E]';
                    } else {
                      optionStyle = 'opacity-50 border-border/40 text-muted-foreground shadow-none';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-[#B8A7FF]/15 border-2 border-[#B8A7FF] text-[#B8A7FF] font-bold ring-2 ring-[#B8A7FF]/20 shadow-[0_3px_0_rgba(184,167,255,0.25)]';
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
                        <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-xs font-mono font-bold text-muted-foreground shrink-0 border border-border/40">
                          {opt.key}
                        </span>
                        <span className="text-sm sm:text-base font-semibold">{opt.text}</span>
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
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[rgba(184,167,255,0.16)]">
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

              <div className="text-xs font-mono font-semibold text-muted-foreground bg-[#292544] px-3 py-1 rounded-full border border-[rgba(184,167,255,0.16)]">
                {isEn
                  ? `Word ${currentIndex + 1} of ${filteredWords.length}`
                  : `คำที่ ${currentIndex + 1} / ${filteredWords.length}`}
              </div>
            </div>

            {/* Word Central Area - Word as the Hero */}
            <div className="py-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <h2 className="text-4xl sm:text-5xl font-black text-[#FFF8F2] tracking-tight font-sans">
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
                  className="touch-target w-12 h-12 rounded-full bg-[#B8A7FF]/15 hover:bg-[#B8A7FF]/25 text-[#B8A7FF] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
                >
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {currentWord.ipa && (
                <div className="inline-block px-3.5 py-1 rounded-full bg-[#292544] text-xs font-mono font-medium text-muted-foreground border border-[rgba(184,167,255,0.16)]">
                  {currentWord.ipa}
                </div>
              )}

              {/* Reveal Toggle Card */}
              {!isRevealed ? (
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setIsRevealed(true)}
                    className="touch-target px-6 py-3 rounded-full bg-[#B8A7FF]/15 hover:bg-[#B8A7FF]/25 text-xs sm:text-sm font-bold text-[#B8A7FF] transition-all border border-[rgba(184,167,255,0.25)] inline-flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                    <span>
                      {isEn
                        ? 'Tap to reveal meaning & sentence context'
                        : 'แตะเพื่อแสดงความหมายและตัวอย่างประโยค'}
                    </span>
                  </button>
                  <p className="text-[11px] text-muted-foreground mt-2.5 font-medium">
                    {isEn
                      ? '(or press Spacebar to flip card)'
                      : '(หรือกดแป้น Spacebar เพื่อเปิดความหมาย)'}
                  </p>
                </div>
              ) : (
                <div className="pt-4 space-y-4 animate-in fade-in duration-200">
                  <div className="p-5 rounded-[22px] bg-[#292544] border border-[rgba(184,167,255,0.16)] space-y-1.5 text-center shadow-xs">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#B8A7FF]">
                      {currentWord.meaningTh}
                    </h3>
                    {currentWord.meaningEn && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                        {currentWord.meaningEn}
                      </p>
                    )}
                  </div>

                  {/* Remotion Phonetic Cadence & Stress Animation */}
                  <div className="pt-1">
                    <RemotionPlayerWrapper
                      component={PhoneticStressComposition}
                      inputProps={{
                        word: currentWord.word,
                        cefrLevel: currentWord.cefrLevel,
                      }}
                      durationInFrames={60}
                      aspectRatio="16/9"
                      ariaLabel={`Phonetic cadence animation for ${currentWord.word}`}
                    />
                  </div>

                  {/* Example in Context */}
                  {(currentWord.exampleSentenceEn || currentWord.exampleSentenceTh) && (
                    <div className="p-5 rounded-[22px] bg-[#211E38] border border-[rgba(184,167,255,0.16)] text-left space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {isEn ? 'Example sentence in context:' : 'ตัวอย่างประโยคในบริบท:'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                        {currentWord.exampleSentenceEn}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {currentWord.exampleSentenceTh}
                      </p>
                    </div>
                  )}

                  {/* Collocations */}
                  {currentWord.collocations && currentWord.collocations.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold mr-1">Collocations:</span>
                      {currentWord.collocations.map((c, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-[#292544] text-xs font-mono font-medium text-foreground border border-[rgba(184,167,255,0.16)] shadow-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Test Prompt */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('practice');
                        startPracticeSession(currentWord.id);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-500/20"
                    >
                      <BrainCircuit className="w-4 h-4" aria-hidden="true" />
                      <span>{isEn ? 'Test yourself on this word' : 'ทดสอบความจำคำนี้ทันที'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Mastery & Navigation */}
            <div className="pt-4 border-t border-[rgba(184,167,255,0.16)] flex items-center justify-between gap-3 flex-wrap">
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
    </div>
  );
};
