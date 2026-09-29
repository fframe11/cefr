'use client';

import React from 'react';
import { RankTier } from '@/types/ranked';

export interface RankEmblemProps {
  tier: RankTier;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showGlow?: boolean;
  className?: string;
  animate?: boolean;
  useImage?: boolean;
}

const SIZE_MAP = {
  xs: { width: 22, height: 22, px: 'w-[22px] h-[22px]' },
  sm: { width: 32, height: 32, px: 'w-[32px] h-[32px]' },
  md: { width: 44, height: 44, px: 'w-[44px] h-[44px]' },
  lg: { width: 64, height: 64, px: 'w-[64px] h-[64px]' },
  xl: { width: 92, height: 92, px: 'w-[92px] h-[92px]' },
  '2xl': { width: 128, height: 128, px: 'w-[128px] h-[128px]' },
};

/**
 * GLOVA RANK EMBLEMS
 * Dedicated heraldic game emblems for the 6 competitive tiers.
 * Strictly separate from academic CEFR A1-C2 badges.
 */
export const RankEmblem: React.FC<RankEmblemProps> = ({
  tier,
  size = 'md',
  showGlow = true,
  className = '',
  animate = true,
  useImage = false,
}) => {
  const { width, height, px } = SIZE_MAP[size] || SIZE_MAP.md;

  // Render SVG Crest based on Tier
  const renderSvgCrest = () => {
    switch (tier) {
      case 'Bronze':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
            <defs>
              <linearGradient id="bronze_shield" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D97706" />
                <stop offset="0.5" stopColor="#B45309" />
                <stop offset="1" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="bronze_core" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#92400E" />
              </linearGradient>
            </defs>
            {/* Outer Heraldic Laurel Rim */}
            <path d="M50 5 L85 20 L80 65 L50 95 L20 65 L15 20 Z" fill="url(#bronze_shield)" stroke="#FDE68A" strokeWidth="2.5" />
            {/* Inner Metallic Chevron */}
            <path d="M50 16 L74 28 L70 60 L50 82 L30 60 L26 28 Z" fill="url(#bronze_core)" opacity="0.9" />
            {/* Specular Highlight */}
            <path d="M50 22 L65 30 L62 55 L50 72 Z" fill="#FBBF24" opacity="0.35" />
            {/* Center Spartan Star Crest */}
            <polygon points="50,32 54,42 65,43 57,51 59,62 50,56 41,62 43,51 35,43 46,42" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
          </svg>
        );

      case 'Silver':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
            <defs>
              <linearGradient id="silver_shield" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E2E8F0" />
                <stop offset="0.5" stopColor="#94A3B8" />
                <stop offset="1" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="silver_sapphire" x1="50" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            {/* Winged Aegis */}
            <path d="M50 5 L90 18 L82 68 L50 95 L18 68 L10 18 Z" fill="url(#silver_shield)" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Inner Plate */}
            <path d="M50 16 L78 26 L72 62 L50 83 L28 62 L22 26 Z" fill="#1E293B" opacity="0.85" />
            {/* Center Cut Sapphire Gem */}
            <polygon points="50,30 68,44 60,68 40,68 32,44" fill="url(#silver_sapphire)" stroke="#BAE6FD" strokeWidth="1.5" />
            <polygon points="50,36 62,46 50,62 38,46" fill="#E0F2FE" opacity="0.5" />
          </svg>
        );

      case 'Gold':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="gold_crown" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.5" stopColor="#EAB308" />
                <stop offset="1" stopColor="#854D0E" />
              </linearGradient>
              <linearGradient id="gold_amber" x1="50" y1="35" x2="50" y2="65" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Golden Hex Sunburst Crest */}
            <path d="M50 3 L88 15 L95 50 L78 88 L50 98 L22 88 L5 50 L12 15 Z" fill="url(#gold_crown)" stroke="#FEF08A" strokeWidth="3" />
            {/* Inner Royal Chamber */}
            <polygon points="50,15 80,26 84,52 70,80 50,88 30,80 16,52 20,26" fill="#451A03" opacity="0.9" />
            {/* Sunburst Rays */}
            <line x1="50" y1="18" x2="50" y2="30" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="72" y1="32" x2="62" y2="40" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="32" x2="38" y2="40" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            {/* Golden Sovereign Crown */}
            <path d="M35 62 L32 44 L42 50 L50 38 L58 50 L68 44 L65 62 Z" fill="url(#gold_crown)" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="50" cy="54" r="5" fill="#EF4444" />
          </svg>
        );

      case 'Platinum':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="plat_aegis" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#67E8F9" />
                <stop offset="0.4" stopColor="#06B6D4" />
                <stop offset="1" stopColor="#0E7490" />
              </linearGradient>
              <linearGradient id="plat_core" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#CFFAFE" />
                <stop offset="1" stopColor="#0891B2" />
              </linearGradient>
            </defs>
            {/* Sharded Diamond Hexagon */}
            <path d="M50 4 L92 24 L92 76 L50 96 L8 76 L8 24 Z" fill="url(#plat_aegis)" stroke="#E0F2FE" strokeWidth="3" />
            {/* Prismatic Wing Blades */}
            <polygon points="50,14 82,30 82,70 50,86 18,70 18,30" fill="#082F49" opacity="0.9" />
            {/* Lightning Apex Gem */}
            <polygon points="50,22 72,40 50,78 28,40" fill="url(#plat_core)" stroke="#A5F3FC" strokeWidth="1.5" />
            {/* Core Refraction */}
            <polygon points="50,28 64,42 50,70 36,42" fill="#FFFFFF" opacity="0.4" />
          </svg>
        );

      case 'Diamond':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
            <defs>
              <linearGradient id="diamond_nebula" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C084FC" />
                <stop offset="0.5" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#581C87" />
              </linearGradient>
              <linearGradient id="diamond_gem" x1="30" y1="25" x2="70" y2="75" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F3E8FF" />
                <stop offset="0.3" stopColor="#A855F7" />
                <stop offset="1" stopColor="#3B0764" />
              </linearGradient>
            </defs>
            {/* Orbiting Starlight Halo */}
            <circle cx="50" cy="50" r="44" stroke="#D8B4FE" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
            {/* Royal Faceted Diamond Shield */}
            <polygon points="50,5 92,32 76,88 24,88 8,32" fill="url(#diamond_nebula)" stroke="#FAF5FF" strokeWidth="2.5" />
            <polygon points="50,15 80,36 68,80 32,80 20,36" fill="#1E1035" opacity="0.9" />
            {/* Brilliant Cut Diamond Core */}
            <polygon points="35,32 65,32 80,48 50,76 20,48" fill="url(#diamond_gem)" stroke="#E9D5FF" strokeWidth="1.5" />
            <polygon points="42,32 58,32 68,48 50,48" fill="#FFFFFF" opacity="0.5" />
            <polygon points="32,48 50,48 42,32" fill="#FFFFFF" opacity="0.25" />
          </svg>
        );

      case 'Master':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="master_fire" x1="50" y1="2" x2="50" y2="98" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F87171" />
                <stop offset="0.4" stopColor="#EF4444" />
                <stop offset="0.8" stopColor="#991B1B" />
                <stop offset="1" stopColor="#450A0A" />
              </linearGradient>
              <linearGradient id="master_gold_trim" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="1" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
            {/* Dragon Wings / Crown */}
            <path d="M50 2 L66 18 L94 14 L84 44 L98 62 L74 96 L50 86 L26 96 L2 62 L16 44 L6 14 L34 18 Z" fill="url(#master_fire)" stroke="url(#master_gold_trim)" strokeWidth="2.5" />
            {/* Obsidian Core Vault */}
            <polygon points="50,14 74,26 80,56 64,80 50,74 36,80 20,56 26,26" fill="#18040A" opacity="0.9" />
            {/* Blazing Phoenix Crest */}
            <path d="M50 26 C54 36 64 42 66 52 C68 62 60 70 50 72 C40 70 32 62 34 52 C36 42 46 36 50 26 Z" fill="#F59E0B" stroke="#FDE047" strokeWidth="1" />
            <circle cx="50" cy="52" r="5" fill="#EF4444" />
          </svg>
        );

      default:
        return null;
    }
  };

  const glowStyles = {
    Bronze: 'shadow-[0_0_15px_rgba(217,119,6,0.25)]',
    Silver: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
    Gold: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    Platinum: 'shadow-[0_0_20px_rgba(6,182,212,0.45)]',
    Diamond: 'shadow-[0_0_25px_rgba(139,92,246,0.5)]',
    Master: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
  }[tier];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${px} ${
        showGlow ? glowStyles : ''
      } ${animate ? 'transition duration-200 hover:scale-105 active:scale-95' : ''} ${className}`}
      role="img"
      aria-label={`Rank Emblem: ${tier}`}
    >
      {useImage ? (
        <img
          src={`/assets/ranks/rank-${tier.toLowerCase()}.png`}
          alt={`Rank Emblem ${tier}`}
          width={width}
          height={height}
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
        />
      ) : (
        renderSvgCrest()
      )}
    </div>
  );
};
