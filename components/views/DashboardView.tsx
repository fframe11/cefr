'use client';

import React from 'react';
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
        title: `ทบทวนและซ่อมแซม: ${topWeakness.labelTh}`,
        description: `ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้งในแบบทดสอบ แนะนำให้ฝึกฝนทันทีเพื่อเสริมความมั่นใจ`,
        reason: `แนะนำเพราะ: ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้งในแบบทดสอบ จุดนี้จะช่วยให้คุณก้าวสู่ระดับถัดไปได้เร็วที่สุด`,
        skill: 'Grammar & Phrasing',
        difficulty: `${progress.currentLevel} → ${nextLvl}`,
        estimatedMinutes: 8,
        ctaText: 'เริ่มฝึกจุดนี้ทันที',
        onStart: () => onStartRemediation(topWeakness.tag),
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />,
      };
    }

    if (!progress.assessmentCompleted) {
      return {
        title: 'ทำแบบทดสอบวัดระดับ CEFR Diagnostic Test',
        description: 'ประเมินระดับความสามารถทางภาษาอังกฤษรอบด้าน (A1-C2) เพื่อปลดล็อกแผนการเรียนเฉพาะบุคคล',
        reason: 'แนะนำเพราะ: ช่วยประเมินจุดแข็งและจุดที่ควรฝึกเพิ่ม เพื่อวางแผนการเรียน 5 นาทีต่อวันอย่างตรงจุด',
        skill: 'Diagnostic Check',
        difficulty: `${progress.currentLevel}`,
        estimatedMinutes: 15,
        ctaText: 'เริ่มวัดระดับภาษา',
        onStart: () => onNavigate('assessment'),
        icon: <Sparkles className="w-5 h-5 text-indigo-500" aria-hidden="true" />,
      };
    }

    return {
      title: `ฝึกฝนประจำวัน: คำศัพท์และไวยากรณ์ระดับ ${progress.currentLevel}`,
      description: `ทบทวนคำศัพท์สำคัญตาม Spaced Repetition และทำแบบฝึกหัดสำหรับเป้าหมายสอบ ${progress.targetExam}`,
      reason: `แนะนำเพราะ: คลังคำศัพท์สำคัญตามรอบความจำ Spaced Repetition ประจำวันช่วยเสริมความมั่นใจสู่ระดับ ${nextLvl}`,
      skill: 'Vocabulary & Context',
      difficulty: `${progress.currentLevel} → ${nextLvl}`,
      estimatedMinutes: 10,
      ctaText: 'เริ่มฝึกฝนทันที',
      onStart: () => onNavigate('vocabulary'),
      icon: <BookOpen className="w-5 h-5 text-indigo-500" aria-hidden="true" />,
    };
  }, [topWeakness, progress.assessmentCompleted, progress.currentLevel, progress.targetExam, onStartRemediation, onNavigate, nextLvl]);

  return (
    <div className="w-full space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Header / Playful Editorial Bubble Hero */}
      <section className="rounded-[32px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)] relative overflow-hidden">
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
              <span>{progress.streakDays} วันต่อเนื่อง</span>
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
                เป้าหมายการสอบ: {progress.targetExam}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                ระดับภาษาปัจจุบันคือ{' '}
                <strong className="text-foreground font-semibold">
                  {language === 'th' ? currentLevelInfo.nameTh : currentLevelInfo.nameEn}
                </strong>{' '}
                เทียบเคียงคะแนนเคมบริดจ์ประมาณ{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {progress.estimatedCambridgeScore}
                </strong>{' '}
                คะแนน
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
                  <span>วัดระดับภาษาใหม่</span>
                </button>
              </div>
            </div>
          </div>

          {/* Linear CEFR Journey Rail (Tactile Bubble Tracker) */}
          <div className="mt-4 pt-6 border-t border-[#EDE8DF] dark:border-border/30">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">เส้นทางการพัฒนา CEFR Framework</span>
              <span className="text-foreground font-semibold">{`ระดับปัจจุบัน: ${progress.currentLevel} • คุณกำลังพัฒนาเพื่อก้าวสู่ระดับ ${nextLvl}`}</span>
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

      {/* 2. Asymmetric 70/30 Focal Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70% - 8 cols): What Next & Curated Action Paths */}
        <div className="lg:col-span-8 space-y-6">
          {/* Resume Where You Left Off (Attention-Friendly) */}
          {progress.lastActivity && (
            <div className="p-4 sm:p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>ดำเนินการต่อจากจุดเดิม</span>
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
                <span>ทำต่อทันที</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Primary Recommended Action (70% Focal Hero) */}
          <section className="space-y-3">
            <GlovaSectionHeader
              eyebrow="TODAY'S NEXT STEP"
              title="สิ่งที่คุณควรทำถัดไป"
              description="ระบบคัดเลือกบทเรียนที่ช่วยพัฒนาทักษะได้ตรงจุดที่สุดตามข้อมูลการเรียนจริงของคุณ"
            />

            <div className="p-5 sm:p-6 rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)] space-y-4">
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                  {primaryActionConfig.skill}
                </span>
                <span>•</span>
                <span className="font-mono font-semibold">{primaryActionConfig.difficulty}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{primaryActionConfig.estimatedMinutes} นาที</span>
                </span>
              </div>

              <div className="p-3.5 rounded-[18px] bg-indigo-500/8 border border-indigo-500/15 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
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
              title="โหมดการเรียนรู้หลัก"
              description="เลือกเข้าสู่บทเรียนเฉพาะทางตามความต้องการ"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <GlovaCard
                interactive
                variant="bubble"
                onClick={() => onNavigate('vocabulary')}
                className="group"
              >
                <GlovaCardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-[16px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                      <BookOpen className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        คลังคำศัพท์ CEFR
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        เรียนรู้คำศัพท์ตามระดับ A1–C2 พร้อมระบบทบทวน Spaced Repetition และ Collocations
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/30 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>เปิดคลังคำศัพท์</span>
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
                <GlovaCardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-[16px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Sparkles className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        ไวยากรณ์ภาษาอังกฤษ
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        ทำความเข้าใจโครงสร้างประโยคและ Tense สำคัญพร้อมคำอธิบายภาษาไทยและตัวอย่างใช้งาน
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/30 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>ฝึกทำแบบฝึกหัด</span>
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
                className="group sm:col-span-2 lg:col-span-1"
              >
                <GlovaCardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-[16px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <Award className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        ข้อสอบจำลอง Cambridge
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        ทำแบบทดสอบเสมือนจริงของ {progress.targetExam} พร้อมจับเวลาและสรุปผลคะแนน
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/30 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span>เข้าสู่คลังข้อสอบ</span>
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
            pillText={`${progress.minutesStudiedToday} นาที`}
            title={t('dashboard.study_time_today')}
            subtitle={`เป้าหมาย: ${progress.dailyGoalMinutes} นาที/วัน`}
            progress={goalPercent}
          >
            <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
              {goalPercent >= 100
                ? 'บรรลุเป้าหมายแล้ว'
                : `ขาดอีก ${Math.max(0, progress.dailyGoalMinutes - progress.minutesStudiedToday)} นาที`}
            </div>
          </GlovaBubble>

          {/* Micro-Bubble 2: Streak & Rhythm */}
          <GlovaBubble
            variant="achievement"
            size="md"
            pillText={`${progress.streakDays} วัน`}
            title={t('header.streak')}
            subtitle="เรียนต่อเนื่องเพื่อคงความจำระยะยาว"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>{progress.streakDays >= 3 ? 'กำลังติดลม' : 'เริ่มต้นสะสมวัน'}</span>
            </div>
          </GlovaBubble>

          {/* Micro-Bubble 3: Cumulative Practice Counts */}
          <GlovaBubble
            variant="insight"
            size="md"
            pillText="สถิติจริงจากระบบ"
            title="สถิติการฝึกฝนสะสม"
            subtitle={`${progress.masteredWordIds?.length || 0} คำศัพท์ที่เชี่ยวชาญแล้ว`}
          >
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {`${progress.completedQuestionIds?.length || 0} ข้อ`}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                สะสมคำตอบสำเร็จ
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
              <span className="text-xs text-muted-foreground font-semibold">ความเชี่ยวชาญ 6 ทักษะ</span>
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
              <span>ผลการทำแบบฝึกหัดจริง</span>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>ดูวิเคราะห์เชิงลึก</span>
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
            {progress.weakTopics?.length || 0} จุดที่ควรเสริม
          </span>
        </div>

        <div className="my-4 flex-1">
          {!progress.weakTopics || progress.weakTopics.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ
              </p>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                ทำแบบฝึกหัดหรือข้อสอบจำลองอย่างสม่ำเสมอ เพื่อให้ระบบช่วยตรวจจับจุดที่ต้องฝึกฝนเพิ่มเติม
              </p>
              <GlovaButton
                variant="outline"
                size="sm"
                onClick={() => onNavigate('mockExam')}
                className="mt-3 rounded-[16px]"
              >
                ทดลองทำข้อสอบจำลอง
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
                      พบข้อผิดพลาด {w.errorCount} ครั้งในแบบทดสอบ
                    </p>
                  </div>

                  <GlovaButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<Play className="w-3 h-3 fill-current" aria-hidden="true" />}
                    onClick={() => onStartRemediation(w.tag)}
                    className="shrink-0 rounded-[14px]"
                  >
                    ซ่อมจุดนี้
                  </GlovaButton>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>อิงตามสถิติข้อที่ตอบผิดจริง</span>
          {hasWeakness && (
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>ดูประวัติทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
