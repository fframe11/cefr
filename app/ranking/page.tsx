'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { fetchLeaderboard } from '../../lib/api/gamification';
import { RankingSeasonInfo, RankTier } from '../../types/gamification';
import { GlovaAvatarWithFrame } from '../../components/gamification/RankFrame';

const TIER_COLORS: Record<RankTier, { bg: string; text: string; border: string }> = {
  Diamond: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' },
  Platinum: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  Gold: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  Silver: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30' },
  Bronze: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' },
};

export default function RankingPage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'friends'>('weekly');
  const [data, setData] = useState<RankingSeasonInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLeaderboard(activeTab, userId)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, userId]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. SEASON HEADER HERO */}
      <section className="rounded-3xl bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/70 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {isEn ? 'Weekly League Leaderboard' : 'ตารางคะแนนลีกประจำสัปดาห์'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
                  {data?.userTier || 'Silver'} League
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {data?.seasonName || 'Season 39 — Bangkok University League'} • {isEn ? `Ends in ${data?.endsInDays || 4} days` : `เหลืออีก ${data?.endsInDays || 4} วัน`}
              </p>
            </div>
          </div>

          <Link
            href="/compete"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/90 transition-all shadow-xs shrink-0"
          >
            <Swords className="w-4 h-4" />
            <span>{isEn ? 'Earn XP in Battle' : 'แข่งเก็บแต้ม XP'}</span>
          </Link>
        </div>

        {/* User Rank Snapshot Ribbon */}
        {data && (
          <div className="mt-6 p-4 rounded-2xl bg-background border border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shadow-2xs">
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
              <span className="text-xs font-black text-primary tabular-nums">
                {data.userWeeklyXp} {isEn ? 'XP this week' : 'XP สัปดาห์นี้'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. LEADERBOARD FILTER TABS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/70 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'weekly'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isEn ? 'Weekly' : 'สัปดาห์นี้'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'monthly'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isEn ? 'Monthly' : 'ประจำเดือน'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'friends'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isEn ? 'Friends' : 'เฉพาะเพื่อน'}
        </button>
      </div>

      {/* 3. PODIUM TOP 3 CARDS */}
      {data && data.topUsers.length >= 3 && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Rank #2 */}
          <div className="order-2 sm:order-1 rounded-3xl bg-card border border-border/70 p-5 text-center space-y-3 shadow-xs">
            <div className="flex justify-center">
              <GlovaAvatarWithFrame frameId={data.topUsers[1].frameId} size="lg" showBadge={true}>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-black text-sm flex items-center justify-center">
                  {data.topUsers[1].displayName.slice(0, 2)}
                </div>
              </GlovaAvatarWithFrame>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase">
                {isEn ? '🥈 Rank 2' : '🥈 อันดับ 2'}
              </span>
              <h3 className="text-sm font-bold text-foreground truncate">{data.topUsers[1].displayName}</h3>
              <p className="text-xs font-black text-primary tabular-nums mt-0.5">{data.topUsers[1].weeklyXp} XP</p>
            </div>
          </div>

          {/* Rank #1 Center Elevated */}
          <div className="order-1 sm:order-2 rounded-3xl bg-[#FFFDF8] dark:bg-card border-2 border-amber-400 dark:border-amber-500/40 p-6 text-center space-y-3 shadow-md sm:-mt-2">
            <div className="flex justify-center">
              <GlovaAvatarWithFrame frameId={data.topUsers[0].frameId} size="xl" showBadge={true}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-black text-xl flex items-center justify-center shadow-sm">
                  {data.topUsers[0].displayName.slice(0, 2)}
                </div>
              </GlovaAvatarWithFrame>
            </div>
            <div>
              <span className="text-xs font-black text-amber-500 uppercase flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" /> {isEn ? '🥇 Champion' : '🥇 แชมเปี้ยน'}
              </span>
              <h3 className="text-base font-black text-foreground truncate">{data.topUsers[0].displayName}</h3>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                {data.topUsers[0].weeklyXp} XP
              </p>
            </div>
          </div>

          {/* Rank #3 */}
          <div className="order-3 rounded-3xl bg-card border border-border/70 p-5 text-center space-y-3 shadow-xs">
            <div className="flex justify-center">
              <GlovaAvatarWithFrame frameId={data.topUsers[2].frameId} size="lg" showBadge={true}>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-400 to-amber-700 text-white font-black text-sm flex items-center justify-center">
                  {data.topUsers[2].displayName.slice(0, 2)}
                </div>
              </GlovaAvatarWithFrame>
            </div>
            <div>
              <span className="text-[10px] font-black text-orange-600 uppercase">
                {isEn ? '🥉 Rank 3' : '🥉 อันดับ 3'}
              </span>
              <h3 className="text-sm font-bold text-foreground truncate">{data.topUsers[2].displayName}</h3>
              <p className="text-xs font-black text-primary tabular-nums mt-0.5">{data.topUsers[2].weeklyXp} XP</p>
            </div>
          </div>
        </section>
      )}

      {/* 4. LEADERBOARD LIST (FOCUSED SURROUNDING WINDOW) */}
      <section className="rounded-3xl bg-card border border-border/70 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              {isEn ? 'League Standings' : 'ตารางอันดับในลีกของคุณ'}
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {isEn ? 'Showing learners near your ranking' : 'แสดงเฉพาะกลุ่มคะแนนใกล้เคียงคุณ'}
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {data?.surroundingUsers.map((entry) => {
            const isSelf = entry.isCurrentUser;
            const tierStyle = TIER_COLORS[entry.tier] || TIER_COLORS.Silver;

            return (
              <div
                key={entry.userId}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                  isSelf ? 'bg-primary/5 font-semibold border-l-4 border-l-primary' : 'hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 text-center font-black text-xs tabular-nums ${
                      entry.rank <= 3 ? 'text-amber-500 font-black' : 'text-muted-foreground'
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  <GlovaAvatarWithFrame frameId={entry.frameId} size="sm">
                    <div className="w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-xs flex items-center justify-center">
                      {entry.displayName.slice(0, 2)}
                    </div>
                  </GlovaAvatarWithFrame>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {entry.displayName}
                      </p>
                      {isSelf && (
                        <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="px-1 rounded bg-secondary text-foreground font-mono">
                        Lv.{entry.gameLevel}
                      </span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                        {entry.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-primary tabular-nums">
                    {entry.weeklyXp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
