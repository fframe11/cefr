import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface SeasonPassRewardsProps {
  isStatic?: boolean;
}

const FRAMES_DATA = [
  { id: 'cute_1', name: 'Star Bloom', tag: 'CUTE VIBE', color: '#EC4899', tier: 'LVL 10' },
  { id: 'cute_2', name: 'Sakura Petals', tag: 'AESTHETIC', color: '#F472B6', tier: 'LVL 20' },
  { id: 'cute_3', name: 'Golden Halo', tag: 'DIVINE', color: '#F59E0B', tier: 'LVL 35' },
  { id: 'gaming_1', name: 'Neon Cyber Hex', tag: 'TECH RUNNER', color: '#06B6D4', tier: 'GOLD' },
  { id: 'gaming_2', name: 'Valkyrie Gold', tag: 'HIGH ROLLER', color: '#EAB308', tier: 'DIAMOND' },
  { id: 'gaming_3', name: 'Infernal Ember', tag: 'CHALLENGER', color: '#EF4444', tier: 'MASTER' },
];

export const SeasonPassRewardsComposition: React.FC<SeasonPassRewardsProps> = ({
  isStatic = false,
}) => {
  const frame = isStatic ? 45 : useCurrentFrame();

  // Cycle through the 6 frames every 25 frames (total 150 frames = 5s loop)
  const activeIndex = isStatic ? 4 : Math.floor((frame % 150) / 25);
  const activeFrameData = FRAMES_DATA[activeIndex] || FRAMES_DATA[0];

  const rotation = interpolate(frame, [0, 150], [0, 360]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#090b10',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%)',
        color: '#FFFFFF',
        fontFamily: "'Chakra Petch', 'Orbitron', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '14px', zIndex: 10 }}>
        <div style={{ fontSize: '10px', color: '#A78BFA', fontWeight: 700, letterSpacing: '2px' }}>
          SEASON 1 REWARD TRACK
        </div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
          Animated Rank Frames
        </div>
      </div>

      {/* Main Avatar Frame Showcase */}
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          zIndex: 10,
        }}
      >
        {/* Animated Glow Halo */}
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '999px',
            border: `2px dashed ${activeFrameData.color}`,
            transform: `rotate(${rotation}deg)`,
            opacity: 0.8,
            boxShadow: `0 0 25px ${activeFrameData.color}40`,
          }}
        />

        {/* Center Mock Profile */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '999px',
            backgroundColor: '#1E293B',
            border: `3px solid ${activeFrameData.color}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 800,
            color: '#FFFFFF',
            zIndex: 12,
          }}
        >
          GL
        </div>
      </div>

      {/* Frame Metadata Badge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: `${activeFrameData.color}25`,
              color: activeFrameData.color,
              border: `1px solid ${activeFrameData.color}50`,
            }}
          >
            {activeFrameData.tier}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>
            {activeFrameData.name}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#64748B', letterSpacing: '1px' }}>
          {activeFrameData.tag}
        </span>
      </div>

      {/* Frame Dots Indicator */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', zIndex: 10 }}>
        {FRAMES_DATA.map((f, idx) => (
          <div
            key={f.id}
            style={{
              width: idx === activeIndex ? '18px' : '6px',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: idx === activeIndex ? f.color : 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
