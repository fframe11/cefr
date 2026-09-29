'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface LevelUpCelebrationProps {
  level: number;
  totalXp: number;
  isStatic?: boolean;
}

export const LevelUpCelebrationComposition: React.FC<LevelUpCelebrationProps> = ({
  level,
  totalXp,
  isStatic = false,
}) => {
  const frame = isStatic ? 30 : useCurrentFrame();

  // Opacity & scale entrance
  const scale = isStatic
    ? 1
    : interpolate(frame, [0, 15, 30], [0.6, 1.1, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const opacity = isStatic
    ? 1
    : interpolate(frame, [0, 10], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const raysRotation = isStatic ? 0 : interpolate(frame, [0, 60], [0, 180]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-6 bg-gradient-to-b from-[#24233A] to-[#171626] text-white rounded-2xl overflow-hidden select-none">
      {/* Background Rotating Sunburst Rays */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
        style={{ transform: `rotate(${raysRotation}deg)` }}
      >
        <svg viewBox="0 0 200 200" className="w-[340px] h-[340px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <polygon
              key={i}
              points="100,100 90,0 110,0"
              fill="#F6D978"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
      </div>

      {/* Main Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center space-y-3"
        style={{ transform: `scale(${scale})`, opacity }}
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#5B5CE2] to-[#FF8F82] p-1 shadow-lg flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-[#24233A] flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">LEVEL</span>
            <span className="text-3xl font-black text-white tabular-nums">{level}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight">LEVEL UP!</h2>
          <p className="text-xs text-[#E9E5FF]/80 font-medium">คุณก้าวสู่เลเวลใหม่แล้ว</p>
        </div>

        <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#F6D978] tabular-nums">
          +{totalXp} Total XP Earned
        </div>
      </div>
    </div>
  );
};

export interface AchievementCelebrationProps {
  title: string;
  xpReward: number;
  isStatic?: boolean;
}

export const AchievementCelebrationComposition: React.FC<AchievementCelebrationProps> = ({
  title,
  xpReward,
  isStatic = false,
}) => {
  const frame = isStatic ? 30 : useCurrentFrame();

  const badgeScale = isStatic
    ? 1
    : interpolate(frame, [0, 15, 25], [0.5, 1.15, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const glowPulse = isStatic
    ? 0.5
    : interpolate(frame, [0, 30, 60], [0.3, 0.8, 0.3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-6 bg-[#24233A] text-white rounded-2xl overflow-hidden select-none">
      <div
        className="relative z-10 flex flex-col items-center text-center space-y-3"
        style={{ transform: `scale(${badgeScale})` }}
      >
        {/* Glowing Badge */}
        <div
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#F6D978] to-[#FF8F82] p-1 shadow-lg flex items-center justify-center"
          style={{ filter: `drop-shadow(0 0 ${glowPulse * 16}px rgba(246, 217, 120, 0.6))` }}
        >
          <div className="w-full h-full rounded-full bg-[#1A192B] flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest text-[#F6D978] uppercase">
            ACHIEVEMENT UNLOCKED
          </span>
          <h3 className="text-base font-black text-white">{title}</h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#5B5CE2]/40 border border-[#5B5CE2] text-xs font-bold text-[#E9E5FF] tabular-nums">
          +{xpReward} XP
        </div>
      </div>
    </div>
  );
};
