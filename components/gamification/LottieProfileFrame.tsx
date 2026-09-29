'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LottieFrameId, LottieFrameMetadata } from '@/types/gamification';
export type { LottieFrameId, LottieFrameMetadata };

export const LOTTIE_FRAME_METADATA: Record<LottieFrameId, LottieFrameMetadata> = {
  lottie_cyber_apex: {
    id: 'lottie_cyber_apex',
    nameEn: 'Cyber Apex Pulsar',
    nameTh: 'วงแหวนไซเบอร์พัลส์นีออน',
    category: 'gaming',
    rank: 1,
    color: '#00F0FF',
    animationUrl: 'https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/bodymovin/data.json',
    fallbackJsonPath: '/animations/frames/cyber_neon.json',
    license: 'Open Source (MIT / Public Domain)',
    licenseUrl: 'https://github.com/airbnb/lottie-web/blob/master/LICENSE.md',
    author: 'Lottie Open Source Community',
  },
  lottie_solar_radiance: {
    id: 'lottie_solar_radiance',
    nameEn: 'Solar Radiance Flame',
    nameTh: 'สุริยะรัศมีเพลิงทองคำ',
    category: 'gaming',
    rank: 2,
    color: '#FFB800',
    animationUrl: 'https://cdn.jsdelivr.net/gh/airbnb/lottie-web@master/demo/gordon/data.json',
    fallbackJsonPath: '/animations/frames/solar_flame.json',
    license: 'Open Source (MIT / Public Domain)',
    licenseUrl: 'https://github.com/airbnb/lottie-web/blob/master/LICENSE.md',
    author: 'Lottie Open Source Community',
  },
  lottie_mystic_emerald: {
    id: 'lottie_mystic_emerald',
    nameEn: 'Mystic Emerald Vortex',
    nameTh: 'วอร์เท็กซ์มนตราหยกมรกต',
    category: 'cute',
    rank: 3,
    color: '#10B981',
    animationUrl: 'https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/starwars/data.json',
    fallbackJsonPath: '/animations/frames/mystic_emerald.json',
    license: 'Open Source (MIT / Public Domain)',
    licenseUrl: 'https://github.com/airbnb/lottie-web/blob/master/LICENSE.md',
    author: 'Lottie Open Source Community',
  },
  lottie_sakura_starlight: {
    id: 'lottie_sakura_starlight',
    nameEn: 'Sakura Starlight Bloom',
    nameTh: 'กลีบซากุระประกายดาวพาสเทล',
    category: 'cute',
    rank: 2,
    color: '#F43F5E',
    animationUrl: 'https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/2016/data.json',
    fallbackJsonPath: '/animations/frames/sakura_starlight.json',
    license: 'Open Source (MIT / Public Domain)',
    licenseUrl: 'https://github.com/airbnb/lottie-web/blob/master/LICENSE.md',
    author: 'Lottie Open Source Community',
  },
};

export const MOCK_LOTTIE_FRAMES = Object.values(LOTTIE_FRAME_METADATA);

interface LottieProfileFrameProps {
  frameId?: LottieFrameId | string;
  customAnimationUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  avatarUrl?: string;
  username?: string;
  className?: string;
  children?: React.ReactNode;
  showBadge?: boolean;
}

const SIZE_MAP = {
  sm: { container: 'w-10 h-10', lottieScale: 'scale-[1.38]', avatarSize: 32 },
  md: { container: 'w-14 h-14', lottieScale: 'scale-[1.42]', avatarSize: 44 },
  lg: { container: 'w-20 h-20', lottieScale: 'scale-[1.45]', avatarSize: 64 },
  xl: { container: 'w-28 h-28', lottieScale: 'scale-[1.48]', avatarSize: 90 },
};

export const LottieProfileFrame: React.FC<LottieProfileFrameProps> = ({
  frameId,
  customAnimationUrl,
  size = 'md',
  avatarUrl,
  username,
  className = '',
  children,
  showBadge = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const config = SIZE_MAP[size];

  // Resolve metadata or custom URL
  const meta: LottieFrameMetadata | undefined =
    frameId && frameId in LOTTIE_FRAME_METADATA
      ? LOTTIE_FRAME_METADATA[frameId as LottieFrameId]
      : undefined;

  const targetUrl = customAnimationUrl || meta?.fallbackJsonPath || meta?.animationUrl;

  useEffect(() => {
    if (!targetUrl) return;

    let isCancelled = false;
    let animInstance: any = null;

    // Load lottie-web dynamically on client only (SSR-safe)
    const initLottie = async () => {
      try {
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (isCancelled || !containerRef.current) return;

        // Clean container before mounting
        containerRef.current.innerHTML = '';

        // If targetUrl is local or remote, loadAnimation handles both path strings and json objects
        animInstance = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: targetUrl,
        });

        animInstance.addEventListener('DOMLoaded', () => {
          if (!isCancelled) setIsLottieLoaded(true);
        });

        animInstance.addEventListener('data_failed', () => {
          if (!isCancelled) {
            // Attempt fallback to local JSON path if remote failed
            const el = containerRef.current;
            if (meta?.fallbackJsonPath && targetUrl !== meta.fallbackJsonPath && el) {
              try {
                animInstance?.destroy();
                animInstance = lottie.loadAnimation({
                  container: el,
                  renderer: 'svg',
                  loop: true,
                  autoplay: true,
                  path: meta.fallbackJsonPath,
                });
                setIsLottieLoaded(true);
                return;
              } catch {
                // fall through
              }
            }
            setLoadError(true);
          }
        });
      } catch {
        if (!isCancelled) setLoadError(true);
      }
    };

    initLottie();

    return () => {
      isCancelled = true;
      try {
        animInstance?.destroy();
      } catch {
        // ignore unmount errors
      }
    };
  }, [targetUrl, meta]);

  const avatarContent = children || (
    avatarUrl ? (
      <img
        src={avatarUrl}
        alt={username || 'Avatar'}
        className="w-full h-full rounded-full object-cover aspect-square select-none"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs uppercase select-none">
        {(username || 'GL').slice(0, 2).toUpperCase()}
      </div>
    )
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${config.container} ${className}`}
      data-testid={`lottie-frame-${frameId || 'custom'}`}
    >
      {/* Centered User Avatar */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center ring-1 ring-white/10 shadow-sm">
        {avatarContent}
      </div>

      {/* Lottie Animation Canvas/SVG Layer */}
      <div
        className={`absolute inset-0 pointer-events-none z-20 flex items-center justify-center ${config.lottieScale} transition-opacity duration-300 ${
          isLottieLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        ref={containerRef}
        aria-hidden="true"
      />

      {/* High-Fidelity SVG Fallback (Visible during loading, error, or reduced motion) */}
      {(!isLottieLoaded || loadError) && meta && (
        <div className="absolute inset-0 -m-1.5 sm:-m-2 pointer-events-none z-15 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible animate-pulse"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              stroke={meta.color}
              strokeWidth="2.5"
              strokeDasharray="8 4"
              className="animate-spin-slow origin-center opacity-85"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke={meta.color}
              strokeWidth="1.2"
              className="opacity-50"
            />
          </svg>
        </div>
      )}

      {/* Optional Licensing & Legitimacy Tag */}
      {showBadge && meta && (
        <span
          className="absolute -bottom-1 z-30 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider shadow-sm pointer-events-none"
          style={{ backgroundColor: meta.color }}
        >
          {meta.category}
        </span>
      )}
    </div>
  );
};
