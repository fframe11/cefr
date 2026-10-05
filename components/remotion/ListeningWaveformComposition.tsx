import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface ListeningWaveformProps {
  isPlaying?: boolean;
  isStatic?: boolean;
}

export const ListeningWaveformComposition: React.FC<ListeningWaveformProps> = ({
  isPlaying = true,
  isStatic = false,
}) => {
  const frame = isStatic ? 30 : useCurrentFrame();

  // 16 bars of audio wave
  const barCount = 20;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FAF7F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '16px',
        boxSizing: 'border-box',
        borderRadius: '16px',
        border: '1px solid #EDE8DF',
      }}
    >
      {Array.from({ length: barCount }).map((_, idx) => {
        // Deterministic sinusoidal wave amplitude calculation
        const offset = idx * 0.45;
        const rawWave = Math.sin((frame * 0.15) + offset);
        const heightMultiplier = isPlaying && !isStatic
          ? 0.3 + 0.7 * Math.abs(rawWave)
          : 0.25;

        const barHeight = interpolate(heightMultiplier, [0, 1], [8, 54], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Alternating pastel jewel tones: Indigo, Lavender, Mint, Coral
        const colors = ['#FA5D5D', '#8B5CF6', '#10B981', '#FF8F82'];
        const barColor = colors[idx % colors.length];

        return (
          <div
            key={idx}
            style={{
              width: '6px',
              height: `${barHeight}px`,
              borderRadius: '999px',
              backgroundColor: barColor,
              opacity: isPlaying || isStatic ? 0.85 : 0.4,
              transition: 'opacity 0.2s',
            }}
          />
        );
      })}
    </div>
  );
};
