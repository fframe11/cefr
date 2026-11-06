'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Award,
  Sparkles,
  BarChart2,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Flame,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { WritingEvaluationResult, SentenceAnalysisItem } from '@/lib/writing/types';

interface WritingEvaluationPanelProps {
  result: WritingEvaluationResult;
  modelAnswer?: string;
  onTryAgain: () => void;
  onSelectNextPrompt?: () => void;
}

export const WritingEvaluationPanel: React.FC<WritingEvaluationPanelProps> = ({
  result,
  modelAnswer,
  onTryAgain,
  onSelectNextPrompt,
}) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showSentenceBreakdown, setShowSentenceBreakdown] = useState(true);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

  // Band badge color helper
  const getBandBadgeClass = (band: string) => {
    switch (band) {
      case 'C2':
      case 'C1':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'B2':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'B1':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'A2':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Overall Score & B2 Graduation Readiness Banner */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE4D5] dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary font-black shadow-xs">
              <span className="text-2xl leading-none">{result.overallScore}</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider ${getBandBadgeClass(
                    result.cefrBand
                  )}`}
                >
                  CEFR Band {result.cefrBand}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Target: {result.targetCefr}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {result.overallScore >= 60
                  ? 'ผลการประเมินระดับ B2 (Upper Intermediate)'
                  : `ผลการประเมินระดับ ${result.cefrBand} (กำลังพัฒนาสู่ B2)`}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
              <span className="text-muted-foreground">Words:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{result.wordCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
              <span className="text-muted-foreground">Sentences:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{result.sentenceCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
              <span className="text-muted-foreground">Paragraphs:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{result.paragraphCount}</span>
            </div>
          </div>
        </div>

        {/* B2 Readiness Callout */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
            result.b2GapAnalysis.isB2Ready
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
          }`}
        >
          {result.b2GapAnalysis.isB2Ready ? (
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-bold">
              {result.b2GapAnalysis.isB2Ready
                ? 'บรรลุเกณฑ์มาตรฐานภาษาอังกฤษระดับอุดมศึกษา (กมอ. 2567)'
                : `ระยะห่างสู่เป้าหมาย B2: ขาดอีก ${Math.abs(result.b2GapAnalysis.distanceToB2)} คะแนน`}
            </h4>
            <p className="text-xs leading-relaxed opacity-90">{result.b2GapAnalysis.summaryTh}</p>
          </div>
        </div>
      </div>

      {/* 2. Four-Axis Rubric Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dimension 1: Task Achievement */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Task Achievement</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBandBadgeClass(result.taskAchievement.cefrBand)}`}>
                {result.taskAchievement.cefrBand}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {result.taskAchievement.score}/100
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${result.taskAchievement.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.taskAchievement.feedbackTh}</p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Word Count: {result.taskAchievement.wordCount} words</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Target: {result.taskAchievement.targetMinWords}–{result.taskAchievement.targetMaxWords}
            </span>
          </div>
        </div>

        {/* Dimension 2: Coherence & Cohesion */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Coherence & Cohesion</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBandBadgeClass(result.coherenceCohesion.cefrBand)}`}>
                {result.coherenceCohesion.cefrBand}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {result.coherenceCohesion.score}/100
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${result.coherenceCohesion.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.coherenceCohesion.feedbackTh}</p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Transitions: {result.coherenceCohesion.transitionCount} found</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Density: {result.coherenceCohesion.transitionDensity}/100w
            </span>
          </div>
        </div>

        {/* Dimension 3: Lexical Resource */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lexical Resource</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBandBadgeClass(result.lexicalResource.cefrBand)}`}>
                {result.lexicalResource.cefrBand}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {result.lexicalResource.score}/100
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${result.lexicalResource.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.lexicalResource.feedbackTh}</p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>AWL Academic Words: {result.lexicalResource.awlCount}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              TTR: {result.lexicalResource.typeTokenRatio}
            </span>
          </div>
        </div>

        {/* Dimension 4: Grammatical Range & Accuracy */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Grammatical Range & Accuracy</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBandBadgeClass(result.grammaticalRange.cefrBand)}`}>
                {result.grammaticalRange.cefrBand}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {result.grammaticalRange.score}/100
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${result.grammaticalRange.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.grammaticalRange.feedbackTh}</p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Complex Sentences: {result.grammaticalRange.complexSentenceRatio}%</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Avg Length: {result.grammaticalRange.averageSentenceLength} words
            </span>
          </div>
        </div>
      </div>

      {/* 3. Actionable Improvement Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              คำแนะนำเพื่อพิชิตคะแนนระดับ B2 (Actionable Recommendations)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sug.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    Priority: {sug.priority}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">
                    {sug.dimension}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">{sug.titleTh}</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{sug.detailTh}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sentence-by-Sentence Analysis Breakdown */}
      <div className="p-6 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm space-y-4">
        <button
          type="button"
          onClick={() => setShowSentenceBreakdown(!showSentenceBreakdown)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              วิเคราะห์รายประโยค (Sentence-level Breakdown)
            </h4>
            <span className="text-xs text-muted-foreground">
              ({result.sentences.length} sentences)
            </span>
          </div>
          {showSentenceBreakdown ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showSentenceBreakdown && (
          <div className="space-y-2.5 pt-2">
            {result.sentences.map((sent) => (
              <div
                key={sent.index}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                  sent.hasIssue
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      #{sent.index}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBandBadgeClass(sent.cefrEstimate)}`}>
                      {sent.cefrEstimate}
                    </span>
                    {sent.isComplex && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                        Complex Syntax
                      </span>
                    )}
                    {sent.transitionsFound.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                        Linking: {sent.transitionsFound.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {sent.wordCount} words
                  </span>
                </div>

                <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-sans">
                  "{sent.text}"
                </p>

                {sent.hasIssue && sent.issueDetail && (
                  <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{sent.issueDetail}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Model Answer Comparison Toggle */}
      {modelAnswer && (
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                คำตอบตัวอย่างระดับ B2/C1 (Sample Model Answer)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              {showModelAnswer ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  ซ่อนตัวอย่าง
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  ดูตัวอย่าง
                </>
              )}
            </button>
          </div>

          {showModelAnswer && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {modelAnswer}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onTryAgain}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          แก้ไขและเขียนใหม่ (Edit & Try Again)
        </button>

        {onSelectNextPrompt && (
          <button
            type="button"
            onClick={onSelectNextPrompt}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            เลือกหัวข้อถัดไป
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
