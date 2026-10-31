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
  X,
  Bot,
  Loader2,
  Compass,
} from 'lucide-react';
import { UserProgressState, CEFRLevel } from '../../types';
import { CEFR_LEVELS } from '../../data/cefrLevels';
import { NavView } from '../common/Sidebar';
import { useTranslation } from '../../i18n';

interface DashboardViewProps {
  progress: UserProgressState;
  onNavigate: (view: NavView) => void;
  onStartRemediation: (weakTag: string) => void;
  onSelectLevel?: (level: CEFRLevel) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onStartRemediation,
  onSelectLevel,
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

  // AI Mentor Consultation Modal State
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorHistory, setMentorHistory] = useState<
    Array<{
      sender: 'user' | 'mentor';
      text: string;
      action?: { label: string; view?: NavView; weakTag?: string };
    }>
  >([
    {
      sender: 'mentor',
      text: isEn
        ? `Hello! I'm your Glova AI Linguistic Mentor. You are currently at CEFR ${progress.currentLevel}. How can I assist your study routine today?`
        : `สวัสดีครับ! ผมคือ Glova AI Mentor ผู้ช่วยวิเคราะห์ภาษาอังกฤษระดับ CEFR ${progress.currentLevel} ของคุณ วันนี้อยากให้ช่วยวิเคราะห์จุดอ่อน หรือมีคำถามเรื่องไวยากรณ์/คำศัพท์เรื่องไหนสอบถามได้เลยครับ`,
    },
  ]);
  const [isMentorThinking, setIsMentorThinking] = useState(false);

  const handleAskMentor = (promptText?: string) => {
    const q = (promptText || mentorInput).trim();
    if (!q) return;

    setMentorHistory((prev) => [...prev, { sender: 'user', text: q }]);
    if (!promptText) setMentorInput('');
    setIsMentorThinking(true);

    setTimeout(() => {
      let reply = '';
      let action: { label: string; view?: NavView; weakTag?: string } | undefined;

      const lowerQ = q.toLowerCase();
      if (lowerQ.includes('จุดอ่อน') || lowerQ.includes('weakness') || lowerQ.includes('วิเคราะห์')) {
        if (topWeakness) {
          reply = isEn
            ? `Based on recent diagnostic assessments, your primary area for improvement is "${formatTopicTitle(topWeakness)}" with ${topWeakness.errorCount} recorded mistakes. Targeted practice will quickly close this gap!`
            : `จากการประเมินล่าสุด จุดที่ควรเสริมความมั่นใจที่สุดคือเรื่อง "${formatTopicTitle(topWeakness)}" (พบข้อผิดพลาด ${topWeakness.errorCount} ครั้ง) แนะนำให้ทำแบบฝึกหัดเฉพาะจุดเพื่อเพิ่มคะแนนได้ทันทีครับ`;
          action = {
            label: isEn ? 'Remediate this weakness now' : 'ฝึกแก้จุดอ่อนเรื่องนี้ทันที',
            weakTag: topWeakness.tag,
          };
        } else {
          reply = isEn
            ? `Great progress! You currently don't have critical weak topics. Keep strengthening vocabulary and timed exam stamina.`
            : `ยอดเยี่ยมมากครับ! ตอนนี้คุณไม่มีจุดอ่อนวิกฤตเลย ทักษะโดยรวมสมดุลดีมาก แนะนำให้ลุยคลังคำศัพท์และสอบจำลอง Mock Exam ต่อเนื่องครับ`;
          action = {
            label: isEn ? 'Open Vocabulary Studio' : 'ไปที่คลังคำศัพท์',
            view: 'vocabulary',
          };
        }
      } else if (lowerQ.includes('คำศัพท์') || lowerQ.includes('vocab')) {
        reply = isEn
          ? `For CEFR ${progress.currentLevel}, focus on precision collocations and phrasal verbs in context rather than isolated definitions.`
          : `สำหรับระดับ CEFR ${progress.currentLevel} เทคนิคที่ดีที่สุดคือการจำคำศัพท์พร้อมประโยคบริบทและ Collocations เพื่อให้นำไปใช้จริงได้ทันทีในข้อสอบครับ`;
        action = {
          label: isEn ? 'Open Vocabulary Bank' : 'เปิดดูคลังคำศัพท์',
          view: 'vocabulary',
        };
      } else if (lowerQ.includes('สอบ') || lowerQ.includes('exam') || lowerQ.includes('cambridge')) {
        reply = isEn
          ? `In Cambridge exams, time management in Reading & Use of English is critical. Practice eliminating distractor choices fast.`
          : `การสอบ Cambridge Exam ข้อสอบพาร์ท Reading & Use of English มักมีตัวเลือกหลอก เทคนิคสำคัญคือการดู Part of Speech และตัดช้อยส์ที่ไม่เข้ากับโครงสร้างประโยคออกก่อนครับ`;
        action = {
          label: isEn ? 'Start Cambridge Mock Exam' : 'เริ่มสอบจำลอง Cambridge',
          view: 'mockExam',
        };
      } else {
        reply = isEn
          ? `Excellent query regarding "${q}". To excel at CEFR ${progress.currentLevel}, consistent daily practice with spaced repetition will yield the highest retention.`
          : `คำถามที่ดีมากเกี่ยวกับ "${q}" ครับ สำหรับเป้าหมายระดับ CEFR ${progress.currentLevel} การฝึกอย่างสม่ำเสมอวันละ 15-20 นาทีพร้อมระบบทบทวนแบบ Spaced Repetition จะช่วยให้จำได้อย่างแม่นยำที่สุดครับ`;
      }

      setMentorHistory((prev) => [...prev, { sender: 'mentor', text: reply, action }]);
      setIsMentorThinking(false);
    }, 500);
  };

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
      {/* 2. ONBOARDING HERO OR DAILY GUIDED LEARNING PATH                          */}
      {/* ========================================================================= */}
      {!progress.assessmentCompleted ? (
        /* ----------------------------------------------------------------------- */
        /* NEW LEARNER ONBOARDING HERO: Clear 2 Choices to Start                     */
        /* ----------------------------------------------------------------------- */
        <section aria-label="New learner onboarding" className="w-full rounded-[28px] bg-gradient-to-br from-white via-[#FFF8F6] to-[#FFF0EC] dark:from-[#1A1826] dark:via-[#161421] dark:to-[#1E1622] p-6 sm:p-8 lg:p-10 border-2 border-[#FA5D5D]/25 shadow-md space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FA5D5D]/10 blur-3xl pointer-events-none" />

          {/* Top Header & Context */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FA5D5D]/15 pb-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/25 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'Welcome to Glova • Step 1: Set Your Baseline' : 'ยินดีต้อนรับสู่ Glova • เริ่มต้นก้าวแรกของคุณ'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {isEn ? 'How would you like to start today?' : 'คุณต้องการเริ่มต้นเรียนรู้อย่างไร?'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {isEn
                  ? 'To match vocabulary, grammar rules, and mock exams to your exact skill level, choose one of the options below:'
                  : 'เพื่อให้ระบบจัดระดับคำศัพท์ แบบฝึกหัดไวยากรณ์ และข้อสอบจำลองให้เหมาะสมกับคุณที่สุด กรุณาเลือก 1 ช่องทาง:'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
              <span className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold border border-border/80 shadow-2xs">
                CEFR Standard • A1 - C2
              </span>
            </div>
          </div>

          {/* Dual Starting Pathways (Test vs Direct Selection) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option 1: Quick 3-Min Placement Test */}
            <div className="rounded-[22px] bg-white dark:bg-[#201D2E] p-6 border-2 border-[#FA5D5D]/40 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#FA5D5D] transition-colors relative">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D5D] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {isEn ? 'Recommended' : 'แนะนำที่สุด'}
                </span>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FA5D5D]/15 text-[#FA5D5D] flex items-center justify-center">
                  <Compass className="w-6 h-6 text-[#FA5D5D]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {isEn ? '🎯 Take 3-Min Placement Test' : '🎯 ทำแบบทดสอบวัดระดับด่วน (3 นาที)'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-sans">
                    {isEn
                      ? 'Answer 8 quick questions. Glova will automatically calibrate your CEFR tier and identify weak grammar topics.'
                      : 'ตอบคำถามสั้นๆ เพียง 8 ข้อ ระบบจะวิเคราะห์ระดับ CEFR (A1-C2) และคำนวณจุดแข็ง-จุดอ่อนให้อัตโนมัติ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('assessment')}
                className="w-full py-3 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#FA5D5D]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isEn ? 'Start 3-Min Placement Test' : 'เริ่มทำแบบทดสอบวัดระดับ'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Option 2: Self-Select Level Directly */}
            <div className="rounded-[22px] bg-white dark:bg-[#201D2E] p-6 border border-border/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {isEn ? '⚡ Or Select Your Starting Level Directly' : '⚡ หรือ เลือกระดับเริ่มต้นด้วยตนเอง'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-sans">
                    {isEn
                      ? 'Already know your level or want to start from absolute basics? Choose any tier below to enter immediately:'
                      : 'หากคุณทราบระดับของตนเองอยู่แล้ว สามารถกดเลือกระดับเพื่อเริ่มเรียนได้ทันทีโดยไม่ต้องสอบ:'}
                  </p>
                </div>
              </div>

              {/* 6 CEFR Tier Selection Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { lvl: 'A1' as const, titleTh: 'A1 เริ่มต้น', desc: 'พื้นฐานเริ่มต้น' },
                  { lvl: 'A2' as const, titleTh: 'A2 ขั้นต้น', desc: 'สื่อสารทั่วไป' },
                  { lvl: 'B1' as const, titleTh: 'B1 ปานกลาง', desc: 'ทำงาน/ชีวิตประจำวัน' },
                  { lvl: 'B2' as const, titleTh: 'B2 กลางสูง', desc: 'วิชาการ/สอบแข่งขัน' },
                  { lvl: 'C1' as const, titleTh: 'C1 ขั้นสูง', desc: 'ภาษาอังกฤษระดับสูง' },
                  { lvl: 'C2' as const, titleTh: 'C2 เชี่ยวชาญ', desc: 'เทียบเคียงเจ้าของภาษา' },
                ].map((tier) => (
                  <button
                    key={tier.lvl}
                    type="button"
                    onClick={() => onSelectLevel?.(tier.lvl)}
                    className="py-2.5 px-2 rounded-xl border border-border/80 bg-slate-50 dark:bg-white/5 hover:border-[#FA5D5D] hover:bg-[#FA5D5D]/10 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all active:scale-95 text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer group"
                  >
                    <span className="font-mono text-sm group-hover:text-[#FA5D5D] transition-colors">{tier.lvl}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium truncate max-w-full">
                      {tier.titleTh.split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ----------------------------------------------------------------------- */
        /* ACTIVE LEARNER: TODAY'S GUIDED 3-STEP LEARNING MISSION (15 MINS)          */
        /* ----------------------------------------------------------------------- */
        <section aria-label="Today's learning mission" className="w-full rounded-[28px] bg-white dark:bg-[#1A1826] p-6 sm:p-7 border border-border/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap" role="status">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-mono font-bold">
                  {`ระดับปัจจุบัน: CEFR ${progress.currentLevel}`}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {`เป้าหมายการสอบ: Cambridge ${progress.targetExam}`}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs font-mono text-[#FA5D5D] font-bold">
                  {`คะแนนประเมิน: ${progress.estimatedCambridgeScore || 148} pts`}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
                {isEn ? "Today's Guided Learning Mission (15 Minutes)" : 'ภารกิจการเรียนรู้วันนี้ (3 ขั้นตอน • 15 นาที)'}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('assessment')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FA5D5D] hover:underline self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Retake Placement Test' : 'ทดสอบวัดระดับใหม่'}</span>
            </button>
          </div>

          {/* 3 Clear Steps for Today */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Vocabulary */}
            <div className="rounded-[20px] bg-[#FAF8F3] dark:bg-white/5 p-5 border border-border/80 flex flex-col justify-between space-y-4 hover:border-[#FA5D5D]/50 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-[#FA5D5D] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">5 MINS</span>
                </div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  📚 คำศัพท์ประจำวัน
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  เรียนรู้คำศัพท์ Oxford & CEFR ความถี่สูง พร้อมตัวอย่างประโยคบริบทจริง
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('vocabulary')}
                className="w-full py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold shadow-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>เริ่มท่องคำศัพท์</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2: Grammar */}
            <div className="rounded-[20px] bg-[#FAF8F3] dark:bg-white/5 p-5 border border-border/80 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">5 MINS</span>
                </div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  ✍️ ไวยากรณ์และการนำไปใช้
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  ฝึกโครงสร้างประโยคและหลักไวยากรณ์ตามระดับ CEFR พร้อมแบบฝึกหัด 5 ข้อ
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('grammar')}
                className="w-full py-2.5 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-border/80 text-xs font-bold shadow-2xs transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>ฝึกทำแบบฝึกหัด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 3: Mock Exam / Quiz */}
            <div className="rounded-[20px] bg-[#FAF8F3] dark:bg-white/5 p-5 border border-border/80 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-500 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">5 MINS</span>
                </div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  🎓 สอบจำลอง Cambridge
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  ทดลองทำข้อสอบจริง จับเวลา และตรวจประเมินคะแนนทันทีหลังทำเสร็จ
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('mockExam')}
                className="w-full py-2.5 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-border/80 text-xs font-bold shadow-2xs transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>เข้าคลังข้อสอบ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. ROW OF 4 STATUS COUNTER CARDS                                         */}
      {/* ========================================================================= */}
      <section aria-label="Status counters" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Counter 1: Daily Study Goal */}
        <div className="bg-[#E3F6ED] dark:bg-[#102B22] rounded-[22px] p-5 border border-[#C5EBDA] dark:border-emerald-500/20 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#1E7E52] text-white flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-emerald-100 tracking-tight">
              {`${minutesStudied}/${goalMinutes} น.`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-emerald-300">
              {`${goalPercent}% เป้าหมายวันนี้`}
            </div>
          </div>
        </div>

        {/* Counter 2: Completed Questions */}
        <div className="bg-[#FEECEB] dark:bg-[#2C1416] rounded-[22px] p-5 border border-[#FCD3D1] dark:border-rose-500/20 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#FA5D5D] tracking-tight">
              {`${progress.completedQuestionIds?.length || 0} ข้อ`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-rose-300">
              {isEn ? 'Completed Questions' : 'แบบฝึกหัดที่ทำเสร็จ'}
            </div>
          </div>
        </div>

        {/* Counter 3: Mastered Words */}
        <div className="bg-[#FEF5E5] dark:bg-[#2B2010] rounded-[22px] p-5 border border-[#FDE5BC] dark:border-amber-500/20 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#FFBA38] text-slate-950 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#D98200] dark:text-[#FFBA38] tracking-tight">
              {`${progress.masteredWordIds?.length || 0} คำ`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-amber-300">
              {isEn ? 'Mastered Words' : 'คำศัพท์ที่เชี่ยวชาญ'}
            </div>
          </div>
        </div>

        {/* Counter 4: Study Streak */}
        <div className="bg-[#F4F5F7] dark:bg-[#141C2B] rounded-[22px] p-5 border border-[#E2E5EA] dark:border-slate-700/40 shadow-xs flex flex-col justify-between space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#FFBA38]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {`${progress.streakDays || 1} วัน`}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-300">
              {isEn ? 'Study Streak' : 'เรียนต่อเนื่อง (Streak)'}
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
                  onClick={() => setIsMentorModalOpen(true)}
                  aria-label="Consult AI Mentor"
                  title="ปรึกษา Glova AI Mentor"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
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
              <div className="bg-[#FAF8F3] dark:bg-[#23212C]/95 backdrop-blur-md rounded-[24px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
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
                    คำศัพท์ตามระดับ A1 ถึง C2 พร้อมตัวอย่าง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('vocabulary')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#2A2735] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center"
                >
                  เปิดคลังคำศัพท์
                </button>
              </div>

              {/* Path 2: Grammar */}
              <div className="bg-[#FAF8F3] dark:bg-[#23212C]/95 backdrop-blur-md rounded-[24px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
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
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#2A2735] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center"
                >
                  ฝึกทำแบบฝึกหัด
                </button>
              </div>

              {/* Path 3: Cambridge Mock Exams */}
              <div className="bg-[#FAF8F3] dark:bg-[#23212C]/95 backdrop-blur-md rounded-[24px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
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
                  className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#2A2735] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center"
                >
                  เข้าสู่คลังข้อสอบ
                </button>
              </div>
            </div>
          </div>

          {/* E. Weakness List or Empty State */}
          <div className="bg-[#FAF8F3] dark:bg-[#23212C]/95 backdrop-blur-md rounded-[26px] p-6 border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-4">
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#2A2735] border border-[#EAE4D5] dark:border-white/10 gap-3"
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
              <div className="p-6 rounded-2xl bg-white dark:bg-[#2A2735] border border-[#EAE4D5] dark:border-white/10 text-center space-y-2">
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
          {/* A. 7-Day Study Streak Card */}
          <div className="w-full bg-[#FA5D5D] text-white rounded-[28px] p-6 sm:p-7 shadow-md text-center space-y-4">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-[#FFBA38] animate-pulse" />
              <span>{isEn ? '7-Day Study Streak' : 'สถิติเรียนต่อเนื่อง 7 วัน'}</span>
            </h3>

            <div className="text-xs font-mono font-bold text-white/90">
              {`รักษาความต่อเนื่องแล้ว ${progress.streakDays || 1} วัน`}
            </div>

            {/* Streak Day Badges Row */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[1, 2, 3, 4].map((d) => {
                const currentDay = progress.streakDays || 1;
                const isCurrent = d === Math.min(4, currentDay);
                return (
                  <div
                    key={d}
                    className={`rounded-2xl py-2 px-1 flex flex-col items-center ${
                      isCurrent
                        ? 'bg-white text-[#FA5D5D] shadow-md scale-105'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#FA5D5D] text-white'
                          : 'bg-[#FFBA38] text-slate-950'
                      }`}
                    >
                      {d}
                    </div>
                    <span className="text-[10px] font-bold mt-1 opacity-90">{d}D</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('vocabulary')}
              className="w-full py-2.5 rounded-full font-black text-xs bg-white text-[#FA5D5D] hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {isEn ? 'Continue Daily Streak' : 'เรียนต่อเพื่อรักษาสถิติ'}
            </button>
          </div>

          {/* B. Active English Course 1: Vocabulary Studio */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('vocabulary')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('vocabulary')}
            className="w-full bg-[#FFBA38] text-slate-950 rounded-[26px] p-5 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-white">
                  #Vocabulary
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/70 text-slate-950">
                  #Oxford3000
                </span>
              </div>
              <BookOpen className="w-4 h-4 text-slate-950/70" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-950 tracking-tight leading-tight">
                Cambridge Vocabulary
              </h4>
              <p className="text-xs text-slate-900/80 mt-0.5">
                คำศัพท์ตามระดับ A1-C2 พร้อมตัวอย่าง
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mt-2 font-mono">
                <span>คำที่เชี่ยวชาญแล้ว</span>
                <span>{progress.masteredWordIds?.length || 0} คำ</span>
              </div>
            </div>

            {/* Real Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-950/15 overflow-hidden">
              <div
                className="h-full bg-slate-950 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(10, ((progress.masteredWordIds?.length || 0) / 30) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* C. Active English Course 2: Grammar Studio */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('grammar')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('grammar')}
            className="w-full bg-[#1D4E45] text-white rounded-[26px] p-5 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-slate-950">
                  #Grammar
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                  {`#CEFR_${progress.currentLevel}`}
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-200/80" />
            </div>

            <div>
              <h4 className="text-xl font-black text-white tracking-tight leading-tight">
                Grammar in Context
              </h4>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                โครงสร้างประโยค กฎไวยากรณ์ และข้อสอบ
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200 mt-2 font-mono">
                <span>ข้อที่ฝึกฝนแล้ว</span>
                <span>{progress.completedQuestionIds?.length || 0} ข้อ</span>
              </div>
            </div>

            {/* Real Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, ((progress.completedQuestionIds?.length || 0) / 20) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* D. Skill Mastery Progress Bars (6 Core Competencies with ARIA progressbar) */}
          <div className="w-full bg-[#FAF8F3] dark:bg-[#23212C]/95 backdrop-blur-md rounded-[26px] p-5 border border-[#EAE4D5] dark:border-white/10 shadow-xs space-y-4">
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

      {/* AI Mentor Interactive Consultation Dialog */}
      {isMentorModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mentor-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMentorModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0F1626] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 relative flex flex-col max-h-[85vh] text-slate-900 dark:text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="mentor-dialog-title" className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    Glova AI Mentor
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEn ? `CEFR Level ${progress.currentLevel} Adaptive Guidance` : `ที่ปรึกษาการเรียนภาษาอังกฤษ CEFR ${progress.currentLevel}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMentorModalOpen(false)}
                aria-label="Close mentor modal"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">
                {isEn ? 'Quick Ask:' : 'ถามด่วน:'}
              </span>
              <button
                type="button"
                onClick={() => handleAskMentor(isEn ? 'Analyze my weakest topic' : 'วิเคราะห์จุดอ่อนสำคัญที่สุดของฉัน')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shrink-0 active:scale-95"
              >
                {isEn ? 'Weakest Topic' : 'วิเคราะห์จุดอ่อน'}
              </button>
              <button
                type="button"
                onClick={() => handleAskMentor(isEn ? 'Vocabulary study tips' : 'แนะนำเทคนิคจำคำศัพท์ CEFR')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FA5D5D]/10 text-[#FA5D5D] dark:text-[#FA5D5D] border border-[#FA5D5D]/20 hover:bg-[#FA5D5D]/20 transition-all shrink-0 active:scale-95"
              >
                {isEn ? 'Vocab Strategy' : 'เทคนิคจำศัพท์'}
              </button>
              <button
                type="button"
                onClick={() => handleAskMentor(isEn ? 'Cambridge exam strategy' : 'ขอเทคนิคสอบ Cambridge Exam')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all shrink-0 active:scale-95"
              >
                {isEn ? 'Exam Strategy' : 'เทคนิคทำข้อสอบ'}
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2">
              {mentorHistory.map((msg, idx) => (
                <div
                  key={`msg_${idx}`}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-br-xs'
                        : 'bg-slate-100 dark:bg-[#1A2336] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Integrated Action Button */}
                    {msg.action && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMentorModalOpen(false);
                            if (msg.action?.weakTag) {
                              onStartRemediation(msg.action.weakTag);
                            } else if (msg.action?.view) {
                              onNavigate(msg.action.view);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-[#FA5D5D] hover:bg-[#ff4747] text-white shadow-xs active:scale-95 transition-all"
                        >
                          <span>{msg.action.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isMentorThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>{isEn ? 'AI Mentor is analyzing...' : 'Glova AI กำลังวิเคราะห์...'}</span>
                </div>
              )}
            </div>

            {/* Question Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskMentor();
              }}
              className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={mentorInput}
                onChange={(e) => setMentorInput(e.target.value)}
                placeholder={isEn ? 'Ask Glova Mentor anything about English...' : 'พิมพ์คำถามเรื่องภาษาอังกฤษหรือขอคำแนะนำ...'}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!mentorInput.trim() || isMentorThinking}
                aria-label="Send question to AI mentor"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
