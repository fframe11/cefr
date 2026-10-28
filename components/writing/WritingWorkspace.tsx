'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PenTool,
  Clock,
  Sparkles,
  Send,
  Save,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Play,
  Pause,
  HelpCircle,
  TrendingUp,
  FileText,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import { useTranslation } from '../../i18n';
import { GlovaLevelBadge } from '../ui';
import { WritingEvaluationData, WritingPromptItem } from '@/lib/writing/types';
import { WritingAnalysisReport } from './WritingAnalysisReport';

export const CAMBRIDGE_WRITING_PROMPTS: WritingPromptItem[] = [
  {
    id: 'wrt_b2_essay_01',
    title: 'The Impact of Remote Work on Society',
    taskType: 'essay',
    cefrLevel: 'B2',
    topic: 'Employment & Modern Society',
    minWords: 140,
    maxWords: 190,
    suggestedTimeMinutes: 40,
    prompt: `In your English class, you have been talking about modern employment trends. Now, your English teacher has asked you to write an essay on this topic:
"Has the transition toward remote work benefited employees and society overall?"

Notes:
Write about:
1. Work-life balance and flexibility
2. Social interaction and workplace teamwork
3. (Your own idea, e.g., environmental impact or local economy)

Write 140-190 words in an appropriate academic register.`,
    bulletPoints: [
      'Work-life balance and flexibility',
      'Social interaction and teamwork',
      'Your own idea (e.g. environmental impact)'
    ],
    targetKeywords: ['consequently', 'furthermore', 'nevertheless', 'crucial', 'transform']
  },
  {
    id: 'wrt_c1_essay_01',
    title: 'Artificial Intelligence & Ethical Decisions',
    taskType: 'essay',
    cefrLevel: 'C1',
    topic: 'Technology & Ethics',
    minWords: 220,
    maxWords: 260,
    suggestedTimeMinutes: 45,
    prompt: `Your teacher has asked you to write an essay evaluating the integration of artificial intelligence in contemporary decision-making systems.

"Should autonomous algorithmic systems be granted authority over judicial and economic outcomes?"

Write about:
1. Efficiency and reduction of human bias
2. Transparency, accountability, and ethical oversights
3. (Your own perspective on human dignity and autonomy)

Write 220-260 words in an authoritative, academic style.`,
    bulletPoints: [
      'Efficiency and reduction of human bias',
      'Transparency, accountability, and ethical oversights',
      'Your own perspective on human dignity'
    ],
    targetKeywords: ['unprecedented', 'ubiquitous', 'paradigm', 'imperative', 'scrutiny']
  },
  {
    id: 'wrt_b1_article_01',
    title: 'A Hobby That Changed My Perspective',
    taskType: 'article',
    cefrLevel: 'B1',
    topic: 'Leisure & Personal Growth',
    minWords: 90,
    maxWords: 130,
    suggestedTimeMinutes: 30,
    prompt: `You see this announcement on an international student website:
"Articles wanted! What is your favorite hobby, and why did you start doing it? How has it helped you make new friends or develop new practical skills?"

Write your article in 90-130 words with an engaging, friendly tone.`,
    bulletPoints: [
      'What the hobby is and how you started',
      'New skills or friends gained from it',
      'Encouragement for others to try it'
    ],
    targetKeywords: ['enjoyable', 'opportunity', 'helpful', 'develop']
  },
  {
    id: 'wrt_a2_letter_01',
    title: 'Weekend Plans with a Foreign Friend',
    taskType: 'letter',
    cefrLevel: 'A2',
    topic: 'Daily Life & Social Invitations',
    minWords: 50,
    maxWords: 80,
    suggestedTimeMinutes: 20,
    prompt: `Read this message from your foreign friend Alex:
"Hi! I would love to visit your city this coming weekend. What exciting places can we visit, and what traditional food should we try together?"

Write a reply letter to Alex answering both questions. Write 50-80 words.`,
    bulletPoints: [
      'Welcome Alex and suggest 1-2 interesting places',
      'Recommend traditional dishes to try',
      'Suggest a time and place to meet'
    ],
    targetKeywords: ['visit', 'famous', 'delicious', 'meet']
  }
];

export const WritingWorkspace: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [selectedPrompt, setSelectedPrompt] = useState<WritingPromptItem>(CAMBRIDGE_WRITING_PROMPTS[0]);
  const [essayText, setEssayText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Timer state
  const [timeLeftSec, setTimeLeftSec] = useState<number>(CAMBRIDGE_WRITING_PROMPTS[0].suggestedTimeMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Evaluation modal result
  const [evaluationResult, setEvaluationResult] = useState<WritingEvaluationData | null>(null);

  // Load draft from localStorage on prompt change
  useEffect(() => {
    const saved = localStorage.getItem(`glova_writing_draft_${selectedPrompt.id}`);
    if (saved) {
      setEssayText(saved);
      setLastSavedTime('โหลดแบบร่างที่บันทึกไว้ล่าสุด');
    } else {
      setEssayText('');
      setLastSavedTime(null);
    }
    setTimeLeftSec(selectedPrompt.suggestedTimeMinutes * 60);
    setIsTimerRunning(false);
  }, [selectedPrompt.id, selectedPrompt.suggestedTimeMinutes]);

  // Auto-save draft every 5 seconds (Notion AC / Requirements)
  useEffect(() => {
    const interval = setInterval(() => {
      if (essayText.trim().length > 0) {
        localStorage.setItem(`glova_writing_draft_${selectedPrompt.id}`, essayText);
        const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(timeStr);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [essayText, selectedPrompt.id]);

  // Timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeftSec > 0) {
      timer = setInterval(() => {
        setTimeLeftSec((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeftSec]);

  // Real-time word count & character count
  const words = essayText.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = essayText.trim().length === 0 ? 0 : words.length;
  const charCount = essayText.length;

  const minWords = selectedPrompt.minWords;
  const maxWords = selectedPrompt.maxWords;

  // Word count status indicator: Yellow (under), Green (in range), Orange (over)
  const isUnder = wordCount < minWords;
  const isInRange = wordCount >= minWords && wordCount <= maxWords;
  const isOver = wordCount > maxWords;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualSave = () => {
    if (essayText.trim().length === 0) return;
    localStorage.setItem(`glova_writing_draft_${selectedPrompt.id}`, essayText);
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(timeStr);
    showToast(
      isEn ? 'Draft Saved' : 'บันทึกแบบร่างสำเร็จ',
      isEn ? `Saved ${wordCount} words to browser storage` : `บันทึกงานเขียน ${wordCount} คำลงในเครื่องแล้ว`,
      'success'
    );
  };

  // Submit and Evaluate Handler
  const handleSubmit = async () => {
    // AC-1: Word Count Validation
    if (wordCount < 50) {
      showToast(
        isEn ? 'Submission Too Short' : 'เนื้อหางานเขียนสั้นเกินไป',
        isEn
          ? 'Minimum 50 words required for AI evaluation (AC-1 standard).'
          : 'ต้องการเนื้อหาอย่างน้อย 50 คำสำหรับการประเมินตามเกณฑ์มาตรฐานเคมบริดจ์ (AC-1)',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/writing/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: selectedPrompt.id,
          essay_type: selectedPrompt.taskType,
          target_cefr: selectedPrompt.cefrLevel,
          submission_text: essayText,
          min_words: selectedPrompt.minWords,
          max_words: selectedPrompt.maxWords,
        }),
      });

      const json = await res.json();
      const elapsedMs = Math.round(performance.now() - startTime);

      if (res.ok && json.success && json.data) {
        setEvaluationResult(json.data);
        showToast(
          isEn ? 'Evaluation Complete' : 'ประเมินงานเขียนสำเร็จ',
          isEn
            ? `Graded in ${elapsedMs}ms (CEFR Band: ${json.data.cefr_band}, Score: ${json.data.overall_score}/100)`
            : `ประเมินเสร็จสิ้นใน ${elapsedMs}ms (ได้ระดับ ${json.data.cefr_band}, คะแนน ${json.data.overall_score}/100)`,
          'success'
        );
      } else {
        const errorMsg = json?.error?.message || json?.message || 'ไม่สามารถประเมินผลได้';
        showToast(isEn ? 'Evaluation Error' : 'เกิดข้อผิดพลาดในการประเมิน', errorMsg, 'error');
      }
    } catch (err: any) {
      showToast(
        isEn ? 'Connection Failure' : 'การเชื่อมต่อผิดพลาด',
        err?.message || 'ไม่สามารถส่งตรวจงานเขียนได้ กรุณาลองใหม่อีกครั้ง',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Studio DNA Hero Header */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-amber-500/10 dark:from-[#1E1B28] dark:to-[#171520] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-xs shrink-0">
                <PenTool className="w-4 h-4 text-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-black uppercase tracking-wider">
                WRITING STUDIO // TASK-02
              </span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300">
                <GlovaLevelBadge level={selectedPrompt.cefrLevel} size="sm" />
                <span className="font-mono uppercase">{selectedPrompt.taskType}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
                Oxford 3860 Lexicon
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEn ? 'Automated Essay Scoring & CEFR Grader' : 'สตูดิโองานเขียนและระบบประเมินเคมบริดจ์'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {isEn
                ? 'Produce academic essays and reports evaluated across 4 Cambridge Rubrics (Content, Communicative Achievement, Organisation, Language) with real-time word counting and lexical profiling.'
                : 'ฝึกเขียนบทความและเรียงความเชิงวิชาการ พร้อมระบบตรวจให้คะแนนตามเกณฑ์ Cambridge 4 มิติ และวิเคราะห์คลังคำศัพท์ Oxford CEFR'}
            </p>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-xs">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                  EXAM TIMER
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {formatTimer(timeLeftSec)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                title={isTimerRunning ? 'Pause' : 'Start'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prompt Selector & Prompt Guidelines (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Prompt Selection Dropdown */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>เลือกหัวข้องานเขียน (Select Task)</span>
              <span className="text-[10px] font-mono text-indigo-500">{CAMBRIDGE_WRITING_PROMPTS.length} Topics</span>
            </label>
            <div className="space-y-2">
              {CAMBRIDGE_WRITING_PROMPTS.map((p) => {
                const isSelected = p.id === selectedPrompt.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPrompt(p)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/50 shadow-xs ring-1 ring-indigo-500/20'
                        : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/10 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GlovaLevelBadge level={p.cefrLevel} size="sm" />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {p.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                        {p.topic} • {p.minWords}-{p.maxWords} คำ
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Prompt Instructions Box */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                โจทย์ข้อสอบ (Prompt Instructions)
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {selectedPrompt.minWords}–{selectedPrompt.maxWords} Words
              </span>
            </div>

            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans whitespace-pre-line bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
              {selectedPrompt.prompt}
            </div>

            {selectedPrompt.bulletPoints && selectedPrompt.bulletPoints.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ประเด็นบังคับที่ต้องเขียนถึง (Required Points):
                </span>
                <ul className="space-y-1">
                  {selectedPrompt.bulletPoints.map((bp, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedPrompt.targetKeywords && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  คำศัพท์แนะนำระดับ {selectedPrompt.cefrLevel} (Target Keywords):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPrompt.targetKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[11px] font-mono font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Essay Editor & Word Counter (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden flex flex-col">
            {/* Editor Top Bar: Word Counter & Scope Alert Bar */}
            <div className="px-6 py-3.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
              {/* Word Count Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">จำนวนคำ:</span>
                  <span
                    className={`font-mono text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      isInRange
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : isUnder
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30'
                    }`}
                  >
                    {wordCount}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ {minWords}–{maxWords}</span>
                </div>

                {/* Scope Alert Badge */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {isInRange && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ความยาวกำลังดี (In Range)
                    </span>
                  )}
                  {isUnder && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {wordCount < 50 ? 'คำน้อยเกินไป (<50 คำ ต่ำกว่าเกณฑ์ AC-1)' : 'ยังน้อยกว่าเกณฑ์เป้าหมาย'}
                    </span>
                  )}
                  {isOver && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      คำเกินเกณฑ์ ({wordCount - maxWords} คำ)
                    </span>
                  )}
                </div>
              </div>

              {/* Auto-save Status & Character Count */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="hidden md:inline">{charCount} ตัวอักษร</span>
                {lastSavedTime && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Save className="w-3 h-3 text-slate-400" />
                    {lastSavedTime.includes(':') ? `บันทึกแล้ว ${lastSavedTime}` : lastSavedTime}
                  </span>
                )}
              </div>
            </div>

            {/* Word Progress Color Bar */}
            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isInRange ? 'bg-emerald-500' : isUnder ? 'bg-amber-400' : 'bg-orange-500'
                }`}
                style={{
                  width: `${Math.min(100, (wordCount / maxWords) * 100)}%`,
                }}
              />
            </div>

            {/* Main Textarea */}
            <div className="p-4 sm:p-6 flex-1">
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Type your essay or response here in English... (Divide into introduction, body paragraphs, and conclusion for optimal score)"
                className="w-full min-h-[380px] sm:min-h-[440px] p-4 text-sm sm:text-base leading-relaxed text-slate-900 dark:text-white bg-transparent border-0 focus:outline-hidden focus:ring-0 resize-y font-sans placeholder:text-slate-400"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  บันทึกร่าง (Save Draft)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('คุณต้องการล้างข้อความทั้งหมดใช่หรือไม่?')) {
                      setEssayText('');
                      localStorage.removeItem(`glova_writing_draft_${selectedPrompt.id}`);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  ล้างข้อความ
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md transition-all duration-200 flex items-center gap-2 ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-500/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังตรวจให้คะแนน (AES Grader)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งตรวจประเมินเคมบริดจ์ (Submit for Evaluation)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Evaluation Result Modal */}
      <AnimatePresence>
        {evaluationResult && (
          <WritingAnalysisReport
            data={evaluationResult}
            originalText={essayText}
            onClose={() => setEvaluationResult(null)}
            onTryAgain={() => setEvaluationResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
