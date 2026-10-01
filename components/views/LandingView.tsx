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
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';
import { GlovaLogo } from '../ui/GlovaLogo';

interface LandingViewProps {
  onStartLearning?: () => void;
}

// React Bits inspired Shiny Text Component
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

  // The 8 Glova Learning Studios
  const studios = [
    {
      id: 'vocabulary',
      nameEn: 'CEFR Vocabulary Vault',
      nameTh: 'คลังคำศัพท์ CEFR 3,860 คำ',
      level: 'A1 - C2',
      timeEn: '5-10 Mins / day',
      timeTh: '5-10 นาที / วัน',
      descEn: 'Master high-frequency vocabulary with spaced repetition, contextual collocations, and native audio.',
      descTh: 'เรียนรู้คำศัพท์ความถี่สูงตามระดับ A1-C2 พร้อมระบบทบทวน Spaced Repetition และตัวอย่างประโยคใช้งานจริง',
      icon: <BookOpen className="w-5 h-5 text-[#FDE68A]" />,
      route: '/vocabulary',
      badge: '3,860 Words',
    },
    {
      id: 'compete',
      nameEn: 'Ranked Speed Clash Arena',
      nameTh: 'ประลองคำศัพท์ 4 วินาที (MMR)',
      level: 'Real-Time Battle',
      timeEn: '4s per round',
      timeTh: '4 วินาที / ข้อ',
      descEn: 'Fast-paced reflex challenges against university peers. Climb divisions from Bronze to Grandmaster.',
      descTh: 'ท้าทายความเร็วและไหวพริบข้อละ 4 วินาที แข่งขันไต่อันดับ MMR กับเพื่อนในระดับมหาวิทยาลัยทั่วประเทศ',
      icon: <Swords className="w-5 h-5 text-[#FDE68A]" />,
      route: '/compete',
      badge: 'PvP Ranked',
    },
    {
      id: 'mockExam',
      nameEn: 'Cambridge Exam Vault',
      nameTh: 'คลังข้อสอบจำลอง Cambridge',
      level: 'KET / PET / FCE',
      timeEn: '45-90 Mins / test',
      timeTh: '45-90 นาที / ชุด',
      descEn: 'Authentic Cambridge exam simulation with countdown timer, auto-scoring, and CEFR band diagnosis.',
      descTh: 'จำลองการทำข้อสอบ KET, PET, FCE เสมือนจริง พร้อมระบบจับเวลาและวิเคราะห์คะแนนเทียบระดับ CEFR',
      icon: <Award className="w-5 h-5 text-[#FDE68A]" />,
      route: '/mock-exams',
      badge: 'Full Mock Test',
    },
    {
      id: 'grammar',
      nameEn: 'Grammar Logic Blueprint',
      nameTh: 'ไวยากรณ์และโครงสร้างประโยค',
      level: 'A1 - C1',
      timeEn: '8-12 Mins / lesson',
      timeTh: '8-12 นาที / บทเรียน',
      descEn: 'Practical sentence patterns, functional tenses, and academic writing structures explained clearly.',
      descTh: 'ทำความเข้าใจ Tenses และโครงสร้างประโยคสำคัญโดยไม่มีสูตรท่องจำที่ซับซ้อน พร้อมแบบฝึกหัดโต้ตอบ',
      icon: <Sparkles className="w-5 h-5 text-[#FDE68A]" />,
      route: '/grammar',
      badge: 'Pattern Logic',
    },
    {
      id: 'speaking',
      nameEn: 'Acoustic Speaking Lab',
      nameTh: 'ห้องปฏิบัติการทักษะการพูด',
      level: 'A2 - C1',
      timeEn: '5-10 Mins / session',
      timeTh: '5-10 นาที / เซสชัน',
      descEn: 'Practice spoken English with acoustic waveform feedback, stress rhythm detection, and fluency metrics.',
      descTh: 'ฝึกสนทนาและออกเสียงพร้อมระบบตรวจจับคลื่นเสียง (Waveform) และจังหวะเน้นเสียง (Stress & Rhythm)',
      icon: <Mic className="w-5 h-5 text-[#FDE68A]" />,
      route: '/speaking',
      badge: 'Waveform AI',
    },
    {
      id: 'listening',
      nameEn: 'Auditory Comprehension Lab',
      nameTh: 'สตูดิโอฝึกการฟังสำเนียงสากล',
      level: 'A1 - C2',
      timeEn: '5-8 Mins / track',
      timeTh: '5-8 นาที / เรื่อง',
      descEn: 'Train auditory comprehension with authentic university dialogues, lectures, and accents.',
      descTh: 'ฝึกฟังบทสนทนาและการบรรยายวิชาการสำเนียงธรรมชาติ พร้อมสคริปต์ถอดเสียงและข้อสอบจับใจความ',
      icon: <Headphones className="w-5 h-5 text-[#FDE68A]" />,
      route: '/listening',
      badge: 'Native Audio',
    },
    {
      id: 'reading',
      nameEn: 'Analytical Reading Lab',
      nameTh: 'ห้องพัฒนาการอ่านเชิงวิเคราะห์',
      level: 'A2 - C2',
      timeEn: '6-10 Mins / passage',
      timeTh: '6-10 นาที / บทความ',
      descEn: 'Sharpen skimming, scanning, and deep comprehension across authentic academic and journalistic texts.',
      descTh: 'ฝึกเทคนิคการอ่าน Skimming, Scanning และการคิดวิเคราะห์จากบทความวิชาการและข่าวสากล',
      icon: <BookMarked className="w-5 h-5 text-[#FDE68A]" />,
      route: '/reading',
      badge: 'Academic Text',
    },
    {
      id: 'writing',
      nameEn: 'Academic Writing Studio',
      nameTh: 'สตูดิโอพัฒนาการเขียนเชิงวิชาการ',
      level: 'B1 - C2',
      timeEn: '10-15 Mins / prompt',
      timeTh: '10-15 นาที / หัวข้อ',
      descEn: 'Structure academic essays and official emails with automated coherence and cohesion evaluations.',
      descTh: 'ฝึกเขียน Essay และอีเมลทางการ พร้อมระบบประเมินความสอดคล้องและการเชื่อมโยงประโยค',
      icon: <PenTool className="w-5 h-5 text-[#FDE68A]" />,
      route: '/writing',
      badge: 'Cohesion Matrix',
    },
  ];

  // Authentic Glova Top Learners Hall of Fame
  const champions = [
    {
      name: 'Ploypailin S.',
      roleEn: 'Chulalongkorn University · CEFR C1 Advanced',
      roleTh: 'จุฬาลงกรณ์มหาวิทยาลัย · CEFR C1 ขั้นสูง',
      xp: '14,820 XP',
      division: 'Grandmaster Division',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      quoteEn: 'The 4-second speed duels transformed my vocabulary recall. Passed my Cambridge FCE exam with 182 score!',
      quoteTh: 'การดวลศัพท์ 4 วินาทีทำให้จำศัพท์ได้แม่นยำและตอบสนองเร็วขึ้นมาก สอบ Cambridge FCE ได้คะแนนถึง 182!',
    },
    {
      name: 'Tanawat K.',
      roleEn: 'Thammasat University · CEFR B2 Vantage',
      roleTh: 'มหาวิทยาลัยธรรมศาสตร์ · CEFR B2 ระดับกลางสูง',
      xp: '12,450 XP',
      division: 'Diamond Division',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      quoteEn: 'Acoustic Speaking Lab gave me instant feedback on syllable stress. My presentation fluency jumped two whole CEFR bands.',
      quoteTh: 'ห้องปฏิบัติการพูดช่วยจับจังหวะการเน้นเสียงพยางค์ได้อย่างแม่นยำ ความมั่นใจในการพูดเพิ่มขึ้นอย่างเห็นได้ชัด',
    },
    {
      name: 'Nattamon R.',
      roleEn: 'Mahidol University · CEFR C2 Mastery',
      roleTh: 'มหาวิทยาลัยมหิดล · CEFR C2 เชี่ยวชาญสูงสุด',
      xp: '11,200 XP',
      division: 'Platinum Division',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      quoteEn: 'Zero guesswork, zero AI hallucinations. Real Cambridge exam timing and verified Oxford collocations.',
      quoteTh: 'ไม่มีการเดาสุ่ม ข้อมูลอิงตามกรอบมาตรฐาน Cambridge และ Oxford ความถูกต้อง 100%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 selection:bg-[#F59E0B] selection:text-[#040711] overflow-x-hidden font-sans">
      {/* =====================================================================
          1. HERO SECTION: GLOVA CEFR ENGLISH PLATFORM
          (5-Source Visual Engineering: Dark Obsidian Chassis + Gold Rim Aura)
          ===================================================================== */}
      <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#F59E0B]/15">
        {/* Aceternity Style Cosmic Background Beams & Starry Depth */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          {/* Deep Navy/Cyan Radial Aura behind Hero */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-b from-[#0EA5E9]/10 via-[#0B132B]/60 to-transparent rounded-full blur-[140px]" />
          
          {/* Subtle Golden Ray from Top */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F59E0B]/10 rounded-full blur-[160px]" />

          {/* Starlight Star Particles (Aceternity Sparkles effect) */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:36px_36px]" />
        </div>

        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Column: Hero Title & Dual Metallic Beveled CTAs */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 shadow-inner">
                <Crown className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FDE68A]">
                  {isEn ? 'CAMBRIDGE CEFR A1-C2 · GAMIFIED PROFICIENCY PLATFORM' : 'สนามประลองภาษาอังกฤษมาตรฐานสากล CEFR A1-C2'}
                </span>
              </div>

              {/* Main Headline (Clean typography + ShinyText) */}
              <div className="space-y-3">
                <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white tracking-tight leading-[1.06] font-display">
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
                    ? 'Join over 25,000 learners mastering Cambridge CEFR A1-C2 English proficiency. Experience 4-second speed vocabulary duels, Cambridge exam simulations (KET/PET/FCE), and acoustic speaking labs.'
                    : 'ร่วมเรียนรู้กับผู้เรียนกว่า 25,000 คน ฝึกฝนทักษะภาษาอังกฤษตามมาตรฐานสากล CEFR A1-C2 ด้วยการประลองศัพท์ 4 วินาที จำลองสอบ Cambridge เสมือนจริง และห้องวิเคราะห์การพูดด้วยเสียง'}
                </p>
              </div>

              {/* Dual Metallic Beveled Action Buttons (uiverse.io Tactile 3D Buttons) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* Gold Beveled Button: START 3-MINUTE ASSESSMENT */}
                <button
                  type="button"
                  onClick={handleStart}
                  className="glova-gold-btn w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 cursor-pointer select-none"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>{isEn ? 'START 3-MIN ASSESSMENT' : 'เริ่มวัดระดับฟรี 3 นาที'}</span>
                </button>

                {/* Silver Beveled Button: 8 LEARNING STUDIOS */}
                <button
                  type="button"
                  onClick={() => scrollToSection('studios')}
                  className="glova-silver-btn w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <ScrollText className="w-5 h-5 text-[#CBD5E1]" />
                  <span>{isEn ? '8 LEARNING STUDIOS' : 'สำรวจ 8 สตูดิโอ'}</span>
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
              </div>
            </div>

            {/* Right Column: Authentic Glova University Learners Photo */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Outer Golden Portal Frame */}
              <div className="relative w-full max-w-[540px] aspect-[4/5] rounded-3xl p-2 bg-gradient-to-b from-[#F59E0B]/40 via-[#D97706]/20 to-[#0A0F1D] shadow-[0_0_50px_rgba(245,158,11,0.25)] border border-[#FDE68A]/30">
                
                {/* Inner Dark Chamber with Authentic Photography */}
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#040711] flex items-center justify-center">
                  
                  {/* Subtle Blue Glow behind Photo */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.25)_0%,transparent_70%)] animate-pulse" />

                  {/* Real University Students Photography */}
                  <img
                    src="/assets/hero-students-study.jpg"
                    alt="Glova University Students Learning English Together"
                    className="relative z-10 w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                  />

                  {/* Floating Action Badge on Card Corner */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-[#070B14]/90 border border-[#F59E0B]/40 shadow-lg backdrop-blur-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-bold tracking-wider text-[#FDE68A]">
                      LIVE SPEED ARENA ACTIVE
                    </span>
                  </div>

                  {/* Bottom Gradient Overlay for Flawless Integration */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#040711] via-[#040711]/80 to-transparent z-10" />

                  <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-xs text-slate-300 px-3 py-2 rounded-xl bg-[#0B1224]/80 backdrop-blur-md border border-[#F59E0B]/20">
                    <span className="font-bold text-[#FDE68A]">GLOVA ACTIVE COHORT</span>
                    <span className="text-[11px] text-slate-400">CEFR A1-C2 Curriculum</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. THE 3 GLOVA CORE PILLARS (BENTO GRID)
          (Speed Arena, 3,860 Words, Cambridge Vault with 3D Assets)
          ===================================================================== */}
      <section id="arena" className="py-20 lg:py-28 relative border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
              {isEn ? 'THE THREE LEARNING PILLARS' : '3 เสาหลักแห่งการเรียนรู้'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {isEn ? 'CHOOSE YOUR PATHWAY' : 'เลือกเส้นทางพัฒนาภาษาอังกฤษของคุณ'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Discover how Glova combines gamified speed duels, adaptive vocabulary retention, and Cambridge exam standards to accelerate your fluency.'
                : 'ค้นพบวิธีการเรียนรู้แบบผสมผสาน ทั้งการประลองความเร็ว คลังคำศัพท์อัจฉริยะ และการจำลองสอบมาตรฐานสากล'}
            </p>
          </div>

          {/* The 3 Bento Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. 4-SECOND SPEED ARENA (3D Hands Controller Asset) */}
            <div className="glova-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#F59E0B]/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#F59E0B]/20 relative shadow-inner bg-[#0A0F1D]">
                  <img
                    src="/assets/dribbble-hands-controller.jpg"
                    alt="Speed Vocab Arena Controller"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070B14]/85 border border-[#F59E0B]/30 text-[10px] font-bold text-[#FDE68A]">
                    REAL-TIME ARENA
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-extrabold text-2xl text-white group-hover:text-[#FDE68A] transition-colors font-display">
                    4-SECOND SPEED ARENA
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Test your lexical agility with real-time 4-second duels. Climb university MMR divisions from Bronze to Grandmaster.'
                      : 'ประลองความเร็วและไหวพริบคำศัพท์ข้อละ 4 วินาที ไต่อันดับ MMR แข่งขันกับผู้เรียนในระดับมหาวิทยาลัยทั่วประเทศ'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/compete')}
                className="glova-gold-btn w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
              >
                {isEn ? 'ENTER SPEED ARENA' : 'เข้าสู่สังเวียนประลอง'}
              </button>
            </div>

            {/* 2. ADAPTIVE VOCABULARY VAULT (3D Basket Tools Asset) */}
            <div className="glova-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#F59E0B]/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#F59E0B]/20 relative shadow-inner bg-[#0A0F1D] flex items-center justify-center">
                  <img
                    src="/assets/dribbble-basket-tools.jpg"
                    alt="Study Tools and Vocabulary Vault"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070B14]/85 border border-[#F59E0B]/30 text-[10px] font-bold text-[#FDE68A]">
                    CORE VOCABULARY
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-extrabold text-2xl text-white group-hover:text-[#FDE68A] transition-colors font-display">
                    3,860 CEFR WORDS
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Master high-frequency vocabulary calibrated across A1 to C2 with smart spaced repetition, collocations, and native audio.'
                      : 'เรียนรู้คำศัพท์ความถี่สูงตามระดับ A1-C2 พร้อมระบบทบทวน Spaced Repetition และตัวอย่างประโยคใช้งานจริง'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/vocabulary')}
                className="glova-gold-btn w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
              >
                {isEn ? 'EXPLORE VOCABULARY' : 'สำรวจคลังคำศัพท์'}
              </button>
            </div>

            {/* 3. CAMBRIDGE EXAM SIMULATION (3D Gift Box Asset) */}
            <div className="glova-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#F59E0B]/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#F59E0B]/20 relative shadow-inner bg-[#0A0F1D]">
                  <img
                    src="/assets/dribbble-gift-box.jpg"
                    alt="Cambridge Exam Rewards and Vault"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070B14]/85 border border-[#F59E0B]/30 text-[10px] font-bold text-[#FDE68A]">
                    EXAM SIMULATION
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-extrabold text-2xl text-white group-hover:text-[#FDE68A] transition-colors font-display">
                    CAMBRIDGE EXAM VAULT
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Full-fidelity countdown simulations for KET, PET, and FCE with authentic scoring rubrics, question formats, and diagnostic dossiers.'
                      : 'จำลองการทำข้อสอบ KET, PET, FCE เสมือนจริง พร้อมระบบจับเวลาและวิเคราะห์คะแนนเทียบระดับ CEFR ละเอียดครบทุกพาร์ต'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/mock-exams')}
                className="glova-gold-btn w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
              >
                {isEn ? 'TAKE MOCK EXAM' : 'เข้าสู่คลังข้อสอบจำลอง'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          3. GLOVA XP & LEARNING RETENTION ECONOMY
          (Showcasing 3D Safe Vault & Golden Star Coins)
          ===================================================================== */}
      <section className="py-20 relative bg-gradient-to-b from-[#040711] via-[#091024] to-[#040711] border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glova-card rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#F59E0B]/30 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: 3D Safe Vault with Coins Asset */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative group">
                  {/* Amber Glow Underlay */}
                  <div className="absolute inset-0 bg-[#F59E0B]/30 rounded-full blur-[70px] group-hover:bg-[#F59E0B]/50 transition-colors" />
                  
                  <img
                    src="/assets/dribbble-safe-coins.jpg"
                    alt="Glova 3D Safe Vault with Golden Achievement Stars"
                    className="relative z-10 w-full max-w-[380px] rounded-2xl drop-shadow-[0_15px_35px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Right Column: Economics of Knowledge & Transparent Metrics */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                    {isEn ? 'LEARNING RETENTION & REWARD SYSTEM' : 'ระบบรางวัลและค่าประสบการณ์'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-display">
                    {isEn ? (
                      <>EARN GLOVA XP WITH <br /><ShinyText>PROVEN ACCURACY</ShinyText></>
                    ) : (
                      <>สะสมคะแนน XP ด้วย <br /><ShinyText>ความรู้ที่แม่นยำ</ShinyText></>
                    )}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {isEn
                      ? 'Every completed diagnostic node, speed duel victory, and spaced repetition review yields verified Glova XP. Level up your profile and unlock official Cambridge Mock exam passes and personalized diagnostic dossiers.'
                      : 'ทุกข้อที่ตอบถูกในการฝึกฝน การชนะดวลความเร็ว และการทบทวน Spaced Repetition จะมอบเหรียญ Glova XP สำหรับปลดล็อกชุดข้อสอบจำลอง Cambridge เสมือนจริง'}
                  </p>
                </div>

                {/* 3 Metric Pillars */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#F59E0B]/20">
                  <div className="space-y-1">
                    <span className="font-extrabold text-2xl sm:text-3xl text-[#FDE68A] font-display">3,860</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'CEFR Words' : 'คำศัพท์สากล'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-2xl sm:text-3xl text-[#FDE68A] font-display">4.95</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'Learner Rating' : 'คะแนนรีวิว'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-2xl sm:text-3xl text-[#FDE68A] font-display">100%</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'Exam Fidelity' : 'ตรงข้อสอบจริง'}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="glova-gold-btn px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Trophy className="w-4 h-4 text-white" />
                    <span>{isEn ? 'START ASSESSMENT' : 'เริ่มทดสอบวัดระดับ'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          4. TOP LEARNERS HALL OF FAME
          (Real University Students with Verified CEFR Achievements)
          ===================================================================== */}
      <section id="achievements" className="py-20 lg:py-28 relative border-b border-[#F59E0B]/15">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {champions.map((champ, idx) => (
              <div
                key={champ.name}
                className="glova-card rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col items-center text-center relative group hover:border-[#F59E0B]/60 transition-all duration-300"
              >
                {/* Double Gold Ring Avatar Container */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#B45309] via-[#F59E0B] to-[#FDE68A] shadow-[0_0_25px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-shadow">
                    <img
                      src={champ.avatar}
                      alt={champ.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-[#070B14] border border-[#F59E0B] text-[10px] font-black text-[#FDE68A]">
                    RANK #{idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="font-bold text-xl text-white group-hover:text-[#FDE68A] transition-colors font-display">
                    {champ.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                    {isEn ? champ.roleEn : champ.roleTh}
                  </p>
                  <p className="text-[11px] text-slate-400">{champ.division} · {champ.xp}</p>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed pt-2 border-t border-white/10">
                  "{isEn ? champ.quoteEn : champ.quoteTh}"
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================================
          5. 8 GLOVA LEARNING STUDIOS CATALOG
          ===================================================================== */}
      <section id="studios" className="py-20 lg:py-28 relative border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                {isEn ? 'CURRICULUM ECOSYSTEM' : 'ระบบนิเวศหลักสูตร'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                {isEn ? '8 GLOVA LEARNING STUDIOS' : 'สตูดิโอฝึกฝนทักษะทั้ง 8'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="glova-gold-btn px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider self-start md:self-auto cursor-pointer"
            >
              {isEn ? 'START ASSESSMENT' : 'ทำแบบทดสอบฟรี'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studios.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(s.route)}
                className="glova-card rounded-2xl p-6 space-y-5 cursor-pointer group hover:border-[#F59E0B]/70 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[#0F172A] border border-[#F59E0B]/30 flex items-center justify-center group-hover:border-[#F59E0B] transition-colors">
                      {s.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F59E0B]/15 text-[#FDE68A] border border-[#F59E0B]/30">
                      {s.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base text-white group-hover:text-[#FDE68A] transition-colors font-display">
                      {isEn ? s.nameEn : s.nameTh}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {isEn ? s.descEn : s.descTh}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-[#F59E0B]">{isEn ? s.timeEn : s.timeTh}</span>
                  <div className="flex items-center gap-1 text-[#FDE68A] group-hover:translate-x-1 transition-transform">
                    <span className="font-bold text-[11px]">{isEn ? 'ENTER' : 'เข้าเรียน'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================================
          6. COMMUNITY BANNER
          ===================================================================== */}
      <section id="community" className="py-20 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glova-card rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-[#F59E0B]/40 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30">
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
      <footer className="border-t border-[#F59E0B]/20 bg-[#02040A] py-14 text-xs text-slate-400">
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
                {isEn ? 'Speed Arena' : 'สนามประลอง'}
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
            <p>{isEn ? 'Gamified 5-Source Design Engine Verified' : 'รับรองด้วยระบบออกแบบ 5 แหล่งมาตรฐานระดับสากล'}</p>
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
