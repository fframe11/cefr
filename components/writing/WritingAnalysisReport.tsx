'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  X,
  Copy,
  Check,
  ArrowRight,
  Info
} from 'lucide-react';
import { WritingEvaluationData, GrammarIssue } from '@/lib/writing/types';
import { GlovaLevelBadge } from '@/components/ui';

interface WritingAnalysisReportProps {
  data: WritingEvaluationData;
  originalText: string;
  onClose: () => void;
  onTryAgain?: () => void;
}

export const WritingAnalysisReport: React.FC<WritingAnalysisReportProps> = ({
  data,
  originalText,
  onClose,
  onTryAgain,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<GrammarIssue | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const summary = `CEFR Writing Assessment Report
Submission ID: ${data.submission_id}
Overall Score: ${data.overall_score}/100 (CEFR Band: ${data.cefr_band})
Word Count: ${data.word_count}

4-Axis Cambridge Rubrics:
- Content: ${data.rubric_scores.content}/5.0
- Communicative Achievement: ${data.rubric_scores.communicative_achievement}/5.0
- Organisation: ${data.rubric_scores.organisation}/5.0
- Language: ${data.rubric_scores.language}/5.0

Lexical Distribution:
- A1-A2: ${data.lexical_distribution.a1_a2_percent}%
- B1-B2: ${data.lexical_distribution.b1_b2_percent}%
- C1-C2: ${data.lexical_distribution.c1_c2_percent}%
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render text with interactive grammar highlights
  const renderHighlightedText = () => {
    if (!data.grammar_issues || data.grammar_issues.length === 0) {
      return <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{originalText}</p>;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    data.grammar_issues.forEach((issue, idx) => {
      const offset = typeof issue.offset === 'number' ? issue.offset : 0;
      const length = typeof issue.length === 'number' ? issue.length : 0;
      // Un-highlighted text before this issue
      if (offset > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}-${offset}`}>
            {originalText.substring(lastIndex, offset)}
          </span>
        );
      }

      // Highlighted issue
      const isSelected = selectedIssue?.offset === offset;
      segments.push(
        <button
          key={`issue-${offset}-${idx}`}
          type="button"
          onClick={() => setSelectedIssue(issue)}
          className={`inline font-semibold px-1 rounded transition-colors duration-150 cursor-pointer ${
            isSelected
              ? 'bg-rose-500 text-white underline decoration-wavy'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 underline decoration-rose-400 decoration-wavy hover:bg-rose-200'
          }`}
          title="คลิกเพื่อดูคำแนะนำไวยากรณ์"
        >
          {originalText.substring(offset, offset + length)}
        </button>
      );

      lastIndex = offset + length;
    });

    if (lastIndex < originalText.length) {
      segments.push(
        <span key={`text-end-${lastIndex}`}>
          {originalText.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
        {segments}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#1C1A24] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FA5D5D] to-[#F59E0B] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Cambridge Writing Evaluation
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  AES NLP Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ID: {data.submission_id} • {data.word_count} words
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title="Copy Report"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Score Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-amber-50/40 dark:from-[#232030] dark:via-[#1E1B28] dark:to-[#171520] border border-indigo-100/80 dark:border-white/10">
            {/* Overall Score */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-2xl font-black">{data.overall_score}</span>
                <span className="text-[10px] font-semibold opacity-80">/100</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">OVERALL SCORE</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <GlovaLevelBadge level={data.cefr_band} size="md" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Band {data.cefr_band}
                  </span>
                </div>
              </div>
            </div>

            {/* Word Count */}
            <div className="flex flex-col justify-center px-4 border-t sm:border-t-0 sm:border-l border-slate-200/70 dark:border-white/10">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">WORD COUNT</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {data.word_count} <span className="text-xs font-normal text-slate-500">คำ</span>
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ผ่านเกณฑ์ขั้นต่ำ 50 คำ
              </span>
            </div>

            {/* Language Sophistication */}
            <div className="flex flex-col justify-center px-4 border-t sm:border-t-0 sm:border-l border-slate-200/70 dark:border-white/10">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">OXFORD LEXICAL PROFILE</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  B2-C2: {(data.lexical_distribution.b1_b2_percent + data.lexical_distribution.c1_c2_percent).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">(A1-A2: {data.lexical_distribution.a1_a2_percent}%)</span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                {data.lexical_distribution.advanced_words_found?.length || 0} คำศัพท์ระดับวิชาการ
              </span>
            </div>
          </div>

          {/* 2. Cambridge 4-Axis Rubric Scorecard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                4-Axis Cambridge Rubrics (คะแนนเต็ม 5.0 ต่อมิติ)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Content */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Content</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    {data.rubric_scores.content.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(data.rubric_scores.content / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ตอบตรงประเด็นและครบถ้วนตามโจทย์
                </p>
              </div>

              {/* Communicative Achievement */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Comm. Achievement</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
                    {data.rubric_scores.communicative_achievement.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(data.rubric_scores.communicative_achievement / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ความเป็นทางการ (Formal Register)
                </p>
              </div>

              {/* Organisation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Organisation</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    {data.rubric_scores.organisation.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(data.rubric_scores.organisation / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  โครงสร้างย่อหน้าและคำเชื่อมประโยค
                </p>
              </div>

              {/* Language */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Language</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    {data.rubric_scores.language.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(data.rubric_scores.language / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ความถูกต้องของไวยากรณ์และคลังคำศัพท์
                </p>
              </div>
            </div>
          </div>

          {/* 3. Interactive Text Inspector & Grammar Issues */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-500" />
                Text Inspector & Grammar Corrections
                {data.grammar_issues.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                    {data.grammar_issues.length} จุดผิด
                  </span>
                )}
              </h3>
              <span className="text-xs text-slate-500">คลิกที่คำขีดเส้นใต้เพื่อดูคำอธิบาย</span>
            </div>

            {/* Essay Text Display */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 font-mono text-sm leading-relaxed max-h-56 overflow-y-auto">
              {renderHighlightedText()}
            </div>

            {/* Selected Grammar Card */}
            <AnimatePresence mode="wait">
              {selectedIssue ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 uppercase">
                      Rule: {selectedIssue.rule_id}
                    </span>
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-rose-950/60 line-through text-rose-600 font-semibold text-sm">
                      {selectedIssue.original_text}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold text-sm">
                      {selectedIssue.replacement}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {selectedIssue.explanation_th}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* 4. Vocabulary Upgrade Suggestions */}
          {data.lexical_distribution.suggested_upgrades && data.lexical_distribution.suggested_upgrades.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                CEFR Vocabulary Upgrade Recommendations (Oxford Lexicon)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.lexical_distribution.suggested_upgrades.map((item, i) => (
                  <div
                    key={`upgrade-${i}`}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20 flex items-start gap-3"
                  >
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono shrink-0">
                      {item.cefr}
                    </span>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        แทนคำว่า: <span className="font-semibold text-slate-900 dark:text-white">'{item.original}'</span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex flex-wrap gap-1.5">
                        {item.suggestions.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-white/10 border border-emerald-300/40 dark:border-white/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                จุดแข็งของงานเขียน (Strengths)
              </h4>
              <ul className="space-y-1.5">
                {data.strengths_th.map((s, idx) => (
                  <li key={`str-${idx}`} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                จุดที่ควรพัฒนา (Areas for Improvement)
              </h4>
              <ul className="space-y-1.5">
                {data.improvements_th.map((imp, idx) => (
                  <li key={`imp-${idx}`} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ระบบประเมินอัตโนมัติตามมาตรฐาน Cambridge Assessment English
          </span>
          <div className="flex items-center gap-3">
            {onTryAgain && (
              <button
                type="button"
                onClick={onTryAgain}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              >
                ปรับปรุงและเขียนใหม่
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
