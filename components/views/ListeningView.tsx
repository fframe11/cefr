'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { LISTENING_BANK } from '../../data/listeningBank';
import { ListeningExercise, Question } from '../../types';
import { AudioPlayer } from '../common/AudioPlayer';
import { QuestionCard } from '../common/QuestionCard';
import { Eye, EyeOff, FileText, Headphones } from 'lucide-react';
import { getListeningExercises, mapListeningDtoToExercise } from '../../lib/api/content/listening';
import { getQuestions, mapQuestionDtoToQuestion } from '../../lib/api/questions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../i18n';

interface ListeningViewProps {
  onQuestionCompleted: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
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
    }
  }, [currentExercise?.id, fetchQuestionsForExercise]);

  const displayedQuestions = (currentExercise && exerciseQuestions[currentExercise.id]) || currentExercise?.questions || [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Exercise Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {exercises.map((item) => {
          const isSelected = item.id === currentExercise?.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedExerciseId(item.id);
                setShowTranscript(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {item.cefrLevel}
              </span>
              <span className="truncate max-w-[200px]">{item.title}</span>
            </button>
          );
        })}
      </div>

      {loading && exercises.length === 0 && (
        <div className="p-12 flex justify-center">
          <LoadingSpinner size="lg" text="กำลังโหลดแบบฝึกหัดฟัง..." />
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={fetchExercises} />
      )}

      {currentExercise && (
        <>
          {/* Main Listening Card */}
          <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    {currentExercise.targetExam} • {currentExercise.cefrLevel}
                  </span>
                </div>
                <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
                  {currentExercise.title}
                </h2>
              </div>

              <span className="text-xs text-muted-foreground self-start sm:self-auto">
                สำเนียง: {currentExercise.speakerAccents}
              </span>
            </div>

            {/* Audio Player Component: handles audio path or synthesis script */}
            <AudioPlayer
              script={currentExercise.audioScript}
              title={currentExercise.title}
              accent={currentExercise.speakerAccents}
              maxReplays={3}
            />

            {/* Transcript Toggle (Hidden by default to train actual listening) */}
            <div className="pt-2">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1.5 touch-target"
              >
                {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTranscript ? t('listening.hide_transcript') : t('listening.reveal_transcript')}</span>
              </button>

              {showTranscript && (
                <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed whitespace-pre-line animate-in fade-in duration-200 break-word-safe">
                  {currentExercise.audioScript}
                </div>
              )}
            </div>
          </div>

          {/* Comprehension Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>{t('listening.comprehension_questions')}</span>
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {displayedQuestions.length} ข้อ
              </span>
            </div>

            {loadingQuestions && displayedQuestions.length === 0 ? (
              <div className="p-8 flex justify-center">
                <LoadingSpinner size="md" text="กำลังโหลดแบบฝึกหัด..." />
              </div>
            ) : displayedQuestions.length > 0 ? (
              <div className="space-y-4">
                {displayedQuestions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    questionNumber={idx + 1}
                    totalQuestions={displayedQuestions.length}
                    showExplanationImmediately={true}
                    onAnswer={(selectedKey, isCorrect) => {
                      onQuestionCompleted(q.id, isCorrect, q.weaknessTag);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีคำถามสำหรับบทฟังนี้"
                description="เลือกบทฟังอื่นเพื่อฝึกทำโจทย์"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
