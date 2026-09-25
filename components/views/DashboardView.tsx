'use client';
import React from 'react';
import {
  Award,
  Flame,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Play,
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
  const currentLevelInfo = CEFR_LEVELS.find((l) => l.level === progress.currentLevel) || CEFR_LEVELS[0];
  const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentLevelIdx = allLevels.indexOf(progress.currentLevel);

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Welcome & Primary Orientation */}
      <section className="rounded-2xl bg-card border border-border/60 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Learning Journey</span>
            </div>
            <h1 className="text-fluid-title font-bold tracking-tight text-foreground">
              เป้าหมายการสอบ: {progress.targetExam} ({progress.currentLevel})
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              ระดับภาษาปัจจุบันของคุณคือ <strong className="text-foreground">{language === 'th' ? currentLevelInfo.nameTh : currentLevelInfo.nameEn}</strong> เทียบเคียงคะแนนเคมบริดจ์ประมาณ{' '}
              <strong className="text-primary font-mono">{progress.estimatedCambridgeScore}</strong> คะแนน
            </p>
          </div>

          {/* Quick Level Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/60 shrink-0">
            <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-2xl font-mono shrink-0">
              {progress.currentLevel}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Cambridge Target</p>
              <p className="text-sm font-semibold text-foreground">{currentLevelInfo.cambridgeEquivalent}</p>
              <button
                onClick={() => onNavigate('assessment')}
                className="text-xs text-primary hover:underline font-medium mt-1 inline-flex items-center gap-1 touch-target"
              >
                <span>วัดระดับภาษาใหม่</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* CEFR Level Progression Bar */}
        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-3">
            <span>เส้นทางการพัฒนา CEFR Framework</span>
            <span className="text-foreground font-semibold">ระดับ {progress.currentLevel}</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
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
                        ? 'bg-primary animate-pulse'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-[11px] sm:text-xs font-mono font-medium ${
                      isCurrent
                        ? 'text-primary font-bold'
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

      {/* Today's Recommended Focus */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {t('dashboard.todays_actions')}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            แนะนำตามผลการประเมินและการฝึกฝน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Vocab */}
          <div
            onClick={() => onNavigate('vocabulary')}
            className="group p-5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                ฝึกคำศัพท์ใหม่ 5 คำ
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                ทบทวนคำศัพท์ระดับ {progress.currentLevel} พร้อมระบบ Spaced Repetition และเสียงออกเสียง
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
              <span>เริ่มท่องศัพท์</span>
              <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
            </div>
          </div>

          {/* Action 2: Grammar Drill */}
          <div
            onClick={() => onNavigate('grammar')}
            className="group p-5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                ทบทวนไวยากรณ์หลัก
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                ทำความเข้าใจ Tense สำคัญและประโยคเงื่อนไขพร้อมคำอธิบายภาษาไทยเข้าใจง่าย
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
              <span>ฝึกทำแบบฝึกหัด</span>
              <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
            </div>
          </div>

          {/* Action 3: Mock Exam */}
          <div
            onClick={() => onNavigate('mockExam')}
            className="group p-5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-3">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                ทดลองทำข้อสอบจำลอง
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                ทำแบบทดสอบเสมือนจริงของ {progress.targetExam} พร้อมระบบจับเวลาและคำนวณคะแนนสเกล
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
              <span>เข้าห้องสอบจำลอง</span>
              <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Section: Skill Mastery & Weak Area Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Skill Radar & Mastery Bars */}
        <section className="rounded-xl bg-card border border-border/60 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {t('dashboard.skill_stats')}
              </h3>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t('analytics.skill_proficiency')}</span>
          </div>

          <div className="space-y-3.5">
            {[
              { key: 'vocabulary', label: t('skills.vocabulary'), value: progress.skillStats.vocabulary },
              { key: 'grammar', label: t('skills.grammar'), value: progress.skillStats.grammar },
              { key: 'reading', label: t('skills.reading'), value: progress.skillStats.reading },
              { key: 'listening', label: t('skills.listening'), value: progress.skillStats.listening },
              { key: 'writing', label: t('skills.writing'), value: progress.skillStats.writing },
              { key: 'speaking', label: t('skills.speaking'), value: progress.skillStats.speaking },
            ].map((skill) => (
              <div key={skill.key} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{skill.label}</span>
                  <span className="text-muted-foreground font-mono">{skill.value}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      skill.value >= 70
                        ? 'bg-emerald-500'
                        : skill.value >= 50
                        ? 'bg-primary'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Weakness Detection & Remediation Engine */}
        <section className="rounded-xl bg-card border border-border/60 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {t('dashboard.weakness_remediation')}
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
              {progress.weakTopics.length} จุดที่ควรเสริม
            </span>
          </div>

          {progress.weakTopics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ</p>
              <p className="text-xs text-muted-foreground mt-1">
                ทำแบบฝึกหัดหรือข้อสอบจำลองเพื่อวิเคราะห์ความแม่นยำเพิ่มเติม
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.weakTopics.map((w) => (
                <div
                  key={w.tag}
                  className="p-3.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {w.labelTh}
                    </p>
                    <p className="text-[11px] text-rose-400 mt-0.5">
                      พบข้อผิดพลาด {w.errorCount} ครั้งในแบบทดสอบ
                    </p>
                  </div>

                  <button
                    onClick={() => onStartRemediation(w.tag)}
                    className="touch-target px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>ซ่อมจุดนี้</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
