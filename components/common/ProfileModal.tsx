'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  User as UserIcon,
  Lock,
  Mail,
  Award,
  Flame,
  Check,
  AlertCircle,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Target,
  ArrowRight,
  Sparkles,
  Globe,
  Languages,
  BookOpen,
  TrendingUp,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { CambridgeExamCode } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocalTargetExam: CambridgeExamCode;
  currentLocalDailyGoal: number;
  onProfileUpdated?: (updated: { targetExam: CambridgeExamCode; dailyGoalMinutes: number }) => void;
}

const CAMBRIDGE_EXAMS: { code: CambridgeExamCode; name: string; cefr: string; desc: string }[] = [
  { code: 'KET', name: 'A2 Key (KET)', cefr: 'A2', desc: 'Basic Everyday' },
  { code: 'PET', name: 'B1 Preliminary (PET)', cefr: 'B1', desc: 'Practical English' },
  { code: 'FCE', name: 'B2 First (FCE)', cefr: 'B2', desc: 'Work & Study' },
  { code: 'CAE', name: 'C1 Advanced (CAE)', cefr: 'C1', desc: 'Professional Fluency' },
];

const PRESET_GOAL_MINUTES = [15, 20, 30, 45, 60];

// Tree-shaken SVG Brand Logos
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

// High-craft Language Flag Chips (No raw emojis)
const UkFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 60 30" aria-hidden="true">
    <clipPath id="uk-clip">
      <circle cx="30" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#uk-clip)">
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
    <clipPath id="th-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#th-clip)">
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
    <clipPath id="es-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#es-clip)">
      <rect y="0" width="30" height="7.5" fill="#AA151B" />
      <rect y="7.5" width="30" height="15" fill="#F1BF00" />
      <rect y="22.5" width="30" height="7.5" fill="#AA151B" />
    </g>
  </svg>
);

const FrenchFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`rounded-full shrink-0 shadow-2xs ${className}`} viewBox="0 0 30 30" aria-hidden="true">
    <clipPath id="fr-clip">
      <circle cx="15" cy="15" r="15" />
    </clipPath>
    <g clipPath="url(#fr-clip)">
      <rect x="0" width="10" height="30" fill="#002654" />
      <rect x="10" width="10" height="30" fill="#FFFFFF" />
      <rect x="20" width="10" height="30" fill="#ED2939" />
    </g>
  </svg>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentLocalTargetExam,
  currentLocalDailyGoal,
  onProfileUpdated,
}) => {
  const { status, user, profile, signInWithPassword, signUpWithPassword, signInWithOAuth, signOut, updateProfile } = useAuth();
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Profile / Goal Selection
  const [selectedExam, setSelectedExam] = useState<CambridgeExamCode>(currentLocalTargetExam);
  const [dailyGoal, setDailyGoal] = useState<number>(currentLocalDailyGoal);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Sync profile fields from context or local props
  useEffect(() => {
    if (profile) {
      setSelectedExam(profile.target_exam);
      setDailyGoal(profile.daily_goal_minutes);
      if (profile.display_name) setDisplayName(profile.display_name);
    } else {
      setSelectedExam(currentLocalTargetExam);
      setDailyGoal(currentLocalDailyGoal);
    }
  }, [profile, currentLocalTargetExam, currentLocalDailyGoal]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset form errors when tab changes
  const switchTab = (tab: 'signin' | 'signup' | 'guest') => {
    setActiveTab(tab);
    setAuthError(null);
    setProfileSuccessMsg(null);
    setVerificationSent(false);
  };

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
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
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password.length < 6) {
      setAuthError(t('auth.password_too_short'));
      return;
    }

    if (password !== confirmPassword) {
      setAuthError(t('auth.password_mismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error, confirmationRequired } = await signUpWithPassword(email.trim(), password);
      if (error) {
        setAuthError(error.message || t('auth.err_general'));
      } else if (confirmationRequired) {
        setVerificationSent(true);
      } else {
        // Also update initial target exam if specified
        if (selectedExam) {
          try {
            await updateProfile({ target_exam: selectedExam, daily_goal_minutes: dailyGoal });
          } catch {
            // Non-blocking fallback
          }
        }
        setProfileSuccessMsg(t('auth.save_success'));
        setTimeout(() => onClose(), 1200);
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
        const msg = error.message.toLowerCase();
        if (msg.includes('not enabled') || msg.includes('validation_failed') || msg.includes('unsupported')) {
          setAuthError(t('auth.oauth_unconfigured_msg'));
        } else {
          setAuthError(error.message || t('auth.err_general'));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setAuthError(null);

    try {
      if (status === 'authenticated') {
        await updateProfile({
          target_exam: selectedExam,
          daily_goal_minutes: dailyGoal,
        });
      }

      if (onProfileUpdated) {
        onProfileUpdated({
          targetExam: selectedExam,
          dailyGoalMinutes: dailyGoal,
        });
      }

      setProfileSuccessMsg(t('auth.save_success'));
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      setAuthError(err?.message || t('auth.err_general'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl rounded-[28px] bg-card border border-border/80 shadow-2xl shadow-rose-950/10 overflow-hidden flex flex-col lg:flex-row max-h-[92vh] lg:max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mondly-auth-modal-title"
      >
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background border border-border/60 text-muted-foreground hover:text-foreground shadow-xs transition-all active:scale-95"
          aria-label={t('auth.close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================================= */}
        {/* LEFT COLUMN: Mondly Outcrowd Language Learning Visual Showcase Canvas      */}
        {/* ========================================================================= */}
        <div className="relative w-full lg:w-[45%] p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#FFF5EE] via-[#FFF9F5] to-[#FEECE0] dark:from-[#18141F] dark:via-[#1D1926] dark:to-[#14121B] border-b lg:border-b-0 lg:border-r border-border/60">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#FA5D5D]/15 dark:bg-[#FA5D5D]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#38BDF8]/15 dark:bg-[#38BDF8]/10 blur-3xl pointer-events-none" />

          {/* Top Brand Identity */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/10 border border-[#FA5D5D]/20 shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#FA5D5D] animate-pulse" />
              <span className="text-[11px] font-bold text-foreground tracking-wide uppercase">
                Glova Language Platform
              </span>
            </div>

            <div className="space-y-2">
              <h1 id="mondly-auth-modal-title" className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                {language === 'th' ? (
                  <>
                    เก่งภาษาอังกฤษ <br />
                    <span className="text-[#FA5D5D]">ด้วยบทสนทนาจริง</span>
                  </>
                ) : (
                  <>
                    Master English <br />
                    <span className="text-[#FA5D5D]">Real Conversations</span>
                  </>
                )}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                {language === 'th'
                  ? 'ฝึกฝนตามกรอบมาตรฐาน CEFR ครบ 4 ทักษะ พร้อมระบบตรวจจับเสียงและการจำลองข้อสอบ Cambridge เสมือนจริง'
                  : 'Progress through authentic CEFR milestones with AI pronunciation scoring and official Cambridge exam formats.'}
              </p>
            </div>
          </div>

          {/* Middle: Mondly Iconic Multilingual Floating Speech Bubbles */}
          <div className="relative z-10 my-6 sm:my-8 space-y-2.5">
            {/* Bubble 1: English */}
            <div className="flex items-center justify-start">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 dark:bg-[#252030] border border-border/80 shadow-md shadow-slate-900/5 -rotate-1 hover:rotate-0 transition-transform duration-200">
                <UkFlagSvg className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Hello, Explorer!</p>
                  <p className="text-[10px] text-muted-foreground">Daily Practice • Day 12</p>
                </div>
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Bubble 2: Thai */}
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 dark:bg-[#252030] border border-[#FA5D5D]/30 shadow-md shadow-[#FA5D5D]/5 rotate-2 hover:rotate-0 transition-transform duration-200">
                <ThaiFlagSvg className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold text-foreground">สวัสดีคนเก่ง!</p>
                  <p className="text-[10px] text-[#FA5D5D] font-medium">B2 First Milestone</p>
                </div>
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              </div>
            </div>

            {/* Bubble 3: Spanish / French */}
            <div className="hidden sm:flex items-center justify-start pl-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#252030]/90 border border-border/70 shadow-xs -rotate-2 hover:rotate-0 transition-transform duration-200">
                <SpanishFlagSvg className="w-4 h-4" />
                <span className="text-[11px] font-semibold text-foreground">¡Vamos a aprender!</span>
              </div>
            </div>
          </div>

          {/* Bottom: CEFR Staircase & Social Proof Metric */}
          <div className="relative z-10 pt-3 border-t border-border/50 space-y-3">
            {/* CEFR Level Track */}
            <div className="flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#FA5D5D]" />
                <span className="text-[10px] font-bold text-foreground">CEFR Scale</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">A1</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold">B1</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#FA5D5D]/15 text-[#FA5D5D] font-bold">B2</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold">C2</span>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>15m Daily Goals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FA5D5D] shrink-0" />
                <span>AI Speech Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interactive Authentication & Profile Configuration Form     */}
        {/* ========================================================================= */}
        <div className="relative w-full lg:w-[55%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-card">
          {/* Authenticated State */}
          {status === 'authenticated' && user ? (
            <div className="space-y-5">
              {/* Authenticated Header */}
              <div className="flex items-start justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FA5D5D] to-amber-500 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-md shadow-[#FA5D5D]/20">
                    {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {profile?.display_name || user.email?.split('@')[0] || t('auth.title_profile')}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate max-w-[240px] font-mono">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FA5D5D]/5 border border-[#FA5D5D]/20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FA5D5D]/10 flex items-center justify-center text-[#FA5D5D] shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.cefr_level')}</p>
                    <p className="text-base font-extrabold text-foreground">
                      {profile?.current_cefr_level || 'A1'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Flame className="w-5 h-5 fill-amber-500/30" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.streak_stat')}</p>
                    <p className="text-base font-extrabold text-foreground">
                      {profile?.streak_days || 0} {t('auth.days_unit')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Link to Full Profile View */}
              <Link
                href="/profile"
                onClick={onClose}
                className="touch-target w-full py-2.5 px-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t('auth.menu_profile')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Target Exam Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#FA5D5D]" />
                  <span>{t('auth.target_exam_section')}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CAMBRIDGE_EXAMS.map((exam) => {
                    const isSelected = selectedExam === exam.code;
                    return (
                      <button
                        key={exam.code}
                        type="button"
                        onClick={() => setSelectedExam(exam.code)}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#FA5D5D] text-white border-[#FA5D5D] shadow-md shadow-[#FA5D5D]/20 font-bold scale-[1.02]'
                            : 'bg-background hover:bg-secondary/70 border-border/70 text-foreground font-medium'
                        }`}
                      >
                        <span className="text-xs font-bold">{exam.code}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {exam.cefr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Study Goal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('auth.daily_goal_section')}</span>
                  </span>
                  <span className="font-extrabold text-[#FA5D5D] tabular-nums">
                    {dailyGoal} {t('auth.minutes_per_day')}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {PRESET_GOAL_MINUTES.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyGoal(mins)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        dailyGoal === mins
                          ? 'bg-[#FA5D5D] text-white border-[#FA5D5D] shadow-xs'
                          : 'bg-background hover:bg-secondary/70 border-border/70 text-foreground'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {profileSuccessMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingProfile}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-md shadow-[#FA5D5D]/20 min-h-[46px] active:scale-[0.98]"
                >
                  {isSavingProfile ? (
                    <LoadingSpinner size="sm" className="p-0 text-white" />
                  ) : (
                    <span>{t('auth.save_settings')}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="py-3 px-4 rounded-xl border border-destructive/30 bg-destructive/10 hover:bg-destructive/15 text-destructive text-xs font-bold transition-colors flex items-center justify-center text-center min-h-[46px]"
                  title={t('auth.sign_out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Flows */
            <div className="space-y-4">
              {/* Segmented Mondly Pill Tab Switcher */}
              <div className="flex p-1.5 bg-secondary/80 dark:bg-white/5 rounded-2xl border border-border/60 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center text-center ${
                    activeTab === 'signin'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('auth.tab_signin')}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center text-center ${
                    activeTab === 'signup'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('auth.tab_signup')}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('guest')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center text-center ${
                    activeTab === 'guest'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('auth.tab_guest_settings')}
                </button>
              </div>

              {/* =================================================================== */}
              {/* TAB 1: SIGN IN                                                      */}
              {/* =================================================================== */}
              {activeTab === 'signin' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  {/* One-Tap Social Logins */}
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

                  {/* Divider */}
                  <div className="relative my-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/60" />
                    </div>
                    <div className="relative bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t('auth.or_divider')}
                    </div>
                  </div>

                  {/* Credential Form */}
                  <form onSubmit={handleSignIn} className="space-y-3">
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
                    <button
                      type="button"
                      onClick={() => switchTab('signup')}
                      className="font-bold text-[#FA5D5D] hover:underline ml-1"
                    >
                      {t('auth.switch_to_signup')}
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 2: SIGN UP (CREATE ACCOUNT)                                     */}
              {/* =================================================================== */}
              {activeTab === 'signup' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  {verificationSent ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {t('auth.verification_email_sent_title')}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed px-4">
                        {t('auth.verification_email_sent_desc')}
                      </p>
                      <button
                        type="button"
                        onClick={() => switchTab('signin')}
                        className="mt-4 w-full py-3 rounded-xl bg-[#FA5D5D] text-white text-xs font-bold hover:bg-[#E84C4C] transition-all flex items-center justify-center text-center min-h-[46px]"
                      >
                        {t('auth.back_to_signin')}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* One-Tap Social Logins */}
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

                      {/* Divider */}
                      <div className="relative my-2 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border/60" />
                        </div>
                        <div className="relative bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {t('auth.or_divider')}
                        </div>
                      </div>

                      <form onSubmit={handleSignUp} className="space-y-3">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">{t('auth.password_label')}</label>
                            <div className="relative">
                              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                autoComplete="new-password"
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

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">{t('auth.confirm_password_label')}</label>
                            <div className="relative">
                              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('auth.confirm_password_placeholder')}
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#FA5D5D] focus:ring-4 focus:ring-[#FA5D5D]/15 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Integrated Initial Target Exam Goal */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-[#FA5D5D]" />
                              <span>{t('auth.target_exam_section')}</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal">Can be changed later</span>
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {CAMBRIDGE_EXAMS.map((exam) => {
                              const isSelected = selectedExam === exam.code;
                              return (
                                <button
                                  key={exam.code}
                                  type="button"
                                  onClick={() => setSelectedExam(exam.code)}
                                  className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                                    isSelected
                                      ? 'bg-[#FA5D5D] text-white border-[#FA5D5D] font-bold shadow-xs'
                                      : 'bg-background hover:bg-secondary/70 border-border/70 text-foreground font-medium'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold">{exam.code}</div>
                                  <div className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>{exam.cefr}</div>
                                </button>
                              );
                            })}
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
                            <span>{t('auth.signup_button')}</span>
                          )}
                        </button>
                      </form>

                      <div className="text-center pt-2 text-xs text-muted-foreground">
                        <span>{t('auth.have_account_prompt')} </span>
                        <button
                          type="button"
                          onClick={() => switchTab('signin')}
                          className="font-bold text-[#FA5D5D] hover:underline ml-1"
                        >
                          {t('auth.switch_to_signin')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 3: GUEST LEARNER SETTINGS                                       */}
              {/* =================================================================== */}
              {activeTab === 'guest' && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border/70 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#FA5D5D] shrink-0" />
                      <span className="text-xs font-bold text-foreground">{t('auth.guest_mode_badge')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('auth.guest_mode_desc')}
                    </p>
                  </div>

                  {/* Target Exam Selection Pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#FA5D5D]" />
                      <span>{t('auth.target_exam_section')}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CAMBRIDGE_EXAMS.map((exam) => {
                        const isSelected = selectedExam === exam.code;
                        return (
                          <button
                            key={exam.code}
                            type="button"
                            onClick={() => setSelectedExam(exam.code)}
                            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-[#FA5D5D] text-white border-[#FA5D5D] shadow-md shadow-[#FA5D5D]/20 font-bold scale-[1.02]'
                                : 'bg-background hover:bg-secondary/70 border-border/70 text-foreground font-medium'
                            }`}
                          >
                            <span className="text-xs font-bold">{exam.code}</span>
                            <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {exam.cefr}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Goal Selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('auth.daily_goal_section')}</span>
                      </span>
                      <span className="font-extrabold text-[#FA5D5D] tabular-nums">
                        {dailyGoal} {t('auth.minutes_per_day')}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {PRESET_GOAL_MINUTES.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDailyGoal(mins)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                            dailyGoal === mins
                              ? 'bg-[#FA5D5D] text-white border-[#FA5D5D] shadow-xs'
                              : 'bg-background hover:bg-secondary/70 border-border/70 text-foreground'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {profileSuccessMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                      <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSavingProfile}
                    className="w-full py-3 px-5 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-md shadow-[#FA5D5D]/25 min-h-[46px] active:scale-[0.98]"
                  >
                    {isSavingProfile ? (
                      <LoadingSpinner size="sm" className="p-0 text-white" />
                    ) : (
                      <span>{t('auth.save_settings')}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
