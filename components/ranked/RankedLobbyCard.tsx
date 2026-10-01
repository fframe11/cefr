'use client';

import React, { useState, useEffect } from 'react';
import { RankedProfile, CompetitiveGameMode } from '@/types/ranked';
import { RankedTierBadge } from './RankedTierBadge';
import { GlovaAvatarWithFrame } from '../gamification/RankFrame';
import { Swords, Trophy, ShieldAlert, Sparkles, Flame, Loader2, XCircle } from 'lucide-react';
import { getDivisionProgress } from '@/lib/ranked/rating-engine';

interface RankedLobbyCardProps {
  profile: RankedProfile;
  isSearching: boolean;
  searchDurationSec: number;
  onStartMatchmaking: (mode: CompetitiveGameMode) => void;
  onCancelMatchmaking: () => void;
}

export const RankedLobbyCard: React.FC<RankedLobbyCardProps> = ({
  profile,
  isSearching,
  searchDurationSec,
  onStartMatchmaking,
  onCancelMatchmaking,
}) => {
  const [selectedMode, setSelectedMode] = useState<CompetitiveGameMode>('vocabulary');
  const progress = getDivisionProgress(profile.rating);

  const totalMatches = profile.wins + profile.losses + profile.draws;
  const winRate = totalMatches > 0 ? Math.round((profile.wins / totalMatches) * 100) : 0;

  // Search range display
  let searchRangeText = '±80 MMR';
  if (searchDurationSec >= 6) {
    searchRangeText = '±250 MMR (ขยายเต็มพิกัด)';
  } else if (searchDurationSec >= 3) {
    searchRangeText = '±160 MMR (ขยายช่วงใกล้เคียง)';
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#2155E6]/30 dark:border-blue-500/30 bg-gradient-to-br from-[#2155E6]/10 via-background to-blue-950/15 p-6 shadow-md">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2155E6] text-white shadow-sm">
            <Swords className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-black text-foreground font-display">RANKED BATTLE ARENA</h3>
            <p className="text-xs text-muted-foreground">Season 1: Genesis • การแข่งขันวัดระดับความสามารถจริงจัง</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2155E6]/15 px-3 py-1 text-xs font-bold text-[#2155E6] dark:text-[#60A5FA] border border-[#2155E6]/30">
            <Trophy className="h-3.5 w-3.5 text-[#FFE600]" />
            Rank Rating (MMR)
          </span>
        </div>
      </div>

      {/* Main Stats Layout */}
      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-12 items-center">
        {/* User Rank Card */}
        <div className="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
          <div className="flex items-center gap-4">
            <GlovaAvatarWithFrame
              avatarUrl={profile.avatar}
              username={profile.username}
              frameId={profile.rankFrame as any}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{profile.username}</span>
                {profile.streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    <Flame className="h-3 w-3 fill-rose-500" />
                    {profile.streak}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <RankedTierBadge tier={profile.tier} division={profile.division} size="md" />
              </div>
              <div className="mt-1 text-2xl font-black tracking-tight text-foreground">
                {profile.rating.toLocaleString()}{' '}
                <span className="text-xs font-medium text-muted-foreground uppercase">Rating</span>
              </div>
            </div>
          </div>

          {/* Division Progress Bar */}
          <div className="w-full mt-1">
            <div className="flex justify-between text-xs text-muted-foreground font-medium mb-1">
              <span>ความคืบหน้าสู่ดิวิชันถัดไป</span>
              <span className="text-foreground font-semibold">
                {progress.current}/{progress.max} RP ({progress.percent}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2155E6] via-[#3B82F6] to-[#FFE600] transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Career & Season Insights */}
        <div className="sm:col-span-7 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
            <span className="text-[11px] text-muted-foreground">อันดับสูงสุด (Peak)</span>
            <div className="mt-1 flex justify-center">
              <RankedTierBadge tier={profile.peakTier} division={profile.peakDivision} size="xs" />
            </div>
            <span className="mt-1 block text-xs font-bold text-foreground">{profile.peakRating} MMR</span>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
            <span className="text-[11px] text-muted-foreground">ผลงานซีซัน (W/L)</span>
            <div className="mt-1 text-sm font-bold text-foreground">
              {profile.wins}W - {profile.losses}L
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              ชนะ {winRate}%
            </span>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
            <span className="text-[11px] text-muted-foreground">การคุ้มกันยศ</span>
            <div className="mt-1 text-sm font-bold text-foreground">
              {profile.demotionProtectedMatches > 0 ? (
                <span className="text-[#2155E6] dark:text-[#60A5FA]">คุ้มกัน {profile.demotionProtectedMatches} ตา</span>
              ) : (
                <span className="text-muted-foreground">มาตรฐาน</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {profile.isPlaced ? 'จัดอันดับแล้ว' : `Placement ${profile.placementMatchesPlayed}/5`}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="mt-5 border-t border-border/40 pt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">โหมดแข่งขัน:</span>
          <button
            type="button"
            onClick={() => setSelectedMode('vocabulary')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedMode === 'vocabulary'
                ? 'bg-[#2155E6] text-white shadow-sm font-bold'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            การประลองคำศัพท์ 4 วิ
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground/60"
            title="กำลังพัฒนาสำหรับซีซันถัดไป"
          >
            การประลองไวยากรณ์ • เร็ว ๆ นี้
          </button>
        </div>

        {/* Action Button: Matchmaking or Cancel */}
        <div>
          {isSearching ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-[#2155E6] dark:text-[#60A5FA]">
                <Loader2 className="h-4 w-4 animate-spin text-[#2155E6]" />
                <span>กำลังค้นหาคู่ต่อสู้ ({searchDurationSec}s • {searchRangeText})</span>
              </div>
              <button
                type="button"
                onClick={onCancelMatchmaking}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-500/20 dark:text-rose-400 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                ยกเลิกค้นหา
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onStartMatchmaking(selectedMode)}
              className="inline-flex items-center gap-2 rounded-full bg-[#FFE600] hover:bg-[#FFE600]/90 px-7 py-3 text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wider shadow-[0_4px_16px_rgba(255,230,0,0.35)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <Swords className="h-4 w-4" />
              ค้นหาแมตช์แข่งขัน
            </button>
          )}
        </div>
      </div>

      {/* Rules Notice */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">กฎโหมดจัดอันดับ: </span>
          ตอบคำถามคำศัพท์ 6 ข้อในเวลาข้อละ 4 วินาที • หากชนะ Rating จะเพิ่มขึ้น (+20 ถึง +40) หากแพ้ Rating จะลดลง (-8 ถึง -24)
          • ระบบใช้กฎ Elo MMR ฝั่งเซิร์ฟเวอร์แบบเด็ดขาด ไม่สามารถส่งผลเท็จได้
        </div>
      </div>
    </div>
  );
};
