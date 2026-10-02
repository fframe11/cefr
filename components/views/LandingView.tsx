'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  Trophy,
  Users,
  ScrollText,
  BookMarked,
  Swords,
  Crown,
  Gamepad2,
  Flame,
  Activity,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';
import { GlovaLogo } from '../ui/GlovaLogo';

interface LandingViewProps {
  onStartLearning?: () => void;
}

// Radiant Gradient Text Component
const ShinyText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,#F59E0B,40%,#FFFBEB,50%,#F59E0B)] bg-[length:200%_100%] animate-glova-shine bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [activePillar, setActivePillar] = useState<'arena' | 'vocab' | 'exam'>('arena');
  const [studioCategory, setStudioCategory] = useState<'all' | 'arena' | 'foundation' | 'advanced' | 'exam'>('all');

  const handleStart = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      setIsDiagnosticOpen(true);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 3 Core Pillars Data for the Panoramic Arena Showcase (Anti-Card Architecture)
  const pillarsData = {
    arena: {
      id: 'arena',
      tag: isEn ? 'REAL-TIME MMR ARENA' : 'สังเวียนประลองเรียลไทม์',
      title: isEn ? '4-SECOND SPEED DUEL ARENA' : 'สังเวียนประลองความเร็ว 4 วินาที',
      headline: isEn ? 'Rapid-fire vocabulary duels against university peers' : 'ดวลคำศัพท์ความเร็วสูง แข่งขันกับผู้เรียนทั่วประเทศ',
      desc: isEn
        ? 'Train instinctive lexical recall under genuine time pressure. Each round gives 4 seconds to identify the correct CEFR collocation, synonyms, and context. Win matches to climb university divisions from Bronze to Grandmaster.'
        : 'ฝึกการดึงคำศัพท์ออกมาใช้โดยสัญชาตญาณภายใต้แรงกดดัน 4 วินาทีต่อข้อ ชนะการประลองเพื่อไต่อันดับ MMR จาก Bronze สู่ Grandmaster',
      image: '/assets/dribbble-hands-controller.jpg',
      alt: 'Glova 4-Second Speed Vocab Controller',
      stats: [
        { label: isEn ? 'Round Limit' : 'เวลาต่อข้อ', val: '4.0s' },
        { label: isEn ? 'Active Contenders' : 'ผู้เล่นพร้อมดวล', val: '1,280+' },
        { label: isEn ? 'Ladder System' : 'ระบบจัดอันดับ', val: 'MMR Elo' },
      ],
      route: '/compete',
      btnText: isEn ? 'ENTER SPEED ARENA' : 'เข้าสู่สังเวียนประลอง',
    },
    vocab: {
      id: 'vocab',
      tag: isEn ? 'SPACED REPETITION VAULT' : 'คลังคำศัพท์อัจฉริยะ',
      title: isEn ? '3,860 ADAPTIVE CEFR WORDS' : 'คลังคำศัพท์ CEFR 3,860 คำ',
      headline: isEn ? 'Exponential memory curves mapped from A1 through C2' : 'จำศัพท์แม่นยำด้วยอัลกอริทึม Spaced Repetition',
      desc: isEn
        ? 'Never forget a word again. Glova tracks your memory retention curve and schedules reviews at the exact moment before decay. Features native Oxford audio pronunciations, collocations, and contextual usage sentences.'
        : 'หมดปัญหาลืมศัพท์ด้วยระบบวิเคราะห์อัตราการลืม ทบทวนคำศัพท์ในจังหวะที่สมองกำลังจะลืม พร้อมเสียงเจ้าของภาษาสำเนียงเคมบริดจ์และการใช้งานจริงในบริบท',
      image: '/assets/dribbble-basket-tools.jpg',
      alt: 'Glova CEFR Study Equipment and Tools',
      stats: [
        { label: isEn ? 'Core Lexicon' : 'คำศัพท์มาตรฐาน', val: '3,860' },
        { label: isEn ? 'Retention Rate' : 'อัตราการจำ', val: '94.8%' },
        { label: isEn ? 'Audio Quality' : 'คุณภาพเสียง', val: 'Studio Hi-Fi' },
      ],
      route: '/vocabulary',
      btnText: isEn ? 'EXPLORE VOCABULARY' : 'เปิดคลังคำศัพท์',
    },
    exam: {
      id: 'exam',
      tag: isEn ? 'CAMBRIDGE FIDELITY' : 'มาตรฐานสอบสากล',
      title: isEn ? 'CAMBRIDGE MOCK EXAM VAULT' : 'คลังข้อสอบจำลอง CAMBRIDGE',
      headline: isEn ? 'Official KET, PET, and FCE test simulations' : 'จำลองสอบ KET, PET, FCE เสมือนจริงทุกประการ',
      desc: isEn
        ? 'Practice with timed exam sections identical to actual Cambridge assessments. Receive instantaneous CEFR band diagnostic reports, skill radars across Reading, Listening, and Language in Use, and targeted recovery plans.'
        : 'ฝึกทำข้อสอบตามโครงสร้างจริงของ Cambridge KET, PET, FCE พร้อมระบบจับเวลาอัตโนมัติ วิเคราะห์คะแนนแยกทักษะการอ่าน การฟัง และไวยากรณ์อย่างแม่นยำ',
      image: '/assets/dribbble-gift-box.jpg',
      alt: 'Glova Cambridge Exam Vault and Rewards',
      stats: [
        { label: isEn ? 'Target Exams' : 'ชุดข้อสอบ', val: 'KET/PET/FCE' },
        { label: isEn ? 'Diagnostic Radar' : 'การวิเคราะห์', val: '6 Axes' },
        { label: isEn ? 'Exam Accuracy' : 'ความตรงข้อสอบ', val: '100%' },
      ],
      route: '/mock-exams',
      btnText: isEn ? 'TAKE MOCK EXAM' : 'เข้าสู่คลังข้อสอบ',
    },
  };

  // The 8 Glova Learning Studios for the Gaming Match Browser (BorisWick Style)
  const allStudios = [
    {
      id: 'compete',
      nameEn: 'Ranked Speed Clash Arena',
      nameTh: 'ประลองคำศัพท์ 4 วินาที (MMR)',
      category: 'arena',
      level: 'Real-Time Ladder',
      time: '4s / round',
      activeUsers: '482 in queue',
      descEn: 'High-speed vocabulary reflex battles with peer matchmaking and rank points.',
      descTh: 'ดวลคำศัพท์ความเร็วสูง 4 วินาที ไต่อันดับ MMR แข่งขันกับผู้เรียนทั่วประเทศ',
      icon: <Swords className="w-5 h-5 text-[#F59E0B]" />,
      route: '/compete',
      accent: 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FDE68A]',
    },
    {
      id: 'vocabulary',
      nameEn: 'CEFR Vocabulary Vault',
      nameTh: 'คลังคำศัพท์ CEFR 3,860 คำ',
      category: 'foundation',
      level: 'A1 - C2',
      time: '5-10 mins / day',
      activeUsers: '1,840 practicing',
      descEn: 'Spaced repetition vocabulary system with collocations and native audio.',
      descTh: 'ระบบทบทวนคำศัพท์ตามระดับ A1-C2 ด้วยอัลกอริทึม Spaced Repetition',
      icon: <BookOpen className="w-5 h-5 text-[#38BDF8]" />,
      route: '/vocabulary',
      accent: 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]',
    },
    {
      id: 'mockExam',
      nameEn: 'Cambridge Exam Vault',
      nameTh: 'คลังข้อสอบจำลอง Cambridge',
      category: 'exam',
      level: 'KET / PET / FCE',
      time: '45-90 mins',
      activeUsers: '320 in test',
      descEn: 'Full-fidelity mock exams with countdown timer and CEFR band diagnostic.',
      descTh: 'จำลองการทำข้อสอบ KET, PET, FCE เสมือนจริง พร้อมวิเคราะห์คะแนนละเอียด',
      icon: <Award className="w-5 h-5 text-[#F59E0B]" />,
      route: '/mock-exams',
      accent: 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FDE68A]',
    },
    {
      id: 'speaking',
      nameEn: 'Acoustic Speaking Lab',
      nameTh: 'ห้องปฏิบัติการทักษะการพูด',
      category: 'advanced',
      level: 'A2 - C1',
      time: '5-10 mins',
      activeUsers: '215 live sessions',
      descEn: 'Speech practice with acoustic waveform feedback and syllable rhythm analysis.',
      descTh: 'ฝึกพูดและออกเสียงพร้อมระบบจับคลื่นเสียงและจังหวะเน้นเสียงพยางค์',
      icon: <Mic className="w-5 h-5 text-[#34D399]" />,
      route: '/speaking',
      accent: 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]',
    },
    {
      id: 'grammar',
      nameEn: 'Grammar Logic Blueprint',
      nameTh: 'ไวยากรณ์และโครงสร้างประโยค',
      category: 'foundation',
      level: 'A1 - C1',
      time: '8-12 mins',
      activeUsers: '740 learners',
      descEn: 'Structural sentence patterns, tenses, and academic rules explained without rote memorization.',
      descTh: 'โครงสร้างประโยคและ Tenses สำคัญ อธิบายด้วยแผนภาพความเข้าใจ ไม่ต้องท่องสูตร',
      icon: <Sparkles className="w-5 h-5 text-[#A78BFA]" />,
      route: '/grammar',
      accent: 'border-[#A78BFA]/40 bg-[#A78BFA]/10 text-[#A78BFA]',
    },
    {
      id: 'listening',
      nameEn: 'Auditory Comprehension Lab',
      nameTh: 'สตูดิโอฝึกการฟังสำเนียงสากล',
      category: 'foundation',
      level: 'A1 - C2',
      time: '5-8 mins',
      activeUsers: '530 listening',
      descEn: 'University lectures, interviews, and conversational audio with transcript verification.',
      descTh: 'ฝึกฟังบทสนทนาและการบรรยายวิชาการสำเนียงสากล พร้อมสคริปต์ตรวจสอบ',
      icon: <Headphones className="w-5 h-5 text-[#38BDF8]" />,
      route: '/listening',
      accent: 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]',
    },
    {
      id: 'reading',
      nameEn: 'Analytical Reading Lab',
      nameTh: 'ห้องพัฒนาการอ่านเชิงวิเคราะห์',
      category: 'advanced',
      level: 'A2 - C2',
      time: '6-10 mins',
      activeUsers: '390 scholars',
      descEn: 'Skimming, scanning, and deep comprehension across authentic academic texts.',
      descTh: 'ฝึกเทคนิคการอ่าน Skimming, Scanning และการคิดวิเคราะห์จากบทความวิชาการ',
      icon: <BookMarked className="w-5 h-5 text-[#34D399]" />,
      route: '/reading',
      accent: 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]',
    },
    {
      id: 'writing',
      nameEn: 'Academic Writing Studio',
      nameTh: 'สตูดิโอพัฒนาการเขียนเชิงวิชาการ',
      category: 'advanced',
      level: 'B1 - C2',
      time: '10-15 mins',
      activeUsers: '180 writing',
      descEn: 'Essay structuring, formal correspondence, and cohesion analysis.',
      descTh: 'ฝึกเขียน Essay และอีเมลทางการ พร้อมระบบประเมินความสอดคล้องของประโยค',
      icon: <PenTool className="w-5 h-5 text-[#A78BFA]" />,
      route: '/writing',
      accent: 'border-[#A78BFA]/40 bg-[#A78BFA]/10 text-[#A78BFA]',
    },
  ];

  const filteredStudios = studioCategory === 'all'
    ? allStudios
    : allStudios.filter((s) => s.category === studioCategory);

  const activePillarData = pillarsData[activePillar];

  return (
    <div className="min-h-screen bg-game-canvas text-slate-100 relative overflow-x-hidden font-sans selection:bg-[#F59E0B] selection:text-[#040711]">
      
      {/* Ambient Environmental Light Flares (Knightopia & BorisWick Atmosphere) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Top Gold Volumetric Flare */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-[#F59E0B]/18 via-[#F59E0B]/5 to-transparent rounded-full blur-[140px]" />
        
        {/* Left Cyan Atmospheric Mist */}
        <div className="absolute top-1/4 -left-40 w-[700px] h-[700px] bg-[#0EA5E9]/10 rounded-full blur-[160px]" />

        {/* Right Indigo Glow */}
        <div className="absolute top-2/3 -right-40 w-[800px] h-[800px] bg-[#6366F1]/10 rounded-full blur-[180px]" />

        {/* Subtle Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* =====================================================================
          1. HERO SECTION: OPEN GAMING WORLD (No Card Wrappers)
          (Inspired by Knightopia: Expansive Canvas + Floating Typography + Natural Grounding)
          ===================================================================== */}
      <section id="overview" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Direct Floating Typography */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Status Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Crown className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FDE68A]">
                  {isEn ? 'CAMBRIDGE CEFR A1-C2 · GAMIFIED PLATFORM' : 'สนามประลองภาษาอังกฤษมาตรฐานสากล CEFR A1-C2'}
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white tracking-tight leading-[1.05] font-display">
                  {isEn ? (
                    <>
                      MASTER ENGLISH <br />
                      <ShinyText className="tracking-wide">WITH GLOVA</ShinyText>
                    </>
                  ) : (
                    <>
                      เก่งภาษาอังกฤษ <br />
                      <ShinyText className="tracking-wide">ด้วยมาตรฐาน GLOVA</ShinyText>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {isEn
                    ? 'Join over 25,000 learners mastering Cambridge CEFR English. Experience 4-second speed vocabulary duels, Cambridge exam simulations (KET/PET/FCE), and acoustic speaking feedback.'
                    : 'ร่วมเรียนรู้กับผู้เรียนกว่า 25,000 คน ฝึกฝนทักษะภาษาอังกฤษตามมาตรฐานสากล CEFR A1-C2 ด้วยการประลองศัพท์ 4 วินาที จำลองสอบ Cambridge เสมือนจริง และห้องวิเคราะห์การพูดด้วยเสียง'}
                </p>
              </div>

              {/* Action Buttons (Tactile 3D Buttons) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="glova-gold-btn w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 cursor-pointer select-none"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>{isEn ? 'START 3-MIN ASSESSMENT' : 'เริ่มวัดระดับฟรี 3 นาที'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('arena')}
                  className="glova-silver-btn w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <Gamepad2 className="w-5 h-5 text-[#FDE68A]" />
                  <span>{isEn ? 'EXPLORE ARENA' : 'ชมสนามประลอง'}</span>
                </button>
              </div>

              {/* Verified Trust Tokens */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                  <span>{isEn ? '100% Cambridge CEFR Aligned' : 'มาตรฐานสากล Cambridge'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  <span>{isEn ? 'Instant 3-Min Assessment' : 'วัดระดับรู้ผลใน 3 นาที'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  <span>{isEn ? '1,280 Learners Online' : 'ผู้เรียนออนไลน์ 1,280 คน'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Artwork Chamber (Naturally Integrated into Scene) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Amber Volumetric Glow behind Character/Students */}
              <div className="absolute w-[450px] h-[450px] rounded-full bg-[#F59E0B]/20 blur-[90px] pointer-events-none" />

              {/* Portal Window Frame */}
              <div className="relative w-full max-w-[540px] aspect-[4/5] rounded-[32px] p-2 bg-gradient-to-b from-[#F59E0B]/40 via-[#F59E0B]/10 to-transparent border border-[#FDE68A]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                <div className="relative w-full h-full rounded-[26px] overflow-hidden bg-[#0A0F1D]">
                  
                  {/* Real University Students Photography */}
                  <img
                    src="/assets/hero-students-study.jpg"
                    alt="Glova University Students Learning English Together"
                    className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-700 select-none"
                  />

                  {/* Corner Pulse Status Badge */}
                  <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-[#070B14]/90 border border-[#F59E0B]/40 shadow-lg backdrop-blur-md flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                    <span className="text-[11px] font-bold tracking-wider text-[#FDE68A]">
                      LIVE SPEED ARENA
                    </span>
                  </div>

                  {/* Bottom Vignette Floor Shadow */}
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent z-10" />

                  <div className="absolute bottom-5 inset-x-5 z-20 flex items-center justify-between text-xs text-slate-300 px-4 py-2.5 rounded-xl bg-[#0B1224]/80 backdrop-blur-md border border-[#F59E0B]/25">
                    <div className="flex items-center gap-2">
                      <GlovaLogo size={20} variant="radiant" />
                      <span className="font-bold text-white font-display">GLOVA COHORT</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#FDE68A]">CEFR A1-C2 Curriculum</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Horizontal Glowing Horizon Line */}
      <div className="gaming-horizon-line w-full opacity-60" />

      {/* =====================================================================
          2. THE LEARNING ARENA: UNIFIED PANORAMIC STAGE (Anti-Card Architecture)
          (Inspired by BorisWick Esports Arena: Single Cinematic Stage + Switchable Dock)
          ===================================================================== */}
      <section id="arena" className="py-20 lg:py-28 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
              {isEn ? 'THE THREE TRIALS' : '3 เสาหลักแห่งการเรียนรู้'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {isEn ? 'THE LEARNING ARENA' : 'สมรภูมิพัฒนาภาษาอังกฤษ'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Switch between the three core pillars of Glova. Select an arena mode below to inspect its mechanics.'
                : 'สลับเลือกชม 3 โหมดหลักของ Glova สัมผัสความแม่นยำของระบบประลองความเร็ว คลังคำศัพท์ และการจำลองสอบ'}
            </p>
          </div>

          {/* Interactive Arena Mode Selector Dock (BorisWick Style) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setActivePillar('arena')}
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activePillar === 'arena'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-[#FDE68A]'
                  : 'bg-[#0B1224]/80 text-slate-400 hover:text-white border border-white/10 hover:border-[#F59E0B]/40'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>{isEn ? 'Speed Arena (4s)' : 'สังเวียนประลอง 4 วิ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePillar('vocab')}
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activePillar === 'vocab'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-[#FDE68A]'
                  : 'bg-[#0B1224]/80 text-slate-400 hover:text-white border border-white/10 hover:border-[#F59E0B]/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? '3,860 Words' : 'คลังคำศัพท์ A1-C2'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePillar('exam')}
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activePillar === 'exam'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-[#FDE68A]'
                  : 'bg-[#0B1224]/80 text-slate-400 hover:text-white border border-white/10 hover:border-[#F59E0B]/40'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isEn ? 'Cambridge Vault' : 'คลังข้อสอบจำลอง'}</span>
            </button>
          </div>

          {/* Unified Panoramic Arena Showcase (One expansive cinematic stage, NO 3 fragmented boxes) */}
          <div className="relative rounded-[32px] overflow-hidden border border-[#F59E0B]/30 bg-gradient-to-b from-[#0B132B]/80 via-[#070B16] to-[#03060E] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 sm:p-10 lg:p-14">
            
            {/* Ambient Backlight for active mode */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F59E0B]/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: 3D Game Artwork Stage */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border border-[#F59E0B]/30 shadow-[0_0_40px_rgba(245,158,11,0.2)] bg-[#040711]">
                  <img
                    src={activePillarData.image}
                    alt={activePillarData.alt}
                    className="w-full h-full object-cover transition-all duration-500 scale-100 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#070B14]/90 border border-[#F59E0B]/40 font-bold text-[10px] tracking-wider text-[#FDE68A]">
                    {activePillarData.tag}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Arena Mechanics & Trigger */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                      {activePillarData.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display">
                    {activePillarData.title}
                  </h3>
                  <p className="text-sm font-semibold text-[#FDE68A]">
                    {activePillarData.headline}
                  </p>
                </div>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {activePillarData.desc}
                </p>

                {/* Direct Telemetry Row */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  {activePillarData.stats.map((st) => (
                    <div key={st.label} className="space-y-1">
                      <span className="text-xl sm:text-2xl font-black text-white font-display">{st.val}</span>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">{st.label}</p>
                    </div>
                  ))}
                </div>

                {/* Direct Launch Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => router.push(activePillarData.route)}
                    className="glova-gold-btn px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-3 cursor-pointer select-none"
                  >
                    <span>{activePillarData.btnText}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Horizontal Glowing Horizon Line */}
      <div className="gaming-horizon-line w-full opacity-60" />

      {/* =====================================================================
          3. GLOVA XP & REWARD SYSTEM: OPEN PANORAMA (NO Boxed Card Wrapper)
          (Seamless 50/50 ambient layout resting directly on the ground)
          ===================================================================== */}
      <section className="py-20 lg:py-28 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: 3D Safe Vault with Glowing Pedestal */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Glowing Floor Pedestal */}
              <div className="absolute w-[400px] h-[400px] bg-gradient-to-t from-[#F59E0B]/25 via-[#F59E0B]/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative group">
                <img
                  src="/assets/dribbble-safe-coins.jpg"
                  alt="Glova 3D Safe Vault with Golden Achievement Stars"
                  className="relative z-10 w-full max-w-[420px] rounded-3xl drop-shadow-[0_20px_45px_rgba(245,158,11,0.45)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right: Typography, Metrics & Direct Trigger */}
            <div className="lg:col-span-7 space-y-7">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                  {isEn ? 'RETENTION & MOTIVATION' : 'ระบบรางวัลและค่าประสบการณ์'}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-display">
                  {isEn ? (
                    <>EARN GLOVA XP WITH <br /><ShinyText>PROVEN ACCURACY</ShinyText></>
                  ) : (
                    <>สะสมคะแนน XP ด้วย <br /><ShinyText>ความรู้ที่แม่นยำ</ShinyText></>
                  )}
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  {isEn
                    ? 'Every completed diagnostic node, speed duel victory, and spaced repetition review yields verified Glova XP. Level up your profile and unlock official Cambridge Mock exam passes and personalized diagnostic dossiers.'
                    : 'ทุกข้อที่ตอบถูกในการฝึกฝน การชนะดวลความเร็ว และการทบทวน Spaced Repetition จะมอบเหรียญ Glova XP สำหรับปลดล็อกชุดข้อสอบจำลอง Cambridge เสมือนจริง'}
                </p>
              </div>

              {/* 3 Metric Columns with sleek vertical dividers */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <span className="font-extrabold text-3xl sm:text-4xl text-[#FDE68A] font-display">3,860</span>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'CEFR Words' : 'คำศัพท์สากล'}</p>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6">
                  <span className="font-extrabold text-3xl sm:text-4xl text-[#FDE68A] font-display">4.95</span>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'Learner Rating' : 'คะแนนรีวิว'}</p>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6">
                  <span className="font-extrabold text-3xl sm:text-4xl text-[#FDE68A] font-display">100%</span>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'Exam Fidelity' : 'ตรงข้อสอบจริง'}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="glova-gold-btn px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-3 cursor-pointer select-none"
                >
                  <Trophy className="w-4 h-4 text-white" />
                  <span>{isEn ? 'START ASSESSMENT' : 'เริ่มทดสอบวัดระดับ'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Horizontal Glowing Horizon Line */}
      <div className="gaming-horizon-line w-full opacity-60" />

      {/* =====================================================================
          4. TOP LEARNERS: TOURNAMENT PODIUM (Anti-Card Architecture)
          (True Olympic/Esports Podium: #1 elevated in center with gold pedestal, NO 3 rectangular boxes)
          ===================================================================== */}
      <section id="achievements" className="py-20 lg:py-28 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
              {isEn ? 'HALL OF FAME' : 'ทำเนียบเกียรติยศ'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {isEn ? 'TOP GLOVA LEARNERS' : 'ทำเนียบผู้เรียนดีเด่น'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Meet university scholars who elevated their CEFR proficiency bands through Glova daily practice.'
                : 'ทำความรู้จักกับตัวแทนผู้เรียนที่พัฒนาทักษะภาษาอังกฤษและทำคะแนนสูงสุดผ่านการฝึกฝนบน Glova'}
            </p>
          </div>

          {/* Tournament Podium Layout: Center elevated (#1 Gold), Left (#2 Silver), Right (#3 Bronze) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
            
            {/* Rank #2: Silver Podium (Tanawat K.) */}
            <div className="order-2 md:order-1 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-[0_0_20px_rgba(148,163,184,0.4)]">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                    alt="Tanawat K."
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-[#070B14] border border-slate-400 text-[10px] font-black text-slate-200">
                  RANK #2
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white font-display">Tanawat K.</h3>
                <p className="text-xs font-semibold text-slate-300">
                  {isEn ? 'Thammasat University · B2 Vantage' : 'มหาวิทยาลัยธรรมศาสตร์ · CEFR B2'}
                </p>
                <p className="text-[11px] text-slate-400">Diamond Division · 12,450 XP</p>
              </div>

              <p className="text-xs text-slate-300 italic max-w-xs leading-relaxed px-3">
                "{isEn
                  ? 'Acoustic Speaking Lab gave me instant feedback on syllable stress. My presentation fluency jumped two CEFR bands.'
                  : 'ห้องปฏิบัติการพูดช่วยจับจังหวะการเน้นเสียงพยางค์ได้อย่างแม่นยำ ความมั่นใจในการพูดเพิ่มขึ้นอย่างเห็นได้ชัด'}"
              </p>

              {/* Silver Step Pedestal */}
              <div className="w-full h-16 rounded-t-xl podium-pedestal-silver flex items-center justify-center">
                <span className="font-black text-slate-400 text-xl font-display">2ND PLACE</span>
              </div>
            </div>

            {/* Rank #1: Gold Center Elevated Podium (Ploypailin S.) */}
            <div className="order-1 md:order-2 flex flex-col items-center text-center space-y-4 -translate-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-[#B45309] via-[#F59E0B] to-[#FDE68A] shadow-[0_0_35px_rgba(245,158,11,0.6)]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="Ploypailin S."
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -top-3 inset-x-0 mx-auto w-max flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#F59E0B] text-[#0A0F1D] text-[10px] font-black uppercase tracking-wider shadow-md">
                  <Crown className="w-3 h-3 text-[#0A0F1D]" />
                  <span>CHAMPION</span>
                </div>
                <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-[#070B14] border border-[#F59E0B] text-[11px] font-black text-[#FDE68A]">
                  RANK #1
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-2xl text-white font-display">Ploypailin S.</h3>
                <p className="text-xs font-bold text-[#F59E0B] uppercase tracking-wide">
                  {isEn ? 'Chulalongkorn University · C1 Advanced' : 'จุฬาลงกรณ์มหาวิทยาลัย · CEFR C1'}
                </p>
                <p className="text-[11px] text-slate-300">Grandmaster Division · 14,820 XP</p>
              </div>

              <p className="text-xs text-slate-200 italic max-w-xs leading-relaxed px-3">
                "{isEn
                  ? 'The 4-second speed duels transformed my vocabulary recall. Passed my Cambridge FCE exam with 182 score!'
                  : 'การดวลศัพท์ 4 วินาทีทำให้จำศัพท์ได้แม่นยำและตอบสนองเร็วขึ้นมาก สอบ Cambridge FCE ได้คะแนนถึง 182!'}"
              </p>

              {/* Gold Step Pedestal */}
              <div className="w-full h-24 rounded-t-xl podium-pedestal-gold flex items-center justify-center">
                <span className="font-black text-[#FDE68A] text-2xl font-display">1ST PLACE</span>
              </div>
            </div>

            {/* Rank #3: Bronze Podium (Nattamon R.) */}
            <div className="order-3 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#92400E] to-[#D97706] shadow-[0_0_20px_rgba(217,119,6,0.35)]">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
                    alt="Nattamon R."
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-[#070B14] border border-[#D97706] text-[10px] font-black text-[#FDE68A]">
                  RANK #3
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white font-display">Nattamon R.</h3>
                <p className="text-xs font-semibold text-amber-300">
                  {isEn ? 'Mahidol University · C2 Mastery' : 'มหาวิทยาลัยมหิดล · CEFR C2'}
                </p>
                <p className="text-[11px] text-slate-400">Platinum Division · 11,200 XP</p>
              </div>

              <p className="text-xs text-slate-300 italic max-w-xs leading-relaxed px-3">
                "{isEn
                  ? 'Zero guesswork, zero AI hallucinations. Real Cambridge exam timing and verified Oxford collocations.'
                  : 'ไม่มีการเดาสุ่ม ข้อมูลอิงตามกรอบมาตรฐาน Cambridge และ Oxford ความถูกต้อง 100%'}"
              </p>

              {/* Bronze Step Pedestal */}
              <div className="w-full h-12 rounded-t-xl podium-pedestal-copper flex items-center justify-center">
                <span className="font-black text-[#D97706] text-xl font-display">3RD PLACE</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Horizontal Glowing Horizon Line */}
      <div className="gaming-horizon-line w-full opacity-60" />

      {/* =====================================================================
          5. 8 GLOVA LEARNING STUDIOS: GAMING MATCH/MODE BROWSER
          (Inspired by BorisWick Esports Mode Finder: Category Filter + Stream List, NO 8-card grid)
          ===================================================================== */}
      <section id="studios" className="py-20 lg:py-28 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                {isEn ? 'CURRICULUM TERMINAL' : 'คลังสตูดิโอการเรียนรู้'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                {isEn ? '8 LEARNING STUDIOS' : 'สตูดิโอฝึกฝนทักษะทั้ง 8'}
              </h2>
            </div>
            
            {/* Category Filter Pills (BorisWick Match Finder Style) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1224] border border-white/10 flex-wrap">
              {[
                { id: 'all', label: isEn ? 'All (8)' : 'ทั้งหมด (8)' },
                { id: 'arena', label: isEn ? 'Arena 4s' : 'ประลอง 4 วิ' },
                { id: 'foundation', label: isEn ? 'Foundation' : 'พื้นฐาน A1-B1' },
                { id: 'advanced', label: isEn ? 'Advanced' : 'ระดับสูง B2-C2' },
                { id: 'exam', label: isEn ? 'Exam Vault' : 'ข้อสอบจำลอง' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStudioCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    studioCategory === cat.id
                      ? 'bg-[#F59E0B] text-[#0A0F1D] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* High-Density Interactive Mode Stream (Clean rows, ZERO card boxes!) */}
          <div className="rounded-2xl border border-white/10 bg-[#070B16]/90 divide-y divide-white/5 overflow-hidden">
            {filteredStudios.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(s.route)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#F59E0B] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
                    {s.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-white group-hover:text-[#FDE68A] transition-colors font-display">
                        {isEn ? s.nameEn : s.nameTh}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${s.accent}`}>
                        {s.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {isEn ? s.descEn : s.descTh}
                    </p>
                  </div>
                </div>

                {/* Right: Telemetry & Launch Action */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-[#F59E0B]">{s.time}</p>
                    <p className="text-[10px] text-slate-500">{s.activeUsers}</p>
                  </div>
                  <div className="glova-gold-btn px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                    <span>{isEn ? 'LAUNCH' : 'เข้าเรียน'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Horizontal Glowing Horizon Line */}
      <div className="gaming-horizon-line w-full opacity-60" />

      {/* =====================================================================
          6. COMMUNITY GUILD BANNER: CLEAN PANORAMIC CALLOUT
          ===================================================================== */}
      <section id="community" className="py-20 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <Users className="w-4 h-4 text-[#FDE68A]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FDE68A]">
                {isEn ? 'JOIN OVER 25,000 LEARNERS' : 'ร่วมเรียนรู้กับเพื่อนกว่า 25,000 คน'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {isEn ? 'NEVER LEARN ENGLISH ALONE' : 'ฝึกฝนร่วมกัน เก่งภาษาอังกฤษไปด้วยกัน'}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {isEn
                ? 'Join university study cohorts, compete in weekly vocabulary tournaments, and practice speaking together in real time.'
                : 'ร่วมกลุ่มติวภาษาอังกฤษระดับมหาวิทยาลัย แข่งขันประลองคำศัพท์ประจำสัปดาห์ และฝึกสนทนาร่วมกับเพื่อนๆ ทั่วประเทศ'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleStart}
                className="glova-gold-btn w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
              >
                {isEn ? 'START FREE ASSESSMENT' : 'เริ่มทดสอบฟรีทันที'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/social')}
                className="glova-silver-btn w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
              >
                {isEn ? 'EXPLORE COMMUNITY' : 'สำรวจคอมมูนิตี้ผู้เรียน'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          7. GLOVA FOOTER
          ===================================================================== */}
      <footer className="border-t border-white/10 bg-[#02040A] py-14 text-xs text-slate-400">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <GlovaLogo size={32} variant="radiant" ariaLabel="Glova Logo" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight font-display">
                  Glova<span className="text-[#F59E0B]">.</span>
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  · CEFR English Platform
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 uppercase text-[11px] tracking-wider text-slate-400">
              <button type="button" onClick={() => scrollToSection('overview')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Overview' : 'ภาพรวม'}
              </button>
              <button type="button" onClick={() => scrollToSection('arena')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Arena Stage' : 'สนามประลอง'}
              </button>
              <button type="button" onClick={() => scrollToSection('studios')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? '8 Studios' : '8 สตูดิโอ'}
              </button>
              <button type="button" onClick={() => scrollToSection('achievements')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Top Learners' : 'ทำเนียบผู้เรียน'}
              </button>
              <button type="button" onClick={() => router.push('/mock-exams')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Cambridge Exams' : 'ข้อสอบจำลอง'}
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Glova. Official Cambridge CEFR English Preparation Platform.</p>
            <p>{isEn ? 'Inspired by BorisWick Esports & Knightopia Canvas' : 'สถาปัตยกรรมภาพผสานระบบ BorisWick Esports และ Knightopia Canvas'}</p>
          </div>
        </div>
      </footer>

      {/* Quick 3-Minute English Check Modal Overlay */}
      {isDiagnosticOpen && (
        <QuickEnglishCheck
          isOpen={isDiagnosticOpen}
          onClose={() => setIsDiagnosticOpen(false)}
          onComplete={(result) => {
            setIsDiagnosticOpen(false);
            router.push('/');
          }}
        />
      )}
    </div>
  );
};
