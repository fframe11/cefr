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
  GlovaImage,
} from '../ui';
import { RemotionPlayerWrapper, ListeningWaveformComposition } from '../remotion';
import { useTranslation } from '../../i18n';

interface ListeningViewProps {
  onQuestionCompleted?: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

export const ListeningView: React.FC<ListeningViewProps> = ({ onQuestionCompleted }) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
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
    <div className="w-full space-y-6 pb-16">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GlovaSectionHeader
          eyebrow="LISTENING LAB"
          title={isEn ? 'Listening Comprehension Lab' : 'ทักษะการฟังและการจับใจความ'}
          description={
            isEn
              ? 'Practice listening to authentic international English dialogues and answer Cambridge comprehension questions.'
              : 'ฝึกฟังบทสนทนาและประกาศตามสำเนียงสากล พร้อมตอบคำถามวัดความเข้าใจตามรูปแบบข้อสอบ Cambridge'
          }
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
              className={`touch-target px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#5B5CE2] text-white border-[#5B5CE2] shadow-sm shadow-[#5B5CE2]/20 font-bold'
                  : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-[rgba(37,36,42,0.12)] hover:bg-[#DDD4C7]'
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
          <LoadingSpinner
            size="lg"
            text={isEn ? 'Loading listening exercises...' : 'กำลังโหลดแบบฝึกหัดฟัง...'}
          />
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
          <GlovaCard
            variant="bubble"
            elevation="bubble"
            className="p-6 sm:p-8 space-y-4 rounded-[30px] bg-[#F0EAE1] border border-[rgba(37,36,42,0.12)] shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(37,36,42,0.12)]">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentExercise.cefrLevel} size="sm" />
                <span className="font-bold text-sm sm:text-base text-foreground">
                  {currentExercise.title}
                </span>
              </div>

              {currentExercise.speakerAccents && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span>
                    {isEn ? `Accent: ${currentExercise.speakerAccents}` : `สำเนียง: ${currentExercise.speakerAccents}`}
                  </span>
                </div>
              )}
            </div>

            {/* Remotion Audio Waveform Visualization */}
            <div className="pt-1">
              <RemotionPlayerWrapper
                component={ListeningWaveformComposition}
                inputProps={{ isPlaying: true }}
                durationInFrames={90}
                aspectRatio="21/9"
                ariaLabel="Listening audio waveform visualization"
              />
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
              <div className="pt-3 border-t border-[rgba(37,36,42,0.12)]">
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="touch-target text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1.5 transition-colors"
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
                  <div className="mt-3 p-4 rounded-[20px] bg-[#DDD4C7] border border-[rgba(37,36,42,0.12)] text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans animate-in fade-in duration-200">
                    <p className="font-sans text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                      {isEn ? 'English Audio Transcript:' : 'บทพูดภาษาอังกฤษ:'}
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
                  {isEn
                    ? `Question ${activeQuestionIdx + 1} of ${displayedQuestions.length}`
                    : `ข้อที่ ${activeQuestionIdx + 1} จาก ${displayedQuestions.length}`}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[200px] flex items-center justify-center p-8">
                <LoadingSpinner
                  size="md"
                  text={isEn ? 'Loading comprehension questions...' : 'กำลังโหลดคำถามวัดความเข้าใจ...'}
                />
              </div>
            )}

            {!loadingQuestions && displayedQuestions.length === 0 && (
              <EmptyState
                title={isEn ? 'No questions available for this lesson yet' : 'ยังไม่มีคำถามสำหรับบทเรียนนี้'}
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <GlovaButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                  >
                    {isEn ? 'Previous' : 'ข้อก่อนหน้า'}
                  </GlovaButton>

                  <GlovaButton
                    variant="primary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
                    onClick={handleNextQuestion}
                  >
                    {activeQuestionIdx < displayedQuestions.length - 1
                      ? isEn
                        ? 'Next Question'
                        : 'ข้อถัดไป'
                      : isEn
                      ? 'Next Lesson'
                      : 'บทเรียนถัดไป'}
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
