'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  Lock,
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { getWritingPrompts, mapWritingDtoToPrompt } from '../../lib/api/content/writing';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../i18n';

export const WritingView: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<WritingPrompt[]>(WRITING_BANK);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(WRITING_BANK[0]?.id || '');
  const [userText, setUserText] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Fetch prompts from API
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWritingPrompts({ page: 1, limit: 50 });
      if (res && res.prompts && res.prompts.length > 0) {
        const mapped = res.prompts.map(mapWritingDtoToPrompt);
        setPrompts(mapped);
        if (!selectedPromptId || !mapped.some((p) => p.id === selectedPromptId)) {
          setSelectedPromptId(mapped[0].id);
        }
      } else {
        setPrompts(WRITING_BANK);
      }
    } catch (err: any) {
      console.warn('[WritingView] API fetch failed, falling back to static writing bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดหัวข้อเขียนจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setPrompts(WRITING_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedPromptId]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const currentPrompt = prompts.find((p) => p.id === selectedPromptId) || prompts[0] || WRITING_BANK[0];

  const wordCount = userText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const isWithinWordCount =
    wordCount >= currentPrompt?.minWords && wordCount <= currentPrompt?.maxWords;
  const isUnderWordCount = wordCount < currentPrompt?.minWords;

  const handleCopyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase);
    showToast('คัดลอกสำนวนแล้ว!', phrase, 'info');
  };

  const handleScoreChange = (criterion: string, score: number) => {
    setSelfScores((prev) => ({ ...prev, [criterion]: score }));
  };

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    showToast('บันทึกร่างงานเขียนแล้ว', `จำนวนคำปัจจุบัน: ${wordCount} คำ`, 'success');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Task Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {prompts.map((p) => {
          const isSelected = p.id === currentPrompt?.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPromptId(p.id);
                setUserText('');
                setShowModelAnswer(false);
                setIsDraftSaved(false);
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

      {loading && prompts.length === 0 && (
        <div className="p-12 flex justify-center">
          <LoadingSpinner size="lg" text="กำลังโหลดหัวข้อเขียน..." />
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={fetchPrompts} />
      )}

      {currentPrompt && (
        /* Main Grid: Prompt & Guidelines on Left / Editor on Right */
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

              {/* Writing Guidelines / Checklist */}
              {currentPrompt.guidelinesTh && currentPrompt.guidelinesTh.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>ข้อกำหนดและคำแนะนำในการเขียน:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {currentPrompt.guidelinesTh.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Useful Phrases */}
              {currentPrompt.usefulPhrases && currentPrompt.usefulPhrases.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('writing.useful_phrases')}:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {currentPrompt.usefulPhrases.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCopyPhrase(item.phrase)}
                        className="group p-2 rounded-lg bg-muted/30 hover:bg-primary/10 border border-border/40 hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground font-mono group-hover:text-primary">
                            {item.phrase}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{item.meaningTh}</p>
                        </div>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Writing Editor & Rubric Self-Check */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">{t('writing.your_writing')}</h3>
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

            {/* Model Answer View (Security Restricted prior to submission) */}
            <div className="rounded-xl bg-card border border-border/60 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{t('writing.model_answer')}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">ศึกษาโครงสร้างและการเลือกใช้คำศัพท์</p>
                </div>

                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 touch-target"
                >
                  {showModelAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showModelAnswer ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างคำตอบ'}</span>
                </button>
              </div>

              {showModelAnswer && (
                <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm font-serif leading-relaxed whitespace-pre-line text-foreground/90 animate-in fade-in duration-200 break-word-safe">
                  {currentPrompt.sampleModelAnswer ? (
                    currentPrompt.sampleModelAnswer
                  ) : (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        ตัวอย่างคำตอบของโจทย์ข้อนี้อยู่ในการควบคุมของระบบตรวจข้อสอบ
                        (Model answer is available after post-submission evaluation according to test security policy)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cambridge Rubric Self-Assessment Checklist */}
            {currentPrompt.rubrics && currentPrompt.rubrics.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">
                    {t('writing.self_assessment_rubric')}
                  </h4>
                </div>

                <div className="space-y-3 pt-1">
                  {currentPrompt.rubrics.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{r.criterion}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleScoreChange(r.criterion, score)}
                              className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all touch-target ${
                                (selfScores[r.criterion] || 0) === score
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background hover:bg-muted text-muted-foreground border border-border'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{r.descriptionTh}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
