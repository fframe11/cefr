'use client';
import React, { useState } from 'react';
import {
  CHEAT_SHEET_MODULES,
  CheatSheetModule,
  QuickQuizItem,
} from '../../data/cheatSheets';
import {
  Clock,
  MapPin,
  Activity,
  Wrench,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  GlovaCard,
  GlovaButton,
  GlovaBadge,
  GlovaSectionHeader,
  GlovaLevelBadge,
} from '../ui';
import { useTranslation } from '../../i18n';

interface CheatSheetsViewProps {
  initialTopicId?: string;
  onNavigatePractice?: () => void;
}

export const CheatSheetsView: React.FC<CheatSheetsViewProps> = ({
  initialTopicId,
  onNavigatePractice,
}) => {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [activeSheetId, setActiveSheetId] = useState<string>(
    initialTopicId || CHEAT_SHEET_MODULES[0].id
  );

  // Quiz state: sheetId -> questionId -> selectedOptionKey
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submittedQuizIds, setSubmittedQuizIds] = useState<Record<string, boolean>>({});

  const currentModule =
    CHEAT_SHEET_MODULES.find((m) => m.id === activeSheetId) || CHEAT_SHEET_MODULES[0];

  const handleSelectAnswer = (qId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeSheetId]: {
        ...(prev[activeSheetId] || {}),
        [qId]: optionKey,
      },
    }));
  };

  const handleResetQuiz = (sheetId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [sheetId]: {},
    }));
    setSubmittedQuizIds((prev) => ({
      ...prev,
      [sheetId]: false,
    }));
  };

  const getTopicIcon = (id: string) => {
    switch (id) {
      case 'in-on-at-time-place':
        return Clock;
      case 'play-do-go-sports':
        return Activity;
      case 'do-vs-make':
        return Wrench;
      case 'oopt-cefr-score-architecture':
        return GraduationCap;
      default:
        return BookOpen;
    }
  };

  const getModuleBadgeColor = (id: string) => {
    switch (id) {
      case 'in-on-at-time-place':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'play-do-go-sports':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'do-vs-make':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'oopt-cefr-score-architecture':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider">
              {isEn ? 'High-Yield Matrix' : 'สรุปสูตรลัด High-Yield'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-300 text-xs font-mono font-medium">
              CEFR A1–B2 & OOPT Standard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {isEn
              ? 'Grammar Matrices & Exam Architecture'
              : 'คลังสูตรลัดไวยากรณ์และโครงสร้างข้อสอบ OOPT'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {isEn
              ? 'Master the high-frequency distinction matrices that test takers struggle with most: In/On/At hierarchy, Play/Do/Go sport classification, Do vs Make action outcomes, and Oxford Online Placement Test scoring calibration.'
              : 'สรุป 4 จุดตัดคะแนนสำคัญที่ผู้เข้าสอบผิดบ่อยที่สุด: พีระมิด In/On/At, การจำแนก Play/Do/Go, จุดต่าง Do vs Make และตารางคะแนน OOPT 0–120 เทียบระดับตามกรอบ CEFR พร้อมมินิควิซทดสอบทันที'}
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CHEAT_SHEET_MODULES.map((sheet) => {
          const Icon = getTopicIcon(sheet.id);
          const isSelected = sheet.id === activeSheetId;
          return (
            <button
              key={sheet.id}
              onClick={() => setActiveSheetId(sheet.id)}
              className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-white dark:bg-slate-800/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {sheet.targetCefr}
                  </span>
                </div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {sheet.titleTh}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Cheat Sheet Main Container */}
      <div className="space-y-6">
        {/* Module Header Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getModuleBadgeColor(
                  currentModule.id
                )}`}
              >
                {currentModule.targetCefr} Target Focus
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {currentModule.titleTh}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {currentModule.titleEn}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {currentModule.quickQuizzes.length} Quick Quiz Questions
              </span>
            </div>
          </div>

          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentModule.summaryTh}
          </p>

          {/* Key Takeaways */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {isEn ? 'Core Takeaways' : 'ประเด็นสำคัญที่ต้องจำ'}
            </h4>
            <ul className="space-y-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-300">
              {currentModule.keyTakeawaysTh.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Matrix Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentModule.matrixRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
                    {rule.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Step {idx + 1}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {rule.ruleTh}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {rule.ruleEn}
                </p>

                {/* Example Tokens */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isEn ? 'Key Examples' : 'ตัวอย่างที่พบบ่อย'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.examples.map((ex, exIdx) => (
                      <span
                        key={exIdx}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exception Note if present */}
              {rule.exceptions && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>ข้อยกเว้น / ข้อควรระวัง:</span>
                  </div>
                  <p className="leading-snug">{rule.exceptions}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Quick Quiz Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Interactive Mini-Quiz' : 'มินิควิซทดสอบความจำทันที'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn
                    ? 'Select your answer to verify your understanding of the matrix.'
                    : 'เลือกคำตอบที่ถูกต้องเพื่อเช็กความแม่นยำหลังอ่านสรุปสูตรลัด'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleResetQuiz(currentModule.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isEn ? 'Reset Answers' : 'เริ่มทำใหม่'}
            </button>
          </div>

          {/* Quiz Question Cards */}
          <div className="space-y-6">
            {currentModule.quickQuizzes.map((quiz, qIdx) => {
              const selectedKey = selectedAnswers[currentModule.id]?.[quiz.id];
              const isAnswered = !!selectedKey;
              const isCorrect = selectedKey === quiz.correctAnswer;

              return (
                <div
                  key={quiz.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs font-bold font-mono">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {quiz.stemTh}
                      </span>
                    </div>
                    {isAnswered && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isEn ? 'Correct!' : 'ถูกต้อง'}
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            {isEn ? 'Incorrect' : 'ยังไม่ถูกต้อง'}
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-base font-semibold text-slate-900 dark:text-white font-mono mb-4 pl-8">
                    {quiz.stemEn}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-8">
                    {quiz.options.map((opt) => {
                      const isOptionSelected = selectedKey === opt.key;
                      const isOptionCorrect = opt.key === quiz.correctAnswer;

                      let btnStyle =
                        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

                      if (isAnswered) {
                        if (isOptionCorrect) {
                          btnStyle =
                            'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs';
                        } else if (isOptionSelected) {
                          btnStyle =
                            'bg-rose-500 text-white border-rose-600 font-bold';
                        } else {
                          btnStyle =
                            'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectAnswer(quiz.id, opt.key)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left text-xs md:text-sm transition-all ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-black/10 dark:bg-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {opt.key}
                          </span>
                          <span className="truncate">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after answering */}
                  {isAnswered && (
                    <div className="mt-4 ml-8 p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>คำอธิบาย / Explanation:</span>
                      </div>
                      <p>{quiz.explanationTh}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
