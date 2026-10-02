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
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

interface LandingViewProps {
  onStartLearning?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [studioCategory, setStudioCategory] = useState<'all' | 'skills' | 'exam'>('all');

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

  // 8 Specialized Learning Studios
  const studios = [
    {
      id: 'vocab',
      name: isEn ? 'Vocabulary Studio' : 'สตูดิโอคลังคำศัพท์',
      level: 'A1 - C2',
      badge: isEn ? 'Spaced Repetition' : 'จำศัพท์ระยะยาว',
      category: 'skills',
      desc: isEn
        ? '3,860 Oxford-grounded lexical items scheduled with exponential memory curves and Cambridge audio.'
        : 'คลังคำศัพท์ 3,860 คำตามมาตรฐาน Oxford พร้อมเสียงอ่านและระบบทบทวนก่อนสมองจะลืม',
      icon: BookOpen,
      color: '#FF9500',
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
        ? 'Interactive error correction, clause restructuring, and diagnostic syntax surgery for formal accuracy.'
        : 'ฝึกแก้ไขไวยากรณ์ผิดและเรียบเรียงโครงสร้างประโยคเพื่อความถูกต้องทางวิชาการ',
      icon: Layers,
      color: '#5B5CE2',
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
        ? 'Academic and professional passages with micro-timing, inference analysis, and gist comprehension.'
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
        ? 'Native British, American, and Australian dialogues with note-taking prompts and speed variation.'
        : 'บทสนทนาและบรรยายวิชาการสำเนียงอังกฤษและอเมริกัน พร้อมฝึกการจับใจความและจดโน้ต',
      icon: Headphones,
      color: '#38BDF8',
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
        ? 'Essay and report drafting with real-time feedback on lexical resource, coherence, and grammar precision.'
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
        ? 'Speech recognition evaluating intonation, phoneme accuracy, response latency, and discourse flow.'
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
      badge: isEn ? 'Adaptive Engine' : 'ระบบปรับระดับอัตโนมัติ',
      category: 'exam',
      desc: isEn
        ? '15-minute diagnostic test that precisely maps your current English abilities across all CEFR bands.'
        : 'แบบประเมินความสามารถ 15 นาที ระบุระดับความสามารถและจุดที่ต้องพัฒนาอย่างตรงจุด',
      icon: Award,
      color: '#F59E0B',
      route: '/assessment',
      itemsCount: 'Full Diagnostic',
    },
    {
      id: 'mockExam',
      name: isEn ? 'Cambridge Vault' : 'คลังข้อสอบเคมบริดจ์',
      level: 'A2 - C1',
      badge: isEn ? 'Official Formats' : 'จำลองข้อสอบจริง',
      category: 'exam',
      desc: isEn
        ? 'Full-length timed simulations for KET (A2), PET (B1), FCE (B2), and CAE (C1) examinations.'
        : 'ชุดข้อสอบจำลองเต็มรูปแบบของเคมบริดจ์ จับเวลาจริงและรายงานคะแนนเทียบเกณฑ์ทางการ',
      icon: GraduationCap,
      color: '#8B5CF6',
      route: '/mock-exams',
      itemsCount: '4 Full Exams',
    },
  ];

  const filteredStudios = studioCategory === 'all'
    ? studios
    : studios.filter((s) => s.category === studioCategory);

  // CEFR Framework Ladder
  const cefrLevels = [
    {
      level: 'A1',
      title: isEn ? 'Beginner / Starter' : 'ระดับเริ่มต้น',
      exam: 'Cambridge Pre-A1',
      desc: isEn
        ? 'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs.'
        : 'เข้าใจและใช้สำนวนคุ้นเคยในชีวิตประจำวัน สามารถแนะนำตนเองและถามตอบข้อมูลพื้นฐานได้',
      color: '#10B981',
    },
    {
      level: 'A2',
      title: isEn ? 'Elementary' : 'ระดับพื้นฐาน',
      exam: 'A2 Key (KET)',
      desc: isEn
        ? 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar matters.'
        : 'สื่อสารในสถานการณ์ทั่วไป สื่อความต้องการง่ายๆ เกี่ยวกับข้อมูลครอบครัว ช็อปปิ้ง และสิ่งแวดล้อมใกล้ตัว',
      color: '#38BDF8',
    },
    {
      level: 'B1',
      title: isEn ? 'Intermediate' : 'ระดับกลาง',
      exam: 'B1 Preliminary (PET)',
      desc: isEn
        ? 'Can understand the main points of clear standard input on familiar matters and handle travel interactions.'
        : 'เข้าใจประเด็นหลักในเรื่องที่คุ้นเคยในที่ทำงานหรือโรงเรียน สามารถสื่อสารระหว่างการท่องเที่ยวและบอกเล่าความรู้สึกได้',
      color: '#5B5CE2',
    },
    {
      level: 'B2',
      title: isEn ? 'Upper Intermediate' : 'ระดับกลางสูง',
      exam: 'B2 First (FCE)',
      desc: isEn
        ? 'Can interact with a degree of fluency with native speakers and understand complex text on concrete and abstract topics.'
        : 'สื่อสารได้อย่างคล่องแคล่วและเป็นธรรมชาติกับเจ้าของภาษา เขียนข้อความชัดเจนในหัวข้อที่หลากหลาย',
      color: '#FF9500',
    },
    {
      level: 'C1',
      title: isEn ? 'Advanced' : 'ระดับสูง',
      exam: 'C1 Advanced (CAE)',
      desc: isEn
        ? 'Can understand a wide range of demanding, longer texts, and express ideas fluently without obvious searching for expressions.'
        : 'เข้าใจบทความยาวและซับซ้อน สามารถใช้ภาษาในเชิงสังคม วิชาการ และวิชาชีพได้อย่างยืดหยุ่นและมีประสิทธิภาพ',
      color: '#FA5D5D',
    },
    {
      level: 'C2',
      title: isEn ? 'Proficiency / Mastery' : 'ระดับเชี่ยวชาญ',
      exam: 'C2 Proficiency (CPE)',
      desc: isEn
        ? 'Can understand with ease virtually everything heard or read, summarizing information and presenting arguments coherently.'
        : 'เข้าใจสิ่งที่ได้ยินหรือได้อ่านอย่างถ่องแท้ สามารถสรุปข้อมูลและให้เหตุผลได้อย่างชัดเจนและแม่นยำในทุกบริบท',
      color: '#9333EA',
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F3] dark:bg-[#0D1117] text-slate-900 dark:text-[#EDEBE8] transition-colors duration-300">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Anastasia Golovko EduMaster Asymmetric Layout            */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle Decorative Ambient Lighting */}
        <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-28 right-10 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Compelling Editorial Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#5B5CE2] animate-pulse" />
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Cambridge English Standard • CEFR A1-C2
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              {isEn ? (
                <>
                  Elevate Your English With <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-[#5B5CE2] to-amber-500">
                    Systematic CEFR Mastery
                  </span>
                </>
              ) : (
                <>
                  เก่งภาษาอังกฤษอย่างเป็นระบบ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-[#5B5CE2] to-amber-500">
                    วัดผลได้จริงตามมาตรฐาน CEFR
                  </span>
                </>
              )}
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {isEn
                ? 'Master listening, reading, writing, and speaking across 8 specialized learning studios. Grounded in Cambridge frameworks with AI phoneme evaluation, Oxford spaced repetition, and real-time exam simulations.'
                : 'พัฒนาทักษะการฟัง พูด อ่าน เขียน ผ่าน 8 สตูดิโอการเรียนรู้เฉพาะทาง รองรับข้อสอบมาตรฐาน Cambridge พร้อมระบบวิเคราะห์การออกเสียงด้วย AI และการทบทวนคำศัพท์อัจฉริยะ'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 dark:bg-[#5B5CE2] hover:bg-indigo-700 dark:hover:bg-[#4E4FD6] text-white font-bold text-sm shadow-[0_3px_0_#3730A3] dark:shadow-[0_3px_0_#3839A0] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? 'Start Free Diagnostic Test' : 'เริ่มทำแบบทดสอบวัดระดับฟรี'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('studios')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-[#1C2430] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-sm shadow-2xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>{isEn ? 'Explore 8 Studios' : 'สำรวจ 8 สตูดิโอ'}</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">120,000+</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isEn ? 'Questions Solved' : 'ข้อสอบถูกฝึกฝน'}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">98.4%</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isEn ? 'Cambridge Pass Rate' : 'อัตราการสอบผ่าน'}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-amber-500 tabular-nums">15,400+</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isEn ? 'Active Learners' : 'ผู้เรียนในระบบ'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: EduMaster Course Studio Radial Preview (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-900/5 p-6 sm:p-7 space-y-6">
              {/* Active Studio Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold shadow-2xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">B2 First Preparation</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Independent Academic Studio</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Level B2
                </span>
              </div>

              {/* Progress Bar & Target Exam Status */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] dark:bg-[#0D1117] border border-slate-200/70 dark:border-white/5 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Exam Readiness Progress</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">74%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full w-[74%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Current: Unit 8 Collocations</span>
                  <span>Est. Score: 168 / 190</span>
                </div>
              </div>

              {/* 4 Skills Diagnostic Radar Capsule */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">4-Skill Proficiency</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C2430] border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Reading</span>
                    <span className="font-bold text-slate-900 dark:text-white">88% (B2)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C2430] border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Listening</span>
                    <span className="font-bold text-slate-900 dark:text-white">92% (C1)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C2430] border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Speaking</span>
                    <span className="font-bold text-slate-900 dark:text-white">76% (B2)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C2430] border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Writing</span>
                    <span className="font-bold text-slate-900 dark:text-white">80% (B2)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <button
                type="button"
                onClick={() => router.push('/vocabulary')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Continue Practice Session</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 8 SPECIALIZED LEARNING STUDIOS (#studios)                           */}
      {/* ========================================================================= */}
      <section id="studios" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200 dark:border-white/10">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            Curriculum Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? '8 Specialized Learning Studios' : '8 สตูดิโอการเรียนรู้เฉพาะทาง'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Every studio is purposefully designed to target distinct cognitive aspects of language acquisition, from spontaneous speech to timed academic reading.'
              : 'ออกแบบมาเพื่อพัฒนาทักษะเฉพาะด้านอย่างตรงจุด ตั้งแต่การพูดสนทนาแบบเรียลไทม์ไปจนถึงการทำข้อสอบวิชาการแบบจับเวลา'}
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
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
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
                className="group relative rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 p-5 flex flex-col justify-between hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-400/40 transition-all duration-200 cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon & Level */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: `${studio.color}15`, color: studio.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5">
                      {studio.level}
                    </span>
                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {studio.name}
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {studio.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {studio.desc}
                  </p>
                </div>

                {/* Bottom Footer with Item Count & Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{studio.itemsCount}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
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
      {/* 3. CEFR PROFICIENCY FRAMEWORK MAP (#framework)                            */}
      {/* ========================================================================= */}
      <section id="framework" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            International Alignment
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'The Global CEFR Framework Roadmap' : 'เส้นทางความก้าวหน้าตามมาตรฐานสากล CEFR'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Recognized globally by universities, employers, and immigration authorities. Track your growth from basic survival phrases to effortless native mastery.'
              : 'มาตรฐานที่ได้รับการยอมรับจากมหาวิทยาลัยและองค์กรชั้นนำทั่วโลก ติดตามพัฒนาการตั้งแต่พื้นฐานไปจนถึงการสื่อสารระดับมืออาชีพ'}
          </p>
        </div>

        {/* 6 CEFR Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cefrLevels.map((lvl) => (
            <div
              key={lvl.level}
              className="rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-10 h-10 rounded-xl font-extrabold font-mono text-base flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: lvl.color }}
                >
                  {lvl.level}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {lvl.exam}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{lvl.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lvl.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>{isEn ? 'Full Studio Practice Included' : 'มีแบบฝึกหัดรองรับในทุกสตูดิโอ'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CAMBRIDGE EXAM VAULT (#exams)                                          */}
      {/* ========================================================================= */}
      <section id="exams" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              Simulation Vault
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {isEn ? (
                <>
                  Official Cambridge Exam <br />
                  <span className="text-indigo-600 dark:text-[#5B5CE2]">Timed Practice Simulations</span>
                </>
              ) : (
                <>
                  คลังข้อสอบจำลองเคมบริดจ์ <br />
                  <span className="text-indigo-600 dark:text-[#5B5CE2]">จับเวลาตามข้อสอบจริงทุกมิติ</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn
                ? 'Prepare with confidence for KET (A2), PET (B1), FCE (B2), and CAE (C1). Experience authentic sectional time limits, automated scoring algorithms, and detailed diagnostic breakdown reports.'
                : 'ฝึกทำข้อสอบเสมือนจริงของเคมบริดจ์ ทั้ง KET, PET, FCE และ CAE พร้อมระบบจับเวลาอัตโนมัติ การตัดเกรดเทียบเท่า และการวิเคราะห์จุดอ่อนเพื่อวางแผนอ่านสอบ'}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Authentic Test Blueprint</h4>
                  <p className="text-[11px] text-slate-500">Same number of parts, word limits, and question taxonomies as the official exam.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant Scaled Score Reporting</h4>
                  <p className="text-[11px] text-slate-500">Receive immediate Cambridge English Scale scores (120 - 210) upon submission.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/mock-exams')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>{isEn ? 'Access Cambridge Vault' : 'เข้าสู่คลังข้อสอบจำลอง'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {[
              { code: 'KET', name: 'A2 Key', desc: 'Basic Daily English', score: '120-139' },
              { code: 'PET', name: 'B1 Preliminary', desc: 'Practical Everyday Use', score: '140-159' },
              { code: 'FCE', name: 'B2 First', desc: 'Work & Study Fluency', score: '160-179' },
              { code: 'CAE', name: 'C1 Advanced', desc: 'Professional Mastery', score: '180-199' },
            ].map((ex) => (
              <div
                key={ex.code}
                onClick={() => router.push('/mock-exams')}
                className="p-5 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 hover:border-indigo-500/40 space-y-3 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-base font-mono text-indigo-600 dark:text-indigo-400">
                    {ex.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                    {ex.score}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ex.name}</h4>
                  <p className="text-[11px] text-slate-500">{ex.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TOP LEARNERS & ACHIEVEMENTS (#achievements)                             */}
      {/* ========================================================================= */}
      <section id="achievements" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            Learner Community
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Proven Results from Active Learners' : 'เสียงสะท้อนความสำเร็จจากผู้เรียนจริง'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isEn
              ? 'Thousands of students and professionals reach their targeted CEFR scores using our systematic learning studios.'
              : 'ผู้เรียนกว่าหมื่นคนสามารถบรรลุเป้าหมายคะแนนสอบเคมบริดจ์และต่อยอดการศึกษาหรือการทำงานได้สำเร็จ'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Dr. Thanawat K.',
              role: 'Medical Resident • Chulalongkorn',
              text: 'The Speaking Studio helped me overcome pronunciation hesitation. Passed B2 First with 178 score on my first attempt.',
              target: 'Passed FCE (178)',
            },
            {
              name: 'Pattarapol M.',
              role: 'Software Engineer • Bangkok',
              text: 'Spaced repetition vocabulary ensured I remembered advanced academic words without cramming before the exam.',
              target: 'C1 Advanced (189)',
            },
            {
              name: 'Nichapat S.',
              role: 'High School Student • Triam Udom',
              text: 'The Cambridge timed mock exams felt identical to the real test. No surprises on exam day!',
              target: 'B1 Preliminary (156)',
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{t.text}"
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {t.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CONVERSION CTA BANNER                                                  */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200 dark:border-white/10">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isEn ? 'Discover Your True CEFR Level Today' : 'ค้นหาระดับภาษาอังกฤษที่แท้จริงของคุณวันนี้'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              {isEn
                ? 'Take our comprehensive 15-minute diagnostic test and receive a personalized learning roadmap with zero commitment.'
                : 'ทำแบบทดสอบวัดระดับ 15 นาทีฟรี พร้อมรับแผนการเรียนรู้ส่วนบุคคลที่ตรงกับเป้าหมายของคุณ'}
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-950 font-extrabold text-sm shadow-lg hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{isEn ? 'Start Free Assessment Now' : 'เริ่มทำแบบทดสอบฟรีทันที'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DEFENSIVE MULTI-COLUMN FOOTER                                          */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#141A22] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1536px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white font-display">Glova.</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">CEFR</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Production-ready CEFR English proficiency and Cambridge exam preparation platform (A1-C2).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Learning Studios</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/vocabulary" className="hover:text-indigo-600">Vocabulary Studio</Link></li>
              <li><Link href="/grammar" className="hover:text-indigo-600">Grammar Studio</Link></li>
              <li><Link href="/reading" className="hover:text-indigo-600">Reading Studio</Link></li>
              <li><Link href="/listening" className="hover:text-indigo-600">Listening Studio</Link></li>
              <li><Link href="/writing" className="hover:text-indigo-600">Writing Studio</Link></li>
              <li><Link href="/speaking" className="hover:text-indigo-600">Speaking Studio</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Cambridge Vault</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/mock-exams" className="hover:text-indigo-600">A2 Key (KET)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-indigo-600">B1 Preliminary (PET)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-indigo-600">B2 First (FCE)</Link></li>
              <li><Link href="/mock-exams" className="hover:text-indigo-600">C1 Advanced (CAE)</Link></li>
              <li><Link href="/assessment" className="hover:text-indigo-600">Adaptive Diagnostic</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><Link href="/compete" className="hover:text-indigo-600">Speed Arena</Link></li>
              <li><Link href="/profile" className="hover:text-indigo-600">Student Profile</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-indigo-600">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1536px] mx-auto pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
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
