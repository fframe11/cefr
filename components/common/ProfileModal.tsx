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

const CAMBRIDGE_EXAMS: { code: CambridgeExamCode; name: string; cefr: string }[] = [
  { code: 'KET', name: 'A2 Key (KET)', cefr: 'A2' },
  { code: 'PET', name: 'B1 Preliminary (PET)', cefr: 'B1' },
  { code: 'FCE', name: 'B2 First (FCE)', cefr: 'B2' },
  { code: 'CAE', name: 'C1 Advanced (CAE)', cefr: 'C1' },
];

const PRESET_GOAL_MINUTES = [15, 20, 30, 45, 60];

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

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentLocalTargetExam,
  currentLocalDailyGoal,
  onProfileUpdated,
}) => {
  const { status, user, profile, signInWithPassword, signUpWithPassword, signInWithOAuth, signOut, updateProfile } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Profile Edit State
  const [selectedExam, setSelectedExam] = useState<CambridgeExamCode>(currentLocalTargetExam);
  const [dailyGoal, setDailyGoal] = useState<number>(currentLocalDailyGoal);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Sync profile fields from context or local props
  useEffect(() => {
    if (profile) {
      setSelectedExam(profile.target_exam);
      setDailyGoal(profile.daily_goal_minutes);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              {status === 'authenticated' ? <UserIcon className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <h2 id="profile-modal-title" className="text-base font-semibold text-foreground">
              {status === 'authenticated'
                ? t('auth.title_profile')
                : activeTab === 'signup'
                ? t('auth.title_signup')
                : activeTab === 'guest'
                ? t('auth.guest_goal_title')
                : t('auth.title_signin')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={t('auth.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authenticated User View */}
        {status === 'authenticated' && user ? (
          <div className="space-y-4">
            {/* Identity Banner */}
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">{t('auth.logged_in_as')}</p>
              <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
            </div>

            {/* Link to Full Profile Page */}
            <Link
              href="/profile"
              onClick={onClose}
              className="touch-target w-full py-2.5 px-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <UserIcon className="w-4 h-4" />
              <span>{t('auth.menu_profile')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">{t('auth.cefr_level')}</p>
                  <p className="text-sm font-bold text-foreground">
                    {profile?.current_cefr_level || 'A1'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">{t('auth.streak_stat')}</p>
                  <p className="text-sm font-bold text-foreground">
                    {profile?.streak_days || 0} {t('auth.days_unit')}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Exam Selection Pills */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>{t('auth.target_exam_section')}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CAMBRIDGE_EXAMS.map((exam) => {
                  const isSelected = selectedExam === exam.code;
                  return (
                    <button
                      key={exam.code}
                      type="button"
                      onClick={() => setSelectedExam(exam.code)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                          : 'bg-card text-foreground hover:bg-secondary/70 border-border/70 font-medium'
                      }`}
                    >
                      <span className="text-xs font-bold">{exam.code}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
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
                <span className="font-semibold text-foreground">{t('auth.daily_goal_section')}</span>
                <span className="font-bold text-primary tabular-nums">{dailyGoal} {t('auth.minutes_per_day')}</span>
              </div>
              <div className="flex gap-1.5">
                {PRESET_GOAL_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoal(mins)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      dailyGoal === mins
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground hover:bg-secondary border-border/70'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback & Actions */}
            {profileSuccessMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {authError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingProfile}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-xs min-h-[44px]"
              >
                {isSavingProfile ? (
                  <LoadingSpinner size="sm" className="p-0 text-primary-foreground" />
                ) : (
                  <span>{t('auth.save_settings')}</span>
                )}
              </button>
              <button
                type="button"
                onClick={signOut}
                className="py-2.5 px-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/15 transition-colors flex items-center justify-center text-center min-h-[44px]"
                title={t('auth.sign_out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated Auth Tabs View */
          <div className="space-y-4">
            {/* Segmented Tab Switcher */}
            <div className="flex p-1 bg-secondary/60 rounded-xl border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center text-center transition-all ${
                  activeTab === 'signin'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.tab_signin')}
              </button>
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center text-center transition-all ${
                  activeTab === 'signup'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.tab_signup')}
              </button>
              <button
                type="button"
                onClick={() => switchTab('guest')}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center text-center transition-all ${
                  activeTab === 'guest'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.tab_guest_settings')}
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <div className="space-y-3.5">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('auth.email_label')}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.email_placeholder')}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('auth.password_label')}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.password_placeholder')}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-xs min-h-[44px] mt-1"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" className="p-0 text-primary-foreground" />
                    ) : (
                      <span>{t('auth.signin_button')}</span>
                    )}
                  </button>
                </form>

                {/* Social Login Divider */}
                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t('auth.or_divider')}
                  </div>
                </div>

                {/* Social OAuth Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary/70 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-2.5 min-h-[44px] shadow-2xs hover:shadow-xs disabled:opacity-50"
                  >
                    <GoogleSvgIcon className="w-4 h-4 shrink-0" />
                    <span>{t('auth.continue_with_google')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('facebook')}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary/70 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-2.5 min-h-[44px] shadow-2xs hover:shadow-xs disabled:opacity-50"
                  >
                    <FacebookSvgIcon className="w-4 h-4 shrink-0" />
                    <span>{t('auth.continue_with_facebook')}</span>
                  </button>
                </div>

                <div className="text-center pt-2 text-xs text-muted-foreground">
                  <span>{t('auth.no_account_prompt')} </span>
                  <button
                    type="button"
                    onClick={() => switchTab('signup')}
                    className="font-semibold text-primary hover:underline ml-1"
                  >
                    {t('auth.switch_to_signup')}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP */}
            {activeTab === 'signup' && (
              <div>
                {verificationSent ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {t('auth.verification_email_sent_title')}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed px-2">
                      {t('auth.verification_email_sent_desc')}
                    </p>
                    <button
                      type="button"
                      onClick={() => switchTab('signin')}
                      className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center text-center min-h-[44px]"
                    >
                      {t('auth.back_to_signin')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <form onSubmit={handleSignUp} className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">{t('auth.email_label')}</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                          <input
                            type="email"
                            required
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('auth.email_placeholder')}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">{t('auth.password_label')}</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('auth.password_placeholder')}
                            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">{t('auth.confirm_password_label')}</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('auth.confirm_password_placeholder')}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>

                      {authError && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-xs min-h-[44px] mt-1"
                      >
                        {isSubmitting ? (
                          <LoadingSpinner size="sm" className="p-0 text-primary-foreground" />
                        ) : (
                          <span>{t('auth.signup_button')}</span>
                        )}
                      </button>
                    </form>

                    {/* Social Login Divider */}
                    <div className="relative my-3 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {t('auth.or_divider')}
                      </div>
                    </div>

                    {/* Social OAuth Buttons */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleOAuthSignIn('google')}
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary/70 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-2.5 min-h-[44px] shadow-2xs hover:shadow-xs disabled:opacity-50"
                      >
                        <GoogleSvgIcon className="w-4 h-4 shrink-0" />
                        <span>{t('auth.continue_with_google')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOAuthSignIn('facebook')}
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary/70 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-2.5 min-h-[44px] shadow-2xs hover:shadow-xs disabled:opacity-50"
                      >
                        <FacebookSvgIcon className="w-4 h-4 shrink-0" />
                        <span>{t('auth.continue_with_facebook')}</span>
                      </button>
                    </div>

                    <div className="text-center pt-2 text-xs text-muted-foreground">
                      <span>{t('auth.have_account_prompt')} </span>
                      <button
                        type="button"
                        onClick={() => switchTab('signin')}
                        className="font-semibold text-primary hover:underline ml-1"
                      >
                        {t('auth.switch_to_signin')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GUEST SETTINGS */}
            {activeTab === 'guest' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-foreground">{t('auth.guest_mode_badge')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('auth.guest_mode_desc')}
                  </p>
                </div>

                {/* Target Exam Selection Pills */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span>{t('auth.target_exam_section')}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CAMBRIDGE_EXAMS.map((exam) => {
                      const isSelected = selectedExam === exam.code;
                      return (
                        <button
                          key={exam.code}
                          type="button"
                          onClick={() => setSelectedExam(exam.code)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                              : 'bg-card text-foreground hover:bg-secondary/70 border-border/70 font-medium'
                          }`}
                        >
                          <span className="text-xs font-bold">{exam.code}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
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
                    <span className="font-semibold text-foreground">{t('auth.daily_goal_section')}</span>
                    <span className="font-bold text-primary tabular-nums">{dailyGoal} {t('auth.minutes_per_day')}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {PRESET_GOAL_MINUTES.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDailyGoal(mins)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          dailyGoal === mins
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground hover:bg-secondary border-border/70'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                    <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingProfile}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center text-center shadow-xs min-h-[44px]"
                >
                  {isSavingProfile ? (
                    <LoadingSpinner size="sm" className="p-0 text-primary-foreground" />
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
  );
};
