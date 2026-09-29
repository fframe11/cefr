'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';

export interface RemotionPlayerWrapperProps<T extends Record<string, any>> {
  component: React.ComponentType<any>;
  inputProps: T;
  durationInFrames: number;
  fps?: number;
  compositionWidth?: number;
  compositionHeight?: number;
  aspectRatio?: string;
  loop?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function RemotionPlayerWrapper<T extends Record<string, any>>({
  component: Component,
  inputProps,
  durationInFrames,
  fps = 30,
  compositionWidth = 640,
  compositionHeight = 240,
  aspectRatio = '8/3',
  loop = true,
  className = '',
  ariaLabel = 'Educational concept animation',
}: RemotionPlayerWrapperProps<T>) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Static Fallback for SSR and Prefers-Reduced-Motion
  if (!mounted || prefersReducedMotion) {
    return (
      <div
        className={`w-full overflow-hidden rounded-xl border border-border/40 shadow-sm ${className}`}
        style={{ aspectRatio }}
        role="region"
        aria-label={`${ariaLabel} (Static mode)`}
      >
        <Component {...inputProps} isStatic={true} />
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-border/40 shadow-sm ${className}`}
      style={{ aspectRatio }}
      role="region"
      aria-label={ariaLabel}
    >
      <Player
        component={Component}
        inputProps={{ ...inputProps, isStatic: false }}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        loop={loop}
        autoPlay={true}
        controls={false}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
