'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Trophy,
  Crown,
  Users,
  Flame,
  Swords,
  ChevronRight,
  Shield,
  Sparkles,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { fetchLeaderboard } from '../../lib/api/gamification';
import { RankingSeasonInfo, RankTier } from '../../types/gamification';
import { GlovaAvatarWithFrame } from '../../components/gamification/RankFrame';
import { RankedLeaderboardView } from '@/components/ranked/RankedLeaderboardView';
import { RankBannerCard } from '@/components/ui/aceternity';

const TIER_COLORS: Record<RankTier, { bg: string; text: string; border: string }> = {
  Master: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
  Diamond: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' },
  Platinum: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  Gold: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  Silver: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30' },
  Bronze: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' },
};

function RankingContent() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';
  const searchParams = useSearchParams();

  // Primary board toggle: 'ranked' | 'xp' | 'friends'
  const paramTab = searchParams.get('tab');
  const initialMode = paramTab === 'xp' ? 'xp' : paramTab === 'friends' ? 'friends' : 'ranked';
  const [boardType, setBoardType] = useState<'ranked' | 'xp' | 'friends'>(initialMode);

  // XP League sub-tabs
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'friends'>('weekly');
  const [data, setData] = useState<RankingSeasonInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (boardType === 'xp' || boardType === 'friends') {
      setLoading(true);
      const queryTab = boardType === 'friends' ? 'friends' : activeTab;
      fetchLeaderboard(queryTab, userId)
        .then((res) => {
          if (isMounted) setData(res);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [boardType, activeTab, userId]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* 1. TOP TRIPLE LEADERBOARD TOGGLE */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2 font-display">
            <Trophy className="w-6 h-6 text-amber-500" />
            {isEn ? 'Leaderboard & Rankings' : 'ตารางจัดอันดับผู้เรียน'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-grotesk">
            {boardType === 'ranked'
              ? (isEn ? 'Ranked Leaderboard: Ranks players strictly by competitive Skill Rating.' : 'กระดานจัดอันดับแข่งขัน: จัดอันดับตามคะแนนฝีมือจากการประลองจริง')
              : boardType === 'xp'
              ? (isEn ? 'XP Leaderboard: Measures total learning activity and effort this week.' : 'กระดานความขยัน: จัดอันดับตามแต้มการเรียนรู้ที่สะสมได้')
              : (isEn ? 'Friends Leaderboard: Compare learning milestones among your university peers.' : 'กระดานเพื่อนนักเรียน: เปรียบเทียบความก้าวหน้าในกลุ่มเพื่อนสนิท')}
          </p>
        </div>

        {/* 3-Board Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBoardType('ranked')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold font-display transition-all ${
              boardType === 'ranked'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Swords className="h-4 w-4" />
            {isEn ? 'Ranked Battles' : 'โหมดแข่งขัน'}
          </button>
          <button
            type="button"
            onClick={() => setBoardType('xp')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold font-display transition-all ${
              boardType === 'xp'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Zap className="h-4 w-4" />
            {isEn ? 'XP League' : 'ลีกความขยัน'}
          </button>
          <button
            type="button"
            onClick={() => setBoardType('friends')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold font-display transition-all ${
              boardType === 'friends'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Users className="h-4 w-4" />
            {isEn ? 'Friends' : 'กลุ่มเพื่อน'}
          </button>
        </div>
      </section>

      {/* Season 1 Event Banner */}
      <RankBannerCard seasonNumber={1} daysRemaining={18} />


      {/* ========================================================= */}
      {/* VIEW A: DEDICATED RANKED LEADERBOARD */}
      {/* ========================================================= */}
      {boardType === 'ranked' && (
        <section>
          <RankedLeaderboardView />
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW B: XP LEADERBOARD & FRIENDS LEADERBOARD */}
      {/* ========================================================= */}
      {(boardType === 'xp' || boardType === 'friends') && (
        <section className="space-y-6">
          {/* XP Season Header Hero */}
          <div className="rounded-3xl bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  {boardType === 'friends' ? <Users className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                      {boardType === 'friends'
                        ? (isEn ? 'Friends Learning Standing' : 'ตารางคะแนนกลุ่มเพื่อนนักเรียน')
                        : (isEn ? 'Weekly XP League' : 'ลีกความขยันประจำสัปดาห์')}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
                      {data?.userTier || 'Silver'} League
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {data?.seasonName || 'Season 1: University League'} • {isEn ? `Ends in ${data?.endsInDays || 4} days` : `เหลืออีก ${data?.endsInDays || 4} วัน`}
                  </p>
                </div>
              </div>

              <Link
                href="/compete"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 transition-all shadow-xs shrink-0"
              >
                <Swords className="w-4 h-4" />
                <span>{isEn ? 'Earn XP in Battle' : 'แข่งเก็บแต้ม XP'}</span>
              </Link>
            </div>

            {/* User Rank Snapshot Ribbon */}
            {data && (
              <div className="mt-6 p-4 rounded-2xl bg-background border border-border/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                    #{data.userRank}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {isEn ? 'Your Standing This Week' : 'อันดับสัปดาห์นี้ของคุณ'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isEn
                        ? `Earn ${Math.max(50, 1000 - data.userWeeklyXp)} more XP to advance rank`
                        : `ทำได้อีก 120 XP เพื่อเลื่อนขึ้นอันดับ #${Math.max(1, data.userRank - 1)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {data.userWeeklyXp.toLocaleString()} XP
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {isEn ? 'Promotion Zone' : 'โซนเลื่อนขั้น'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* XP Tabs */}
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {isEn ? 'Weekly League' : 'ลีกสัปดาห์นี้'}
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {isEn ? 'Monthly Season' : 'ซีซันรายเดือน'}
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'friends'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {isEn ? 'Friends & Peers' : 'เพื่อนและกลุ่ม'}
            </button>
          </div>

          {/* XP Podium & List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
              กำลังโหลดตารางคะแนน XP...
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Podium */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                {data.topUsers[1] && (
                  <div className="order-2 sm:order-1 p-5 rounded-3xl bg-card border border-border/70 text-center shadow-xs">
                    <span className="text-xs font-black text-slate-500">#2</span>
                    <div className="mt-2 flex justify-center">
                      <GlovaAvatarWithFrame
                        avatarUrl={data.topUsers[1].avatarUrl}
                        username={data.topUsers[1].displayName}
                        frameId={data.topUsers[1].frameId as any}
                        size="lg"
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-foreground truncate">{data.topUsers[1].displayName}</p>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {data.topUsers[1].weeklyXp.toLocaleString()} XP
                    </p>
                  </div>
                )}

                {data.topUsers[0] && (
                  <div className="order-1 sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-indigo-500/10 via-card to-card border-2 border-indigo-500/30 text-center shadow-sm">
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black">
                      #1 CHAMPION
                    </span>
                    <div className="mt-3 flex justify-center">
                      <GlovaAvatarWithFrame
                        avatarUrl={data.topUsers[0].avatarUrl}
                        username={data.topUsers[0].displayName}
                        frameId={data.topUsers[0].frameId as any}
                        size="xl"
                      />
                    </div>
                    <p className="mt-2 text-base font-black text-foreground truncate">{data.topUsers[0].displayName}</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {data.topUsers[0].weeklyXp.toLocaleString()} XP
                    </p>
                  </div>
                )}

                {data.topUsers[2] && (
                  <div className="order-3 sm:order-3 p-5 rounded-3xl bg-card border border-border/70 text-center shadow-xs">
                    <span className="text-xs font-black text-amber-800 dark:text-amber-400">#3</span>
                    <div className="mt-2 flex justify-center">
                      <GlovaAvatarWithFrame
                        avatarUrl={data.topUsers[2].avatarUrl}
                        username={data.topUsers[2].displayName}
                        frameId={data.topUsers[2].frameId as any}
                        size="lg"
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-foreground truncate">{data.topUsers[2].displayName}</p>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {data.topUsers[2].weeklyXp.toLocaleString()} XP
                    </p>
                  </div>
                )}
              </div>

              {/* Surrounding list */}
              <div className="rounded-3xl bg-card border border-border/70 divide-y divide-border/60 overflow-hidden shadow-xs">
                {data.surroundingUsers.map((entry) => {
                  const isUser = entry.isCurrentUser;
                  return (
                    <div
                      key={`xp_user_${entry.userId}`}
                      className={`flex items-center justify-between p-4 transition-colors ${
                        isUser ? 'bg-indigo-500/10 border-l-4 border-l-indigo-600' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 text-center font-black text-xs text-muted-foreground">
                          #{entry.rank}
                        </span>
                        <GlovaAvatarWithFrame
                          avatarUrl={entry.avatarUrl}
                          username={entry.displayName}
                          frameId={entry.frameId as any}
                          size="sm"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                            {entry.displayName}
                            {isUser && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-black">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            เลเวล {entry.gameLevel} • CEFR {entry.cefrLevel}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {entry.weeklyXp.toLocaleString()} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">กำลังโหลดตารางคะแนน...</div>}>
      <RankingContent />
    </Suspense>
  );
}
