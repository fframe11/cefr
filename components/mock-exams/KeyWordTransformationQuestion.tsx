'use client';
import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyWordTransformationProps {
  questionNumber: number;
  originalSentence: string;
  keyWord: string;
  targetPrefix: string;
  targetSuffix: string;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
  isReview?: boolean;
  correctAnswer?: string;
  isCorrect?: boolean | null;
  explanation?: string;
}

export const KeyWordTransformationQuestion: React.FC<KeyWordTransformationProps> = ({
  questionNumber,
  originalSentence,
  keyWord,
  targetPrefix,
  targetSuffix,
  userAnswer,
  onAnswerChange,
  disabled = false,
  isReview = false,
  correctAnswer,
  isCorrect,
  explanation,
}) => {
  // Calculate word count
  const words = userAnswer.trim() ? userAnswer.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const isWordCountValid = wordCount >= 3 && wordCount <= 6;
  const isTooLong = wordCount > 6;
  const containsKeyWord = userAnswer.toUpperCase().includes(keyWord.toUpperCase());

  return (
    <div className="w-full space-y-4 rounded-2xl border border-border/80 bg-white dark:bg-[#1E1B28] p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
          PART 4 • KEY WORD TRANSFORMATION #{questionNumber}
        </span>
        <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-[11px]">
          3–6 Words Allowed
        </span>
      </div>

      {/* Instructions */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Complete the second sentence so that it has a similar meaning to the first sentence, using the word given.
        <strong className="text-slate-900 dark:text-white"> Do not change the word given.</strong> You must use between three and six words, including the word given.
      </p>

      {/* Original Sentence */}
      <div className="p-4 rounded-xl bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/70 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
        <span className="font-bold text-slate-500 dark:text-slate-400 mr-2">Original:</span>
        {originalSentence}
      </div>

      {/* Prominent Key Word Badge */}
      <div className="flex items-center gap-3 py-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Key Word:
        </span>
        <span className="px-4 py-1.5 rounded-xl font-mono font-black text-sm tracking-widest bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
          {keyWord.toUpperCase()}
        </span>
      </div>

      {/* Target Sentence with Interactive Gap */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181522] border-2 border-dashed border-[#FA5D5D]/30 space-y-3">
        <div className="text-xs sm:text-sm leading-loose text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-2">
          {targetPrefix && <span className="font-semibold">{targetPrefix}</span>}

          <div className="relative inline-block min-w-[240px] flex-1 max-w-full">
            <input
              type="text"
              disabled={disabled || isReview}
              value={userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="type missing words here..."
              className={cn(
                'w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wide border transition-all focus:outline-hidden',
                isReview
                  ? isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-300'
                  : 'bg-white dark:bg-[#1E1B28] border-border text-foreground focus:ring-2 focus:ring-[#FA5D5D]/30 focus:border-[#FA5D5D]'
              )}
            />
          </div>

          {targetSuffix && <span className="font-semibold">{targetSuffix}</span>}
        </div>

        {/* Live Word Counter & Guidance */}
        {!isReview && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md font-mono font-bold',
                  isTooLong
                    ? 'bg-rose-500/15 text-rose-600'
                    : isWordCountValid
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {wordCount} words
              </span>
              <span className="text-muted-foreground">(Must be 3–6 words)</span>
            </div>

            {userAnswer.trim().length > 0 && !containsKeyWord && (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                Must include "{keyWord}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Review Mode: Reveal Correct Answer & Explanation */}
      {isReview && (
        <div className="space-y-2 pt-2">
          {correctAnswer && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                Correct Answer:
              </span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                {correctAnswer}
              </span>
            </div>
          )}

          {explanation && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/70 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-[#FA5D5D]" />
                <span>Explanation:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed font-sans">
                {explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
