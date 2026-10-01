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
  Clock,
  Send,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { getWritingPrompts, mapWritingDtoToPrompt } from '../../lib/api/content/writing';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import {
  GlovaSectionHeader,
  GlovaLevelBadge,
  GlovaButton,
  GlovaCard,
  GlovaBadge,
  GlovaImage,
} from '../ui';
import {
  TactileButton,
  SpotlightCard,
  BorderBeam,
  DecryptedText,
  ShinyText,
  TacticalHudFrame,
} from '../ui/GlovaPrimitives';
import { useTranslation } from '../../i18n';

export const WritingView: React.FC = () => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<WritingPrompt[]>(WRITING_BANK);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(WRITING_BANK[0]?.id || '');
  const [userText, setUserText] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    currentPrompt && wordCount >= currentPrompt.minWords && wordCount <= currentPrompt.maxWords;
  const isUnderWordCount = currentPrompt && wordCount < currentPrompt.minWords;
  const isOverWordCount = currentPrompt && wordCount > currentPrompt.maxWords;

  const handleCopyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase);
    showToast(isEn ? 'Copied phrase' : 'คัดลอกสำนวนแล้ว', phrase, 'info');
  };

  const handleSaveDraft = () => {
    showToast(
      isEn ? 'Draft saved' : 'บันทึกแบบร่างแล้ว',
      isEn ? `Saved ${wordCount} words` : `บันทึกงานเขียน ${wordCount} คำเรียบร้อย`,
      'success'
    );
  };

  const handleSubmit = () => {
    if (wordCount < 5) {
      showToast(
        isEn ? 'Please write your response' : 'กรุณาเขียนคำตอบก่อนส่ง',
        isEn ? 'Minimum content required' : 'ต้องการเนื้อหาอย่างน้อยเพื่อทำการบันทึก',
        'info'
      );
      return;
    }
    setIsSubmitted(true);
    showToast(
      isEn ? 'Writing submitted' : 'ส่งงานเขียนเข้าสู่ระบบแล้ว',
      isEn ? 'Response recorded for assessment' : 'บันทึกคำตอบแล้ว — อยู่ระหว่างรอการประเมินผล',
      'success'
    );
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2155E6]/15 text-[#2155E6] dark:text-[#6893FF] border border-[#2155E6]/25">
              <DecryptedText text="WRITING LAB" speed={40} maxIterations={12} revealDirection="start" />
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isEn ? 'Writing & Production Studio' : 'ทักษะการเขียนและการสื่อสาร'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            {isEn
              ? 'Practice written expression, essay structuring, and authentic Cambridge writing tasks.'
              : 'ฝึกเขียนบทความ อีเมล และรายงานตามเกณฑ์ประเมินสากล พร้อมเกณฑ์ Self-Assessment'}
          </p>
        </div>

        {currentPrompt && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <GlovaLevelBadge level={currentPrompt.cefrLevel} size="md" />
            <GlovaBadge variant="secondary" size="sm">
              {currentPrompt.taskType}
            </GlovaBadge>
            <GlovaBadge variant="outline" size="sm">
              {currentPrompt.targetExam}
            </GlovaBadge>
          </div>
        )}
      </div>

      {/* Task Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {prompts.map((p) => {
          const isSelected = p.id === currentPrompt?.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPromptId(p.id);
                setUserText('');
                setIsSubmitted(false);
                setShowModelAnswer(false);
              }}
              className={`touch-target px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#2155E6] text-white border-[#2155E6] shadow-sm shadow-[#2155E6]/25 font-bold ring-2 ring-[#2155E6]/20'
                  : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-slate-200/80 dark:border-white/10 hover:bg-white dark:bg-[#0B1224] dark:hover:bg-[#15203B]'
              }`}
            >
              <GlovaLevelBadge level={p.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && prompts.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner
            size="lg"
            text={isEn ? 'Loading writing prompts...' : 'กำลังโหลดหัวข้องานเขียน...'}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchPrompts} />
      )}

      {/* 2. Main Learning Activity: Prompt & Writing Canvas */}
      {currentPrompt && (
        <div className="space-y-6">
          {/* Prompt Guidelines Card */}
          <SpotlightCard
            spotlightColor="rgba(33, 85, 230, 0.15)"
            showBorderBeam={true}
            borderBeamProps={{
              colorFrom: '#2155E6',
              colorTo: '#FFE600',
              duration: 12,
              size: 240,
            }}
            className="p-5 sm:p-7 space-y-4 rounded-[28px] bg-white dark:bg-[#0B1224] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_-4px_rgba(11,18,36,0.12),0_2px_10px_-2px_rgba(11,18,36,0.08)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
                <span className="font-semibold text-sm sm:text-base text-foreground">
                  {currentPrompt.title}
                </span>
              </div>

              <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span>{isEn ? 'Target Word Count:' : 'เกณฑ์ความยาว:'}</span>
                <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground font-mono font-semibold">
                  {currentPrompt.minWords}-{currentPrompt.maxWords} {isEn ? 'words' : 'คำ'}
                </span>
              </div>
            </div>

            {/* Contextual Writing Studio Photo */}
            <div className="overflow-hidden rounded-xl">
              <GlovaImage
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80"
                alt="Creative writing notebook and fountain pen on natural wood desk"
                aspectRatio="aspect-video"
                className="w-full max-h-44"
              />
            </div>

            {/* Prompt Description */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed whitespace-pre-line">
                {currentPrompt.promptEn}
              </p>
              {currentPrompt.promptTh && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/30">
                  {currentPrompt.promptTh}
                </p>
              )}
            </div>

            {/* Guidelines Checklist */}
            {currentPrompt.guidelinesTh && currentPrompt.guidelinesTh.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>
                    {isEn ? 'Requirements & Coverage Checklist:' : 'ข้อกำหนดและประเด็นที่ต้องครอบคลุม:'}
                  </span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {currentPrompt.guidelinesTh.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-secondary/30 p-2.5 rounded-lg border border-border/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SpotlightCard>

          {/* Interactive Writing Canvas */}
          <TacticalHudFrame
            agentName="STUDIO // WRITING WORKBENCH"
            statusText={`${wordCount} WORDS`}
            accentColor="purple"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {t('writing.your_writing')}
                </h4>
              </div>

              {/* Real-time Word Counter Status */}
              <div
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium flex items-center gap-1.5 ${
                  isWithinWordCount
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : isUnderWordCount
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}
              >
                <span>
                  {wordCount} {isEn ? 'words' : 'คำ'}
                </span>
                <span className="text-[10px] hidden sm:inline">
                  {isWithinWordCount
                    ? isEn
                      ? '(Optimal length)'
                      : '(ความยาวเหมาะสม)'
                    : isUnderWordCount
                    ? isEn
                      ? `(${currentPrompt.minWords - wordCount} words needed)`
                      : `(ขาดอีก ${currentPrompt.minWords - wordCount} คำ)`
                    : isEn
                    ? '(Exceeds limit)'
                    : '(เกินเกณฑ์กำหนด)'}
                </span>
              </div>
            </div>

            {/* Accessible Writing Textarea */}
            <textarea
              value={userText}
              onChange={(e) => {
                setUserText(e.target.value);
                if (isSubmitted) setIsSubmitted(false);
              }}
              placeholder={
                isEn ? 'Type your English answer here...' : 'พิมพ์คำตอบภาษาอังกฤษของคุณที่นี่...'
              }
              rows={9}
              className="w-full p-4 rounded-xl bg-background border border-border/80 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans resize-y"
              aria-label="พื้นที่เขียนคำตอบ"
            />

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <TactileButton
                variant="neutral"
                size="sm"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{isEn ? 'Save Draft' : 'บันทึกแบบร่าง'}</span>
              </TactileButton>

              <TactileButton
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                className="flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{isEn ? 'Submit Writing' : 'ส่งงานเขียน'}</span>
              </TactileButton>
            </div>
          </TacticalHudFrame>

          {/* 3. Feedback State (Pending Evaluation & Model Answer) */}
          {isSubmitted && (
            <div className="p-4 sm:p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>
                  {isEn
                    ? 'Response Recorded: Pending Cambridge Rubric Evaluation'
                    : 'บันทึกงานเขียนสำเร็จ — อยู่ระหว่างรอการประเมินตามเกณฑ์ Cambridge'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isEn
                  ? 'Because writing is an open-ended CEFR assessment, your response has been saved. You can compare your work with the model answer and scoring rubric below.'
                  : 'เนื่องจากงานเขียนเป็นข้อสอบอัตนัยตามมาตรฐาน CEFR ระบบได้บันทึกคำตอบของคุณแล้ว คุณสามารถตรวจสอบความสอดคล้องเบื้องต้นได้จากตัวอย่างคำตอบระดับคะแนนเต็มและเกณฑ์ Self-Assessment ด้านล่าง'}
              </p>
            </div>
          )}

          {/* Sample Model Answer Box */}
          {currentPrompt.sampleModelAnswer && (
            <GlovaCard elevation="subtle" className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">
                    {t('writing.model_answer')}
                  </h4>
                </div>

                <GlovaButton
                  variant="ghost"
                  size="sm"
                  leftIcon={showModelAnswer ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                >
                  {showModelAnswer
                    ? isEn
                      ? 'Hide Sample'
                      : 'ซ่อนตัวอย่าง'
                    : isEn
                    ? 'View Sample Answer'
                    : 'ดูตัวอย่างคำตอบ'}
                </GlovaButton>
              </div>

              {showModelAnswer && (
                <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/40 text-xs sm:text-sm text-foreground/90 leading-relaxed font-serif whitespace-pre-line animate-in fade-in duration-200">
                  {currentPrompt.sampleModelAnswer}
                </div>
              )}
            </GlovaCard>
          )}

          {/* Useful Phrases Bank (Secondary Subordinate Information) */}
          {currentPrompt.usefulPhrases && currentPrompt.usefulPhrases.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>
                  {isEn
                    ? 'Recommended Phrases & Collocations (Click to copy):'
                    : 'สำนวนและวลีที่แนะนำ (คลิกเพื่อคัดลอก):'}
                </span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {currentPrompt.usefulPhrases.map((phraseObj, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopyPhrase(phraseObj.phrase)}
                    className="touch-target px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#101A30] hover:bg-[#15203B] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_0_0_#0D1318] active:translate-y-[2px] active:shadow-none text-xs text-slate-900 dark:text-[#EDEBE8] flex items-center gap-2 transition-all group cursor-pointer"
                  >
                    <span className="font-bold">{phraseObj.phrase}</span>
                    <span className="text-muted-foreground text-[11px]">({phraseObj.meaningTh})</span>
                    <Copy className="w-3 h-3 text-muted-foreground group-hover:text-[#2155E6] dark:group-hover:text-[#6893FF] transition-colors" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
