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
  Mic,
  ExternalLink,
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

  // Helper to format topic tags and titles into clean, capitalized English without raw AI-like underscores
  const formatTopicTitle = React.useCallback(
    (topic: { tag: string; labelTh?: string }) => {
      if (!isEn && topic.labelTh) {
        return topic.labelTh.replace(/_/g, ' ');
      }
      const raw = isEn
        ? (topic.tag || topic.labelTh || '')
        : (topic.labelTh || topic.tag || '');
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
  }, [topWeakness, progress.assessmentCompleted, progress.currentLevel, progress.targetExam, onStartRemediation, onNavigate, isEn, formatTopicTitle]);

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
        label: isEn ? 'Vocab Tome' : 'คลังคำศัพท์',
        rarity: 'hallowed' as const,
        stackCount: '',
        icon: <BookOpen className="w-4 h-4 text-[#2155E6] dark:text-[#60A5FA]" />,
        image: '/assets/dribbble-basket-tools.jpg',
        onSelect: () => onNavigate('vocabulary'),
      },
      {
        slotNumber: 2,
        id: 'slot-grammar',
        label: isEn ? 'Syntax Anvil' : 'ไวยากรณ์',
        rarity: 'gold' as const,
        stackCount: '',
        icon: <Sparkles className="w-4 h-4 text-[#FFE600] dark:text-[#FFE600]" />,
        image: '/assets/dribbble-safe-coins.jpg',
        onSelect: () => onNavigate('grammar'),
      },
      {
        slotNumber: 3,
        id: 'slot-reading',
        label: isEn ? 'Reading Scroll' : 'การอ่าน',
        rarity: 'celestial' as const,
        stackCount: '',
        icon: <BookMarked className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&auto=format&fit=crop&q=80',
        onSelect: () => onNavigate('reading'),
      },
      {
        slotNumber: 4,
        id: 'slot-listening',
        label: isEn ? 'Echo Crystal' : 'การฟัง',
        rarity: 'silver' as const,
        stackCount: '',
        icon: <Headphones className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />,
        image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80',
        onSelect: () => onNavigate('listening'),
      },
      {
        slotNumber: 5,
        id: 'slot-compete',
        label: isEn ? 'Speed Duel' : 'ดวลความเร็ว',
        rarity: 'crimson' as const,
        stackCount: '',
        icon: <Swords className="w-4 h-4 text-[#FF4655]" />,
        image: '/assets/dribbble-hands-controller.jpg',
        onSelect: () => onNavigate('compete'),
      },
      {
        slotNumber: 6,
        id: 'slot-exam',
        label: isEn ? 'Mock Exam' : 'ข้อสอบจำลอง',
        rarity: 'copper' as const,
        stackCount: '',
        icon: <Award className="w-4 h-4 text-[#FFE600] dark:text-[#FFE600]" />,
        image: '/assets/dribbble-gift-box.jpg',
        onSelect: () => onNavigate('mockExam'),
      },
    ],
    [isEn, onNavigate]
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 pb-16">
      {/* 1. TOP VIEW MODE SWITCH (Path vs All Studios) */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F59E0B]/15 text-[#FDE68A] border border-[#F59E0B]/30">
              ADAPTIVE CEFR FRAMEWORK
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/30">
              {progress.currentLevel === 'A1'
                ? 'LEVEL: A1 NOVICE // FOUNDATION'
                : progress.currentLevel === 'A2'
                ? 'LEVEL: A2 ELEMENTARY // ESSENTIALS'
                : progress.currentLevel === 'B1'
                ? 'LEVEL: B1 INTERMEDIATE // FLUENCY'
                : progress.currentLevel === 'B2'
                ? 'LEVEL: B2 UPPER-INTERMEDIATE // VANTAGE'
                : progress.currentLevel === 'C1'
                ? 'LEVEL: C1 ADVANCED // EFFECTIVE OPERATIONAL'
                : 'LEVEL: C2 MASTERY // EXPERT NATIVE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap font-display">
            <DecryptedText
              text={isEn ? 'Your Learning Dashboard' : 'แดชบอร์ดการเรียนรู้ของคุณ'}
              animateOn="hover"
            />
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#FDE68A] font-mono font-bold border border-[#F59E0B]/30">
              {progress.currentLevel} → {nextLvl}
            </span>
          </h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 mt-1 flex-wrap font-mono">
            <span>เป้าหมายการสอบ: <strong className="text-white">{progress.targetExam}</strong></span>
            <span>•</span>
            <span>Cambridge Equivalent: <strong className="text-white">{progress.estimatedCambridgeScore || 120}</strong></span>
            <span>•</span>
            <span>เส้นทางการพัฒนา CEFR Framework: <strong className="text-[#FDE68A]">{progress.currentLevel}</strong></span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
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
            { id: 'path', label: isEn ? 'CEFR Learning Path' : 'เส้นทางเรียนรู้ CEFR', icon: <Compass className="w-4 h-4" /> },
            { id: 'studios', label: isEn ? 'All Studios' : 'สตูดิโอทั้งหมด', icon: <BookOpen className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />
      </div>

      {/* DYNAMIC VIEW SWITCHER: ALL STUDIOS CATALOG VS STEPPED PATH */}
      {activeTab === 'studios' ? (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#070B16]/90 backdrop-blur-md border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.7)] flex items-center justify-between gap-6 flex-wrap text-white">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F59E0B] text-slate-950">
                  CURRICULUM REPERTOIRE
                </span>
                <span className="text-xs font-mono font-bold text-[#34D399]">
                  8 SPECIALIZED STUDIOS ACTIVE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                {isEn ? 'All 8 Dedicated Learning Studios' : 'คลังสตูดิโอการเรียนรู้ทั้ง 8 ด้าน'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isEn
                  ? 'Access any core skill module directly. Practice vocabulary, review grammar rules, compete in fast-paced duels, or challenge Cambridge mock exams.'
                  : 'เลือกเข้าฝึกฝนทักษะเฉพาะด้านได้ทันที ทั้งคลังคำศัพท์ ไวยากรณ์ การประลองความเร็ว 4 วินาที และการสอบจำลองเคมบริดจ์'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('path')}
                className="glova-gold-btn inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{isEn ? 'Back to CEFR Path' : 'กลับไปที่เส้นทางเรียนรู้'}</span>
              </button>
            </div>
          </div>

          {/* ALL 8 STUDIOS BENTO GRID */}
          <BentoGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'vocabulary',
                title: isEn ? 'CEFR Vocabulary Studio' : 'คลังคำศัพท์ CEFR',
                ctaText: isEn ? 'Open Vocabulary' : 'เปิดคลังคำศัพท์',
                desc: isEn ? 'Master high-frequency words with spaced repetition & collocation pairs.' : 'เรียนรู้คำศัพท์ตามระดับ A1-C2 พร้อมระบบทบทวน Spaced Repetition',
                icon: <BookOpen className="w-6 h-6 text-[#2155E6] dark:text-[#60A5FA]" />,
                badge: '3,860 Words',
                accent: 'indigo' as const,
                colSpan: 'sm:col-span-2 lg:col-span-2',
                background: (
                  <img
                    src="/assets/dribbble-safe-coins.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity"
                  />
                ),
              },
              {
                id: 'grammar',
                title: isEn ? 'English Grammar Studio' : 'ไวยากรณ์ภาษาอังกฤษ',
                ctaText: isEn ? 'Practice Exercises' : 'ฝึกทำแบบฝึกหัด',
                desc: isEn ? 'Practical sentence structures and tenses explained with clear rules.' : 'โครงสร้างประโยคและ Tenses สำคัญพร้อมตัวอย่างประโยคใช้งานจริง',
                icon: <Sparkles className="w-6 h-6 text-[#FFE600] dark:text-[#FFE600]" />,
                badge: '18 Topics',
                accent: 'amber' as const,
                colSpan: 'sm:col-span-1 lg:col-span-1',
                background: (
                  <img
                    src="/assets/dribbble-basket-tools.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity"
                  />
                ),
              },
              {
                id: 'compete',
                title: isEn ? 'Speed Vocab Duel' : 'ประลองคำศัพท์จัดอันดับ',
                ctaText: isEn ? 'Battle Now' : 'ประลองตอนนี้',
                desc: isEn ? 'Fast-paced 4-second reflex challenges against university peers.' : 'ท้าทายความเร็วข้อละ 4 วินาที ไต่อันดับ MMR ในแรงก์ลีก',
                icon: <Swords className="w-6 h-6 text-[#FF4655]" />,
                badge: 'Ranked MMR',
                accent: 'crimson' as const,
                colSpan: 'sm:col-span-1 lg:col-span-1',
                background: (
                  <img
                    src="/assets/dribbble-hands-controller.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity"
                  />
                ),
              },
              {
                id: 'mockExam',
                title: isEn ? 'Cambridge Mock Exams' : 'ข้อสอบจำลอง Cambridge',
                ctaText: isEn ? 'Enter Exam Vault' : 'เข้าสู่คลังข้อสอบ',
                desc: isEn ? `Realistic exam simulations for ${progress.targetExam} with timer.` : `ข้อสอบเสมือนจริงของ ${progress.targetExam} พร้อมจับเวลาและวิเคราะห์คะแนน`,
                icon: <Award className="w-6 h-6 text-[#FFE600] dark:text-[#FFE600]" />,
                badge: 'KET / PET / FCE',
                accent: 'emerald' as const,
                colSpan: 'sm:col-span-2 lg:col-span-2',
                background: (
                  <img
                    src="/assets/dribbble-gift-box.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity"
                  />
                ),
              },
              {
                id: 'listening',
                title: isEn ? 'Listening Studio' : 'สตูดิโอการฟังและการออกเสียง',
                ctaText: isEn ? 'Start Listening' : 'เริ่มฝึกทักษะการฟัง',
                desc: isEn ? 'High-fidelity audio with variable speed controls and accent immersion.' : 'บทสนทนาสถานการณ์จริงพร้อมระบบปรับความเร็วเสียงและถอดเสียงแบบคำต่อคำ',
                icon: <Headphones className="w-6 h-6 text-sky-500" />,
                badge: 'Native Audio',
                accent: 'indigo' as const,
                colSpan: 'sm:col-span-1 lg:col-span-1',
              },
              {
                id: 'speaking',
                title: isEn ? 'Academic Speaking Studio' : 'สตูดิโอฝึกพูดและสัทศาสตร์',
                ctaText: isEn ? 'Practice Speaking' : 'เริ่มฝึกการพูด',
                desc: isEn ? 'Phonetic IPA pronunciation feedback and real-time oral fluency calibration.' : 'ระบบวิเคราะห์การออกเสียงและสัทศาสตร์พร้อมคำแนะนำปรับปรุงแบบเรียลไทม์',
                icon: <Mic className="w-6 h-6 text-violet-500" />,
                badge: 'IPA Feedback',
                accent: 'indigo' as const,
                colSpan: 'sm:col-span-1 lg:col-span-1',
              },
              {
                id: 'writing',
                title: isEn ? 'Writing & Composition Lab' : 'สตูดิโอการเขียนและเรียบเรียง',
                ctaText: isEn ? 'Start Writing' : 'เริ่มฝึกการเขียน',
                desc: isEn ? 'Essay drafting with automated Cambridge rubric evaluation and lexical diversity.' : 'ฝึกเขียนเรียงความและจดหมายพร้อมการวิเคราะห์คำศัพท์และความถูกต้องของไวยากรณ์',
                icon: <PenTool className="w-6 h-6 text-amber-500" />,
                badge: 'AI Rubric',
                accent: 'amber' as const,
                colSpan: 'sm:col-span-2 lg:col-span-2',
              },
              {
                id: 'assessment',
                title: isEn ? 'Diagnostic CEFR Assessment' : 'ระบบทดสอบวัดระดับ CEFR',
                ctaText: isEn ? 'Take Assessment' : 'เริ่มทำแบบวัดระดับ',
                desc: isEn ? 'Comprehensive multi-skill diagnostic engine to evaluate your baseline CEFR band.' : 'แบบประเมินทักษะภาษาอังกฤษรอบด้าน 3 นาทีเพื่อสอบเทียบระดับที่แท้จริงของคุณ',
                icon: <Target className="w-6 h-6 text-emerald-500" />,
                badge: 'CEFR Benchmark',
                accent: 'emerald' as const,
                colSpan: 'sm:col-span-2 lg:col-span-2',
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
                background={(studio as any).background}
                onCtaClick={() => onNavigate(studio.id as any)}
              />
            ))}
          </BentoGrid>
        </div>
      ) : (
        <>

      {/* 1.5 TERRARIA 6-SLOT HOTBAR INVENTORY STRIP (Uiverse.io x Terraria) */}
      <TerrariaHotbarBar
        items={hotbarSlots}
        title={isEn ? 'Studio Inventory & Quick Select' : 'ช่องเก็บไอเทมสตูดิโอ (กดเลือกเพื่อเข้าฝึกทันที)'}
        subtitle={isEn ? 'Equipment Rack' : 'แท่นอุปกรณ์สตูดิโอ'}
      />

      {/* 2. BALANCED 2-COLUMN LAYOUT (Godly.design Melius 65% Primary Journey + 35% Tactical HUD Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: WHAT TO DO NOW HERO + STEPPED PATH (8 cols)                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* A. GLOVA CEFR PRIMARY HERO BANNER */}
          <div className="glova-card relative overflow-hidden rounded-[28px] text-white p-6 sm:p-8 border border-[#F59E0B]/30 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.15)]">
            {/* Ambient Celestial Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#0EA5E9]/15 blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/3 w-60 h-60 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 flex flex-col gap-3.5">
                {/* Header Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/15 text-[#FDE68A] text-[11px] font-bold uppercase tracking-wider border border-[#F59E0B]/30">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                    <span>{primaryAction.unitBadge}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#070B14] text-[#FDE68A] border border-[#F59E0B]/40 text-[10px] font-bold uppercase">
                    CEFR LEVEL {progress.currentLevel}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    {primaryAction.skill}
                  </span>
                </div>

                {/* Main Heading */}
                <div className="space-y-1">
                  <h2 className="font-extrabold text-xl sm:text-2xl lg:text-3xl font-display text-white tracking-tight leading-snug">
                    {primaryAction.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    {primaryAction.description}
                  </p>
                </div>

                {/* Tactile Metallic Action Buttons (Glova 5-Source Styling) */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={primaryAction.onStart}
                    className="glova-gold-btn inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
                  >
                    <span>{primaryAction.cta}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('compete')}
                    className="glova-silver-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
                  >
                    <Swords className="w-4 h-4 text-[#FDE68A]" />
                    <span>{isEn ? 'Speed Vocab Duel (MMR)' : 'ดวลความเร็วคำศัพท์ 4 วิ'}</span>
                  </button>

                  <Link
                    href="/landing"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold text-slate-300 hover:text-[#FDE68A] hover:bg-white/5 transition-colors"
                  >
                    <span>{isEn ? 'Platform Overview' : 'ภาพรวมแพลตฟอร์ม'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Glova Active Learners Photo */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-[#F59E0B]/40 shadow-[0_0_25px_rgba(245,158,11,0.3)] bg-[#070B14] group">
                  <img
                    src="/assets/hero-students-study.jpg"
                    alt="Glova Active Learners"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* B. DRIBBBLE SLIDE 2 INSPIRATION: ACTIVE CONTENDERS & LIVE STUDY SQUAD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#070B16]/85 backdrop-blur-md border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-display">
                  {isEn ? 'Live Study Squad & Active Contenders' : 'เพื่อนร่วมเรียนและคู่ประลองออนไลน์'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#34D399] bg-[#10B981]/15 px-2 py-0.5 rounded-md border border-[#10B981]/30">
                {isEn ? '6 ONLINE' : 'ออนไลน์ 6 คน'}
              </span>
            </div>

            {/* Horizontal Scrollable Contenders Row (Dribbble Slide 2 Transfer List) */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
              {/* + Add / Invite */}
              <button
                type="button"
                onClick={() => onNavigate('social')}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-slate-400 group-hover:border-[#F59E0B] group-hover:text-[#FDE68A] transition-colors">
                  <span className="text-lg font-bold">+</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-white">
                  {isEn ? 'Invite' : 'เชิญเพื่อน'}
                </span>
              </button>

              {/* Contender 1: Mary */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
                    alt="Mary"
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/70 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#070B16]" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white">Mary</div>
                  <span className="text-[9px] font-mono font-bold text-[#FDE68A]">A2</span>
                </div>
              </div>

              {/* Contender 2: David */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                    alt="David"
                    className="w-12 h-12 rounded-full object-cover border-2 border-sky-400/70 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#070B16]" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white">David</div>
                  <span className="text-[9px] font-mono font-bold text-sky-400">B1</span>
                </div>
              </div>

              {/* Contender 3: Sarah */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt="Sarah"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/70 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#070B16]" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white">Sarah</div>
                  <span className="text-[9px] font-mono font-bold text-emerald-400">B2</span>
                </div>
              </div>

              {/* Contender 4: William */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                    alt="William"
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/70 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#070B16]" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white">William</div>
                  <span className="text-[9px] font-mono font-bold text-purple-400">C1</span>
                </div>
              </div>

              {/* Contender 5: Frame (You) */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FFE600] p-0.5 shadow-sm">
                    <div className="w-full h-full rounded-full bg-[#070B16] flex items-center justify-center font-bold text-xs text-[#FDE68A]">
                      YOU
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#070B16]" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white">Frame</div>
                  <span className="text-[9px] font-mono font-bold text-[#FDE68A]">Gold II</span>
                </div>
              </div>
            </div>
          </div>

          {/* RESUME LAST ACTIVITY */}
          {progress.lastActivity && (
            <div className="p-5 rounded-2xl bg-[#070B16]/85 backdrop-blur-md border border-white/10 flex items-center justify-between gap-4 text-white shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <div>
                <span className="text-[11px] font-bold text-[#FDE68A] uppercase tracking-wider font-mono">
                  {isEn ? 'Resume Last Activity' : 'ดำเนินการต่อจากจุดเดิม'}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{progress.lastActivity.title}</h4>
                <p className="text-xs text-slate-400">{progress.lastActivity.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(progress.lastActivity?.type as any || 'vocabulary')}
                className="glova-gold-btn inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {isEn ? 'Resume' : 'ทำต่อทันที'}
              </button>
            </div>
          )}

          {/* PROMOTIONAL CAMPAIGN & COMMUNITY EVENT CAROUSEL */}
          <CampaignBanner onNavigate={(route) => onNavigate(route as NavView)} />

          {/* B. MAIN INTERACTIVE EXPERIENCE: GLOVA CEFR PROGRESSION MATRIX */}
          <div className="rounded-2xl bg-[#070B16]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.7)] relative overflow-hidden space-y-6 text-white">
              {/* Unit Progression Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#FDE68A] uppercase tracking-wider font-mono">
                      {isEn ? `Progression: ${progress.currentLevel} → ${nextLvl}` : `การพัฒนา: ${progress.currentLevel} → ${nextLvl}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/15 text-[#FDE68A] border border-[#F59E0B]/30 font-mono">
                      {isEn ? 'Active Studio Term' : 'ภาคการเรียนรู้ปัจจุบัน'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 font-display">
                    {isEn ? 'Core Academic & Conversational Modules' : 'โมดูลภาษาอังกฤษเชิงวิชาการและการสื่อสาร'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-white">3 / 6 {isEn ? 'Modules' : 'โมดูล'}</span>
                    <div className="text-[10px] text-slate-400">50% Complete</div>
                  </div>
                  <div className="w-24 h-2.5 rounded-full bg-[#030712] border border-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>

              {/* Glova Signature Cartridge Grid (Original Product Identity) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlovaCartridge
                  id="mod-1"
                  level={progress.currentLevel}
                  skill="vocabulary"
                  image="/assets/dribbble-basket-tools.jpg"
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
                  image="/assets/dribbble-safe-coins.jpg"
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
                  image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80"
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
                  image="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80"
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
                  image="/assets/dribbble-hands-controller.jpg"
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
                  image="/assets/dribbble-gift-box.jpg"
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
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-display">
                    {isEn ? 'Secondary Curated Pathways' : 'เส้นทางการเรียนรู้เฉพาะทาง'}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">3 Core Studios</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-xl overflow-hidden bg-[#0B1224]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-md flex flex-col justify-between group transition-colors">
                    <div className="relative h-28 w-full overflow-hidden bg-[#070B16]">
                      <img
                        src="/assets/dribbble-basket-tools.jpg"
                        alt="Vocabulary"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070B16] via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B] text-slate-950">
                        VOCABULARY
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-black text-sm text-white">{isEn ? 'CEFR Vocabulary Lab' : 'คลังคำศัพท์ CEFR'}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{isEn ? '3,860 verified terms' : '3,860 คำศัพท์มาตรฐาน'}</p>
                      </div>
                      <TactileButton variant="primary" size="sm" fullWidth onClick={() => onNavigate('vocabulary')}>
                        {isEn ? 'Open Vocabulary' : 'เปิดคลังคำศัพท์'}
                      </TactileButton>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-[#0B1224]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-md flex flex-col justify-between group transition-colors">
                    <div className="relative h-28 w-full overflow-hidden bg-[#070B16]">
                      <img
                        src="/assets/dribbble-safe-coins.jpg"
                        alt="Grammar"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070B16] via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B] text-slate-950">
                        GRAMMAR
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-black text-sm text-white">{isEn ? 'English Grammar Studio' : 'ไวยากรณ์ภาษาอังกฤษ'}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{isEn ? 'Timeline visualization' : 'โครงสร้างประโยคไวยากรณ์'}</p>
                      </div>
                      <TactileButton variant="primary" size="sm" fullWidth onClick={() => onNavigate('grammar')}>
                        {isEn ? 'Practice Exercises' : 'ฝึกทำแบบฝึกหัด'}
                      </TactileButton>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-[#0B1224]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-md flex flex-col justify-between group transition-colors">
                    <div className="relative h-28 w-full overflow-hidden bg-[#070B16]">
                      <img
                        src="/assets/dribbble-gift-box.jpg"
                        alt="Exam"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070B16] via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981] text-white">
                        MOCK EXAM
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-black text-sm text-white">{isEn ? 'Cambridge Mock Exams' : 'ข้อสอบจำลอง Cambridge'}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{isEn ? `${progress.targetExam} simulation` : `ข้อสอบจำลอง ${progress.targetExam}`}</p>
                      </div>
                      <TactileButton variant="primary" size="sm" fullWidth onClick={() => onNavigate('mockExam')}>
                        {isEn ? 'Take Mock Exam' : 'เข้าสู่คลังข้อสอบ'}
                      </TactileButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: TACTICAL ESPORTS TELEMETRY STACK (BorisWick Inspired)       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          {/* 1. RANKED BATTLE ARENA SPOTLIGHT HUD */}
          <div className="relative overflow-hidden rounded-2xl bg-[#070B16]/90 backdrop-blur-md border border-[#F59E0B]/30 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  {isEn ? 'RANKED BATTLE ARENA' : 'สมรภูมิประลองจัดอันดับ'}
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded font-black font-mono bg-[#F59E0B] text-slate-950 shadow-xs">
                Top 10
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src="/assets/dribbble-hands-controller.jpg"
                  alt="Ranked Controller"
                  className="w-16 h-16 rounded-xl object-cover border border-[#F59E0B]/40 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#070B16]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-sm sm:text-base text-white truncate font-display">
                  Gold II • Bangkok League
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Rating: <span className="font-bold text-[#FDE68A]">1,420 MMR</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('compete')}
              className="glova-gold-btn w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer select-none"
            >
              <Swords className="w-4 h-4" />
              <span>{isEn ? 'ENTER VOCAB BATTLE' : 'เข้าสู่สนามประลอง'}</span>
            </button>
          </div>

          {/* 2. UNIFIED TACTICAL TELEMETRY CONSOLE (Hairline Dividers) */}
          <div className="rounded-2xl bg-[#070B16]/85 backdrop-blur-md border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.7)] divide-y divide-white/10 overflow-hidden text-white">
            {/* Section A: Daily Streak & Target Telemetry */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-lg font-black text-white">
                        <AnimatedNumber value={progress.streakDays} />
                      </span>
                      <span className="text-xs font-bold text-[#FDE68A]">
                        {`${progress.streakDays} วัน`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {progress.streakDays >= 3
                        ? isEn ? 'Momentum Active' : 'โมเมนตัมกำลังดี พัฒนาต่อเนื่อง!'
                        : isEn ? 'Daily fluency drill' : 'ฝึกต่อเนื่องเพื่อสร้างความคล่อง'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <img
                    src={`/assets/badges/badge-cefr-${progress.currentLevel.toLowerCase()}.png`}
                    alt={`CEFR ${progress.currentLevel}`}
                    className="w-10 h-10 object-contain drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[9px] font-mono font-bold text-[#FDE68A]">
                    {progress.currentLevel}
                  </span>
                </div>
              </div>

              {/* Progress Counters */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#0B1224]/80 border border-white/5">
                  <div className="text-[10px] text-slate-400 font-sans">{isEn ? 'Daily Goal' : 'เป้าหมายประจำวัน'}</div>
                  <div className="font-bold text-white">{isEn ? `${minutesStudied}m / ${goalMinutes}m` : `${minutesStudied} นาที / ${goalMinutes} นาที`}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1224]/80 border border-white/5">
                  <div className="text-[10px] text-slate-400 font-sans">{isEn ? 'Questions' : 'ทำข้อสอบแล้ว'}</div>
                  <div className="font-bold text-white">{`${progress.completedQuestionIds?.length || 0} ข้อ`}</div>
                </div>
                <div className="col-span-2 p-2.5 rounded-xl bg-[#0B1224]/80 border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">{isEn ? 'Mastered Words' : 'คำศัพท์ที่เชี่ยวชาญ'}</span>
                  <span className="font-bold text-[#FDE68A]">{isEn ? `${progress.masteredWordIds?.length || 0} words` : `${progress.masteredWordIds?.length || 0} คำศัพท์ที่เชี่ยวชาญแล้ว`}</span>
                </div>
              </div>
            </div>

            {/* Section B: 6 Core Competencies Progress Meters */}
            <div className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                {isEn ? '6 CORE COMPETENCIES' : 'ความเชี่ยวชาญ 6 ด้าน'}
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { skill: 'vocabulary', label: isEn ? 'Vocabulary' : 'คลังคำศัพท์', val: progress.skillStats.vocabulary, color: 'bg-[#F59E0B]' },
                  { skill: 'grammar', label: isEn ? 'Grammar' : 'ไวยากรณ์', val: progress.skillStats.grammar, color: 'bg-amber-400' },
                  { skill: 'reading', label: isEn ? 'Reading' : 'การอ่าน', val: progress.skillStats.reading, color: 'bg-emerald-400' },
                  { skill: 'listening', label: isEn ? 'Listening' : 'การฟัง', val: progress.skillStats.listening, color: 'bg-sky-400' },
                  { skill: 'writing', label: isEn ? 'Writing' : 'การเขียน', val: progress.skillStats.writing, color: 'bg-violet-400' },
                  { skill: 'speaking', label: isEn ? 'Speaking' : 'การพูด', val: progress.skillStats.speaking, color: 'bg-rose-400' },
                ].map((s) => (
                  <div key={s.skill} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-200">{s.label}</span>
                      <span className="text-[#FDE68A] font-mono">{s.val}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={s.val}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="w-full h-1.5 rounded-full bg-[#030712] border border-white/5 overflow-hidden"
                    >
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section C: Daily Quests */}
            <div className="p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{isEn ? 'DAILY QUESTS' : 'ภารกิจประจำวัน'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">1 / 3 Done</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Quest 1 */}
                <div className="p-3 rounded-xl bg-[#0B1224]/80 border border-white/5 flex items-center justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <img src="/assets/dribbble-basket-tools.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-bold text-slate-200 truncate">
                      {isEn ? 'Complete 1 Practice Lesson' : 'ทำบทเรียนสำเร็จ 1 บท'}
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-[#030712] overflow-hidden">
                      <div className="h-full rounded-full bg-[#10B981]" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <span className="text-[#34D399] font-bold shrink-0 font-mono text-[11px]">
                    +10 XP
                  </span>
                </div>

                {/* Quest 2 */}
                <div className="p-3 rounded-xl bg-[#0B1224]/80 border border-white/5 flex items-center justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <img src="/assets/dribbble-hands-controller.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-bold text-slate-200 truncate">
                      {isEn ? 'Score 80%+ in Vocab Battle' : 'ชนะประลองคำศัพท์ด้วยคะแนน 80% ขึ้นไป'}
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-[#030712] overflow-hidden">
                      <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: '0%' }} />
                    </div>
                  </div>
                  <span className="text-[#FDE68A] font-bold shrink-0 font-mono text-[11px]">
                    +20 XP
                  </span>
                </div>

                {/* Quest 3 */}
                <div className="p-3 rounded-xl bg-[#0B1224]/80 border border-white/5 flex items-center justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <img src="/assets/dribbble-safe-coins.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-bold text-slate-200 truncate">
                      {isEn ? 'Review 5 Spaced Words' : 'ทบทวนคำศัพท์ Spaced Repetition 5 คำ'}
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-[#030712] overflow-hidden">
                      <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <span className="text-[#FDE68A] font-bold shrink-0 font-mono text-[11px]">
                    +15 XP
                  </span>
                </div>
              </div>
            </div>

            {/* Section D: Weakness Remediation */}
            <div className="p-5 space-y-3">
              <span className="text-[10px] font-bold text-[#F43F5E] uppercase tracking-wider font-mono">
                {isEn ? 'WEAKNESS REMEDIATION' : 'จุดที่ควรเสริม'}
              </span>
              {hasWeakness ? (
                <div className="space-y-2">
                  {progress.weakTopics.map((w) => {
                    const displayTitle = !isEn && w.labelTh ? w.labelTh.replace(/_/g, ' ') : formatTopicTitle(w);
                    return (
                      <div key={w.tag} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{displayTitle}</p>
                          <p className="text-[10px] text-rose-400 font-mono">
                            {isEn ? `Found ${w.errorCount} mistakes` : `พบข้อผิดพลาด ${w.errorCount} ครั้ง`}
                          </p>
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
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs font-bold text-slate-300">ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ</p>
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
      </div>
      </>
      )}
    </div>
  );
};
