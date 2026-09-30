'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Footprints,
  BookOpen,
  Sparkles,
  Flame,
  Calendar,
  ShieldCheck,
  Zap,
  Swords,
  TrendingUp,
  Users,
  Crown,
  Lock,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { fetchAchievements } from '../../lib/api/gamification';
import { Achievement } from '../../types/gamification';
import { ItemCard } from '../../components/ui/ItemCard';
import { RemotionPlayerWrapper } from '../../components/remotion/RemotionPlayerWrapper';
import { AchievementCelebrationComposition } from '../../components/remotion/GamificationCelebrations';

const ICON_MAP: Record<string, React.ElementType> = {
  Footprints,
  BookOpen,
  Sparkles,
  Flame,
  Calendar,
  ShieldCheck,
  Zap,
  Award,
  Swords,
  TrendingUp,
  Users,
  Crown,
};

const ACHIEVEMENT_IMAGE_MAP: Record<string, string> = {
  first_lesson: '/assets/achievements/achievement-first-step.png',
  streak_3: '/assets/achievements/achievement-streak-fire.png',
  streak_7: '/assets/achievements/achievement-streak-fire.png',
  vocab_100: '/assets/achievements/achievement-vocab-master.png',
  vocab_500: '/assets/achievements/achievement-vocab-master.png',
  grammar_master: '/assets/achievements/achievement-grammar-guru.png',
  battle_win_1: '/assets/achievements/achievement-arena-conqueror.png',
  battle_win_5: '/assets/achievements/achievement-arena-conqueror.png',
  duo_study_1: '/assets/achievements/achievement-duo-partner.png',
  perfect_quiz: '/assets/achievements/achievement-perfect-score.png',
  cefr_level_up: '/assets/achievements/achievement-cambridge-ace.png',
  top_10_rank: '/assets/achievements/achievement-crown-legend.png',
};

type CategoryFilter = 'all' | 'learning' | 'streak' | 'competition' | 'social';

export default function AchievementsPage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedForPreview, setSelectedForPreview] = useState<Achievement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchAchievements(userId)
      .then((data) => {
        if (isMounted) setAchievements(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length || 12;
  const totalEarnedXp = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <section className="rounded-3xl bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B5CE2]/10 border border-[#5B5CE2]/20 text-[#5B5CE2] dark:text-[#8D8EFC] text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{isEn ? 'Milestones & Honors' : 'เกียรติยศและเหรียญรางวัล'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {isEn ? 'Achievements Collection' : 'คลังความสำเร็จแห่งการเรียนรู้'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {isEn
                ? 'Unlock badges, claim bonus XP, and celebrate your mastery of English vocabulary and daily learning streaks.'
                : 'พิชิตเป้าหมาย ปลดล็อกเหรียญตราเกียรติยศ รับโบนัส XP และฉลองความก้าวหน้าในการเรียนภาษาอังกฤษทุกๆ วัน'}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-4 bg-background/80 dark:bg-muted/40 p-4 rounded-2xl border border-border/40 shrink-0">
            <div className="text-center px-3 border-r border-border/40">
              <div className="text-2xl font-black text-[#5B5CE2] tabular-nums">
                {unlockedCount} / {totalCount}
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground">
                {isEn ? 'Unlocked' : 'ปลดล็อกแล้ว'}
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-amber-500 tabular-nums">
                +{totalEarnedXp}
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground">
                {isEn ? 'Total XP Won' : 'XP ที่ได้รับ'}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-5 border-t border-border/40">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-muted-foreground">
              {isEn ? 'Total Completion Progress' : 'ความคืบหน้าการสะสมทั้งหมด'}
            </span>
            <span className="text-[#5B5CE2] tabular-nums font-black">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B8A7FF] to-[#FF8F82] transition-all duration-500"
              style={{ width: `${Math.max(6, (unlockedCount / totalCount) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-4">
        <span className="text-xs font-bold text-muted-foreground mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          {isEn ? 'Category:' : 'หมวดหมู่:'}
        </span>
        {(
          [
            { id: 'all', labelEn: 'All Badges', labelTh: 'เหรียญทั้งหมด' },
            { id: 'learning', labelEn: 'Learning', labelTh: 'การเรียนรู้' },
            { id: 'streak', labelEn: 'Streaks', labelTh: 'ความต่อเนื่อง' },
            { id: 'competition', labelEn: 'Arena & Battles', labelTh: 'การแข่งขัน' },
            { id: 'social', labelEn: 'Social & Squad', labelTh: 'เพื่อนและสังคม' },
          ] as { id: CategoryFilter; labelEn: string; labelTh: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === tab.id
                ? 'bg-[#5B5CE2] text-white shadow-xs font-bold'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {isEn ? tab.labelEn : tab.labelTh}
          </button>
        ))}
      </div>

      {/* 3. ACHIEVEMENTS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))}
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border/60 p-8">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">
            {isEn ? 'No badges in this category' : 'ไม่พบเหรียญรางวัลในหมวดนี้'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn ? 'Switch categories or start learning to unlock badges.' : 'ลองเปลี่ยนหมวดหมู่หรือเริ่มทำกิจกรรมเพื่อปลดล็อก'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Award;
            return (
              <ItemCard
                key={item.id}
                id={item.id}
                title={isEn ? item.titleEn : item.titleTh}
                description={isEn ? item.descEn : item.descTh}
                icon={<IconComponent className="w-6 h-6" />}
                imageBadgeUrl={ACHIEVEMENT_IMAGE_MAP[item.id]}
                rarity={item.rarity || 'common'}
                xpReward={item.xpReward}
                isUnlocked={item.isUnlocked}
                unlockedAt={item.unlockedAt}
                progress={item.currentProgress}
                maxProgress={item.maxProgress}
                actionSlot={
                  item.isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedForPreview(item);
                        if (typeof window !== 'undefined') {
                          import('canvas-confetti').then((confetti) => {
                            confetti.default({
                              particleCount: 40,
                              spread: 55,
                              origin: { y: 0.7 },
                            });
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#5B5CE2]/10 hover:bg-[#5B5CE2]/20 text-[#5B5CE2] dark:text-[#8D8EFC] transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isEn ? 'Celebration' : 'ดูฉลอง'}</span>
                    </button>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* 4. CALL TO ACTION TO LEARN / COMPETE */}
      <section className="rounded-3xl bg-gradient-to-tr from-[#B8A7FF]/10 via-[#FF8F82]/5 to-transparent border border-[#5B5CE2]/20 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-foreground">
            {isEn ? 'Ready for the Next Milestone?' : 'พร้อมพิชิตเหรียญรางวัลถัดไปหรือยัง?'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isEn
              ? 'Jump into a 4-second Vocabulary Battle or maintain your streak today.'
              : 'เข้าสู่สนามประลองคำศัพท์จับเวลา 4 วินาที หรือทบทวนบทเรียนเพื่อรักษาสถิติต่อเนื่อง'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/compete"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5B5CE2] hover:bg-[#4D4EC9] text-white shadow-xs transition-colors shrink-0"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{isEn ? 'Vocabulary Battle' : 'ประลองคำศัพท์'}</span>
          </Link>
          <Link
            href="/ranking"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-background hover:bg-muted border border-border/60 text-foreground transition-colors shrink-0"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'League Rankings' : 'ดูอันดับลีก'}</span>
          </Link>
        </div>
      </section>

      {/* 5. CELEBRATION PREVIEW MODAL */}
      {selectedForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#141A22] rounded-3xl border border-white/10 shadow-2xl p-6 relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedForPreview(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full mt-2 mb-4">
              <RemotionPlayerWrapper
                component={AchievementCelebrationComposition}
                inputProps={{
                  title: isEn ? selectedForPreview.titleEn : selectedForPreview.titleTh,
                  xpReward: selectedForPreview.xpReward,
                }}
                durationInFrames={60}
                fps={30}
                aspectRatio="1/1"
                ariaLabel="Achievement Unlock Animation"
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedForPreview(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E98278] to-[#FF8F82] hover:opacity-95 text-white font-black text-xs shadow-md transition-transform active:scale-98"
            >
              {isEn ? 'Awesome! Keep Going' : 'ยอดเยี่ยม! เรียนรู้ต่อ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
