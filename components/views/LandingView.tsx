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
      {/* 1. HERO SECTION: Outcrowd Mondly Conversational Language World            */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden">
        {/* Soft Ambient Mondly Radial Glows */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#FA5D5D]/15 dark:bg-[#FA5D5D]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-24 right-10 w-80 h-80 rounded-full bg-[#38BDF8]/15 dark:bg-[#38BDF8]/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Conversational Narrative & Floating Speech Bubbles (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 relative z-10">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/10 border border-[#FA5D5D]/20 shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#FA5D5D] animate-pulse" />
              <span className="text-[11px] font-bold text-[#FA5D5D] uppercase tracking-wider">
                Language Learning Reimagined • CEFR A1-C2
              </span>
            </div>

            {/* Outcrowd Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              {isEn ? (
                <>
                  Master Real English <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA5D5D] via-[#FF7575] to-amber-500">
                    Active Conversations
                  </span>
                </>
              ) : (
                <>
                  เก่งภาษาอังกฤษอย่างเป็นธรรมชาติ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA5D5D] via-[#FF7575] to-amber-500">
                    ด้วยบทสนทนาจริง
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {isEn
                ? 'Speak with real-world confidence from day one. Practice interactive dialogues with AI speech evaluation, master 3,860 Oxford vocabulary items, and prepare for Cambridge KET, PET, and FCE exams.'
                : 'พูดภาษาอังกฤษได้อย่างมั่นใจตั้งแต่วันแรก ฝึกสนทนาโต้ตอบจำลองสถานการณ์จริงด้วย AI ตรวจจับสำเนียง ทบทวนคำศัพท์อัจฉริยะ และทำข้อสอบจำลองเคมบริดจ์'}
            </p>

            {/* Floating Multilingual Speech Bubbles (Mondly Signature Style) */}
            <div className="pt-2 pb-1 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border shadow-xs -rotate-1 hover:rotate-0 transition-transform cursor-default">
                <UkFlagSvg className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Hello, Explorer!</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#1E1B28] border border-[#FA5D5D]/30 shadow-xs rotate-2 hover:rotate-0 transition-transform cursor-default">
                <ThaiFlagSvg className="w-4 h-4" />
                <span className="text-xs font-bold text-[#FA5D5D]">สวัสดีคนเก่ง!</span>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border shadow-xs -rotate-2 hover:rotate-0 transition-transform cursor-default">
                <SpanishFlagSvg className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">¡Vamos a hablar!</span>
              </div>
              <div className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border shadow-xs rotate-1 hover:rotate-0 transition-transform cursor-default">
                <FrenchFlagSvg className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bonjour!</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-lg shadow-[#FA5D5D]/25 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? 'Start Free Assessment' : 'เริ่มประเมินระดับฟรี'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('conversations')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#1E1B28] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-border font-bold text-sm shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 text-[#FA5D5D]" />
                <span>{isEn ? 'Try Interactive Dialogue' : 'ทดลองบทสนทนาจริง'}</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>120,000+ Questions Solved</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FA5D5D]" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Mondly Interactive Conversation & Speech Simulator (5 Cols) */}
          <div className="lg:col-span-5 relative z-10">
            <div className="rounded-[32px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-2xl shadow-rose-950/10 p-6 sm:p-7 space-y-5">
              {/* Header with Live Waveform Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center font-bold">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Interactive Speech Engine
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Native British & American Audio</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Live Preview
                </span>
              </div>

              {/* Scenario Pill Switcher */}
              <div className="grid grid-cols-4 p-1 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold gap-1">
                {[
                  { id: 'cafe', label: 'Café' },
                  { id: 'airport', label: 'Airport' },
                  { id: 'hotel', label: 'Hotel' },
                  { id: 'interview', label: 'Career' },
                ].map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setActiveScenario(sc.id as any);
                      setHasRecorded(false);
                    }}
                    className={`py-1.5 rounded-lg text-center transition-all ${
                      activeScenario === sc.id
                        ? 'bg-white dark:bg-[#282436] text-slate-900 dark:text-white shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              {/* Dialogue Bubble: AI Mentor Prompt with Real Speech Synthesis */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#171421] border border-slate-200/80 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UkFlagSvg className="w-3.5 h-3.5" />
                    <span>AI Language Mentor</span>
                  </span>
                  <button
                    type="button"
                    onClick={handlePlaySample}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-[#FA5D5D] hover:bg-[#FA5D5D]/10 transition-colors cursor-pointer"
                    title="Click to Listen with Oxford English Audio"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-[#FA5D5D]' : ''}`} />
                    <span className="text-[10px]">{isPlayingAudio ? 'Playing...' : 'Listen'}</span>
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{currentScenario.mentorPrompt}"
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  {currentScenario.mentorTranslation}
                </p>
              </div>

              {/* Dialogue Bubble: Learner Spoken Response with Practice Action */}
              <div className="p-4 rounded-2xl bg-[#FA5D5D]/5 border border-[#FA5D5D]/20 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#FA5D5D] flex items-center gap-1.5">
                    <ThaiFlagSvg className="w-3.5 h-3.5" />
                    <span>Learner Spoken Input</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Fluency: {currentScenario.score}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                  "{currentScenario.learnerAnswer}"
                </p>
                
                {/* Collocation Tag Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {currentScenario.collocations.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FA5D5D]/10 text-[#FA5D5D]"
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>

                {/* Interactive Mic Practice Action */}
                <div className="pt-2 border-t border-[#FA5D5D]/15 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSimulateRecording}
                    disabled={isRecording}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1B28] text-xs font-bold text-slate-800 dark:text-slate-200 border border-border shadow-2xs hover:border-[#FA5D5D] transition-all cursor-pointer"
                  >
                    <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-[#FA5D5D]'}`} />
                    <span>{isRecording ? (isEn ? 'Analyzing...' : 'กำลังฟังเสียง...') : (isEn ? 'Practice Speaking' : 'ฝึกพูดประโยคนี้')}</span>
                  </button>

                  {hasRecorded && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Native Cadence Passed' : 'สำเนียงผ่านเกณฑ์เคมบริดจ์'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Pronunciation Target Indicator */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-white/5 text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{currentScenario.accent}</span>
                </div>
                <span className="font-bold text-[#FA5D5D]">Target: {currentScenario.cefr}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE CONVERSATION HIGHLIGHT (#conversations)                     */}
      {/* ========================================================================= */}
      <section id="conversations" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-bold uppercase tracking-wider">
            Conversational Immersion
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Learn Through Active Situations, Not Rote Rules' : 'เรียนรู้ผ่านสถานการณ์จำลองจริง ไม่ท่องจำกฎ'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Traditional apps teach isolated words. Glova immerses you in real dialogues so you can speak spontaneously in business, travel, and exams.'
              : 'ก้าวข้ามการท่องจำคำศัพท์เดี่ยวๆ Glova พาคุณเข้าสู่บทสนทนาจำลองในชีวิตประจำวันเพื่อความคล่องแคล่วและเป็นธรรมชาติ'}
          </p>
        </div>

        {/* 3 Conversational Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4 hover:border-[#FA5D5D]/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center font-bold">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? 'Phoneme-Level Pronunciation' : 'ตรวจการออกเสียงระดับพยางค์'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isEn
                ? 'Get instant visual feedback on pitch, vowel stress, and consonant clarity to sound natural and confident.'
                : 'รับฟีดแบ็กทันทีแบบเรียลไทม์ ชี้จุดที่ออกเสียงเพี้ยนและวิธีปรับรูปปากให้ถูกต้องตามสำเนียงสากล'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4 hover:border-[#38BDF8]/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? 'Spaced Repetition Memory Engine' : 'ระบบทบทวนศัพท์ก่อนสมองลืม'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isEn
                ? 'Words you practice automatically enter your review queue at the optimal psychological retention intervals.'
                : 'อัลกอริทึมวิเคราะห์อัตราการลืมคำศัพท์และจัดรอบทบทวนอัตโนมัติ ช่วยให้จำศัพท์กว่า 3,860 คำได้ในระยะยาว'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? 'Cambridge CEFR Calibration' : 'เทียบมาตรฐานระดับเคมบริดจ์'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isEn
                ? 'Track your measurable climb from A1 Everyday Starter up to C1 Advanced Fluency with Cambridge scoring.'
                : 'วัดความก้าวหน้าอย่างชัดเจนตามสเกลคะแนน Cambridge English Scale (120-210) เพื่อใช้ยื่นเรียนต่อและสมัครงาน'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 8 MODULAR LEARNING STUDIOS (#studios)                               */}
      {/* ========================================================================= */}
      <section id="studios" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80 bg-white/40 dark:bg-white/[0.02]">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            Curriculum Architecture
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className="group relative rounded-3xl bg-white dark:bg-[#1E1B28] border border-border/80 p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#FA5D5D]/50 transition-all duration-200 cursor-pointer"
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
      {/* 4. INTERACTIVE CEFR PROGRESSION MAP (#framework)                          */}
      {/* ========================================================================= */}
      <section id="framework" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 text-xs font-bold uppercase tracking-wider">
            Standardized Milestone Roadmap
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-xs shadow-md shadow-[#FA5D5D]/25 transition-all cursor-pointer"
                >
                  <span>{isEn ? `Explore ${activeCefr} Modules` : `เข้าเรียนบทเรียนระดับ ${activeCefr}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs border border-border transition-colors cursor-pointer"
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
      {/* 5. CAMBRIDGE VAULT & TIMED EXAMS (#exams)                                 */}
      {/* ========================================================================= */}
      <section id="exams" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80 bg-white/40 dark:bg-white/[0.02]">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            Cambridge Official Calibrated
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
                    Exam Papers
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
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#FA5D5D] dark:hover:bg-[#FA5D5D] dark:hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
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
      {/* 6. HIGH-IMPACT CONVERSION BANNER (Outcrowd Mondly Coral Gradient)          */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/80">
        <div className="rounded-[32px] bg-gradient-to-r from-[#FA5D5D] via-[#FF6B6B] to-amber-500 text-white p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          {/* Floating Language & Feature Badges (Zero raw emojis) */}
          <div className="flex justify-center gap-2 relative z-10 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
              <Volume2 className="w-3.5 h-3.5" />
              <span>British & American Accents</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
              <Target className="w-3.5 h-3.5" />
              <span>15-Minute Daily Goal</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
              <Award className="w-3.5 h-3.5" />
              <span>CEFR Certification</span>
            </span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isEn ? 'Ready to Speak English with Confidence?' : 'พร้อมพูดภาษาอังกฤษอย่างมั่นใจแล้วหรือยัง?'}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {isEn
                ? 'Join 15,400+ active learners reaching their goals. Take our free 15-minute diagnostic test and get your personalized learning path.'
                : 'ร่วมเรียนรู้ไปกับเพื่อนๆ กว่า 15,400 คน เริ่มต้นด้วยแบบทดสอบวัดระดับ 15 นาทีฟรีเพื่อรับแผนการเรียนเฉพาะบุคคล'}
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#FA5D5D] font-extrabold text-sm shadow-xl hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#FA5D5D]" />
              <span>{isEn ? 'Start Free Diagnostic Test' : 'เริ่มทำแบบทดสอบฟรีทันที'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DEFENSIVE MULTI-COLUMN FOOTER                                          */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-border/80 bg-white dark:bg-[#1E1B28] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1536px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white font-display">Glova.</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D]">CEFR</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Production-ready CEFR English proficiency and Cambridge exam preparation platform (A1-C2).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Learning Studios</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/vocabulary" className="hover:text-[#FA5D5D]">Vocabulary Studio</Link></li>
              <li><Link href="/grammar" className="hover:text-[#FA5D5D]">Grammar Studio</Link></li>
              <li><Link href="/reading" className="hover:text-[#FA5D5D]">Reading Studio</Link></li>
              <li><Link href="/listening" className="hover:text-[#FA5D5D]">Listening Studio</Link></li>
              <li><Link href="/writing" className="hover:text-[#FA5D5D]">Writing Studio</Link></li>
              <li><Link href="/speaking" className="hover:text-[#FA5D5D]">Speaking Studio</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Cambridge Vault</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D]">A2 Key (KET)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D]">B1 Preliminary (PET)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D]">B2 First (FCE)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-[#FA5D5D]">C1 Advanced (CAE)</Link></li>
              <li><Link href="/assessment" className="hover:text-[#FA5D5D]">Adaptive Diagnostic</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/compete" className="hover:text-[#FA5D5D]">Speed Arena</Link></li>
              <li><Link href="/profile" className="hover:text-[#FA5D5D]">Student Profile</Link></li>
              <li><Link href="/login" className="hover:text-[#FA5D5D]">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-[#FA5D5D]">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1536px] mx-auto pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© 2026 Glova CEFR Platform. All rights reserved.</p>
          <p>Aligned with the Common European Framework of Reference for Languages (CEFR).</p>
        </div>
      </footer>

      {/* Quick Diagnostic Modal */}
      {isDiagnosticOpen && (
        <QuickEnglishCheck
          isOpen={isDiagnosticOpen}
          onClose={() => setIsDiagnosticOpen(false)}
          onComplete={(_level) => {
            setIsDiagnosticOpen(false);
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
};
