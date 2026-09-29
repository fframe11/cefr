'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Zap,
  Trophy,
  Award,
  Medal,
  Users,
  Search,
  UserPlus,
  Share2,
  Edit2,
  Camera,
  Check,
  ChevronRight,
  Target,
  Sparkles,
  LogOut,
  Mail,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { CambridgeExamCode } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GlovaAvatarWithFrame } from '../../components/gamification/RankFrame';
import { RankedTierBadge } from '@/components/ranked/RankedTierBadge';
import { AvatarEditorModal } from '@/components/profile/AvatarEditorModal';
import { fetchRankedProfile } from '@/lib/api/ranked';
import { RankedProfile } from '@/types/ranked';
import { fetchAchievements } from '@/lib/api/gamification';
import { Achievement, RankFrameId } from '@/types/gamification';

const CAMBRIDGE_EXAMS: { code: CambridgeExamCode; name: string; cefr: string }[] = [
  { code: 'KET', name: 'A2 Key', cefr: 'A2' },
  { code: 'PET', name: 'B1 Preliminary', cefr: 'B1' },
  { code: 'FCE', name: 'B2 First', cefr: 'B2' },
  { code: 'CAE', name: 'C1 Advanced', cefr: 'C1' },
];

const PRESET_GOAL_MINUTES = [15, 20, 30, 45, 60];

// Friendly active study buddies for the social sidebar
const STUDY_BUDDIES = [
  {
    name: 'Korn_Chula',
    handle: '@korn_cu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    frame: 'gaming_1' as RankFrameId,
    uni: 'Chulalongkorn University',
    isFollowing: true,
  },
  {
    name: 'Ploy_TU',
    handle: '@ploy_thammasat',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    frame: 'cute_1' as RankFrameId,
    uni: 'Thammasat University',
    isFollowing: true,
  },
  {
    name: 'Boss_KMITL',
    handle: '@boss_tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    frame: 'gaming_2' as RankFrameId,
    uni: 'KMITL',
    isFollowing: false,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { status, user, profile, updateProfile, updateDisplayName, updateAvatarUrl, signOut } = useAuth();
  const { progress, setProgress, setIsProfileModalOpen } = useApp();
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const isAuthenticated = status === 'authenticated';

  // Avatar & Customization state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(
    user?.user_metadata?.avatar_url ||
      (typeof window !== 'undefined' ? localStorage.getItem('glova_custom_avatar_url') : null) ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'
  );
  const [currentRankFrame, setCurrentRankFrame] = useState<RankFrameId>(
    (typeof window !== 'undefined' ? (localStorage.getItem('glova_rank_frame') as RankFrameId) : null) ||
      'lottie_cyber_apex'
  );
  const [currentCustomFrameUrl, setCurrentCustomFrameUrl] = useState<string>(
    (typeof window !== 'undefined' ? localStorage.getItem('glova_custom_frame_url') || '' : '')
  );

  // Ranked Competitive Profile
  const [rankedProfile, setRankedProfile] = useState<RankedProfile | null>(null);

  // Featured Achievements
  const [featuredAchievements, setFeaturedAchievements] = useState<Achievement[]>([]);

  // Social Sidebar Tabs
  const [socialTab, setSocialTab] = useState<'following' | 'followers'>('following');
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Local state for goals & display name
  const [selectedExam, setSelectedExam] = useState<CambridgeExamCode>(progress.targetExam);
  const [dailyGoal, setDailyGoal] = useState<number>(progress.dailyGoalMinutes);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalsSuccessMsg, setGoalsSuccessMsg] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const userId = user?.id || 'user_current';

    // Fetch ranked profile
    fetchRankedProfile(userId).then((res) => {
      if (res?.profile) setRankedProfile(res.profile);
    });

    // Fetch achievements
    fetchAchievements(userId).then((res) => {
      if (res && res.length > 0) {
        setFeaturedAchievements(res.slice(0, 3));
      }
    });

    // Check stored avatar
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('glova_custom_avatar_url');
      if (stored) setCurrentAvatarUrl(stored);
      const frameStored = localStorage.getItem('glova_rank_frame') as RankFrameId | null;
      if (frameStored) setCurrentRankFrame(frameStored);
      const customUrlStored = localStorage.getItem('glova_custom_frame_url');
      if (customUrlStored) setCurrentCustomFrameUrl(customUrlStored);
    }
  }, [user]);

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
    const currentName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Witchayut Kaewngern';
    setDisplayNameInput(currentName);
  }, [user]);

  const handleSaveAvatar = async (newUrl: string, newFrame: RankFrameId, customUrl?: string) => {
    setCurrentAvatarUrl(newUrl);
    setCurrentRankFrame(newFrame);
    setCurrentCustomFrameUrl(customUrl || '');
    if (typeof window !== 'undefined') {
      localStorage.setItem('glova_custom_avatar_url', newUrl);
      localStorage.setItem('glova_rank_frame', newFrame);
      if (customUrl) {
        localStorage.setItem('glova_custom_frame_url', customUrl);
      } else {
        localStorage.removeItem('glova_custom_frame_url');
      }
    }
    await updateAvatarUrl(newUrl);
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput.trim()) return;
    setIsSavingName(true);
    try {
      await updateDisplayName(displayNameInput.trim());
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  };

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
      setProgress({
        ...progress,
        targetExam: selectedExam,
        dailyGoalMinutes: dailyGoal,
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('cefr_platform_target_exam', selectedExam);
        localStorage.setItem('cefr_platform_daily_goal_minutes', dailyGoal.toString());
      }
      setGoalsSuccessMsg('บันทึกเป้าหมายเรียบร้อย');
      setTimeout(() => setGoalsSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingGoals(false);
    }
  };

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText('https://glova.app/invite/GLOVA-STUDENT-2026');
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Witchayut Kaewngern';
  const handle = displayName.toLowerCase().replace(/\s+/g, '_');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 pb-24 font-sans text-foreground">
      {/* 2-Column Asymmetric Layout (Left: 68%, Right: 32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT MAIN COLUMN (~68%) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. HERO PROFILE IDENTITY CARD */}
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar with Camera/Edit Overlay */}
              <div className="relative group shrink-0">
                <GlovaAvatarWithFrame
                  avatarUrl={currentAvatarUrl}
                  username={displayName}
                  frameId={currentRankFrame}
                  customAnimationUrl={currentCustomFrameUrl || undefined}
                  size="xl"
                />

                {/* Edit Photo Overlay Button */}
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  aria-label="เปลี่ยนรูปโปรไฟล์"
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-background transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title="คลิกเพื่ออัปโหลดหรือเปลี่ยนรูปโปรไฟล์"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Identity & Metadata */}
              <div className="flex-1 text-center sm:text-left space-y-2.5">
                {/* Display Name with inline edit */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  {isEditingName ? (
                    <form onSubmit={handleSaveDisplayName} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        className="rounded-xl border border-primary bg-background px-3 py-1.5 text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isSavingName}
                        className="rounded-xl bg-primary p-2 text-white hover:bg-primary/90"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                        {displayName}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="แก้ไขชื่อที่แสดง"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {isAuthenticated ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      ยืนยันแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      ผู้ใช้ทั่วไป (Guest)
                    </span>
                  )}
                </div>

                {/* Handle & Join Date */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/80">@{handle}</span>
                  <span>•</span>
                  <span>เข้าร่วมเมื่อ กันยายน 2026</span>
                </div>

                {/* Social Counters */}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSocialTab('following')}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    กำลังติดตาม <span className="font-bold text-primary">12</span> คน
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={() => setSocialTab('followers')}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    ผู้ติดตาม <span className="font-bold text-primary">24</span> คน
                  </button>
                </div>

                {/* Target Exam & Rank Ribbon */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <Target className="h-3.5 w-3.5" />
                    เป้าหมาย: {selectedExam} (CEFR {CAMBRIDGE_EXAMS.find((e) => e.code === selectedExam)?.cefr || 'B2'})
                  </span>

                  <RankedTierBadge
                    tier={rankedProfile?.tier || 'Gold'}
                    division={rankedProfile?.division || 'II'}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. สถิติ (STATISTICS 2x2 GRID) */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-foreground tracking-tight">สถิติ</h2>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Stat 1: Day Streak */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <Flame className="h-6 w-6 fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                    {profile?.streak_days || progress.streakDays || 14}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">วันต่อเนื่อง</div>
                </div>
              </div>

              {/* Stat 2: Total XP */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Zap className="h-6 w-6 fill-indigo-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                    {(2450).toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">XP ทั้งหมด</div>
                </div>
              </div>

              {/* Stat 3: Current League / MMR */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-black text-foreground truncate">
                    {rankedProfile?.tier || 'Gold'} {rankedProfile?.division || 'II'}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    ลีกปัจจุบัน ({rankedProfile?.rating || 1284} MMR)
                  </div>
                </div>
              </div>

              {/* Stat 4: Top 3 Finishes */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums">5</div>
                  <div className="text-xs font-medium text-muted-foreground">ครั้งที่อยู่ในท็อป 3</div>
                </div>
              </div>

              {/* Stat 5: Cambridge Estimated Score & Skill Breakdown */}
              <div className="col-span-2 flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm sm:text-base font-black text-foreground">
                      คะแนนเคมบริดจ์โดยประมาณ: {progress.estimatedCambridgeScore || 160} / 230
                    </div>
                    <div className="text-xs text-muted-foreground">
                      เป้าหมาย {progress.targetExam} • CEFR {progress.currentLevel}
                    </div>
                  </div>
                  {progress.skillStats && (
                    <div className="flex gap-2 text-[11px] font-tech text-muted-foreground">
                      <span>R: {progress.skillStats.reading || 80}%</span>
                      <span>L: {progress.skillStats.listening || 75}%</span>
                      <span>G: {progress.skillStats.grammar || 85}%</span>
                      <span>V: {progress.skillStats.vocabulary || 90}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3. ความสำเร็จ (ACHIEVEMENTS LIST) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground tracking-tight">ความสำเร็จ</h2>
              <Link
                href="/achievements"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border/40 rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
              {/* Achievement 1: Fire Starter */}
              <div className="flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Flame className="h-7 w-7 fill-amber-500" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">เพลิงพระกาฬ (Fire Starter)</span>
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                        ระดับ 1
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">3/3</span>
                  </div>
                  <p className="text-xs text-muted-foreground">เรียนต่อเนื่องกัน 3 วันให้สำเร็จ</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-amber-500 w-full" />
                  </div>
                </div>
              </div>

              {/* Achievement 2: Sage */}
              <div className="flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">นักปราชญ์ (Scholar)</span>
                      <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-black text-indigo-700 dark:text-indigo-300">
                        ระดับ 1
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">80/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground">สะสมแต้มให้ครบ 100 XP</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-indigo-500 w-4/5" />
                  </div>
                </div>
              </div>

              {/* Achievement 3: Champion */}
              <div className="flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Trophy className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">แชมเปี้ยนลีก (Champion)</span>
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                        ระดับ 1
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">1/1</span>
                  </div>
                  <p className="text-xs text-muted-foreground">ปลดล็อกตารางคะแนนแข่งขันและจบ 10 บทเรียน</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-emerald-500 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. การตั้งค่าเป้าหมายการเรียน (LEARNING GOALS) */}
          <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">เป้าหมายการเรียนรู้ประจำวัน</h3>
              </div>
              <span className="text-xs text-muted-foreground">ปรับระดับความเข้มข้นได้ตลอดเวลา</span>
            </div>

            {/* Target Exam Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                การสอบเป้าหมาย (Cambridge Exam Target)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAMBRIDGE_EXAMS.map((exam) => {
                  const isSelected = selectedExam === exam.code;
                  return (
                    <button
                      key={exam.code}
                      type="button"
                      onClick={() => setSelectedExam(exam.code)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-primary bg-primary text-white font-bold shadow-xs'
                          : 'border-border/60 bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-xs font-bold">{exam.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                        CEFR {exam.cefr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Goal Minutes */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                เวลาเรียนต่อวัน: <span className="text-primary font-black">{dailyGoal} นาที</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_GOAL_MINUTES.map((mins) => {
                  const isSelected = dailyGoal === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyGoal(mins)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                    >
                      {mins} นาที
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveGoals}
                disabled={isSavingGoals}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {isSavingGoals ? 'กำลังบันทึก...' : 'บันทึกเป้าหมาย'}
              </button>
              {goalsSuccessMsg && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  {goalsSuccessMsg}
                </span>
              )}
            </div>
          </section>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDEBAR COLUMN (~32%) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. FRIENDS / SOCIAL TABS CARD */}
          <section className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
            {/* Tab Header */}
            <div className="grid grid-cols-2 border-b border-border/40 text-center font-bold text-xs">
              <button
                type="button"
                onClick={() => setSocialTab('following')}
                className={`py-3.5 transition-colors ${
                  socialTab === 'following'
                    ? 'border-b-2 border-primary text-primary font-black bg-primary/[0.03]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                กำลังติดตาม
              </button>
              <button
                type="button"
                onClick={() => setSocialTab('followers')}
                className={`py-3.5 transition-colors ${
                  socialTab === 'followers'
                    ? 'border-b-2 border-primary text-primary font-black bg-primary/[0.03]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ผู้ติดตาม
              </button>
            </div>

            {/* Friends Content */}
            <div className="p-5 space-y-4">
              {/* Community Encourage Message */}
              <div className="flex items-start gap-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 p-3.5">
                <Users className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200 font-medium">
                  ถ้ามีคนเรียนเป็นเพื่อนด้วยแล้วจะสนุก และเห็นผลขึ้นอีกเท่าตัวเลยนะ!
                </p>
              </div>

              {/* Study Buddies List */}
              <div className="divide-y divide-border/30">
                {STUDY_BUDDIES.map((buddy, idx) => (
                  <div key={`buddy_${idx}`} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <GlovaAvatarWithFrame
                        avatarUrl={buddy.avatar}
                        username={buddy.name}
                        frameId={buddy.frame}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-foreground truncate">
                          {buddy.name}
                        </span>
                        <span className="block text-[10px] text-muted-foreground truncate">
                          {buddy.uni}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                        buddy.isFollowing
                          ? 'border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                          : 'bg-primary text-white shadow-xs hover:bg-primary/90'
                      }`}
                    >
                      {buddy.isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. ADD FRIENDS ACTION CARD */}
          <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              เพิ่มเพื่อน
            </h3>

            <div className="space-y-2">
              <Link
                href="/social?tab=search"
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-background p-3.5 text-xs font-bold text-foreground hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <span>ค้นหาเพื่อน</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="flex w-full items-center justify-between rounded-2xl border border-border/50 bg-background p-3.5 text-xs font-bold text-foreground hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span>ชวนเพื่อน</span>
                    {copiedInvite && (
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                        คัดลอกลิงก์เรียบร้อย!
                      </span>
                    )}
                  </div>
                </div>
                {copiedInvite ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </section>

          {/* 3. ACCOUNT ACTIONS & LOGOUT */}
          <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              บัญชีผู้ใช้
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">สถานะ</span>
                <span className="font-semibold text-foreground">
                  {isAuthenticated ? 'สมาชิกที่ยืนยันแล้ว' : 'ผู้ใช้ทั่วไป (Guest)'}
                </span>
              </div>
              {isAuthenticated && (
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">อีเมล</span>
                  <span className="font-semibold text-foreground truncate max-w-[170px]">{user?.email}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-500/15 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition-all hover:bg-primary/90 shadow-xs"
                >
                  <span>สร้างบัญชีเพื่อบันทึกผลถาวร</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Interactive Avatar & Frame Customizer Modal */}
      {avatarModalOpen && (
        <AvatarEditorModal
          currentAvatarUrl={currentAvatarUrl}
          currentFrameId={currentRankFrame}
          currentCustomFrameUrl={currentCustomFrameUrl}
          onSave={handleSaveAvatar}
          onClose={() => setAvatarModalOpen(false)}
        />
      )}
    </div>
  );
}
