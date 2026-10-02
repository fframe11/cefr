'use client';
import React, { useState } from 'react';
import { Question } from '../../types';
import { Check, X, HelpCircle, ArrowRight, Clock, Loader2, Sparkles } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { submitPracticeAnswer, PracticeGradingResultDTO } from '../../lib/api/practice';
import { useTranslation } from '../../i18n';

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
      const fallbackCorrect = question.options?.find((o) => o.key === key)?.isCorrect ?? false;
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
    : (question.options?.find((o) => o.key === selectedOption)?.isCorrect ?? false);

  const feedbackText = isServerGraded
    ? (serverGrading.feedback_th || '')
    : (question.options?.find((o) => o.key === selectedOption)?.feedbackTh || '');

  const explanationTh = isServerGraded
    ? (serverGrading.explanation_th || question.explanationTh)
    : question.explanationTh;

  const explanationEn = isServerGraded
    ? (serverGrading.explanation_en || question.explanationEn)
    : question.explanationEn;

  const isOptionCorrect = (optKey: string, optIsCorrectFallback?: boolean) => {
    if (isServerGraded) {
      return serverGrading.correct_option_key === optKey;
    }
    return Boolean(optIsCorrectFallback);
  };

  return (
    <div className="w-full rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 p-5 sm:p-7 shadow-xs transition-all">
      {/* Question Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {questionNumber && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-border/80">
              ข้อที่ {questionNumber}{totalQuestions ? `/${totalQuestions}` : ''}
            </span>
          )}
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 uppercase">
            CEFR {question.cefrLevel}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline font-semibold">
            • {question.skill}
          </span>
        </div>

        {isSubmitting && (
          <span className="flex items-center gap-1.5 text-xs text-[#FA5D5D] font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>กำลังตรวจคำตอบ...</span>
          </span>
        )}
      </div>

      {/* Prompts in Thai & English */}
      <div className="mb-5 space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed break-word-safe">
          {question.promptTh}
        </h3>
        {question.promptEn && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium break-word-safe">
            {question.promptEn}
          </p>
        )}
      </div>

      {/* Audio Player if Listening */}
      {question.audioScript && (
        <div className="mb-5">
          <AudioPlayer script={question.audioScript} title="Listening Track" />
        </div>
      )}

      {/* Context Passage or Fill in the Blank sentence */}
      {question.contextPassage && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-5 break-word-safe whitespace-pre-wrap font-sans">
          {question.contextPassage}
        </div>
      )}

      {/* Options List: Stacks vertically on small screens */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label="Choices">
        {question.options?.map((option) => {
          const isSelected = selectedOption === option.key;
          const isThisCorrect = isOptionCorrect(option.key, option.isCorrect);

          let btnStyle =
            'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-2 border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-2xs hover:border-[#FA5D5D]/50';

          if (submitted) {
            if (isPending && isSelected) {
              btnStyle = 'border-2 border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200 font-bold shadow-xs';
            } else if (isThisCorrect) {
              btnStyle = 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs';
            } else if (isSelected && !isThisCorrect) {
              btnStyle = 'border-2 border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold shadow-xs';
            } else {
              btnStyle = 'opacity-40 border-2 border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 shadow-none';
            }
          } else if (isSelected) {
            btnStyle = 'border-2 border-[#FA5D5D] bg-[#FA5D5D]/10 text-[#FA5D5D] dark:text-[#FF7575] font-bold ring-2 ring-[#FA5D5D]/20 shadow-xs';
          }

          return (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              disabled={submitted || isSubmitting}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all touch-target flex items-center justify-between gap-3 ${btnStyle} ${
                submitted || isSubmitting ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
              }`}
              role="radio"
              aria-checked={isSelected}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-xs border ${
                    submitted && isThisCorrect
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : submitted && isSelected && !isThisCorrect
                      ? 'bg-rose-500 text-white border-rose-500'
                      : isSelected
                      ? 'bg-[#FA5D5D] text-white border-[#FA5D5D]'
                      : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  {option.key}
                </span>
                <span className="text-xs sm:text-sm font-semibold break-word-safe">
                  {option.text}
                </span>
              </div>

              {submitted && (
                <div className="shrink-0 flex items-center gap-1 text-xs">
                  {isPending && isSelected && (
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Clock className="w-4 h-4" />
                      <span className="hidden xs:inline">รอการตรวจ</span>
                    </span>
                  )}
                  {!isPending && isThisCorrect && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-4 h-4" />
                      <span className="hidden xs:inline">ถูกต้อง</span>
                    </span>
                  )}
                  {!isPending && isSelected && !isThisCorrect && (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                      <X className="w-4 h-4" />
                      <span className="hidden xs:inline">ไม่ถูกต้อง</span>
                    </span>
                  )}
                </div>
              )}
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
