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
      {/* 1. TOP SUB-NAV BAR (EduMaster Style) */}
      <nav
        aria-label="Listening sub-navigation"
        className="w-full bg-[#FAF8F3] dark:bg-[#1E1B28] backdrop-blur-md rounded-[28px] p-3 sm:p-4 border border-[#EAE4D5] dark:border-white/10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 shadow-sm"
      >
        {/* Brand & Studio Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-sm shrink-0">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Listening Studio
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                LISTENING LAB // CEFR
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block mx-1" />

          {currentExercise && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
              <GlovaLevelBadge level={currentExercise.cefrLevel} size="sm" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentExercise.targetExam}
              </span>
            </div>
          )}
        </div>

        {/* Counter and Status Chips */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Headphones className="w-3.5 h-3.5" />
            <span>{isEn ? `${exercises.length} Audio Tracks` : `${exercises.length} แบบฝึกหัดฟัง`}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Audio</span>
          </div>
        </div>
      </nav>

      {/* Main Title & Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEn ? 'Listening Comprehension Lab' : 'ทักษะการฟังและการจับใจความ'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-sans">
          {isEn
            ? 'Practice listening to authentic international English dialogues and answer Cambridge comprehension questions.'
            : 'ฝึกฟังบทสนทนาและประกาศตามสำเนียงสากล พร้อมตอบคำถามวัดความเข้าใจตามรูปแบบข้อสอบ Cambridge'}
        </p>
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
              className={`touch-target px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FA5D5D] text-white shadow-sm font-black'
                  : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
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
          <div className="p-6 sm:p-8 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE4D5] dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentExercise.cefrLevel} size="sm" />
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {currentExercise.title}
                </span>
              </div>

              {currentExercise.speakerAccents && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono font-medium bg-[#FAF8F3] dark:bg-[#252131] px-3 py-1 rounded-full border border-[#EAE4D5] dark:border-white/10">
                  <Volume2 className="w-3.5 h-3.5 text-[#FA5D5D]" aria-hidden="true" />
                  <span>
                    {isEn ? `Accent: ${currentExercise.speakerAccents}` : `สำเนียง: ${currentExercise.speakerAccents}`}
                  </span>
                </div>
              )}
            </div>

            {/* Contextual Editorial Listening Photography */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-[22px] overflow-hidden border border-[#EAE4D5] dark:border-white/10 shadow-xs bg-slate-100 dark:bg-slate-800">
              <img
                src="/images/learning/listening_hero.jpg"
                alt="Student listening attentively with headphones in modern language lab"
                width={800}
                height={340}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Audio Stream Active</span>
              </div>
            </div>

            {/* Remotion Audio Waveform Visualization */}
            <div className="pt-1 rounded-[22px] overflow-hidden">
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
              <div className="pt-3 border-t border-[#EAE4D5] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="touch-target text-xs font-bold text-[#FA5D5D] hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  <div className="mt-3 p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans animate-in fade-in duration-200 shadow-xs">
                    <p className="text-[11px] font-bold text-[#FA5D5D] mb-1 uppercase tracking-wider font-mono">
                      {isEn ? 'English Audio Transcript:' : 'บทพูดภาษาอังกฤษ:'}
                    </p>
                    {currentExercise.audioScript}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comprehension Questions Section */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between pb-1 px-1">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t('listening.comprehension_questions')}
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
              <div className="min-h-[200px] flex items-center justify-center p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-[#EAE4D5] dark:border-white/10">
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
                        ? 'Next Lesson'
                        : 'บทเรียนถัดไป'}
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
