'use client';

import React from 'react';
import { RankFrameId } from '../../types/gamification';

interface RankFrameProps {
  frameId?: RankFrameId;
  customAnimationUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  avatarUrl?: string;
  username?: string;
  className?: string;
  showBadge?: boolean;
}

const SIZE_MAP = {
  sm: { container: 'w-10 h-10', svgSize: 48, avatarSize: 32 },
  md: { container: 'w-14 h-14', svgSize: 68, avatarSize: 44 },
  lg: { container: 'w-20 h-20', svgSize: 96, avatarSize: 64 },
  xl: { container: 'w-28 h-28', svgSize: 136, avatarSize: 90 },
};

import { LottieProfileFrame, LOTTIE_FRAME_METADATA } from './LottieProfileFrame';

export const RANK_FRAME_METADATA: Record<
  RankFrameId,
  { nameEn: string; nameTh: string; category: 'cute' | 'gaming'; rank: 1 | 2 | 3; color: string }
> = {
  cute_1: {
    nameEn: 'Sparkling Bubble Crown',
    nameTh: 'มงกุฎฟองสบู่ประกายทอง',
    category: 'cute',
    rank: 1,
    color: '#F6D978',
  },
  cute_2: {
    nameEn: 'Pastel Star Ribbon',
    nameTh: 'ริบบิ้นดวงดาวพาสเทล',
    category: 'cute',
    rank: 2,
    color: '#FF8F82',
  },
  cute_3: {
    nameEn: 'Mint Pearl Ring',
    nameTh: 'วงแหวนไข่มุกมินต์',
    category: 'cute',
    rank: 3,
    color: '#B9E8D3',
  },
  gaming_1: {
    nameEn: 'Apex Cyber Halo',
    nameTh: 'วงแหวนพลังงานไซเบอร์แชมเปี้ยน',
    category: 'gaming',
    rank: 1,
    color: '#FFB800',
  },
  gaming_2: {
    nameEn: 'Violet Pulse Conduits',
    nameTh: 'เกราะสนามพลังพัลส์สีม่วง',
    category: 'gaming',
    rank: 2,
    color: '#A855F7',
  },
  gaming_3: {
    nameEn: 'Cobalt Hex Shield',
    nameTh: 'โล่หกเหลี่ยมโคบอลต์ไฮเทค',
    category: 'gaming',
    rank: 3,
    color: '#06B6D4',
  },
  lottie_cyber_apex: {
    nameEn: 'Cyber Apex Pulsar (Lottie)',
    nameTh: 'วงแหวนไซเบอร์พัลส์นีออน (Lottie)',
    category: 'gaming',
    rank: 1,
    color: '#00F0FF',
  },
  lottie_solar_radiance: {
    nameEn: 'Solar Radiance Flame (Lottie)',
    nameTh: 'สุริยะรัศมีเพลิงทองคำ (Lottie)',
    category: 'gaming',
    rank: 2,
    color: '#FFB800',
  },
  lottie_mystic_emerald: {
    nameEn: 'Mystic Emerald Vortex (Lottie)',
    nameTh: 'วอร์เท็กซ์มนตราหยกมรกต (Lottie)',
    category: 'cute',
    rank: 3,
    color: '#10B981',
  },
  lottie_sakura_starlight: {
    nameEn: 'Sakura Starlight Bloom (Lottie)',
    nameTh: 'กลีบซากุระประกายดาวพาสเทล (Lottie)',
    category: 'cute',
    rank: 2,
    color: '#F43F5E',
  },
};

export const GlovaAvatarWithFrame: React.FC<RankFrameProps> = ({
  frameId,
  customAnimationUrl,
  size = 'md',
  children,
  avatarUrl,
  username,
  className = '',
  showBadge = false,
}) => {
  const config = SIZE_MAP[size];

  const content = children || (
    avatarUrl ? (
      <img
        src={avatarUrl}
        alt={username || 'Avatar'}
        className="w-full h-full rounded-full object-cover aspect-square"
      />
    ) : (
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs uppercase">
        {(username || 'GL').slice(0, 2)}
      </div>
    )
  );

  // If custom animation URL is provided or lottie frame selected, delegate to LottieProfileFrame
  if (customAnimationUrl || (frameId && (frameId.startsWith('lottie_') || frameId in LOTTIE_FRAME_METADATA))) {
    return (
      <LottieProfileFrame
        frameId={frameId as any}
        customAnimationUrl={customAnimationUrl}
        size={size}
        avatarUrl={avatarUrl}
        username={username}
        className={className}
        showBadge={showBadge}
      >
        {children}
      </LottieProfileFrame>
    );
  }

  if (!frameId) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${config.container} ${className}`}>
        <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          {content}
        </div>
      </div>
    );
  }

  const meta = RANK_FRAME_METADATA[frameId];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${config.container} ${className}`}
      data-testid={`rank-frame-${frameId}`}
    >
      {/* Centered Avatar Content */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        {content}
      </div>

      {/* SVG Animated Frame Overlay */}
      <div className="absolute inset-0 -m-2 sm:-m-2.5 pointer-events-none z-20 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible transition-transform duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Cute 1: Golden Bubble Tiara Gradient */}
            <linearGradient id="goldBubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1B8" />
              <stop offset="50%" stopColor="#F6D978" />
              <stop offset="100%" stopColor="#E5A638" />
            </linearGradient>

            {/* Cute 2: Pastel Ribbon Gradient */}
            <linearGradient id="pastelRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC5BE" />
              <stop offset="100%" stopColor="#FF8F82" />
            </linearGradient>

            {/* Cute 3: Mint Pearl Gradient */}
            <linearGradient id="mintPearlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4F6E6" />
              <stop offset="100%" stopColor="#7ADCB0" />
            </linearGradient>

            {/* Gaming 1: Cyber Apex Gold */}
            <linearGradient id="cyberApexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="50%" stopColor="#FFB800" />
              <stop offset="100%" stopColor="#FF5500" />
            </linearGradient>

            {/* Gaming 2: Violet Pulse */}
            <linearGradient id="violetPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            {/* Gaming 3: Cobalt Hex */}
            <linearGradient id="cobaltHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. CUTE RANK #1: Sparkling Bubble Crown */}
          {frameId === 'cute_1' && (
            <g className="glova-frame-cute-1">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#goldBubbleGrad)"
                strokeWidth="4"
                strokeDasharray="8 4"
                className="animate-[spin_16s_linear_infinite] origin-center motion-reduce:animate-none"
              />
              <circle
                cx="50"
                cy="50"
                r="41"
                stroke="#FFEBA3"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Floating Bubbles */}
              <circle cx="20" cy="24" r="5" fill="#FFF4D0" filter="url(#softGlow)" className="animate-pulse" />
              <circle cx="80" cy="24" r="5" fill="#FFF4D0" filter="url(#softGlow)" className="animate-pulse" />
              <circle cx="50" cy="8" r="7" fill="url(#goldBubbleGrad)" filter="url(#softGlow)" />
              {/* Crown Center Gem */}
              <path
                d="M44 14 L50 4 L56 14 L50 20 Z"
                fill="#FFB800"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="animate-[bounce_3s_ease-in-out_infinite] motion-reduce:animate-none origin-center"
              />
              <circle cx="15" cy="65" r="3.5" fill="#F6D978" opacity="0.9" />
              <circle cx="85" cy="65" r="3.5" fill="#F6D978" opacity="0.9" />
            </g>
          )}

          {/* 2. CUTE RANK #2: Pastel Star Ribbon */}
          {frameId === 'cute_2' && (
            <g className="glova-frame-cute-2">
              <circle
                cx="50"
                cy="50"
                r="43"
                stroke="url(#pastelRibbonGrad)"
                strokeWidth="3.5"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeDasharray="4 6"
                className="animate-[spin_20s_linear_infinite] origin-center motion-reduce:animate-none"
              />
              {/* Orbital Stars */}
              <polygon
                points="50,6 52,12 58,12 53,16 55,22 50,18 45,22 47,16 42,12 48,12"
                fill="#F6D978"
                stroke="#FF8F82"
                strokeWidth="0.8"
                className="animate-pulse origin-center"
              />
              <circle cx="16" cy="30" r="4" fill="#FFC5BE" />
              <circle cx="84" cy="30" r="4" fill="#FFC5BE" />
              <circle cx="50" cy="94" r="5" fill="url(#pastelRibbonGrad)" />
            </g>
          )}

          {/* 3. CUTE RANK #3: Mint Pearl Ring */}
          {frameId === 'cute_3' && (
            <g className="glova-frame-cute-3">
              <circle
                cx="50"
                cy="50"
                r="43"
                stroke="url(#mintPearlGrad)"
                strokeWidth="3.5"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#B9E8D3"
                strokeWidth="1.2"
                opacity="0.6"
              />
              {/* Mint Pearl Beads */}
              <circle cx="50" cy="8" r="4.5" fill="#FFFFFF" stroke="#7ADCB0" strokeWidth="1.5" />
              <circle cx="92" cy="50" r="4" fill="#FFFFFF" stroke="#7ADCB0" strokeWidth="1.2" />
              <circle cx="50" cy="92" r="4" fill="#FFFFFF" stroke="#7ADCB0" strokeWidth="1.2" />
              <circle cx="8" cy="50" r="4" fill="#FFFFFF" stroke="#7ADCB0" strokeWidth="1.2" />
            </g>
          )}

          {/* 4. GAMING RANK #1: Apex Cyber Halo */}
          {frameId === 'gaming_1' && (
            <g className="glova-frame-gaming-1">
              {/* Outer Energy Polygon */}
              <polygon
                points="50,2 88,14 98,50 88,86 50,98 12,86 2,50 12,14"
                stroke="url(#cyberApexGrad)"
                strokeWidth="3.5"
                fill="none"
                filter="url(#softGlow)"
              />
              {/* Rotating Chevron Tech Ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#FFB800"
                strokeWidth="2"
                strokeDasharray="14 10"
                className="animate-[spin_10s_linear_infinite] origin-center motion-reduce:animate-none"
              />
              {/* Corner Armor Chevrons */}
              <path d="M46 6 L50 2 L54 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M94 46 L98 50 L94 54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M54 94 L50 98 L46 94" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 54 L2 50 L6 46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* 5. GAMING RANK #2: Violet Pulse Conduits */}
          {frameId === 'gaming_2' && (
            <g className="glova-frame-gaming-2">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#violetPulseGrad)"
                strokeWidth="3.5"
                filter="url(#softGlow)"
              />
              {/* Radar pulse dashes */}
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#E9D5FF"
                strokeWidth="1.8"
                strokeDasharray="6 8"
                className="animate-[spin_14s_linear_infinite] origin-center motion-reduce:animate-none"
              />
              {/* Sci-Fi Brackets */}
              <path d="M25 10 L15 15 L10 25" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M75 10 L85 15 L90 25" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M90 75 L85 85 L75 90" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M10 75 L15 85 L25 90" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* 6. GAMING RANK #3: Cobalt Hex Shield */}
          {frameId === 'gaming_3' && (
            <g className="glova-frame-gaming-3">
              <polygon
                points="50,6 88,27 88,73 50,94 12,73 12,27"
                stroke="url(#cobaltHexGrad)"
                strokeWidth="3.5"
                fill="none"
                filter="url(#softGlow)"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#67E8F9"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                className="animate-[spin_18s_linear_infinite] origin-center motion-reduce:animate-none"
              />
              {/* Hex node points */}
              <circle cx="50" cy="6" r="3" fill="#FFFFFF" />
              <circle cx="88" cy="27" r="3" fill="#FFFFFF" />
              <circle cx="88" cy="73" r="3" fill="#FFFFFF" />
              <circle cx="50" cy="94" r="3" fill="#FFFFFF" />
              <circle cx="12" cy="73" r="3" fill="#FFFFFF" />
              <circle cx="12" cy="27" r="3" fill="#FFFFFF" />
            </g>
          )}
        </svg>
      </div>

      {/* Rank #1, #2, #3 Mini Badge */}
      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none text-white shadow-xs"
          style={{ backgroundColor: meta.color }}
        >
          #{meta.rank}
        </span>
      )}
    </div>
  );
};
