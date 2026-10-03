'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Zap, Trophy, Flame, Clock, Swords, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { getUserDailyQuests, getUserPersonalBest } from '@/lib/gamification/quests-engine';
import { DailyQuest, PersonalBest } from '@/types/gamification';

interface DailyQuestsAndPersonalBestProps {
  userId?: string;
  onNavigateToCompete?: () => void;
  onNavigateToVocab?: () => void;
}

export const DailyQuestsAndPersonalBest: React.FC<DailyQuestsAndPersonalBestProps> = ({
  userId = 'user_current',
  onNavigateToCompete,
  onNavigateToVocab,
}) => {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);

  useEffect(() => {
    setQuests(getUserDailyQuests(userId));
    setPersonalBest(getUserPersonalBest(userId));
  }, [userId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. DAILY QUESTS (2/3 width on desktop) */}
      <div className="lg:col-span-2 rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/60 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FA5D5D]/15 text-[#FA5D5D] dark:text-[#FA5D5D]">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">ภารกิจประจำวัน</h3>
              <p className="text-xs text-muted-foreground">ทำภารกิจรายวันให้สำเร็จเพื่อสะสมแต้ม XP และรักษาวินัย</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            รีเซ็ตทุกเที่ยงคืน
          </span>
        </div>

        {/* Quests List */}
        <div className="space-y-3 pt-1">
          {quests.map((q) => {
            const pct = Math.min(100, Math.round((q.progress / q.maxProgress) * 100));
            return (
              <div
                key={q.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-border/50 bg-background/80 p-4 transition-all hover:border-primary/30"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="text-xs font-bold text-foreground">{q.titleTh}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FA5D5D]/10 text-[#FA5D5D] dark:text-[#FA5D5D] border border-[#FA5D5D]/20 tabular-nums">
                      +{q.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{q.descTh}</p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FA5D5D] to-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-muted-foreground shrink-0 tabular-nums">
                      {q.progress} / {q.maxProgress}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="sm:self-center shrink-0">
                  {q.isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>สำเร็จแล้ว</span>
                    </span>
                  ) : q.category === 'competition' ? (
                    <Link
                      href="/compete"
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 active:translate-y-0.5 transition-all"
                    >
                      <Swords className="h-4 w-4" />
                      <span>ลงแข่งทันที</span>
                    </Link>
                  ) : (
                    <Link
                      href="/vocabulary"
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-muted/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-muted active:translate-y-0.5 transition-all"
                    >
                      <span>ทำภารกิจ</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PERSONAL BEST RECORDS (1/3 width on desktop) */}
      <div className="rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/60 p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">สถิติส่วนบุคคลยอดเยี่ยม</h3>
              <p className="text-xs text-muted-foreground">ผลงานดีที่สุดในการเรียนรู้และการประลอง</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-4">
            <div className="rounded-2xl border border-border/50 bg-background/80 p-3.5 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-500" />
                <span>ตอบเร็วที่สุด</span>
              </span>
              <p className="text-lg font-black text-foreground tabular-nums">
                {((personalBest?.fastestCorrectMs || 980) / 1000).toFixed(2)} วินาที
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/80 p-3.5 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-500" />
                <span>เรียนต่อเนื่องสูงสุด</span>
              </span>
              <p className="text-lg font-black text-foreground tabular-nums">
                {personalBest?.longestLearningStreakDays || 14} วัน
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/80 p-3.5 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>คะแนนคำศัพท์สูงสุด</span>
              </span>
              <p className="text-lg font-black text-foreground tabular-nums">
                {personalBest?.bestVocabularyScore.toLocaleString() || '1,250'}
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/80 p-3.5 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3 h-3 text-[#FA5D5D]" />
                <span>แรงก์สูงสุดที่เคยแตะ</span>
              </span>
              <p className="text-sm font-black text-foreground tabular-nums pt-0.5">
                {personalBest?.highestRankRating || 1540} MMR
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/40">
          <Link
            href="/compete"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 active:translate-y-0.5 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>เข้าแข่งขันเพื่อทำลายสถิติ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
