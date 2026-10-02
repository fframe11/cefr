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
  CheckCircle2,
  Target,
  Flame,
  Clock,
  Compass,
  GraduationCap,
  TrendingUp,
  Star,
  Layers,
  ChevronRight,
  Zap,
  Users,
  Check,
  Volume2,
  MessageSquare,
  Play,
  Square,
  RefreshCw,
  BarChart2,
  FileText,
  Calendar,
  Globe,
  ThumbsUp,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

interface LandingViewProps {
  onStartLearning?: () => void;
}

// Tree-shaken SVG Language Flags (Zero raw Unicode emojis)
const UkFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 60 30" aria-hidden="true">
    <clipPath id="landing-uk-clip">
      <circle cx="30" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-uk-clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFF" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0 v30 M0 15 h60" stroke="#FFF" strokeWidth="10" />
      <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const UsFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-us-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-us-clip)">
      <rect width="30" height="30" fill="#B22234" />
      <path d="M0 4.6h30M0 9.2h30M0 13.8h30M0 18.4h30M0 23h30M0 27.6h30" stroke="#FFF" strokeWidth="2.3" />
      <rect width="13" height="15" fill="#3C3B6E" />
    </g>
  </svg>
);

const ThaiFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-th-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-th-clip)">
      <rect y="0" width="30" height="5" fill="#A51931" />
      <rect y="5" width="30" height="5" fill="#F4F5F8" />
      <rect y="10" width="30" height="10" fill="#2D2A4A" />
      <rect y="20" width="30" height="5" fill="#F4F5F8" />
      <rect y="25" width="30" height="5" fill="#A51931" />
    </g>
  </svg>
);

const SpanishFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-es-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-es-clip)">
      <rect y="0" width="30" height="7.5" fill="#AA151B" />
      <rect y="7.5" width="30" height="15" fill="#F1BF00" />
      <rect y="22.5" width="30" height="7.5" fill="#AA151B" />
    </g>
  </svg>
);

const FrenchFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-fr-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-fr-clip)">
      <rect x="0" width="10" height="30" fill="#002654" />
      <rect x="10" width="10" height="30" fill="#FFFFFF" />
      <rect x="20" width="10" height="30" fill="#ED2939" />
    </g>
  </svg>
);

const GermanFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-de-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-de-clip)">
      <rect y="0" width="30" height="10" fill="#000000" />
      <rect y="10" width="30" height="10" fill="#DD0000" />
      <rect y="20" width="30" height="10" fill="#FFCE00" />
    </g>
  </svg>
);

const ItalianFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-it-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-it-clip)">
      <rect x="0" width="10" height="30" fill="#009246" />
      <rect x="10" width="10" height="30" fill="#FFFFFF" />
      <rect x="20" width="10" height="30" fill="#CE2B37" />
    </g>
  </svg>
);

const JapaneseFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="landing-jp-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#landing-jp-clip)">
      <rect width="30" height="30" fill="#FFFFFF" />
      <circle cx="15" cy="15" r="7" fill="#BC002D" />
    </g>
  </svg>
);

type CefrLevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [studioCategory, setStudioCategory] = useState<'all' | 'skills' | 'exam'>('all');
  const [activeScenario, setActiveScenario] = useState<'cafe' | 'airport' | 'hotel' | 'interview'>('cafe');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [activeCefr, setActiveCefr] = useState<CefrLevelKey>('B1');
  const [heroLangIdx, setHeroLangIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState('different');
  const [selectedHeroLevelKey, setSelectedHeroLevelKey] = useState<'A1' | 'B1' | 'C1' | 'C2'>('C1');
  const [isLiveVideoPlaying, setIsLiveVideoPlaying] = useState(true);

  const heroLevelCatalog = [
    {
      key: 'A1' as const,
      label: isEn ? 'Beginner' : 'ระดับเริ่มต้น',
      cefr: 'CEFR A1-A2',
      score: '92%',
      percent: 92,
      tag: isEn ? 'Daily Basics & Travel' : 'การสื่อสารพื้นฐานและชีวิตประจำวัน',
      color: '#10B981',
    },
    {
      key: 'B1' as const,
      label: isEn ? 'Intermediate' : 'ระดับกลาง',
      cefr: 'CEFR B1-B2',
      score: '88%',
      percent: 88,
      tag: isEn ? 'Workplace & Cambridge B2' : 'การทำงานและการสอบเคมบริดจ์ B2',
      color: '#F59E0B',
    },
    {
      key: 'C1' as const,
      label: isEn ? 'Advanced' : 'ระดับสูง',
      cefr: 'CEFR C1 Advanced',
      score: '94%',
      percent: 94,
      tag: isEn ? 'Spontaneous Speech & Fluid Cadence' : 'การสนทนาโต้ตอบคล่องแคล่วและเป็นธรรมชาติ',
      color: '#FA5D5D',
    },
    {
      key: 'C2' as const,
      label: isEn ? 'Mastery' : 'ระดับเชี่ยวชาญ',
      cefr: 'CEFR C2 Proficiency',
      score: '98%',
      percent: 98,
      tag: isEn ? 'Near-Native Precision & Rhetoric' : 'ความสละสลวยเทียบเคียงเจ้าของภาษา',
      color: '#8B5CF6',
    },
  ];

  const currentHeroLevel = heroLevelCatalog.find((l) => l.key === selectedHeroLevelKey) || heroLevelCatalog[2];

  const heroLanguages = [
    { name: isEn ? 'English' : 'อังกฤษ', flag: UkFlagSvg, tag: 'CEFR C1' },
    { name: isEn ? 'Spanish' : 'สเปน', flag: SpanishFlagSvg, tag: 'DELE B2' },
    { name: isEn ? 'French' : 'ฝรั่งเศส', flag: FrenchFlagSvg, tag: 'DALF C1' },
    { name: isEn ? 'Thai' : 'ไทย', flag: ThaiFlagSvg, tag: 'Everyday Fluency' },
  ];

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

  // Conversational Scenarios for Mondly Interactive Simulator
  const scenarios = {
    cafe: {
      title: isEn ? 'London Café Order' : 'สั่งเครื่องดื่มในร้านกาแฟลอนดอน',
      cefr: 'A2 - B1',
      mentorPrompt: 'Good morning! What can I get started for you today?',
      mentorTranslation: 'สวัสดีตอนเช้าครับ รับอะไรดีครับวันนี้?',
      learnerAnswer: 'Could I please have an oat flat white and an almond croissant to take away?',
      learnerTranslation: 'ขอแฟลตไวท์นมโอ๊ตกับครัวซองต์อัลมอนด์หนึ่งชิ้นแบบสั่งกลับบ้านครับ',
      score: '96%',
      accent: 'Oxford English',
      collocations: ['oat flat white', 'to take away'],
    },
    airport: {
      title: isEn ? 'Heathrow Airport Transfer' : 'สอบถามทางในสนามบินฮีทโธรว์',
      cefr: 'B1 - B2',
      mentorPrompt: 'Excuse me, is this the correct terminal for connecting international departures?',
      mentorTranslation: 'ขอโทษนะคะ อาคารนี้เป็นอาคารสำหรับต่อเที่ยวบินระหว่างประเทศใช่ไหมคะ?',
      learnerAnswer: 'Yes, follow the purple flight connections signs through security to Gate 24.',
      learnerTranslation: 'ใช่ครับ เดินตามป้ายสีม่วงสำหรับต่อเครื่องผ่านจุดตรวจไปที่เกต 24 ได้เลยครับ',
      score: '94%',
      accent: 'Natural Cadence',
      collocations: ['flight connections', 'connecting international departures'],
    },
    hotel: {
      title: isEn ? 'Boutique Hotel Check-in' : 'เช็กอินโรงแรมในต่างประเทศ',
      cefr: 'A2 - B1',
      mentorPrompt: 'Welcome to The Grand Kensington. May I have the surname under your reservation?',
      mentorTranslation: 'ยินดีต้อนรับสู่เดอะแกรนด์เคนซิงตันครับ ขอทราบนามสกุลที่จองไว้ด้วยครับ',
      learnerAnswer: 'Good afternoon, the reservation is under Smith for three nights with breakfast included.',
      learnerTranslation: 'สวัสดีตอนบ่ายครับ จองไว้ในชื่อสมิธสำหรับสามคืนรวมอาหารเช้าครับ',
      score: '95%',
      accent: 'Courteous Cadence',
      collocations: ['under reservation', 'breakfast included'],
    },
    interview: {
      title: isEn ? 'Global Career Interview' : 'แนะนำตัวในการสัมภาษณ์งานสากล',
      cefr: 'B2 - C1',
      mentorPrompt: 'Could you walk me through a complex problem you resolved in your previous role?',
      mentorTranslation: 'ช่วยเล่าถึงปัญหาที่ซับซ้อนที่คุณเคยแก้ไขในตำแหน่งก่อนหน้านี้ให้ฟังหน่อยได้ไหมครับ?',
      learnerAnswer: 'I spearheaded cross-functional alignment between engineering and product teams to eliminate deployment latency.',
      learnerTranslation: 'ผมเป็นผู้นำในการประสานงานระหว่างทีมวิศวกรและทีมผลิตภัณฑ์เพื่อแก้ปัญหาความล่าช้าในการขึ้นระบบครับ',
      score: '98%',
      accent: 'Executive Fluency',
      collocations: ['spearheaded alignment', 'cross-functional collaboration'],
    },
  };

  const currentScenario = scenarios[activeScenario];

  // Web Speech API Native British / American Pronunciation
  const handlePlaySample = () => {
    setIsPlayingAudio(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScenario.mentorPrompt);
      utterance.lang = 'en-GB';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2400);
    }
  };

  // Interactive Voice Recording & Fluency Simulator
  const handleSimulateRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 1800);
  };

  // 4 Pastel Tutor Profiles from Outcrowd Dribbble Keyframes
  const tutors = [
    {
      id: 'jordan',
      name: 'Jordan Burgess',
      photo: '/images/landing/mondly_tutor_jordan.jpg',
      bgClass: 'bg-[#DDF0FF] dark:bg-[#152332]',
      tagBg: 'bg-[#0284C7]/15 text-[#0284C7] dark:text-[#38BDF8]',
      specialty: isEn ? 'Business English & IELTS' : 'ภาษาอังกฤษธุรกิจและการสอบ IELTS',
      rating: '4.9',
      reviews: '124',
      rate: '$28',
      nativeFlag: UkFlagSvg,
      lessonsGiven: '850+ Lessons',
    },
    {
      id: 'madeleine',
      name: 'Madeleine Pitts',
      photo: '/images/landing/mondly_tutor_madeleine.jpg',
      bgClass: 'bg-[#FFF7D6] dark:bg-[#2A2616]',
      tagBg: 'bg-[#D97706]/15 text-[#D97706] dark:text-[#FBBF24]',
      specialty: isEn ? 'Conversational Fluency' : 'การสนทนาโต้ตอบคล่องแคล่ว',
      rating: '5.0',
      reviews: '98',
      rate: '$32',
      nativeFlag: UsFlagSvg,
      lessonsGiven: '1,200+ Lessons',
    },
    {
      id: 'maxwell',
      name: 'Maxwell Tan',
      photo: '/images/landing/mondly_tutor_maxwell.jpg',
      bgClass: 'bg-[#EAE4FF] dark:bg-[#231E33]',
      tagBg: 'bg-[#7C3AED]/15 text-[#7C3AED] dark:text-[#A78BFA]',
      specialty: isEn ? 'Academic Writing & CAE' : 'การเขียนวิชาการและข้อสอบ CAE',
      rating: '4.9',
      reviews: '87',
      rate: '$35',
      nativeFlag: UkFlagSvg,
      lessonsGiven: '640+ Lessons',
    },
    {
      id: 'kaitlin',
      name: 'Kaitlin Hale',
      photo: '/images/landing/mondly_tutor_kaitlin.jpg',
      bgClass: 'bg-[#FFE8DE] dark:bg-[#301E1A]',
      tagBg: 'bg-[#EA580C]/15 text-[#EA580C] dark:text-[#FB923C]',
      specialty: isEn ? 'Pronunciation & Phonics' : 'การออกเสียงสากลและโฟนิกส์',
      rating: '4.8',
      reviews: '156',
      rate: '$25',
      nativeFlag: UsFlagSvg,
      lessonsGiven: '920+ Lessons',
    },
  ];

  // 8 Specialized Modular Studios
  const studios = [
    {
      id: 'vocab',
      name: isEn ? 'Vocabulary Studio' : 'สตูดิโอคลังคำศัพท์',
      level: 'A1 - C2',
      badge: isEn ? 'Spaced Repetition' : 'จำศัพท์ระยะยาว',
      category: 'skills',
      desc: isEn
        ? '3,860 Oxford-grounded lexical items scheduled with memory decay curves and native audio.'
        : 'คลังคำศัพท์ 3,860 คำตามมาตรฐาน Oxford พร้อมเสียงอ่านและระบบทบทวนก่อนสมองจะลืม',
      icon: BookOpen,
      color: '#FA5D5D',
      route: '/vocabulary',
      itemsCount: '3,860 Words',
    },
    {
      id: 'grammar',
      name: isEn ? 'Grammar Studio' : 'สตูดิโอไวยากรณ์',
      level: 'A2 - C1',
      badge: isEn ? 'Sentence Surgery' : 'วิเคราะห์โครงสร้าง',
      category: 'skills',
      desc: isEn
        ? 'Interactive error correction, clause restructuring, and diagnostic syntax practice.'
        : 'ฝึกแก้ไขไวยากรณ์ผิดและเรียบเรียงโครงสร้างประโยคเพื่อความถูกต้องทางวิชาการ',
      icon: Layers,
      color: '#38BDF8',
      route: '/grammar',
      itemsCount: '120 Modules',
    },
    {
      id: 'reading',
      name: isEn ? 'Reading Studio' : 'สตูดิโอการอ่าน',
      level: 'A2 - C2',
      badge: isEn ? 'Timed Comprehension' : 'จับเวลาอ่านวิเคราะห์',
      category: 'skills',
      desc: isEn
        ? 'Academic and professional passages with micro-timing and gist comprehension.'
        : 'บทความวิชาการพร้อมระบบจับเวลาและข้อสอบจับประเด็นใจความสำคัญตามข้อสอบจริง',
      icon: Compass,
      color: '#10B981',
      route: '/reading',
      itemsCount: '85 Passages',
    },
    {
      id: 'listening',
      name: isEn ? 'Listening Studio' : 'สตูดิโอการฟัง',
      level: 'A1 - C1',
      badge: isEn ? 'Multi-Accent Audio' : 'สำเนียงสากล',
      category: 'skills',
      desc: isEn
        ? 'Native British and American dialogues with note-taking prompts and speed variation.'
        : 'บทสนทนาและบรรยายวิชาการสำเนียงอังกฤษและอเมริกัน พร้อมฝึกการจับใจความและจดโน้ต',
      icon: Headphones,
      color: '#F59E0B',
      route: '/listening',
      itemsCount: '140 Audios',
    },
    {
      id: 'writing',
      name: isEn ? 'Writing Studio' : 'สตูดิโอการเขียน',
      level: 'B1 - C2',
      badge: isEn ? 'CEFR Rubric Scoring' : 'เกณฑ์ตรวจเคมบริดจ์',
      category: 'skills',
      desc: isEn
        ? 'Essay drafting with real-time feedback on lexical resource, coherence, and precision.'
        : 'ฝึกเขียนเรียงความและอีเมลทางการ พร้อมระบบตรวจทานคำเชื่อม ความสละสลวย และไวยากรณ์',
      icon: PenTool,
      color: '#EC4899',
      route: '/writing',
      itemsCount: '48 Prompts',
    },
    {
      id: 'speaking',
      name: isEn ? 'Speaking Studio' : 'สตูดิโอการพูด',
      level: 'A2 - C2',
      badge: isEn ? 'AI Phoneme Coach' : 'ตรวจเสียงพูด AI',
      category: 'skills',
      desc: isEn
        ? 'Speech recognition evaluating intonation, phoneme accuracy, and response latency.'
        : 'บันทึกเสียงตอบคำถามจำลองสถานการณ์จริง พร้อมตรวจความชัดของสระและพยัญชนะด้วย AI',
      icon: Mic,
      color: '#FA5D5D',
      route: '/speaking',
      itemsCount: '64 Tasks',
    },
    {
      id: 'assessment',
      name: isEn ? 'Diagnostic Studio' : 'สตูดิโอวัดระดับ',
      level: 'A1 - C2',
      badge: isEn ? 'Adaptive Placement' : 'ประเมินระดับแม่นยำ',
      category: 'exam',
      desc: isEn
        ? '15-minute diagnostic test precisely mapping your current abilities across all CEFR bands.'
        : 'แบบประเมินความสามารถ 15 นาที ระบุระดับความสามารถและจุดที่ต้องพัฒนาอย่างตรงจุด',
      icon: Award,
      color: '#8B5CF6',
      route: '/assessment',
      itemsCount: 'Full Diagnostic',
    },
    {
      id: 'mockExam',
      name: isEn ? 'Cambridge Vault' : 'คลังข้อสอบเคมบริดจ์',
      level: 'A2 - C1',
      badge: isEn ? 'Timed Simulations' : 'จำลองข้อสอบจริง',
      category: 'exam',
      desc: isEn
        ? 'Full-length timed simulations for KET (A2), PET (B1), FCE (B2), and CAE (C1).'
        : 'ชุดข้อสอบจำลองเต็มรูปแบบของเคมบริดจ์ จับเวลาจริงและรายงานคะแนนเทียบเกณฑ์ทางการ',
      icon: GraduationCap,
      color: '#10B981',
      route: '/mock-exams',
      itemsCount: '4 Full Exams',
    },
  ];

  const filteredStudios = studioCategory === 'all'
    ? studios
    : studios.filter((s) => s.category === studioCategory);

  // CEFR Journey Framework Roadmap Data (#framework)
  const cefrLevels: Record<CefrLevelKey, {
    nameEn: string;
    nameTh: string;
    cambridgeScale: string;
    exam: string;
    vocabCount: string;
    color: string;
    canDoEn: string;
    canDoTh: string;
    modules: string[];
  }> = {
    A1: {
      nameEn: 'A1 Breakthrough (Starter)',
      nameTh: 'A1 ระดับเริ่มต้น',
      cambridgeScale: '100 - 119',
      exam: 'Pre-A1 Foundation',
      vocabCount: '500+ Words',
      color: '#10B981',
      canDoEn: 'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs.',
      canDoTh: 'เข้าใจและใช้สำนวนในชีวิตประจำวัน ประโยคพื้นฐาน แนะนำตัวเอง และถามคำถามง่ายๆ เกี่ยวกับรายละเอียดส่วนบุคคล',
      modules: ['Everyday Greetings', 'Personal Introduction', 'Numbers & Shopping', 'Basic Questions'],
    },
    A2: {
      nameEn: 'A2 Waystage (Elementary)',
      nameTh: 'A2 ระดับพื้นฐาน',
      cambridgeScale: '120 - 139',
      exam: 'A2 Key (KET)',
      vocabCount: '1,200+ Words',
      color: '#38BDF8',
      canDoEn: 'Can communicate in simple and routine tasks requiring a direct exchange of information on familiar and routine matters.',
      canDoTh: 'สื่อสารในงานและสถานการณ์คุ้นเคย แลกเปลี่ยนข้อมูลสั้นๆ เกี่ยวกับครอบครัว การซื้อของ การเดินทาง และอาชีพ',
      modules: ['Travel Directions', 'Social Conversations', 'Past Events Narration', 'KET Vocabulary'],
    },
    B1: {
      nameEn: 'B1 Threshold (Intermediate)',
      nameTh: 'B1 ระดับกลาง',
      cambridgeScale: '140 - 159',
      exam: 'B1 Preliminary (PET)',
      vocabCount: '2,500+ Words',
      color: '#F59E0B',
      canDoEn: 'Can understand main points of clear standard input on familiar matters and handle most travel and workplace situations.',
      canDoTh: 'เข้าใจประเด็นหลักในเรื่องที่คุ้นเคยจากการทำงานและเรียน สามารถจัดการสถานการณ์ส่วนใหญ่ขณะเดินทาง และอธิบายประสบการณ์ได้',
      modules: ['Workplace Emails', 'Travel Independence', 'Opinion Expressing', 'PET Exam Strategy'],
    },
    B2: {
      nameEn: 'B2 Vantage (Upper Intermediate)',
      nameTh: 'B2 ระดับกลางระดับสูง',
      cambridgeScale: '160 - 179',
      exam: 'B2 First (FCE)',
      vocabCount: '4,500+ Words',
      color: '#FA5D5D',
      canDoEn: 'Can interact with fluency and spontaneity with native speakers without strain, and produce clear, detailed arguments on complex topics.',
      canDoTh: 'สนทนากับเจ้าของภาษาได้อย่างคล่องแคล่วและเป็นธรรมชาติโดยไม่ต้องใช้ความพยายามมาก เขียนบทความแจกแจงข้อดีข้อเสีย',
      modules: ['Complex Debates', 'Formal Essays', 'Idiomatic Phrasal Verbs', 'FCE Timed Prep'],
    },
    C1: {
      nameEn: 'C1 Effective Operational (Advanced)',
      nameTh: 'C1 ระดับสูง',
      cambridgeScale: '180 - 199',
      exam: 'C1 Advanced (CAE)',
      vocabCount: '8,000+ Words',
      color: '#8B5CF6',
      canDoEn: 'Can express ideas fluently and spontaneously for social, academic and professional purposes with subtle nuances and sophisticated cohesion.',
      canDoTh: 'สื่อสารได้อย่างคล่องแคล่วเป็นธรรมชาติโดยไม่ต้องหยุดคิดหาคำศัพท์ ใช้ภาษาอย่างยืดหยุ่นในแวดวงวิชาการและวิชาชีพชั้นสูง',
      modules: ['Academic Dissertations', 'Executive Negotiations', 'Advanced Collocations', 'CAE Vault'],
    },
    C2: {
      nameEn: 'C2 Mastery (Proficiency)',
      nameTh: 'C2 ระดับความเชี่ยวชาญสูงสุด',
      cambridgeScale: '200 - 230',
      exam: 'C2 Proficiency (CPE)',
      vocabCount: '16,000+ Words',
      color: '#EC4899',
      canDoEn: 'Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning in complex and demanding scenarios.',
      canDoTh: 'เข้าใจทุกสิ่งที่ได้ยินหรือได้อ่านอย่างง่ายดาย แยกแยะความหมายที่ละเอียดอ่อนได้ชัดเจนเสมือนเจ้าของภาษาชั้นนำ',
      modules: ['Literary Analysis', 'Nuanced Rhetoric', 'Professional Publishing', 'CPE Mastery'],
    },
  };

  const currentCefr = cefrLevels[activeCefr];

  // Cambridge Vault Timed Exam Simulations (#exams)
  const cambridgeExams = [
    {
      id: 'ket',
      level: 'A2',
      title: 'A2 Key (KET)',
      subtitle: isEn ? 'Elementary English Qualification' : 'วุฒิบัตรภาษาอังกฤษระดับพื้นฐาน',
      scale: '120 - 139',
      duration: '100 min',
      color: '#38BDF8',
      papers: [
        { name: 'Reading & Writing', time: '60 min', count: '32 questions' },
        { name: 'Listening', time: '30 min', count: '25 questions' },
        { name: 'Speaking', time: '8-10 min', count: '2 parts' },
      ],
      description: isEn
        ? 'Proves you can communicate in simple situations with native and international speakers.'
        : 'วัดความสามารถในการสื่อสารสถานการณ์พื้นฐานในชีวิตประจำวัน การเดินทาง และการสนทนาสั้นๆ',
    },
    {
      id: 'pet',
      level: 'B1',
      title: 'B1 Preliminary (PET)',
      subtitle: isEn ? 'Intermediate English Qualification' : 'วุฒิบัตรภาษาอังกฤษระดับกลาง',
      scale: '140 - 159',
      duration: '132 min',
      color: '#F59E0B',
      papers: [
        { name: 'Reading', time: '45 min', count: '32 questions' },
        { name: 'Writing', time: '45 min', count: '2 tasks' },
        { name: 'Listening', time: '30 min', count: '25 questions' },
        { name: 'Speaking', time: '12 min', count: '4 parts' },
      ],
      description: isEn
        ? 'Shows that you have mastered the basics of English and have practical language skills for everyday use.'
        : 'ยืนยันความสามารถในการใช้งานภาษาอังกฤษในการทำงาน เรียนต่อ และใช้ชีวิตในต่างประเทศอย่างอิสระ',
    },
    {
      id: 'fce',
      level: 'B2',
      title: 'B2 First (FCE)',
      subtitle: isEn ? 'Upper-Intermediate Qualification' : 'วุฒิบัตรภาษาอังกฤษระดับกลางสูง',
      scale: '160 - 179',
      duration: '209 min',
      color: '#FA5D5D',
      papers: [
        { name: 'Reading & Use of English', time: '75 min', count: '52 questions' },
        { name: 'Writing', time: '80 min', count: '2 tasks' },
        { name: 'Listening', time: '40 min', count: '30 questions' },
        { name: 'Speaking', time: '14 min', count: '4 parts' },
      ],
      description: isEn
        ? 'Proves you have the language skills to live and work independently in an English-speaking country.'
        : 'มาตรฐานระดับโลกสำหรับยื่นเข้ามหาวิทยาลัยชั้นนำและสมัครงานในองค์กรข้ามชาติ',
    },
    {
      id: 'cae',
      level: 'C1',
      title: 'C1 Advanced (CAE)',
      subtitle: isEn ? 'Advanced In-Depth Qualification' : 'วุฒิบัตรภาษาอังกฤษระดับสูง',
      scale: '180 - 199',
      duration: '235 min',
      color: '#8B5CF6',
      papers: [
        { name: 'Reading & Use of English', time: '90 min', count: '56 questions' },
        { name: 'Writing', time: '90 min', count: '2 tasks' },
        { name: 'Listening', time: '40 min', count: '30 questions' },
        { name: 'Speaking', time: '15 min', count: '4 parts' },
      ],
      description: isEn
        ? 'In-depth qualification accepted by over 9,000 educational institutions and employers worldwide.'
        : 'การรับรองระดับสูงสำหรับการศึกษาระดับปริญญาโท-เอก และการประกอบวิชาชีพเฉพาะทางทั่วโลก',
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F3] dark:bg-[#13111C] text-slate-900 dark:text-[#EDEBE8] transition-colors duration-300">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Centered Headline + Giant Background Photo Container     */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden">
        {/* Soft Ambient Mondly Radial Glows */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#FA5D5D]/15 dark:bg-[#FA5D5D]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-24 right-10 w-80 h-80 rounded-full bg-[#38BDF8]/15 dark:bg-[#38BDF8]/10 blur-3xl pointer-events-none" />

        {/* Centered Hero Header Content (Outcrowd Mondly Layout) */}
        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10 mb-10 sm:mb-14">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 border border-[#FA5D5D]/25 shadow-2xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#FA5D5D] animate-pulse" />
            <span className="text-xs font-bold text-[#FA5D5D] uppercase tracking-wider">
              {isEn ? 'Language Learning Reimagined • CEFR A1-C2' : 'การเรียนภาษาแนวใหม่ตามมาตรฐานสากล CEFR'}
            </span>
          </div>

          {/* Centered Headline with Interactive Cursor Tag on Language */}
          <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            {isEn ? (
              <>
                Easy{' '}
                <span className="relative inline-block cursor-pointer" onClick={() => setHeroLangIdx((p) => (p + 1) % heroLanguages.length)}>
                  <span className="px-3.5 py-1 rounded-2xl bg-white dark:bg-[#1E1B28] border-2 border-slate-900 dark:border-white shadow-sm text-slate-900 dark:text-white inline-flex items-center gap-2">
                    {React.createElement(heroLanguages[heroLangIdx].flag, { className: 'w-5 h-5' })}
                    <span>{heroLanguages[heroLangIdx].name}</span>
                  </span>
                  {/* Outcrowd Black Arrow Cursor Badge */}
                  <span className="hidden sm:flex absolute -bottom-4 right-0 translate-y-full px-2 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-bold shadow-md items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FA5D5D]" />
                    <span>{heroLanguages[heroLangIdx].tag}</span>
                  </span>
                </span>{' '}
                mastery with our platform
              </>
            ) : (
              <>
                เก่งภาษา{' '}
                <span className="relative inline-block cursor-pointer" onClick={() => setHeroLangIdx((p) => (p + 1) % heroLanguages.length)}>
                  <span className="px-3.5 py-1 rounded-2xl bg-white dark:bg-[#1E1B28] border-2 border-slate-900 dark:border-white shadow-sm text-slate-900 dark:text-white inline-flex items-center gap-2">
                    {React.createElement(heroLanguages[heroLangIdx].flag, { className: 'w-5 h-5' })}
                    <span>{heroLanguages[heroLangIdx].name}</span>
                  </span>
                  <span className="hidden sm:flex absolute -bottom-4 right-0 translate-y-full px-2 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-bold shadow-md items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FA5D5D]" />
                    <span>{heroLanguages[heroLangIdx].tag}</span>
                  </span>
                </span>{' '}
                อย่างมั่นใจด้วยหลักสูตรระดับโลก
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto pt-2">
            {isEn
              ? 'Discover a world of opportunities with our comprehensive courses tailored to all levels. Master languages effortlessly and connect with cultures worldwide.'
              : 'เปิดรับทุกโอกาสแห่งการเรียนรู้ด้วยหลักสูตรครบวงจรที่ปรับให้เหมาะกับทุกระดับ พัฒนาทักษะภาษาอังกฤษอย่างเป็นธรรมชาติและสื่อสารกับผู้คนทั่วโลกได้อย่างมั่นใจ'}
          </p>

          {/* Centered Dual Pill CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-lg shadow-[#FA5D5D]/25 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEn ? 'Start learning' : 'เริ่มต้นเรียนรู้'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('studios')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white dark:bg-[#1E1B28] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-border font-bold text-sm shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-[#FA5D5D]" />
              <span>{isEn ? 'Explore studios' : 'สำรวจสตูดิโอ'}</span>
            </button>
          </div>

          {/* Social Proof Learner Stack */}
          <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full border-2 border-white dark:border-[#13111C] bg-[#FA5D5D]/20 text-[#FA5D5D] font-bold text-xs flex items-center justify-center">J</span>
              <span className="w-8 h-8 rounded-full border-2 border-white dark:border-[#13111C] bg-[#38BDF8]/20 text-[#38BDF8] font-bold text-xs flex items-center justify-center">M</span>
              <span className="w-8 h-8 rounded-full border-2 border-white dark:border-[#13111C] bg-[#10B981]/20 text-[#10B981] font-bold text-xs flex items-center justify-center">K</span>
              <span className="w-8 h-8 rounded-full border-2 border-white dark:border-[#13111C] bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-xs flex items-center justify-center">+</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="flex text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
              </span>
              <span className="font-bold text-slate-900 dark:text-white">4.9</span>
              <span>• {isEn ? '60k+ active learners worldwide' : 'ผู้เรียนกว่า 60,000 คนทั่วโลก'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GIANT HERO BACKGROUND PHOTO CANVAS (Outcrowd Mondly Signature Container)   */}
        {/* ========================================================================= */}
        <div className="w-full relative rounded-[36px] sm:rounded-[48px] overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 aspect-[16/10] sm:aspect-[16/9] min-h-[540px] sm:min-h-[640px] lg:min-h-[720px] flex flex-col justify-between p-6 sm:p-10 lg:p-12">
          {/* Authentic High-Res Teacher Photo Background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/landing/mondly_hero_teacher.jpg"
            alt="English teacher smiling with headset in modern studio"
            className="absolute inset-0 w-full h-full object-cover object-center"
            width={1600}
            height={900}
            loading="eager"
          />

          {/* Soft Atmospheric Gradient Overlay for Floating Glass Cards */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 pointer-events-none" />

          {/* Top Floating Row: Interactive Level Switcher (Left) & Activity Gauge (Right) */}
          <div className="relative z-20 flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
            {/* Floating Card 1: Interactive CEFR Level Selector (Outcrowd Mondly Signature) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#1E1B28]/95 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl max-w-sm w-full space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isEn ? 'CEFR Level Placement' : 'การจัดระดับตามเกณฑ์ CEFR'}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentHeroLevel.score} Score</span>
                </span>
              </div>

              {/* 4 Interactive Level Selector Pills */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-border/60">
                {heroLevelCatalog.map((lvl) => {
                  const isActive = selectedHeroLevelKey === lvl.key;
                  return (
                    <button
                      key={lvl.key}
                      type="button"
                      onClick={() => setSelectedHeroLevelKey(lvl.key)}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-[#FA5D5D] text-white shadow-xs scale-102'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {lvl.key}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>{currentHeroLevel.cefr}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{currentHeroLevel.label}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-snug truncate">
                  {currentHeroLevel.tag}
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FA5D5D] to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${currentHeroLevel.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Floating Card 2: Weekly Study Activity Chart (24.9 hrs) */}
            <div className="hidden sm:block p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#1E1B28]/95 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl max-w-xs w-full space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {isEn ? 'Weekly Progress' : 'ความก้าวหน้ารายสัปดาห์'}
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">24.9 hrs</span>
                </div>
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.4%</span>
                </span>
              </div>

              {/* 7 Daily Mini Bars (Mon - Sun) */}
              <div className="flex items-end justify-between gap-1.5 pt-1 h-12">
                {[
                  { day: 'M', h: '50%', active: false },
                  { day: 'T', h: '65%', active: false },
                  { day: 'W', h: '95%', active: true },
                  { day: 'T', h: '80%', active: true },
                  { day: 'F', h: '60%', active: false },
                  { day: 'S', h: '40%', active: false },
                  { day: 'S', h: '75%', active: false },
                ].map((b, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 w-full">
                    <div className="w-full rounded-md bg-slate-100 dark:bg-white/10 h-10 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-md transition-all ${
                          b.active ? 'bg-[#FA5D5D]' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        style={{ height: b.h }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{b.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Floating Row: Live Coaching Room Status & Interactive Video Bar */}
          <div className="relative z-20 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 w-full pt-6">
            {/* Floating Card 3: Live Coaching Room Status */}
            <div className="inline-flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-[#1E1B28]/95 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {isEn ? 'Live Speaking Room • Active Now' : 'ห้องสนทนาสด • พร้อมฝึกทันที'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {isEn ? 'Join 24 learners in Oxford Accent Clinic' : 'มีผู้เรียน 24 คนกำลังฝึกสำเนียงบริติช'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push('/speaking')}
                className="ml-2 px-3 py-1.5 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-[11px] font-bold shadow-xs cursor-pointer transition-colors shrink-0"
              >
                {isEn ? 'Join' : 'เข้าร่วม'}
              </button>
            </div>

            {/* Floating Interactive Video Player Bar (Outcrowd Mondly Live Video Simulation) */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md text-white border border-white/15 shadow-2xl text-xs">
              <button
                type="button"
                onClick={() => setIsLiveVideoPlaying(!isLiveVideoPlaying)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-[#FA5D5D] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label={isLiveVideoPlaying ? 'Pause video' : 'Play video'}
              >
                {isLiveVideoPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-semibold text-white/90 truncate max-w-[180px] sm:max-w-[220px]">
                  {isEn ? 'Sarah Mitchell • Oxford Tutor' : 'ซาร่าห์ มิทเชลล์ • ติวเตอร์อ็อกซ์ฟอร์ด'}
                </span>
              </div>

              {/* Live Soundwave Bars */}
              <div className="hidden sm:flex items-center gap-1 h-4 px-1">
                {[0.4, 0.8, 0.5, 0.9, 0.6, 0.3].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-0.5 bg-[#FA5D5D] rounded-full transition-all duration-300"
                    style={{
                      height: isLiveVideoPlaying ? `${h * 16}px` : '4px',
                      opacity: isLiveVideoPlaying ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>

              <span className="text-[10px] font-mono text-white/70 px-2 py-0.5 rounded-md bg-white/10 shrink-0">
                14:20 / 45:00
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 2: 50+ LANGUAGES FLAG CARPET (Outcrowd Mondly Keyframe 5s)      */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] border border-[#38BDF8]/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Global Multilingual Reach' : 'ครอบคลุมภาษาสากลทั่วโลก'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'We have teachers in over 50 languages!' : 'เรามีบทเรียนและครูผู้สอนมากกว่า 50 ภาษา!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'From beginner foundation to master proficiency, learn with native-calibrated materials tailored to your native mother tongue.'
              : 'ตั้งแต่ระดับเริ่มต้น A1 ไปจนถึง C2 ฝึกฝนด้วยเนื้อหาที่เทียบมาตรฐานเคมบริดจ์และออกแบบมาให้เข้าใจง่าย'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => scrollToSection('studios')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#FA5D5D] dark:hover:bg-[#FA5D5D] dark:hover:text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <span>{isEn ? 'Find your tutor' : 'ค้นหาครูและบทเรียน'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grid of Rounded Country Language Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {[
            { name: isEn ? 'British English' : 'ภาษาอังกฤษ สำเนียงบริติช', flag: UkFlagSvg, count: '3,860 Words' },
            { name: isEn ? 'American English' : 'ภาษาอังกฤษ สำเนียงอเมริกัน', flag: UsFlagSvg, count: '3,450 Words' },
            { name: isEn ? 'Spanish' : 'ภาษาสเปน', flag: SpanishFlagSvg, count: '2,900 Words' },
            { name: isEn ? 'French' : 'ภาษาฝรั่งเศส', flag: FrenchFlagSvg, count: '2,640 Words' },
            { name: isEn ? 'German' : 'ภาษาเยอรมัน', flag: GermanFlagSvg, count: '2,400 Words' },
            { name: isEn ? 'Italian' : 'ภาษาอิตาลี', flag: ItalianFlagSvg, count: '2,150 Words' },
            { name: isEn ? 'Japanese' : 'ภาษาญี่ปุ่น', flag: JapaneseFlagSvg, count: '2,800 Words' },
            { name: isEn ? 'Thai' : 'ภาษาไทย', flag: ThaiFlagSvg, count: 'Native Engine' },
          ].map((lang, idx) => {
            const Flag = lang.flag;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border/80 shadow-2xs hover:border-[#FA5D5D]/50 hover:shadow-md transition-all flex items-center gap-3 cursor-default"
              >
                <Flag className="w-6 h-6 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {lang.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {lang.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 3: HOW IT WORKS - STEP-BY-STEP INTERACTIVE LESSON SHOWCASE     */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          {/* Step Selector Pills (01 Set Goals | 02 Interactive Lessons | 03 Track Progress) */}
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-slate-100 dark:bg-white/5 border border-border text-xs font-bold">
            <span className="px-3.5 py-1 rounded-full text-slate-500">01 {isEn ? 'Set Goals' : 'ตั้งเป้าหมาย'}</span>
            <span className="px-3.5 py-1 rounded-full bg-[#FA5D5D] text-white shadow-xs">
              02 {isEn ? 'Interactive Lessons' : 'บทเรียนโต้ตอบ'}
            </span>
            <span className="px-3.5 py-1 rounded-full text-slate-500">03 {isEn ? 'Track Progress' : 'ติดตามผล'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Learn with Interactive Real-Time Lessons' : 'เรียนรู้ผ่านบทเรียนโต้ตอบแบบเรียลไทม์'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Our communicative methodology pairs authentic video situations with active multi-choice decisions and speech evaluation.'
              : 'ผสมผสานสถานการณ์จำลองจากวิดีโอ การตอบคำถามเชิงโต้ตอบ และระบบประเมินการพูด เพื่อพัฒนาทักษะการใช้ภาษาอย่างแท้จริง'}
          </p>
        </div>

        {/* Large Warm Sunny Amber Container from Outcrowd Dribbble Keyframe 15s */}
        <div className="rounded-[32px] sm:rounded-[40px] bg-[#FEF3C7] dark:bg-[#252014] border border-amber-200/60 dark:border-amber-500/20 p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Authentic Video Frame with Student Waving */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#1E1B28] relative min-h-[340px] sm:min-h-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/landing/mondly_lesson_student.jpg"
                  alt="Student smiling during interactive language lesson"
                  className="w-full h-full object-cover absolute inset-0"
                  width={800}
                  height={600}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Overlaid Live Audio Wave Badge */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between p-3 rounded-2xl bg-white/95 dark:bg-[#1E1B28]/95 backdrop-blur-md border border-white/20 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FA5D5D]/15 text-[#FA5D5D] flex items-center justify-center font-bold">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {isEn ? 'AI Speech Recognition' : 'ตรวจการออกเสียง AI'}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {isEn ? 'Native Rhythm 98% Match' : 'จังหวะการพูดเทียบเคียงเจ้าของภาษา 98%'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateRecording}
                    className="px-3 py-1 rounded-xl bg-[#FA5D5D] text-white text-[11px] font-bold shadow-xs hover:bg-[#E84C4C] transition-colors"
                  >
                    {isRecording ? (isEn ? 'Listening...' : 'กำลังฟัง...') : (isEn ? 'Test Mic' : 'ทดสอบเสียง')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Interactive Quiz & Dialogue Practice */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  {isEn ? 'Step 2 • Active Decision Exercise' : 'ขั้นตอนที่ 2 • แบบฝึกหัดตัดสินใจตามบริบท'}
                </span>
                <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isEn ? 'Interactive Grammar & Collocations' : 'เลือกคำศัพท์ที่ถูกต้องตามหลักไวยากรณ์'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Fill in the blank with the correct part of speech based on sentence structure.'
                    : 'เลือกคำศัพท์ที่ทำหน้าที่ถูกต้องตามโครงสร้างประโยคและบริบทความหมาย'}
                </p>
              </div>

              {/* Interactive Quiz Card from Outcrowd Dribbble Video */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1B28] border border-border shadow-lg space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-[#FA5D5D]">B2 First (FCE) • Use of English</span>
                  <span>Question 4 of 6</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/80">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    "They have completely <span className="underline decoration-[#FA5D5D] decoration-2 underline-offset-4 text-[#FA5D5D]">{selectedQuizAnswer}</span> opinions on this matter."
                  </p>
                </div>

                {/* 4 Interactive Option Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { val: 'differ', label: 'differ (verb)' },
                    { val: 'different', label: 'different (adj)' },
                    { val: 'disagree', label: 'disagree (verb)' },
                    { val: 'oppose', label: 'oppose (verb)' },
                  ].map((opt) => {
                    const isSelected = selectedQuizAnswer === opt.val;
                    const isCorrect = opt.val === 'different';
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setSelectedQuizAnswer(opt.val)}
                        className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-white/5 border-border text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt.label}</span>
                          {isSelected && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback Pill */}
                {selectedQuizAnswer === 'different' ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      {isEn
                        ? 'Correct! "Different" is an adjective modifying the noun "opinions".'
                        : 'ถูกต้อง! "Different" เป็นคำคุณศัพท์ที่ทำหน้าที่ขยายคำนาม "opinions"'}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Target className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      {isEn
                        ? 'Try again! An adjective is needed before the noun "opinions".'
                        : 'ลองใหม่อีกครั้ง! ประโยคนี้ต้องการคำคุณศัพท์หน้าคำนาม "opinions"'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 4: TUTORS FOR DIFFERENT LEARNING NEEDS (4 Pastel Cards)         */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Expert Instruction' : 'ทีมผู้เชี่ยวชาญระดับแนวหน้า'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Tutors for different learning needs' : 'ครูผู้สอนที่ตอบโจทย์ทุกเป้าหมายการเรียนรู้'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Connect with verified native tutors for 1-on-1 personalized feedback, interview simulation, and Cambridge preparation.'
              : 'เรียนรู้กับครูเจ้าของภาษาและผู้เชี่ยวชาญข้อสอบเคมบริดจ์ เพื่อการฝึกฝนแบบตัวต่อตัวและตรวจข้อสอบอย่างแม่นยำ'}
          </p>
        </div>

        {/* 4 Pastel Tutor Cards Grid (Outcrowd Mondly Keyframe 25s) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map((tutor) => {
            const NativeFlag = tutor.nativeFlag;
            return (
              <div
                key={tutor.id}
                className={`rounded-[32px] ${tutor.bgClass} border border-border/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-200 group`}
              >
                <div className="space-y-4">
                  {/* Tutor Portrait Image Frame */}
                  <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-md relative bg-white/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tutor.photo}
                      alt={tutor.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      width={400}
                      height={400}
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-xs flex items-center gap-1.5 text-[11px] font-bold shadow-xs">
                      <NativeFlag className="w-3.5 h-3.5" />
                      <span className="text-slate-800 dark:text-slate-200">{tutor.rate} / hr</span>
                    </div>
                  </div>

                  {/* Tutor Name & Ratings */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{tutor.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{tutor.rating}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tutor.reviews} {isEn ? 'student reviews' : 'รีวิวจากผู้เรียน'} • {tutor.lessonsGiven}
                    </span>
                  </div>

                  {/* Specialty Tag Badge */}
                  <div className="pt-1">
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${tutor.tagBg}`}>
                      {tutor.specialty}
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-5 mt-4 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full py-2.5 rounded-2xl bg-white dark:bg-[#1E1B28] hover:bg-[#FA5D5D] hover:text-white dark:hover:bg-[#FA5D5D] text-slate-900 dark:text-white font-bold text-xs shadow-2xs border border-border transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{isEn ? 'Book trial session' : 'จองคาบทดลองเรียน'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 5: LEARN OR TEACH ONLINE (Outcrowd Mondly Keyframe 30s)        */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10B981]/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Two Paths • One Platform' : 'สองเส้นทาง • บนแพลตฟอร์มเดียว'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Learn or teach online' : 'เรียนรู้หรือสอนออนไลน์ตามเวลาที่คุณเลือก'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Whether you want to learn a new language or share your expert knowledge with students, our platform provides all the tools to succeed.'
              : 'ไม่ว่าคุณจะต้องการเรียนรู้เพื่อความคล่องแคล่ว หรือร่วมเป็นผู้สอนเพื่อแบ่งปันความรู้ เรามีเครื่องมือครบครันรองรับทุกการเติบโต'}
          </p>
        </div>

        {/* 2 Wide Feature Stage Containers from Outcrowd Dribbble Shot 30s */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Begin your learning journey (Sunny Golden Amber Container) */}
          <div className="rounded-[36px] sm:rounded-[44px] bg-[#FEF3C7] dark:bg-[#2A2312] border border-amber-300/80 dark:border-amber-500/20 p-8 sm:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-900 dark:text-amber-300 uppercase tracking-wider inline-block">
                {isEn ? 'For Students & Professionals' : 'สำหรับผู้เรียนและคนทำงาน'}
              </span>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {isEn ? 'Begin your learning journey' : 'เริ่มต้นการเดินทางสู่ความคล่องแคล่ว'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Learning a new language has never been easier. With our platform, you can start speaking a new language from day one.'
                    : 'การเรียนภาษาใหม่ง่ายกว่าที่เคย เริ่มต้นฝึกสนทนาและโต้ตอบได้จริงตั้งแต่วันแรกที่เข้าเรียน'}
                </p>
              </div>

              {/* Checklist from Dribbble shot */}
              <div className="space-y-3 pt-1">
                {[
                  isEn ? 'Choose a tutor - for free!' : 'เลือกติวเตอร์ที่ถูกใจ - ทดลองฟรี!',
                  isEn ? 'Quick response and start of classes' : 'เริ่มเรียนได้ทันทีและตอบรับรวดเร็ว',
                  isEn ? 'Live classes online 24/7' : 'คลาสเรียนสดออนไลน์ตลอด 24 ชั่วโมง',
                  isEn ? 'Learn in small groups or 1-on-1' : 'เลือกเรียนได้ทั้งกลุ่มย่อยและแบบตัวต่อตัว',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Button from Dribbble Shot */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-8 py-3.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{isEn ? 'Start learning' : 'เริ่มต้นเรียนรู้'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded In-App Activity Mockup (Dribbble 30s Screenshot Replica) */}
            <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B28] border border-black/5 dark:border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FA5D5D]" />
                  <span>Glova Study Sync</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5">
                  Last 7 days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Activity</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">17.7 hrs</span>
                </div>
                <div className="flex items-end gap-1.5 h-8">
                  {[40, 60, 90, 75, 55, 30, 85].map((val, vi) => (
                    <div
                      key={vi}
                      className="w-2 rounded-t-sm bg-[#8B5CF6]"
                      style={{ height: `${val}%`, opacity: vi === 2 || vi === 6 ? 1 : 0.4 }}
                    />
                  ))}
                </div>
              </div>

              {/* By platform list */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>8 lessons Glova Platform</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">12.5 h</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>5 lessons Zoom Audio</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">6.8 h</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>3 lessons Google Meet</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">4.2 h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Teach online on your schedule (Soft Lavender Lilac Container) */}
          <div className="rounded-[36px] sm:rounded-[44px] bg-[#EDE9FE] dark:bg-[#221B32] border border-purple-300/80 dark:border-purple-500/20 p-8 sm:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-900 dark:text-purple-300 uppercase tracking-wider inline-block">
                {isEn ? 'For Educators & Tutors' : 'สำหรับครูและติวเตอร์'}
              </span>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {isEn ? 'Teach online on your schedule' : 'สอนออนไลน์ตามตารางเวลาที่คุณเลือก'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Earn money sharing your expert knowledge with students. Sign up to start tutoring online with our global platform.'
                    : 'สร้างรายได้ด้วยการแบ่งปันความเชี่ยวชาญด้านภาษาแก่นักเรียนทั่วโลก จัดตารางและกำหนดอัตราค่าสอนได้อย่างอิสระ'}
                </p>
              </div>

              {/* Checklist from Dribbble shot */}
              <div className="space-y-3 pt-1">
                {[
                  isEn ? 'Find new students worldwide' : 'เข้าถึงผู้เรียนใหม่ๆ จากทั่วทุกมุมโลก',
                  isEn ? 'Set the price for classes' : 'กำหนดอัตราค่าเรียนได้ด้วยตัวเอง',
                  isEn ? 'Grow your tutoring business' : 'สร้างฐานนักเรียนประจำและเติบโตอย่างมั่นคง',
                  isEn ? 'Get paid securely and on time' : 'ระบบรับชำระเงินที่ปลอดภัยและตรงเวลา',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Button from Dribbble Shot */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-8 py-3.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{isEn ? 'Become a tutor' : 'สมัครเป็นผู้สอน'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded In-App Schedule Mockup (Dribbble 30s Screenshot Replica) */}
            <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B28] border border-black/5 dark:border-white/10 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>My schedule: Today</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10">
                  3 Classes Booked
                </span>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Technical English for Beginners</span>
                    <span className="text-[10px] text-slate-500">10:30 – 12:00 • CEFR A2</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md bg-white dark:bg-black/30">
                    Live Now
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">English Punctuation Made Easy</span>
                    <span className="text-[10px] text-slate-500">13:00 – 14:00 • CEFR B2</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10">
                    Upcoming
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Cambridge CAE Writing Intensive</span>
                    <span className="text-[10px] text-slate-500">16:00 – 17:30 • CEFR C1</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 6: FOUR ESSENTIAL CAPABILITIES (Outcrowd Mondly Video Frame)   */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Core Platform Capabilities' : 'ฟังก์ชันหลักเพื่อการเรียนรู้อย่างมีประสิทธิภาพ'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Learn a new language and unlock new possibilities' : 'ปลดล็อกทุกโอกาสแห่งอนาคตด้วยภาษาอังกฤษ'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Our four core pillars eliminate learning friction, reinforce retention, and ensure consistent daily study habits.'
              : 'ขจัดอุปสรรคในการเรียน เสริมสร้างความจำระยะยาว และสร้างวินัยการเรียนรู้อย่างสม่ำเสมอทุกวัน'}
          </p>
        </div>

        {/* 4 Asymmetric Cards Grid matching Outcrowd Dribbble Video Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Effortless scheduling (7 Cols) */}
          <div className="lg:col-span-7 rounded-[36px] bg-white dark:bg-[#1E1B28] border border-border/80 p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {isEn ? 'Effortless scheduling for seamless learning' : 'จัดตารางเรียนง่ายตามจังหวะชีวิตคุณ'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? 'Seamlessly integrate 15-minute lessons into your calendar with automated reminders and streak tracking.'
                    : 'จัดเวลาเรียนวันละ 15 นาทีตามความสะดวก พร้อมระบบแจ้งเตือนและบันทึกสถิติความต่อเนื่อง'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Calendar className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Embedded Schedule Timeline Mockup from Dribbble shot */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="font-bold text-slate-900 dark:text-white">My schedule: Today</span>
                <span className="text-[10px] text-slate-400 font-mono">3 classes planned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-3 rounded-xl bg-purple-600 text-white space-y-1 shadow-xs">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 inline-block">10:30 – 12:00</span>
                  <p className="font-bold leading-tight">Technical English</p>
                  <span className="text-[10px] text-purple-200 block">Beginner A2</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1E1B28] border border-border text-slate-800 dark:text-slate-200 space-y-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 inline-block">13:00 – 14:00</span>
                  <p className="font-bold leading-tight">Punctuation Mastery</p>
                  <span className="text-[10px] text-slate-500 block">Intermediate B1</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1E1B28] border border-border text-slate-800 dark:text-slate-200 space-y-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 inline-block">16:00 – 17:00</span>
                  <p className="font-bold leading-tight">Cambridge FCE Speaking</p>
                  <span className="text-[10px] text-slate-500 block">Advanced C1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Knowledge Tests with B2 Radial Score (5 Cols) */}
          <div className="lg:col-span-5 rounded-[36px] bg-white dark:bg-[#1E1B28] border border-border/80 p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
            <div className="space-y-2 mb-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Challenge yourself with knowledge tests' : 'ท้าทายตนเองด้วยแบบทดสอบวัดระดับ'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? 'Accurately benchmark your proficiency with adaptive Cambridge-calibrated diagnostics.'
                  : 'ประเมินระดับความสามารถด้วยข้อสอบมาตรฐานที่เทียบเคียง Cambridge English Scale'}
              </p>
            </div>

            {/* B2 Knowledge Test Radial Gauge Card from Dribbble shot */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-[#FA5D5D] text-white flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  CEFR Diagnostic
                </span>
                <p className="text-xl font-black">B2 Upper-Intermediate</p>
                <span className="text-xs text-white/80 block">Cambridge Scale: 160 – 179</span>
              </div>

              {/* Radial Circle Progress Indicator */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/20"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-white"
                    strokeDasharray="87, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-extrabold font-mono">87%</span>
                  <span className="text-[8px] font-bold opacity-80">Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Enhance learning with interactive tasks (6 Cols) */}
          <div className="lg:col-span-6 rounded-[36px] bg-white dark:bg-[#1E1B28] border border-border/80 p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-wider inline-block">
                Interactive Practice
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Enhance learning with interactive tasks' : 'เสริมทักษะด้วยโจทย์โต้ตอบหลากหลายรูปแบบ'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? 'Sentence surgery, listening cloze, and voice simulations keep your focus sharp without fatigue.'
                  : 'แบบฝึกหัดเรียบเรียงประโยค ฟังจับใจความ และฝึกสนทนาโต้ตอบที่ทำให้การเรียนเพลิดเพลิน'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Speed Syntax Challenge</span>
                  <span className="text-[10px] text-slate-500">60-second clause restructuring</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/compete')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-[#FA5D5D] transition-colors"
              >
                Try Arena
              </button>
            </div>
          </div>

          {/* Card 4: Personalized Learning: Your Time, Your Way (6 Cols) */}
          <div className="lg:col-span-6 rounded-[36px] bg-white dark:bg-[#1E1B28] border border-border/80 p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 uppercase tracking-wider inline-block">
                Adaptive Rhythm
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Personalized Learning: Your Time, Your Way' : 'การเรียนรู้เฉพาะบุคคล: ตามเวลาและสไตล์ของคุณ'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? 'AI algorithms queue up your personal errors and vocabulary gaps for targeted spaced repetition.'
                  : 'ระบบจะคัดเลือกคำศัพท์และไวยากรณ์ที่คุณมักตอบผิดมาให้ทบทวนซ้ำจนกว่าจะเชี่ยวชาญ'}
              </p>
            </div>

            {/* Weekly Days Bar Selector Mockup */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Study Schedule</span>
                <span className="text-purple-600">Daily 15 Mins</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className={`py-2 rounded-xl text-xs font-bold ${
                      idx < 5 ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-200/70 dark:bg-white/10 text-slate-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6.5 SECTION 6.5: SOCIAL PROOF & TESTIMONIALS MASONRY (Outcrowd Mondly)    */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Proven Results' : 'ผลลัพธ์ที่พิสูจน์ได้จริง'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Loved by learners and educators worldwide' : 'เสียงตอบรับจากผู้เรียนและคุณครูทั่วโลก'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Read how thousands of students have transformed their fluency and passed their Cambridge exams.'
              : 'อ่านเรื่องราวความสำเร็จจากผู้เรียนจริงที่ยกระดับภาษาอังกฤษและสอบผ่านข้อสอบเคมบริดจ์ได้สำเร็จ'}
          </p>
        </div>

        {/* Asymmetric Masonry Grid matching Outcrowd Mondly shot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Hanna Jane Quote (Soft Lavender 6 Cols) */}
          <div className="lg:col-span-6 rounded-[36px] bg-[#EDE9FE] dark:bg-[#221B32] border border-purple-200/60 dark:border-purple-500/20 p-8 sm:p-10 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                "{isEn
                  ? 'The flexibility was amazing! I could choose when and what I would study without feeling overwhelmed.'
                  : 'ความยืดหยุ่นยอดเยี่ยมมาก! ฉันสามารถเลือกเวลาและหัวข้อที่ต้องการเรียนได้เองโดยไม่รู้สึกเครียด'}"
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-purple-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Hanna Jane</span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">CEFR B2 Graduate • London</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 dark:bg-black/30 text-purple-800 dark:text-purple-200">
                Verified Student
              </span>
            </div>
          </div>

          {/* Card 2: 91% Stat Card with Authentic Photo (6 Cols) */}
          <div className="lg:col-span-6 rounded-[36px] overflow-hidden shadow-lg border border-border/80 relative min-h-[300px] flex items-end p-8 sm:p-10 group">
            {/* Authentic Photographic Background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/landing/mondly_stat_student.jpg"
              alt="Students smiling during study session"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              width={800}
              height={600}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-2 text-white">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono">91%</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified Metric</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white/95 leading-snug max-w-md">
                {isEn
                  ? 'Students reported improved conversational confidence and vocabulary recall within 30 days.'
                  : 'ผู้เรียนกว่า 91% ยืนยันว่ามีความมั่นใจในการสนทนาและจำคำศัพท์ได้แม่นยำขึ้นภายใน 30 วันแรก'}
              </p>
            </div>
          </div>

          {/* Card 3: Kristin Watson Quote (6 Cols) */}
          <div className="lg:col-span-6 rounded-[36px] bg-white dark:bg-[#1E1B28] border border-border/80 p-8 sm:p-10 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                "{isEn
                  ? 'Each lesson is slightly more challenging than the previous lesson, keeping me motivated and consistently progressing.'
                  : 'ทุกบทเรียนมีความท้าทายเพิ่มขึ้นทีละขั้นอย่างพอเหมาะ ทำให้ฉันมีแรงจูงใจในการเรียนรู้อย่างต่อเนื่องทุกวัน'}"
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Kristin Watson</span>
                <span className="text-[11px] text-slate-500">Cambridge CAE Candidate</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                CAE Score: 194
              </span>
            </div>
          </div>

          {/* Card 4: Golden Sunny Amber CTA Card (6 Cols) */}
          <div className="lg:col-span-6 rounded-[36px] bg-[#FEF3C7] dark:bg-[#2A2312] border border-amber-300/80 dark:border-amber-500/20 p-8 sm:p-10 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 uppercase tracking-wider inline-block">
                Start Today
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Learn a new language and unlock new possibilities' : 'เรียนรู้ภาษาใหม่และเปิดรับทุกความเป็นไปได้'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {isEn
                  ? 'Take the first step towards fluency with certified native tutors and Cambridge simulations.'
                  : 'เริ่มต้นก้าวแรกสู่อนาคตที่เปิดกว้างด้วยหลักสูตรมาตรฐานสากลและระบบฝึกฝนอัจฉริยะ'}
              </p>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={handleStart}
                className="px-7 py-3 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>{isEn ? 'Start free trial' : 'เริ่มทดลองเรียนฟรี'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION 7: THE 8 MODULAR LEARNING STUDIOS (#studios)                   */}
      {/* ========================================================================= */}
      <section id="studios" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80 bg-white/40 dark:bg-white/[0.02]">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Curriculum Architecture' : 'โครงสร้างหลักสูตร'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? '8 Specialized Learning Studios' : '8 สตูดิโอการเรียนรู้เฉพาะทาง'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Choose your learning focus. Every studio is engineered with dedicated exercises and real-time diagnostic analytics.'
              : 'เลือกโฟกัสทักษะที่ต้องการพัฒนา แต่ละสตูดิโอมีโจทย์และระบบวัดผลวิเคราะห์เชิงลึกเฉพาะด้าน'}
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: isEn ? 'All Studios' : 'ทุกสตูดิโอ' },
            { id: 'skills', label: isEn ? 'Core Skills' : 'ทักษะหลัก 4 ด้าน' },
            { id: 'exam', label: isEn ? 'Exam & Diagnostic' : 'ข้อสอบและวัดระดับ' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setStudioCategory(cat.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                studioCategory === cat.id
                  ? 'bg-[#FA5D5D] text-white shadow-xs'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Studio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredStudios.map((studio) => {
            const Icon = studio.icon;
            return (
              <div
                key={studio.id}
                onClick={() => router.push(studio.route)}
                className="group relative rounded-3xl bg-white dark:bg-[#1E1B28] border border-border/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#FA5D5D]/50 transition-all duration-200 cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon & Level */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: `${studio.color}15`, color: studio.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5">
                      {studio.level}
                    </span>
                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FA5D5D] transition-colors">
                      {studio.name}
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#FA5D5D]">
                      {studio.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {studio.desc}
                  </p>
                </div>

                {/* Bottom Footer with Item Count & Action */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{studio.itemsCount}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#FA5D5D] group-hover:translate-x-0.5 transition-transform">
                    <span>{isEn ? 'Open Studio' : 'เข้าเรียน'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECTION 8: INTERACTIVE CEFR PROGRESSION MAP (#framework)               */}
      {/* ========================================================================= */}
      <section id="framework" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Standardized Milestone Roadmap' : 'เกณฑ์ชี้วัดตามมาตรฐานเคมบริดจ์'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Your CEFR Progression Journey (A1 - C2)' : 'เส้นทางการพัฒนาตามกรอบมาตรฐานสากล CEFR'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'The Common European Framework of Reference (CEFR) is the global benchmark for language proficiency. Click any tier below to explore can-do competencies.'
              : 'มาตรฐานสากลในการประเมินระดับความสามารถทางภาษาอังกฤษ คลิกเลือกระดับเพื่อดูเกณฑ์ชี้วัดและคำศัพท์ที่จำเป็น'}
          </p>
        </div>

        {/* CEFR Level Pill Selector Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevelKey[]).map((level) => {
            const isActive = activeCefr === level;
            const lvlData = cefrLevels[level];
            return (
              <button
                key={level}
                type="button"
                onClick={() => setActiveCefr(level)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FA5D5D] text-white shadow-md shadow-[#FA5D5D]/25 scale-105'
                    : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-border/80 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isActive ? '#FFFFFF' : lvlData.color }}
                />
                <span className="font-extrabold">{level}</span>
                <span className="text-[11px] opacity-80">{lvlData.exam}</span>
              </button>
            );
          })}
        </div>

        {/* Selected CEFR Level Detail Showcase Card */}
        <div className="rounded-[32px] bg-white dark:bg-[#1E1B28] border border-border/80 p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: currentCefr.color }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Level Header & Can-Do Competency (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3.5 py-1 rounded-xl text-xs font-extrabold text-white"
                  style={{ backgroundColor: currentCefr.color }}
                >
                  CEFR {activeCefr}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Cambridge Scale: <strong className="text-slate-900 dark:text-white font-mono">{currentCefr.cambridgeScale}</strong>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Target: {currentCefr.vocabCount}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {isEn ? currentCefr.nameEn : currentCefr.nameTh}
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? 'Can-Do Competency Descriptor' : 'เกณฑ์ความสามารถที่ทำได้จริง'}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  "{isEn ? currentCefr.canDoEn : currentCefr.canDoTh}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push(activeCefr === 'A1' || activeCefr === 'C2' ? '/vocabulary' : '/mock-exams')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-xs shadow-md shadow-[#FA5D5D]/25 transition-all cursor-pointer"
                >
                  <span>{isEn ? `Explore ${activeCefr} Modules` : `เข้าเรียนบทเรียนระดับ ${activeCefr}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs border border-border transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-[#FA5D5D]" />
                  <span>{isEn ? 'Test Your Current Level' : 'ทดสอบวัดระดับของฉัน'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Key Focus Modules (5 Cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-border/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isEn ? 'Featured Learning Modules' : 'บทเรียนเด่นประจำระดับ'}
              </h4>
              <div className="space-y-2">
                {currentCefr.modules.map((mod, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E1B28] border border-border/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] font-bold text-[10px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{mod}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Ready</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SECTION 9: CAMBRIDGE VAULT & TIMED EXAMS (#exams)                      */}
      {/* ========================================================================= */}
      <section id="exams" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80 bg-white/40 dark:bg-white/[0.02]">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            {isEn ? 'Cambridge Official Calibrated' : 'เทียบมาตรฐานเคมบริดจ์'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Cambridge Vault: Official Timed Simulations' : 'คลังข้อสอบเคมบริดจ์จำลองจับเวลาจริง'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Prepare under authentic exam conditions. Experience full-length test sections with automated scoring calibrated against official Cambridge grade boundaries.'
              : 'ฝึกทำข้อสอบเสมือนจริงในสนามสอบ มีตัวจับเวลาตามเกณฑ์ทางการ พร้อมระบบตรวจและแปลงผลคะแนนตาม Cambridge English Scale'}
          </p>
        </div>

        {/* 4 Cambridge Exam Simulation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cambridgeExams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-3xl bg-white dark:bg-[#1E1B28] border border-border/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#FA5D5D]/50 transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-1 rounded-xl text-xs font-extrabold text-white"
                    style={{ backgroundColor: exam.color }}
                  >
                    CEFR {exam.level}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.duration}</span>
                  </span>
                </div>

                {/* Exam Title */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{exam.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{exam.subtitle}</p>
                </div>

                {/* Exam Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {exam.description}
                </p>

                {/* Paper Breakdown List */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isEn ? 'Exam Papers' : 'พาร์ทข้อสอบ'}
                  </span>
                  {exam.papers.map((paper, pi) => (
                    <div key={pi} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{paper.name}</span>
                      <span className="font-mono text-slate-500">{paper.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => router.push('/mock-exams')}
                  className="w-full py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#FA5D5D] dark:hover:bg-[#FA5D5D] dark:hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>{isEn ? 'Start Simulation' : 'เริ่มทำข้อสอบจำลอง'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. SECTION 10: HIGH-IMPACT CONVERSION BANNER                             */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="rounded-[36px] bg-gradient-to-r from-[#FA5D5D] via-[#FF6B6B] to-amber-500 text-white p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          {/* Floating Badges */}
          <div className="flex justify-center gap-2 relative z-10 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'British & American Accents' : 'สำเนียงบริติชและอเมริกัน'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
              <Target className="w-3.5 h-3.5" />
              <span>{isEn ? '15-Minute Daily Goal' : 'เป้าหมายวันละ 15 นาที'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
              <Award className="w-3.5 h-3.5" />
              <span>{isEn ? 'CEFR Certification' : 'การรับรองตามกรอบ CEFR'}</span>
            </span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isEn ? 'Ready to Speak English with Confidence?' : 'พร้อมพูดภาษาอังกฤษอย่างมั่นใจแล้วหรือยัง?'}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {isEn
                ? 'Join 60,000+ active learners reaching their goals. Take our free 15-minute diagnostic test and get your personalized learning path.'
                : 'ร่วมเรียนรู้ไปกับเพื่อนๆ กว่า 60,000 คน เริ่มต้นด้วยแบบทดสอบวัดระดับ 15 นาทีฟรีเพื่อรับแผนการเรียนเฉพาะบุคคล'}
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#FA5D5D] font-extrabold text-sm shadow-xl hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#FA5D5D]" />
              <span>{isEn ? 'Start Free Diagnostic Test' : 'เริ่มทำแบบทดสอบฟรีทันที'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. SECTION 11: GRAND DEFENSIVE FOOTER WITH BOLD BRANDMARK WATERMARK      */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-border/80 bg-white dark:bg-[#1E1B28] pt-14 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-[1536px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-xs relative z-10">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 dark:text-white font-display">Glova.</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D]">CEFR A1-C2</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Production-ready CEFR English proficiency and Cambridge exam preparation platform (A1-C2).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Learning Studios</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/vocabulary" className="hover:text-[#FA5D5D] transition-colors">Vocabulary Studio</Link></li>
              <li><Link href="/grammar" className="hover:text-[#FA5D5D] transition-colors">Grammar Studio</Link></li>
              <li><Link href="/reading" className="hover:text-[#FA5D5D] transition-colors">Reading Studio</Link></li>
              <li><Link href="/listening" className="hover:text-[#FA5D5D] transition-colors">Listening Studio</Link></li>
              <li><Link href="/writing" className="hover:text-[#FA5D5D] transition-colors">Writing Studio</Link></li>
              <li><Link href="/speaking" className="hover:text-[#FA5D5D] transition-colors">Speaking Studio</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Cambridge Vault</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D] transition-colors">A2 Key (KET)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D] transition-colors">B1 Preliminary (PET)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D] transition-colors">B2 First (FCE)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D] transition-colors">C1 Advanced (CAE)</Link></li>
              <li><Link href="/assessment" className="hover:text-[#FA5D5D] transition-colors">Adaptive Diagnostic</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/dashboard" className="hover:text-[#FA5D5D] transition-colors">Student Dashboard</Link></li>
              <li><Link href="/compete" className="hover:text-[#FA5D5D] transition-colors">Speed Arena</Link></li>
              <li><Link href="/profile" className="hover:text-[#FA5D5D] transition-colors">Student Profile</Link></li>
              <li><Link href="/login" className="hover:text-[#FA5D5D] transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-[#FA5D5D] transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        {/* Giant Outcrowd Mondly Style Brandmark Typography Watermark */}
        <div className="w-full text-center select-none pointer-events-none py-4 overflow-hidden">
          <span className="text-[14vw] font-black text-slate-900/[0.08] dark:text-white/[0.07] tracking-tighter leading-none block uppercase font-display select-none">
            GLOVA
          </span>
        </div>

        <div className="max-w-[1536px] mx-auto pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3 relative z-10">
          <p>© 2026 Glova CEFR Platform. All rights reserved.</p>
          <p>Aligned with the Common European Framework of Reference for Languages (CEFR).</p>
        </div>
      </footer>

      {/* Quick Diagnostic Modal */}
      {isDiagnosticOpen && (
        <QuickEnglishCheck
          isModal
          isOpen={isDiagnosticOpen}
          onClose={() => setIsDiagnosticOpen(false)}
          onComplete={(_level?: string) => {
            setIsDiagnosticOpen(false);
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
};
