import React, { useState } from 'react';
import { READING_BANK } from '../../data/readingBank';
import { ReadingPassage } from '../../types';
import { QuestionCard } from '../common/QuestionCard';
import {
  BookMarked,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
} from 'lucide-react';

interface ReadingViewProps {
  onQuestionCompleted: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({ onQuestionCompleted }) => {
  const [selectedPassageId, setSelectedPassageId] = useState<string>(READING_BANK[0].id);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [mobilePassageCollapsed, setMobilePassageCollapsed] = useState(false);

  const currentPassage =
    READING_BANK.find((p) => p.id === selectedPassageId) || READING_BANK[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Passage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {READING_BANK.map((p) => {
          const isSelected = p.id === currentPassage.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPassageId(p.id);
                setMobilePassageCollapsed(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {p.cefrLevel}
              </span>
              <span className="truncate max-w-[200px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Responsive Grid: Split-screen on desktop (lg:grid-cols-12), stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Reading Passage (7 cols desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Passage Meta Bar */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {currentPassage.targetExam} • {currentPassage.cefrLevel}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {currentPassage.wordCount} words
                </span>
              </div>

              {/* Mobile Collapse Toggle to save screen height */}
              <button
                onClick={() => setMobilePassageCollapsed(!mobilePassageCollapsed)}
                className="lg:hidden text-xs text-primary font-medium flex items-center gap-1 touch-target"
              >
                <span>{mobilePassageCollapsed ? 'ขยายเนื้อหาบทความ' : 'ย่อบทความชั่วคราว'}</span>
                {mobilePassageCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
              {currentPassage.title}
            </h2>

            {/* Passage Body Text */}
            {!mobilePassageCollapsed && (
              <div className="text-sm sm:text-base text-foreground/90 font-serif leading-relaxed whitespace-pre-line space-y-3 pt-1 break-word-safe">
                {currentPassage.content}
              </div>
            )}

            {/* Vocabulary Glossary Drawer / Box */}
            <div className="mt-4 pt-4 border-t border-border/40">
              <button
                onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:underline touch-target"
              >
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>คลังคำศัพท์น่ารู้ในบทความนี้ (Glossary {currentPassage.vocabularyGlossary.length} คำ)</span>
                </div>
                {isGlossaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isGlossaryOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 animate-in fade-in duration-200">
                  {currentPassage.vocabularyGlossary.map((g, i) => (
                    <div key={i} className="text-xs flex items-baseline justify-between gap-2 p-1.5 rounded hover:bg-card">
                      <span className="font-mono font-bold text-foreground">{g.word}</span>
                      <span className="text-muted-foreground text-right">{g.meaningTh}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Questions Column (5 cols desktop, stacked on mobile) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>คำถามท้ายบทความ (Comprehension Questions)</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {currentPassage.questions.length} ข้อ
            </span>
          </div>

          <div className="space-y-4">
            {currentPassage.questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                questionNumber={idx + 1}
                totalQuestions={currentPassage.questions.length}
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
