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
import { toast } from '@/components/common/Toast';

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

  // Social Sidebar Tabs & Study Buddies
  const [socialTab, setSocialTab] = useState<'following' | 'followers'>('following');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [studyBuddies, setStudyBuddies] = useState(STUDY_BUDDIES);

  const handleToggleFollow = (handle: string) => {
    setStudyBuddies((prev) =>
      prev.map((buddy) => {
        if (buddy.handle === handle) {
          const nextState = !buddy.isFollowing;
          toast.success(
            nextState
              ? isEn
                ? `Now following ${buddy.name}`
                : `เริ่มติดตาม ${buddy.name} แล้ว`
              : isEn
              ? `Unfollowed ${buddy.name}`
              : `เลิกติดตาม ${buddy.name} แล้ว`
          );
          return { ...buddy, isFollowing: nextState };
        }
        return buddy;
      })
    );
  };

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

  const handleSaveAvatar = async (newUrl: string, newFrame: RankFrameId) => {
    setCurrentAvatarUrl(newUrl);
    setCurrentRankFrame(newFrame);
    if (typeof window !== 'undefined') {
      localStorage.setItem('glova_custom_avatar_url', newUrl);
      localStorage.setItem('glova_rank_frame', newFrame);
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 pb-24 font-sans text-foreground space-y-6">
      {/* EduMaster Sub-Nav Bar */}
      <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[28px] bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md border border-[#EAE4D5] dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              {isEn ? 'Student Profile & Settings' : 'โปรไฟล์และการตั้งค่าการเรียน'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
              CEFR {progress.currentLevel} • CAMBRIDGE {progress.targetExam}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
          <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-[#D98200] text-[#D98200]" />
            <span>{profile?.streak_days || progress.streakDays || 14} วันต่อเนื่อง</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>{rankedProfile?.tier || 'Gold'} {rankedProfile?.division || 'II'}</span>
          </div>
        </div>
      </nav>

      {/* 2-Column Asymmetric Layout (Left: 68%, Right: 32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT MAIN COLUMN (~68%) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. HERO PROFILE IDENTITY CARD */}
          <section className="relative overflow-hidden rounded-[28px] border border-[#EAE4D5] dark:border-white/10 bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md p-6 sm:p-8 shadow-sm">
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
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white shadow-sm ring-2 ring-white dark:ring-[#070B16] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
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
                        className="rounded-full border border-[#FA5D5D] bg-white dark:bg-[#0B1224] px-4 py-1.5 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/20 shadow-xs"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isSavingName}
                        className="rounded-full bg-[#FA5D5D] p-2 text-white hover:bg-[#ff4747] shadow-xs"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {displayName}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="แก้ไขชื่อที่แสดง"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {isAuthenticated ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#C5EBDA] dark:border-emerald-500/20 bg-[#E3F6ED] dark:bg-[#102B22] px-3 py-1 text-xs font-semibold text-[#1E7E52] dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      ยืนยันแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#FDE5BC] dark:border-amber-500/20 bg-[#FEF5E5] dark:bg-[#2B2010] px-3 py-1 text-xs font-semibold text-[#D98200] dark:text-[#FFBA38]">
                      {isEn ? 'Guest Learner' : 'ผู้ใช้ทั่วไป'}
                    </span>
                  )}
                </div>

                {/* Handle & Join Date */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">@{handle}</span>
                  <span>•</span>
                  <span>เข้าร่วมเมื่อ กันยายน 2026</span>
                </div>

                {/* Social Counters */}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => setSocialTab('following')}
                    className="font-semibold text-slate-700 dark:text-slate-300 hover:text-[#FA5D5D] transition-colors"
                  >
                    กำลังติดตาม <span className="font-bold text-[#FA5D5D]">12</span> คน
                  </button>
                  <span className="text-slate-400">•</span>
                  <button
                    type="button"
                    onClick={() => setSocialTab('followers')}
                    className="font-semibold text-slate-700 dark:text-slate-300 hover:text-[#FA5D5D] transition-colors"
                  >
                    ผู้ติดตาม <span className="font-bold text-[#FA5D5D]">24</span> คน
                  </button>
                </div>

                {/* Target Exam & Rank Ribbon */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] px-3.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
                    <Target className="h-3.5 w-3.5 text-[#FA5D5D]" />
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

          {/* 2. Statistics Grid */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">สถิติ</h2>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Stat 1: Day Streak */}
              <div className="flex items-center gap-3.5 rounded-[22px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-4 sm:p-5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200]">
                  <Flame className="h-6 w-6 fill-[#D98200]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
                    {profile?.streak_days || progress.streakDays || 14}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">วันต่อเนื่อง</div>
                </div>
              </div>

              {/* Stat 2: Total XP */}
              <div className="flex items-center gap-3.5 rounded-[22px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-4 sm:p-5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D]">
                  <Zap className="h-6 w-6 fill-[#FA5D5D]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
                    {(2450).toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">XP ทั้งหมด</div>
                </div>
              </div>

              {/* Stat 3: Current League / MMR */}
              <div className="flex items-center gap-3.5 rounded-[22px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-4 sm:p-5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52]">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {rankedProfile?.tier || 'Gold'} {rankedProfile?.division || 'II'}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ลีกปัจจุบัน ({rankedProfile?.rating || 1284} MMR)
                  </div>
                </div>
              </div>

              {/* Stat 4: Top 3 Finishes */}
              <div className="flex items-center gap-3.5 rounded-[22px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-4 sm:p-5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">5</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">ครั้งที่อยู่ในท็อป 3</div>
                </div>
              </div>

              {/* Stat 5: Cambridge Estimated Score & Skill Breakdown */}
              <div className="col-span-2 flex items-center gap-3.5 rounded-[22px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-4 sm:p-5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D]">
                  <Target className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      คะแนนเคมบริดจ์โดยประมาณ: <span className="text-[#FA5D5D] font-mono">{progress.estimatedCambridgeScore || 160}</span> / 230
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      เป้าหมาย {progress.targetExam} • CEFR {progress.currentLevel}
                    </div>
                  </div>
                  {progress.skillStats && (
                    <div className="flex gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold">
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

          {/* 3. Achievements List */}
          <section className="p-6 sm:p-8 space-y-4 rounded-[28px] border border-[#EAE4D5] dark:border-white/10 bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">ความสำเร็จ</h2>
              <Link
                href="/achievements"
                className="text-xs font-bold text-[#FA5D5D] hover:underline flex items-center gap-1 font-mono"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#EAE4D5] dark:divide-white/10 rounded-[22px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] overflow-hidden shadow-xs">
              {/* Achievement 1: Fire Starter */}
              <div className="flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FEF5E5] text-[#D98200] dark:bg-[#2B2010]">
                  <Flame className="h-6 w-6 fill-[#D98200]" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{isEn ? 'Fire Starter' : 'เพลิงพระกาฬ'}</span>
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300">
                        ระดับ 1
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">3/3</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">เรียนต่อเนื่องกัน 3 วันให้สำเร็จ</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-[#FA5D5D] w-full" />
                  </div>
                </div>
              </div>

              {/* Achievement 2: Sage */}
              <div className="flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{isEn ? 'Scholar' : 'นักปราชญ์'}</span>
                      <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        ระดับ 1
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">80/100</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">สะสมแต้มให้ครบ 100 XP</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-indigo-500 w-4/5" />
                  </div>
                </div>
              </div>

              {/* Achievement 3: Champion */}
              <div className="flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F6ED] text-[#1E7E52] dark:bg-[#102B22]">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{isEn ? 'Champion' : 'แชมเปี้ยนลีก'}</span>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        ระดับ 1
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">1/1</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ปลดล็อกตารางคะแนนแข่งขันและจบ 10 บทเรียน</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-emerald-500 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Learning Goals */}
          <section className="p-6 sm:p-8 space-y-5 rounded-[28px] border border-[#EAE4D5] dark:border-white/10 bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EAE4D5] dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">เป้าหมายการเรียนรู้ประจำวัน</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">ปรับระดับความเข้มข้นได้ตลอดเวลา</span>
            </div>

            {/* Target Exam Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {isEn ? 'Target Cambridge Exam' : 'การสอบเคมบริดจ์เป้าหมาย'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAMBRIDGE_EXAMS.map((exam) => {
                  const isSelected = selectedExam === exam.code;
                  return (
                    <button
                      key={exam.code}
                      type="button"
                      onClick={() => setSelectedExam(exam.code)}
                      className={`p-3.5 rounded-[20px] border text-center transition-all flex flex-col items-center justify-center gap-1 shadow-xs ${
                        isSelected
                          ? 'border-[#FA5D5D] bg-[#FA5D5D] text-white font-bold shadow-xs'
                          : 'border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{exam.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        CEFR {exam.cefr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Goal Minutes */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                เวลาเรียนต่อวัน: <span className="text-[#FA5D5D] font-black">{dailyGoal} นาที</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_GOAL_MINUTES.map((mins) => {
                  const isSelected = dailyGoal === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyGoal(mins)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#FA5D5D] text-white shadow-xs'
                          : 'bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
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
                className="rounded-full bg-[#FA5D5D] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#ff4747] disabled:opacity-50 shadow-xs"
              >
                {isSavingGoals ? 'กำลังบันทึก...' : 'บันทึกเป้าหมาย'}
              </button>
              {goalsSuccessMsg && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
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
          <section className="rounded-[28px] border border-[#EAE4D5] dark:border-white/10 bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md overflow-hidden shadow-sm">
            {/* Tab Header */}
            <div className="grid grid-cols-2 border-b border-[#EAE4D5] dark:border-white/10 text-center font-bold text-xs">
              <button
                type="button"
                onClick={() => setSocialTab('following')}
                className={`py-3.5 transition-colors ${
                  socialTab === 'following'
                    ? 'border-b-2 border-[#FA5D5D] text-[#FA5D5D] font-black bg-[#FA5D5D]/[0.04]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                กำลังติดตาม
              </button>
              <button
                type="button"
                onClick={() => setSocialTab('followers')}
                className={`py-3.5 transition-colors ${
                  socialTab === 'followers'
                    ? 'border-b-2 border-[#FA5D5D] text-[#FA5D5D] font-black bg-[#FA5D5D]/[0.04]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ผู้ติดตาม
              </button>
            </div>

            {/* Friends Content */}
            <div className="p-5 space-y-4">
              {/* Community Encourage Message */}
              <div className="flex items-start gap-3 rounded-[20px] bg-[#FEF5E5] dark:bg-[#2B2010] border border-[#FDE5BC] dark:border-amber-500/20 p-3.5">
                <Users className="h-5 w-5 text-[#D98200] shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-[#D98200] dark:text-[#FFBA38] font-medium">
                  ถ้ามีคนเรียนเป็นเพื่อนด้วยแล้วจะสนุก และเห็นผลขึ้นอีกเท่าตัวเลยนะ!
                </p>
              </div>

              {/* Study Buddies List */}
              <div className="space-y-2.5">
                {studyBuddies.map((buddy, idx) => (
                  <div key={`buddy_${idx}`} className="flex items-center justify-between p-3 rounded-[18px] bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <GlovaAvatarWithFrame
                        avatarUrl={buddy.avatar}
                        username={buddy.name}
                        frameId={buddy.frame}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                          {buddy.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate">
                          {buddy.uni}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(buddy.handle)}
                      aria-label={buddy.isFollowing ? `Unfollow ${buddy.name}` : `Follow ${buddy.name}`}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                        buddy.isFollowing
                          ? 'border border-[#EAE4D5] dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-slate-100'
                          : 'bg-[#FA5D5D] hover:bg-[#ff4747] text-white'
                      }`}
                    >
                      {buddy.isFollowing ? (isEn ? 'Following' : 'กำลังติดตาม') : (isEn ? 'Follow' : 'ติดตาม')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. ADD FRIENDS ACTION CARD */}
          <section className="rounded-[28px] border border-[#EAE4D5] dark:border-white/10 bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              เพิ่มเพื่อน
            </h3>

            <div className="space-y-2">
              <Link
                href="/social?tab=search"
                className="flex items-center justify-between rounded-[20px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#FA5D5D] transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <span>ค้นหาเพื่อน</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="flex w-full items-center justify-between rounded-[20px] border border-[#EAE4D5] dark:border-white/10 bg-white dark:bg-[#0B1224] p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#FA5D5D] transition-colors text-left shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF5E5] text-[#D98200] dark:bg-[#2B2010]">
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
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>
          </section>

          {/* 3. ACCOUNT ACTIONS & LOGOUT */}
          <section className="rounded-[28px] border border-[#EAE4D5] dark:border-white/10 bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              บัญชีผู้ใช้
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#EAE4D5] dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">สถานะ</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {isAuthenticated ? (isEn ? 'Verified Member' : 'สมาชิกที่ยืนยันแล้ว') : (isEn ? 'Guest Learner' : 'ผู้ใช้ทั่วไป')}
                </span>
              </div>
              {isAuthenticated && (
                <div className="flex justify-between py-1.5 border-b border-[#EAE4D5] dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400">อีเมล</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">{user?.email}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] py-2.5 text-xs font-bold text-white transition-all shadow-xs"
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
          onSave={handleSaveAvatar}
          onClose={() => setAvatarModalOpen(false)}
        />
      )}
    </div>
  );
}
