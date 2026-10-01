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
  Phone,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

interface LandingViewProps {
  onStartLearning?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [selectedStudioIdx, setSelectedStudioIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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

  // The 8 Studios Catalog for the Interactive "Your Lovely Learning Studio" Section
  const studios = [
    {
      id: 'vocabulary',
      nameEn: 'CEFR Vocabulary Studio',
      nameTh: 'คลังคำศัพท์ CEFR 3,860 คำ',
      level: 'A1 - C2',
      timeEn: '5-10 Mins / day',
      timeTh: '5-10 นาที / วัน',
      rating: '4.95',
      reviews: '12,420',
      descEn: 'Master high-frequency vocabulary with spaced repetition, contextual collocations, and native audio.',
      descTh: 'เรียนรู้คำศัพท์ความถี่สูงตามระดับ A1-C2 พร้อมระบบทบทวน Spaced Repetition และตัวอย่างประโยคใช้งานจริง',
      icon: <BookOpen className="w-5 h-5 text-white" />,
      color: '#5B5CE2',
      route: '/vocabulary',
    },
    {
      id: 'grammar',
      nameEn: 'Grammar Logic Blueprint',
      nameTh: 'ไวยากรณ์และโครงสร้างประโยค',
      level: 'A1 - C1',
      timeEn: '8-12 Mins / lesson',
      timeTh: '8-12 นาที / บทเรียน',
      rating: '4.92',
      reviews: '9,810',
      descEn: 'Practical sentence patterns, functional tenses, and academic writing structures explained clearly.',
      descTh: 'ทำความเข้าใจ Tenses และโครงสร้างประโยคสำคัญโดยไม่มีสูตรท่องจำที่ซับซ้อน พร้อมแบบฝึกหัดโต้ตอบ',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      color: '#F59E0B',
      route: '/grammar',
    },
    {
      id: 'compete',
      nameEn: 'Ranked Speed Vocab Arena',
      nameTh: 'ประลองคำศัพท์ 4 วินาที (MMR)',
      level: 'Real-Time Battle',
      timeEn: '4s per round',
      timeTh: '4 วินาที / ข้อ',
      rating: '4.98',
      reviews: '18,500',
      descEn: 'Fast-paced reflex challenges against university peers. Climb divisions from Bronze to Grandmaster.',
      descTh: 'ท้าทายความเร็วและไหวพริบข้อละ 4 วินาที แข่งขันไต่อันดับ MMR กับเพื่อนในระดับมหาวิทยาลัยทั่วประเทศ',
      icon: <Swords className="w-5 h-5 text-white" />,
      color: '#EF4444',
      route: '/compete',
    },
    {
      id: 'mockExam',
      nameEn: 'Cambridge Mock Exams Vault',
      nameTh: 'คลังข้อสอบจำลอง Cambridge',
      level: 'KET / PET / FCE',
      timeEn: '45-90 Mins / test',
      timeTh: '45-90 นาที / ชุด',
      rating: '4.94',
      reviews: '8,230',
      descEn: 'Authentic Cambridge exam simulation with countdown timer, auto-scoring, and CEFR band diagnosis.',
      descTh: 'จำลองการทำข้อสอบ KET, PET, FCE เสมือนจริง พร้อมระบบจับเวลาและวิเคราะห์คะแนนเทียบระดับ CEFR',
      icon: <Award className="w-5 h-5 text-white" />,
      color: '#10B981',
      route: '/mock-exams',
    },
    {
      id: 'speaking',
      nameEn: 'AI Speaking & Fluency Clinic',
      nameTh: 'ห้องปฏิบัติการทักษะการพูด',
      level: 'A2 - C1',
      timeEn: '5-10 Mins / session',
      timeTh: '5-10 นาที / เซสชัน',
      rating: '4.90',
      reviews: '7,150',
      descEn: 'Practice spoken English with acoustic waveform feedback, stress rhythm detection, and fluency metrics.',
      descTh: 'ฝึกสนทนาและออกเสียงพร้อมระบบตรวจจับคลื่นเสียง (Waveform) และจังหวะเน้นเสียง (Stress & Rhythm)',
      icon: <Mic className="w-5 h-5 text-white" />,
      color: '#06B6D4',
      route: '/speaking',
    },
    {
      id: 'listening',
      nameEn: 'Acoustic Listening Lab',
      nameTh: 'สตูดิโอฝึกการฟังสำเนียงสากล',
      level: 'A1 - C2',
      timeEn: '5-8 Mins / track',
      timeTh: '5-8 นาที / เรื่อง',
      rating: '4.91',
      reviews: '6,400',
      descEn: 'Train auditory comprehension with authentic university dialogues, lectures, and accents.',
      descTh: 'ฝึกฟังบทสนทนาและการบรรยายวิชาการสำเนียงธรรมชาติ พร้อมสคริปต์ถอดเสียงและข้อสอบจับใจความ',
      icon: <Headphones className="w-5 h-5 text-white" />,
      color: '#8B5CF6',
      route: '/listening',
    },
  ];

  const currentStudio = studios[selectedStudioIdx];

  const handlePrevStudio = () => {
    setSelectedStudioIdx((prev) => (prev === 0 ? studios.length - 1 : prev - 1));
  };

  const handleNextStudio = () => {
    setSelectedStudioIdx((prev) => (prev === studios.length - 1 ? 0 : prev + 1));
  };

  // Best Players Leaderboard Mock Data (Matching Dribbble Table Structure)
  const topPlayers = [
    { rank: 1, name: 'Martin_Luis98', earned: '14,820 XP', mastered: '1,420 words', streak: '38 Days', tier: 'Grandmaster', division: 'Castle Apex', avatarBg: 'bg-amber-400' },
    { rank: 2, name: 'Sophia_Chen', earned: '12,450 XP', mastered: '1,180 words', streak: '26 Days', tier: 'Master I', division: 'Emerald Keep', avatarBg: 'bg-emerald-400' },
    { rank: 3, name: 'Liam_Nathaporn', earned: '11,200 XP', mastered: '980 words', streak: '19 Days', tier: 'Diamond II', division: 'Cobalt Citadel', avatarBg: 'bg-indigo-400' },
    { rank: 4, name: 'Emma_Watson88', earned: '9,940 XP', mastered: '840 words', streak: '14 Days', tier: 'Platinum III', division: 'Silver Bastion', avatarBg: 'bg-rose-400' },
    { rank: 5, name: 'Alex_Vander', earned: '8,760 XP', mastered: '720 words', streak: '12 Days', tier: 'Gold I', division: 'Bronze Ward', avatarBg: 'bg-sky-400' },
  ];

  return (
    <div className="min-h-screen bg-[#2155E6] text-white selection:bg-[#FFC533] selection:text-[#1E293B] overflow-x-hidden font-sans">
      {/* =====================================================================
          1. HERO SECTION: "Play In The Competition Right Now"
          (Dribbble Game Stream Hero with Vibrant Royal Cobalt & 3D Kart Mascot)
          ===================================================================== */}
      <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-28">
        {/* Playful Hand-Drawn Doodle SVG Accents in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden" aria-hidden="true">
          {/* Sun Doodle */}
          <svg className="absolute top-12 left-10 w-24 h-24 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="18" />
            <line x1="50" y1="15" x2="50" y2="24" strokeLinecap="round" />
            <line x1="50" y1="76" x2="50" y2="85" strokeLinecap="round" />
            <line x1="15" y1="50" x2="24" y2="50" strokeLinecap="round" />
            <line x1="76" y1="50" x2="85" y2="50" strokeLinecap="round" />
            <line x1="25" y1="25" x2="32" y2="32" strokeLinecap="round" />
            <line x1="68" y1="68" x2="75" y2="75" strokeLinecap="round" />
            <line x1="25" y1="75" x2="32" y2="68" strokeLinecap="round" />
            <line x1="68" y1="32" x2="75" y2="25" strokeLinecap="round" />
          </svg>

          {/* Paper Airplane Doodle */}
          <svg className="absolute top-20 right-1/3 w-20 h-20 text-white transform -rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 50 L85 20 L55 85 L45 55 Z" strokeLinejoin="round" />
            <line x1="85" y1="20" x2="45" y2="55" />
          </svg>

          {/* Clock / Medal Doodle */}
          <svg className="absolute bottom-16 left-1/4 w-20 h-20 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="28" />
            <polyline points="50,30 50,50 64,50" strokeLinecap="round" />
            <circle cx="50" cy="14" r="5" />
          </svg>

          {/* Clinking Glasses Doodle */}
          <svg className="absolute bottom-12 left-12 w-20 h-20 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M30 45 L40 65 L40 85 M25 85 L55 85" strokeLinecap="round" />
            <path d="M70 45 L60 65 L60 85 M45 85 L75 85" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Game-Stream Headline & High-Converting CTAs */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08] font-display">
                  {isEn ? (
                    <>
                      Play In The <br />
                      <span className="text-[#FFC533]">Competition</span> <br />
                      Right Now
                    </>
                  ) : (
                    <>
                      เข้าสู่สนามประลอง <br />
                      <span className="text-[#FFC533]">ทักษะภาษาอังกฤษ</span> <br />
                      ไต่อันดับตอนนี้เลย
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  {isEn
                    ? "Let's enjoy, play and learn in a great and priceless place and earn awards. Master 3,860 Oxford & Cambridge terms with real-world scenarios."
                    : 'ร่วมสนุก ท้าทาย และเรียนรู้ภาษาอังกฤษตามกรอบ CEFR มาตรฐานสากล A1-C2 ครบ 3,860 คำ พร้อมระบบดวลความเร็ว 4 วินาทีและไต่อันดับ MMR'}
                </p>
              </div>

              {/* Action Buttons: Matching Dribbble Sunburst Yellow Pill Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#FFC533] hover:bg-[#FFB814] text-[#1E293B] font-black text-base tracking-wide shadow-xl shadow-[#FFC533]/30 active:translate-y-1 hover:scale-102 transition-all cursor-pointer select-none"
                >
                  <span>{isEn ? 'Sign Up' : 'เริ่มวัดระดับฟรี (3 นาที)'}</span>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('studios')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md active:translate-y-1 transition-all cursor-pointer select-none"
                >
                  <Gamepad2 className="w-5 h-5 text-[#FFC533]" />
                  <span>{isEn ? 'Explore 8 Studios' : 'สำรวจ 8 สตูดิโอ'}</span>
                </button>
              </div>

              {/* Social Proof & Value Checkmarks */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-white/85">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFC533]" />
                  <span>{isEn ? '3,860 Cambridge Terms' : '3,860 คำศัพท์มาตรฐาน'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFC533]" />
                  <span>{isEn ? 'Zero Upfront Registration' : 'เริ่มได้ทันทีไม่ต้องสมัคร'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFC533]" />
                  <span>{isEn ? 'Cross-Platform Ready' : 'รองรับทุกอุปกรณ์'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Mascot & Blue Kart Visual (Exact Dribbble Style) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-xl aspect-square rounded-[36px] overflow-hidden bg-gradient-to-tr from-[#1B46C6] to-[#255DEE] p-2 shadow-2xl border-4 border-white/20 group">
                {/* 3D Mascot & Kart Image */}
                <img
                  src="/assets/dribbble-mascot-kart.jpg"
                  alt="3D Champion Mascot with Blue Karting Vehicle - STPlay / Glova Style"
                  className="w-full h-full object-cover rounded-[30px] transition-transform duration-700 group-hover:scale-105"
                />

                {/* Floating HUD Badge 1: Ranked Division (Top Left) */}
                <div className="absolute top-5 left-5 px-4 py-2 rounded-2xl bg-[#1845C2]/85 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                  <span className="text-xs font-mono font-black tracking-wider text-white uppercase">
                    RANKED ARENA // S1 ACTIVE
                  </span>
                </div>

                {/* Floating HUD Badge 2: Golden Trophy Status (Bottom Right) */}
                <div className="absolute bottom-5 right-5 px-4 py-2.5 rounded-2xl bg-[#FFC533] text-[#1E293B] shadow-xl flex items-center gap-2 font-black text-xs sm:text-sm">
                  <Trophy className="w-4 h-4 fill-[#1E293B]" />
                  <span>100% Free CEFR Check</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SECTION: "Why Glova?" (Why ST Play? - 3-Card Grid)
          (Dribbble 3-Card Feature Architecture with 3D Safe, Basket & Gift Box)
          ===================================================================== */}
      <section id="why-glova" className="py-20 lg:py-28 bg-[#1E4FD8] border-t border-b border-white/10 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Centered Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {isEn ? 'Why Glova?' : 'ทำไมต้อง Glova?'}
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-medium leading-relaxed">
              {isEn
                ? "Experience a university-grade English platform built for true competence, speed, and real-world fluency."
                : 'สัมผัสประสบการณ์เรียนรู้ภาษาอังกฤษมาตรฐานสากล ที่ออกแบบมาเพื่อความคล่องแคล่ว ท้าทาย และนำไปใช้ได้จริง'}
            </p>
          </div>

          {/* 3-Card Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Card 1: Reliable Platform (3D Safe with Gold Coins) */}
            <div className="rounded-[32px] bg-[#2155E6] border-2 border-white/15 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="space-y-6">
                <div className="w-full aspect-square max-h-56 rounded-2xl overflow-hidden bg-[#1845C2] border border-white/10 flex items-center justify-center p-2">
                  <img
                    src="/assets/dribbble-safe-coins.jpg"
                    alt="3D Blue Safe with Gold Coins - Reliable Platform"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-white font-display">
                    {isEn ? 'Reliable Platform' : 'มาตรฐานระดับสากล'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                    {isEn
                      ? 'Feel free to work and study with us. Aligned 100% with Cambridge & CEFR rubrics from A1 to C2.'
                      : 'มั่นใจได้ในมาตรฐานการประเมิน อิงตามกรอบ CEFR และข้อสอบ Cambridge KET, PET, FCE แท้ 100%'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToSection('cambridge')}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-[#1845C2] hover:bg-[#FFC533] hover:text-[#1E293B] font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? 'Learn More' : 'ดูรายละเอียดมาตรฐาน'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Multi Culture Place (3D Stationery Basket) */}
            <div className="rounded-[32px] bg-[#2155E6] border-2 border-white/15 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="space-y-6">
                <div className="w-full aspect-square max-h-56 rounded-2xl overflow-hidden bg-[#1845C2] border border-white/10 flex items-center justify-center p-2">
                  <img
                    src="/assets/dribbble-basket-tools.jpg"
                    alt="3D Blue Basket with Stationery Tools - Multi Culture Place"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-white font-display">
                    {isEn ? 'Multi Culture Place' : 'ระบบนิเวศ 8 สตูดิโอ'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                    {isEn
                      ? "We've done it carefully and simply. Complete ecosystem spanning vocab, grammar, listening, speaking, reading, and writing."
                      : 'รวมเครื่องมือฝึกฝนครบทุกมิติในที่เดียว ทั้งคำศัพท์ ไวยากรณ์ ฟัง พูด อ่าน เขียน และห้องสอบจำลอง'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToSection('studios')}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-[#1845C2] hover:bg-[#FFC533] hover:text-[#1E293B] font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? 'Learn More' : 'สำรวจ 8 สตูดิโอ'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Weekly Awards (3D Gift Box) */}
            <div className="rounded-[32px] bg-[#2155E6] border-2 border-white/15 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="space-y-6">
                <div className="w-full aspect-square max-h-56 rounded-2xl overflow-hidden bg-[#1845C2] border border-white/10 flex items-center justify-center p-2">
                  <img
                    src="/assets/dribbble-gift-box.jpg"
                    alt="3D Blue Gift Box with Ribbon - Weekly Awards"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-white font-display">
                    {isEn ? 'Weekly Awards' : 'รางวัลประจำสัปดาห์'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                    {isEn
                      ? 'Weekly awards for the best students. Climb the MMR rankings, win badges, and claim limited profile frames.'
                      : 'ประลองความเร็วสะสมคะแนน MMR ใน Academic League ลุ้นรับเหรียญรางวัล ฉายา และของรางวัลประจำสัปดาห์'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToSection('leaderboard')}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-[#1845C2] hover:bg-[#FFC533] hover:text-[#1E293B] font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? 'Learn More' : 'ดูทำเนียบผู้เรียน'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECTION: "Your Lovely Learning Studio" (Your Lovely Learning Game)
          (Dribbble 3D Hands Holding Controller + Interactive Studio Selector)
          ===================================================================== */}
      <section id="studios" className="py-20 lg:py-28 bg-[#2155E6] relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: 3D Hands with Controller + Studio Flipping Navigation */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-square rounded-[36px] overflow-hidden bg-gradient-to-tr from-[#1B46C6] to-[#255DEE] p-2 shadow-2xl border-4 border-white/20 group">
                <img
                  src="/assets/dribbble-hands-controller.jpg"
                  alt="3D Hands Holding Game Controller - Your Lovely Learning Game"
                  className="w-full h-full object-cover rounded-[30px] transition-transform duration-500 group-hover:scale-105"
                />

                {/* Arrow Navigation Controls (Matching Dribbble Video Frame 13s) */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pointer-events-auto">
                  <button
                    type="button"
                    onClick={handlePrevStudio}
                    className="w-12 h-12 rounded-xl bg-[#1845C2]/90 hover:bg-[#FFC533] hover:text-[#1E293B] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
                    aria-label="Previous Studio"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[3]" />
                  </button>

                  <span className="px-3.5 py-1.5 rounded-full bg-[#1845C2]/90 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/20">
                    {selectedStudioIdx + 1} / {studios.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextStudio}
                    className="w-12 h-12 rounded-xl bg-[#FFC533] hover:bg-[#FFB814] text-[#1E293B] flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
                    aria-label="Next Studio"
                  >
                    <ChevronRight className="w-6 h-6 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Studio Information & Metric Badges */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FFC533] text-xs font-bold border border-white/20">
                  <Star className="w-3.5 h-3.5 fill-[#FFC533]" />
                  <span>{currentStudio.level}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                  {isEn ? currentStudio.nameEn : currentStudio.nameTh}
                </h2>
                <p className="text-base sm:text-lg text-white/85 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  {isEn ? currentStudio.descEn : currentStudio.descTh}
                </p>
              </div>

              {/* Dribbble Metric Badges Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#1845C2] border border-white/15 text-left space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-white/60 uppercase">
                    ESTIMATED TIME
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-display">
                    {isEn ? currentStudio.timeEn : currentStudio.timeTh}
                  </div>
                  <div className="text-[11px] text-white/70">
                    {isEn ? 'Daily micro-habit' : 'ฝึกสม่ำเสมอทุกวัน'}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#1845C2] border border-white/15 text-left space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-white/60 uppercase">
                    ACCESS TIER
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-display">
                    Instant Access
                  </div>
                  <div className="text-[11px] text-white/70">
                    {isEn ? 'No paywall required' : 'เริ่มเรียนได้ทันที'}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#1845C2] border border-white/15 text-left space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-white/60 uppercase">
                    STUDIO RATING
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#FFC533] flex items-center gap-1 font-display">
                    <span>{currentStudio.rating}</span>
                    <Star className="w-5 h-5 fill-[#FFC533]" />
                  </div>
                  <div className="text-[11px] text-white/70">
                    {isEn ? `${currentStudio.reviews} reviews` : `จากผู้เรียน ${currentStudio.reviews} คน`}
                  </div>
                </div>
              </div>

              {/* Direct Studio Launch Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push(currentStudio.route)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#FFC533] hover:bg-[#FFB814] text-[#1E293B] font-black text-base shadow-xl shadow-[#FFC533]/25 active:translate-y-1 transition-all cursor-pointer select-none"
                >
                  <span>{isEn ? `Enter ${currentStudio.nameEn}` : `เปิดสตูดิโอนี้ (${currentStudio.nameTh})`}</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. SECTION: "Best Players" (Ranked Leaderboard Table)
          (Dribbble High-Score Arena Table Architecture)
          ===================================================================== */}
      <section id="leaderboard" className="py-20 lg:py-28 bg-[#1E4FD8] border-t border-b border-white/10 relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Centered Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FFC533] text-xs font-bold border border-white/20">
              <Trophy className="w-3.5 h-3.5 fill-[#FFC533]" />
              <span>ACADEMIC LEAGUE // SEASON 1</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {isEn ? 'Best Players' : 'ทำเนียบผู้เรียนคะแนนสูงสุด'}
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-medium">
              {isEn
                ? 'Top students dominating the Ranked Speed Vocabulary battle and CEFR mock exams this week.'
                : 'รายชื่อผู้เรียนที่ทำคะแนน MMR สูงสุดจากการประลองคำศัพท์และแบบทดสอบจำลองในสัปดาห์นี้'}
            </p>
          </div>

          {/* Dribbble Style Table Card */}
          <div className="max-w-4xl mx-auto rounded-[32px] bg-[#1845C2] border-2 border-white/15 shadow-2xl overflow-hidden">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#143AA6] text-[11px] font-mono font-bold tracking-wider text-white/70 border-b border-white/10 uppercase">
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2">
                <span>STUDENT</span>
              </div>
              <div className="col-span-3 sm:col-span-2 text-right sm:text-left">
                <span>EARNED</span>
              </div>
              <div className="hidden sm:block sm:col-span-2">
                <span>MASTERED</span>
              </div>
              <div className="hidden sm:block sm:col-span-2">
                <span>STREAK</span>
              </div>
              <div className="col-span-4 sm:col-span-2 text-right">
                <span>TIER</span>
              </div>
            </div>

            {/* Table Body Rows */}
            <div className="divide-y divide-white/10">
              {topPlayers.map((player) => (
                <div
                  key={player.rank}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors text-sm"
                >
                  {/* Student Name & Avatar */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                    <span className="font-mono font-bold text-xs w-5 text-white/60">
                      {player.rank === 1 ? '🥇 1' : player.rank === 2 ? '🥈 2' : player.rank === 3 ? '🥉 3' : `#${player.rank}`}
                    </span>
                    <div className={`w-8 h-8 rounded-full ${player.avatarBg} text-[#1E293B] font-black text-xs flex items-center justify-center shrink-0`}>
                      {player.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-white truncate">{player.name}</span>
                  </div>

                  {/* Earned XP */}
                  <div className="col-span-3 sm:col-span-2 text-right sm:text-left font-mono font-bold text-[#FFC533]">
                    {player.earned}
                  </div>

                  {/* Words Mastered */}
                  <div className="hidden sm:block sm:col-span-2 font-mono text-white/80">
                    {player.mastered}
                  </div>

                  {/* Win Streak */}
                  <div className="hidden sm:block sm:col-span-2 font-mono text-[#10B981] font-bold">
                    🔥 {player.streak}
                  </div>

                  {/* Tier */}
                  <div className="col-span-4 sm:col-span-2 text-right">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15">
                      {player.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer CTA */}
            <div className="p-6 bg-[#143AA6] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-white/70 font-medium text-center sm:text-left">
                {isEn ? 'Want to join the leaderboard? Challenge players in the 4-second vocab battle.' : 'ต้องการขึ้นสู่ทำเนียบอันดับ? เข้าสู่การประลองความเร็ว 4 วินาทีได้ทันที'}
              </span>
              <button
                type="button"
                onClick={() => router.push('/compete')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC533] hover:bg-[#FFB814] text-[#1E293B] font-black text-xs shadow-md active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>{isEn ? 'Enter Ranked Arena' : 'เข้าสู่สมรภูมิประลอง'}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SECTION: "Have A Question?" (High-Conversion Call To Action Banner)
          (Dribbble Question Container with Email & Phone Support)
          ===================================================================== */}
      <section id="contact" className="py-20 lg:py-28 bg-[#2155E6] relative">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-[36px] bg-[#1845C2] border-2 border-white/20 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Doodles */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-10" aria-hidden="true">
              <svg className="w-64 h-64 text-white" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Heading, Subtitle & Yellow Button */}
              <div className="md:col-span-7 space-y-4 text-center md:text-left">
                <h3 className="text-3xl sm:text-4xl font-black text-white font-display">
                  {isEn ? 'Have A Question?' : 'มีคำถามหรือข้อสงสัย?'}
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium max-w-md mx-auto md:mx-0">
                  {isEn
                    ? 'Find, explore and learn in an awesome place. Our academic team is ready to support your CEFR journey.'
                    : 'ค้นพบและพัฒนาทักษะภาษาอังกฤษในพื้นที่การเรียนรู้ที่ยอดเยี่ยม ทีมผู้เชี่ยวชาญพร้อมให้คำแนะนำในทุกขั้นตอน'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('why-glova')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFC533] hover:bg-[#FFB814] text-[#1E293B] font-black text-sm shadow-lg shadow-[#FFC533]/25 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>{isEn ? 'About Us' : 'เกี่ยวกับเรา'}</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Vertical Divider (Desktop Only) */}
              <div className="hidden md:block md:col-span-1 flex justify-center">
                <div className="w-[1.5px] h-32 bg-white/20" />
              </div>

              {/* Right Column: Direct Contact Info Blocks */}
              <div className="md:col-span-4 space-y-4">
                {/* Email Support Block */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#FFC533]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">support@glova.edu</div>
                    <div className="text-xs text-white/60">{isEn ? 'Less than 20 mins' : 'ตอบกลับภายใน 20 นาที'}</div>
                  </div>
                </div>

                {/* Phone / Line Support Block */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#FFC533]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">+66 2 123 4567</div>
                    <div className="text-xs text-white/60">{isEn ? 'From 08:00 to 21:00' : 'ทุกวัน 08:00 - 21:00 น.'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. FOOTER (Matching Dribbble STPlay Footer)
          ===================================================================== */}
      <footer className="py-12 bg-[#1845C2] border-t border-white/15 text-white">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white font-display">
                Glova<span className="text-[#FFC533]">Play</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-white">
                CEFR Stream
              </span>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-bold text-white/80">
              <button type="button" onClick={() => scrollToSection('overview')} className="hover:text-white cursor-pointer">
                {isEn ? '• About' : '• เกี่ยวกับเรา'}
              </button>
              <button type="button" onClick={() => scrollToSection('studios')} className="hover:text-white cursor-pointer">
                {isEn ? '• Learning (8 Studios)' : '• คลัง 8 สตูดิโอ'}
              </button>
              <button type="button" onClick={() => scrollToSection('why-glova')} className="hover:text-white cursor-pointer">
                {isEn ? '• Services & Rubrics' : '• มาตรฐาน CEFR'}
              </button>
              <button type="button" onClick={() => scrollToSection('contact')} className="hover:text-white cursor-pointer">
                {isEn ? '• Contact' : '• ติดต่อสอบถาม'}
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {['in', 'tw', 'fb'].map((net) => (
                <div
                  key={net}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FFC533] hover:text-[#1E293B] text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                >
                  {net}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Copyright & Newsletter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
            <div>
              {isEn ? '© 2026 Glova STPlay. All rights reserved.' : '© 2026 Glova STPlay. สงวนลิขสิทธิ์ทั้งหมด'}
            </div>

            {/* Newsletter Input matching Dribbble "Our newspaper" */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-center">
              <span className="text-white font-bold hidden sm:inline">
                {isEn ? 'Our newsletter:' : 'รับข่าวสาร:'}
              </span>
              <div className="flex items-center rounded-xl bg-white/10 border border-white/20 p-1 w-full max-w-xs">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={isEn ? 'Your email' : 'อีเมลของคุณ'}
                  className="px-3 py-1.5 bg-transparent text-xs text-white placeholder-white/50 focus:outline-none w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FFC533] text-[#1E293B] font-extrabold text-xs shrink-0 cursor-pointer hover:bg-[#FFB814]"
                >
                  {newsletterSubscribed ? '✓' : isEn ? 'Search' : 'ติดตาม'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          7. QUICK ENGLISH CHECK MODAL (Zero-Friction 3-Minute Diagnostic Test)
          ===================================================================== */}
      {isDiagnosticOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#141A22] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#EDEBE8] relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              aria-label="Close diagnostic check"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4F46E5] dark:text-[#5B5CE2]" />
                <span className="text-xs font-mono font-bold tracking-wider text-[#4F46E5] dark:text-[#A5A6F6] uppercase">
                  {isEn ? 'Official Diagnostic Test' : 'แบบวัดระดับภาษาอังกฤษ 3 นาที'}
                </span>
              </div>

              <QuickEnglishCheck
                onFinish={() => {
                  setIsDiagnosticOpen(false);
                  router.push('/assessment');
                }}
                onClose={() => setIsDiagnosticOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
