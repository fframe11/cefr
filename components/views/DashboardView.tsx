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
        estimatedMinutes: 8,
        ctaText: 'เริ่มฝึกจุดนี้ทันที',
        onStart: () => onStartRemediation(topWeakness.tag),
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />,
      };
    }

    if (!progress.assessmentCompleted) {
      return {
        title: 'ทำแบบทดสอบวัดระดับ CEFR Diagnostic Test',
        description: 'ประเมินระดับความสามารถทางภาษาอังกฤษรอบด้าน (A1-C2) เพื่อปลดล็อกแผนการเรียนเฉพาะบุคคล',
        estimatedMinutes: 15,
        ctaText: 'เริ่มวัดระดับภาษา',
        onStart: () => onNavigate('assessment'),
        icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
      };
    }

    return {
      title: `ฝึกฝนประจำวัน: คำศัพท์และไวยากรณ์ระดับ ${progress.currentLevel}`,
      description: `ทบทวนคำศัพท์สำคัญตาม Spaced Repetition และทำแบบฝึกหัดสำหรับเป้าหมายสอบ ${progress.targetExam}`,
      estimatedMinutes: 10,
      ctaText: 'เริ่มฝึกฝนทันที',
      onStart: () => onNavigate('vocabulary'),
      icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    };
  }, [topWeakness, progress.assessmentCompleted, progress.currentLevel, progress.targetExam, onStartRemediation, onNavigate]);

  return (
    <div className="w-full space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Header / Learner Hero Context */}
      <section className="rounded-2xl bg-card border border-border/40 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold select-none">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Personalized Learning Journey</span>
              </span>
              <GlovaLevelBadge
                level={progress.currentLevel as CEFRTier}
                showLabel
                size="md"
              />
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              เป้าหมายการสอบ: {progress.targetExam}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              ระดับภาษาปัจจุบันคือ{' '}
              <strong className="text-foreground font-semibold">
                {language === 'th' ? currentLevelInfo.nameTh : currentLevelInfo.nameEn}
              </strong>{' '}
              เทียบเคียงคะแนนเคมบริดจ์ประมาณ{' '}
              <strong className="text-indigo-400 font-mono font-bold">
                {progress.estimatedCambridgeScore}
              </strong>{' '}
              คะแนน
            </p>
          </div>

          {/* Quick Cambridge Equivalent Summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/40 shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl font-mono shrink-0 shadow-xs">
              {progress.currentLevel}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Cambridge Equivalent</span>
              <span className="text-sm font-semibold text-foreground">{currentLevelInfo.cambridgeEquivalent}</span>
              <button
                type="button"
                onClick={() => onNavigate('assessment')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors mt-0.5"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>วัดระดับภาษาใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* CEFR Framework Progression Stepper */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-3">
            <span>เส้นทางการพัฒนา CEFR Framework</span>
            <span className="text-foreground font-semibold">ระดับปัจจุบัน: {progress.currentLevel}</span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {allLevels.map((lvl, idx) => {
              const isPassed = idx < currentLevelIdx;
              const isCurrent = idx === currentLevelIdx;
              return (
                <div key={lvl} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-2 sm:h-2.5 w-full rounded-full transition-all ${
                      isPassed
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-secondary'
                    }`}
                  />
                  <span
                    className={`text-[11px] sm:text-xs font-mono font-medium ${
                      isCurrent
                        ? 'text-indigo-400 font-bold'
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
      </section>

      {/* 2. One Primary Learning Action (70/30 Focal Hero) */}
      <section className="space-y-3">
        <GlovaSectionHeader
          eyebrow="PRIMARY RECOMMENDED FOCUS"
          title="สิ่งที่คุณควรทำถัดไป"
          description="ระบบคัดเลือกบทเรียนที่ช่วยพัฒนาทักษะได้ตรงจุดที่สุดตามข้อมูลการเรียนจริงของคุณ"
        />

        <GlovaLearningCard
          title={primaryActionConfig.title}
          description={primaryActionConfig.description}
          estimatedMinutes={primaryActionConfig.estimatedMinutes}
          cefrLevel={progress.currentLevel as CEFRTier}
          ctaText={primaryActionConfig.ctaText}
          onStart={primaryActionConfig.onStart}
          icon={primaryActionConfig.icon}
          isPrimary
        />
      </section>

      {/* 3. Compact Progress Summary Row */}
      <section className="space-y-3">
        <GlovaSectionHeader
          title={t('dashboard.progress_summary')}
          description="ภาพรวมความสม่ำเสมอและเป้าหมายประจำวัน"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GlovaProgressCard
            title={t('dashboard.study_time_today')}
            value={`${progress.minutesStudiedToday} นาที`}
            subtitle={`เป้าหมาย: ${progress.dailyGoalMinutes} นาที/วัน`}
            progressPercent={goalPercent}
            trendText={goalPercent >= 100 ? 'บรรลุเป้าหมายแล้ว' : `ขาดอีก ${Math.max(0, progress.dailyGoalMinutes - progress.minutesStudiedToday)} นาที`}
            trendType={goalPercent >= 100 ? 'positive' : 'neutral'}
            icon={<Clock className="w-5 h-5" aria-hidden="true" />}
          />

          <GlovaProgressCard
            title={t('header.streak')}
            value={`${progress.streakDays} วัน`}
            subtitle="เรียนต่อเนื่องเพื่อคงความจำระยะยาว"
            trendText={progress.streakDays >= 3 ? 'กำลังติดลม' : 'เริ่มต้นสะสมวัน'}
            trendType="positive"
            icon={<Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" aria-hidden="true" />}
          />

          <GlovaProgressCard
            title="สถิติการฝึกฝนสะสม"
            value={`${progress.completedQuestionIds?.length || 0} ข้อ`}
            subtitle={`${progress.masteredWordIds?.length || 0} คำศัพท์ที่เชี่ยวชาญแล้ว`}
            trendText="สถิติจริงจากระบบ"
            trendType="neutral"
            icon={<Award className="w-5 h-5" aria-hidden="true" />}
          />
        </div>
      </section>

      {/* 4. Two-Column Layout: Skill Mastery & Weakness Remediation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Skill Mastery Overview */}
        <section className="rounded-xl bg-card border border-border/40 p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <h3 className="font-semibold text-base text-foreground">
                {t('dashboard.skill_stats')}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">ความเชี่ยวชาญ 6 ทักษะ</span>
          </div>

          <div className="space-y-4 my-4">
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
                  <div className="flex items-center justify-between text-xs font-medium">
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

          <div className="pt-3 border-t border-border/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>คำนวณจากผลการทำแบบฝึกหัดและข้อสอบ</span>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>ดูการวิเคราะห์เชิงลึก</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Right Column: Weakness Remediation (Real Data Only) */}
        <section className="rounded-xl bg-card border border-border/40 p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <h3 className="font-semibold text-base text-foreground">
                {t('dashboard.weakness_remediation')}
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              {progress.weakTopics?.length || 0} จุดที่ควรเสริม
            </span>
          </div>

          <div className="my-4 flex-1">
            {!progress.weakTopics || progress.weakTopics.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ</p>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  ทำแบบฝึกหัดหรือข้อสอบจำลองอย่างสม่ำเสมอ เพื่อให้ระบบช่วยตรวจจับจุดที่ต้องฝึกฝนเพิ่มเติม
                </p>
                <GlovaButton
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('mockExam')}
                  className="mt-3"
                >
                  ทดลองทำข้อสอบจำลอง
                </GlovaButton>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.weakTopics.slice(0, 4).map((w) => (
                  <div
                    key={w.tag}
                    className="p-3.5 rounded-lg bg-secondary/40 border border-border/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {w.labelTh}
                      </p>
                      <p className="text-[11px] text-rose-400 mt-0.5">
                        พบข้อผิดพลาด {w.errorCount} ครั้งในแบบทดสอบ
                      </p>
                    </div>

                    <GlovaButton
                      variant="secondary"
                      size="sm"
                      leftIcon={<Play className="w-3 h-3 fill-current" aria-hidden="true" />}
                      onClick={() => onStartRemediation(w.tag)}
                      className="shrink-0"
                    >
                      ซ่อมจุดนี้
                    </GlovaButton>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>อิงตามสถิติข้อที่ตอบผิดจริง</span>
            {hasWeakness && (
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>ดูประวัติทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      </div>

      {/* 5. Secondary Learning Tracks Shelf */}
      <section className="space-y-4">
        <GlovaSectionHeader
          eyebrow="CURATED LEARNING PATHS"
          title="โหมดการเรียนรู้หลัก"
          description="เลือกเข้าสู่บทเรียนเฉพาะทางตามความต้องการ"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GlovaCard
            interactive
            elevation="subtle"
            onClick={() => onNavigate('vocabulary')}
            className="group"
          >
            <GlovaCardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-indigo-400 transition-colors">
                    คลังคำศัพท์ CEFR
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    เรียนรู้คำศัพท์ตามระดับ A1–C2 พร้อมระบบทบทวน Spaced Repetition และ Collocations
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span>เปิดคลังคำศัพท์</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </GlovaCardContent>
          </GlovaCard>

          <GlovaCard
            interactive
            elevation="subtle"
            onClick={() => onNavigate('grammar')}
            className="group"
          >
            <GlovaCardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-emerald-400 transition-colors">
                    ไวยากรณ์ภาษาอังกฤษ
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    ทำความเข้าใจโครงสร้างประโยคและ Tense สำคัญพร้อมคำอธิบายภาษาไทยและตัวอย่างใช้งาน
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>ฝึกทำแบบฝึกหัด</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </GlovaCardContent>
          </GlovaCard>

          <GlovaCard
            interactive
            elevation="subtle"
            onClick={() => onNavigate('mockExam')}
            className="group sm:col-span-2 lg:col-span-1"
          >
            <GlovaCardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Award className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-amber-400 transition-colors">
                    ข้อสอบจำลอง Cambridge
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    ทำแบบทดสอบเสมือนจริงของ {progress.targetExam} พร้อมจับเวลาและสรุปผลคะแนน
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>เข้าสู่คลังข้อสอบ</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </GlovaCardContent>
          </GlovaCard>
        </div>
      </section>
    </div>
  );
};
