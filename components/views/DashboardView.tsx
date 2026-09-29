'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
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
  Shield,
  Compass,
} from 'lucide-react';
import { UserProgressState, CEFRLevel } from '../../types';
import { CEFR_LEVELS } from '../../data/cefrLevels';
import { NavView } from '../common/Sidebar';
import { useTranslation } from '../../i18n';
import {
  TactileButton,
  SlidingTabs,
  ShinyText,
  AnimatedNumber,
  SpotlightCard,
  LearningPathNode,
  GlovaCartridge,
  GlovaNextMove,
} from '../ui/GlovaPrimitives';
import { RankEmblem } from '../ranked/RankEmblem';
import { CEFRTier } from '@/lib/design-tokens/tokens';
import { RankTier } from '../../types/gamification';

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

  const [activeTab, setActiveTab] = useState<'path' | 'studios'>('path');

  const currentLevelInfo =
    CEFR_LEVELS.find((l) => l.level === progress.currentLevel) || CEFR_LEVELS[0];
  const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentLevelIdx = allLevels.indexOf(progress.currentLevel);
  const nextLvl = allLevels[Math.min(allLevels.length - 1, currentLevelIdx + 1)];

  // Daily goal progress
  const goalMinutes = progress.dailyGoalMinutes || 20;
  const minutesStudied = progress.minutesStudiedToday || 0;
  const goalPercent = Math.min(100, Math.round((minutesStudied / goalMinutes) * 100));

  // Determine top weakness if any
  const hasWeakness = progress.weakTopics && progress.weakTopics.length > 0;
  const topWeakness = hasWeakness ? progress.weakTopics[0] : null;

  // Primary Action logic
  const primaryAction = React.useMemo(() => {
    if (topWeakness) {
      return {
        unitBadge: isEn ? 'TARGETED REPAIR' : 'ซ่อมแซมจุดอ่อนเร่งด่วน',
        title: isEn ? `Fix: ${topWeakness.tag}` : `แก้ไขจุดอ่อน: ${topWeakness.labelTh}`,
        description: isEn
          ? `Detected ${topWeakness.errorCount} mistakes in practice. A 4-minute focused drill will recover your confidence.`
          : `พบข้อผิดพลาด ${topWeakness.errorCount} ครั้งในแบบทดสอบ ฝึกฝนสั้นๆ 4 นาทีเพื่อเสริมความแม่นยำ`,
        cta: isEn ? 'START REPAIR (+20 XP)' : 'เริ่มซ่อมจุดนี้ (+20 XP)',
        skill: 'Grammar & Phrasing',
        timeMin: 4,
        onStart: () => onStartRemediation(topWeakness.tag),
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
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
        icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
        isWeakness: false,
      };
    }

    return {
      unitBadge: isEn ? `UNIT 3 • ${progress.currentLevel}` : `บทเรียนที่ 3 • ระดับ ${progress.currentLevel}`,
      title: isEn
        ? `Daily Vocabulary & Context Practice`
        : `แบบฝึกหัดคำศัพท์และบริบทประจำวัน`,
      description: isEn
        ? `Master high-yield Cambridge vocabulary using Spaced Repetition for your target: ${progress.targetExam}.`
        : `ฝึกคำศัพท์เคมบริดจ์ความถี่สูงด้วย Spaced Repetition เพื่อเป้าหมาย: ${progress.targetExam}`,
      cta: isEn ? 'CONTINUE LESSON (+15 XP)' : 'เริ่มเรียนต่อทันที (+15 XP)',
      skill: 'Vocabulary & Context',
      timeMin: 5,
      onStart: () => onNavigate('vocabulary'),
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      isWeakness: false,
    };
  }, [topWeakness, progress.assessmentCompleted, progress.currentLevel, progress.targetExam, onStartRemediation, onNavigate, isEn]);

  // Duolingo-inspired path nodes for current level
  const pathNodes = React.useMemo(() => {
    return [
      {
        id: 'node-1',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 1: Essential Foundations' : 'บทที่ 1: คำศัพท์พื้นฐานจำเป็น',
        topicTitle: isEn ? 'High-Frequency Core Words' : 'คำศัพท์ความถี่สูงระดับพื้นฐาน',
        status: 'completed' as const,
        xpReward: 15,
        offsetPercent: 0,
        onClick: () => onNavigate('vocabulary'),
      },
      {
        id: 'node-2',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 1: Essential Foundations' : 'บทที่ 1: คำศัพท์พื้นฐานจำเป็น',
        topicTitle: isEn ? 'Natural Campus Collocations' : 'วลีและ Collocations ในชีวิตมหาวิทยาลัย',
        status: 'completed' as const,
        xpReward: 15,
        offsetPercent: 15,
        onClick: () => onNavigate('vocabulary'),
      },
      {
        id: 'node-3',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 2: Expressive Conversation' : 'บทที่ 2: การสนทนาอย่างคล่องแคล่ว',
        topicTitle: isEn ? 'Phrasal Verbs & Idioms' : 'กริยาวลีและสำนวนที่พบบ่อย',
        status: 'active' as const,
        xpReward: 20,
        offsetPercent: -15,
        ctaText: isEn ? 'START' : 'เริ่มเรียน',
        onClick: () => primaryAction.onStart(),
      },
      {
        id: 'node-4',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 2: Expressive Conversation' : 'บทที่ 2: การสนทนาอย่างคล่องแคล่ว',
        topicTitle: isEn ? 'Speed Battle: 4s Vocab Reflex' : 'ประลองความเร็ว: ศัพท์ 4 วินาที',
        status: 'review' as const,
        xpReward: 25,
        offsetPercent: 0,
        ctaText: isEn ? 'BATTLE' : 'ประลอง',
        onClick: () => onNavigate('compete'),
      },
      {
        id: 'node-5',
        level: nextLvl,
        unitTitle: isEn ? `Unit 3: Gateway to ${nextLvl}` : `บทที่ 3: ก้าวสู่ระดับ ${nextLvl}`,
        topicTitle: isEn ? 'Academic Reading & Phrasing' : 'การอ่านเชิงวิชาการและการสรุปความ',
        status: 'locked' as const,
        xpReward: 20,
        offsetPercent: 12,
        onClick: () => {},
      },
      {
        id: 'node-6',
        level: nextLvl,
        unitTitle: isEn ? `Checkpoint: ${progress.targetExam}` : `แบบทดสอบวัดผล: ${progress.targetExam}`,
        topicTitle: isEn ? 'Cambridge Mock Milestone' : 'ข้อสอบจำลองเคมบริดจ์ประจำหน่วย',
        status: 'locked' as const,
        xpReward: 50,
        offsetPercent: -10,
        onClick: () => {},
      },
    ];
  }, [progress.currentLevel, nextLvl, progress.targetExam, primaryAction, onNavigate, isEn]);

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-8 pb-16">
      {/* 1. TOP VIEW MODE SWITCH (Path vs All Studios) */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#EDE8DF] dark:border-border/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>{isEn ? 'Your Learning Journey' : 'เส้นทางการเรียนรู้ของคุณ'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5B5CE2]/10 text-[#5B5CE2] dark:text-indigo-400 font-mono font-bold">
              {progress.currentLevel} → {nextLvl}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {isEn
              ? `Targeting ${progress.targetExam} • Spaced repetition verified`
              : `เป้าหมายการสอบ ${progress.targetExam} • ระบบทบทวนความจำ Spaced Repetition`}
          </p>
        </div>

        <SlidingTabs
          tabs={[
            { id: 'path', label: isEn ? 'Learning Path' : 'เส้นทางบทเรียน', icon: <Compass className="w-4 h-4" /> },
            { id: 'studios', label: isEn ? 'All Studios' : 'คลังสตูดิโอทั้งหมด', icon: <BookOpen className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />
      </div>

      {/* 2. BALANCED 2-COLUMN LAYOUT (65% Primary Journey + 35% Contextual Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: WHAT TO DO NOW HERO + STEPPED PATH (8 cols)                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* A. "WHAT SHOULD I DO RIGHT NOW?" PRIMARY ACTION HERO */}
          <SpotlightCard className="p-6 sm:p-8 border-2 border-[#5B5CE2]/25 bg-gradient-to-br from-[#FFFDF8] via-[#FFFDF8] to-[#E9E5FF]/20 dark:from-card dark:via-card dark:to-[#5B5CE2]/10 shadow-[0_8px_30px_-4px_rgba(91,92,226,0.12)]">
            <div className="flex flex-col gap-5">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B5CE2] text-white text-xs font-black tracking-wide uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#F6D978]" />
                  <span>{primaryAction.unitBadge}</span>
                </span>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{primaryAction.timeMin} {isEn ? 'minutes' : 'นาที'}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+15 XP</span>
                </div>
              </div>

              {/* Main Prompt */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-snug">
                  {primaryAction.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {primaryAction.description}
                </p>
              </div>

              {/* Large Tactile Call To Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <TactileButton
                  variant="primary"
                  size="lg"
                  onClick={primaryAction.onStart}
                  className="px-8 shadow-[0_5px_0_#4041B5]"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {primaryAction.cta}
                </TactileButton>

                <TactileButton
                  variant="surface"
                  size="lg"
                  onClick={() => onNavigate('compete')}
                  className="sm:w-auto"
                  leftIcon={<Swords className="w-4 h-4 text-[#5B5CE2]" />}
                >
                  {isEn ? 'Vocab Battle 4s' : 'ประลองศัพท์ด่วน 4 วินาที'}
                </TactileButton>
              </div>
            </div>
          </SpotlightCard>

          {/* B. MAIN INTERACTIVE EXPERIENCE: GLOVA CEFR PROGRESSION MATRIX */}
          {activeTab === 'path' ? (
            <div className="rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
              {/* Unit Progression Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#EDE8DF] dark:border-border/30 gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5B5CE2] dark:text-indigo-400 uppercase tracking-wider font-tech">
                      {isEn ? `Tier Progression: ${progress.currentLevel} → ${nextLvl}` : `ระดับการพัฒนา: ${progress.currentLevel} → ${nextLvl}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9E5FF] text-[#5B5CE2]">
                      {isEn ? 'Term 1 Active' : 'ภาคการเรียนที่ 1'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground mt-0.5">
                    {isEn ? 'Core Academic & Conversational Modules' : 'โมดูลภาษาอังกฤษเชิงวิชาการและการสื่อสาร'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">3 / 6 {isEn ? 'Modules' : 'โมดูล'}</span>
                    <div className="text-[10px] text-muted-foreground font-mono">50% Complete</div>
                  </div>
                  <div className="w-24 h-2.5 rounded-full bg-[#EDE8DF] dark:bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[#10B981] w-[50%]" />
                  </div>
                </div>
              </div>

              {/* Glova Signature Cartridge Grid (Original Product Identity) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlovaCartridge
                  id="mod-1"
                  level={progress.currentLevel}
                  skill="vocabulary"
                  title={isEn ? 'High-Frequency Vocabulary' : 'คำศัพท์ความถี่สูงระดับพื้นฐาน'}
                  subtitle={isEn ? 'Essential Oxford & Cambridge academic words' : 'คลังคำศัพท์จำเป็นสำหรับการเรียนและการสอบ'}
                  status="completed"
                  progress={100}
                  lessonsCount={5}
                  completedCount={5}
                  xpReward={15}
                  estimatedMinutes={4}
                  onLaunch={() => onNavigate('vocabulary')}
                />

                <GlovaCartridge
                  id="mod-2"
                  level={progress.currentLevel}
                  skill="grammar"
                  title={isEn ? 'Past vs. Present Perfect Tenses' : 'อดีตจบแล้ว vs ยังส่งผลถึงปัจจุบัน'}
                  subtitle={isEn ? 'Sentence structures with timeline analysis' : 'โครงสร้างประโยคพร้อมโมชันไทม์ไลน์'}
                  status="in-progress"
                  progress={60}
                  lessonsCount={5}
                  completedCount={3}
                  xpReward={20}
                  estimatedMinutes={5}
                  onLaunch={() => primaryAction.onStart()}
                />

                <GlovaCartridge
                  id="mod-3"
                  level={progress.currentLevel}
                  skill="reading"
                  title={isEn ? 'Contextual Campus Reading' : 'อ่านจับใจความและบทความมหาวิทยาลัย'}
                  subtitle={isEn ? 'Skimming, scanning, and main idea extraction' : 'ฝึกการจับใจความและคำถามเชิงลึก'}
                  status="ready"
                  progress={0}
                  lessonsCount={4}
                  completedCount={0}
                  xpReward={15}
                  estimatedMinutes={6}
                  onLaunch={() => onNavigate('reading')}
                />

                <GlovaCartridge
                  id="mod-4"
                  level={progress.currentLevel}
                  skill="listening"
                  title={isEn ? 'Conversational Audio & Nuance' : 'ฟังบทสนทนาและจับสำเนียง'}
                  subtitle={isEn ? 'Real-world dialogues with native speaker audio' : 'ฟังและจับใจความบทสนทนาสถานการณ์จริง'}
                  status="ready"
                  progress={0}
                  lessonsCount={4}
                  completedCount={0}
                  xpReward={15}
                  estimatedMinutes={5}
                  onLaunch={() => onNavigate('listening')}
                />

                <GlovaCartridge
                  id="mod-5"
                  level={nextLvl}
                  skill="ranked"
                  title={isEn ? '4s Speed Vocab Duel' : 'ประลองความเร็วคำศัพท์ 4 วินาที'}
                  subtitle={isEn ? 'Test reflex and gain MMR in ranked arena' : 'ท้าทายความเร็วและไต่อันดับลีก'}
                  status="ready"
                  progress={30}
                  lessonsCount={10}
                  completedCount={3}
                  xpReward={25}
                  estimatedMinutes={3}
                  onLaunch={() => onNavigate('compete')}
                />

                <GlovaCartridge
                  id="mod-6"
                  level={nextLvl}
                  skill="writing"
                  title={isEn ? `Checkpoint: ${progress.targetExam} Mock` : `ด่านวัดผล: ${progress.targetExam} Mock Exam`}
                  subtitle={isEn ? 'Full Cambridge simulation to unlock next CEFR tier' : 'ข้อสอบจำลองเคมบริดจ์เพื่อปลดล็อกขั้นถัดไป'}
                  status="locked"
                  progress={0}
                  lessonsCount={1}
                  completedCount={0}
                  xpReward={50}
                  estimatedMinutes={20}
                  onLaunch={() => onNavigate('mockExam')}
                />
              </div>
            </div>
          ) : (
            /* ALL STUDIOS GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  id: 'vocabulary',
                  title: isEn ? 'CEFR Vocabulary Studio' : 'คลังคำศัพท์ CEFR (3,860 คำ)',
                  desc: isEn ? 'Master high-frequency words with spaced repetition & collocation pairs.' : 'เรียนรู้คำศัพท์ตามระดับ A1-C2 พร้อมระบบทบทวน Spaced Repetition',
                  icon: <BookOpen className="w-6 h-6 text-[#5B5CE2]" />,
                  color: 'from-indigo-500/10 to-indigo-500/5',
                  badge: '3,860 Words',
                },
                {
                  id: 'grammar',
                  title: isEn ? 'English Grammar Studio' : 'ไวยากรณ์ภาษาอังกฤษ',
                  desc: isEn ? 'Practical sentence structures and tenses explained with clear rules.' : 'โครงสร้างประโยคและ Tenses สำคัญพร้อมตัวอย่างประโยคใช้งานจริง',
                  icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
                  color: 'from-emerald-500/10 to-emerald-500/5',
                  badge: '18 Topics',
                },
                {
                  id: 'compete',
                  title: isEn ? 'Ranked Vocab Battle' : 'ประลองคำศัพท์จัดอันดับ 4 วินาที',
                  desc: isEn ? 'Fast-paced 4-second reflex challenges against university peers.' : 'ท้าทายความเร็วข้อละ 4 วินาที ไต่อันดับ MMR ในแรงก์ลีก',
                  icon: <Swords className="w-6 h-6 text-[#FF8F82]" />,
                  color: 'from-rose-500/10 to-rose-500/5',
                  badge: 'Ranked MMR',
                },
                {
                  id: 'mockExam',
                  title: isEn ? 'Cambridge Mock Exams' : 'คลังข้อสอบจำลอง Cambridge',
                  desc: isEn ? `Realistic exam simulations for ${progress.targetExam} with timer.` : `ข้อสอบเสมือนจริงของ ${progress.targetExam} พร้อมจับเวลาและวิเคราะห์คะแนน`,
                  icon: <Award className="w-6 h-6 text-amber-600" />,
                  color: 'from-amber-500/10 to-amber-500/5',
                  badge: 'KET / PET / FCE',
                },
              ].map((studio) => (
                <div
                  key={studio.id}
                  onClick={() => onNavigate(studio.id as any)}
                  className="p-6 rounded-[24px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 hover:border-[#5B5CE2]/40 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE8DF]/60 dark:bg-muted/80 flex items-center justify-center">
                        {studio.icon}
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE8DF]/60 text-muted-foreground font-mono">
                        {studio.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground group-hover:text-[#5B5CE2] transition-colors">
                        {studio.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {studio.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#5B5CE2] pt-3 border-t border-[#EDE8DF]/60 dark:border-border/30">
                    <span>{isEn ? 'Open Studio' : 'เปิดสตูดิโอ'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: DUOLINGO-INSPIRED CONTEXTUAL RAIL (4 cols - Sticky)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* 1. DAILY STREAK & MOMENTUM CARD */}
          <div className="p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Flame className="w-7 h-7 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-foreground font-mono">
                    <AnimatedNumber value={progress.streakDays} />
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {isEn ? 'DAY STREAK' : 'วันต่อเนื่อง'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {progress.streakDays >= 3
                    ? isEn ? 'Unstoppable momentum!' : 'กำลังมาแรงมาก!'
                    : isEn ? 'Practice daily to build habits' : 'ฝึกต่อเนื่องทุกวันเพื่อผลลัพธ์ที่ดีที่สุด'}
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#EDE8DF]/60 dark:bg-muted flex items-center justify-center font-mono font-bold text-xs text-foreground">
              {progress.currentLevel}
            </div>
          </div>

          {/* 2. TODAY'S DAILY GOAL */}
          <div className="p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground uppercase tracking-wider">
                {isEn ? 'DAILY STUDY GOAL' : 'เป้าหมายประจำวัน'}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {minutesStudied} / {goalMinutes} min ({goalPercent}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#EDE8DF]/70 dark:bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#5B5CE2] transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {goalPercent >= 100
                ? isEn ? 'Goal smashed today! Keep it rolling.' : 'บรรลุเป้าหมายของวันนี้แล้ว! ยอดเยี่ยมมาก'
                : isEn ? `Study ${Math.max(0, goalMinutes - minutesStudied)} more minutes to complete.` : `ขาดอีก ${Math.max(0, goalMinutes - minutesStudied)} นาทีเพื่อบรรลุเป้าหมาย`}
            </p>
          </div>

          {/* 3. RANKED LEAGUE STANDING (Heraldic Crest) */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-[#FFFDF8] to-[#5B5CE2]/8 dark:from-card dark:to-[#5B5CE2]/15 border border-[#EDE8DF] dark:border-border/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE8DF] dark:border-border/30">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isEn ? 'RANKED LEAGUE' : 'ตารางคะแนนลีก'}
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                Top 10
              </span>
            </div>

            <div className="flex items-center gap-4">
              <RankEmblem tier="Gold" size="md" showGlow animate />
              <div>
                <h4 className="font-black text-base text-foreground">
                  Gold III • Bangkok League
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Rating: <span className="font-mono font-bold text-[#5B5CE2]">1,420 MMR</span>
                </p>
              </div>
            </div>

            <TactileButton
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => onNavigate('compete')}
              leftIcon={<Swords className="w-4 h-4" />}
            >
              {isEn ? 'ENTER VOCAB BATTLE' : 'เข้าสู่สนามประลอง'}
            </TactileButton>
          </div>

          {/* 4. DAILY QUESTS */}
          <div className="p-5 rounded-[24px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#5B5CE2]" />
                <span>{isEn ? 'DAILY QUESTS' : 'ภารกิจประจำวัน'}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold">1 / 3 Done</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Quest 1 */}
              <div className="p-3 rounded-xl bg-white dark:bg-card/70 border border-[#EDE8DF] dark:border-border/40 flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {isEn ? 'Complete 1 Practice Lesson' : 'ทำบทเรียนสำเร็จ 1 บท'}
                  </p>
                  <div className="w-24 h-1.5 rounded-full bg-[#EDE8DF] dark:bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 font-mono">
                  +10 XP
                </span>
              </div>

              {/* Quest 2 */}
              <div className="p-3 rounded-xl bg-white dark:bg-card/70 border border-[#EDE8DF] dark:border-border/40 flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {isEn ? 'Score 80%+ in Vocab Battle' : 'ชนะประลองคำศัพท์ด้วยคะแนน 80% ขึ้นไป'}
                  </p>
                  <div className="w-24 h-1.5 rounded-full bg-[#EDE8DF] dark:bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[#5B5CE2] w-0" />
                  </div>
                </div>
                <span className="text-[#5B5CE2] font-bold shrink-0 font-mono">
                  +20 XP
                </span>
              </div>

              {/* Quest 3 */}
              <div className="p-3 rounded-xl bg-white dark:bg-card/70 border border-[#EDE8DF] dark:border-border/40 flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {isEn ? 'Review 5 Spaced Words' : 'ทบทวนคำศัพท์ Spaced Repetition 5 คำ'}
                  </p>
                  <div className="w-24 h-1.5 rounded-full bg-[#EDE8DF] dark:bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[#5B5CE2] w-3/5" />
                  </div>
                </div>
                <span className="text-[#5B5CE2] font-bold shrink-0 font-mono">
                  +15 XP
                </span>
              </div>
            </div>
          </div>

          {/* 5. WEAK AREAS FAST REPAIR (Conditional) */}
          {hasWeakness && topWeakness && (
            <div className="p-4 rounded-[20px] bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                  {isEn ? 'NEEDS REINFORCEMENT' : 'จุดที่ควรเสริม'}
                </span>
                <p className="text-xs font-bold text-foreground truncate">
                  {topWeakness.labelTh} ({topWeakness.errorCount} mistakes)
                </p>
              </div>
              <TactileButton
                variant="warning"
                size="sm"
                onClick={() => onStartRemediation(topWeakness.tag)}
                className="shrink-0"
              >
                {isEn ? 'Repair' : 'ซ่อมจุดนี้'}
              </TactileButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
