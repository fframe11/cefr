"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  BookOpen,
  Award,
  History,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SpeakingRecorder } from "@/components/speaking/SpeakingRecorder";
import { SpeakingFeedbackModal } from "@/components/speaking/SpeakingFeedbackModal";
import { SPEAKING_PROMPTS } from "@/lib/speaking/prompts";
import { SpeakingEvaluationData, SpeakingPrompt } from "@/lib/speaking/types";
import { cn } from "@/lib/utils";

export default function SpeakingLabPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt>(
    SPEAKING_PROMPTS[3] // Default to B2 prompt
  );
  const [evaluationResult, setEvaluationResult] = useState<SpeakingEvaluationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<SpeakingEvaluationData[]>([]);

  const handleEvaluationComplete = (data: SpeakingEvaluationData) => {
    setEvaluationResult(data);
    setIsModalOpen(true);
    setHistory((prev) => [data, ...prev]);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                CEFR Speaking Lab
              </h1>
              <p className="text-[11px] text-muted-foreground">
                AI Speech Evaluation Engine & Pronunciation Scoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              TASK-01 Engine Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Canvas: Speaking Recorder & Active Prompt (70% - 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Active Prompt Card */}
            <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Level {selectedPrompt.cefr_level}
                </span>
                <span className="text-xs text-muted-foreground">
                  Topic: {selectedPrompt.topic}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-2">
                {selectedPrompt.title}
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                {selectedPrompt.question}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground font-medium mr-1">
                  Target Keywords:
                </span>
                {selectedPrompt.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/30"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Speaking Recorder Component */}
            <SpeakingRecorder
              key={selectedPrompt.id}
              promptId={selectedPrompt.id}
              referenceText={selectedPrompt.reference_text}
              targetCefr={selectedPrompt.cefr_level}
              onEvaluationComplete={handleEvaluationComplete}
            />
          </div>

          {/* Right Sidebar: Prompt Selection & Attempt History (30% - 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Prompt Selector Matrix */}
            <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Speaking Task
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                {SPEAKING_PROMPTS.map((prompt) => {
                  const isSelected = prompt.id === selectedPrompt.id;
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => setSelectedPrompt(prompt)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between text-xs",
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground font-medium shadow-sm"
                          : "border-border/40 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "font-bold text-[10px] px-1.5 py-0.5 rounded",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            {prompt.cefr_level}
                          </span>
                          <span className="font-medium text-foreground">
                            {prompt.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {prompt.topic}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Attempts History */}
            <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Evaluations ({history.length})
                </h3>
              </div>

              {history.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  ยังไม่มีประวัติการประเมินในรอบนี้
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                  {history.map((item, idx) => (
                    <button
                      key={`${item.attempt_id}-${idx}`}
                      type="button"
                      onClick={() => {
                        setEvaluationResult(item);
                        setIsModalOpen(true);
                      }}
                      className="w-full text-left p-2.5 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.attempt_id}
                        </span>
                        <span className="font-medium text-foreground">
                          Band {item.cefr_band} ({item.overall_score}/100)
                        </span>
                      </div>
                      <span className="text-[11px] text-primary font-medium">
                        ดูผล
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback & Score Modal */}
      <SpeakingFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={evaluationResult}
        onTryAgain={() => setIsModalOpen(false)}
      />
    </main>
  );
}
