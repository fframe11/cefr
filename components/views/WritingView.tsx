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
      {/* 1. Unified Hero Header Banner - Studio DNA */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-amber-500/50 dark:from-[#1E1B28] dark:to-[#171520] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-xs shrink-0">
                <PenTool className="w-4 h-4 text-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-black uppercase tracking-wider">
                WRITING LAB // CEFR
              </span>
              {currentPrompt && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
                  <span className="font-mono">{currentPrompt.taskType}</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEn ? 'Writing & Production Studio' : 'ทักษะการเขียนและการสื่อสาร'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {isEn
                ? 'Practice written expression, essay structuring, and authentic Cambridge writing tasks with self-assessment rubrics.'
                : 'ฝึกเขียนบทความ อีเมล และรายงานตามเกณฑ์ประเมิน CEFR พร้อมเกณฑ์ Self-Assessment'}
            </p>
          </div>

          {/* Status Chips */}
          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <div className="px-3.5 py-2 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <PenTool className="w-3.5 h-3.5" />
              <span>{isEn ? `${prompts.length} Writing Tasks` : `${prompts.length} หัวข้องานเขียน`}</span>
            </div>
            <div className="px-3.5 py-2 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cambridge Rubric</span>
            </div>
          </div>
        </div>
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
              className={`touch-target px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FA5D5D] text-white shadow-sm font-black'
                  : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
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
      {error && prompts.length === 0 && (
        <ErrorMessage message={error} onRetry={fetchPrompts} />
      )}

      {/* 2. Main Learning Activity: Prompt & Writing Canvas */}
      {currentPrompt && (
        <div className="space-y-6">
          {/* Prompt Guidelines Card */}
          <div className="p-6 sm:p-7 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE4D5] dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {currentPrompt.title}
                </span>
              </div>

              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span>{isEn ? 'Target Word Count:' : 'เกณฑ์ความยาว:'}</span>
                <span className="px-3 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold shadow-xs">
                  {currentPrompt.minWords}-{currentPrompt.maxWords} {isEn ? 'words' : 'คำ'}
                </span>
              </div>
            </div>

            {/* Contextual Writing Studio Photo */}
            <div className="overflow-hidden rounded-[22px] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
              <GlovaImage
                src="/images/learning/writing_hero.jpg"
                alt="Creative writing notebook, fountain pen and study materials on natural wood desk"
                aspectRatio="aspect-video"
                className="w-full max-h-44"
              />
            </div>

            {/* Prompt Description */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-2 shadow-xs">
              <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium leading-relaxed whitespace-pre-line font-sans">
                {currentPrompt.promptEn}
              </p>
            </div>

            {/* Guidelines Checklist */}
            {currentPrompt.guidelinesTh && currentPrompt.guidelinesTh.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#FA5D5D]" aria-hidden="true" />
                  <span>
                    {isEn ? 'Requirements & Coverage Checklist:' : 'ข้อกำหนดและประเด็นที่ต้องครอบคลุม:'}
                  </span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {currentPrompt.guidelinesTh.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-[#FAF8F3] dark:bg-[#252131] p-3 rounded-[18px] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Interactive Writing Canvas */}
          <div className="w-full p-6 sm:p-7 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D5] dark:border-white/10">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t('writing.your_writing')}
                </h4>
              </div>

              {/* Real-time Word Counter Status */}
              <div
                className={`text-xs px-3.5 py-1.5 rounded-full font-mono font-bold flex items-center gap-1.5 shadow-xs ${
                  isWithinWordCount
                    ? 'bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20'
                    : isUnderWordCount
                    ? 'bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20'
                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
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
              className="w-full p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/20 font-sans resize-y shadow-xs"
              aria-label="พื้นที่เขียนคำตอบ"
            />

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="touch-target px-5 py-2.5 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{isEn ? 'Save Draft' : 'บันทึกแบบร่าง'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="touch-target px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{isEn ? 'Submit Writing' : 'ส่งงานเขียน'}</span>
              </button>
            </div>
          </div>

          {/* 3. Feedback State (Pending Evaluation & Model Answer) */}
          {isSubmitted && (
            <div className="p-4 sm:p-5 rounded-[22px] bg-[#FA5D5D] dark:bg-[#FA5D5D]/20 border border-[#FA5D5D] dark:border-[#FA5D5D]/20 space-y-2 animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-center gap-2 text-[#FA5D5D] dark:text-[#FA5D5D] font-bold text-sm">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>
                  {isEn
                    ? 'Response Recorded: Pending Cambridge Rubric Evaluation'
                    : 'บันทึกงานเขียนสำเร็จ — อยู่ระหว่างรอการประเมินตามเกณฑ์ Cambridge'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                {isEn
                  ? 'Because writing is an open-ended CEFR assessment, your response has been saved. You can compare your work with the model answer and scoring rubric below.'
                  : 'เนื่องจากงานเขียนเป็นแบบฝึกหัดอัตนัยอิงตามแนวทาง CEFR ระบบได้บันทึกคำตอบของคุณแล้ว คุณสามารถตรวจสอบความสอดคล้องเบื้องต้นได้จากตัวอย่างคำตอบระดับคะแนนเต็มและเกณฑ์ Self-Assessment ด้านล่าง'}
              </p>
            </div>
          )}

          {/* Sample Model Answer Box */}
          {currentPrompt.sampleModelAnswer && (
            <div className="p-5 sm:p-6 space-y-3 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D98200] dark:text-[#FFBA38]" aria-hidden="true" />
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {t('writing.model_answer')}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="touch-target px-4 py-2 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {showModelAnswer ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>
                    {showModelAnswer
                      ? isEn
                        ? 'Hide Sample'
                        : 'ซ่อนตัวอย่าง'
                      : isEn
                      ? 'View Sample Answer'
                      : 'ดูตัวอย่างคำตอบ'}
                  </span>
                </button>
              </div>

              {showModelAnswer && (
                <div className="mt-3 p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-line animate-in fade-in duration-200 shadow-xs">
                  {currentPrompt.sampleModelAnswer}
                </div>
              )}
            </div>
          )}

          {/* Useful Phrases Bank (Secondary Subordinate Information) */}
          {currentPrompt.usefulPhrases && currentPrompt.usefulPhrases.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <BookOpen className="w-3.5 h-3.5 text-[#FA5D5D]" aria-hidden="true" />
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
                    className="touch-target px-4 py-2 rounded-full bg-[#FAF8F3] dark:bg-[#252131] hover:bg-slate-100 dark:hover:bg-white/10 border border-[#EAE4D5] dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-all group shadow-xs cursor-pointer"
                  >
                    <span className="font-bold">{phraseObj.phrase}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">({phraseObj.meaningTh})</span>
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-[#FA5D5D] transition-colors" aria-hidden="true" />
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
