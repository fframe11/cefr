'use client';
import React, { useState } from 'react';
import { Layers, CheckCircle2, X, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GappedOption {
  key: string; // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  text: string;
}

export interface GappedTextProps {
  passageTitle: string;
  passageParagraphs: Array<{
    type: 'text' | 'gap';
    content?: string;
    gapNumber?: number; // 1 to 6
  }>;
  availableOptions: GappedOption[];
  assignedGaps: Record<number, string>; // { 1: 'C', 2: 'A', ... }
  onAssignGap: (gapNumber: number, optionKey: string) => void;
  onClearGap: (gapNumber: number) => void;
  disabled?: boolean;
  isReview?: boolean;
  correctAnswers?: Record<number, string>; // { 1: 'C', ... }
  explanation?: string;
}

export const GappedTextQuestion: React.FC<GappedTextProps> = ({
  passageTitle,
  passageParagraphs,
  availableOptions,
  assignedGaps,
  onAssignGap,
  onClearGap,
  disabled = false,
  isReview = false,
  correctAnswers = {},
  explanation,
}) => {
  const [activeGapNumber, setActiveGapNumber] = useState<number>(1);

  // Identify which options have already been assigned
  const assignedOptionMap = new Map<string, number>();
  for (const [gapNum, optKey] of Object.entries(assignedGaps)) {
    if (optKey) {
      assignedOptionMap.set(optKey, Number(gapNum));
    }
  }

  const handleOptionClick = (optionKey: string) => {
    if (disabled || isReview) return;
    onAssignGap(activeGapNumber, optionKey);
    // Auto advance to next unanswered gap
    for (let g = 1; g <= 6; g++) {
      if (!assignedGaps[g] && g !== activeGapNumber) {
        setActiveGapNumber(g);
        break;
      }
    }
  };

  return (
    <div className="w-full space-y-5 rounded-2xl border border-border/80 bg-white dark:bg-[#1E1B28] p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60 text-xs">
        <div>
          <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
            PART 6 • GAPPED TEXT (READING & USE OF ENGLISH)
          </span>
          <h3 className="text-sm font-extrabold text-foreground mt-0.5">{passageTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px]">
            6 Gaps • 7 Paragraphs (A–G)
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Six paragraphs have been removed from the article. Choose from the paragraphs <strong>A–G</strong> the one which fits each gap (<strong>1–6</strong>). There is one extra paragraph which you do not need to use.
      </p>

      {/* Main Split Layout: Reading Passage on Left, Paragraph Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reading Passage with Gaps */}
        <div className="lg:col-span-7 space-y-4 max-h-[620px] overflow-y-auto pr-2 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {passageParagraphs.map((part, idx) => {
            if (part.type === 'text') {
              return (
                <p key={idx} className="leading-relaxed">
                  {part.content}
                </p>
              );
            }

            const gapNum = part.gapNumber || 1;
            const assignedKey = assignedGaps[gapNum];
            const assignedOption = availableOptions.find((o) => o.key === assignedKey);
            const isActive = activeGapNumber === gapNum;
            const isCorrect = isReview && correctAnswers[gapNum] === assignedKey;

            return (
              <div
                key={idx}
                onClick={() => !disabled && !isReview && setActiveGapNumber(gapNum)}
                className={cn(
                  'p-3.5 rounded-xl border-2 transition-all cursor-pointer space-y-2',
                  isActive
                    ? 'border-[#FA5D5D] bg-[#FA5D5D]/5 ring-2 ring-[#FA5D5D]/20 shadow-xs'
                    : assignedKey
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-dashed border-border/80 bg-muted/30 hover:border-border'
                )}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 font-mono text-foreground">
                    <span className="h-5 w-5 rounded-md bg-[#FA5D5D] text-white flex items-center justify-center text-[10px]">
                      {gapNum}
                    </span>
                    <span>GAP [{gapNum}]</span>
                  </span>

                  {assignedKey && !isReview && !disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearGap(gapNum);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isReview && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[11px] font-mono font-bold',
                        isCorrect
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-rose-500/15 text-rose-600'
                      )}
                    >
                      {isCorrect ? 'Correct' : `Answer: ${correctAnswers[gapNum] || '?'}`}
                    </span>
                  )}
                </div>

                {assignedKey && assignedOption ? (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#1E1B28] border border-border/60 text-xs">
                    <span className="font-bold font-mono text-[#FA5D5D] mr-2">[{assignedKey}]</span>
                    <span>{assignedOption.text}</span>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-muted-foreground italic">
                    {isActive ? '👈 เลือกย่อหน้าจากด้านขวาเพื่อนำมาใส่ในช่องนี้' : 'คลิกเพื่อเลือกช่องนี้'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Paragraph Options Pool (A–G) */}
        <div className="lg:col-span-5 space-y-3 sticky top-20 max-h-[620px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-border/60 font-bold">
            <span className="text-slate-900 dark:text-white">ตัวเลือกย่อหน้า (A–G)</span>
            <span className="text-muted-foreground text-[11px]">
              กำลังเติมช่อง Gap [{activeGapNumber}]
            </span>
          </div>

          <div className="space-y-2.5">
            {availableOptions.map((opt) => {
              const placedInGap = assignedOptionMap.get(opt.key);
              const isAssigned = placedInGap !== undefined;

              return (
                <button
                  key={opt.key}
                  disabled={disabled || isReview}
                  onClick={() => handleOptionClick(opt.key)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all touch-target cursor-pointer flex flex-col gap-1.5',
                    isAssigned
                      ? 'bg-muted/40 border-border/40 opacity-75 text-muted-foreground'
                      : 'bg-white dark:bg-[#1E1B28] border-border/80 text-foreground hover:border-[#FA5D5D]/50 hover:shadow-xs active:scale-[0.99]'
                  )}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-xs">
                    <span className="px-2 py-0.5 rounded bg-muted text-[#FA5D5D] border border-border/40">
                      Paragraph [{opt.key}]
                    </span>
                    {isAssigned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-sans font-semibold">
                        ใส่ใน Gap [{placedInGap}] แล้ว
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-4 font-sans text-slate-700 dark:text-slate-300">
                    {opt.text}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Explanation */}
      {isReview && explanation && (
        <div className="mt-4 p-4 rounded-xl bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/70 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#FA5D5D]" />
            <span>คำอธิบายและจุดสังเกตความเชื่อมโยง (Cohesive Links):</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed font-sans">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};
