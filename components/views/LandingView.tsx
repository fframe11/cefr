'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Clock,
  Heart,
  Swords,
  Flame,
  Layers,
  Play,
  Zap,
  TrendingUp,
  Target,
  Trophy,
  Users,
  Check,
  Star,
  Mail,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Shield,
  Crown,
  ScrollText,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

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
      className={`inline-block bg-[linear-gradient(110deg,#F59E0B,40%,#FFFBEB,50%,#F59E0B)] bg-[length:200%_100%] animate-rune-shine bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [selectedStudioIdx, setSelectedStudioIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'clash' | 'rebirth' | 'treasury'>('clash');

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

  // The 8 Studios of the Realm
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
  ];

  // Champions of the Realm (Hall of Fame Roster matching Shakuro's golden avatars)
  const champions = [
    {
      name: 'Ted Davis',
      roleEn: 'Grandmaster Champion',
      roleTh: 'แชมเปี้ยนระดับแกรนด์มาสเตอร์',
      xp: '14,820 XP',
      division: 'Realm Apex',
      avatar: '/assets/rune-avatar-1.png',
      quoteEn: 'Crushed over 1,420 words in speed duels. The grammar blueprints made PET preparation effortless.',
      quoteTh: 'พิชิตคำศัพท์มากกว่า 1,420 คำในสังเวียนประลองความเร็ว โครงสร้างไวยากรณ์ช่วยให้สอบ PET ผ่านฉลุย',
    },
    {
      name: 'Rodrigo Pascoal',
      roleEn: 'CEFR C2 Archon',
      roleTh: 'ผู้ชำนาญการ CEFR C2',
      xp: '12,450 XP',
      division: 'Emerald Keep',
      avatar: '/assets/rune-avatar-2.png',
      quoteEn: 'The acoustic speaking lab fixed my pronunciation rhythm. Certified C2 band on first attempt.',
      quoteTh: 'ห้องปฏิบัติการเสียงช่วยปรับจังหวะการออกเสียงให้เป็นธรรมชาติ สอบผ่านระดับ C2 ได้ในครั้งแรก',
    },
    {
      name: 'Valnei Sanderson',
      roleEn: 'Lead Arena Dev & Scholar',
      roleTh: 'นักรบผู้เชี่ยวชาญการจำลองสอบ',
      xp: '11,200 XP',
      division: 'Cobalt Citadel',
      avatar: '/assets/rune-avatar-3.png',
      quoteEn: 'Zero guesswork, zero AI hallucinations. Real Cambridge exam timing and verified Oxford collocations.',
      quoteTh: 'ไม่มีการเดาสุ่ม ข้อมูลอิงตามกรอบมาตรฐาน Cambridge และ Oxford ความถูกต้อง 100%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 selection:bg-[#F59E0B] selection:text-[#040711] overflow-x-hidden font-sans">
      {/* =====================================================================
          1. HERO SECTION: "WELCOME TO RUNE REALMS"
          (Shakuro Dribbble Masterpiece: Dark Cosmic Atmosphere + Hero Warrior Breakthrough)
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
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FDE68A] font-rune">
                  {isEn ? 'CEFR ENGLISH REALMS · GAMIFIED ARENA' : 'สนามประลองภาษาอังกฤษมาตรฐาน CEFR'}
                </span>
              </div>

              {/* Main Epic Roman Title (Cinzel Font + ShinyText) */}
              <div className="space-y-3">
                <h1 className="font-rune font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white tracking-tight leading-[1.06]">
                  {isEn ? (
                    <>
                      WELCOME TO <br />
                      <ShinyText className="tracking-wide">RUNE REALMS</ShinyText>
                    </>
                  ) : (
                    <>
                      ยินดีต้อนรับสู่ <br />
                      <ShinyText className="tracking-wide">RUNE REALMS</ShinyText>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {isEn
                    ? 'Join realm and clan wars for amazing rewards and establish your legacy. Master 3,860 Cambridge & Oxford CEFR terms with real-time speed duels.'
                    : 'เข้าร่วมศึกประลองทักษะภาษาอังกฤษ ชิงรางวัลและสร้างเกียรติยศแห่งกิลด์ ฝึกฝนคำศัพท์ตามมาตรฐานสากล A1-C2 ครบ 3,860 คำ พร้อมระบบดวลความเร็วแบบเรียลไทม์'}
                </p>
              </div>

              {/* Dual Metallic Beveled Action Buttons (uiverse.io Tactile 3D Buttons) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* Gold Beveled Button: PLAY NOW */}
                <button
                  type="button"
                  onClick={handleStart}
                  className="rune-gold-btn w-full sm:w-auto px-8 py-4 rounded-lg font-rune font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 cursor-pointer select-none"
                >
                  <Swords className="w-5 h-5 text-white" />
                  <span>{isEn ? 'PLAY NOW' : 'เริ่มเล่นทันที'}</span>
                </button>

                {/* Silver Beveled Button: DOCUMENTS / SYLLABUS */}
                <button
                  type="button"
                  onClick={() => scrollToSection('studios')}
                  className="rune-silver-btn w-full sm:w-auto px-8 py-4 rounded-lg font-rune font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <ScrollText className="w-5 h-5 text-[#CBD5E1]" />
                  <span>{isEn ? 'DOCUMENTS' : 'คลังหลักสูตร'}</span>
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

            {/* Right Column: Hero Dwarf Warrior Artwork Breakthrough */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Outer Golden Rune Portal Frame */}
              <div className="relative w-full max-w-[540px] aspect-[4/5] rounded-3xl p-2 bg-gradient-to-b from-[#F59E0B]/40 via-[#D97706]/20 to-[#0A0F1D] shadow-[0_0_50px_rgba(245,158,11,0.25)] border border-[#FDE68A]/30">
                
                {/* Inner Dark Chamber with Backdrop Graphic */}
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#040711] flex items-center justify-center">
                  
                  {/* Magic Blue Nordic Sigil behind Warrior */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.35)_0%,transparent_70%)] animate-pulse" />

                  {/* High-Resolution Dwarf Warrior Artwork */}
                  <img
                    src="/assets/rune-hero-warrior.png"
                    alt="Rune Realms Warrior Champion"
                    className="relative z-10 w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-500 select-none pointer-events-none"
                  />

                  {/* Floating Action Badge on Card Corner */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-[#070B14]/90 border border-[#F59E0B]/40 shadow-lg backdrop-blur-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-rune text-[11px] font-bold tracking-wider text-[#FDE68A]">
                      LIVE DUEL ACTIVE
                    </span>
                  </div>

                  {/* Bottom Gradient Overlay for Flawless Integration */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#040711] via-[#040711]/80 to-transparent z-10" />

                  <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-xs text-slate-300 px-3 py-2 rounded-xl bg-[#0B1224]/80 backdrop-blur-md border border-[#F59E0B]/20">
                    <span className="font-rune font-bold text-[#FDE68A]">CHAMPION ARCHETYPE</span>
                    <span className="text-[11px] text-slate-400">Level 85 Archon</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. THE 3 RUNE PILLARS: CLASH, STAY TUNED, REBIRTH
          (Exact Authentic Assets from Shakuro Rune Realms Shot)
          ===================================================================== */}
      <section id="clash" className="py-20 lg:py-28 relative border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-rune text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
              {isEn ? 'THE THREE TRIALS' : '3 สมรภูมิแห่งการเรียนรู้'}
            </span>
            <h2 className="font-rune text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {isEn ? 'CHOOSE YOUR PATHWAY' : 'เลือกเส้นทางสู่ความเป็นเลิศ'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Conquer the three pillars of Rune Realms to forge your English mastery into an unbreakable weapon.'
                : 'พิชิตสมรภูมิทั้งสามของ Rune Realms เพื่อหลอมรวมทักษะภาษาอังกฤษให้เฉียบคมพร้อมใช้งานจริง'}
            </p>
          </div>

          {/* The 3 Authentic Bento Pillars (21st.dev + Uiverse Frame Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. CLASH (Norse Speed War & Fortress) */}
            <div className="rune-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#F59E0B]/60 transition-all duration-300">
              <div className="space-y-4">
                {/* 3D Clash Asset Container */}
                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#F59E0B]/20 relative shadow-inner bg-[#0A0F1D]">
                  <img
                    src="/assets/rune-clash.png"
                    alt="Clash Fortress"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070B14]/85 border border-[#F59E0B]/30 font-rune text-[10px] font-bold text-[#FDE68A]">
                    REAL-TIME ARENA
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-rune font-black text-2xl text-white group-hover:text-[#FDE68A] transition-colors">
                    CLASH
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Prepare for a vocabulary war! Customize your knowledge champions, build knowledge armor, and crush peer opponents in 4-second reflex duels.'
                      : 'เตรียมตัวสู่สงครามประลองคำศัพท์! ปรับแต่งตัวละคร สวมใส่เกราะความรู้ และเอาชนะคู่แข่งด้วยไหวพริบความเร็ว 4 วินาที'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/compete')}
                className="rune-gold-btn w-full py-3 rounded-lg font-rune font-bold text-xs uppercase tracking-widest cursor-pointer select-none"
              >
                {isEn ? 'ENTER CLASH ARENA' : 'เข้าสู่สังเวียนประลอง'}
              </button>
            </div>

            {/* 2. STAY TUNED (3D Nordic Airship & Community) */}
            <div className="rune-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#F59E0B]/60 transition-all duration-300">
              <div className="space-y-4">
                {/* 3D Airship Asset Container */}
                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#F59E0B]/20 relative shadow-inner bg-[#0A0F1D] flex items-center justify-center">
                  <img
                    src="/assets/rune-airship.png"
                    alt="Runic Airship"
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070B14]/85 border border-[#F59E0B]/30 font-rune text-[10px] font-bold text-[#FDE68A]">
                    GUILD VESSEL
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-rune font-black text-2xl text-white group-hover:text-[#FDE68A] transition-colors">
                    STAY TUNED
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Connect with scholar players across the realm. Join our Discord community update, meet dev educators, find study allies, and unlock rare guild gifts.'
                      : 'เชื่อมต่อกับเพื่อนผู้เรียนทั่วประเทศ ร่วมคอมมูนิตี้ Discord พบปะทีมผู้พัฒนา ค้นหาพันธมิตรฝึกภาษา และรับของรางวัลพิเศษประจำกิลด์'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToSection('community')}
                className="rune-gold-btn w-full py-3 rounded-lg font-rune font-bold text-xs uppercase tracking-widest cursor-pointer select-none"
              >
                {isEn ? 'JOIN GUILD DISCORD' : 'เข้าร่วมกิลด์ DISCORD'}
              </button>
            </div>

            {/* 3. REBIRTH (3D Frost Golem & Mastery Progression) */}
            <div className="rune-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#F59E0B]/60 transition-all duration-300">
              <div className="space-y-4">
                {/* 3D Ice Golem Asset Container */}
                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#F59E0B]/20 relative shadow-inner bg-[#0A0F1D]">
                  <img
                    src="/assets/rune-golem.png"
                    alt="Frost Golem Guardian"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070B14]/85 border border-[#F59E0B]/30 font-rune text-[10px] font-bold text-[#FDE68A]">
                    TITAN TRIAL
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-rune font-black text-2xl text-white group-hover:text-[#FDE68A] transition-colors">
                    REBIRTH
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Hurry up, Yggdrasil knowledge tree is waiting! Unlock powerful golem guardians with verified CEFR mastery tokens in exchange for $RUNES and certificates.'
                      : 'ร่วมฟื้นฟูพฤกษาแห่งปัญญา Yggdrasil ปลดล็อกการทดสอบการ์เดียนโกเลมด้วยโทเค็นความรู้ เพื่อรับสิทธิ์สอบใบประกาศนียบัตร Cambridge'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="rune-gold-btn w-full py-3 rounded-lg font-rune font-bold text-xs uppercase tracking-widest cursor-pointer select-none"
              >
                {isEn ? 'CLAIM RUNES & CERT' : 'รับเหรียญและวัดระดับ'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          3. RUNE TREASURY & XP ECONOMY: 3D GOLDEN RUNES
          (Showcasing the 3 Gleaming 3D Gold Rune Coins)
          ===================================================================== */}
      <section className="py-20 relative bg-gradient-to-b from-[#040711] via-[#091024] to-[#040711] border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rune-card rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#F59E0B]/30 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: 3D Gleaming Gold Rune Coins */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative group">
                  {/* Intense Amber Glow Underlay */}
                  <div className="absolute inset-0 bg-[#F59E0B]/30 rounded-full blur-[70px] group-hover:bg-[#F59E0B]/50 transition-colors" />
                  
                  <img
                    src="/assets/rune-coins.png"
                    alt="Golden Rune Coins with R seal"
                    className="relative z-10 w-full max-w-[380px] drop-shadow-[0_15px_35px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Right Column: Economics of Knowledge & Transparent Metrics */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <span className="font-rune text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                    {isEn ? 'TOKENOMICS & REWARD SYSTEM' : 'ระบบรางวัลและค่าประสบการณ์'}
                  </span>
                  <h2 className="font-rune text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {isEn ? (
                      <>EARN RUNIC XP WITH <br /><ShinyText>PROVEN ACCURACY</ShinyText></>
                    ) : (
                      <>สะสมค่าพลัง XP ด้วย <br /><ShinyText>ความรู้ที่แม่นยำ</ShinyText></>
                    )}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {isEn
                      ? 'Every completed diagnostic node, speed duel victory, and spaced repetition review yields verified Rune XP. Redeem your tokens for official Cambridge Mock exam passes and personalized diagnostic dossiers.'
                      : 'ทุกข้อที่ตอบถูกในการฝึกฝน การชนะดวลความเร็ว และการทบทวน Spaced Repetition จะมอบเหรียญ Rune XP สำหรับปลดล็อกชุดข้อสอบจำลอง Cambridge เสมือนจริง'}
                  </p>
                </div>

                {/* 3 Metric Pillars */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#F59E0B]/20">
                  <div className="space-y-1">
                    <span className="font-rune font-black text-2xl sm:text-3xl text-[#FDE68A]">3,860</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'CEFR Words' : 'คำศัพท์สากล'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-rune font-black text-2xl sm:text-3xl text-[#FDE68A]">4.95</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'Peer Rating' : 'คะแนนรีวิว'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-rune font-black text-2xl sm:text-3xl text-[#FDE68A]">100%</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{isEn ? 'Exam Fidelity' : 'ตรงข้อสอบจริง'}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="rune-gold-btn px-8 py-3.5 rounded-lg font-rune font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Trophy className="w-4 h-4 text-white" />
                    <span>{isEn ? 'START EARNING RUNES' : 'เริ่มสะสมเหรียญ RUNE'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CHAMPIONS OF THE REALM (HALL OF FAME)
          (Featuring the 3 Golden Ring Avatars from Shakuro Rune Realms Shot)
          ===================================================================== */}
      <section id="leaderboard" className="py-20 lg:py-28 relative border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-rune text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
              {isEn ? 'HALL OF FAME' : 'ทำเนียบเกียรติยศ'}
            </span>
            <h2 className="font-rune text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {isEn ? 'CHAMPIONS OF THE REALM' : 'ผู้พิทักษ์แห่งอาณาจักร'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'Meet the scholars and creators leading the leaderboards across university divisions.'
                : 'ทำความรู้จักกับเหล่านักรบผู้ทำคะแนนสูงสุดในระดับอุดมศึกษา'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {champions.map((champ, idx) => (
              <div
                key={champ.name}
                className="rune-card rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col items-center text-center relative group hover:border-[#F59E0B]/60 transition-all duration-300"
              >
                {/* Double Gold Rune Ring Avatar Container */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#B45309] via-[#F59E0B] to-[#FDE68A] shadow-[0_0_25px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-shadow">
                    <img
                      src={champ.avatar}
                      alt={champ.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-[#070B14] border border-[#F59E0B] font-rune text-[10px] font-black text-[#FDE68A]">
                    RANK #{idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="font-rune font-bold text-xl text-white group-hover:text-[#FDE68A] transition-colors">
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
          5. 8 REALM STUDIOS CATALOG (BENTO GRID SCATTER)
          ===================================================================== */}
      <section id="studios" className="py-20 lg:py-28 relative border-b border-[#F59E0B]/15">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="font-rune text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                {isEn ? 'CURRICULUM ECOSYSTEM' : 'ระบบนิเวศหลักสูตร'}
              </span>
              <h2 className="font-rune text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {isEn ? 'THE REALMS STUDIOS' : 'สตูดิโอฝึกฝนทักษะทั้ง 8'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="rune-gold-btn px-6 py-3 rounded-lg font-rune font-bold text-xs uppercase tracking-widest self-start md:self-auto cursor-pointer"
            >
              {isEn ? 'START ASSESSMENT' : 'ทำแบบทดสอบฟรี'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studios.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(s.route)}
                className="rune-card rounded-2xl p-6 space-y-5 cursor-pointer group hover:border-[#F59E0B]/70 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#0F172A] border border-[#F59E0B]/30 flex items-center justify-center group-hover:border-[#F59E0B] transition-colors">
                    {s.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-rune uppercase tracking-wider bg-[#F59E0B]/15 text-[#FDE68A] border border-[#F59E0B]/30">
                    {s.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-rune font-bold text-lg text-white group-hover:text-[#FDE68A] transition-colors">
                    {isEn ? s.nameEn : s.nameTh}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {isEn ? s.descEn : s.descTh}
                  </p>
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
          6. COMMUNITY GUILD & DISCORD BANNER
          ===================================================================== */}
      <section id="community" className="py-20 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rune-card rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-[#F59E0B]/40 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <Users className="w-4 h-4 text-[#FDE68A]" />
              <span className="font-rune text-[11px] font-bold uppercase tracking-wider text-[#FDE68A]">
                {isEn ? 'JOIN OVER 25,000 SCHOLARS' : 'ร่วมกิลด์กับผู้เรียนกว่า 25,000 คน'}
              </span>
            </div>

            <h2 className="font-rune text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {isEn ? 'NEVER WALK THE REALMS ALONE' : 'ร่วมเดินทางไปด้วยกันในดินแดน RUNE'}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {isEn
                ? 'Join our verified discord server to compete in weekend division tournaments, challenge tutors, and study together with live acoustic practice.'
                : 'เข้าร่วม Discord ประจำสัปดาห์ แข่งขันทัวร์นาเมนต์รายสัปดาห์ สอบถามติวเตอร์ผู้เชี่ยวชาญ และฝึกพูดภาษาอังกฤษสดแบบเรียลไทม์'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleStart}
                className="rune-gold-btn w-full sm:w-auto px-8 py-3.5 rounded-lg font-rune font-bold text-xs uppercase tracking-widest cursor-pointer select-none"
              >
                {isEn ? 'START FREE EXPEDITION' : 'เริ่มทดสอบฟรีทันที'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/social')}
                className="rune-silver-btn w-full sm:w-auto px-8 py-3.5 rounded-lg font-rune font-bold text-xs uppercase tracking-widest cursor-pointer select-none"
              >
                {isEn ? 'EXPLORE GUILDS' : 'สำรวจกิลด์ผู้เรียน'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          7. EPIC NORSE FOOTER
          ===================================================================== */}
      <footer className="border-t border-[#F59E0B]/20 bg-[#02040A] py-14 text-xs text-slate-400">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#F59E0B] to-[#78350F] p-0.5 flex items-center justify-center">
                <div className="w-full h-full rounded-[6px] bg-[#0A0F1D] flex items-center justify-center">
                  <span className="font-rune font-bold text-[#FDE68A]">ᚱ</span>
                </div>
              </div>
              <span className="font-rune font-bold text-base text-white tracking-wider">
                RUNE REALMS · CEFR ENGLISH
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 font-rune uppercase text-[11px] tracking-wider text-slate-400">
              <button type="button" onClick={() => scrollToSection('overview')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Overview' : 'ภาพรวม'}
              </button>
              <button type="button" onClick={() => scrollToSection('clash')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Clash Arena' : 'สนามประลอง'}
              </button>
              <button type="button" onClick={() => scrollToSection('studios')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Studios' : 'สตูดิโอ'}
              </button>
              <button type="button" onClick={() => scrollToSection('leaderboard')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Champions' : 'ทำเนียบแชมป์'}
              </button>
              <button type="button" onClick={() => router.push('/mock-exams')} className="hover:text-[#FDE68A] transition-colors">
                {isEn ? 'Exams' : 'ข้อสอบ'}
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Rune Realms. Production CEFR English & Cambridge Preparation Platform.</p>
            <p>{isEn ? 'Inspired by Shakuro Rune Realms · 5-Source Design Engine Verified' : 'ออกแบบตามแนวคิด Shakuro Rune Realms · รับรองโดยระบบ 5 แหล่งมาตรฐาน'}</p>
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
