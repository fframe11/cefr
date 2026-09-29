'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Flame,
  Clock,
  Award,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Edit2,
  Check,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  ArrowRight,
  RefreshCw,
  Mail,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { CambridgeExamCode, CEFRLevel } from '../../types';
import { GlovaLevelBadge } from '../../components/ui/GlovaBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CEFRTier } from '@/lib/design-tokens/tokens';

const CAMBRIDGE_EXAMS: { code: CambridgeExamCode; name: string; cefr: string }[] = [
  { code: 'KET', name: 'A2 Key (KET)', cefr: 'A2' },
  { code: 'PET', name: 'B1 Preliminary (PET)', cefr: 'B1' },
  { code: 'FCE', name: 'B2 First (FCE)', cefr: 'B2' },
  { code: 'CAE', name: 'C1 Advanced (CAE)', cefr: 'C1' },
];

const PRESET_GOAL_MINUTES = [15, 20, 30, 45, 60];

function getInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return 'GL';
  const clean = nameOrEmail.trim();
  if (clean.includes('@')) {
    const prefix = clean.split('@')[0];
    return prefix.slice(0, 2).toUpperCase();
  }
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { status, user, profile, updateProfile, updateDisplayName, signOut } = useAuth();
  const { progress, setProgress, setIsProfileModalOpen } = useApp();
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  // Local state for goals
  const [selectedExam, setSelectedExam] = useState<CambridgeExamCode>(progress.targetExam);
  const [dailyGoal, setDailyGoal] = useState<number>(progress.dailyGoalMinutes);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalsSuccessMsg, setGoalsSuccessMsg] = useState<string | null>(null);

  // Local state for display name
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccessMsg, setNameSuccessMsg] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sync state when profile or user changes
  useEffect(() => {
    if (profile) {
      setSelectedExam(profile.target_exam);
      setDailyGoal(profile.daily_goal_minutes);
    } else {
      setSelectedExam(progress.targetExam);
      setDailyGoal(progress.dailyGoalMinutes);
    }
  }, [profile, progress.targetExam, progress.dailyGoalMinutes]);

  useEffect(() => {
    const currentName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || '';
    setDisplayNameInput(currentName);
  }, [user]);

  const handleSaveGoals = async () => {
    setIsSavingGoals(true);
    setGoalsSuccessMsg(null);
    try {
      if (status === 'authenticated') {
        await updateProfile({
          target_exam: selectedExam,
          daily_goal_minutes: dailyGoal,
        });
      }

      // Update AppContext progress
      setProgress({
        ...progress,
        targetExam: selectedExam,
        dailyGoalMinutes: dailyGoal,
      });

      // Update localStorage for consistency
      if (typeof window !== 'undefined') {
        localStorage.setItem('cefr_platform_target_exam', selectedExam);
        localStorage.setItem('cefr_platform_daily_goal_minutes', dailyGoal.toString());
      }

      setGoalsSuccessMsg(t('auth.save_success'));
      setTimeout(() => setGoalsSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to save profile goals:', err);
    } finally {
      setIsSavingGoals(false);
    }
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput.trim()) return;
    setIsSavingName(true);
    setNameError(null);
    setNameSuccessMsg(null);
    try {
      const { error } = await updateDisplayName(displayNameInput.trim());
      if (error) {
        setNameError(error.message);
      } else {
        setNameSuccessMsg(t('auth.display_name_saved'));
        setIsEditingName(false);
        setTimeout(() => setNameSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setNameError(err?.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isAuthenticated = status === 'authenticated' && !!user;
  const currentDisplayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    (isEn ? 'Glova Learner' : 'ผู้เรียน Glova');

  const initials = getInitials(currentDisplayName);
  const minutesStudied = progress.minutesStudiedToday || 0;
  const goalMinutes = profile?.daily_goal_minutes || progress.dailyGoalMinutes || 20;
  const goalPercent = Math.min(100, Math.round((minutesStudied / goalMinutes) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-amber-500/10 border border-border/70 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Avatar Bubble */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md ring-4 ring-background">
              {isAuthenticated ? initials : <UserIcon className="w-10 h-10" />}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <GlovaLevelBadge
                level={(profile?.current_cefr_level || progress.currentLevel) as CEFRTier}
                size="md"
              />
            </div>
          </div>

          {/* User Information & Identity */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {isEditingName ? (
                <form onSubmit={handleSaveDisplayName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-background border border-primary text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('auth.display_name_label')}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    aria-label={t('auth.save_display_name')}
                  >
                    {isSavingName ? <LoadingSpinner size="sm" className="p-0 text-white" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                    {isAuthenticated ? currentDisplayName : t('auth.guest_mode_badge')}
                  </h1>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayNameInput(currentDisplayName);
                        setIsEditingName(true);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title={t('auth.edit_display_name')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isEn ? 'Verified Account' : 'บัญชีที่ยืนยันแล้ว'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span>{t('auth.guest_mode_badge')}</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 truncate">
              {isAuthenticated ? (
                <>
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{user?.email}</span>
                </>
              ) : (
                <span>{t('auth.guest_account_notice')}</span>
              )}
            </p>

            {nameSuccessMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{nameSuccessMsg}</span>
              </p>
            )}
            {nameError && (
              <p className="text-xs text-destructive font-medium flex items-center justify-center sm:justify-start gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="shrink-0 flex items-center gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="touch-target flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/15 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('auth.sign_out')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="touch-target flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                <span>{t('auth.guest_convert_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Guest Mode Notice Banner if unauthenticated */}
      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/60 border border-border/80 text-foreground">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('auth.guest_mode_badge')}</h3>
              <p className="text-xs text-muted-foreground">{t('auth.guest_sync_notice')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="touch-target px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
          >
            {t('auth.signin_button')}
          </button>
        </div>
      )}

      {/* 2. Asymmetric 70/30 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (70% on desktop): Learning Target Goals & Skill Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Target Exam & Daily Goal Settings Card */}
          <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  {t('auth.target_exam_section')}
                </h2>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {isEn ? 'Self-calibrated learning path' : 'ปรับระดับการเรียนรู้อัตโนมัติ'}
              </span>
            </div>

            {/* Exam Pills */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAMBRIDGE_EXAMS.map((exam) => {
                  const isSelected = selectedExam === exam.code;
                  return (
                    <button
                      key={exam.code}
                      type="button"
                      onClick={() => setSelectedExam(exam.code)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                          : 'bg-background text-foreground hover:bg-secondary/70 border-border/70'
                      }`}
                    >
                      <span className="text-sm font-black">{exam.code}</span>
                      <span className={`text-[11px] ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                        {exam.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Goal Chips */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{t('auth.daily_goal_section')}</span>
                </span>
                <span className="font-bold text-primary tabular-nums">
                  {dailyGoal} {t('auth.minutes_per_day')}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_GOAL_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoal(mins)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-all ${
                      dailyGoal === mins
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-background text-foreground hover:bg-secondary/70 border-border/70'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button & Feedback */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              {goalsSuccessMsg ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{goalsSuccessMsg}</span>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleSaveGoals}
                disabled={isSavingGoals}
                className="w-full sm:w-auto touch-target px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSavingGoals ? (
                  <LoadingSpinner size="sm" className="p-0 text-white" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('auth.save_settings')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Skill Proficiency Breakdown Card */}
          <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold text-foreground">
                  {t('auth.skill_breakdown')}
                </h2>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {isEn ? 'CEFR Framework Calibration' : 'เทียบตามกรอบมาตรฐาน CEFR'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { name: isEn ? 'Reading' : 'การอ่านจับใจความ', code: 'reading', score: progress.skillStats?.reading || 75, color: 'bg-blue-500' },
                { name: isEn ? 'Listening' : 'ทักษะการฟัง', code: 'listening', score: progress.skillStats?.listening || 68, color: 'bg-emerald-500' },
                { name: isEn ? 'Grammar' : 'ไวยากรณ์', code: 'grammar', score: progress.skillStats?.grammar || 82, color: 'bg-purple-500' },
                { name: isEn ? 'Vocabulary' : 'คลังคำศัพท์', code: 'vocabulary', score: progress.skillStats?.vocabulary || 70, color: 'bg-amber-500' },
                { name: isEn ? 'Writing' : 'ทักษะการเขียน', code: 'writing', score: progress.skillStats?.writing || 60, color: 'bg-rose-500' },
                { name: isEn ? 'Speaking' : 'การพูดและออกเสียง', code: 'speaking', score: progress.skillStats?.speaking || 65, color: 'bg-teal-500' },
              ].map((skill) => (
                <div key={skill.code} className="p-3.5 rounded-xl bg-background border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{skill.name}</span>
                    <span className="text-primary tabular-nums">{skill.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (30% on desktop): Quick Metrics & Account Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3.5">
            {/* Streak Card */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 fill-amber-500/30" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  {t('auth.streak_stat')}
                </p>
                <p className="text-lg sm:text-xl font-black text-foreground tabular-nums">
                  {profile?.streak_days || progress.streakDays || 0} {t('auth.days_unit')}
                </p>
              </div>
            </div>

            {/* Daily Practice Time */}
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border/60 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {isEn ? 'Practice Today' : 'เวลาเรียนวันนี้'}
                </p>
                <p className="text-lg sm:text-xl font-black text-foreground tabular-nums">
                  {minutesStudied}/{goalMinutes}m
                </p>
              </div>
            </div>

            {/* Estimated Cambridge Score */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3.5 shadow-2xs col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('auth.estimated_score')}
                </p>
                <p className="text-lg sm:text-xl font-black text-foreground tabular-nums">
                  {profile?.estimated_cambridge_score || progress.estimatedCambridgeScore || 100} / 230
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic Assessment Card */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">
                {isEn ? 'Diagnostic Assessment' : 'แบบทดสอบวัดระดับ'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {progress.assessmentCompleted || profile?.assessment_completed
                ? t('auth.diagnostic_completed')
                : t('auth.diagnostic_pending')}
            </p>
            <Link
              href="/assessment"
              className="touch-target w-full py-2.5 px-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('auth.retake_diagnostic')}</span>
            </Link>
          </div>

          {/* Account Details & Metadata Card */}
          {isAuthenticated && (
            <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('auth.account_details')}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('auth.email_label')}</span>
                  <span className="font-semibold text-foreground truncate max-w-[160px]">{user?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('auth.created_account_date')}</span>
                  <span className="font-semibold text-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{isEn ? 'User ID' : 'รหัสผู้ใช้'}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{user?.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
