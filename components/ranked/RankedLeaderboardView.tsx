'use client';

import React, { useState, useEffect } from 'react';
import { RankedLeaderboardEntry, RankedProfile } from '@/types/ranked';
import { fetchRankedLeaderboard } from '@/lib/api/ranked';
import { RankedTierBadge } from './RankedTierBadge';
import { GlovaAvatarWithFrame } from '../gamification/RankFrame';
import { Trophy, Flame, Users, Globe, Building2, Shield, Loader2 } from 'lucide-react';

interface RankedLeaderboardViewProps {
  currentProfile?: RankedProfile;
}

export const RankedLeaderboardView: React.FC<RankedLeaderboardViewProps> = ({ currentProfile }) => {
  const [filter, setFilter] = useState<'global' | 'friends' | 'university'>('global');
  const [loading, setLoading] = useState<boolean>(true);
  const [leaderboardData, setLeaderboardData] = useState<{
    top3: RankedLeaderboardEntry[];
    entries: RankedLeaderboardEntry[];
    currentUserEntry: RankedLeaderboardEntry;
    totalParticipants: number;
  } | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await fetchRankedLeaderboard(filter);
    if (data) {
      setLeaderboardData(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Distinction Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">กระดานจัดอันดับแข่งขัน (Ranked Leaderboard)</h3>
            <p className="text-xs text-muted-foreground">
              จัดลำดับตามระดับคะแนนฝีมือ (Rank Rating / MMR) แตกต่างจากกระดาน XP ที่นับตามความขยัน
            </p>
          </div>
        </div>

        {/* Sub-Filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card p-1">
          <button
            type="button"
            onClick={() => setFilter('global')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'global' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            ทั่วโลก
          </button>
          <button
            type="button"
            onClick={() => setFilter('friends')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'friends' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            เพื่อน
          </button>
          <button
            type="button"
            onClick={() => setFilter('university')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'university' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            มหาวิทยาลัย
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : leaderboardData ? (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
            {/* Rank 2 */}
            {leaderboardData.top3[1] && (
              <div className="order-2 sm:order-1 rounded-2xl border border-border/60 bg-card/60 p-5 text-center shadow-sm">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-slate-500/20 text-xs font-black text-slate-700 dark:text-slate-300">
                  #2
                </div>
                <div className="mt-2 flex justify-center">
                  <GlovaAvatarWithFrame
                    avatarUrl={leaderboardData.top3[1].avatar}
                    username={leaderboardData.top3[1].username}
                    frameId={leaderboardData.top3[1].rankFrame as any}
                    size="lg"
                  />
                </div>
                <div className="mt-2 text-sm font-bold text-foreground">{leaderboardData.top3[1].username}</div>
                <div className="mt-1 flex justify-center">
                  <RankedTierBadge tier={leaderboardData.top3[1].tier} division={leaderboardData.top3[1].division} size="xs" />
                </div>
                <div className="mt-1 text-base font-black text-amber-500">
                  {leaderboardData.top3[1].rating.toLocaleString()} MMR
                </div>
                <span className="text-[11px] text-muted-foreground">ชนะ {leaderboardData.top3[1].winRate}%</span>
              </div>
            )}

            {/* Rank 1 (Center Champion) */}
            {leaderboardData.top3[0] && (
              <div className="order-1 sm:order-2 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-card to-card p-6 text-center shadow-md">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white shadow-sm">
                  #1
                </div>
                <div className="mt-2 flex justify-center">
                  <GlovaAvatarWithFrame
                    avatarUrl={leaderboardData.top3[0].avatar}
                    username={leaderboardData.top3[0].username}
                    frameId={leaderboardData.top3[0].rankFrame as any}
                    size="xl"
                  />
                </div>
                <div className="mt-2 text-base font-black text-foreground">{leaderboardData.top3[0].username}</div>
                <div className="mt-1 flex justify-center">
                  <RankedTierBadge tier={leaderboardData.top3[0].tier} division={leaderboardData.top3[0].division} size="sm" />
                </div>
                <div className="mt-1 text-xl font-black text-amber-500">
                  {leaderboardData.top3[0].rating.toLocaleString()} MMR
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ชนะ {leaderboardData.top3[0].winRate}% • {leaderboardData.top3[0].wins} แมตช์
                </span>
              </div>
            )}

            {/* Rank 3 */}
            {leaderboardData.top3[2] && (
              <div className="order-3 sm:order-3 rounded-2xl border border-border/60 bg-card/60 p-5 text-center shadow-sm">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-900/20 text-xs font-black text-amber-800 dark:text-amber-300">
                  #3
                </div>
                <div className="mt-2 flex justify-center">
                  <GlovaAvatarWithFrame
                    avatarUrl={leaderboardData.top3[2].avatar}
                    username={leaderboardData.top3[2].username}
                    frameId={leaderboardData.top3[2].rankFrame as any}
                    size="lg"
                  />
                </div>
                <div className="mt-2 text-sm font-bold text-foreground">{leaderboardData.top3[2].username}</div>
                <div className="mt-1 flex justify-center">
                  <RankedTierBadge tier={leaderboardData.top3[2].tier} division={leaderboardData.top3[2].division} size="xs" />
                </div>
                <div className="mt-1 text-base font-black text-amber-500">
                  {leaderboardData.top3[2].rating.toLocaleString()} MMR
                </div>
                <span className="text-[11px] text-muted-foreground">ชนะ {leaderboardData.top3[2].winRate}%</span>
              </div>
            )}
          </div>

          {/* Surrounding Player Standings List */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="border-b border-border/40 bg-muted/40 px-5 py-3 text-xs font-semibold text-muted-foreground grid grid-cols-12 items-center">
              <span className="col-span-1">อันดับ</span>
              <span className="col-span-5 sm:col-span-4">ผู้แข่งขัน</span>
              <span className="col-span-3 sm:col-span-3">ระดับยศ</span>
              <span className="col-span-3 sm:col-span-2 text-right">Rating (MMR)</span>
              <span className="hidden sm:col-span-2 sm:block text-right">สถิติชนะ</span>
            </div>

            <div className="divide-y divide-border/40">
              {leaderboardData.entries.map((entry) => {
                const isYou = entry.isCurrentUser;
                return (
                  <div
                    key={`entry_${entry.userId}`}
                    className={`grid grid-cols-12 items-center px-5 py-3.5 transition-all ${
                      isYou
                        ? 'bg-amber-500/10 font-bold border-l-4 border-l-amber-500'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    {/* Rank Number */}
                    <div className="col-span-1 flex items-center">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                          entry.rank <= 3
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </div>

                    {/* User Avatar + Username */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                      <GlovaAvatarWithFrame
                        avatarUrl={entry.avatar}
                        username={entry.username}
                        frameId={entry.rankFrame as any}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {entry.username}
                          </span>
                          {isYou && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.2 text-[10px] font-black text-amber-700 dark:text-amber-300">
                              คุณ (YOU)
                            </span>
                          )}
                        </div>
                        {entry.university && (
                          <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                            {entry.university}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="col-span-3 sm:col-span-3">
                      <RankedTierBadge tier={entry.tier} division={entry.division} size="xs" />
                    </div>

                    {/* Rating */}
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <span className="text-xs sm:text-sm font-black text-amber-500">
                        {entry.rating.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">MMR</span>
                    </div>

                    {/* Win rate */}
                    <div className="hidden sm:col-span-2 sm:block text-right text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {entry.winRate}%
                      </span>
                      <span className="text-muted-foreground ml-1">({entry.wins}W)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
