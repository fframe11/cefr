'use client';
import React, { useState } from 'react';
import { Question } from '../../types';
import { Check, X, HelpCircle, ArrowRight, Clock, Loader2, Sparkles } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { submitPracticeAnswer, PracticeGradingResultDTO } from '../../lib/api/practice';
import { useTranslation } from '../../i18n';
import { GRAMMAR_BANK } from '../../data/grammarBank';
import { READING_BANK } from '../../data/readingBank';

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswer: (selectedKey: string, isCorrect: boolean) => void;
  showExplanationImmediately?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showExplanationImmediately = true,
}) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverGrading, setServerGrading] = useState<PracticeGradingResultDTO | null>(null);

  // Resolve static question data if options from API stripped isCorrect
  const matchedStaticQ = React.useMemo(() => {
    if (!question) return null;
    const gq = GRAMMAR_BANK.flatMap((t) => t?.practiceQuestions || []).filter(Boolean);
    const rq = READING_BANK.flatMap((p) => p?.questions || []).filter(Boolean);
    return (
      gq.find((q) => (q?.id && q.id === question.id) || (q?.promptEn && q.promptEn === question.promptEn)) ||
      rq.find((q) => (q?.id && q.id === question.id) || (q?.promptEn && q.promptEn === question.promptEn)) ||
      null
    );
  }, [question?.id, question?.promptEn]);

  const getOptionCorrectness = (key: string): boolean => {
    if (isServerGraded && serverGrading?.correct_option_key) {
      return serverGrading.correct_option_key === key;
    }
    const directOption = question.options?.find((o) => o.key === key);
    if (directOption && typeof directOption.isCorrect === 'boolean') {
      return directOption.isCorrect;
    }
    const staticOption = matchedStaticQ?.options?.find((o) => o.key === key);
    if (staticOption && typeof staticOption.isCorrect === 'boolean') {
      return staticOption.isCorrect;
    }
    return false;
  };

  const evaluateAnswer = async (key: string) => {
    setIsSubmitting(true);
    try {
      // Server-authoritative practice grading
      const res = await submitPracticeAnswer({
        question_id: question.id,
        selected_option_key: key,
      });
      const result = res.result;
      setServerGrading(result);
      setSubmitted(true);
      onAnswer(key, result.is_correct ?? false);
    } catch {
      // Offline / guest mode / mock fallback: use option client data if present
      const fallbackCorrect = getOptionCorrectness(key);
      setSubmitted(true);
      onAnswer(key, fallbackCorrect);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (key: string) => {
    if (submitted || isSubmitting) return;
    setSelectedOption(key);

    if (showExplanationImmediately) {
      evaluateAnswer(key);
    }
  };

  const handleManualSubmit = () => {
    if (!selectedOption || submitted || isSubmitting) return;
    evaluateAnswer(selectedOption);
  };

  // Determine correctness and feedback either from server grading or local question fallback
  const isServerGraded = serverGrading !== null;
  const isPending = serverGrading?.evaluation_status === 'pending';
  const isCorrect = isServerGraded
    ? Boolean(serverGrading.is_correct)
    : selectedOption ? getOptionCorrectness(selectedOption) : false;

  const feedbackText = isServerGraded
    ? (serverGrading.feedback_th || '')
    : (question.options?.find((o) => o.key === selectedOption)?.feedbackTh ||
       matchedStaticQ?.options?.find((o) => o.key === selectedOption)?.feedbackTh || '');

  const explanationTh = isServerGraded
    ? (serverGrading.explanation_th || question.explanationTh)
    : (question.explanationTh || matchedStaticQ?.explanationTh || '');

  const explanationEn = isServerGraded
    ? (serverGrading.explanation_en || question.explanationEn)
    : (question.explanationEn || matchedStaticQ?.explanationEn || '');

  const isOptionCorrect = (optKey: string, optIsCorrectFallback?: boolean) => {
    return getOptionCorrectness(optKey);
  };

  return (
    <div className="relative w-full rounded-[28px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs transition-all overflow-hidden">
      {/* Decorative Cosmic Accents in top right corner matching user reference image media_1790950105375.png */}
      {(questionNumber ?? 1) % 2 === 1 ? (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-5 pointer-events-none select-none hidden sm:block">
          <div className="relative w-20 h-20 flex items-center justify-end">
            {/* Floating outer dots */}
            <span className="absolute -left-2 top-8 w-3 h-3 rounded-full bg-[#38BDF8]" />
            <span className="absolute right-12 -top-1 w-2 h-2 rounded-full bg-[#FA5D5D]" />
            <span className="absolute right-1 top-14 w-2 h-2 rounded-full bg-[#FA5D5D]" />
            <span className="absolute right-14 top-16 w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />

            {/* Blue Rounded Square with Planet & Orbit */}
            <div className="w-14 h-14 rounded-2xl bg-[#3B82F6] relative overflow-hidden flex items-center justify-center shadow-xs">
              <span className="w-6 h-6 rounded-full bg-white relative z-10 shadow-xs" />
              {/* Elliptical orbit line */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-7 rounded-full border border-white/50 -rotate-25 scale-110" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-5 pointer-events-none select-none hidden sm:block">
          <div className="relative w-20 h-20 flex items-center justify-end">
            {/* Floating outer dots */}
            <span className="absolute -left-1 top-4 w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span className="absolute right-14 top-12 w-2 h-2 rounded-full bg-[#FA5D5D]" />
            <span className="absolute -left-2 top-14 w-2 h-2 rounded-full bg-[#93C5FD]" />

            {/* Astronaut Helmet Graphic */}
            <div className="w-14 h-14 rounded-full border-2 border-slate-700/80 dark:border-slate-300/80 relative flex items-center justify-center bg-white/40 dark:bg-white/5">
              {/* Stylized blue visor/face */}
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] relative flex items-center justify-center">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-white">
                  <path d="M2 3C4 6 10 6 12 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              {/* Antenna / Helmet ridge */}
              <div className="absolute -top-1 w-3 h-1 bg-slate-700 dark:bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Question Title with Numbering */}
      <div className="mb-4 pr-16 sm:pr-24 space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-normal break-word-safe">
          {questionNumber ? `${questionNumber}. ` : ''}
          {question.promptEn || question.promptTh}
        </h3>
        {question.promptEn && question.promptTh && question.promptEn !== question.promptTh && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium break-word-safe">
            {question.promptTh}
          </p>
        )}
      </div>

      {isSubmitting && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#3B82F6] font-bold animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>กำลังตรวจคำตอบ...</span>
        </div>
      )}

      {/* Audio Player if Listening */}
      {question.audioScript && (
        <div className="mb-4">
          <AudioPlayer script={question.audioScript} title="Listening Track" />
        </div>
      )}

      {/* Context Passage or Fill in the Blank sentence */}
      {question.contextPassage && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-4 break-word-safe whitespace-pre-wrap font-sans">
          {question.contextPassage}
        </div>
      )}

      {/* Options List: Clean Radio Button Style matching user reference images */}
      <div className="space-y-1.5 mb-5" role="radiogroup" aria-label="Choices">
        {question.options?.map((option) => {
          const isSelected = selectedOption === option.key;
          const isThisCorrect = isOptionCorrect(option.key, option.isCorrect);

          let rowStyle = 'hover:bg-slate-50/70 dark:hover:bg-white/[0.03] text-slate-700 dark:text-slate-200';
          let radioCircleStyle = 'border-2 border-[#93C5FD] dark:border-slate-500 bg-white dark:bg-slate-900 group-hover:border-[#3B82F6]';

          if (submitted) {
            if (isPending && isSelected) {
              rowStyle = 'bg-amber-500/10 text-amber-900 dark:text-amber-200 font-medium';
              radioCircleStyle = 'border-2 border-amber-500 bg-amber-500 text-white';
            } else if (isThisCorrect) {
              rowStyle = 'bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-semibold';
              radioCircleStyle = 'border-2 border-emerald-500 bg-emerald-500 text-white';
            } else if (isSelected && !isThisCorrect) {
              rowStyle = 'bg-rose-500/10 text-rose-950 dark:text-rose-100 font-semibold';
              radioCircleStyle = 'border-2 border-rose-500 bg-rose-500 text-white';
            } else {
              rowStyle = 'opacity-40 text-slate-400';
              radioCircleStyle = 'border-2 border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5';
            }
          } else if (isSelected) {
            rowStyle = 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 font-semibold';
            radioCircleStyle = 'border-2 border-[#3B82F6] dark:border-blue-400 bg-white dark:bg-slate-900';
          }

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleSelect(option.key)}
              disabled={submitted || isSubmitting}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${rowStyle} ${
                submitted || isSubmitting ? 'cursor-default' : 'cursor-pointer active:scale-[0.995]'
              }`}
              role="radio"
              aria-checked={isSelected}
            >
              {/* Radio Circle Indicator matching user reference */}
              <div className="shrink-0 flex items-center justify-center">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${radioCircleStyle}`}>
                  {submitted && isThisCorrect ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : submitted && isSelected && !isThisCorrect ? (
                    <X className="w-3 h-3 stroke-[3]" />
                  ) : isSelected ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] dark:bg-blue-400 animate-in zoom-in-75 duration-150" />
                  ) : null}
                </span>
              </div>

              {/* Option Text */}
              <span className="text-sm sm:text-base font-medium leading-normal break-word-safe">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Manual Submit for Tests with deferred grading */}
      {!showExplanationImmediately && !submitted && (
        <button
          onClick={handleManualSubmit}
          disabled={!selectedOption || isSubmitting}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all touch-target ${
            selectedOption && !isSubmitting
              ? 'bg-[#FA5D5D] hover:bg-[#E84C4C] text-white shadow-md shadow-[#FA5D5D]/25 active:scale-[0.98] cursor-pointer'
              : 'bg-slate-100 dark:bg-white/5 border border-border text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>กำลังตรวจ...</span>
            </>
          ) : (
            <>
              <span>ยืนยันคำตอบ</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Detailed Bilingual Explanation Box */}
      {submitted && (
        <div
          className={`p-5 rounded-2xl border animate-in fade-in duration-200 ${
            isPending
              ? 'bg-amber-500/10 border-amber-500/20'
              : isCorrect
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            {isPending ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> บันทึกคำตอบแล้ว (รอผลการประเมินจากผู้ตรวจ/ระบบ)
              </span>
            ) : isCorrect ? (
              <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> ยอดเยี่ยม! ตอบถูกต้อง
              </span>
            ) : (
              <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <X className="w-4 h-4" /> ยังไม่ถูกต้อง
              </span>
            )}
          </div>

          {/* Option Specific Feedback */}
          {feedbackText && (
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 break-word-safe">
              • {feedbackText}
            </p>
          )}

          {/* Core Grammar/Vocabulary Explanation in Thai */}
          {(explanationTh || explanationEn) && (
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-border/50 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#FA5D5D] shrink-0" />
                {t('common.explanation')}:
              </p>
              {explanationTh && <p className="text-slate-800 dark:text-slate-200 pl-4 break-word-safe font-medium">{explanationTh}</p>}
              {explanationEn && (
                <p className="text-slate-500 dark:text-slate-400 pl-4 text-[11px] italic break-word-safe">
                  English Note: {explanationEn}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
