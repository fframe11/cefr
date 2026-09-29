'use client';

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface SyllableItem {
  text: string;
  ipa: string;
  isStressed: boolean;
}

export interface PhoneticStressProps {
  word?: string;
  syllables?: SyllableItem[];
  cefrLevel?: string;
  isStatic?: boolean;
}

export const PhoneticStressComposition: React.FC<PhoneticStressProps> = ({
  word = 'collaborate',
  syllables = [
    { text: 'col', ipa: 'kə', isStressed: false },
    { text: 'LAB', ipa: 'ˈlæb', isStressed: true },
    { text: 'o', ipa: 'ə', isStressed: false },
    { text: 'rate', ipa: 'reɪt', isStressed: false },
  ],
  cefrLevel = 'B2',
  isStatic = false,
}) => {
  const frame = isStatic ? 20 : useCurrentFrame();

  // 60 frames @ 30fps (2.0s rhythmic cycle)
  // Pulse on stressed syllable around frame 15-30
  const stressScale = interpolate(
    frame,
    [0, 15, 25, 45, 60],
    [1.0, 1.15, 1.25, 1.05, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const stressGlow = interpolate(
    frame,
    [0, 20, 40, 60],
    [0.1, 0.45, 0.2, 0.1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
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
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            Phonetic Cadence & Stress
          </span>
          <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
            Word Stress Pattern
          </h4>
        </div>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 600,
          }}
        >
          {cefrLevel} Target
        </span>
      </div>

      {/* Syllable Interactive Rhythm Blocks */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          margin: '16px 0',
        }}
      >
        {syllables.map((s, idx) => {
          const isStressed = s.isStressed;
          const currentScale = isStressed ? stressScale : 1.0;
          const bg = isStressed
            ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(255, 255, 255, 0.04)';
          const borderColor = isStressed
            ? '#10b981'
            : 'rgba(255, 255, 255, 0.1)';
          const textColor = isStressed ? '#34d399' : '#94a3b8';

          return (
            <div
              key={idx}
              style={{
                transform: `scale(${currentScale})`,
                backgroundColor: bg,
                border: `1.5px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 18px',
                textAlign: 'center',
                boxShadow: isStressed
                  ? `0 0 20px rgba(16, 185, 129, ${stressGlow})`
                  : 'none',
                minWidth: '60px',
              }}
            >
              <div
                style={{
                  fontSize: isStressed ? '18px' : '15px',
                  fontWeight: isStressed ? 700 : 500,
                  color: textColor,
                  letterSpacing: '0.04em',
                }}
              >
                {s.text}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '4px',
                  fontFamily: 'monospace',
                }}
              >
                /{s.ipa}/
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidance Note */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Stressed syllable carries higher pitch & longer duration.</span>
        <span style={{ color: '#10b981', fontWeight: 600 }}>ˈ = Primary Stress</span>
      </div>
    </div>
  );
};
