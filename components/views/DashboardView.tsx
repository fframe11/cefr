'use client';

import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  BookMarked,
  Headphones,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Swords,
  Trophy,
  Users,
  Target,
  Check,
  Star,
  ChevronRight,
  Mic,
  ExternalLink,
  GraduationCap,
  Send,
  MessageSquare,
  Volume2,
} from 'lucide-react';
import { UserProgressState, CEFRLevel } from '../../types';
import { CEFR_LEVELS } from '../../data/cefrLevels';
import { NavView } from '../common/Sidebar';
import { useTranslation } from '../../i18n';

interface DashboardViewProps {
  progress: UserProgressState;
  onNavigate: (view: NavView) => void;
  onStartRemediation: (weakTag: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onStartRemediation,
}) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const currentLevelInfo =
    CEFR_LEVELS.find((l) => l.level === progress.currentLevel) || CEFR_LEVELS[0];
  const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentLevelIdx = allLevels.indexOf(progress.currentLevel);
  const nextLvl = allLevels[Math.min(allLevels.length - 1, currentLevelIdx + 1)];

  // Daily goal progress
  const goalMinutes = progress.dailyGoalMinutes || 20;
  const minutesStudied = progress.minutesStudiedToday || 15;
  const goalPercent = Math.min(100, Math.round((minutesStudied / goalMinutes) * 100));

  // Determine top weakness if any
  const hasWeakness = progress.weakTopics && progress.weakTopics.length > 0;
  const topWeakness = hasWeakness ? progress.weakTopics[0] : null;

  // Helper to format topic titles cleanly
  const formatTopicTitle = React.useCallback(
    (topic: { tag: string; labelTh?: string }) => {
      if (!isEn && topic.labelTh) {
        return topic.labelTh.replace(/_/g, ' ');
      }
      const raw = isEn
        ? topic.tag || topic.labelTh || ''
        : topic.labelTh || topic.tag || '';
      return raw
        .replace(/_/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .replace(/\bVs\b/g, 'vs');
    },
    [isEn]
  );

  // Primary Action logic
  const primaryAction = React.useMemo(() => {
    if (topWeakness) {
      const formattedTitle = formatTopicTitle(topWeakness);
      return {
        unitBadge: "TODAY'S NEXT STEP",
        title: isEn
          ? `Practice: ${formattedTitle}`
          : `ทบทวนและซ่อมแซม: ${topWeakness.labelTh || formattedTitle}`,
        description: isEn
          ? `Detected ${topWeakness.errorCount} mistakes in practice. (แนะนำเพราะ: ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้ง) A 4-minute focused drill will recover your confidence.`
          : `ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้ง ในแบบทดสอบ (แนะนำเพราะ: ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้ง) ฝึกฝนสั้นๆ 4 นาทีเพื่อเสริมความแม่นยำ`,
        cta: isEn ? 'START REPAIR (+20 XP)' : 'เริ่มฝึกจุดนี้ทันที',
        skill: 'Grammar & Phrasing',
        timeMin: 4,
        onStart: () => onStartRemediation(topWeakness.tag),
        icon: <AlertTriangle className="w-5 h-5 text-[#FA5D5D]" />,
        isWeakness: true,
      };
    }

    if (!progress.assessmentCompleted) {
      return {
        unitBadge: isEn ? 'DIAGNOSTIC TEST' : 'แบบวัดระดับภาษา',
        title: isEn ? 'Take CEFR Diagnostic Assessment' : 'ทำแบบทดสอบวัดระดับ CEFR Diagnostic Test',
        description: isEn
          ? 'Comprehensive 8-minute assessment across all CEFR bands (A1-C2) to generate your custom path.'
          : 'ประเมินระดับความสามารถทางภาษาอังกฤษรอบด้านครอบคลุม A1 ถึง C2 เพื่อปลดล็อกเส้นทางการเรียนเฉพาะคุณ',
        cta: isEn ? 'START ASSESSMENT' : 'เริ่มวัดระดับภาษา',
        skill: 'Diagnostic Placement',
        timeMin: 8,
        onStart: () => onNavigate('assessment'),
        icon: <Sparkles className="w-5 h-5 text-[#FA5D5D]" />,
        isWeakness: false,
      };
    }

    return {
      unitBadge: "TODAY'S NEXT STEP",
      title: isEn
        ? `Daily Vocabulary & Context Practice`
        : `ฝึกฝนประจำวัน: คำศัพท์และไวยากรณ์ระดับ ${progress.currentLevel}`,
      description: isEn
        ? `Master high-yield Cambridge vocabulary using Spaced Repetition for your target: ${progress.targetExam}.`
        : `ฝึกคำศัพท์เคมบริดจ์ความถี่สูงด้วย Spaced Repetition เพื่อเป้าหมาย: ${progress.targetExam}`,
      cta: isEn ? 'START DAILY PRACTICE' : 'เริ่มฝึกฝนทันที',
      skill: 'Vocabulary & Context',
      timeMin: 5,
      onStart: () => onNavigate('vocabulary'),
      icon: <BookOpen className="w-5 h-5 text-[#FA5D5D]" />,
      isWeakness: false,
    };
  }, [
    topWeakness,
    progress.assessmentCompleted,
    progress.currentLevel,
    progress.targetExam,
    onStartRemediation,
    onNavigate,
    isEn,
    formatTopicTitle,
  ]);

  return (
    <div className="w-full space-y-6 pb-20 font-sans text-slate-800 dark:text-slate-100">


      {/* ========================================================================= */}
      {/* 2. HERO HEADLINE & FLOATING TAG CLOUD                                    */}
      {/* ========================================================================= */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Headline & Cambridge Progression */}
        <div className="lg:col-span-7 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Your Platform{' '}
            <span className="font-serif italic font-normal text-[#FA5D5D]">for</span>{' '}
            Unlimited Learning
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-mono leading-relaxed">
            เป้าหมายการสอบ: <strong className="text-slate-950 dark:text-white">{progress.targetExam}</strong> • Cambridge Equivalent: <strong className="text-[#FA5D5D]">{progress.estimatedCambridgeScore || 148}</strong> • เส้นทางการพัฒนา CEFR Framework: <strong className="text-slate-950 dark:text-white">{progress.currentLevel}</strong>
          </p>

          <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
            <span
              role="status"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 font-bold border border-[#C5EBDA] dark:border-emerald-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-[#1E7E52] dark:bg-emerald-400 animate-pulse" />
              Current activity: Active
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEECEB] dark:bg-[#2C1416] text-[#FA5D5D] dark:text-rose-300 font-bold border border-[#FCD3D1] dark:border-rose-500/20 font-mono">
              Lessons: #{progress.completedQuestionIds?.length || 44}
            </span>
          </div>
        </div>

        {/* Right Column: Floating Tag Cloud Illustration */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[170px] sm:min-h-[190px] py-4">
          {/* Central Circular Book Icon */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-[#070B16] border-2 border-[#EAE4D5] dark:border-white/10 shadow-lg flex items-center justify-center p-2.5 sm:p-3">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#FA5D5D]" />
          </div>

          {/* Floating Bubble Tags (Around Center) */}
          <div className="absolute top-1 left-2 sm:left-12 px-2.5 sm:px-3 py-1 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FBBF24] font-bold text-[11px] sm:text-xs shadow-xs border border-[#FDE5BC] dark:border-amber-500/20 flex items-center gap-1.5">
            <span>#Math</span>
            <TrendingUp className="w-3 h-3 text-[#D98200] dark:text-[#FBBF24]" aria-hidden="true" />
          </div>

          <div className="absolute top-1 right-2 sm:right-10 px-2.5 sm:px-3.5 py-1 rounded-full bg-[#FEECEB] dark:bg-[#2C1416] text-[#FA5D5D] dark:text-rose-300 font-bold text-[11px] sm:text-xs shadow-xs border border-[#FCD3D1] dark:border-rose-500/20">
            #Accounting
          </div>

          <div className="absolute bottom-1 left-2 sm:left-16 px-2.5 sm:px-3 py-1 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 font-bold text-[11px] sm:text-xs shadow-xs border border-[#C5EBDA] dark:border-emerald-500/20">
            #Business
          </div>

          <div className="absolute bottom-1 right-2 sm:right-14 px-2.5 sm:px-3 py-1 rounded-full bg-[#F4F5F7] dark:bg-[#141C2B] text-slate-800 dark:text-slate-200 font-bold text-[11px] sm:text-xs shadow-xs border border-[#E2E5EA] dark:border-slate-700/40">
            #Strategy
          </div>

          <div className="absolute -top-1 right-28 hidden sm:block w-7 h-7 rounded-full bg-amber-200 overflow-hidden border border-white shadow-xs">
            <Users className="w-4 h-4 text-amber-800 m-1" />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. 78% AVERAGE PROGRESS & SPLINE ACTIVITY CURVE                           */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[28px] p-6 sm:p-8 border border-[#EAE4D5] dark:border-white/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: 78% Giant Metric */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            78%
          </div>
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Average progress
          </div>

          <div className="pt-3 flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="block text-slate-400 font-medium">Current activity</span>
              <span className="font-bold text-[#1E7E52] dark:text-emerald-300">Active</span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-white/10" />
            <div>
              <span className="block text-slate-400 font-medium">Lessons</span>
              <span className="font-bold text-[#FA5D5D]">#{progress.completedQuestionIds?.length || 44}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Smooth Spline Curve Chart */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          {/* Header Dates */}
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
            <span>10 mon</span>
            <span>2026</span>
          </div>

          {/* Interactive SVG Spline Wave Chart */}
          <div className="relative w-full h-32 sm:h-36">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 120"
              preserveAspectRatio="none"
              aria-label="Progress trend curve"
            >
              <defs>
                <linearGradient id="anastasiaSplineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FA5D5D" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FA5D5D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area Below Spline */}
              <path
                d="M 20 95 C 100 95, 140 45, 200 50 C 260 55, 300 100, 360 85 C 420 70, 480 20, 580 80 L 580 120 L 20 120 Z"
                fill="url(#anastasiaSplineGradient)"
              />

              {/* Main Coral Spline Stroke */}
              <path
                d="M 20 95 C 100 95, 140 45, 200 50 C 260 55, 300 100, 360 85 C 420 70, 480 20, 580 80"
                fill="none"
                stroke="#FA5D5D"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Data Point Dots & Circles */}
              <circle cx="120" cy="65" r="5" fill="#FA5D5D" className="drop-shadow-sm" />
              <circle cx="270" cy="75" r="5" fill="#FA5D5D" className="drop-shadow-sm" />
              <circle cx="430" cy="40" r="5" fill="#FA5D5D" className="drop-shadow-sm" />
              <circle cx="490" cy="24" r="6" fill="#18191B" stroke="#FA5D5D" strokeWidth="3" />
            </svg>

            {/* Floating Point Indicators (Pill Tags) */}
            <div className="absolute left-[18%] top-[35%] -translate-y-1/2 px-2 py-0.5 rounded-full bg-white dark:bg-[#0B1224] text-slate-800 dark:text-slate-200 border border-[#EAE4D5] dark:border-white/10 text-[10px] font-bold shadow-xs">
              +12
            </div>

            <div className="absolute left-[44%] top-[60%] -translate-y-1/2 px-2 py-0.5 rounded-full bg-white dark:bg-[#0B1224] text-slate-800 dark:text-slate-200 border border-[#EAE4D5] dark:border-white/10 text-[10px] font-bold shadow-xs">
              -22
            </div>

            <div className="absolute left-[68%] top-[20%] -translate-y-1/2 px-2 py-0.5 rounded-full bg-white dark:bg-[#0B1224] text-slate-800 dark:text-slate-200 border border-[#EAE4D5] dark:border-white/10 text-[10px] font-bold shadow-xs">
              +43
            </div>

            {/* Peak Milestone Tooltip (78%) */}
            <div className="absolute left-[80%] -top-2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#18191B] dark:bg-white text-white dark:text-slate-950 font-black text-xs shadow-md">
              78%
            </div>
          </div>

          {/* Month Axis Labels */}
          <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 pt-2">
            <span>May</span>
            <span>Jun</span>
            <span>July</span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10">
              August
            </span>
            <span>September</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW OF 4 STATUS COUNTER CARDS                                         */}
      {/* ========================================================================= */}
      <section aria-label="Status counters" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Counter 1: Total (44) */}
        <div className="bg-[#E3F6ED] dark:bg-[#102B22] rounded-[22px] p-5 border border-[#C5EBDA] dark:border-emerald-500/20 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#1E7E52] text-white flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-emerald-100 tracking-tight">
              44
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-emerald-300">
              Total Units
            </div>
          </div>
        </div>

        {/* Counter 2: Completed (completedQuestionIds.length) */}
        <div className="bg-[#FEECEB] dark:bg-[#2C1416] rounded-[22px] p-5 border border-[#FCD3D1] dark:border-rose-500/20 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#FA5D5D] tracking-tight">
              {`${progress.completedQuestionIds?.length || 3} ข้อ`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-rose-300">
              Completed Questions
            </div>
          </div>
        </div>

        {/* Counter 3: In Progress (masteredWordIds.length) */}
        <div className="bg-[#FEF5E5] dark:bg-[#2B2010] rounded-[22px] p-5 border border-[#FDE5BC] dark:border-amber-500/20 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#FFBA38] text-slate-950 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-[#D98200] dark:text-[#FFBA38] tracking-tight leading-snug">
              {`${progress.masteredWordIds?.length || 2} คำศัพท์ที่เชี่ยวชาญแล้ว`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-amber-300">
              In Progress
            </div>
          </div>
        </div>

        {/* Counter 4: Upcoming / Daily Study (minutesStudiedToday) */}
        <div className="bg-[#F4F5F7] dark:bg-[#141C2B] rounded-[22px] p-5 border border-[#E2E5EA] dark:border-slate-700/40 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {`${progress.minutesStudiedToday ?? 15} นาที`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-300">
              Daily Study Time
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MAIN 70/30 WORKSPACE GRID (Mentors, Streak, Ranks, Tracks, Skills)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================================================================== */}
        {/* LEFT COLUMN (65-70%): MENTOR SPOTLIGHT + LEADERBOARD + QUICK STATS     */}
        {/* ===================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. Teacher / Mentor Spotlight Card ("Oliver Tister - Your Teacher") */}
          <div className="w-full bg-[#1D4E45] text-white rounded-[28px] p-6 sm:p-7 shadow-md relative overflow-hidden space-y-5">
            {/* Top Row: Mentor Header, Level & Flags */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#2A6D61] border-2 border-emerald-400 p-0.5 overflow-hidden flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-200" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#1D4E45] rounded-full" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white leading-tight">
                    Oliver Tister
                  </h3>
                  <p className="text-xs font-medium text-emerald-200/90 font-mono">
                    Your Cambridge Lead Tutor
                  </p>
                </div>
              </div>

              {/* Countdown & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 rounded-full bg-[#0E2823] text-xs font-mono font-bold text-emerald-200 flex items-center gap-1.5 border border-emerald-500/20">
                  <Clock className="w-3.5 h-3.5 text-[#FFBA38]" />
                  <span>3d 23h 12m</span>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold text-white border border-white/20">
                  Level: Advanced ({progress.currentLevel})
                </div>

                <button
                  type="button"
                  aria-label="Send message"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* B. Primary Next Best Action Card (Integrated Inside Mentor Chassis) */}
            <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-5 sm:p-6 border border-white/15 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-[#FFBA38] text-slate-950">
                  {primaryAction.unitBadge}
                </span>
                <span className="text-xs font-mono text-emerald-200 font-bold">
                  {primaryAction.skill} • {primaryAction.timeMin} mins
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {primaryAction.title}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                {primaryAction.description}
              </p>

              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={primaryAction.onStart}
                  className="px-6 py-2.5 rounded-full text-xs font-black bg-[#FA5D5D] hover:bg-[#ff4747] text-white shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>{primaryAction.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('compete')}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5 text-[#FFBA38]" />
                  <span>Speed Vocab Duel</span>
                </button>
              </div>
            </div>

            {/* Quick Resume Card if lastActivity exists */}
            {progress.lastActivity && (
              <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-4 sm:p-5 border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span className="font-bold">ดำเนินการต่อจากจุดเดิม</span>
                  <span className="text-[10px] font-mono opacity-80">{progress.lastActivity.detail}</span>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white">{progress.lastActivity.title}</h4>
                    <p className="text-xs text-emerald-100/80">{progress.lastActivity.detail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(progress.lastActivity?.type === 'grammar' ? 'grammar' : 'vocabulary')}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#FFBA38] text-slate-950 hover:bg-[#ffc65c] transition-all shrink-0"
                  >
                    ทำต่อทันที
                  </button>
                </div>
              </div>
            )}

            {/* Emotional CEFR Building Journey Milestone */}
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-emerald-100/90 flex items-center justify-between">
              <span>{`คุณกำลังพัฒนาเพื่อก้าวสู่ระดับ ${progress.currentLevel === 'A1' ? 'A2' : progress.currentLevel === 'A2' ? 'B1' : progress.currentLevel === 'B1' ? 'B2' : progress.currentLevel === 'B2' ? 'C1' : 'C2'}`}</span>
              <span className="font-mono font-bold text-[#FFBA38]">78%</span>
            </div>
          </div>

          {/* C. Leaderboard / Trophy Rankings (#1, #2, #3 from Dribbble Shot) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FFBA38]" />
                <span>Cambridge Weekly Arena Leaderboard</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('compete')}
                className="text-xs font-bold text-[#FA5D5D] hover:underline flex items-center gap-1"
              >
                <span>View Full Ladder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* #1 Trophy Card (Coral Pink) */}
              <div className="bg-[#FA5D5D] text-white rounded-[22px] px-5 py-4 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0">
                    <Trophy className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-base leading-tight">#1</div>
                    <div className="text-[10px] font-mono opacity-85 truncate">Season Champ</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black font-mono leading-none">35%</div>
                  <div className="text-[10px] opacity-80 mt-1 whitespace-nowrap">Score Delta</div>
                </div>
              </div>

              {/* #2 Trophy Card (Soft Mint / Light Cream) */}
              <div className="bg-[#EAECE6] dark:bg-[#1E2E28] text-slate-900 dark:text-slate-100 rounded-[22px] px-5 py-4 shadow-sm flex items-center justify-between gap-3 border border-slate-300/40 dark:border-white/10 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-white/10 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-200 shrink-0">
                    <Award className="w-4 h-4 text-slate-700 dark:text-slate-200" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-base leading-tight">#2</div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">Frame_CU</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black font-mono text-slate-800 dark:text-emerald-300 leading-none">61%</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">Reflex Acc</div>
                </div>
              </div>

              {/* #3 Trophy Card (Warm Sunflower Amber) */}
              <div className="bg-[#FFBA38] text-slate-950 rounded-[22px] px-5 py-4 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-black text-sm shrink-0">
                    <Award className="w-4 h-4 text-slate-950" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-base leading-tight">#3</div>
                    <div className="text-[10px] font-mono opacity-80 truncate">Apex Learner</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black font-mono leading-none">28%</div>
                  <div className="text-[10px] opacity-80 mt-1 whitespace-nowrap">Weekly Gain</div>
                </div>
              </div>
            </div>
          </div>

          {/* D. Quick Stat / Curated Learning Pathways (Bottom Row of 3) */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curated CEFR Learning Pathways
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Path 1: Vocabulary */}
              <div className="bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[24px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('vocabulary')}
                    aria-label="Learn More Vocabulary"
                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-[#FA5D5D] hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                    คลังคำศัพท์ CEFR
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    3,860 คำศัพท์ตามระดับ A1 ถึง C2 พร้อมตัวอย่าง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('vocabulary')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center"
                >
                  เปิดคลังคำศัพท์
                </button>
              </div>

              {/* Path 2: Grammar */}
              <div className="bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[24px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('grammar')}
                    aria-label="Learn More Grammar"
                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-[#FA5D5D] hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                    ไวยากรณ์ภาษาอังกฤษ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    โครงสร้างประโยค กฎไวยากรณ์ และแบบฝึกจำ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('grammar')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center"
                >
                  ฝึกทำแบบฝึกหัด
                </button>
              </div>

              {/* Path 3: Cambridge Mock Exams */}
              <div className="bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[24px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEECEB] dark:bg-[#2C1416] text-[#FA5D5D] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('mock-exam')}
                    aria-label="Learn More Mock Exams"
                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-[#FA5D5D] hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                    ข้อสอบจำลอง Cambridge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    จำลองข้อสอบ KET, PET, FCE เสมือนจริงจับเวลา
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('mock-exam')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center"
                >
                  เข้าสู่คลังข้อสอบ
                </button>
              </div>
            </div>
          </div>

          {/* E. Weakness List or Empty State */}
          <div className="bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[26px] p-6 border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FA5D5D]" />
                <span>Weakness Diagnostic & Remediation Queue</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {progress.weakTopics?.length || 0} Topics Identified
              </span>
            </div>

            {hasWeakness ? (
              <div className="space-y-2.5">
                {progress.weakTopics.map((topic) => (
                  <div
                    key={topic.tag}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 gap-3"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {topic.labelTh || formatTopicTitle(topic)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        ผิดซ้ำ {topic.errorCount} ครั้ง • Tag: #{topic.tag}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onStartRemediation(topic.tag)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#FA5D5D] text-white hover:bg-[#ff4747] transition-all shrink-0"
                    >
                      ซ่อมจุดนี้
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  คุณทำข้อสอบได้อย่างแม่นยำ ลุยต่อเพื่อวัดระดับความพร้อมในการสอบจริง
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('mock-exam')}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-[#18191B] dark:bg-white text-white dark:text-slate-950 transition-all hover:scale-105 active:scale-95"
                  >
                    ทดลองทำข้อสอบจำลอง
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN (30-35%): STREAK BONUS + ACTIVE TRACKS + SKILL RADAR      */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* A. Bonus Streak for 7 Days Card (Coral Pink Card from Reference) */}
          <div className="w-full bg-[#FA5D5D] text-white rounded-[28px] p-6 sm:p-7 shadow-md text-center space-y-4">
            <h3 className="text-xl font-black text-white tracking-tight">
              Bonus steak for 7 days
            </h3>

            <div className="text-xs font-mono font-bold text-white/90">
              {`รักษาต่อเนื่อง ${progress.streakDays || 5} วัน`}
            </div>

            {/* Streak Day Badges Row */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="bg-white/20 rounded-2xl py-2 px-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFBA38] text-slate-950 font-black text-xs flex items-center justify-center">
                  3
                </div>
                <span className="text-[10px] font-bold mt-1 opacity-90">3D</span>
              </div>

              <div className="bg-white/20 rounded-2xl py-2 px-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFBA38] text-slate-950 font-black text-xs flex items-center justify-center">
                  4
                </div>
                <span className="text-[10px] font-bold mt-1 opacity-90">4D</span>
              </div>

              <div className="bg-white text-[#FA5D5D] rounded-2xl py-2 px-1 flex flex-col items-center shadow-md scale-105">
                <div className="w-6 h-6 rounded-full bg-[#FA5D5D] text-white font-black text-xs flex items-center justify-center">
                  5
                </div>
                <span className="text-[10px] font-black mt-1">5D</span>
              </div>

              <div className="bg-white/20 rounded-2xl py-2 px-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFBA38] text-slate-950 font-black text-xs flex items-center justify-center">
                  6
                </div>
                <span className="text-[10px] font-bold mt-1 opacity-90">6D</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('vocabulary')}
              className="w-full py-2.5 rounded-full font-black text-xs bg-white text-[#FA5D5D] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Get a reward
            </button>
          </div>

          {/* B. Active Course Subject 1 (Accounting Basics -> Cambridge Grammar) */}
          <div className="w-full bg-[#FFBA38] text-slate-950 rounded-[26px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-white">
                  #Accounting
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/70 text-slate-950">
                  #Math
                </span>
              </div>
              <Volume2 className="w-4 h-4 text-slate-950/70" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-950 tracking-tight leading-tight">
                Accounting basics
              </h4>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mt-2 font-mono">
                <span>Progress</span>
                <span>48%</span>
              </div>
            </div>

            {/* Circular or Bar Progress */}
            <div className="w-full h-2 rounded-full bg-slate-950/15 overflow-hidden">
              <div className="h-full bg-slate-950 rounded-full" style={{ width: '48%' }} />
            </div>
          </div>

          {/* C. Active Course Subject 2 (Product Design -> Cambridge Vocabulary Arena) */}
          <div className="w-full bg-[#1D4E45] text-white rounded-[26px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-slate-950">
                  #Accounting
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                  #Math
                </span>
              </div>
              <Volume2 className="w-4 h-4 text-emerald-200/80" />
            </div>

            <div>
              <h4 className="text-xl font-black text-white tracking-tight leading-tight">
                Product Design
              </h4>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200 mt-2 font-mono">
                <span>Progress</span>
                <span>78%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          {/* D. Skill Mastery Progress Bars (6 Core Competencies with ARIA progressbar) */}
          <div className="w-full bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[26px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FA5D5D]" />
                <span>6 Core Skill Competencies</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">%</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Vocabulary', val: progress.skillStats?.vocabulary ?? 65, color: '#FA5D5D' },
                { label: 'Grammar', val: progress.skillStats?.grammar ?? 72, color: '#FFBA38' },
                { label: 'Reading', val: progress.skillStats?.reading ?? 80, color: '#1E7E52' },
                { label: 'Listening', val: progress.skillStats?.listening ?? 58, color: '#4F68D9' },
                { label: 'Writing', val: progress.skillStats?.writing ?? 50, color: '#D98200' },
                { label: 'Speaking', val: progress.skillStats?.speaking ?? 45, color: '#E04F8A' },
              ].map((skill) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{skill.label}</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {skill.val}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={skill.label}
                    aria-valuenow={skill.val}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.val}%`,
                        backgroundColor: skill.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
