'use client';

import React from 'react';
import { RankedMatchResult } from '@/types/ranked';
import { RankedTierBadge } from './RankedTierBadge';
import { Trophy, Flame, Target, Sparkles, RotateCcw, BookOpen, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { RemotionPlayerWrapper, RankPromotionCelebrationComposition } from '../remotion';

interface RankedResultModalProps {
  result: RankedMatchResult;
  onPlayAgain: () => void;
  onReviewMistakes: () => void;
}

export const RankedResultModal: React.FC<RankedResultModalProps> = ({
  result,
  onPlayAgain,
  onReviewMistakes,
}) => {
  const isWin = result.outcome === 'WIN';
  const isLoss = result.outcome === 'LOSS';
  const isDraw = result.outcome === 'DRAW';

  let bannerBg = 'from-amber-500/20 via-background to-amber-500/5 border-amber-500/40';
  let titleColor = 'text-amber-500';
  let titleText = 'ชัยชนะ!';
  let outcomeDesc = 'คุณแสดงทักษะคำศัพท์ได้อย่างยอดเยี่ยม!';

  if (isLoss) {
    bannerBg = 'from-slate-500/15 via-background to-slate-500/5 border-border/60';
    titleColor = 'text-slate-600 dark:text-slate-300';
    titleText = 'พ่ายแพ้';
    outcomeDesc = 'แมตช์นี้สูสีมาก ทบทวนข้อผิดพลาดเพื่อกลับมาชนะในตาต่อไป!';
  } else if (isDraw) {
    bannerBg = 'from-[#FA5D5D]/20 via-background to-purple-500/5 border-[#FA5D5D]/40';
    titleColor = 'text-[#FA5D5D]';
    titleText = 'เสมอ';
    outcomeDesc = 'ทั้งสองฝ่ายทำผลงานได้ทัดเทียมกันอย่างน่าทึ่ง';
  }

  const p1 = result.player1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border bg-card p-6 shadow-2xl bg-gradient-to-b ${bannerBg}`}
      >
        {/* Promotion Celebration Banner & Remotion Video Reveal */}
        {p1.isPromotion && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 p-2 text-center text-xs font-black text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>เลื่อนขั้นสู่แรงก์ {p1.tierAfter.tier.toUpperCase()}!</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-amber-500/40 shadow-lg">
              <RemotionPlayerWrapper
                component={RankPromotionCelebrationComposition}
                inputProps={{
                  tier: p1.tierAfter.tier,
                  rating: p1.ratingAfter,
                }}
                durationInFrames={60}
                fps={30}
                aspectRatio="16/9"
                ariaLabel="Rank Promotion Celebration"
              />
            </div>
          </div>
        )}

        {/* Outcome Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className={`mt-3 text-2xl font-black ${titleColor}`}>{titleText}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{outcomeDesc}</p>
        </div>

        {/* Rating Adjustment Box */}
        <div className="mt-5 rounded-2xl border border-border/60 bg-muted/40 p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <RankedTierBadge tier={p1.tierBefore.tier} division={p1.tierBefore.division} size="sm" />
            <span className="text-sm font-bold text-muted-foreground">{p1.ratingBefore}</span>
            <span className="text-muted-foreground">→</span>
            <RankedTierBadge tier={p1.tierAfter.tier} division={p1.tierAfter.division} size="md" />
            <span className="text-base font-black text-foreground">{p1.ratingAfter}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-base font-black">
            {p1.ratingDelta >= 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUp className="h-4 w-4" />+{p1.ratingDelta} Rating
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-500">
                <ArrowDown className="h-4 w-4" />{p1.ratingDelta} Rating
              </span>
            )}
            <span className="text-xs text-muted-foreground">• +{p1.xpEarned} XP</span>
          </div>
        </div>

        {/* Match Performance Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-border/40 bg-card p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>ความแม่นยำ</span>
            </div>
            <div className="mt-1 text-base font-bold text-foreground">{p1.accuracy}%</div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <Flame className="h-3 w-3 text-rose-500" />
              <span>คอมโบสูงสุด</span>
            </div>
            <div className="mt-1 text-base font-bold text-foreground">{p1.bestStreak}</div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span>คะแนนแมตช์</span>
            </div>
            <div className="mt-1 text-base font-bold text-foreground">{p1.score.toLocaleString()}</div>
          </div>
        </div>

        {/* 3 Explicit Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            เล่นอีกตา
          </button>

          {result.missedWords.length > 0 && (
            <button
              type="button"
              onClick={onReviewMistakes}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-300 transition-all hover:bg-amber-500/20 active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4" />
              ทบทวนคำที่ตอบผิด ({result.missedWords.length} คำ)
            </button>
          )}

          <Link
            href="/ranking?tab=ranked"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/60"
          >
            <BarChart3 className="h-4 w-4" />
            ดูกระดานจัดอันดับแรงก์
          </Link>
        </div>
      </div>
    </div>
  );
};
