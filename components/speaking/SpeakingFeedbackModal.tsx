"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SpeakingEvaluationData, WordAnalysis } from "@/lib/speaking/types";

interface SpeakingFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SpeakingEvaluationData | null;
  onTryAgain?: () => void;
}

export function SpeakingFeedbackModal({
  isOpen,
  onClose,
  data,
  onTryAgain,
}: SpeakingFeedbackModalProps) {
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const { overall_score, cefr_band, metrics, words_analysis, feedback_th, attempt_id } = data;

  const metricItems = [
    { label: "Pronunciation", score: metrics.pronunciation_score, weight: "35%" },
    { label: "Fluency", score: metrics.fluency_score, weight: "25%" },
    { label: "Completeness", score: metrics.completeness_score, weight: "25%" },
    { label: "Prosody", score: metrics.prosody_score, weight: "15%" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border/50 bg-card p-6 shadow-lg text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Speaking Evaluation Report</h2>
              <p className="text-xs text-muted-foreground font-mono">Attempt ID: {attempt_id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Summary Card: Asymmetric 70/30 layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {/* CEFR & Overall score */}
          <div className="md:col-span-1 rounded-lg border border-border/40 bg-muted/20 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground font-medium mb-1">CEFR Band</span>
            <div className="inline-flex items-center justify-center rounded-lg px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-2xl tracking-wider mb-2">
              {cefr_band}
            </div>
            <div className="text-sm font-semibold text-foreground">
              {overall_score} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
            </div>
          </div>

          {/* 4 Dimension Metrics Breakdown */}
          <div className="md:col-span-2 rounded-lg border border-border/40 bg-muted/10 p-4 flex flex-col justify-between gap-2.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Core Speaking Metrics
            </span>
            <div className="grid grid-cols-2 gap-3">
              {metricItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground/80 font-medium">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.score >= 80
                          ? "bg-emerald-500"
                          : item.score >= 65
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Word-level Phonetic Analysis */}
        <div className="mb-5 rounded-lg border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Word-level Pronunciation Analysis
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              คลิกที่คำศัพท์เพื่อดู Phonetic Hint & คำแนะนำ
            </span>
          </div>

          {/* Interactive word tokens */}
          <div className="flex flex-wrap gap-2 p-3 rounded-md bg-muted/20 border border-border/30">
            {words_analysis.map((item, idx) => {
              const isError = item.error_type !== "None" || item.accuracy_score < 70;
              const isSelected = selectedWord?.word === item.word;

              return (
                <button
                  key={`${item.word}-${idx}`}
                  type="button"
                  onClick={() => setSelectedWord(item)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary/20",
                    isError
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/20",
                    isSelected && "ring-2 ring-primary ring-offset-1"
                  )}
                >
                  {item.word}
                  <span className="ml-1 text-[10px] opacity-75">
                    {item.accuracy_score}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Word Detail Callout */}
          {selectedWord && (
            <div className="mt-3 p-3 rounded-md bg-accent/20 border border-accent/40 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {selectedWord.word}
                  </span>
                  {selectedWord.phonetic_hint && (
                    <span className="font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                      {selectedWord.phonetic_hint}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Accuracy: {selectedWord.accuracy_score}% ({selectedWord.error_type})
                </span>
              </div>
              <p className="text-foreground/90 leading-relaxed">
                {selectedWord.tip_th || "การออกเสียงคำนี้อยู่ในเกณฑ์ถูกต้องและเป็นธรรมชาติ"}
              </p>
            </div>
          )}
        </div>

        {/* Thai Pedagogical Feedback */}
        <div className="mb-6 rounded-lg border border-border/40 bg-muted/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              คำแนะนำเพื่อการพัฒนาการออกเสียง
            </h4>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed font-normal">
            {feedback_th}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          {onTryAgain && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTryAgain();
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-xs font-medium text-foreground bg-background hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ลองพูดใหม่อีกครั้ง
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
