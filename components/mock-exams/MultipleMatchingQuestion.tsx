'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export interface MatchingSection {
  key: string; // 'A' | 'B' | 'C' | 'D'
  title: string;
  text: string;
}

interface MultipleMatchingProps {
  questionNumber: number;
  statement: string;
  sections: MatchingSection[];
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
  disabled?: boolean;
  isReview?: boolean;
  correctKey?: string;
  isCorrect?: boolean | null;
  explanation?: string;
}

export const MultipleMatchingQuestion: React.FC<MultipleMatchingProps> = ({
  questionNumber,
  statement,
  sections,
  selectedKey,
  onSelectKey,
  disabled = false,
  isReview = false,
  correctKey,
  isCorrect,
  explanation,
}) => {
  return (
    <div className="w-full space-y-4 rounded-2xl border border-border/80 bg-white dark:bg-[#1E1B28] p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
          PART 7 • MULTIPLE MATCHING #{questionNumber}
        </span>
        <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px]">
          Match statement to person/section
        </span>
      </div>

      {/* Target Question Statement */}
      <div className="p-4 rounded-xl bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/70 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-3">
        <span className="h-6 w-6 rounded-lg bg-[#FA5D5D] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
          {questionNumber}
        </span>
        <span className="leading-relaxed">{statement}</span>
      </div>

      {/* Available Sections Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {sections.map((sec) => {
          const isSelected = selectedKey === sec.key;
          const isReviewCorrect = isReview && correctKey === sec.key;
          const isReviewWrong = isReview && isSelected && !isCorrect;

          return (
            <button
              key={sec.key}
              disabled={disabled || isReview}
              onClick={() => onSelectKey(sec.key)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all touch-target cursor-pointer flex flex-col gap-2',
                isSelected
                  ? isReview
                    ? isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20'
                      : 'bg-rose-500/10 border-rose-500/50 ring-2 ring-rose-500/20'
                    : 'bg-[#FA5D5D]/10 border-[#FA5D5D] ring-2 ring-[#FA5D5D]/20 shadow-xs'
                  : 'bg-white dark:bg-[#1E1B28] border-border/80 hover:border-border hover:bg-muted/40'
              )}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-6 w-6 rounded-md flex items-center justify-center font-mono font-bold text-xs',
                      isSelected
                        ? 'bg-[#FA5D5D] text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {sec.key}
                  </span>
                  <span className="text-foreground">{sec.title}</span>
                </span>

                {isReviewCorrect && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-bold">
                    Correct
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {sec.text}
              </p>
            </button>
          );
        })}
      </div>

      {/* Review Explanation */}
      {isReview && explanation && (
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
  );
};
