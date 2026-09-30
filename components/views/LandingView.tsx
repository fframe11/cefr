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
  BrainCircuit,
  Volume2,
  FileText,
  GraduationCap,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  RemotionPlayerWrapper,
  LandingHeroComposition,
  RankedArenaShowcaseComposition,
  SeasonPassRewardsComposition,
  PhoneticStressComposition,
} from '../remotion';
import {
  BackgroundBeams,
  BorderBeam,
  GlowingCard,
  RankBannerCard,
  SquadShareBanner,
} from '../ui/aceternity';
import {
  TactileButton,
  ShinyText,
  SpotlightCard,
  GlovaCartridge,
} from '../ui/GlovaPrimitives';
import { GlovaImage } from '../ui/GlovaImage';
import { useTranslation } from '../../i18n';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

interface LandingViewProps {
  onStartLearning?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [heroTab, setHeroTab] = useState<'ranked' | 'cartridge' | 'journey'>('ranked');
  const [activeStudioTab, setActiveStudioTab] = useState<'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'exam' | 'ranked'>('vocab');

  const handleStart = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      router.push('/assessment');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#EDEBE8] selection:bg-[#5B5CE2]/20 selection:text-[#5B5CE2]">
      {/* =====================================================================
          1. HERO SECTION: BRAND SHOWCASE & IMMEDIATE CLARITY
          ===================================================================== */}
      <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-[rgba(255,255,255,0.08)]">
        <BackgroundBeams />

        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Brand Value Proposition (Editorial Hierarchy) */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Prestigious Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5B5CE2]/15 text-[#5B5CE2] text-xs font-bold tracking-wide border border-[rgba(255,255,255,0.08)]">
                <Sparkles className="w-3.5 h-3.5 text-[#5B5CE2]" aria-hidden="true" />
                <span className="font-tech uppercase">
                  {isEn ? 'The Modern University English Platform' : 'มาตรฐานใหม่การเตรียมภาษาอังกฤษมหาวิทยาลัย'}
                </span>
              </div>

              {/* Dominant Headline with ShinyText */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#EDEBE8] tracking-tight leading-[1.12] font-display">
                {isEn ? 'Your English.' : 'ภาษาอังกฤษของคุณ.'}{' '}
                <ShinyText speedSec={3.5} className="font-black text-[#5B5CE2] block sm:inline">
                  {isEn ? 'Your True Level.' : 'ระดับที่แท้จริง.'}
                </ShinyText>{' '}
                {isEn ? 'Your Next Move.' : 'ก้าวต่อไปที่คุณมั่นใจ.'}
              </h1>

              {/* Informative Subtext */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-grotesk">
                {isEn
                  ? 'Glova unites 3,860 verified Oxford & Cambridge terms, animated grammar timelines, and 4-second reflex duels into an interconnected university learning ecosystem. Discover where you stand in 3 minutes.'
                  : 'Glova เชื่อมโยงคลังคำศัพท์วิชาการ 3,860 คำ ไทม์ไลน์ไวยากรณ์เข้าใจง่าย และการประลองความเร็ว 4 วินาทีเข้าด้วยกัน เพื่อให้คุณเข้าใจจุดแข็งจุดอ่อนและพัฒนาตรงจุดทันที'}
              </p>

              {/* Primary & Secondary Tactile Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <TactileButton
                  variant="primary"
                  size="lg"
                  onClick={() => scrollToSection('quick-check-experience')}
                  className="px-8 py-4 text-base font-bold font-display tracking-wide shadow-md shadow-[#5B5CE2]/25"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  {isEn ? 'Check English Level (3 mins)' : 'วัดระดับภาษาอังกฤษ (3 นาที)'}
                </TactileButton>

                <TactileButton
                  variant="surface"
                  size="lg"
                  onClick={() => scrollToSection('studios')}
                  className="px-6 py-4 text-sm font-bold font-display"
                >
                  {isEn ? 'Explore The 8 Studios' : 'สำรวจทั้ง 8 สตูดิโอ'}
                </TactileButton>
              </div>

              {/* Trust & Proof Badges */}
              <div className="flex items-center gap-5 pt-4 text-xs font-semibold text-muted-foreground flex-wrap font-grotesk">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
                  <span>{isEn ? '8 Real-Life Scenarios' : '8 สถานการณ์จริงในชีวิต'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
                  <span>{isEn ? 'Instant CEFR Tier Diagnostic' : 'สรุปผลระดับ CEFR ทันที'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
                  <span>{isEn ? 'Zero Upfront Sign-Up' : 'เริ่มได้ทันทีไม่ต้องสมัครก่อน'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Product Showcase Arena */}
            <div className="lg:col-span-6 space-y-4">
              {/* Interactive Composition Mode Switcher */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1 rounded-2xl bg-[#141A22] p-1 border border-[rgba(255,255,255,0.08)] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setHeroTab('ranked')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      heroTab === 'ranked'
                        ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20 font-bold'
                        : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Ranked Arena 4s' : 'ประลองความเร็ว 4s'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroTab('cartridge')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      heroTab === 'cartridge'
                        ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20 font-bold'
                        : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Glova Cartridge' : 'ตลับการเรียนรู้'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroTab('journey')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      heroTab === 'journey'
                        ? 'bg-[#5B5CE2] text-white shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none border-t border-white/20 font-bold'
                        : 'text-muted-foreground hover:text-foreground active:translate-y-0.5'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{isEn ? 'CEFR Progression' : 'เส้นทาง CEFR'}</span>
                  </button>
                </div>

                <span className="text-[11px] font-tech text-muted-foreground hidden sm:flex items-center gap-1 font-bold">
                  <Play className="w-3 h-3 text-[#10B981] fill-[#10B981] animate-pulse" />
                  REMOTION ENGINE
                </span>
              </div>

              {/* Dynamic Showcase Screen */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-[rgba(37,36,42,0.20)] bg-[#141A22] shadow-xl aspect-video w-full">
                <BorderBeam size={220} duration={8} colorFrom="#5B5CE2" colorTo="#5B5CE2" />

                {heroTab === 'ranked' && (
                  <RemotionPlayerWrapper
                    component={RankedArenaShowcaseComposition}
                    inputProps={{}}
                    durationInFrames={180}
                    aspectRatio="16/9"
                    ariaLabel="Ranked Mode 4-Second Vocabulary Battle Remotion Simulation"
                  />
                )}

                {heroTab === 'cartridge' && (
                  <div className="h-full w-full bg-[#141A22] p-6 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                      <GlovaCartridge
                        id="hero-cartridge-demo"
                        level="B2"
                        skill="vocabulary"
                        title={isEn ? 'Advanced Academic Collocations' : 'กลุ่มคำศัพท์เชิงวิชาการขั้นสูง'}
                        subtitle={isEn ? 'Cambridge FCE vocabulary with contextual audio' : 'คลังคำศัพท์เคมบริดจ์พร้อมระบบออกเสียงและตัวอย่างประโยค'}
                        status="ready"
                        progress={40}
                        lessonsCount={5}
                        completedCount={2}
                        xpReward={25}
                        estimatedMinutes={4}
                        onLaunch={() => router.push('/vocabulary')}
                      />
                    </div>
                  </div>
                )}

                {heroTab === 'journey' && (
                  <RemotionPlayerWrapper
                    component={LandingHeroComposition}
                    inputProps={{}}
                    durationInFrames={180}
                    aspectRatio="16/9"
                    ariaLabel="Glova CEFR Learning Journey Progression Simulation"
                  />
                )}
              </div>

              {/* Contextual Photography & Calm Study Atmosphere */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] aspect-[4/3]">
                  <GlovaImage
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                    alt="University students studying together in a warm modern space"
                    aspectRatio="aspect-[4/3]"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 rounded-2xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] flex flex-col justify-center space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B5CE2]">
                    <Heart className="w-3.5 h-3.5 fill-[#5B5CE2]" aria-hidden="true" />
                    <span className="font-display">{isEn ? 'Sustainable Study Ritual' : 'กิจวัตรการเรียนรู้ที่ยั่งยืน'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'No pressure, no guilt trips, and no cartoon noise. 5 to 10 minutes of focused active recall builds lasting fluency.'
                      : 'ไร้ความกดดัน ไม่สร้างความรู้สึกผิด เรียนรู้วันละ 5-10 นาทีเพื่อสะสมความเข้าใจและความมั่นใจระยะยาว'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. BRAND STORY: WHAT IS GLOVA & WHY IT MATTERS (EDITORIAL STORYTELLING)
          ===================================================================== */}
      <section id="story" className="py-16 sm:py-24 border-b border-[rgba(255,255,255,0.08)] bg-[#0D1117]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-black tracking-wider text-[#5B5CE2] uppercase font-tech">
              {isEn ? 'The Philosophy of Glova' : 'ปรัชญาและหลักการของ GLOVA'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EDEBE8] tracking-tight font-display leading-tight">
              {isEn ? 'Language learning was broken.' : 'การเรียนภาษาแบบเดิมมีข้อจำกัด.'}{' '}
              <span className="text-[#5B5CE2]">
                {isEn ? 'We rebuilt it from the ground up.' : 'เราจึงออกแบบระบบใหม่ทั้งหมด.'}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-grotesk">
              {isEn
                ? 'Traditional learning forces you to memorize tables of disconnected rules or swipe through endless trivia. Glova treats English as a connected instrument with 10 coordinated pillars.'
                : 'การท่องจำตารางไวยากรณ์หรือการสไลด์แฟลชการ์ดที่ไม่รู้ที่มา ทำให้เสียเวลาแต่ไม่ได้ทักษะใช้งานจริง Glova จึงรวม 10 เสาหลักการเรียนรู้เข้าด้วยกันเพื่อผลลัพธ์ที่จับต้องได้'}
            </p>
          </div>

          {/* The Contrast Architecture (Old Way vs Glova Way) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <div className="p-8 rounded-3xl bg-[#141A22] border border-rose-200 dark:border-rose-900/40 space-y-6 shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{isEn ? 'The Traditional Way (Rote & Disconnected)' : 'การเรียนแบบเดิม (ท่องจำและแยกส่วน)'}</span>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground font-grotesk">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p>{isEn ? 'Memorizing tense formulas without feeling time anchors or real-life context.' : 'ท่องสูตรไวยากรณ์ตามตาราง แต่ไม่เคยเข้าใจมุมมองเวลาในการใช้งานจริง'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p>{isEn ? 'Learning isolated vocabulary words without phonetic syllable stress or collocations.' : 'จำคำศัพท์เดี่ยวๆ โดยไม่รู้การลงน้ำหนักพยางค์หรือกลุ่มคำที่ฝรั่งใช้คู่กัน'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <p>{isEn ? 'Constant speaking anxiety and fear of making grammatical errors.' : 'กลัวการพูดผิดและไม่มั่นใจเมื่อต้องสื่อสารกับชาวต่างชาติหรือในห้องเรียน'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold">4</div>
                  <p>{isEn ? 'Cartoon games that waste time on simple gamification without actual CEFR progress.' : 'เกมการ์ตูนที่เน้นความเพลิดเพลินแต่ไม่ช่วยยกระดับคะแนนสอบหรือการใช้งานจริง'}</p>
                </div>
              </div>
            </div>

            {/* The Glova Way */}
            <div className="p-8 rounded-3xl bg-[#141A22] border-2 border-[rgba(184,167,255,0.35)] space-y-6 shadow-md shadow-[#5B5CE2]/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B5CE2]/15 text-[#5B5CE2] text-xs font-bold border border-[rgba(255,255,255,0.08)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'The Glova Standard: Connected and Active' : 'มาตรฐาน Glova เชื่อมโยงและนำไปใช้จริง'}</span>
              </div>

              <div className="space-y-4 text-sm text-[#EDEBE8] font-grotesk font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5B5CE2]/20 text-[#5B5CE2] flex items-center justify-center shrink-0 text-xs font-bold border border-[#5B5CE2]/30">✓</div>
                  <p>{isEn ? 'Animated grammar timelines show exactly when an action happened and why it matters.' : 'ไทม์ไลน์ภาพเคลื่อนไหวแสดงชัดเจนว่าเหตุการณ์เกิดเมื่อใดและส่งผลอย่างไร'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5B5CE2]/20 text-[#5B5CE2] flex items-center justify-center shrink-0 text-xs font-bold border border-[#5B5CE2]/30">✓</div>
                  <p>{isEn ? '3,860 verified Oxford & Cambridge terms with acoustic stress graphs and native audio.' : 'คลังคำศัพท์ 3,860 คำพร้อมกราฟิกความดังพยางค์และการออกเสียงจากเจ้าของภาษา'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5B5CE2]/20 text-[#5B5CE2] flex items-center justify-center shrink-0 text-xs font-bold border border-[#5B5CE2]/30">✓</div>
                  <p>{isEn ? 'Judgment-free private speaking & writing studios with instant diagnostic rubric feedback.' : 'สตูดิโอฝึกพูดและเขียนส่วนตัว พร้อมเกณฑ์ประเมินคะแนน CEFR อัตโนมัติ'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5B5CE2]/20 text-[#5B5CE2] flex items-center justify-center shrink-0 text-xs font-bold border border-[#5B5CE2]/30">✓</div>
                  <p>{isEn ? 'Competitive 4-second reflex matchmaking that builds instinct under realistic time pressure.' : 'สมรภูมิประลองคำศัพท์ 4 วินาที สร้างสัญชาตญาณตอบสนองที่ฉับไว'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* The 10 Coordinated Pillars */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-display">
              {isEn ? 'The 10 Integrated Pillars of the Glova Ecosystem' : '10 เสาหลักแห่งระบบการเรียนรู้ Glova'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { titleEn: '01. Diagnostic', titleTh: '01. วัดระดับ', descEn: '3-min situation check', descTh: 'วัดผลใน 3 นาที' },
                { titleEn: '02. Vocabulary', titleTh: '02. คำศัพท์', descEn: '3,860 verified terms', descTh: 'คลัง 3,860 คำ' },
                { titleEn: '03. Grammar', titleTh: '03. ไวยากรณ์', descEn: 'Motion timelines', descTh: 'โมชั่นไทม์ไลน์' },
                { titleEn: '04. Reading', titleTh: '04. การอ่าน', descEn: 'Campus contexts', descTh: 'บทความวิชาการ' },
                { titleEn: '05. Listening', titleTh: '05. การฟัง', descEn: 'Waveform audio player', descTh: 'จับสำเนียงสากล' },
                { titleEn: '06. Speaking', titleTh: '06. การพูด', descEn: 'Phonetic stress meter', descTh: 'ออกเสียงเน้นพยางค์' },
                { titleEn: '07. Writing', titleTh: '07. การเขียน', descEn: 'CEFR rubric checker', descTh: 'ตรวจเกณฑ์เคมบริดจ์' },
                { titleEn: '08. Mock Exams', titleTh: '08. สอบจำลอง', descEn: 'KET, PET & FCE tests', descTh: 'ข้อสอบเสมือนจริง' },
                { titleEn: '09. Review', titleTh: '09. ทบทวน', descEn: 'Spaced repair engine', descTh: 'ซ่อมแซมจุดอ่อน' },
                { titleEn: '10. Ranked', titleTh: '10. ประลอง', descEn: '4s reflex arena & MMR', descTh: 'ดวลไต่อันดับลีก' },
              ].map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] shadow-xs space-y-1 hover:border-[rgba(37,36,42,0.25)] transition-colors"
                >
                  <span className="text-xs font-black text-[#5B5CE2] font-tech">
                    {isEn ? pillar.titleEn : pillar.titleTh}
                  </span>
                  <div className="text-[11px] text-muted-foreground font-semibold">
                    {isEn ? pillar.descEn : pillar.descTh}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. INTERACTIVE PRODUCT SHOWCASE: THE 8 STUDIOS
          ===================================================================== */}
      <section id="studios" className="py-16 sm:py-24 border-b border-[rgba(255,255,255,0.08)]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Showcase Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black tracking-wider text-[#5B5CE2] uppercase font-tech">
              {isEn ? 'Interactive Product Capabilities' : 'ระบบการทำงานจริงของสตูดิโอ'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EDEBE8] tracking-tight font-display">
              {isEn ? 'Experience Glova in Action' : 'สัมผัสสตูดิโอการเรียนรู้ของ Glova'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-grotesk">
              {isEn
                ? 'Each studio is engineered with its own unique tactile interface, matching the exact cognitive demands of that linguistic skill.'
                : 'แต่ละสตูดิโอถูกออกแบบด้วยอินเทอร์เฟซเฉพาะตัวตามลักษณะของทักษะภาษานั้นๆ เพื่อการฝึกฝนที่มีประสิทธิภาพสูงสุด'}
            </p>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'vocab', labelEn: 'Vocabulary Studio', labelTh: 'คลังคำศัพท์ CEFR', icon: BookOpen },
              { id: 'grammar', labelEn: 'Grammar Studio', labelTh: 'สตูดิโอไวยากรณ์', icon: Sparkles },
              { id: 'reading', labelEn: 'Reading Studio', labelTh: 'สตูดิโออ่านจับใจความ', icon: Compass },
              { id: 'listening', labelEn: 'Listening Studio', labelTh: 'สตูดิโอการฟัง', icon: Headphones },
              { id: 'speaking', labelEn: 'Speaking Studio', labelTh: 'สตูดิโอการออกเสียง', icon: Mic },
              { id: 'writing', labelEn: 'Writing Studio', labelTh: 'สตูดิโอการเขียน', icon: PenTool },
              { id: 'exam', labelEn: 'Cambridge Exam Vault', labelTh: 'คลังข้อสอบเคมบริดจ์', icon: Award },
              { id: 'ranked', labelEn: 'Ranked Arena 4s', labelTh: 'สมรภูมิติดสปีด 4s', icon: Swords },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeStudioTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveStudioTab(tab.id as any)}
                  className={`touch-target px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-[#5B5CE2] text-white border-t border-white/25 shadow-[0_3px_0_0_#38399E] active:translate-y-[3px] active:shadow-none'
                      : 'bg-[#141A22] text-muted-foreground hover:text-foreground border border-[rgba(255,255,255,0.08)] shadow-[0_2.5px_0_0_#0D1318] active:translate-y-[2.5px] active:shadow-none hover:bg-[#253040]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isEn ? tab.labelEn : tab.labelTh}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Studio Preview Canvas */}
          <div className="rounded-3xl border-2 border-[rgba(255,255,255,0.08)] bg-[#141A22] p-6 sm:p-10 shadow-lg shadow-black/[0.03]">
            {/* 1. VOCABULARY SHOWCASE */}
            {activeStudioTab === 'vocab' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#5B5CE2]/15 text-[#5B5CE2] border border-[rgba(255,255,255,0.08)]">
                    CEFR B2 · VOCABULARY LAB
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Spaced Active Recall & Phonetics' : 'การดึงความจำแบบกระจายระยะและการออกเสียง'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Study with genuine acoustic stress markers, IPA transcription, and contextual university collocations. Words are automatically scheduled for review right before you forget them.'
                      : 'ฝึกฝนด้วยสัญลักษณ์สัทศาสตร์ IPA และกราฟิกแสดงน้ำหนักพยางค์ คำศัพท์จะถูกจัดคิวทบทวนอัตโนมัติในจังหวะที่เหมาะสมตามอัลกอริทึม Spaced Repetition'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/vocabulary')}>
                      {isEn ? 'Launch Vocabulary Studio' : 'เปิดสตูดิโอคำศัพท์'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="font-mono">Word 1 of 3,860</span>
                    <span className="text-[#10B981]">Mastered in 2 sessions</span>
                  </div>
                  <div className="p-8 rounded-2xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] text-center space-y-3 shadow-xs">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#5B5CE2]/15 text-[#5B5CE2]">
                      Academic Adjective
                    </div>
                    <h4 className="text-3xl font-black text-foreground">pragmatic</h4>
                    <p className="text-sm font-mono text-muted-foreground">/præɡˈmæt.ɪk/</p>
                    <p className="text-xs text-muted-foreground pt-1">
                      {isEn ? 'Solving problems in a sensible way that suits the conditions that really exist.' : 'เน้นการปฏิบัติจริงและแก้ปัญหาตามความเป็นจริง'}
                    </p>
                    <div className="pt-3 flex justify-center gap-2">
                      <TactileButton variant="surface" size="sm" leftIcon={<Volume2 className="w-3.5 h-3.5 text-[#5B5CE2]" />}>
                        {isEn ? 'Listen Audio' : 'ฟังการออกเสียง'}
                      </TactileButton>
                      <TactileButton variant="secondary" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>
                        {isEn ? 'Mark Mastered' : 'บันทึกว่าจำได้แล้ว'}
                      </TactileButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. GRAMMAR SHOWCASE */}
            {activeStudioTab === 'grammar' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E98278] text-white border border-[#CCA735]">
                    CEFR B1 · GRAMMAR TIMELINE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Animated Timeline Sentence Mechanics' : 'ไทม์ไลน์ภาพเคลื่อนไหวบอกกาลเวลา'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Never confuse Past Simple with Present Perfect again. Animated visual anchors show the exact relationship between the event time and the present moment.'
                      : 'หมดปัญหาความสับสนระหว่าง Past Simple กับ Present Perfect ด้วยเส้นไทม์ไลน์ที่ทำให้เห็นจุดของเวลาและความเชื่อมโยงถึงปัจจุบันอย่างชัดเจน'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/grammar')}>
                      {isEn ? 'Launch Grammar Studio' : 'เปิดสตูดิโอไวยากรณ์'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-4">
                  <div className="p-6 rounded-2xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] space-y-4">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Timeline Blueprint: Past Finished vs Present Relevance
                    </div>
                    <div className="relative py-4 border-b border-[rgba(255,255,255,0.08)] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-rose-600">Past Simple: I lived in London (1998-2002)</span>
                        <span className="text-[11px] text-muted-foreground">Finished in past</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-rose-100 dark:bg-rose-950/40 overflow-hidden">
                        <div className="w-1/3 h-full bg-rose-500 rounded-full" />
                      </div>
                    </div>
                    <div className="relative py-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#10B981]">Present Perfect: I have lived in London for 3 years</span>
                        <span className="text-[11px] text-muted-foreground">Still living now</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950/40 overflow-hidden">
                        <div className="w-full h-full bg-[#10B981] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. READING SHOWCASE */}
            {activeStudioTab === 'reading' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#B9E8D3] text-[#134E48] border border-[#88C6AB]">
                    CEFR B2 · READING LAB
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Split-Pane Analytical Reading' : 'อ่านจับใจความและบทความมหาวิทยาลัย'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Practice skimming, scanning, and deep comprehension questions on campus themes with built-in vocabulary drawer and Cambridge exam formatting.'
                      : 'ฝึกการอ่านจับใจความอย่างรวดเร็ว (Skimming & Scanning) พร้อมคลังคำศัพท์ประจำบทความและชุดคำถามวัดความเข้าใจตามมาตรฐานเคมบริดจ์'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/reading')}>
                      {isEn ? 'Launch Reading Lab' : 'เปิดสตูดิโอการอ่าน'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-3">
                  <div className="p-4 rounded-xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] text-xs space-y-2">
                    <div className="font-bold text-foreground">The Psychology of Group Work in University Seminars</div>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      Collaborative problem-solving frequently exposes disparities in team members' prior exposure to academic discourse. Lecturers note that structured role allocation significantly alleviates communication barriers...
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-[#5B5CE2]">
                      <span>Vocabulary: 420 words</span>
                      <span>Cambridge FCE Reading Part 5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. LISTENING SHOWCASE */}
            {activeStudioTab === 'listening' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFE4E6] text-[#9D174D] border border-[#FDA4AF]">
                    CEFR B1 · LISTENING STUDIO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Audio Waveform & Accent Variety' : 'ฟังสำเนียงสากลพร้อมคลื่นเสียง'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Listen to dialogues across British, North American, and Australian accents with adjustable playback speed and progressive disclosure transcripts.'
                      : 'ฝึกฟังบทสนทนาสถานการณ์จริงจากสำเนียงสากลหลากหลาย ปรับความเร็วเสียงได้ พร้อมตัวเลือกเปิดปิดสคริปต์เมื่อต้องการตรวจทาน'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/listening')}>
                      {isEn ? 'Launch Listening Studio' : 'เปิดสตูดิโอการฟัง'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-3">
                  <div className="p-4 rounded-xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] space-y-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground">Dialect: Standard British Accent · Speed: 1.0x</div>
                    <div className="flex items-center justify-center gap-1.5 h-12">
                      {[40, 70, 90, 30, 80, 100, 60, 40, 85, 95, 50, 65, 80, 40].map((h, i) => (
                        <div key={i} className="w-1.5 rounded-full bg-[#5B5CE2]" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-grotesk italic">
                      "Could you tell me where the postgraduate student registry is located?"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SPEAKING SHOWCASE */}
            {activeStudioTab === 'speaking' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFEDD5] text-[#9A3412] border border-[#FDBA74]">
                    CEFR B2 · SPEAKING LAB
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Safe Recording & Phonetic Stress' : 'บันทึกเสียงและฝึกการเน้นพยางค์อย่างมั่นใจ'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Record simulated campus dialogues in a private, judgment-free environment with native model audio comparisons and phonetic stress indicators.'
                      : 'ฝึกพูดและบันทึกเสียงในพื้นที่ส่วนตัวไร้ความกังวล พร้อมระบบเปรียบเทียบเสียงกับเจ้าของภาษาและตรวจจับการเน้นพยางค์'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/speaking')}>
                      {isEn ? 'Launch Speaking Lab' : 'เปิดสตูดิโอการพูด'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-3">
                  <div className="p-6 rounded-xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                      <Mic className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-foreground">Prompt: Describe your university study goals</div>
                      <div className="text-xs text-muted-foreground">Speech recognition active · Target time: 60s</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. WRITING SHOWCASE */}
            {activeStudioTab === 'writing' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#5B5CE2]/15 text-[#5B5CE2] border border-[rgba(255,255,255,0.08)]">
                    CEFR B1 · WRITING WORKSPACE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Distraction-Free Workspace & CEFR Rubric' : 'พื้นที่ฝึกเขียนพร้อมตัววัดเกณฑ์ CEFR'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Draft essays and emails with real-time target word count meters, Cambridge rubric checklists, model answers, and draft autosaving.'
                      : 'เขียนบทความและอีเมลด้วยตัวนับจำนวนคำแบบเรียลไทม์ พร้อมเช็กลิสต์เกณฑ์การให้คะแนนแบบเคมบริดจ์และตัวอย่างงานเขียน'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/writing')}>
                      {isEn ? 'Launch Writing Workspace' : 'เปิดสตูดิโอการเขียน'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-3">
                  <div className="p-4 rounded-xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Target: Formal Email to Professor</span>
                      <span className="text-[#10B981]">112 / 120 words (Optimal)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                      <div className="w-[93%] h-full bg-[#10B981] rounded-full" />
                    </div>
                    <div className="pt-2 flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold">Content: 5/5</span>
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold">Communicative: 4/5</span>
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold">Organization: 5/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. CAMBRIDGE MOCK EXAM SHOWCASE */}
            {activeStudioTab === 'exam' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E98278] text-white border border-[#CCA735]">
                    CAMBRIDGE QUALIFICATIONS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? 'Full Cambridge Simulation Hall' : 'ห้องสอบจำลอง KET, PET และ FCE'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Simulate authentic Cambridge English qualifications with server-timed countdowns, answer autosaving, question navigator matrix, and scaled CEFR reports.'
                      : 'จำลองบรรยากาศการสอบเคมบริดจ์เสมือนจริง ทั้งระบบจับเวลานับถอยหลัง บันทึกคำตอบอัตโนมัติ และรายงานผลคะแนนเทียบระดับ CEFR ละเอียดทุกทักษะ'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/mock-exams')}>
                      {isEn ? 'Launch Mock Exams' : 'เปิดห้องสอบจำลอง'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-3">
                  <div className="p-4 rounded-xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] text-xs space-y-3">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-foreground">B1 Preliminary (PET) Full Mock</span>
                      <span className="text-amber-500 font-mono">42:15 Remaining</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((q) => (
                        <div
                          key={q}
                          className={`p-2 rounded text-center font-bold text-[11px] ${
                            q <= 5 ? 'bg-[#10B981] text-white' : q === 6 ? 'bg-[#5B5CE2] text-white' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          Q{q}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. RANKED 4S ARENA SHOWCASE */}
            {activeStudioTab === 'ranked' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#5B5CE2] text-white border border-[#5B5CE2]/40">
                    COMPETITIVE RANKED ARENA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-display">
                    {isEn ? '4-Second Speed Reflex Duels' : 'ดวลความเร็วคำศัพท์ 4 วินาที'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-grotesk">
                    {isEn
                      ? 'Test your English instincts in real-time. Gain Rank Rating (MMR), climb university divisions from Bronze to Master, and earn animated profile frames.'
                      : 'ทดสอบความแม่นยำและไหวพริบภายใต้เวลา 4 วินาทีต่อข้อ ชิงคะแนน MMR ไต่อันดับลีกมหาวิทยาลัย และปลดล็อกกรอบรูปโปรไฟล์ระดับตำนาน'}
                  </p>
                  <div className="pt-2">
                    <TactileButton variant="primary" size="md" onClick={() => router.push('/compete')}>
                      {isEn ? 'Enter Ranked Arena' : 'เข้าสู่สมรภูมิประลอง'}
                    </TactileButton>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141A22] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] space-y-3">
                  <div className="p-5 rounded-2xl bg-[#141A22] text-white space-y-3 text-center">
                    <div className="text-xs font-bold text-amber-400 font-tech">GOLD III · BANGKOK UNIVERSITY LEAGUE</div>
                    <div className="text-2xl font-black text-white">MATCH VICTORY (+28 MMR)</div>
                    <p className="text-xs text-zinc-400">Current Rating: 1,508 MMR · Top 14% University Learners</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. THE 7-STAGE LEARNING JOURNEY (SCROLL STORYTELLING)
          ===================================================================== */}
      <section id="journey" className="py-16 sm:py-24 border-b border-[rgba(255,255,255,0.08)] bg-[#0D1117]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black tracking-wider text-[#5B5CE2] uppercase font-tech">
              {isEn ? 'Continuous Growth Architecture' : 'เส้นทางการพัฒนาที่ชัดเจน'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EDEBE8] tracking-tight font-display">
              {isEn ? 'How You Progress with Glova' : 'ก้าวหน้าอย่างเป็นระบบในทุกวัน'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-grotesk">
              {isEn
                ? 'From your first 3-minute diagnostic check to passing Cambridge qualifications, every step is deliberate and measured.'
                : 'ตั้งแต่การวัดระดับครั้งแรก 3 นาที ไปจนถึงการสอบผ่านวุฒิบัตรเคมบริดจ์ ทุกขั้นตอนถูกคิดมาเพื่อการก้าวหน้าอย่างมั่นใจ'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {[
              { step: '01', titleEn: 'Check', titleTh: 'วัดระดับ', descEn: '3-min scenario diagnostic snapshot', descTh: 'ประเมินจุดเริ่มต้นใน 3 นาที' },
              { step: '02', titleEn: 'Map', titleTh: 'ระบุจุดอ่อน', descEn: 'Diagnose specific grammar & vocab gaps', descTh: 'วิเคราะห์ช่องว่างทางไวยากรณ์' },
              { step: '03', titleEn: 'Practice', titleTh: 'ฝึกฝน', descEn: '5-minute daily bite-sized cartridges', descTh: 'เรียนผ่านตลับบทเรียน 5 นาที' },
              { step: '04', titleEn: 'Review', titleTh: 'ทบทวน', descEn: 'Spaced repetition active recall', descTh: 'ทบทวนคำศัพท์ตามรอบเวลา' },
              { step: '05', titleEn: 'Repair', titleTh: 'แก้ไข', descEn: 'Targeted drills on recent mistakes', descTh: 'แบบฝึกเจาะจงจุดที่เคยตอบผิด' },
              { step: '06', titleEn: 'Duel', titleTh: 'ประลอง', descEn: '4s speed reflex battles for instinct', descTh: 'ดวลจับเวลา 4s สร้างความว่องไว' },
              { step: '07', titleEn: 'Certify', titleTh: 'สอบผ่าน', descEn: 'Unlock Cambridge qualification mocks', descTh: 'สอบข้อสอบจำลองเพื่อเลื่อนระดับ' },
            ].map((st, i) => (
              <div
                key={st.step}
                className="p-5 rounded-2xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] shadow-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#5B5CE2]">
                    {st.step}
                  </span>
                  {i < 6 && (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 hidden lg:block" />
                  )}
                </div>
                <h4 className="text-base font-black text-foreground font-display">
                  {isEn ? st.titleEn : st.titleTh}
                </h4>
                <p className="text-xs text-muted-foreground font-grotesk leading-relaxed">
                  {isEn ? st.descEn : st.descTh}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. GAMIFICATION SHOWCASE: GAMES THAT KEEP YOU LEARNING
          ===================================================================== */}
      <section id="arena" className="py-16 sm:py-24 border-b border-[rgba(255,255,255,0.08)]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black tracking-wider text-[#5B5CE2] uppercase font-tech">
              {isEn ? 'Purpose-Driven Gaming Layer' : 'ระบบเกมที่ส่งเสริมการเรียนรู้'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EDEBE8] tracking-tight font-display">
              {isEn ? 'Games Built to Keep You Progressing' : 'เกมที่ช่วยให้คุณอยากเรียนต่อทุกวัน'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-grotesk">
              {isEn
                ? 'We gamified the return loop, not the academic content. XP rewards, ranked tiers, and university squads motivate you to show up every day.'
                : 'เรานำกลไกเกมมาช่วยสร้างแรงจูงใจในการกลับมาฝึกฝนอย่างสม่ำเสมอ ทั้งแต้ม XP อันดับลีก และการเรียนคู่กับเพื่อนมหาวิทยาลัย'}
            </p>
          </div>

          <div className="space-y-6">
            <RankBannerCard seasonNumber={1} daysRemaining={18} />
            <SquadShareBanner squadName="Chula Vanguard" memberCount={3} maxMembers={5} />
          </div>

          {/* Gamification Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* 1. Ranked Tiers */}
            <div className="p-6 rounded-3xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-foreground font-display">
                {isEn ? '6 Competitive Rank Tiers' : 'ระบบจัดอันดับ 6 ลีก'}
              </h3>
              <p className="text-xs text-muted-foreground font-grotesk leading-relaxed">
                {isEn
                  ? 'Climb from Bronze to Master through 4-second speed reflex battles. Your MMR reflects real vocabulary retrieval speed under pressure.'
                  : 'ไต่อันดับตั้งแต่ Bronze ถึง Master ผ่านการประลองความเร็ว 4 วินาที แต้ม MMR สะท้อนความไวในการดึงคำศัพท์มาใช้จริง'}
              </p>
            </div>

            {/* 2. Animated Rank Frames */}
            <div className="p-6 rounded-3xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-foreground font-display">
                {isEn ? 'Animated Profile Emblems' : 'กรอบรูปโปรไฟล์ระดับตำนาน'}
              </h3>
              <p className="text-xs text-muted-foreground font-grotesk leading-relaxed">
                {isEn
                  ? 'Unlock exclusive animated gamer and fantasy profile frames through Season Pass achievements and tournament milestones.'
                  : 'สะสมกรอบรูปโปรไฟล์อนิเมชันระดับพิเศษสไตล์เกมเมอร์และแฟนตาซี จากการทำภารกิจ Season Pass และการแข่งขัน'}
              </p>
            </div>

            {/* 3. Triple Leaderboards */}
            <div className="p-6 rounded-3xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5B5CE2]/10 text-[#5B5CE2] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-foreground font-display">
                {isEn ? 'Triple Leaderboards' : 'ตารางคะแนน 3 รูปแบบ'}
              </h3>
              <p className="text-xs text-muted-foreground font-grotesk leading-relaxed">
                {isEn
                  ? 'Compete on the Skill MMR board, celebrate effort on the Weekly XP board, and track milestones with university study buddies.'
                  : 'จัดอันดับทั้งกระดานฝีมือ MMR กระดานความขยันประจำสัปดาห์ XP และกระดานเปรียบเทียบกับเพื่อนสนิท'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. DIAGNOSTIC CURIOSITY CHECK (LOW-FRICTION SNAPSHOT)
          ===================================================================== */}
      <section id="quick-check-experience" className="py-16 sm:py-24 border-b border-[rgba(255,255,255,0.08)] bg-[#0D1117]">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#5B5CE2]/15 text-[#5B5CE2] text-xs font-bold border border-[rgba(255,255,255,0.08)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-tech">{isEn ? 'Low-Friction English Snapshot' : 'แบบวัดระดับภาษาอังกฤษใน 3 นาที'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-display">
              {isEn ? 'Check Your English in 3 Minutes' : 'ทดสอบความรู้ภาษาอังกฤษใน 3 นาที'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto font-grotesk">
              {isEn
                ? 'Respond to 8 everyday university scenarios to receive your instant personal CEFR snapshot without any stress or upfront sign-up.'
                : 'ตอบคำถามจำลอง 8 สถานการณ์จริงเพื่อรับการประเมินระดับ CEFR ส่วนบุคคลทันที โดยไม่ต้องลงทะเบียนก่อน'}
            </p>
          </div>

          <QuickEnglishCheck onFinish={() => router.push('/')} />
        </div>
      </section>

      {/* =====================================================================
          7. ACADEMIC TRUST & CAMBRIDGE QUALIFICATIONS
          ===================================================================== */}
      <section id="cambridge" className="py-16 sm:py-24 border-b border-[rgba(255,255,255,0.08)]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black tracking-wider text-[#5B5CE2] uppercase font-tech">
              {isEn ? 'International Benchmark Scale' : 'มาตรฐานระดับสากล'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-display">
              {isEn ? 'Aligned with Cambridge English & CEFR Standards' : 'สอดคล้องกับมาตรฐานเคมบริดจ์และกรอบ CEFR'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto font-grotesk">
              {isEn
                ? 'Every skill, practice question, and mock examination is calibrated directly to international Common European Framework criteria.'
                : 'ทุกแบบฝึกหัด คำถาม และข้อสอบจำลอง ถูกเทียบเคียงตามกรอบมาตรฐานยุโรป CEFR จากระดับ A1 ถึง C2 อย่างเคร่งครัด'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { level: 'A1', labelEn: 'Beginner', labelTh: 'พื้นฐาน', exam: 'Foundational', infoId: 'landing.cefr_a1_desc' },
              { level: 'A2', labelEn: 'Elementary', labelTh: 'เบื้องต้น', exam: 'Cambridge KET', infoId: 'landing.cefr_a2_desc' },
              { level: 'B1', labelEn: 'Intermediate', labelTh: 'ระดับกลาง', exam: 'Cambridge PET', infoId: 'landing.cefr_b1_desc' },
              { level: 'B2', labelEn: 'Upper Intermediate', labelTh: 'กลางขั้นสูง', exam: 'Cambridge FCE', infoId: 'landing.cefr_b2_desc' },
              { level: 'C1', labelEn: 'Advanced', labelTh: 'ระดับสูง', exam: 'Cambridge CAE', infoId: 'landing.cefr_c1_desc' },
              { level: 'C2', labelEn: 'Mastery', labelTh: 'เชี่ยวชาญ', exam: 'Cambridge CPE', infoId: 'landing.cefr_c2_desc' },
            ].map((item) => (
              <div
                key={item.level}
                className="p-5 rounded-2xl bg-[#141A22] border border-[rgba(255,255,255,0.08)] text-center space-y-1 shadow-xs hover:border-[rgba(184,167,255,0.35)] transition-colors"
              >
                <span className="text-2xl font-black text-[#5B5CE2] font-tech">{item.level}</span>
                <div className="text-xs font-bold text-foreground font-display">{isEn ? item.labelEn : item.labelTh}</div>
                <div className="text-[11px] font-mono font-bold text-[#10B981]">{item.exam}</div>
                <div className="text-[10px] text-muted-foreground font-grotesk pt-1">{t(item.infoId)}</div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-[#141A22] px-5 py-2.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-xs font-grotesk">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
            <span>{isEn ? 'Rigorous CEFR alignment for university entrance and exchange qualifications' : 'มาตรฐาน CEFR รองรับการสอบเข้ามหาวิทยาลัยและทุนแลกเปลี่ยนสากล'}</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. FINAL INSPIRING CTA: DIRECT CONVERSION TO PRODUCT FLOW
          ===================================================================== */}
      <section className="py-20 sm:py-28 bg-[#0D1117] text-center border-b border-[rgba(255,255,255,0.08)]">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5B5CE2]/15 text-[#5B5CE2] text-xs font-bold border border-[rgba(255,255,255,0.08)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'Begin Your University English Journey' : 'เริ่มต้นการเดินทางภาษาอังกฤษของคุณ'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight font-display">
            {isEn ? 'Ready to discover your true English level?' : 'พร้อมค้นพบระดับภาษาอังกฤษที่แท้จริงหรือยัง?'}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed font-grotesk">
            {isEn
              ? 'No credit card, no forced signup, and no rigid schedules. Take the 3-minute diagnostic assessment and start mastering English on your own terms.'
              : 'ไม่ต้องใช้บัตรเครดิต ไม่บังคับลงทะเบียนก่อน และเรียนรู้ได้ตามจังหวะเวลาที่คุณสะดวก ทำแบบวัดระดับ 3 นาทีแล้วก้าวไปข้างหน้าอย่างมั่นใจ'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <TactileButton
              variant="primary"
              size="lg"
              onClick={handleStart}
              className="px-8 py-4 text-base font-bold shadow-md shadow-[#5B5CE2]/25 font-display tracking-wide"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isEn ? 'Start CEFR Diagnostic Test' : 'เริ่มแบบวัดระดับ CEFR ฟรี'}
            </TactileButton>

            <TactileButton
              variant="surface"
              size="lg"
              onClick={() => router.push('/')}
              className="px-6 py-4 text-sm font-bold font-display"
            >
              {isEn ? 'Enter Learning Dashboard' : 'เข้าสู่หน้าหลักการเรียน'}
            </TactileButton>
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. DEFENSIVE MULTI-COLUMN BRAND FOOTER
          ===================================================================== */}
      <footer className="py-12 bg-[#141A22] border-t border-[rgba(255,255,255,0.08)] text-xs text-muted-foreground font-grotesk">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-foreground font-display">Glova</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#5B5CE2]/15 text-[#5B5CE2]">CEFR A1 to C2</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isEn
                  ? 'University-scale English learning and Cambridge qualification platform.'
                  : 'แพลตฟอร์มเตรียมความพร้อมภาษาอังกฤษและข้อสอบเคมบริดจ์ระดับมหาวิทยาลัย'}
              </p>
            </div>

            {/* Col 2: The 6 Studios */}
            <div className="space-y-2">
              <div className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isEn ? 'Learning Studios' : 'สตูดิโอการเรียน'}
              </div>
              <ul className="space-y-1.5">
                <li><Link href="/vocabulary" className="hover:text-foreground transition-colors">{isEn ? 'Vocabulary Lab' : 'คลังคำศัพท์'}</Link></li>
                <li><Link href="/grammar" className="hover:text-foreground transition-colors">{isEn ? 'Grammar Timelines' : 'ไวยากรณ์'}</Link></li>
                <li><Link href="/reading" className="hover:text-foreground transition-colors">{isEn ? 'Reading Lab' : 'การอ่านจับใจความ'}</Link></li>
                <li><Link href="/listening" className="hover:text-foreground transition-colors">{isEn ? 'Listening Studio' : 'การฟังสำเนียง'}</Link></li>
                <li><Link href="/speaking" className="hover:text-foreground transition-colors">{isEn ? 'Speaking Lab' : 'การพูดและออกเสียง'}</Link></li>
                <li><Link href="/writing" className="hover:text-foreground transition-colors">{isEn ? 'Writing Workspace' : 'การเขียน'}</Link></li>
              </ul>
            </div>

            {/* Col 3: Arena & Testing */}
            <div className="space-y-2">
              <div className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isEn ? 'Arena & Assessment' : 'การประลองและวัดผล'}
              </div>
              <ul className="space-y-1.5">
                <li><Link href="/compete" className="hover:text-foreground transition-colors">{isEn ? 'Ranked Arena (4s)' : 'สมรภูมิประลอง 4s'}</Link></li>
                <li><Link href="/ranking" className="hover:text-foreground transition-colors">{isEn ? 'Triple Leaderboards' : 'ตารางคะแนนลีก'}</Link></li>
                <li><Link href="/assessment" className="hover:text-foreground transition-colors">{isEn ? 'Diagnostic Test' : 'แบบวัดระดับ CEFR'}</Link></li>
                <li><Link href="/mock-exams" className="hover:text-foreground transition-colors">{isEn ? 'Cambridge Mock Exams' : 'สอบจำลอง KET/PET/FCE'}</Link></li>
                <li><Link href="/social" className="hover:text-foreground transition-colors">{isEn ? 'Study Together' : 'ห้องเรียนคู่เพื่อน'}</Link></li>
              </ul>
            </div>

            {/* Col 4: Platform & Identity */}
            <div className="space-y-2">
              <div className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isEn ? 'Platform' : 'แพลตฟอร์ม'}
              </div>
              <ul className="space-y-1.5">
                <li><Link href="/" className="hover:text-foreground transition-colors">{isEn ? 'Learning Dashboard' : 'หน้าหลักการเรียน'}</Link></li>
                <li><Link href="/profile" className="hover:text-foreground transition-colors">{isEn ? 'Player Profile & Frames' : 'โปรไฟล์และกรอบรูป'}</Link></li>
                <li><Link href="/achievements" className="hover:text-foreground transition-colors">{isEn ? 'Achievements Room' : 'คลังความสำเร็จ'}</Link></li>
                <li><Link href="/analytics" className="hover:text-foreground transition-colors">{isEn ? 'Skill Analytics' : 'สถิติและจุดอ่อน'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 Glova English Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Warm Earth Foundation • Radiant Indigo • Terracotta Accent • Glova Tactile Identity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
