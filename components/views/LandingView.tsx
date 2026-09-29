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
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

interface LandingViewProps {
  onStartLearning?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const router = useRouter();
  const { t, language } = useTranslation();

  const handleStart = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      router.push('/assessment');
    }
  };

  const [isQuickCheckOpen, setIsQuickCheckOpen] = React.useState(false);

  const handleStartQuickCheck = () => {
    setIsQuickCheckOpen(true);
    const el = document.getElementById('quick-check-experience');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreGlova = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('studios');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-border/40">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Value Proposition */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide border border-border/60">
                <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{t('landing.hero_badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.12]">
                {t('landing.hero_title_part1')}{' '}
                <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('landing.hero_title_part2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t('landing.hero_desc')}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <GlovaButton
                  variant="primary"
                  size="lg"
                  onClick={handleStartQuickCheck}
                  className="px-7 py-3.5 text-base font-semibold shadow-sm shadow-primary/20 group"
                >
                  <span>{t('landing.hero_cta_check')}</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </GlovaButton>

                <a
                  href="#studios"
                  onClick={handleExploreGlova}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-foreground text-sm font-semibold transition-colors"
                >
                  {t('landing.hero_cta_explore')}
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{t('landing.bullet_situations')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{t('landing.bullet_snapshot')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{t('landing.bullet_no_signup')}</span>
                </div>
              </div>
            </div>

            {/* Right: Unified Media & Visual Experience */}
            <div className="lg:col-span-6 space-y-4">
              {/* Remotion Storytelling Composition */}
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm aspect-video w-full">
                <RemotionPlayerWrapper
                  component={LandingHeroComposition}
                  inputProps={{}}
                  durationInFrames={180}
                  aspectRatio="16/9"
                  ariaLabel="Visual story of personalized CEFR learning journey"
                />
              </div>

              {/* Supporting Photographic Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="overflow-hidden rounded-xl border border-border/50 aspect-[4/3]">
                  <GlovaImage
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                    alt="Young adults collaborating naturally in a warm open workspace"
                    aspectRatio="aspect-[4/3]"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 flex flex-col justify-center space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('landing.calm_ritual_title')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('landing.calm_ritual_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 CURIOSITY CHECK EXPERIENCE (3-Minute Real-Life Check) */}
      <section id="quick-check-experience" className="py-12 sm:py-16 bg-accent/20 border-b border-border/40">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('landing.quick_check_badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {t('landing.quick_check_title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              {t('landing.quick_check_desc')}
            </p>
          </div>
          <QuickEnglishCheck onFinish={() => router.push('/')} />
        </div>
      </section>

      {/* 2. THE CONTRAST: WHY ENGLISH FEELS DIFFICULT */}
      <section className="py-16 sm:py-20 bg-card/60 border-b border-border/40">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {t('landing.shift_badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              {t('landing.shift_title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('landing.shift_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-background border border-border/60 space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-semibold">
                {t('landing.old_way_title')}
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>{t('landing.old_way_item1')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>{t('landing.old_way_item2')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>{t('landing.old_way_item3')}</span>
                </li>
              </ul>
            </div>

            {/* The Glova Way */}
            <div className="p-6 rounded-2xl bg-accent/40 border border-primary/20 space-y-4">
              <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {t('landing.glova_way_title')}
              </div>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{t('landing.glova_way_item1')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{t('landing.glova_way_item2')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{t('landing.glova_way_item3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 6 IMMERSIVE SKILL STUDIOS */}
      <section id="studios" className="py-16 sm:py-24 border-b border-border/40">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              {t('landing.studios_badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              {t('landing.studios_title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('landing.studios_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Vocabulary */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('landing.studio_vocab_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('landing.studio_vocab_desc')}
                </p>
              </div>
              <Link href="/vocabulary" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>{t('landing.studio_vocab_action')}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 2. Grammar */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('landing.studio_grammar_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('landing.studio_grammar_desc')}
                </p>
              </div>
              <Link href="/grammar" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>{t('landing.studio_grammar_action')}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 3. Reading */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Compass className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('landing.studio_reading_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('landing.studio_reading_desc')}
                </p>
              </div>
              <Link href="/reading" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>{t('landing.studio_reading_action')}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 4. Listening */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <Headphones className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('landing.studio_listening_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('landing.studio_listening_desc')}
                </p>
              </div>
              <Link href="/listening" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>{t('landing.studio_listening_action')}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 5. Writing */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <PenTool className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('landing.studio_writing_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('landing.studio_writing_desc')}
                </p>
              </div>
              <Link href="/writing" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>{t('landing.studio_writing_action')}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </GlovaCard>

            {/* 6. Speaking */}
            <GlovaCard variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Mic className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('landing.studio_speaking_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('landing.studio_speaking_desc')}
                </p>
              </div>
              <Link href="/speaking" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline pt-2">
                <span>{t('landing.studio_speaking_action')}</span>
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
            {t('landing.habit_title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t('landing.habit_desc')}
          </p>
          <div className="pt-2">
            <GlovaButton variant="primary" size="md" onClick={handleStart} className="font-semibold">
              {t('landing.habit_cta')}
            </GlovaButton>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC TRUST & CAMBRIDGE QUALIFICATIONS */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {t('landing.cambridge_badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {t('landing.cambridge_title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              {t('landing.cambridge_desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { level: 'A1', label: 'Beginner', descKey: 'landing.cefr_a1_desc' },
              { level: 'A2', label: 'Key', descKey: 'landing.cefr_a2_desc' },
              { level: 'B1', label: 'Preliminary', descKey: 'landing.cefr_b1_desc' },
              { level: 'B2', label: 'First', descKey: 'landing.cefr_b2_desc' },
              { level: 'C1', label: 'Advanced', descKey: 'landing.cefr_c1_desc' },
              { level: 'C2', label: 'Mastery', descKey: 'landing.cefr_c2_desc' },
            ].map((item) => (
              <div key={item.level} className="p-3.5 rounded-xl bg-card border border-border/60 text-center space-y-1">
                <span className="text-lg font-extrabold text-primary">{item.level}</span>
                <div className="text-xs font-semibold text-foreground">{item.label}</div>
                <div className="text-[11px] text-muted-foreground">{t(item.descKey)}</div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
            <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>{t('landing.cambridge_trust')}</span>
          </div>
        </div>
      </section>

      {/* 6. FINAL INSPIRING CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-card to-background text-center">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            {t('landing.final_cta_title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t('landing.final_cta_desc')}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <GlovaButton
              variant="primary"
              size="lg"
              onClick={handleStart}
              className="px-8 py-4 text-base font-semibold shadow-md shadow-primary/25"
            >
              {t('landing.final_cta_button')}
            </GlovaButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 bg-card text-center text-xs text-muted-foreground">
        <div className="w-full max-w-[1536px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Glova</span>
            <span>— CEFR English Learning Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">{t('landing.footer_home')}</Link>
            <Link href="/assessment" className="hover:text-foreground transition-colors">{t('landing.footer_assessment')}</Link>
            <Link href="/vocabulary" className="hover:text-foreground transition-colors">{t('landing.footer_vocabulary')}</Link>
            <Link href="/mock-exams" className="hover:text-foreground transition-colors">{t('landing.footer_mock_exams')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
