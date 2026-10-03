'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Flame,
  Award,
  Clock,
  Compass,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const GoogleSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24 0-.75.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

const FacebookSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const UkFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 60 30" aria-hidden="true">
    <clipPath id="login-uk-clip">
      <circle cx="30" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#login-uk-clip)">
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
    <clipPath id="login-th-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#login-th-clip)">
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
    <clipPath id="login-es-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#login-es-clip)">
      <rect y="0" width="30" height="7.5" fill="#AA151B" />
      <rect y="7.5" width="30" height="15" fill="#F1BF00" />
      <rect y="22.5" width="30" height="7.5" fill="#AA151B" />
    </g>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { status, signInWithPassword, signInWithOAuth, signInAsDemoStudent } = useAuth();
  const { t, language } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleDemoSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signInAsDemoStudent();
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err?.message || 'เข้าสู่ระบบบัญชีทดลองไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signInWithPassword(email.trim(), password);
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid') || msg.includes('credential')) {
          setAuthError(t('auth.err_invalid_credentials'));
        } else if (msg.includes('confirm') || msg.includes('not confirmed')) {
          setAuthError(t('auth.err_unconfirmed_email'));
        } else {
          setAuthError(error.message || t('auth.err_general'));
        }
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        setAuthError(t('auth.oauth_unconfigured_msg'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-game-canvas flex flex-col justify-center items-center p-4 sm:p-6 md:p-10">
      {/* Back to Home Link */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-card/80 border border-border/60 shadow-2xs backdrop-blur-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'th' ? 'กลับสู่หน้าหลัก' : 'Back to Platform'}</span>
        </Link>
      </div>

      {/* Main Mondly Split Shell */}
      <div className="w-full max-w-4xl rounded-[28px] bg-card border border-border/80 shadow-2xl shadow-rose-950/10 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Column: Visual Brand Showcase */}
        <div className="relative w-full lg:w-[45%] p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#FFF5EE] via-[#FFF9F5] to-[#FEECE0] dark:from-[#18141F] dark:via-[#1D1926] dark:to-[#14121B] border-b lg:border-b-0 lg:border-r border-border/60">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#FA5D5D]/15 dark:bg-[#FA5D5D]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#38BDF8]/15 dark:bg-[#38BDF8]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/10 border border-[#FA5D5D]/20 shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#FA5D5D] animate-pulse" />
              <span className="text-[11px] font-bold text-foreground tracking-wide uppercase">
                Glova Language Platform
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                {language === 'th' ? (
                  <>
                    ยินดีต้อนรับกลับสู่ <br />
                    <span className="text-[#FA5D5D]">การเรียนรู้ภาษา</span>
                  </>
                ) : (
                  <>
                    Welcome Back to <br />
                    <span className="text-[#FA5D5D]">Active Learning</span>
                  </>
                )}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                {language === 'th'
                  ? 'เข้าสู่ระบบเพื่อสะสม Streak ต่อเนื่อง ฝึกฝนคำศัพท์ ไวยากรณ์ และแบบทดสอบเสมือนจริง'
                  : 'Sign in to maintain your daily streak, track CEFR milestones, and continue interactive practice.'}
              </p>
            </div>
          </div>

          {/* Floating Multilingual Speech Bubbles */}
          <div className="relative z-10 my-6 sm:my-8 space-y-2.5">
            <div className="flex items-center justify-start">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 dark:bg-[#252030] border border-border/80 shadow-md shadow-slate-900/5 -rotate-1 hover:rotate-0 transition-transform duration-200">
                <UkFlagSvg className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Hello, Explorer!</p>
                  <p className="text-[10px] text-muted-foreground">Ready for today's mission</p>
                </div>
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 dark:bg-[#252030] border border-[#FA5D5D]/30 shadow-md shadow-[#FA5D5D]/5 rotate-2 hover:rotate-0 transition-transform duration-200">
                <ThaiFlagSvg className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold text-foreground">สวัสดีคนเก่ง!</p>
                  <p className="text-[10px] text-[#FA5D5D] font-medium">B2 Exam Readiness</p>
                </div>
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-start pl-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#252030]/90 border border-border/70 shadow-xs -rotate-2 hover:rotate-0 transition-transform duration-200">
                <SpanishFlagSvg className="w-4 h-4" />
                <span className="text-[11px] font-semibold text-foreground">¡Vamos a aprender!</span>
              </div>
            </div>
          </div>

          {/* Bottom CEFR Track */}
          <div className="relative z-10 pt-3 border-t border-border/50 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#FA5D5D]" />
              <span className="font-bold text-foreground">CEFR A1-C2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Speech & Grammar</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="relative w-full lg:w-[55%] p-6 sm:p-8 flex flex-col justify-center bg-card space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {t('auth.title_signin')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'th' ? 'กรอกข้อมูลเพื่อเข้าใช้งานบัญชีของคุณ' : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isSubmitting}
              className="touch-target py-2.5 px-3 rounded-xl border border-border/80 bg-background hover:bg-secondary/70 text-foreground text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-2xs hover:shadow-xs disabled:opacity-50"
            >
              <GoogleSvgIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('auth.continue_with_google')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={isSubmitting}
              className="touch-target py-2.5 px-3 rounded-xl border border-border/80 bg-background hover:bg-secondary/70 text-foreground text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-2xs hover:shadow-xs disabled:opacity-50"
            >
              <FacebookSvgIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('auth.continue_with_facebook')}</span>
            </button>
          </div>

          {/* Demo Student Fast Access */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isSubmitting}
            className="touch-target w-full py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs min-h-[44px] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{language === 'th' ? 'เข้าสู่ระบบด่วน (Demo Student)' : 'Quick Demo Student Access'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('auth.or_divider')}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">{t('auth.email_label')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#FA5D5D] focus:ring-4 focus:ring-[#FA5D5D]/15 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">{t('auth.password_label')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border/80 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#FA5D5D] focus:ring-4 focus:ring-[#FA5D5D]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-md shadow-[#FA5D5D]/25 min-h-[46px] active:scale-[0.98] mt-2"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="p-0 text-white" />
              ) : (
                <span>{t('auth.signin_button')}</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-muted-foreground">
            <span>{t('auth.no_account_prompt')} </span>
            <Link
              href="/signup"
              className="font-bold text-[#FA5D5D] hover:underline ml-1"
            >
              {t('auth.switch_to_signup')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
