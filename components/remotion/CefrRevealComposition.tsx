'use client';

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface CefrRevealProps {
  targetLevel?: string;
  cambridgeScore?: number;
  confidencePct?: number;
  isStatic?: boolean;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CefrRevealComposition: React.FC<CefrRevealProps> = ({
  targetLevel = 'B1',
  cambridgeScore = 148,
  confidencePct = 92,
  isStatic = false,
}) => {
  const frame = isStatic ? 80 : useCurrentFrame();

  const targetIndex = CEFR_LEVELS.indexOf(targetLevel);
  const maxIndex = targetIndex >= 0 ? targetIndex : 2;

  // 90 frames total (3.0s @ 30fps)
  const currentStep = interpolate(frame, [10, 60], [0, maxIndex], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeScale = interpolate(
    frame,
    [60, 72, 85],
    [0.85, 1.12, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const badgeOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0b1120',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#818cf8',
              fontWeight: 600,
            }}
          >
            Diagnostic Placement Result
          </span>
          <h4 style={{ margin: '3px 0 0 0', fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>
            CEFR Calibrated Proficiency
          </h4>
        </div>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: 'rgba(129, 140, 248, 0.15)',
            color: '#a5b4fc',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          Internal Platform Score
        </span>
      </div>

      {/* Stepped Scale Progress */}
      <div style={{ margin: '14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          {CEFR_LEVELS.map((lvl, idx) => {
            const isReached = idx <= currentStep;
            const isTarget = idx === maxIndex;
            return (
              <div
                key={lvl}
                style={{
                  flex: 1,
                  height: '38px',
                  backgroundColor: isReached
                    ? isTarget
                      ? '#6366f1'
                      : 'rgba(99, 102, 241, 0.35)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isTarget ? '1.5px solid #a5b4fc' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: isReached ? 700 : 500,
                  color: isReached ? '#ffffff' : '#64748b',
                  transition: 'background-color 0.2s',
                }}
              >
                {lvl}
              </div>
            );
          })}
        </div>

        {/* Progress Bar Fill */}
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((currentStep + 1) / CEFR_LEVELS.length) * 100}%`,
              backgroundColor: '#6366f1',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>

      {/* Assessed Score Reveal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '10px 16px',
          borderRadius: '8px',
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Estimated CEFR Level</span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#818cf8', letterSpacing: '-0.02em' }}>
            Level {targetLevel}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Cambridge Scale Approx</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
            ~{cambridgeScore} <span style={{ fontSize: '11px', color: '#64748b' }}>({confidencePct}% conf.)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
