'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { READING_BANK } from '../../data/readingBank';
import { ReadingPassage, Question } from '../../types';
import { QuestionCard } from '../common/QuestionCard';
import {
  FileText,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getReadingPassages, mapReadingDtoToPassage } from '../../lib/api/content/reading';
import { getQuestions, mapQuestionDtoToQuestion } from '../../lib/api/questions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import {
  GlovaSectionHeader,
  GlovaLevelBadge,
  GlovaButton,
  GlovaCard,
  GlovaBadge,
  GlovaImage,
} from '../ui';
import { useTranslation } from '../../i18n';

interface ReadingViewProps {
  onQuestionCompleted?: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({ onQuestionCompleted }) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const [passages, setPassages] = useState<ReadingPassage[]>(READING_BANK);
  const [selectedPassageId, setSelectedPassageId] = useState<string>(READING_BANK[0]?.id || '');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'passage' | 'questions'>('passage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passageQuestions, setPassageQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Fetch passages from API
  const fetchPassages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReadingPassages({ page: 1, limit: 50 });
      if (res && res.passages && res.passages.length > 0) {
        const mapped = res.passages.map(mapReadingDtoToPassage);
        setPassages(mapped);
        if (!selectedPassageId || !mapped.some((p) => p.id === selectedPassageId)) {
          setSelectedPassageId(mapped[0].id);
        }
      } else {
        setPassages(READING_BANK);
      }
    } catch (err: any) {
      console.warn('[ReadingView] API fetch failed, falling back to static reading bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดบทความอ่านจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setPassages(READING_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedPassageId]);

  useEffect(() => {
    fetchPassages();
  }, [fetchPassages]);

  const currentPassage = passages.find((p) => p.id === selectedPassageId) || passages[0] || READING_BANK[0];

  // Fetch questions for current passage
  const fetchQuestionsForPassage = useCallback(async (passageId: string) => {
    if (passageQuestions[passageId]) return;
    setLoadingQuestions(true);
    try {
      const res = await getQuestions({ reading_passage_id: passageId });
      if (res && res.questions && res.questions.length > 0) {
        const mapped = res.questions.map(mapQuestionDtoToQuestion);
        setPassageQuestions((prev) => ({ ...prev, [passageId]: mapped }));
      } else {
        const staticPassage = READING_BANK.find((p) => p.id === passageId);
        setPassageQuestions((prev) => ({ ...prev, [passageId]: staticPassage?.questions || [] }));
      }
    } catch (err: any) {
      console.warn('[ReadingView] Failed to fetch questions for passage, using static fallback:', err?.message || err);
      const staticPassage = READING_BANK.find((p) => p.id === passageId);
      setPassageQuestions((prev) => ({ ...prev, [passageId]: staticPassage?.questions || [] }));
    } finally {
      setLoadingQuestions(false);
    }
  }, [passageQuestions]);

  useEffect(() => {
    if (currentPassage?.id) {
      fetchQuestionsForPassage(currentPassage.id);
      setActiveQuestionIdx(0);
    }
  }, [currentPassage?.id, fetchQuestionsForPassage]);

  const displayedQuestions = (currentPassage && passageQuestions[currentPassage.id]) || currentPassage?.questions || [];
  const currentQuestion = displayedQuestions[activeQuestionIdx];

  const estimatedReadingMinutes = currentPassage ? Math.ceil(currentPassage.wordCount / 150) : 2;

  const handleNextQuestion = () => {
    if (activeQuestionIdx < displayedQuestions.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
    } else {
      // Advance to next passage if available
      const currentIndex = passages.findIndex((p) => p.id === currentPassage?.id);
      if (currentIndex !== -1 && currentIndex < passages.length - 1) {
        setSelectedPassageId(passages[currentIndex + 1].id);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. TOP SUB-NAV BAR (EduMaster Style) */}
      <nav
        aria-label="Reading sub-navigation"
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
                Reading Studio
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                READING LAB // CEFR
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block mx-1" />

          {currentPassage && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
              <GlovaLevelBadge level={currentPassage.cefrLevel} size="sm" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentPassage.targetExam}
              </span>
            </div>
          )}
        </div>

        {/* Counter and Status Chips */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>{isEn ? `${passages.length} Passages` : `${passages.length} บทความ`}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analytical Reading</span>
          </div>
        </div>
      </nav>

      {/* Main Title & Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEn ? 'Reading Lab & Analytical Comprehension' : 'อ่านจับใจความและวิเคราะห์บริบท'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-sans">
          {isEn
            ? 'Practice analytical reading aligned with CEFR standards and Cambridge exam preparation.'
            : 'ฝึกทักษะการอ่านบทความเชิงวิเคราะห์ตามกรอบ CEFR และเตรียมความพร้อมสำหรับข้อสอบ Cambridge'}
        </p>
      </div>

      {/* Passage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {passages.map((p) => {
          const isSelected = p.id === currentPassage?.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPassageId(p.id);
                setActiveQuestionIdx(0);
                setActiveTab('passage');
              }}
              className={`touch-target px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FA5D5D] text-white shadow-sm font-black'
                  : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <GlovaLevelBadge level={p.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile/Tablet View Toggle (Passage vs Questions) */}
      <div className="lg:hidden flex items-center p-1 rounded-full bg-[#FAF8F3] dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('passage')}
          className={`flex-1 touch-target py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'passage'
              ? 'bg-[#FA5D5D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>{isEn ? 'Passage' : 'บทความ'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex-1 touch-target py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'questions'
              ? 'bg-[#FA5D5D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          <span>
            {isEn
              ? `Questions (${displayedQuestions.length})`
              : `คำถาม (${displayedQuestions.length} ข้อ)`}
          </span>
        </button>
      </div>

      {/* Loading state indicator */}
      {loading && passages.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="กำลังโหลดบทความอ่าน..." />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchPassages} />
      )}

      {/* 2. Main Learning Activity: Split Canvas */}
      {currentPassage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (6 cols): Reading Passage Canvas */}
          <div className={`lg:col-span-6 space-y-4 ${activeTab === 'questions' ? 'hidden lg:block' : 'block'}`}>
            <div className="w-full p-6 sm:p-8 space-y-5 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
              {/* Passage Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE4D5] dark:border-white/10">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentPassage.cefrLevel} size="sm" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                    {currentPassage.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 bg-[#FAF8F3] dark:bg-[#252131] px-3 py-1 rounded-full border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-[#FA5D5D]" aria-hidden="true" />
                    <span>
                      {currentPassage.wordCount} {isEn ? 'words' : 'คำ'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 bg-[#FAF8F3] dark:bg-[#252131] px-3 py-1 rounded-full border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-[#D98200] dark:text-[#FFBA38]" aria-hidden="true" />
                    <span>
                      ~{estimatedReadingMinutes} {isEn ? 'min' : 'นาที'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Contextual Editorial Reading Photography */}
              <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-[22px] overflow-hidden border border-[#EAE4D5] dark:border-white/10 shadow-xs bg-slate-100 dark:bg-slate-800">
                <img
                  src="/images/learning/reading_hero.jpg"
                  alt="Student immersed in academic reading and study materials in library"
                  width={800}
                  height={340}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold border border-white/20">
                    Passage Analysis
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D5D] text-white text-[11px] font-bold shadow-xs">
                    CEFR {currentPassage.cefrLevel}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentPassage.title}
              </h3>

              {/* Passage Content with Optimal Typography (65ch measure) */}
              <div className="text-sm sm:text-base leading-normal text-slate-800 dark:text-slate-200 space-y-3 font-normal whitespace-pre-line selection:bg-[#FA5D5D]/20 max-w-readable">
                {currentPassage.content}
              </div>

              {/* Vocabulary Glossary Drawer */}
              {currentPassage.vocabularyGlossary && currentPassage.vocabularyGlossary.length > 0 && (
                <div className="pt-4 border-t border-[#EAE4D5] dark:border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
                    className="touch-target text-xs font-bold text-[#FA5D5D] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {isGlossaryOpen
                        ? isEn
                          ? 'Hide vocabulary glossary'
                          : 'ซ่อนคลังคำศัพท์ประจำบทความ'
                        : isEn
                        ? 'View key vocabulary'
                        : 'ดูคำศัพท์สำคัญในบทความ'}
                    </span>
                  </button>

                  {isGlossaryOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 animate-in fade-in duration-200">
                      {currentPassage.vocabularyGlossary.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-[18px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs flex items-baseline justify-between gap-2 shadow-xs"
                        >
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{item.word}</span>
                          <span className="text-slate-500 dark:text-slate-400 text-right">{item.meaningTh}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (6 cols): Comprehension Questions */}
          <div className={`lg:col-span-6 space-y-4 ${activeTab === 'passage' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-1 px-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isEn ? 'Comprehension Questions' : 'คำถามวัดความเข้าใจ'}
                </h4>
              </div>

              {displayedQuestions.length > 0 && (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold bg-white dark:bg-[#1E1B28] px-3.5 py-1 rounded-full border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                  {isEn
                    ? `Question ${activeQuestionIdx + 1} of ${displayedQuestions.length}`
                    : `ข้อที่ ${activeQuestionIdx + 1} จาก ${displayedQuestions.length}`}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[260px] flex items-center justify-center p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-[#EAE4D5] dark:border-white/10">
                <LoadingSpinner
                  size="md"
                  text={isEn ? 'Loading questions...' : 'กำลังโหลดคำถาม...'}
                />
              </div>
            )}

            {!loadingQuestions && displayedQuestions.length === 0 && (
              <EmptyState
                title={isEn ? 'No questions available for this passage yet' : 'ยังไม่มีคำถามสำหรับบทความนี้'}
                description={
                  isEn
                    ? 'Our academic team is currently preparing additional questions. Please select another passage from above to continue.'
                    : 'ยังไม่มีคำถามสำหรับบทความนี้ในขณะนี้ กรุณาเลือกบทอ่านเรื่องอื่นจากแถบด้านบนเพื่อฝึกฝนต่อ'
                }
              />
            )}

            {currentQuestion && (
              <div className="space-y-4">
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  questionNumber={activeQuestionIdx + 1}
                  totalQuestions={displayedQuestions.length}
                  onAnswer={(selectedKey, isCorrect) => {
                    onQuestionCompleted?.(currentQuestion.id, isCorrect, currentQuestion.weaknessTag);
                  }}
                  showExplanationImmediately={true}
                />

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="touch-target px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span>{isEn ? 'Previous' : 'ข้อก่อนหน้า'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="touch-target px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>
                      {activeQuestionIdx < displayedQuestions.length - 1
                        ? isEn
                          ? 'Next Question'
                          : 'ข้อถัดไป'
                        : isEn
                        ? 'Next Passage'
                        : 'บทความถัดไป'}
                    </span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
