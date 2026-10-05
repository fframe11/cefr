'use client';

import React from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { ItemRarity } from '@/types/gamification';
import { RARITY_PALETTE } from '@/lib/gamification/achievements';

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageBadgeUrl?: string;
  rarity?: ItemRarity;
  xpReward?: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  onClick?: () => void;
  className?: string;
  actionSlot?: React.ReactNode;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  description,
  icon,
  imageBadgeUrl,
  rarity = 'common',
  xpReward,
  isUnlocked = false,
  unlockedAt,
  progress = 0,
  maxProgress = 1,
  onClick,
  className = '',
  actionSlot,
}) => {
  const palette = RARITY_PALETTE[rarity] || RARITY_PALETTE.common;
  const progressPercent = Math.min(100, Math.round((progress / maxProgress) * 100));

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 ${
        isUnlocked
          ? 'bg-card/90 hover:shadow-lg dark:bg-[#13111C]/80 backdrop-blur-sm'
          : 'bg-muted/20 dark:bg-muted/10 opacity-75 grayscale-[35%]'
      } ${className}`}
      style={{
        borderColor: isUnlocked ? `${palette.color}40` : undefined,
        boxShadow: isUnlocked
          ? `0 4px 20px -2px ${palette.color}15, 0 2px 6px -1px rgba(0, 0, 0, 0.05)`
          : undefined,
      }}
    >
      {/* Subtle controlled radial glow behind icon when unlocked */}
      {isUnlocked && (
        <div
          className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: palette.color }}
        />
      )}

      <div>
        {/* Top Header: Icon + Rarity Pill + XP */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
              isUnlocked ? 'shadow-xs' : 'bg-muted text-muted-foreground/60'
            }`}
            style={{
              backgroundColor: isUnlocked ? `${palette.color}20` : undefined,
              color: isUnlocked ? palette.color : undefined,
              border: isUnlocked ? `1px solid ${palette.color}40` : undefined,
            }}
          >
            {imageBadgeUrl ? (
              <img
                src={imageBadgeUrl}
                alt={title}
                width={36}
                height={36}
                className={`w-9 h-9 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 select-none pointer-events-none ${
                  !isUnlocked ? 'grayscale opacity-50' : ''
                }`}
              />
            ) : isUnlocked ? (
              icon
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground/70" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Rarity Badge */}
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border"
              style={{
                backgroundColor: `${palette.color}15`,
                color: palette.color,
                borderColor: `${palette.color}30`,
              }}
            >
              {palette.labelTh}
            </span>

            {/* XP Pill */}
            {xpReward && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#FA5D5D]/10 text-[#FA5D5D] dark:text-[#FA5D5D] border border-[#FA5D5D]/20 tabular-nums">
                +{xpReward} XP
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-foreground text-sm tracking-tight line-clamp-1">
              {title}
            </h3>
            {isUnlocked && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom Area: Progress bar or Unlocked timestamp */}
      <div className="mt-4 pt-3 border-t border-border/40">
        {isUnlocked ? (
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>ปลดล็อกแล้ว</span>
            </span>
            {unlockedAt && (
              <span className="text-muted-foreground text-[10px]">
                {new Date(unlockedAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-muted-foreground">ความคืบหน้า</span>
              <span className="text-foreground tabular-nums">
                {progress} / {maxProgress} ({progressPercent}%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: palette.color,
                }}
              />
            </div>
          </div>
        )}

        {actionSlot && <div className="mt-2.5">{actionSlot}</div>}
      </div>
    </div>
  );
};
