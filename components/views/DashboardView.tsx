'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Compass,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { UserProgressState, CEFRLevel } from '../../types';
import { CEFR_LEVELS } from '../../data/cefrLevels';
import { NavView } from '../common/Sidebar';
import { useTranslation } from '../../i18n';
import {
  GlovaCard,
  GlovaCardContent,
  GlovaButton,
  GlovaLevelBadge,
  GlovaSkillBadge,
  GlovaProgressBar,
  GlovaProgressCard,
  GlovaLearningCard,
  GlovaSectionHeader,
  GlovaBubble,
  GoalBubble,
  InsightBubble,
  AchievementBubble,
  DiscoveryBubble,
  CEFRTier,
} from '../ui';

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

  // Compute Daily Goal Completion
  const goalPercent = Math.min(
    100,
    Math.round((progress.minutesStudiedToday / (progress.dailyGoalMinutes || 20)) * 100)
  );

  // Determine Primary Next Best Action based on real data
  const hasWeakness = progress.weakTopics && progress.weakTopics.length > 0;
  const topWeakness = hasWeakness ? progress.weakTopics[0] : null;

  const primaryActionConfig = React.useMemo(() => {
    if (topWeakness) {
      return {
        title: isEn ? `Review & Remediate: ${topWeakness.tag}` : `ทบทวนและซ่อมแซม: ${topWeakness.labelTh}`,
        description: isEn
          ? `Detected ${topWeakness.errorCount} mistakes in practice tests. Recommended to practice now to strengthen confidence.`
          : `ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้งในแบบทดสอบ แนะนำให้ฝึกฝนทันทีเพื่อเสริมความมั่นใจ`,
        reason: isEn
          ? `Recommended because: Detected ${topWeakness.errorCount} mistakes in practice. Focusing here accelerates your path to ${nextLvl}.`
          : `แนะนำเพราะ: ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้งในแบบทดสอบ จุดนี้จะช่วยให้คุณก้าวสู่ระดับถัดไปได้เร็วที่สุด`,
        skill: 'Grammar & Phrasing',
        difficulty: `${progress.currentLevel} → ${nextLvl}`,
        estimatedMinutes: 8,
        ctaText: isEn ? 'Practice Now' : 'เริ่มฝึกจุดนี้ทันที',
        onStart: () => onStartRemediation(topWeakness.tag),
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />,
      };
    }

    if (!progress.assessmentCompleted) {
      return {
        title: isEn ? 'Take CEFR Diagnostic Assessment' : 'ทำแบบทดสอบวัดระดับ CEFR Diagnostic Test',
        description: isEn
          ? 'Comprehensive proficiency assessment (A1-C2) to unlock your personalized learning journey.'
          : 'ประเมินระดับความสามารถทางภาษาอังกฤษรอบด้าน (A1-C2) เพื่อปลดล็อกแผนการเรียนเฉพาะบุคคล',
        reason: isEn
          ? 'Recommended because: Pinpoints your current strengths and target areas for focused 5-minute daily practice.'
          : 'แนะนำเพราะ: ช่วยประเมินจุดแข็งและจุดที่ควรฝึกเพิ่ม เพื่อวางแผนการเรียน 5 นาทีต่อวันอย่างตรงจุด',
        skill: 'Diagnostic Check',
        difficulty: `${progress.currentLevel}`,
        estimatedMinutes: 15,
        ctaText: isEn ? 'Start Assessment' : 'เริ่มวัดระดับภาษา',
        onStart: () => onNavigate('assessment'),
        icon: <Sparkles className="w-5 h-5 text-indigo-500" aria-hidden="true" />,
      };
    }

    return {
      title: isEn ? `Daily Practice: ${progress.currentLevel} Vocabulary & Grammar` : `ฝึกฝนประจำวัน: คำศัพท์และไวยากรณ์ระดับ ${progress.currentLevel}`,
      description: isEn
        ? `Review key vocabulary with Spaced Repetition and complete practice exercises for ${progress.targetExam}.`
        : `ทบทวนคำศัพท์สำคัญตาม Spaced Repetition และทำแบบฝึกหัดสำหรับเป้าหมายสอบ ${progress.targetExam}`,
      reason: isEn
        ? `Recommended because: Daily Spaced Repetition reinforces memory retention for advancement to ${nextLvl}.`
        : `แนะนำเพราะ: คลังคำศัพท์สำคัญตามรอบความจำ Spaced Repetition ประจำวันช่วยเสริมความมั่นใจสู่ระดับ ${nextLvl}`,
      skill: 'Vocabulary & Context',
      difficulty: `${progress.currentLevel} → ${nextLvl}`,
      estimatedMinutes: 10,
      ctaText: isEn ? 'Start Practice Now' : 'เริ่มฝึกฝนทันที',
      onStart: () => onNavigate('vocabulary'),
      icon: <BookOpen className="w-5 h-5 text-indigo-500" aria-hidden="true" />,
    };
  }, [topWeakness, progress.assessmentCompleted, progress.currentLevel, progress.targetExam, onStartRemediation, onNavigate, nextLvl, isEn]);

  return (
    <div className="w-full space-y-8 pb-16">
      {/* 1. Header / Playful Editorial Bubble Hero */}
      <section className="rounded-[32px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)] relative overflow-hidden">
        {/* Subtle Warm Photographic Ambient Backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-8 dark:opacity-10 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
            alt="University students engaged in academic study and discussion"
            className="w-full h-full object-cover"
            loading="lazy"
            width={1600}
            height={900}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF8] via-[#FFFDF8]/95 to-transparent dark:from-card dark:via-card/95" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Pill Meta Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold select-none border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Personalized Learning Journey</span>
              </span>
              <GlovaLevelBadge
                level={progress.currentLevel as CEFRTier}
                showLabel
                size="md"
              />
            </div>

            {/* Streak Micro-Pill */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-semibold"
              role="status"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/30" aria-hidden="true" />
              <span>{isEn ? `${progress.streakDays} Day Streak` : `${progress.streakDays} วันต่อเนื่อง`}</span>
            </div>
          </div>

          {/* Hero Greeting & Aspirations */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>READY FOR A 7-MINUTE CHALLENGE?</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                {isEn ? `Exam Target: ${progress.targetExam}` : `เป้าหมายการสอบ: ${progress.targetExam}`}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isEn ? (
                  <>
                    Current English proficiency is{' '}
                    <strong className="text-foreground font-semibold">
                      {currentLevelInfo.nameEn}
                    </strong>
                    , estimated Cambridge score is{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                      {progress.estimatedCambridgeScore}
                    </strong>{' '}
                    points
                  </>
                ) : (
                  <>
                    ระดับภาษาปัจจุบันคือ{' '}
                    <strong className="text-foreground font-semibold">
                      {currentLevelInfo.nameTh}
                    </strong>{' '}
                    เทียบเคียงคะแนนเคมบริดจ์ประมาณ{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                      {progress.estimatedCambridgeScore}
                    </strong>{' '}
                    คะแนน
                  </>
                )}
              </p>
            </div>

            {/* Quick Cambridge Equivalent Summary Tile */}
            <div className="flex items-center gap-4 p-4 rounded-[22px] bg-white dark:bg-card/80 border border-[#EDE8DF] dark:border-border/40 shrink-0 shadow-xs">
              <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl font-mono shrink-0 shadow-xs">
                {progress.currentLevel}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Cambridge Equivalent</span>
                <span className="text-sm font-bold text-foreground">{currentLevelInfo.cambridgeEquivalent}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('assessment')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold inline-flex items-center gap-1 transition-colors mt-0.5"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>{isEn ? 'Retake Assessment' : 'วัดระดับภาษาใหม่'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Linear CEFR Journey Rail (Tactile Bubble Tracker) */}
          <div className="mt-4 pt-6 border-t border-[#EDE8DF] dark:border-border/30">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">
                {isEn ? 'CEFR Framework Progression' : 'เส้นทางการพัฒนา CEFR Framework'}
              </span>
              <span className="text-foreground font-semibold">
                {isEn
                  ? `Current: ${progress.currentLevel} • Progressing toward ${nextLvl}`
                  : `ระดับปัจจุบัน: ${progress.currentLevel} • คุณกำลังพัฒนาเพื่อก้าวสู่ระดับ ${nextLvl}`}
              </span>
            </div>

            {/* Visual Tactile Rail */}
            <div className="relative pt-2 pb-2">
              {/* Background Connecting Rail */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-2 rounded-full bg-[#EDE8DF] dark:bg-muted" />

              {/* Step Bubbles Grid */}
              <div className="relative z-10 grid grid-cols-6 gap-2">
                {allLevels.map((lvl, idx) => {
                  const isPassed = idx < currentLevelIdx;
                  const isCurrent = idx === currentLevelIdx;
                  return (
                    <div key={lvl} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm font-mono transition-all duration-300 shadow-xs ${
                          isPassed
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-[#5B5CE2] text-white ring-4 ring-indigo-500/20 shadow-indigo-500/30 scale-110'
                            : 'bg-white dark:bg-card text-muted-foreground/60 border border-[#EDE8DF] dark:border-border/40'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        ) : (
                          <span>{lvl}</span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-semibold ${
                          isCurrent
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                            : isPassed
                            ? 'text-foreground'
                            : 'text-muted-foreground/60'
                        }`}
                      >
                        {lvl}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Playful Game & Social Arena Hero (Bubble-Gaming Hub) */}
      <section className="rounded-[28px] bg-gradient-to-tr from-[#5B5CE2]/10 via-[#F6D978]/10 to-[#FF8F82]/10 border border-[#5B5CE2]/20 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Game Level & XP Bar */}
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#5B5CE2] text-white font-black text-xs uppercase tracking-wider shadow-xs">
                Level 12 • Pathfinder
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{progress.streakDays} Day Streak</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                Bangkok League • Rank #10
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {isEn ? 'Arena & Daily Vocabulary Battle' : 'สนามประลองคำศัพท์และลีกประจำสัปดาห์'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isEn
                  ? 'Challenge your reflexes in 4-second battles, earn XP, and climb the university leaderboard with your study squad.'
                  : 'ท้าทายความเร็วกับแบบทดสอบจับเวลา 4 วินาที เก็บ XP ไต่ระดับลีก และแข่งกับเพื่อนนักศึกษา'}
              </p>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground">{isEn ? 'Level Progress' : 'ความคืบหน้าเลเวล'}</span>
                <span className="text-[#5B5CE2] tabular-nums font-black">1,250 / 1,500 XP (83%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#5B5CE2] to-[#FF8F82] w-[83%]" />
              </div>
            </div>
          </div>

          {/* Right: Quick Action Cards */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              href="/compete"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#5B5CE2] hover:bg-[#4D4EC9] text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Swords className="w-4 h-4" />
              <span>{isEn ? 'Play Vocab Battle' : 'ประลองคำศัพท์ (4s)'}</span>
            </Link>
            <Link
              href="/ranking"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white dark:bg-card hover:bg-muted border border-border/60 text-foreground font-bold text-sm shadow-xs transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'League' : 'อันดับลีก'}</span>
            </Link>
            <Link
              href="/achievements"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white dark:bg-card hover:bg-muted border border-border/60 text-foreground font-bold text-sm shadow-xs transition-colors"
            >
              <Award className="w-4 h-4 text-[#5B5CE2]" />
              <span>{isEn ? 'Badges' : 'เหรียญตรา'}</span>
            </Link>
            <Link
              href="/social"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white dark:bg-card hover:bg-muted border border-border/60 text-foreground font-bold text-sm shadow-xs transition-colors"
            >
              <Users className="w-4 h-4 text-[#FF8F82]" />
              <span>{isEn ? 'Friends' : 'เพื่อน'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Asymmetric 70/30 Focal Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70% - 8 cols): What Next & Curated Action Paths */}
        <div className="lg:col-span-8 space-y-6">
          {/* Resume Where You Left Off (Attention-Friendly) */}
          {progress.lastActivity && (
            <div className="p-4 sm:p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isEn ? 'Resume where you left off' : 'ดำเนินการต่อจากจุดเดิม'}</span>
                </div>
                <h2 className="text-sm font-bold text-foreground">{progress.lastActivity.title}</h2>
                <p className="text-xs text-muted-foreground">{progress.lastActivity.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const view =
                    progress.lastActivity?.type === 'assessment'
                      ? 'assessment'
                      : (progress.lastActivity?.type as NavView) || 'vocabulary';
                  onNavigate(view);
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-[16px] bg-white dark:bg-card border border-[#EDE8DF] dark:border-border/60 hover:bg-indigo-50/50 dark:hover:bg-muted text-foreground text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <span>{isEn ? 'Continue' : 'ทำต่อทันที'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Primary Recommended Action (70% Focal Hero) */}
          <section className="space-y-3">
            <GlovaSectionHeader
              eyebrow="TODAY'S NEXT STEP"
              title={isEn ? "Today's Recommended Step" : "สิ่งที่คุณควรทำถัดไป"}
              description={
                isEn
                  ? 'Curated to target high-impact areas based on your real performance data.'
                  : 'ระบบคัดเลือกบทเรียนที่ช่วยพัฒนาทักษะได้ตรงจุดที่สุดตามข้อมูลการเรียนจริงของคุณ'
              }
            />

            <div className="p-6 sm:p-7 rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)] space-y-5">
              <div className="flex items-center gap-2.5 flex-wrap text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                  {primaryActionConfig.skill}
                </span>
                <span>•</span>
                <span className="font-mono font-semibold">{primaryActionConfig.difficulty}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {primaryActionConfig.estimatedMinutes} {isEn ? 'min' : 'นาที'}
                  </span>
                </span>
              </div>

              <div className="p-4 rounded-[18px] bg-indigo-500/8 border border-indigo-500/15 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                {primaryActionConfig.reason}
              </div>

              <GlovaLearningCard
                title={primaryActionConfig.title}
                description={primaryActionConfig.description}
                estimatedMinutes={primaryActionConfig.estimatedMinutes}
                cefrLevel={progress.currentLevel as CEFRTier}
                ctaText={primaryActionConfig.ctaText}
                onStart={primaryActionConfig.onStart}
                icon={primaryActionConfig.icon}
                variant="bubble"
                isPrimary
              />
            </div>
          </section>

          {/* Curated Learning Tracks Shelf */}
          <section className="space-y-4 pt-2">
            <GlovaSectionHeader
              eyebrow="CURATED LEARNING PATHS"
              title={isEn ? 'Core Learning Studios' : 'โหมดการเรียนรู้หลัก'}
              description={
                isEn
                  ? 'Access specialized studios tailored to your personal goals'
                  : 'เลือกเข้าสู่บทเรียนเฉพาะทางตามความต้องการ'
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              <GlovaCard
                interactive
                variant="bubble"
                onClick={() => onNavigate('vocabulary')}
                className="group"
              >
                <GlovaCardContent className="p-6 sm:p-7 flex flex-col justify-between h-full gap-5">
                  <div className="flex flex-col gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-2xs">
                      <BookOpen className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {isEn ? 'CEFR Vocabulary Studio' : 'คลังคำศัพท์ CEFR'}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {isEn
                          ? 'Master CEFR A1-C2 vocabulary with spaced repetition and practical collocations.'
                          : 'เรียนรู้คำศัพท์ตามระดับ A1–C2 พร้อมระบบทบทวน Spaced Repetition และ Collocations'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#EDE8DF] dark:border-border/30 flex items-center justify-between text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    <span>{isEn ? 'Open Studio' : 'เปิดคลังคำศัพท์'}</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </GlovaCardContent>
              </GlovaCard>

              <GlovaCard
                interactive
                variant="bubble"
                onClick={() => onNavigate('grammar')}
                className="group"
              >
                <GlovaCardContent className="p-6 sm:p-7 flex flex-col justify-between h-full gap-5">
                  <div className="flex flex-col gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {isEn ? 'English Grammar Studio' : 'ไวยากรณ์ภาษาอังกฤษ'}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {isEn
                          ? 'Master sentence structures and core tenses with practical usage examples.'
                          : 'ทำความเข้าใจโครงสร้างประโยคและ Tense สำคัญพร้อมคำอธิบายภาษาไทยและตัวอย่างใช้งาน'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#EDE8DF] dark:border-border/30 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <span>{isEn ? 'Practice Grammar' : 'ฝึกทำแบบฝึกหัด'}</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </GlovaCardContent>
              </GlovaCard>

              <GlovaCard
                interactive
                variant="bubble"
                onClick={() => onNavigate('mockExam')}
                className="group md:col-span-2 xl:col-span-1"
              >
                <GlovaCardContent className="p-6 sm:p-7 flex flex-col justify-between h-full gap-5">
                  <div className="flex flex-col gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs">
                      <Award className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                        {isEn ? 'Cambridge Mock Exams' : 'ข้อสอบจำลอง Cambridge'}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {isEn
                          ? `Take realistic timed simulations for ${progress.targetExam} with instant analytics.`
                          : `ทำแบบทดสอบเสมือนจริงของ ${progress.targetExam} พร้อมจับเวลาและสรุปผลคะแนน`}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#EDE8DF] dark:border-border/30 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    <span>{isEn ? 'Mock Exams' : 'เข้าสู่คลังข้อสอบ'}</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </GlovaCardContent>
              </GlovaCard>
            </div>
          </section>
        </div>

        {/* Right Column (30% - 4 cols): Playful Micro-Bubble Stack & Skill Radar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Micro-Bubble 1: Daily Momentum Goal */}
          <GlovaBubble
            variant="goal"
            size="md"
            pillText={isEn ? `${progress.minutesStudiedToday} min` : `${progress.minutesStudiedToday} นาที`}
            title={t('dashboard.study_time_today')}
            subtitle={
              isEn
                ? `Goal: ${progress.dailyGoalMinutes} min/day`
                : `เป้าหมาย: ${progress.dailyGoalMinutes} นาที/วัน`
            }
            progress={goalPercent}
          >
            <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
              {goalPercent >= 100
                ? isEn
                  ? 'Goal completed today!'
                  : 'บรรลุเป้าหมายแล้ว'
                : isEn
                ? `${Math.max(0, progress.dailyGoalMinutes - progress.minutesStudiedToday)} min left`
                : `ขาดอีก ${Math.max(0, progress.dailyGoalMinutes - progress.minutesStudiedToday)} นาที`}
            </div>
          </GlovaBubble>

          {/* Micro-Bubble 2: Streak & Rhythm */}
          <GlovaBubble
            variant="achievement"
            size="md"
            pillText={isEn ? `${progress.streakDays} days` : `${progress.streakDays} วัน`}
            title={t('header.streak')}
            subtitle={
              isEn ? 'Daily practice reinforces long-term retention' : 'เรียนต่อเนื่องเพื่อคงความจำระยะยาว'
            }
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>
                {progress.streakDays >= 3
                  ? isEn
                    ? 'On a streak!'
                    : 'กำลังติดลม'
                  : isEn
                  ? 'Building momentum'
                  : 'เริ่มต้นสะสมวัน'}
              </span>
            </div>
          </GlovaBubble>

          {/* Micro-Bubble 3: Cumulative Practice Counts */}
          <GlovaBubble
            variant="insight"
            size="md"
            pillText={isEn ? 'Verified Stats' : 'สถิติจริงจากระบบ'}
            title={isEn ? 'Cumulative Practice' : 'สถิติการฝึกฝนสะสม'}
            subtitle={
              isEn
                ? `${progress.masteredWordIds?.length || 0} mastered words`
                : `${progress.masteredWordIds?.length || 0} คำศัพท์ที่เชี่ยวชาญแล้ว`
            }
          >
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {isEn
                  ? `${progress.completedQuestionIds?.length || 0} items`
                  : `${progress.completedQuestionIds?.length || 0} ข้อ`}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {isEn ? 'Total Completed' : 'สะสมคำตอบสำเร็จ'}
              </span>
            </div>
          </GlovaBubble>

          {/* Skill Mastery Overview (Tactile Card) */}
          <section className="rounded-[26px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 p-5 shadow-xs flex flex-col justify-between">
            <div className="pb-3 border-b border-[#EDE8DF] dark:border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {t('dashboard.skill_stats')}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {isEn ? '6-Skill Competency' : 'ความเชี่ยวชาญ 6 ทักษะ'}
              </span>
            </div>

            <div className="space-y-3.5 my-4">
              {[
                { key: 'vocabulary' as const, label: t('skills.vocabulary') },
                { key: 'grammar' as const, label: t('skills.grammar') },
                { key: 'reading' as const, label: t('skills.reading') },
                { key: 'listening' as const, label: t('skills.listening') },
                { key: 'writing' as const, label: t('skills.writing') },
                { key: 'speaking' as const, label: t('skills.speaking') },
              ].map(({ key, label }) => {
                const val = progress.skillStats?.[key] || 0;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{label}</span>
                      <span className="text-muted-foreground font-mono font-bold">{val}%</span>
                    </div>
                    <GlovaProgressBar
                      value={val}
                      size="sm"
                      variant={val >= 70 ? 'success' : val >= 40 ? 'primary' : 'amber'}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/30 text-xs text-muted-foreground flex items-center justify-between">
              <span>{isEn ? 'Based on actual exercise attempts' : 'ผลการทำแบบฝึกหัดจริง'}</span>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>{isEn ? 'Detailed Analytics' : 'ดูวิเคราะห์เชิงลึก'}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 3. Weakness Remediation (Real Data Only - Bubble Canvas) */}
      <section className="rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 p-6 shadow-xs flex flex-col justify-between">
        <div className="pb-3 border-b border-[#EDE8DF] dark:border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h3 className="font-bold text-base text-foreground">
              {t('dashboard.weakness_remediation')}
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
            {progress.weakTopics?.length || 0} {isEn ? 'focus areas' : 'จุดที่ควรเสริม'}
          </span>
        </div>

        <div className="my-4 flex-1">
          {!progress.weakTopics || progress.weakTopics.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {isEn ? 'Outstanding! No repeating mistake patterns found.' : 'ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ'}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                {isEn
                  ? 'Keep practicing consistently so the system can map your focus areas.'
                  : 'ทำแบบฝึกหัดหรือข้อสอบจำลองอย่างสม่ำเสมอ เพื่อให้ระบบช่วยตรวจจับจุดที่ต้องฝึกฝนเพิ่มเติม'}
              </p>
              <GlovaButton
                variant="outline"
                size="sm"
                onClick={() => onNavigate('mockExam')}
                className="mt-3 rounded-[16px]"
              >
                {isEn ? 'Try a Mock Exam' : 'ทดลองทำข้อสอบจำลอง'}
              </GlovaButton>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.weakTopics.slice(0, 4).map((w) => (
                <div
                  key={w.tag}
                  className="p-4 rounded-[20px] bg-white dark:bg-card/80 border border-[#EDE8DF] dark:border-border/40 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {w.labelTh}
                    </p>
                    <p className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold mt-0.5">
                      {isEn
                        ? `Encountered ${w.errorCount} mistakes in practice`
                        : `พบข้อผิดพลาด ${w.errorCount} ครั้งในแบบทดสอบ`}
                    </p>
                  </div>

                  <GlovaButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<Play className="w-3 h-3 fill-current" aria-hidden="true" />}
                    onClick={() => onStartRemediation(w.tag)}
                    className="shrink-0 rounded-[14px]"
                  >
                    {isEn ? 'Reinforce' : 'ซ่อมจุดนี้'}
                  </GlovaButton>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {isEn ? 'Derived from verified practice attempts' : 'อิงตามสถิติข้อที่ตอบผิดจริง'}
          </span>
          {hasWeakness && (
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>{isEn ? 'View Full History' : 'ดูประวัติทั้งหมด'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
