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
  DecryptedText,
  AnimatedNumber,
  SpotlightCard,
  TacticalHudFrame,
  TerrariaHotbarBar,
  VibeCoderSourceDock,
  LearningPathNode,
  GlovaCartridge,
  GlovaNextMove,
  BorderBeam,
  BentoGrid,
  BentoCard,
  ShimmerButton,
} from '../ui/GlovaPrimitives';
import { RankEmblem } from '../ranked/RankEmblem';
import { CampaignBanner } from '../dashboard/CampaignBanner';
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
        unitBadge: "TODAY'S NEXT STEP",
        title: isEn ? `Fix: ${topWeakness.tag}` : `ทบทวนและซ่อมแซม: ${topWeakness.labelTh}`,
        description: isEn
          ? `Detected ${topWeakness.errorCount} mistakes in practice. A 4-minute focused drill will recover your confidence.`
          : `แนะนำเพราะ: ตรวจพบข้อผิดพลาด ${topWeakness.errorCount} ครั้ง ในแบบทดสอบ ฝึกฝนสั้นๆ 4 นาทีเพื่อเสริมความแม่นยำ`,
        cta: isEn ? 'START REPAIR (+20 XP)' : 'เริ่มฝึกจุดนี้ทันที',
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
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      isWeakness: false,
    };
  }, [topWeakness, progress.assessmentCompleted, progress.currentLevel, progress.targetExam, onStartRemediation, onNavigate, isEn]);

  // Glova Stepped Unit Path Nodes for Current Level
  const pathNodes = React.useMemo(() => {
    return [
      {
        id: 'node-1',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 1 • Foundational Fluency' : 'บทที่ 1 • พื้นฐานความคล่องแคล่ว',
        topicTitle: isEn ? 'High-Frequency Core Vocabulary' : 'คำศัพท์ความถี่สูง Oxford & Cambridge',
        status: 'completed' as const,
        xpReward: 15,
        offsetPercent: 0,
        onClick: () => onNavigate('vocabulary'),
      },
      {
        id: 'node-2',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 2 • Natural Collocations' : 'บทที่ 2 • วลีและการใช้คำคู่กัน',
        topicTitle: isEn ? 'Natural Campus Collocations' : 'วลีและ Collocations ในชีวิตมหาวิทยาลัย',
        status: 'completed' as const,
        xpReward: 15,
        offsetPercent: 15,
        onClick: () => onNavigate('vocabulary'),
      },
      {
        id: 'node-3',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 3 • Expressive Phrasing' : 'บทที่ 3 • การสื่อสารเชิงลึก',
        topicTitle: isEn ? 'Phrasal Verbs & Expressive Context' : 'กริยาวลีและสำนวนที่พบบ่อย',
        status: 'active' as const,
        xpReward: 20,
        offsetPercent: -15,
        ctaText: isEn ? 'START' : 'เริ่มเรียน',
        onClick: () => primaryAction.onStart(),
      },
      {
        id: 'node-4',
        level: progress.currentLevel,
        unitTitle: isEn ? 'Unit 4 • 4-Second Speed Drill' : 'บทที่ 4 • ประลองความเร็ว 4 วินาที',
        topicTitle: isEn ? 'Speed Battle: 4s Vocab Reflex' : 'ประลองความเร็ว: ศัพท์ 4 วินาที',
        status: 'review' as const,
        xpReward: 25,
        offsetPercent: 0,
        ctaText: isEn ? 'DRILL' : 'ประลอง',
        onClick: () => onNavigate('compete'),
      },
      {
        id: 'node-5',
        level: nextLvl,
        unitTitle: isEn ? `Unit 5 • Academic Synthesis (${nextLvl})` : `บทที่ 5 • การสังเคราะห์เชิงวิชาการ (${nextLvl})`,
        topicTitle: isEn ? 'Academic Reading & Synthesis' : 'การอ่านเชิงวิชาการและการสรุปความ',
        status: 'locked' as const,
        xpReward: 20,
        offsetPercent: 12,
        onClick: () => {},
      },
      {
        id: 'node-6',
        level: nextLvl,
        unitTitle: isEn ? `Unit 6 • Milestone Mock Exam` : `บทที่ 6 • ข้อสอบจำลองวัดระดับเคมบริดจ์`,
        topicTitle: isEn ? `Checkpoint: ${progress.targetExam} Mock` : `ข้อสอบจำลอง ${progress.targetExam} เต็มรูปแบบ`,
        status: 'locked' as const,
        xpReward: 50,
        offsetPercent: -10,
        onClick: () => {},
      },
    ];
  }, [progress.currentLevel, nextLvl, progress.targetExam, primaryAction, onNavigate, isEn]);

  const hotbarSlots = React.useMemo(
    () => [
      {
        slotNumber: 1,
        id: 'slot-vocab',
        label: isEn ? 'Lexical Tome (Vocab)' : 'คัมภีร์คำศัพท์ CEFR',
        rarity: 'hallowed' as const,
        stackCount: '3,860',
        icon: <BookOpen className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />,
        onSelect: () => onNavigate('vocabulary'),
      },
      {
        slotNumber: 2,
        id: 'slot-grammar',
        label: isEn ? 'Syntax Anvil (Grammar)' : 'ทั่งตีไวยากรณ์ 18 บท',
        rarity: 'gold' as const,
        stackCount: '18',
        icon: <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />,
        onSelect: () => onNavigate('grammar'),
      },
      {
        slotNumber: 3,
        id: 'slot-reading',
        label: isEn ? 'Lore Scroll (Reading)' : 'ม้วนคัมภีร์การอ่าน',
        rarity: 'celestial' as const,
        stackCount: '42',
        icon: <BookMarked className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />,
        onSelect: () => onNavigate('reading'),
      },
      {
        slotNumber: 4,
        id: 'slot-listening',
        label: isEn ? 'Echo Crystal (Audio)' : 'ผลึกเสียงสำเนียงจริง',
        rarity: 'silver' as const,
        stackCount: '36',
        icon: <Headphones className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />,
        onSelect: () => onNavigate('listening'),
      },
      {
        slotNumber: 5,
        id: 'slot-compete',
        label: isEn ? 'Valorant 4s Speed Duel' : 'ดวลคำศัพท์ 4 วินาที',
        rarity: 'crimson' as const,
        stackCount: '4s MMR',
        icon: <Swords className="w-4 h-4 text-[#FF4655]" />,
        onSelect: () => onNavigate('compete'),
      },
      {
        slotNumber: 6,
        id: 'slot-exam',
        label: isEn ? 'Boss Trial (Mock Exam)' : 'บอสด่านสอบ Cambridge',
        rarity: 'copper' as const,
        stackCount: progress.targetExam,
        icon: <Award className="w-4 h-4 text-[#D97706] dark:text-[#E5A93C]" />,
        onSelect: () => onNavigate('mockExam'),
      },
    ],
    [isEn, onNavigate, progress.targetExam]
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 pb-16">
      {/* 1. TOP VIEW MODE SWITCH (Path vs All Studios) */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-[#FF4655] text-white">
              TERRARIA × VALORANT × DUOLINGO
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-500/30">
              {progress.currentLevel === 'A1'
                ? 'BIOME: FOREST SANCTUARY // IRON'
                : progress.currentLevel === 'A2'
                ? 'BIOME: CAVERN DEPTHS // BRONZE'
                : progress.currentLevel === 'B1'
                ? 'BIOME: JUNGLE TEMPLE // SILVER'
                : progress.currentLevel === 'B2'
                ? 'BIOME: DUNGEON KEEP // GOLD'
                : progress.currentLevel === 'C1'
                ? 'BIOME: HALLOWED SPIRE // DIAMOND'
                : 'BIOME: CELESTIAL NEBULA // RADIANT'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-[#EDEBE8] flex items-center gap-2 flex-wrap">
            <DecryptedText
              text={isEn ? 'Your Learning Dashboard' : 'แดชบอร์ดการเรียนรู้ของคุณ'}
              animateOn="hover"
            />
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-[#5B5CE2]/20 dark:text-[#A5A6F6] font-mono font-bold border border-[#5B5CE2]/25">
              {progress.currentLevel} → {nextLvl}
            </span>
          </h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1 flex-wrap">
            <span>เป้าหมายการสอบ: <strong className="text-slate-900 dark:text-[#EDEBE8]">{progress.targetExam}</strong></span>
            <span>•</span>
            <span>Cambridge Equivalent: <strong className="text-slate-900 dark:text-[#EDEBE8]">{progress.estimatedCambridgeScore || 120}</strong></span>
            <span>•</span>
            <span>เส้นทางการพัฒนา CEFR Framework: <strong className="text-slate-900 dark:text-[#EDEBE8]">{progress.currentLevel}</strong></span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            {isEn
              ? `Advancing toward CEFR ${nextLvl} • Your English grows with you`
              : `คุณกำลังพัฒนาเพื่อก้าวสู่ระดับ ${nextLvl} • ภาษาอังกฤษเติบโตไปพร้อมคุณทุกวัน`}
          </p>
          <div role="status" className="sr-only">
            คุณกำลังพัฒนาเพื่อก้าวสู่ระดับ {nextLvl}
          </div>
        </div>

        <SlidingTabs
          tabs={[
            { id: 'path', label: isEn ? 'Biome Quest Path' : 'เส้นทางเควสต์ CEFR', icon: <Compass className="w-4 h-4" /> },
            { id: 'studios', label: isEn ? 'All Studios' : 'คลังสตูดิโอทั้งหมด', icon: <BookOpen className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />
      </div>

      {/* 1.5 TERRARIA 6-SLOT HOTBAR INVENTORY STRIP (Uiverse.io x Terraria) */}
      <TerrariaHotbarBar
        items={hotbarSlots}
        title={isEn ? 'Active Loadout & Studio Inventory' : 'ช่องเก็บไอเทมสตูดิโอ (กดเลือกเพื่อเข้าฝึกทันที)'}
        subtitle="Slots [1]-[6] • Rarity: Copper → Celestial"
      />

      {/* 2. BALANCED 2-COLUMN LAYOUT (Godly.design Melius 65% Primary Journey + 35% Tactical HUD Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: WHAT TO DO NOW HERO + STEPPED PATH (8 cols)                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* A. "WHAT SHOULD I DO RIGHT NOW?" PRIMARY ACTION HERO (21st.dev x Aceternity x Valorant/Duolingo) */}
          <SpotlightCard
            showBorderBeam={true}
            borderBeamProps={{
              size: 260,
              duration: 9,
              colorFrom: '#FF4655', // Valorant Crimson laser
              colorTo: '#5B5CE2',   // Glova Indigo trail
              borderWidth: 2,
            }}
            className="p-6 sm:p-8 border-2 border-indigo-200/90 dark:border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-indigo-50/80 via-white to-rose-50/50 dark:from-[#141A22] dark:via-[#141A22] dark:to-[#1C2430] text-slate-900 dark:text-[#EDEBE8] shadow-xs rounded-[28px] overflow-hidden relative"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 flex flex-col gap-4">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] dark:bg-[#5B5CE2] text-white text-xs font-black tracking-wide uppercase shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>{primaryAction.unitBadge}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-[#FF4655]/20 dark:text-[#FF4655] border border-rose-300 dark:border-[#FF4655]/30 text-[10px] font-mono font-black uppercase">
                      AGENT CONTRACT // {progress.currentLevel}
                    </span>
                    <span className="text-xs font-bold text-[#4F46E5] dark:text-[#A5A6F6]">
                      {primaryAction.skill}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#94A3B8] font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#F43F5E]" />
                    <span>{primaryAction.timeMin} {isEn ? 'minutes' : 'นาที'}</span>
                    <span>•</span>
                    <span className="text-[#059669] dark:text-[#34D399] font-black">+15 XP</span>
                  </div>
                </div>

                {/* Main Prompt */}
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-[#EDEBE8] tracking-tight leading-snug">
                    {primaryAction.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-xl">
                    {primaryAction.description}
                  </p>
                </div>

                {/* Large Tactile Call To Action (Duolingo 3D + Valorant Crimson Duel) */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <TactileButton
                    variant="primary"
                    size="lg"
                    onClick={primaryAction.onStart}
                    className="px-8 cursor-pointer"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    {primaryAction.cta}
                  </TactileButton>

                  <TactileButton
                    variant="valorant"
                    size="lg"
                    onClick={() => onNavigate('compete')}
                    className="sm:w-auto cursor-pointer"
                    leftIcon={<Swords className="w-4 h-4 text-white" />}
                  >
                    {isEn ? 'Valorant Vocab Duel 4s' : 'ดวลคำศัพท์ด่วน 4 วินาที (MMR)'}
                  </TactileButton>
                </div>
              </div>

              {/* Visual Learning Companion Emblem */}
              <div className="hidden sm:flex flex-col items-center justify-center p-4 rounded-3xl bg-white/95 dark:bg-[#1C2430]/80 border-2 border-indigo-200/80 dark:border-[rgba(255,255,255,0.08)] shrink-0 shadow-xs">
                <img
                  src="/assets/decorative/mascot-glova-spark.png"
                  alt="Glova Mascot Spark"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain transition-transform hover:scale-105"
                />
                <span className="text-[11px] font-black text-[#4F46E5] dark:text-[#A5A6F6] mt-2 uppercase tracking-wide">
                  {isEn ? 'Biome Companion' : 'คู่หูภารกิจวันนี้'}
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* 5-SITES VIBE-CODER ENGINE DOCK */}
          <VibeCoderSourceDock isEn={isEn} />

          {/* RESUME LAST ACTIVITY */}
          {progress.lastActivity && (
            <div className="p-5 rounded-[24px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-4 text-slate-900 dark:text-[#EDEBE8] shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-[#4F46E5] dark:text-[#A5A6F6] uppercase tracking-wider">
                  {isEn ? 'Resume Last Activity' : 'ดำเนินการต่อจากจุดเดิม'}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-[#EDEBE8] mt-0.5">{progress.lastActivity.title}</h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8]">{progress.lastActivity.detail}</p>
              </div>
              <TactileButton variant="primary" size="sm" onClick={() => onNavigate(progress.lastActivity?.type as any || 'vocabulary')}>
                {isEn ? 'Resume' : 'ทำต่อทันที'}
              </TactileButton>
            </div>
          )}

          {/* PROMOTIONAL CAMPAIGN & COMMUNITY EVENT CAROUSEL */}
          <CampaignBanner onNavigate={(route) => onNavigate(route as NavView)} />

          {/* B. MAIN INTERACTIVE EXPERIENCE: GLOVA CEFR PROGRESSION MATRIX */}
          {activeTab === 'path' ? (
            <div className="rounded-[28px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6 text-slate-900 dark:text-[#EDEBE8]">
              {/* Unit Progression Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#4F46E5] dark:text-[#A5A6F6] uppercase tracking-wider font-tech">
                      {isEn ? `Progression: ${progress.currentLevel} → ${nextLvl}` : `การพัฒนา: ${progress.currentLevel} → ${nextLvl}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F46E5]/10 dark:bg-[#5B5CE2]/20 text-[#4F46E5] dark:text-[#A5A6F6] border border-[#5B5CE2]/20">
                      {isEn ? 'Active Studio Term' : 'ภาคการเรียนรู้ปัจจุบัน'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#EDEBE8] mt-0.5">
                    {isEn ? 'Core Academic & Conversational Modules' : 'โมดูลภาษาอังกฤษเชิงวิชาการและการสื่อสาร'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8]">3 / 6 {isEn ? 'Modules' : 'โมดูล'}</span>
                    <div className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">50% Complete</div>
                  </div>
                  <div className="w-24 h-2.5 rounded-full bg-slate-200 dark:bg-[#0F141C] overflow-hidden">
                    <div className="h-full rounded-full bg-[#4F46E5] dark:bg-[#5B5CE2]" style={{ width: '50%' }} />
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

              {/* Secondary Curated Learning Paths */}
              <div className="pt-6 border-t border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#EDEBE8]">
                    {isEn ? 'Secondary Curated Pathways' : 'เส้นทางการเรียนรู้เฉพาะทาง'}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8]">3 Core Studios</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-[#1C2430] border border-indigo-200/80 dark:border-[rgba(255,255,255,0.08)] flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-[#EDEBE8]">{isEn ? 'CEFR Vocabulary Lab' : 'คลังคำศัพท์ CEFR'}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5">{isEn ? '3,860 verified terms' : '3,860 คำศัพท์มาตรฐาน'}</p>
                    </div>
                    <TactileButton variant="primary" size="sm" onClick={() => onNavigate('vocabulary')}>
                      {isEn ? 'Open Vocabulary' : 'เปิดคลังคำศัพท์'}
                    </TactileButton>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-[#1C2430] border border-amber-200/80 dark:border-[rgba(255,255,255,0.08)] flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-[#EDEBE8]">{isEn ? 'English Grammar Studio' : 'ไวยากรณ์ภาษาอังกฤษ'}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5">{isEn ? 'Timeline visualization' : 'โครงสร้างประโยคไวยากรณ์'}</p>
                    </div>
                    <TactileButton variant="primary" size="sm" onClick={() => onNavigate('grammar')}>
                      {isEn ? 'Practice Exercises' : 'ฝึกทำแบบฝึกหัด'}
                    </TactileButton>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#1C2430] border border-emerald-200/80 dark:border-[rgba(255,255,255,0.08)] flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-[#EDEBE8]">{isEn ? 'Cambridge Mock Exams' : 'ข้อสอบจำลอง Cambridge'}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5">{isEn ? `${progress.targetExam} simulation` : `ข้อสอบจำลอง ${progress.targetExam}`}</p>
                    </div>
                    <TactileButton variant="primary" size="sm" onClick={() => onNavigate('mockExam')}>
                      {isEn ? 'Enter Exam Vault' : 'เข้าสู่คลังข้อสอบ'}
                    </TactileButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ALL STUDIOS 21ST.DEV BENTO GRID */
            <BentoGrid className="auto-rows-[16rem]">
              {[
                {
                  id: 'vocabulary',
                  title: isEn ? 'CEFR Vocabulary Studio' : 'คลังคำศัพท์ CEFR',
                  ctaText: isEn ? 'Open Vocabulary' : 'เปิดคลังคำศัพท์',
                  desc: isEn ? 'Master high-frequency words with spaced repetition & collocation pairs.' : 'เรียนรู้คำศัพท์ตามระดับ A1-C2 พร้อมระบบทบทวน Spaced Repetition',
                  icon: <BookOpen className="w-6 h-6 text-[#4F46E5] dark:text-[#5B5CE2]" />,
                  badge: '3,860 Words',
                  accent: 'indigo' as const,
                  colSpan: 'md:col-span-2',
                },
                {
                  id: 'grammar',
                  title: isEn ? 'English Grammar Studio' : 'ไวยากรณ์ภาษาอังกฤษ',
                  ctaText: isEn ? 'Practice Exercises' : 'ฝึกทำแบบฝึกหัด',
                  desc: isEn ? 'Practical sentence structures and tenses explained with clear rules.' : 'โครงสร้างประโยคและ Tenses สำคัญพร้อมตัวอย่างประโยคใช้งานจริง',
                  icon: <Sparkles className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />,
                  badge: '18 Topics',
                  accent: 'amber' as const,
                  colSpan: 'md:col-span-1',
                },
                {
                  id: 'compete',
                  title: isEn ? 'Ranked Vocab Battle' : 'ประลองคำศัพท์จัดอันดับ 4 วินาที',
                  ctaText: isEn ? 'Battle Now' : 'ประลองตอนนี้',
                  desc: isEn ? 'Fast-paced 4-second reflex challenges against university peers.' : 'ท้าทายความเร็วข้อละ 4 วินาที ไต่อันดับ MMR ในแรงก์ลีก',
                  icon: <Swords className="w-6 h-6 text-[#FF4655]" />,
                  badge: 'Ranked MMR',
                  accent: 'crimson' as const,
                  colSpan: 'md:col-span-1',
                },
                {
                  id: 'mockExam',
                  title: isEn ? 'Cambridge Mock Exams' : 'ข้อสอบจำลอง Cambridge',
                  ctaText: isEn ? 'Enter Exam Vault' : 'เข้าสู่คลังข้อสอบ',
                  desc: isEn ? `Realistic exam simulations for ${progress.targetExam} with timer.` : `ข้อสอบเสมือนจริงของ ${progress.targetExam} พร้อมจับเวลาและวิเคราะห์คะแนน`,
                  icon: <Award className="w-6 h-6 text-[#059669] dark:text-[#10B981]" />,
                  badge: 'KET / PET / FCE',
                  accent: 'emerald' as const,
                  colSpan: 'md:col-span-2',
                },
              ].map((studio) => (
                <BentoCard
                  key={studio.id}
                  name={studio.title}
                  className={studio.colSpan}
                  icon={studio.icon}
                  description={studio.desc}
                  cta={studio.ctaText}
                  badge={studio.badge}
                  accentVariant={studio.accent}
                  onCtaClick={() => onNavigate(studio.id as any)}
                />
              ))}
            </BentoGrid>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: GLOVA LEARNING COMPANION RAIL (4 cols - Sticky)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* 1. DAILY STREAK & SUMMARY CARD */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-[#141A22] dark:via-[#141A22] dark:to-[#141A22] border border-amber-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-4 text-slate-900 dark:text-[#EDEBE8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-[#E98278]/15 border border-amber-200 dark:border-[#E98278]/30 flex items-center justify-center shrink-0">
                  <Flame className="w-7 h-7 text-[#F59E0B] dark:text-[#E98278] fill-[#F59E0B] dark:fill-[#E98278]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-slate-900 dark:text-[#EDEBE8] font-mono">
                      <AnimatedNumber value={progress.streakDays} />
                    </span>
                    <span className="text-xs font-bold text-[#D97706] dark:text-[#E98278]">
                      {`${progress.streakDays} วัน`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                    {progress.streakDays >= 3
                      ? isEn ? 'Unstoppable momentum!' : 'โมเมนตัมกำลังดี พัฒนาต่อเนื่อง!'
                      : isEn ? 'Practice daily to build fluency' : 'ฝึกฝนต่อเนื่องทุกวันเพื่อสร้างความคล่องแคล่ว'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <img
                  src={`/assets/badges/badge-cefr-${progress.currentLevel.toLowerCase()}.png`}
                  alt={`CEFR ${progress.currentLevel}`}
                  className="w-12 h-12 object-contain drop-shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-mono font-bold text-[#4F46E5] dark:text-[#A5A6F6]">
                  {progress.currentLevel}
                </span>
              </div>
            </div>

            {/* Quick Progress Counters */}
            <div className="pt-3 border-t border-slate-100 dark:border-[rgba(255,255,255,0.08)] grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1C2430] border border-slate-200/70 dark:border-white/5">
                <div className="text-[10px] text-slate-500 dark:text-[#94A3B8]">{isEn ? 'Daily Goal' : 'เป้าหมายประจำวัน'}</div>
                <div className="font-bold text-slate-900 dark:text-[#EDEBE8] font-mono">{`${minutesStudied} นาที`} / {`${goalMinutes} นาที`}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1C2430] border border-slate-200/70 dark:border-white/5">
                <div className="text-[10px] text-slate-500 dark:text-[#94A3B8]">{isEn ? 'Questions' : 'ทำข้อสอบแล้ว'}</div>
                <div className="font-bold text-slate-900 dark:text-[#EDEBE8] font-mono">{`${progress.completedQuestionIds?.length || 0} ข้อ`}</div>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-[#1C2430] border border-indigo-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-[#94A3B8]">{isEn ? 'Mastered Words' : 'คำศัพท์ที่เชี่ยวชาญ'}</span>
                <span className="font-bold text-[#4F46E5] dark:text-[#A5A6F6] font-mono">{`${progress.masteredWordIds?.length || 0} คำศัพท์ที่เชี่ยวชาญแล้ว`}</span>
              </div>
            </div>
          </div>

          {/* 1.1 6 CORE COMPETENCIES PROGRESS BARS */}
          <div className="p-5 rounded-[24px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3 text-slate-900 dark:text-[#EDEBE8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
              {isEn ? '6 CORE COMPETENCIES' : 'ความเชี่ยวชาญ 6 ด้าน'}
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                { skill: 'vocabulary', label: isEn ? 'Vocabulary' : 'คลังคำศัพท์', val: progress.skillStats.vocabulary, color: 'bg-[#4F46E5] dark:bg-[#5B5CE2]' },
                { skill: 'grammar', label: isEn ? 'Grammar' : 'ไวยากรณ์', val: progress.skillStats.grammar, color: 'bg-[#F59E0B]' },
                { skill: 'reading', label: isEn ? 'Reading' : 'การอ่าน', val: progress.skillStats.reading, color: 'bg-[#10B981]' },
                { skill: 'listening', label: isEn ? 'Listening' : 'การฟัง', val: progress.skillStats.listening, color: 'bg-[#0EA5E9]' },
                { skill: 'writing', label: isEn ? 'Writing' : 'การเขียน', val: progress.skillStats.writing, color: 'bg-[#8B5CF6]' },
                { skill: 'speaking', label: isEn ? 'Speaking' : 'การพูด', val: progress.skillStats.speaking, color: 'bg-[#F43F5E]' },
              ].map((s) => (
                <div key={s.skill} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-800 dark:text-[#EDEBE8]">{s.label}</span>
                    <span className="text-[#4F46E5] dark:text-[#A5A6F6] font-mono">{s.val}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={s.val}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#0F141C] overflow-hidden"
                  >
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. TODAY'S DAILY GOAL */}
          <div className="p-5 rounded-[24px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3 text-slate-900 dark:text-[#EDEBE8]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                {isEn ? 'DAILY STUDY TARGET' : 'เป้าหมายประจำวัน'}
              </span>
              <span className="text-[#4F46E5] dark:text-[#A5A6F6] font-mono">
                {minutesStudied} / {goalMinutes} min ({goalPercent}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#0F141C] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#F43F5E] transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
              {goalPercent >= 100
                ? isEn ? 'Daily target fully reached! Keep up the great pace.' : 'บรรลุเป้าหมายประจำวันเรียบร้อยแล้ว! รักษาระดับการเรียนรู้ต่อไป'
                : isEn ? `Study ${Math.max(0, goalMinutes - minutesStudied)} more minutes to complete.` : `ขาดอีก ${Math.max(0, goalMinutes - minutesStudied)} นาทีเพื่อบรรลุเป้าหมาย`}
            </p>
          </div>

          {/* 3. RANKED LEAGUE STANDING (Valorant Tactical HUD x Heraldic Crest) */}
          <TacticalHudFrame
            calloutCode="VALORANT // RANKED ARENA"
            biomeLabel="Top 10 Division"
            accentVariant="crimson"
            className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 dark:from-[#141A22] dark:via-[#141A22] dark:to-[#1C2430] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8] uppercase tracking-wider">
                  {isEn ? 'RANKED ARENA' : 'สมรภูมิประลอง'}
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-[#FF4655]/20 text-rose-800 dark:text-[#FF4655] font-bold font-mono border border-rose-300 dark:border-[#FF4655]/30">
                Top 10
              </span>
            </div>

            <div className="flex items-center gap-4">
              <RankEmblem tier="Gold" size="md" showGlow animate />
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-[#EDEBE8]">
                  Gold III • Bangkok League
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                  Rating: <span className="font-mono font-bold text-[#E11D48] dark:text-[#FF4655]">1,420 MMR</span>
                </p>
              </div>
            </div>

            <TactileButton
              variant="valorant"
              size="sm"
              fullWidth
              onClick={() => onNavigate('compete')}
              leftIcon={<Swords className="w-4 h-4 text-white" />}
            >
              {isEn ? 'ENTER VOCAB BATTLE' : 'เข้าสู่สนามประลอง'}
            </TactileButton>
          </TacticalHudFrame>

          {/* 4. DAILY QUESTS */}
          <div className="p-5 rounded-[24px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3.5 text-slate-900 dark:text-[#EDEBE8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#A5A6F6]" />
                <span>{isEn ? 'DAILY QUESTS' : 'ภารกิจประจำวัน'}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-semibold">1 / 3 Done</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Quest 1 */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#1C2430] border border-emerald-200/80 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-[#EDEBE8] truncate">
                    {isEn ? 'Complete 1 Practice Lesson' : 'ทำบทเรียนสำเร็จ 1 บท'}
                  </p>
                  <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-[#0F141C] overflow-hidden">
                    <div className="h-full rounded-full bg-[#10B981]" style={{ width: '100%' }} />
                  </div>
                </div>
                <span className="text-[#059669] dark:text-[#34D399] font-bold shrink-0 font-mono">
                  +10 XP
                </span>
              </div>

              {/* Quest 2 */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-[#1C2430] border border-indigo-200/80 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-[#EDEBE8] truncate">
                    {isEn ? 'Score 80%+ in Vocab Battle' : 'ชนะประลองคำศัพท์ด้วยคะแนน 80% ขึ้นไป'}
                  </p>
                  <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-[#0F141C] overflow-hidden">
                    <div className="h-full rounded-full bg-[#4F46E5] dark:bg-[#5B5CE2]" style={{ width: '0%' }} />
                  </div>
                </div>
                <span className="text-[#4F46E5] dark:text-[#A5A6F6] font-bold shrink-0 font-mono">
                  +20 XP
                </span>
              </div>

              {/* Quest 3 */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#1C2430] border border-amber-200/80 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-[#EDEBE8] truncate">
                    {isEn ? 'Review 5 Spaced Words' : 'ทบทวนคำศัพท์ Spaced Repetition 5 คำ'}
                  </p>
                  <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-[#0F141C] overflow-hidden">
                    <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: '60%' }} />
                  </div>
                </div>
                <span className="text-[#D97706] dark:text-[#FBBF24] font-bold shrink-0 font-mono">
                  +15 XP
                </span>
              </div>
            </div>
          </div>

          {/* 5. WEAKNESS REMEDIATION (Empty vs Populated States) */}
          {hasWeakness ? (
            <div className="p-5 rounded-[24px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3 text-slate-900 dark:text-[#EDEBE8]">
              <span className="text-[10px] font-bold text-[#E11D48] dark:text-[#E98278] uppercase tracking-wider">
                {isEn ? 'WEAKNESS REMEDIATION' : 'จุดที่ควรเสริม'}
              </span>
              <div className="space-y-2">
                {progress.weakTopics.map((w) => (
                  <div key={w.tag} className="p-3 rounded-xl bg-rose-50/70 dark:bg-[#1C2430] border border-rose-200/80 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8] truncate">{w.labelTh}</p>
                      <p className="text-[10px] text-[#E11D48] dark:text-[#E98278]">พบข้อผิดพลาด {w.errorCount} ครั้ง</p>
                    </div>
                    <TactileButton
                      variant="warning"
                      size="sm"
                      onClick={() => onStartRemediation(w.tag)}
                      className="shrink-0"
                    >
                      {isEn ? 'Repair' : 'ซ่อมจุดนี้'}
                    </TactileButton>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-[24px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs text-center space-y-2 text-slate-900 dark:text-[#EDEBE8]">
              <p className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8]">ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ</p>
              <TactileButton
                variant="surface"
                size="sm"
                onClick={() => onNavigate('mockExam')}
                className="mx-auto"
              >
                {isEn ? 'Try a Mock Exam' : 'ทดลองทำข้อสอบจำลอง'}
              </TactileButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
