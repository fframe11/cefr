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
import {
  TactileButton,
  SpotlightCard,
  BorderBeam,
  DecryptedText,
  ShinyText,
  TacticalHudFrame,
} from '../ui/GlovaPrimitives';
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
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#5B5CE2]/15 text-[#5B5CE2] dark:text-[#8283FF] border border-[#5B5CE2]/25">
              <DecryptedText text="READING LAB" speed={40} maxIterations={12} revealDirection="start" />
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isEn ? 'Reading Lab & Analytical Comprehension' : 'อ่านจับใจความและวิเคราะห์บริบท'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            {isEn
              ? 'Practice analytical reading aligned with CEFR standards and Cambridge exam preparation.'
              : 'ฝึกทักษะการอ่านบทความเชิงวิเคราะห์ตามกรอบ CEFR และเตรียมความพร้อมสำหรับข้อสอบ Cambridge'}
          </p>
        </div>

        {currentPassage && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <GlovaLevelBadge level={currentPassage.cefrLevel} size="md" />
            <GlovaBadge variant="outline" size="sm">
              {currentPassage.targetExam}
            </GlovaBadge>
          </div>
        )}
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
              className={`touch-target px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#5B5CE2] text-white border-[#5B5CE2] shadow-sm shadow-[#5B5CE2]/20 font-bold'
                  : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-slate-200/80 dark:border-white/10 hover:bg-white dark:bg-[#141A22] dark:hover:bg-[#222E3A]'
              }`}
            >
              <GlovaLevelBadge level={p.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile/Tablet View Toggle (Passage vs Questions) */}
      <div className="lg:hidden flex items-center p-1 rounded-full bg-muted/40 border border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab('passage')}
          className={`flex-1 touch-target py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'passage'
              ? 'bg-card text-foreground shadow-xs border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>{isEn ? 'Passage' : 'บทความ'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex-1 touch-target py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'questions'
              ? 'bg-card text-foreground shadow-xs border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
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
            <SpotlightCard
              spotlightColor="rgba(91, 92, 226, 0.15)"
              showBorderBeam={true}
              borderBeamProps={{
                colorFrom: '#5B5CE2',
                colorTo: '#3B82F6',
                duration: 14,
                size: 200,
              }}
              className="p-6 sm:p-8 space-y-5 rounded-[30px] bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)]"
            >
              {/* Passage Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentPassage.cefrLevel} size="sm" />
                  <span className="text-xs text-muted-foreground font-mono font-medium">
                    {currentPassage.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1 bg-slate-100 dark:bg-[#1C2430] px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/10">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <span>
                      {currentPassage.wordCount} {isEn ? 'words' : 'คำ'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 dark:bg-[#1C2430] px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>
                      ~{estimatedReadingMinutes} {isEn ? 'min' : 'นาที'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Contextual Editorial Reading Photography */}
              <div className="overflow-hidden rounded-[22px] border border-slate-200/80 dark:border-white/10 shadow-xs">
                <GlovaImage
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
                  alt="Agile engineering team collaborating around workspace laptops"
                  aspectRatio="aspect-video"
                  className="w-full max-h-48"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {currentPassage.title}
              </h3>

              {/* Passage Content with Optimal Typography */}
              <div className="text-sm sm:text-base leading-relaxed text-foreground/90 space-y-3 font-normal whitespace-pre-line selection:bg-primary/20">
                {currentPassage.content}
              </div>

              {/* Vocabulary Glossary Drawer */}
              {currentPassage.vocabularyGlossary && currentPassage.vocabularyGlossary.length > 0 && (
                <div className="pt-4 border-t border-border/40 space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
                    className="touch-target text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
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
                          className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs flex items-baseline justify-between gap-2"
                        >
                          <span className="font-mono font-bold text-foreground">{item.word}</span>
                          <span className="text-muted-foreground text-right">{item.meaningTh}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Right Column (6 cols): Comprehension Questions */}
          <div className={`lg:col-span-6 space-y-4 ${activeTab === 'passage' ? 'hidden lg:block' : 'block'}`}>
            <TacticalHudFrame
              agentName="STUDIO // READING DRILL"
              statusText={displayedQuestions.length > 0 ? `Q ${activeQuestionIdx + 1}/${displayedQuestions.length}` : 'ONLINE'}
              accentColor="indigo"
            >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {isEn ? 'Comprehension Questions' : 'คำถามวัดความเข้าใจ'}
                </h4>
              </div>

              {displayedQuestions.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  {isEn
                    ? `Question ${activeQuestionIdx + 1} of ${displayedQuestions.length}`
                    : `ข้อที่ ${activeQuestionIdx + 1} จาก ${displayedQuestions.length}`}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[260px] flex items-center justify-center p-8">
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
                    ? 'Our academic team is currently preparing additional questions.'
                    : 'ทีมผู้เชี่ยวชาญกำลังจัดเตรียมคำถามเพิ่มเติม'
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
                  <TactileButton
                    variant="neutral"
                    size="sm"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span>{isEn ? 'Previous' : 'ข้อก่อนหน้า'}</span>
                  </TactileButton>

                  <TactileButton
                    variant="primary"
                    size="sm"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5"
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
                  </TactileButton>
                </div>
              </div>
            )}
            </TacticalHudFrame>
          </div>
        </div>
      )}
    </div>
  );
};
