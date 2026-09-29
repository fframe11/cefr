'use client';

import React from 'react';
import { RankTier, RankDivision } from '@/types/ranked';
import { Shield, Award, Zap, Gem, Crown } from 'lucide-react';

interface RankedTierBadgeProps {
  tier: RankTier;
  division?: RankDivision;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDivision?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<
  RankTier,
  { labelEn: string; labelTh: string; color: string; badgeBg: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  Bronze: {
    labelEn: 'Bronze',
    labelTh: 'บรอนซ์',
    color: '#CD7F32',
    badgeBg: 'bg-amber-900/15 text-amber-800 dark:text-amber-300 border-amber-900/20',
    Icon: Shield,
  },
  Silver: {
    labelEn: 'Silver',
    labelTh: 'ซิลเวอร์',
    color: '#94A3B8',
    badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20',
    Icon: Shield,
  },
  Gold: {
    labelEn: 'Gold',
    labelTh: 'โกลด์',
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    Icon: Award,
  },
  Platinum: {
    labelEn: 'Platinum',
    labelTh: 'แพลทินัม',
    color: '#06B6D4',
    badgeBg: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30',
    Icon: Zap,
  },
  Diamond: {
    labelEn: 'Diamond',
    labelTh: 'ไดมอนด์',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    Icon: Gem,
  },
  Master: {
    labelEn: 'Master',
    labelTh: 'มาสเตอร์',
    color: '#EF4444',
    badgeBg: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    Icon: Crown,
  },
};

export const RankedTierBadge: React.FC<RankedTierBadgeProps> = ({
  tier,
  division = 'I',
  size = 'md',
  showDivision = true,
  className = '',
}) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
  const { Icon } = config;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium transition-all ${config.badgeBg} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSizes} />
      <span>
        {tier}
        {showDivision && tier !== 'Master' ? ` ${division}` : ''}
      </span>
    </span>
  );
};
