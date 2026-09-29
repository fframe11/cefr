'use client';

import React from 'react';

interface BackgroundBeamsProps {
  className?: string;
}

export const BackgroundBeams: React.FC<BackgroundBeamsProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none opacity-40 dark:opacity-60 ${className}`}
    >
      {/* Radial Gradient Glow Core */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-primary/20 via-violet-500/10 to-transparent blur-3xl rounded-full" />
      
      {/* Sci-Fi Ambient Grid Rays */}
      <svg
        className="absolute inset-0 h-full w-full stroke-foreground/[0.04] dark:stroke-white/[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="gamer-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0, 0)"
          >
            <path d="M.5 48V.5H48" fill="none" strokeWidth="1" />
          </pattern>
          <linearGradient id="beam-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" strokeWidth="0" fill="url(#gamer-grid-pattern)" />

        {/* Diagonal Light Beams */}
        <line
          x1="-10%"
          y1="10%"
          x2="110%"
          y2="90%"
          stroke="url(#beam-grad-1)"
          strokeWidth="1.5"
          strokeDasharray="160 300"
          className="animate-shimmer"
        />
        <line
          x1="110%"
          y1="0%"
          x2="-10%"
          y2="100%"
          stroke="url(#beam-grad-1)"
          strokeWidth="1.5"
          strokeDasharray="200 400"
          className="animate-shimmer"
        />
      </svg>
    </div>
  );
};
