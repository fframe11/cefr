import React, { useState } from 'react';
import { WRITING_BANK } from '../../data/writingBank';
import { WritingPrompt } from '../../types';
import {
  PenTool,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Copy,
  Lightbulb,
  FileCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '../common/Toast';

export const WritingView: React.FC = () => {
  const { showToast } = useToast();
  const [selectedPromptId, setSelectedPromptId] = useState<string>(WRITING_BANK[0].id);
  const [userText, setUserText] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});

  const currentPrompt =
    WRITING_BANK.find((p) => p.id === selectedPromptId) || WRITING_BANK[0];

  const wordCount = userText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const isWithinWordCount =
    wordCount >= currentPrompt.minWords && wordCount <= currentPrompt.maxWords;
  const isUnderWordCount = wordCount < currentPrompt.minWords;

  const handleCopyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase);
    showToast('คัดลอกสำนวนแล้ว!', phrase, 'info');
  };

  const handleScoreChange = (criterion: string, score: number) => {
    setSelfScores((prev) => ({ ...prev, [criterion]: score }));
  };

  const handleSaveDraft = () => {
    showToast('บันทึกร่างงานเขียนแล้ว', `จำนวนคำปัจจุบัน: ${wordCount} คำ`, 'success');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Task Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {WRITING_BANK.map((p) => {
          const isSelected = p.id === currentPrompt.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPromptId(p.id);
                setUserText('');
                setShowModelAnswer(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {p.targetExam}
              </span>
              <span className="truncate max-w-[200px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Prompt & Guidelines on Left / Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Prompt & Helpful Phrases */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {currentPrompt.targetExam} • {currentPrompt.taskType}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {currentPrompt.minWords}-{currentPrompt.maxWords} words
              </span>
            </div>

            <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
              {currentPrompt.title}
            </h2>

            <p className="text-xs sm:text-sm text-foreground/90 font-medium bg-muted/40 p-3 rounded-lg border border-border/40">
              {currentPrompt.promptTh}
            </p>

            <div className="p-3.5 rounded-lg bg-background border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed whitespace-pre-line break-word-safe">
              {currentPrompt.promptEn}
            </div>

            {/* Checklist Guidelines */}
            <div className="pt-2 border-t border-border/40 space-y-2">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>เกณฑ์ที่ต้องมีในคำตอบ (Guidelines):</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {currentPrompt.guidelinesTh.map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Useful Phrases Box */}
          <div className="rounded-xl bg-card border border-border/60 p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>สำนวนแนะนำสำหรับงานเขียนนี้ (Useful Phrases):</span>
            </h4>
            <div className="space-y-2">
              {currentPrompt.usefulPhrases.map((phrase, i) => (
                <div
                  key={i}
                  onClick={() => handleCopyPhrase(phrase.phrase)}
                  className="p-2 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/40 hover:bg-muted/60 transition-colors cursor-pointer text-xs flex items-center justify-between gap-2 touch-target"
                >
                  <div>
                    <p className="font-semibold text-foreground">{phrase.phrase}</p>
                    <p className="text-[11px] text-muted-foreground">{phrase.meaningTh}</p>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Writing Editor & Rubric Scoring */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">พื้นที่เขียนคำตอบ (Your Writing)</h3>
              </div>

              {/* Word Count Meter */}
              <div
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                  isWithinWordCount
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isUnderWordCount
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {wordCount} / {currentPrompt.minWords}-{currentPrompt.maxWords} คำ
              </div>
            </div>

            <textarea
              rows={12}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Start drafting your response here in English..."
              className="w-full p-4 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed font-sans resize-y min-h-[220px]"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {isUnderWordCount
                  ? `ต้องการอีกอย่างน้อย ${currentPrompt.minWords - wordCount} คำ`
                  : isWithinWordCount
                  ? 'ความยาวคำเหมาะสมตามเกณฑ์'
                  : 'ระวัง! ความยาวเกินเกณฑ์กำหนด'}
              </span>

              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all touch-target"
              >
                บันทึกงานเขียน
              </button>
            </div>
          </div>

          {/* Model Answer Toggle */}
          <div className="rounded-xl bg-card border border-border/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">ตัวอย่างคำตอบระดับคะแนนเต็ม (Sample Model Answer)</h4>
                <p className="text-xs text-muted-foreground mt-0.5">ศึกษาโครงสร้างและการเลือกใช้คำศัพท์</p>
              </div>

              <button
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1 touch-target"
              >
                {showModelAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showModelAnswer ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างคำตอบ'}</span>
              </button>
            </div>

            {showModelAnswer && (
              <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/40 text-xs sm:text-sm font-serif text-foreground leading-relaxed whitespace-pre-line animate-in fade-in duration-200 break-word-safe">
                {currentPrompt.sampleModelAnswer}
              </div>
            )}
          </div>

          {/* Cambridge Rubrics Self-Assessment */}
          <div className="rounded-xl bg-card border border-border/60 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <FileCheck className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">
                เกณฑ์การตรวจข้อสอบ Cambridge (Assessment Rubrics)
              </h4>
            </div>

            <div className="space-y-3">
              {currentPrompt.rubrics.map((rubric) => {
                const currentScore = selfScores[rubric.criterion] || 0;
                return (
                  <div key={rubric.criterion} className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{rubric.criterion}</span>
                      <span className="font-mono text-primary font-bold">
                        {currentScore} / {rubric.maxScore} คะแนน
                      </span>
                    </div>
                    <p className="text-muted-foreground">{rubric.descriptionTh}</p>

                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: rubric.maxScore + 1 }).map((_, score) => (
                        <button
                          key={score}
                          onClick={() => handleScoreChange(rubric.criterion, score)}
                          className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors touch-target ${
                            currentScore === score
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'bg-muted hover:bg-card border border-border text-muted-foreground'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
