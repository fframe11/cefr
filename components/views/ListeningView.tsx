'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { LISTENING_BANK } from '../../data/listeningBank';
import { ListeningExercise, Question } from '../../types';
import { AudioPlayer } from '../common/AudioPlayer';
import { QuestionCard } from '../common/QuestionCard';
import {
  Headphones,
  Eye,
  EyeOff,
  FileText,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getListeningExercises, mapListeningDtoToExercise } from '../../lib/api/content/listening';
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
} from '../ui';
import { useTranslation } from '../../i18n';

interface ListeningViewProps {
  onQuestionCompleted?: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

export const ListeningView: React.FC<ListeningViewProps> = ({ onQuestionCompleted }) => {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<ListeningExercise[]>(LISTENING_BANK);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(LISTENING_BANK[0]?.id || '');
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseQuestions, setExerciseQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Fetch exercises from API
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListeningExercises({ page: 1, limit: 50 });
      if (res && res.exercises && res.exercises.length > 0) {
        const mapped = res.exercises.map(mapListeningDtoToExercise);
        setExercises(mapped);
        if (!selectedExerciseId || !mapped.some((e) => e.id === selectedExerciseId)) {
          setSelectedExerciseId(mapped[0].id);
        }
      } else {
        setExercises(LISTENING_BANK);
      }
    } catch (err: any) {
      console.warn('[ListeningView] API fetch failed, falling back to static listening bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดแบบฝึกหัดฟังจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setExercises(LISTENING_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedExerciseId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const currentExercise = exercises.find((l) => l.id === selectedExerciseId) || exercises[0] || LISTENING_BANK[0];

  // Fetch questions for current exercise
  const fetchQuestionsForExercise = useCallback(async (exerciseId: string) => {
    if (exerciseQuestions[exerciseId]) return;
    setLoadingQuestions(true);
    try {
      const res = await getQuestions({ listening_exercise_id: exerciseId });
      if (res && res.questions && res.questions.length > 0) {
        const mapped = res.questions.map(mapQuestionDtoToQuestion);
        setExerciseQuestions((prev) => ({ ...prev, [exerciseId]: mapped }));
      } else {
        const staticExercise = LISTENING_BANK.find((e) => e.id === exerciseId);
        setExerciseQuestions((prev) => ({ ...prev, [exerciseId]: staticExercise?.questions || [] }));
      }
    } catch (err: any) {
      console.warn('[ListeningView] Failed to fetch questions for exercise, using static fallback:', err?.message || err);
      const staticExercise = LISTENING_BANK.find((e) => e.id === exerciseId);
      setExerciseQuestions((prev) => ({ ...prev, [exerciseId]: staticExercise?.questions || [] }));
    } finally {
      setLoadingQuestions(false);
    }
  }, [exerciseQuestions]);

  useEffect(() => {
    if (currentExercise?.id) {
      fetchQuestionsForExercise(currentExercise.id);
      setActiveQuestionIdx(0);
    }
  }, [currentExercise?.id, fetchQuestionsForExercise]);

  const displayedQuestions = (currentExercise && exerciseQuestions[currentExercise.id]) || currentExercise?.questions || [];
  const currentQuestion = displayedQuestions[activeQuestionIdx];

  const handleNextQuestion = () => {
    if (activeQuestionIdx < displayedQuestions.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
    } else {
      // Advance to next exercise
      const currentIndex = exercises.findIndex((e) => e.id === currentExercise?.id);
      if (currentIndex !== -1 && currentIndex < exercises.length - 1) {
        setSelectedExerciseId(exercises[currentIndex + 1].id);
        setShowTranscript(false);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GlovaSectionHeader
          eyebrow="LISTENING LAB"
          title="ทักษะการฟังและการจับใจความ"
          description="ฝึกฟังบทสนทนาและประกาศตามสำเนียงสากล พร้อมตอบคำถามวัดความเข้าใจตามรูปแบบข้อสอบ Cambridge"
        />

        {currentExercise && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <GlovaLevelBadge level={currentExercise.cefrLevel} size="md" />
            <GlovaBadge variant="outline" size="sm">
              {currentExercise.targetExam}
            </GlovaBadge>
          </div>
        )}
      </div>

      {/* Exercise Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {exercises.map((item) => {
          const isSelected = item.id === currentExercise?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedExerciseId(item.id);
                setShowTranscript(false);
                setActiveQuestionIdx(0);
              }}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-secondary/40'
              }`}
            >
              <GlovaLevelBadge level={item.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && exercises.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="กำลังโหลดแบบฝึกหัดฟัง..." />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchExercises} />
      )}

      {/* 2. Main Learning Activity: Audio Station & Dominant Question */}
      {currentExercise && (
        <div className="space-y-6">
          {/* Audio Player Card (Dominant Player Station) */}
          <GlovaCard elevation="subtle" className="p-5 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentExercise.cefrLevel} size="sm" />
                <span className="font-semibold text-sm sm:text-base text-foreground">
                  {currentExercise.title}
                </span>
              </div>

              {currentExercise.speakerAccents && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Volume2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>สำเนียง: {currentExercise.speakerAccents}</span>
                </div>
              )}
            </div>

            {/* Audio Player Control */}
            <div className="pt-2">
              <AudioPlayer
                script={currentExercise.audioScript || ''}
                title={currentExercise.title}
                accent={currentExercise.speakerAccents}
              />
            </div>

            {/* Progressive Disclosure Transcript Toggle */}
            {currentExercise.audioScript && (
              <div className="pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="touch-target text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  {showTranscript ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('listening.hide_transcript')}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('listening.reveal_transcript')}</span>
                    </>
                  )}
                </button>

                {showTranscript && (
                  <div className="mt-3 p-4 rounded-xl bg-muted/30 border border-border/40 text-xs sm:text-sm text-foreground/90 leading-relaxed font-serif animate-in fade-in duration-200">
                    <p className="font-sans text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                      บทพูดภาษาอังกฤษ:
                    </p>
                    {currentExercise.audioScript}
                  </div>
                )}
              </div>
            )}
          </GlovaCard>

          {/* Comprehension Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {t('listening.comprehension_questions')}
                </h4>
              </div>

              {displayedQuestions.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  ข้อที่ {activeQuestionIdx + 1} จาก {displayedQuestions.length}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[200px] flex items-center justify-center p-8">
                <LoadingSpinner size="md" text="กำลังโหลดคำถามวัดความเข้าใจ..." />
              </div>
            )}

            {!loadingQuestions && displayedQuestions.length === 0 && (
              <EmptyState
                title="ยังไม่มีคำถามสำหรับบทเรียนนี้"
                description="ทีมผู้เชี่ยวชาญกำลังจัดเตรียมคำถามเพิ่มเติม"
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <GlovaButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                  >
                    ข้อก่อนหน้า
                  </GlovaButton>

                  <GlovaButton
                    variant="primary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
                    onClick={handleNextQuestion}
                  >
                    {activeQuestionIdx < displayedQuestions.length - 1 ? 'ข้อถัดไป' : 'บทเรียนถัดไป'}
                  </GlovaButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
