'use client';
import React from 'react';
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
} from 'lucide-react';
import { RemotionPlayerWrapper, LandingHeroComposition } from '../remotion';
import { GlovaButton, GlovaCard, GlovaImage } from '../ui';
import { useTranslation } from '../../i18n';

interface LandingViewProps {
  onStartLearning?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleStart = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      router.push('/assessment');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-border/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Value Proposition */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide border border-border/60">
                <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>CEFR English Learning Experience</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.12]">
                English that finally feels{' '}
                <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  like yours.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                หยุดท่องจำแบบเดิมๆ แล้วเริ่มต้นใช้ภาษาอังกฤษอย่างมั่นใจ ด้วยบทเรียนขนาดสั้น 5 นาทีที่ออกแบบตามจังหวะชีวิตจริง พร้อมระบบวัดระดับมาตรฐาน CEFR สากล
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <GlovaButton
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  className="px-7 py-3.5 text-base font-semibold shadow-sm shadow-primary/20 group"
                >
                  <span>เริ่มวัดระดับฟรี 10 นาที</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </GlovaButton>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-foreground text-sm font-semibold transition-colors"
                >
                  เข้าสู่หน้าหลักการเรียน
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>มาตรฐาน Cambridge CEFR</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>บทเรียน 5 นาทีต่อวัน</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>ไม่มีค่าใช้จ่ายเริ่มต้น</span>
                </div>
              </div>
            </div>

            {/* Right: Remotion Visual Sequence & Editorial Photography */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
                {/* Remotion Storytelling Composition */}
                <div className="aspect-video w-full overflow-hidden bg-background">
                  <RemotionPlayerWrapper
                    component={LandingHeroComposition}
                    inputProps={{}}
                    durationInFrames={180}
                    aspectRatio="16/9"
                    ariaLabel="Visual story of personalized CEFR learning journey"
                  />
                </div>
              </div>

              {/* Supporting Editorial Photographic Glimpse */}
              <div className="grid grid-cols-2 gap-3">
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <GlovaImage
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                    alt="Young adults collaborating naturally in a warm open workspace"
                    aspectRatio="aspect-[4/3]"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 flex flex-col justify-center space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Calm Learning Ritual</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    พื้นที่ฝึกฝนส่วนตัวที่เงียบสงบ ไม่มีการกดดัน ไม่สร้างความเครียด เพื่อการพัฒนาอย่างยั่งยืน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CONTRAST: WHY ENGLISH FEELS DIFFICULT */}
      <section className="py-16 sm:py-20 bg-card/60 border-b border-border/40">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              The Learning Shift
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              ทำไมภาษาอังกฤษถึงเคยรู้สึกยาก
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              เปลี่ยนจากความรู้สึกเหนื่อยล้าในการท่องจำกฎเกณฑ์ สู่การซึมซับภาษาที่นำไปใช้งานได้จริง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-background border border-border/60 space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-semibold">
                การเรียนแบบดั้งเดิม
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>ท่องตารางไวยากรณ์และกฎข้อยกเว้นมากมาย แต่ไม่รู้จะนำไปพูดอย่างไร</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>ท่องแฟลชการ์ดเป็นร้อยคำแต่จำบริบทจริงไม่ได้เมื่อต้องเขียน</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>ความกังวลเรื่องข้อผิดพลาดจนไม่กล้าออกเสียงสนทนา</span>
                </li>
              </ul>
            </div>

            {/* The Glova Way */}
            <div className="p-6 rounded-2xl bg-accent/40 border border-primary/20 space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                แนวทางของ Glova
              </div>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>เห็นภาพการเปลี่ยนแปลงของประโยคผ่านแอนิเมชันไทม์ไลน์ที่เข้าใจง่าย</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>เรียนรู้คำศัพท์พร้อมเสียงอ่านและจังหวะวรรณยุกต์ในบริบทจริง</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>สตูดิโอฝึกพูดและเขียนส่วนตัวที่ปลอดภัย พร้อมคำแนะนำที่ตรงจุด</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 6 IMMERSIVE SKILL STUDIOS */}
      <section className="py-16 sm:py-24 border-b border-border/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              Comprehensive Growth
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              6 สตูดิโอฝึกฝนทักษะอย่างลงตัว
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              ฝึกฝนทุกทักษะสอดคล้องกันตามกรอบมาตรฐาน CEFR ตั้งแต่ระดับ A1 ถึง C2
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Vocabulary */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">คลังคำศัพท์ในบริบท</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  เรียนรู้คำศัพท์พร้อมสัญลักษณ์โฟเนติกส์ การเน้นพยางค์ และตัวอย่างการใช้งานจริง ไม่ใช่เพียงคำแปลเดี่ยวๆ
                </p>
              </div>
              <Link href="/vocabulary" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>เปิดคลังคำศัพท์</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 2. Grammar */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">ไวยากรณ์เชิงภาพ</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  แอนิเมชันไทม์ไลน์ภาพอธิบายความแตกต่างของ Tense และโครงสร้างทางภาษา โดยไม่ต้องท่องสูตร
                </p>
              </div>
              <Link href="/grammar" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>เรียนรู้ไวยากรณ์</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 3. Reading */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Compass className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">อ่านบทความสารคดี</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  บทความสั้นเนื้อหาร่วมสมัย จัดระยะบรรทัดสบายตา ช่วยสร้างนิสัยการอ่านภาษาอังกฤษแบบไม่ต้องแปลทุกคำ
                </p>
              </div>
              <Link href="/reading" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>เริ่มฝึกอ่าน</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 4. Listening */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <Headphones className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">การฟังสำเนียงสากล</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  เครื่องเล่นเสียงที่ปรับความเร็วได้ พร้อมการจำลองคลื่นเสียง ให้คุณจับใจความสำคัญของบทสนทนาจริง
                </p>
              </div>
              <Link href="/listening" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>ฟังบทสนทนา</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 5. Writing */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <PenTool className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">สตูดิโองานเขียน</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  พื้นที่เขียนเรียงความและอีเมลที่เรียบง่าย มีระบบนับคำและคำแนะนำในการเรียบเรียงประโยค
                </p>
              </div>
              <Link href="/writing" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>เขียนบทความ</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 6. Speaking */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Mic className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">สตูดิโอฝึกพูดส่วนตัว</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  อัดเสียงพูดตอบโต้ในสถานการณ์จำลองโดยไม่ต้องกังวลเรื่องสายตาคนอื่น สร้างความมั่นใจก่อนใช้จริง
                </p>
              </div>
              <Link href="/speaking" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>ฝึกออกเสียง</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>
          </div>
        </div>
      </section>

      {/* 4. ONE SMALL WIN: 5 MINUTES DAILY HABIT */}
      <section className="py-16 sm:py-20 bg-accent/30 border-b border-border/40">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            หนึ่งความสำเร็จเล็กๆ ทุกวัน
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            คุณไม่จำเป็นต้องนั่งอ่านหนังสือวันละหลายชั่วโมง เพียง 5 ถึง 10 นาทีในเวลาที่คุณสะดวก ก็สะสมเป็นทักษะที่นำไปใช้ได้ตลอดชีวิต
          </p>
          <div className="pt-2">
            <GlovaButton variant="primary" size="md" onClick={handleStart} className="font-semibold">
              เริ่มบทเรียนแรก 5 นาที
            </GlovaButton>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC TRUST & CAMBRIDGE QUALIFICATIONS */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              International Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              เชื่อมโยงมาตรฐาน Cambridge English Scale
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              ออกแบบโครงสร้างข้อสอบและคลังคำศัพท์ตามกรอบการวัดผลระดับสากล CEFR A1 ถึง C2
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { level: 'A1', label: 'Beginner', desc: 'พื้นฐานเริ่มต้น' },
              { level: 'A2', label: 'Key', desc: 'ระดับต้น (KET)' },
              { level: 'B1', label: 'Preliminary', desc: 'ระดับกลาง (PET)' },
              { level: 'B2', label: 'First', desc: 'ระดับกลางสูง (FCE)' },
              { level: 'C1', label: 'Advanced', desc: 'ระดับสูง (CAE)' },
              { level: 'C2', label: 'Mastery', desc: 'ระดับเชี่ยวชาญ' },
            ].map((item) => (
              <div key={item.level} className="p-3.5 rounded-xl bg-card border border-border/60 text-center space-y-1">
                <span className="text-lg font-extrabold text-primary">{item.level}</span>
                <div className="text-xs font-semibold text-foreground">{item.label}</div>
                <div className="text-[11px] text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
            <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>แบบฝึกหัดพัฒนาทักษะตามเกณฑ์มาตรฐาน CEFR สากล</span>
          </div>
        </div>
      </section>

      {/* 6. FINAL INSPIRING CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-card to-background text-center">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            เส้นทางภาษาอังกฤษที่สร้างมาเพื่อคุณ
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            เริ่มต้นก้าวแรกได้ทันทีโดยไม่ต้องผูกบัตรเครดิต ทำแบบทดสอบวัดระดับเพื่อค้นหาจุดเริ่มต้นที่เหมาะสมกับคุณที่สุด
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <GlovaButton
              variant="primary"
              size="lg"
              onClick={handleStart}
              className="px-8 py-4 text-base font-semibold shadow-md shadow-primary/25"
            >
              เริ่มต้นทำแบบวัดระดับ CEFR
            </GlovaButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 bg-card text-center text-xs text-muted-foreground">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Glova</span>
            <span>— CEFR English Learning Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">หน้าหลัก</Link>
            <Link href="/assessment" className="hover:text-foreground transition-colors">วัดระดับ</Link>
            <Link href="/vocabulary" className="hover:text-foreground transition-colors">คำศัพท์</Link>
            <Link href="/mock-exams" className="hover:text-foreground transition-colors">สอบจำลอง</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
