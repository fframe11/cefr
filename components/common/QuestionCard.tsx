'use client';
import React, { useState } from 'react';
import { Question } from '../../types';
import { Check, X, HelpCircle, ArrowRight, Clock, Loader2 } from 'lucide-react';
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
    <div className="w-full rounded-xl bg-card border border-border/70 p-4 sm:p-6 shadow-xs transition-all">
      {/* Question Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {questionNumber && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
              ข้อที่ {questionNumber}{totalQuestions ? `/${totalQuestions}` : ''}
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
            CEFR {question.cefrLevel}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline">
            • {question.skill}
          </span>
        </div>

        {isSubmitting && (
          <span className="flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>กำลังตรวจคำตอบ...</span>
          </span>
        )}
      </div>

      {/* Prompts in Thai & English */}
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-foreground break-word-safe">
          {question.promptTh}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-word-safe">
          {question.promptEn}
        </p>
      </div>

      {/* Audio Player if Listening */}
      {question.audioScript && (
        <div className="mb-4">
          <AudioPlayer script={question.audioScript} title="Listening Track" />
        </div>
      )}

      {/* Context Passage or Fill in the Blank sentence */}
      {question.contextPassage && (
        <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-foreground font-mono text-sm leading-relaxed mb-4 break-word-safe whitespace-pre-wrap">
          {question.contextPassage}
        </div>
      )}

      {/* Options List: Stacks vertically on small screens */}
      <div className="space-y-2.5 mb-5" role="radiogroup" aria-label="Choices">
        {question.options?.map((option) => {
          const isSelected = selectedOption === option.key;
          const isThisCorrect = isOptionCorrect(option.key, option.isCorrect);

          let btnStyle =
            'bg-slate-100 dark:bg-[#1C2430] hover:bg-[#253040] border-2 border-slate-200/80 dark:border-white/10 dark:border-[rgba(255,255,255,0.1)] text-slate-900 dark:text-[#EDEBE8] shadow-[0_3.5px_0_0_#0D1318] active:translate-y-[3.5px] active:shadow-none';

          if (submitted) {
            if (isPending && isSelected) {
              btnStyle = 'border-2 border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-200 font-bold shadow-[0_3.5px_0_0_#D97706]';
            } else if (isThisCorrect) {
              btnStyle = 'border-2 border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold shadow-[0_3.5px_0_0_#059669]';
            } else if (isSelected && !isThisCorrect) {
              btnStyle = 'border-2 border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200 font-bold shadow-[0_3.5px_0_0_#E11D48]';
            } else {
              btnStyle = 'opacity-40 border-2 border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A22]/50 dark:bg-[#1A232C]/50 text-muted-foreground shadow-none';
            }
          } else if (isSelected) {
            btnStyle = 'border-2 border-[#5B5CE2] bg-[#5B5CE2]/15 text-[#5B5CE2] dark:text-[#8283FF] font-bold ring-2 ring-[#5B5CE2]/20 shadow-[0_3.5px_0_0_#38399E] active:translate-y-[3.5px] active:shadow-none';
          }

          return (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              disabled={submitted || isSubmitting}
              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all touch-target flex items-center justify-between gap-3 ${btnStyle} ${
                submitted || isSubmitting ? 'cursor-default' : 'cursor-pointer'
              }`}
              role="radio"
              aria-checked={isSelected}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs border ${
                    submitted && isThisCorrect
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : submitted && isSelected && !isThisCorrect
                      ? 'bg-rose-500 text-white border-rose-500'
                      : isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {option.key}
                </span>
                <span className="text-sm font-normal text-foreground break-word-safe">
                  {option.text}
                </span>
              </div>

              {submitted && (
                <div className="shrink-0 flex items-center gap-1 text-xs">
                  {isPending && isSelected && (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Clock className="w-4 h-4" />
                      <span className="hidden xs:inline">รอการตรวจ</span>
                    </span>
                  )}
                  {!isPending && isThisCorrect && (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Check className="w-4 h-4" />
                      <span className="hidden xs:inline">ถูกต้อง</span>
                    </span>
                  )}
                  {!isPending && isSelected && !isThisCorrect && (
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
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
          className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all touch-target ${
            selectedOption && !isSubmitting
              ? 'bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white shadow-[0_4px_0_0_#38399E] active:translate-y-[4px] active:shadow-none border-t border-white/25 cursor-pointer'
              : 'bg-white dark:bg-[#141A22] dark:bg-[#1A232C] text-muted-foreground cursor-not-allowed shadow-none'
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
          className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
            isPending
              ? 'bg-amber-500/5 border-amber-500/20'
              : isCorrect
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-rose-500/5 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
            {isPending ? (
              <span className="text-amber-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> บันทึกคำตอบแล้ว (รอผลการประเมินจากผู้ตรวจ/ระบบ)
              </span>
            ) : isCorrect ? (
              <span className="text-emerald-500 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> ยอดเยี่ยม! ตอบถูกต้อง
              </span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1.5">
                <X className="w-4 h-4" /> ยังไม่ถูกต้อง
              </span>
            )}
          </div>

          {/* Option Specific Feedback */}
          {feedbackText && (
            <p className="text-xs font-medium text-foreground mb-2 break-word-safe">
              • {feedbackText}
            </p>
          )}

          {/* Core Grammar/Vocabulary Explanation in Thai */}
          {(explanationTh || explanationEn) && (
            <div className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40 space-y-1">
              <p className="font-medium text-foreground flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                {t('common.explanation')}:
              </p>
              {explanationTh && <p className="text-foreground/90 pl-4 break-word-safe">{explanationTh}</p>}
              {explanationEn && (
                <p className="text-muted-foreground pl-4 text-[11px] italic break-word-safe">
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
