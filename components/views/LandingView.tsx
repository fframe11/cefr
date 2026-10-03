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
  Compass,
  GraduationCap,
  Layers,
  ChevronRight,
  Zap,
  Check,
  FileText,
  Clock,
  Sparkle,
  Library,
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

  const [isQuickCheckOpen, setIsQuickCheckOpen] = useState(false);

  const handleStart = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      router.push('/dashboard');
    }
  };

  // 6 Core Skill Studios
  const skillStudios = [
    {
      id: 'vocab',
      titleTh: 'คลังคำศัพท์ (Vocabulary Vault)',
      titleEn: 'Vocabulary Vault',
      descTh: '3,860+ คำศัพท์คัดสรรตาม CEFR A1–C2 พร้อมระบบทบทวน Spaced Repetition และ Collocations',
      descEn: '3,860+ CEFR-curated words with spaced repetition and high-frequency collocations',
      icon: BookOpen,
      color: 'from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      badge: 'A1 – C2',
      href: '/vocabulary',
    },
    {
      id: 'grammar',
      titleTh: 'คลังไวยากรณ์ (Grammar Studio)',
      titleEn: 'Grammar Studio',
      descTh: 'สรุปครบทุก Tense, กฎสำคัญ และจุดผิดที่พบบ่อย (Common Mistakes) พร้อมแบบฝึกหัดเจาะจง',
      descEn: '12 core tenses, sentence structures, and high-frequency mistakes with targeted practice',
      icon: Layers,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badge: 'A1 – B2',
      href: '/grammar',
    },
    {
      id: 'reading',
      titleTh: 'การอ่านจับใจความ (Reading Lab)',
      titleEn: 'Reading Lab',
      descTh: 'บทอ่านหลากหลายประเภท (อีเมล, บทความ, งานวิจัย) พร้อมคลังศัพท์และคำถามวัดความเข้าใจ',
      descEn: 'Diverse authentic texts with glossaries and reading comprehension questions',
      icon: FileText,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: 'A2 – C1',
      href: '/reading',
    },
    {
      id: 'listening',
      titleTh: 'การฟังสำเนียงจริง (Listening Lounge)',
      titleEn: 'Listening Lounge',
      descTh: 'ฝึกฟังบทสนทนาและประกาศในชีวิตจริง หลากหลายสำเนียง ปรับความเร็วได้ พร้อมสคริปต์ประกอบ',
      descEn: 'Real-world dialogues and announcements across accents with speed controls and transcripts',
      icon: Headphones,
      color: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      badge: 'A1 – C1',
      href: '/listening',
    },
    {
      id: 'writing',
      titleTh: 'การเขียนอัตนัย (Writing Workshop)',
      titleEn: 'Writing Workshop',
      descTh: 'ฝึกเขียนอีเมล เรียงความ และรายงานตามแนวข้อสอบจริง พร้อมเกณฑ์ประเมินระดับ CEFR',
      descEn: 'Email, essay, and report prompts aligned with exam formats and CEFR rubrics',
      icon: PenTool,
      color: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badge: 'B1 – C1',
      href: '/writing',
    },
    {
      id: 'speaking',
      titleTh: 'การฝึกพูดออกเสียง (Speaking Lab)',
      titleEn: 'Speaking Lab',
      descTh: 'ฝึกตอบคำถามตามสถานการณ์จำลอง บันทึกเสียงและฟังเพื่อเทียบเคียงสำเนียงที่ถูกต้อง',
      descEn: 'Situational speaking tasks with audio playback to refine pronunciation and fluency',
      icon: Mic,
      color: 'from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      badge: 'A1 – B2',
      href: '/speaking',
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F3] dark:bg-[#13111C] text-slate-900 dark:text-[#EDEBE8] transition-colors duration-300">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Clean, Direct, Immediate Clarity                         */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-20 text-center">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-8 left-1/4 w-80 h-80 rounded-full bg-[#FA5D5D]/10 dark:bg-[#FA5D5D]/5 blur-3xl pointer-events-none" />
        <div className="absolute top-16 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Framework Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FA5D5D] animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isEn ? 'CEFR A1–C2 Framework • Self-Paced Practice' : 'อิงตามกรอบแนวทาง CEFR (A1–C2) • เรียนรู้ด้วยตนเอง'}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
            {isEn ? (
              <>
                Assess and elevate your English{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA5D5D] to-amber-500">
                  with total clarity
                </span>
              </>
            ) : (
              <>
                ประเมินและฝึกฝนภาษาอังกฤษ{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA5D5D] to-amber-500">
                  อย่างเป็นระบบและตรงจุด
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? 'Not sure where to start? Take a 3-minute diagnostic to benchmark your level, or jump directly into 6 focused skill studios and exam simulations.'
              : 'ไม่แน่ใจว่าจะเริ่มตรงไหน? เริ่มต้นง่ายๆ ด้วยแบบวัดระดับ 3 นาทีเพื่อดูระดับภาษาปัจจุบันของคุณ หรือเลือกเข้าห้องฝึกฝนทักษะเฉพาะด้านได้ทันที'}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-md shadow-[#FA5D5D]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEn ? 'Start Learning Free' : 'เริ่มเรียนฟรี'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsQuickCheckOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#FA5D5D]" />
              <span>{isEn ? 'Quick Placement Test (3 Mins)' : 'ทำแบบวัดระดับด่วน (3 นาที)'}</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-3 pt-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? 'Cambridge English Scale Aligned' : 'เทียบเคียง Cambridge English Scale'}</span>
            </div>
            <span>•</span>
            <div className="inline-flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{isEn ? '6 Core Skill Studios' : 'ครบ 6 ทักษะหลัก'}</span>
            </div>
            <span>•</span>
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isEn ? '500+ Practice Exercises' : 'แบบฝึกหัดกว่า 500+ ชุด'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HOW TO START: 3 Simple Steps (Directly resolves user confusion)        */}
      {/* ========================================================================= */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FA5D5D]">
            {isEn ? 'How to Start' : 'เริ่มต้นอย่างไรใน 3 ขั้นตอน'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {isEn ? 'Your Clear Learning Path' : 'เส้นทางการเรียนรู้ที่ชัดเจน ไม่สับสน'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isEn
              ? 'Follow this simple 3-step journey to assess, practice, and track your progress effectively.'
              : 'ลำดับขั้นตอนที่ออกแบบมาเพื่อให้คุณรู้จุดเริ่มต้น และพัฒนาทักษะได้ตรงเป้าหมายทันที'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center font-bold font-mono text-base">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEn ? '1. Benchmark Your Level' : '1. วัดระดับปัจจุบันของคุณ'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? 'Take a quick diagnostic test to estimate your CEFR level (A1 to C2) and identify strengths and focus areas.'
                  : 'ทำแบบวัดระดับสั้นๆ เพื่อทราบระดับภาษาปัจจุบันตามกรอบ CEFR (A1–C2) และวิเคราะห์จุดที่ควรพัฒนา'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FA5D5D] hover:underline cursor-pointer pt-2"
            >
              <span>{isEn ? 'Take Diagnostic Test' : 'เริ่มทำแบบวัดระดับ'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-base">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEn ? '2. Practice in Skill Studios' : '2. เลือกฝึกในห้องทักษะที่ต้องการ'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? 'Dive into focused modules for vocabulary, grammar, listening, reading, writing, and speaking at your target level.'
                  : 'ฝึกฝนเฉพาะจุดใน 6 ห้องเรียน: คลังคำศัพท์, ไวยากรณ์, การอ่าน, การฟัง, การเขียน และการพูด'}
              </p>
            </div>
            <a
              href="#studios"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-2"
            >
              <span>{isEn ? 'Explore All Studios' : 'ดูห้องเรียนทั้งหมด'}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-mono text-base">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEn ? '3. Simulate Exams & Track Growth' : '3. จำลองสอบจริงและติดตามผล'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isEn
                  ? 'Practice under timed conditions matching Oxford OOPT and Cambridge tests, and track your readiness score.'
                  : 'ทดสอบด้วยระบบจับเวลาเสมือนจริงแนว Oxford OOPT และ Cambridge พร้อมสรุปสถิติความพร้อมในแดชบอร์ด'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/mock-exams')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer pt-2"
            >
              <span>{isEn ? 'View Mock Exams' : 'ดูแนวข้อสอบจำลอง'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE SKILL STUDIOS GRID: 6 Focused Learning Studios                   */}
      {/* ========================================================================= */}
      <section id="studios" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {isEn ? 'Interactive Modules' : '6 ห้องฝึกฝนทักษะเฉพาะด้าน'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isEn ? 'Explore Skill Studios' : 'เลือกห้องเรียนที่คุณต้องการพัฒนา'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{isEn ? 'Open Full Dashboard' : 'ไปยังแดชบอร์ดรวม'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillStudios.map((studio) => {
            const Icon = studio.icon;
            return (
              <div
                key={studio.id}
                onClick={() => router.push(studio.href)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${studio.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {studio.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {isEn ? studio.titleEn : studio.titleTh}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                      {isEn ? studio.descEn : studio.descTh}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>{isEn ? 'Start Learning' : 'เข้าห้องเรียน'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXAM SIMULATION & CHEAT SHEETS: High-Yield Specialized Features       */}
      {/* ========================================================================= */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Exam Simulations */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white border border-indigo-800/50 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
                <GraduationCap className="w-4 h-4" />
                <span>Oxford OOPT & Cambridge Simulation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isEn ? 'Timed Exam Simulations' : 'ระบบจำลองข้อสอบเสมือนจริงแบบจับเวลา'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isEn
                  ? 'Simulate real test environments with automated time limits for Oxford Online Placement Test (OOPT) and Cambridge qualifications (KET, PET, FCE, CAE).'
                  : 'ฝึกทำข้อสอบแนว Oxford Online Placement Test (OOPT) และ Cambridge (KET, PET, FCE, CAE) พร้อมระบบจับเวลาอัตโนมัติ และเฉลยละเอียดทุกข้อ'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/mock-exams')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>{isEn ? 'Explore Mock Exams' : 'เริ่มทำข้อสอบจำลอง'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/oopt-practice')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
              >
                <span>{isEn ? 'OOPT Practice (Part 2 & 3)' : 'แบบฝึก Oxford OOPT'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: High-Yield Cheat Sheets */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/80 to-slate-900 text-white border border-amber-800/40 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                <Zap className="w-4 h-4" />
                <span>High-Yield Matrices</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isEn ? 'Grammar Matrices & Collocations' : 'คลังสูตรลัดไวยากรณ์ & Collocations'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isEn
                  ? 'Master high-frequency decision matrices: In/On/At hierarchy, Play vs Do vs Go sports rule, and Do vs Make action outcomes with instant mini-quizzes.'
                  : 'รวบรวม 4 จุดตัดคะแนนที่คนไทยผิดบ่อยที่สุด: พีระมิด In/On/At, กฎกีฬา Play/Do/Go, จุดต่าง Do vs Make พร้อมมินิควิซทดสอบความจำทันที'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/cheat-sheets')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <span>{isEn ? 'Open Master Cheat Sheets' : 'เปิดดูคลังสูตรลัด'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/collocations')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
              >
                <span>{isEn ? 'Top Collocations' : 'คลังคำจับคู่ Collocations'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FINAL CALL TO ACTION                                                   */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isEn ? 'Ready to Elevate Your English Skills?' : 'พร้อมเริ่มต้นพัฒนาภาษาอังกฤษของคุณหรือยัง?'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          {isEn
            ? 'Access all 6 learning studios, practice exercises, and exam simulations. Zero cost, start directly on your dashboard.'
            : 'เข้าใช้งาน 6 ห้องเรียนฝึกฝน คลังคำศัพท์ ไวยากรณ์ และข้อสอบจำลอง เริ่มต้นได้ทันทีไม่มีค่าใช้จ่าย'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-md shadow-[#FA5D5D]/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEn ? 'Start Learning Free Now' : 'เริ่มเรียนฟรีทันที'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsQuickCheckOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#FA5D5D]" />
            <span>{isEn ? 'Quick Placement Test (3 Mins)' : 'ทำแบบวัดระดับด่วน (3 นาที)'}</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLEAN FOOTER                                                           */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/50 dark:bg-slate-950/50 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm">GLOVA</span>
            <span>•</span>
            <span>{isEn ? 'CEFR English Self-Study Platform' : 'แพลตฟอร์มฝึกฝนภาษาอังกฤษอิงตามกรอบ CEFR'}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isEn ? 'Classroom' : 'ห้องเรียน'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/mock-exams')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isEn ? 'Exams' : 'ข้อสอบ'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/cheat-sheets')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isEn ? 'Cheat Sheets' : 'สูตรลัด'}
            </button>
          </div>
        </div>
      </footer>

      {/* Quick Diagnostic Modal (3 Min Check) */}
      <QuickEnglishCheck
        isOpen={isQuickCheckOpen}
        isModal={true}
        onClose={() => setIsQuickCheckOpen(false)}
        onComplete={() => router.push('/dashboard')}
      />
    </div>
  );
};
