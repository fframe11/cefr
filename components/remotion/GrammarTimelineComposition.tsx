'use client';

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface GrammarTimelineProps {
  tenseName?: string;
  exampleSentence?: string;
  timeframeLabel?: string;
  isStatic?: boolean;
}

export const GrammarTimelineComposition: React.FC<GrammarTimelineProps> = ({
  tenseName = 'Present Perfect vs. Past Simple',
  exampleSentence = 'She has lived here since 2021 (Ongoing connection to Now)',
  timeframeLabel = 'Past → Present',
  isStatic = false,
}) => {
  const frame = isStatic ? 45 : useCurrentFrame();

  // Deterministic interpolation (90 frames total @ 30fps = 3.0s loop)
  const lineProgress = interpolate(frame, [0, 40], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const nowPulseScale = interpolate(
    frame,
    [35, 50, 65, 80],
    [1.0, 1.25, 1.0, 1.1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const nowGlowOpacity = interpolate(
    frame,
    [35, 50, 75],
    [0.2, 0.8, 0.4],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const textOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#FFBA38',
              fontWeight: 600,
            }}
          >
            Grammar Timeline Aspect
          </span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
            {tenseName}
          </h4>
        </div>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: '#FFBA38',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          {timeframeLabel}
        </span>
      </div>

      {/* Center SVG Timeline */}
      <div style={{ position: 'relative', width: '100%', height: '110px', marginTop: '12px' }}>
        <svg width="100%" height="110" viewBox="0 0 600 110" preserveAspectRatio="none">
          {/* Base Track */}
          <line
            x1="60"
            y1="55"
            x2="540"
            y2="55"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Past Event Point */}
          <circle cx="120" cy="55" r="7" fill="#94a3b8" />
          <text
            x="120"
            y="85"
            fill="#94a3b8"
            fontSize="12"
            fontWeight="500"
            textAnchor="middle"
          >
            Past Action
          </text>

          {/* Connecting Bridge Line (Progressing) */}
          <line
            x1="120"
            y1="55"
            x2={120 + ((480 - 120) * lineProgress) / 100}
            y2="55"
            stroke="#FFBA38"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Present "NOW" Marker */}
          <circle
            cx="480"
            cy="55"
            r={16 * nowPulseScale}
            fill="rgba(56, 189, 248, 0.25)"
            opacity={nowGlowOpacity}
          />
          <circle cx="480" cy="55" r="8" fill="#FFBA38" />
          <text
            x="480"
            y="85"
            fill="#FFBA38"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            NOW (Present)
          </text>
        </svg>
      </div>

      {/* Pedagogical Sentence Callout */}
      <div
        style={{
          opacity: textOpacity,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '10px 14px',
          borderRadius: '8px',
          borderLeft: '3px solid #FFBA38',
          fontSize: '13px',
          color: '#e2e8f0',
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
          Key Rule Insight:
        </span>
        {exampleSentence}
      </div>
    </div>
  );
};
