'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swords, Trophy, Flame, ChevronRight, Sparkles } from 'lucide-react';
import { BorderBeam } from './BorderBeam';

interface RankBannerCardProps {
  className?: string;
  seasonNumber?: number;
  daysRemaining?: number;
}

export const RankBannerCard: React.FC<RankBannerCardProps> = ({
  className = '',
  seasonNumber = 1,
  daysRemaining = 18,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background p-6 shadow-sm dark:border-primary/40 dark:from-primary/15 dark:via-zinc-950/80 dark:to-zinc-900 ${className}`}
    >
      <BorderBeam size={220} duration={6} colorFrom="#6366f1" colorTo="#ec4899" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Tournament Metadata & Catchphrase */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold text-primary dark:bg-primary/25 dark:text-primary-foreground">
              <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              SEASON {seasonNumber} ARENA
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              เหลืออีก {daysRemaining} วัน
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" />
              XP BOOST x2
            </span>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground">
              ไต่แรงก์ชิงกรอบยศ Limited Master Frame
            </h2>
            <p className="mt-1 text-sm text-muted-foreground font-grotesk max-w-xl">
              ดวลศัพท์ 4 วิ ต่อคำ โหมดจัดอันดับมหาวิทยาลัย สะสมแต้ม MMR ทะยานสู่อันดับท็อป 100 ประเทศ
            </p>
          </div>
        </div>

        {/* Right Side: Visual Badge & Direct Action CTA */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/80 px-4 py-2.5 text-center shadow-xs dark:border-white/10 dark:bg-zinc-900/90">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="mt-0.5 text-[11px] font-semibold text-muted-foreground font-tech uppercase tracking-wider">
              PRIZE POOL
            </span>
            <span className="text-xs font-bold text-foreground">Master Frame</span>
          </div>

          <Link
            href="/compete?mode=ranked"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
          >
            <Swords className="h-4 w-4 transition-transform group-hover:rotate-12" />
            <span>เข้าสู่สังเวียน</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
