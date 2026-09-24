import React, { useState } from 'react';
import { GRAMMAR_BANK } from '../../data/grammarBank';
import { GrammarTopic, CEFRLevel } from '../../types';
import { QuestionCard } from '../common/QuestionCard';
import {
  Sparkles,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  X,
  Check,
} from 'lucide-react';

interface GrammarViewProps {
  onQuestionCompleted: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
  activeTopicId?: string;
}

export const GrammarView: React.FC<GrammarViewProps> = ({
  onQuestionCompleted,
  activeTopicId,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    activeTopicId || GRAMMAR_BANK[0].id
  );

  const currentTopic =
    GRAMMAR_BANK.find((t) => t.id === selectedTopicId) || GRAMMAR_BANK[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Topic Switcher Pills (Horizontal on mobile/tablet) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GRAMMAR_BANK.map((topic) => {
          const isSelected = topic.id === currentTopic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {topic.cefrLevel}
              </span>
              <span className="truncate max-w-[200px]">{topic.titleTh}</span>
            </button>
          );
        })}
      </div>

      {/* Main Learning Interface: 2-column on desktop, stacked on mobile/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 7 cols): Explanation & Examples */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                CEFR {currentTopic.cefrLevel}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {currentTopic.titleEn}
              </span>
            </div>

            <h2 className="text-fluid-title font-bold text-foreground tracking-tight">
              {currentTopic.titleTh}
            </h2>

            <p className="text-sm text-foreground/90 leading-relaxed font-medium bg-muted/30 p-3 rounded-lg border border-border/40 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{currentTopic.summaryTh}</span>
            </p>

            {/* Detailed Explanation in Thai */}
            <div className="pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-2">
              {currentTopic.conceptTh}
            </div>
          </div>

          {/* Formulas and Rules */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>โครงสร้างประโยคและหลักการใช้งาน (Grammar Formulas)</span>
            </h3>

            <div className="space-y-3">
              {currentTopic.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-2"
                >
                  <div className="font-mono text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 inline-block break-word-safe">
                    {rule.formula}
                  </div>
                  <p className="text-xs text-muted-foreground">{rule.explanationTh}</p>

                  <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
                    <p className="font-medium text-foreground">{rule.exampleEn}</p>
                    <p className="text-muted-foreground mt-0.5">{rule.exampleTh}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes by Thai Learners */}
          {currentTopic.commonMistakes && currentTopic.commonMistakes.length > 0 && (
            <div className="p-4 rounded-xl bg-card border border-rose-500/20 shadow-xs space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>ข้อผิดพลาดที่พบบ่อยของผู้เรียนไทย (Common Pitfalls)</span>
              </h3>

              <div className="space-y-2.5">
                {currentTopic.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="text-xs space-y-1 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <p className="text-rose-400 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-through">{mistake.incorrect}</span>
                    </p>
                    <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{mistake.correct}</span>
                    </p>
                    <p className="text-muted-foreground text-[11px] pt-1 pl-5">{mistake.reasonTh}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Desktop 5 cols): Interactive Practice Questions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>แบบฝึกหัดวัดความเข้าใจ (Practice Quiz)</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {currentTopic.practiceQuestions.length} ข้อ
            </span>
          </div>

          <div className="space-y-4">
            {currentTopic.practiceQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                questionNumber={idx + 1}
                totalQuestions={currentTopic.practiceQuestions.length}
                showExplanationImmediately={true}
                onAnswer={(selectedKey, isCorrect) => {
                  onQuestionCompleted(q.id, isCorrect, q.weaknessTag);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
