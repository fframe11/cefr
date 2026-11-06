"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Mic,
  BookOpen,
  Award,
  History,
  RotateCcw,
  Sparkles,
  Shuffle,
  Volume2,
  Filter,
  CheckCircle2,
  ChevronRight,
  Flame,
} from "lucide-react";
import { SpeakingRecorder } from "@/components/speaking/SpeakingRecorder";
import { SpeakingFeedbackModal } from "@/components/speaking/SpeakingFeedbackModal";
import {
  SPEAKING_SENTENCE_BANK,
  getAvailableTopics,
  getSentencesByFilter,
} from "@/lib/speaking/sentence-bank";
import {
  initPracticeQueueState,
  popNextPracticeSentence,
  loadLocalQueueState,
  saveLocalQueueState,
} from "@/lib/speaking/queue-engine";
import {
  CEFRLevel,
  PracticeQueueState,
  SpeakingEvaluationData,
  SpeakingMode,
  SpeakingSentence,
} from "@/lib/speaking/types";
import { cn } from "@/lib/utils";

const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export default function SpeakingLabPage() {
  // Navigation & Filter States
  const [activeMode, setActiveMode] = useState<SpeakingMode>("read_aloud");
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B1");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Queue & Sentence States
  const [queueState, setQueueState] = useState<PracticeQueueState>(() => {
    return initPracticeQueueState("B1", "all", "read_aloud");
  });
  const [currentSentence, setCurrentSentence] = useState<SpeakingSentence | null>(null);
  const [queueProgress, setQueueProgress] = useState({
    currentInRound: 1,
    totalInRound: 1,
    roundNumber: 1,
  });

  // Modal & History States
  const [evaluationResult, setEvaluationResult] = useState<SpeakingEvaluationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<SpeakingEvaluationData[]>([]);

  // Available topics for active level
  const availableTopics = useMemo(() => {
    return ["all", ...getAvailableTopics(selectedLevel)];
  }, [selectedLevel]);

  // Initialise or advance queue when level, topic, or mode changes
  const resetOrLoadQueue = useCallback(
    (level: CEFRLevel, topic: string, mode: SpeakingMode) => {
      // Try loading existing state from localStorage
      const cached = loadLocalQueueState(level, topic, mode);
      const stateToUse = cached || initPracticeQueueState(level, topic, mode);

      const popResult = popNextPracticeSentence(stateToUse);
      if (popResult.sentence) {
        setCurrentSentence(popResult.sentence);
        setQueueState(popResult.updatedState);
        setQueueProgress(popResult.progress);
        saveLocalQueueState(popResult.updatedState);
      } else {
        // Fallback to first available matching sentence
        const fallback = getSentencesByFilter({ cefrLevel: level, topic, mode })[0] || null;
        setCurrentSentence(fallback);
      }
    },
    []
  );

  // Sync on level, topic, or mode change
  useEffect(() => {
    resetOrLoadQueue(selectedLevel, selectedTopic, activeMode);
  }, [selectedLevel, selectedTopic, activeMode, resetOrLoadQueue]);

  // Handle "Next Sentence" request (Shuffle Without Replacement)
  const handleNextSentence = useCallback(() => {
    const popResult = popNextPracticeSentence(queueState);
    if (popResult.sentence) {
      setCurrentSentence(popResult.sentence);
      setQueueState(popResult.updatedState);
      setQueueProgress(popResult.progress);
      saveLocalQueueState(popResult.updatedState);
    }
  }, [queueState]);

  // Handle Evaluation Completion
  const handleEvaluationComplete = (data: SpeakingEvaluationData) => {
    setEvaluationResult(data);
    setIsModalOpen(true);
    setHistory((prev) => [data, ...prev]);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Top Header Navigation */}
      <header className="border-b border-border/40 bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-foreground">
                  CEFR Speaking Lab
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  v2.0 Bank Active
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sentence Bank & Randomized Practice Queue (Shuffle Without Replacement)
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center rounded-lg bg-muted/60 p-1 border border-border/40">
            <button
              type="button"
              onClick={() => setActiveMode("read_aloud")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                activeMode === "read_aloud"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Read Aloud
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("free_speaking")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                activeMode === "free_speaking"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mic className="w-3.5 h-3.5 text-amber-500" />
              Free Speaking
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Level and Topic Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40">
          {/* CEFR Level Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-muted-foreground mr-1.5 shrink-0">
              CEFR Level:
            </span>
            {CEFR_LEVELS.map((level) => {
              const isSelected = selectedLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(level);
                    setSelectedTopic("all");
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/40"
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              Topic:
            </span>
            {availableTopics.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors shrink-0",
                    isSelected
                      ? "bg-foreground/10 text-foreground border border-foreground/20 font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 border border-transparent"
                  )}
                >
                  {topic === "all" ? "ทั้งหมด (All)" : topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* 70/30 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Canvas: Speaking Recorder & Active Sentence (70% - 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Active Task Card */}
            {currentSentence ? (
              <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      Level {currentSentence.cefrLevel}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      หมวดหมู่: {currentSentence.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      ความยาก: {currentSentence.difficulty}/100
                    </span>
                    <button
                      type="button"
                      onClick={handleNextSentence}
                      title="สุ่มประโยคถัดไปโดยไม่ซ้ำในรอบ"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      สุ่มข้อถัดไป
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-foreground mb-1.5">
                  {currentSentence.promptTitle}
                </h2>

                {activeMode === "free_speaking" ? (
                  <p className="text-sm text-foreground/90 leading-relaxed mb-4 font-medium">
                    {currentSentence.contextOrQuestion || currentSentence.sentence}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {currentSentence.contextOrQuestion}
                  </p>
                )}

                {/* Target Keywords */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/30">
                  <span className="text-xs text-muted-foreground font-semibold mr-1">
                    คำศัพท์สำคัญ (Target Keywords):
                  </span>
                  {currentSentence.targetKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/40"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/40 bg-card p-8 text-center text-muted-foreground text-sm">
                ไม่พบประโยคสำหรับเงื่อนไขที่เลือก กรุณาเลือกหมวดหมู่อื่น
              </div>
            )}

            {/* Speaking Recorder Component */}
            {currentSentence && (
              <SpeakingRecorder
                key={currentSentence.id}
                promptId={currentSentence.id}
                referenceText={currentSentence.sentence}
                targetCefr={currentSentence.cefrLevel}
                mode={activeMode}
                contextOrQuestion={currentSentence.contextOrQuestion}
                promptTitle={currentSentence.promptTitle}
                targetKeywords={currentSentence.targetKeywords}
                queueProgress={queueProgress}
                onNextSentence={handleNextSentence}
                onEvaluationComplete={handleEvaluationComplete}
              />
            )}
          </div>

          {/* Right Sidebar: Queue Status & Attempt History (30% - 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Queue Progression Box */}
            <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Randomized Queue
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-primary">
                  รอบที่ {queueProgress.roundNumber}
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ประโยคในรอบนี้:</span>
                  <span className="font-semibold text-foreground">
                    {queueProgress.currentInRound} / {queueProgress.totalInRound}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (queueProgress.currentInRound / (queueProgress.totalInRound || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ระบบใช้ <strong>Shuffle Without Replacement</strong> สุ่มประโยคไม่ซ้ำกันในรอบเดียวกัน และบันทึกประวัติเพื่อไม่ให้เจอประโยคเดิม
              </p>
            </div>

            {/* Recent Evaluations History */}
            <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recent Evaluations ({history.length})
                </h3>
              </div>

              {history.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  ยังไม่มีประวัติการประเมินในรอบนี้
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
                  {history.map((item, idx) => (
                    <button
                      key={`${item.attempt_id}-${idx}`}
                      type="button"
                      onClick={() => {
                        setEvaluationResult(item);
                        setIsModalOpen(true);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {item.attempt_id}
                          </span>
                          {item.mode && (
                            <span className="text-[10px] px-1 rounded bg-muted text-muted-foreground">
                              {item.mode === "free_speaking" ? "Free" : "Aloud"}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-foreground">
                          {item.cefr_band ? `Band ${item.cefr_band}` : "งดประเมิน"}{" "}
                          ({item.overall_score !== null ? `${item.overall_score}/100` : "N/A"})
                        </span>
                      </div>
                      <span className="text-[11px] text-primary font-medium">
                        ดูผล &rarr;
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
