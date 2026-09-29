import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';

export interface RankedArenaShowcaseProps {
  isStatic?: boolean;
}

export const RankedArenaShowcaseComposition: React.FC<RankedArenaShowcaseProps> = ({
  isStatic = false,
}) => {
  const frame = isStatic ? 90 : useCurrentFrame();
  const fps = 30;

  // Scene timings (180 frames = 6 seconds total loop)
  // 0 - 60 (0-2s): Question appears & 4s timer ticks down
  // 60 - 90 (2-3s): Correct answer locked in (green glow)
  // 90 - 150 (3-5s): Victory & MMR Surge (+28 MMR)
  // 150 - 180 (5-6s): Settle / Loop reset

  const timerProgress = interpolate(frame, [0, 60], [100, 35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const questionOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const answerLock = frame >= 60;
  const mmrScale = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const mmrOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0d0f17',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%)',
        color: '#FFFFFF',
        fontFamily: "'Chakra Petch', 'Orbitron', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Esports Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Arena Top Match Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '520px',
          marginBottom: '16px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#FACC15',
              letterSpacing: '1px',
            }}
          >
            GOLD II
          </div>
          <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>1,480 MMR</span>
        </div>

        {/* 4s Speed Timer Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 800 }}>⚡ 4.0s TIMER</span>
          <div
            style={{
              width: '80px',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${timerProgress}%`,
                height: '100%',
                backgroundColor: timerProgress > 50 ? '#10B981' : '#EF4444',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Battle Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          opacity: questionOpacity,
          zIndex: 10,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#818CF8', letterSpacing: '1.5px' }}>
            CEFR B2 VOCABULARY ARENA
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>ROUND 3/5</span>
        </div>

        <div style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px', letterSpacing: '1px' }}>
          PRAGMATIC
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>
          [adj.] Solving problems in a sensible way that suits the conditions.
        </div>

        {/* 4 Choices Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: answerLock ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.7)',
              border: answerLock ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
              color: answerLock ? '#34D399' : '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>เน้นใช้ได้จริง / ยึดหลักปฏิบัติ</span>
            {answerLock && <span>✓</span>}
          </div>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#64748B',
            }}
          >
            เพ้อฝันเกินความเป็นจริง
          </div>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#64748B',
            }}
          >
            ซับซ้อนเข้าใจยาก
          </div>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#64748B',
            }}
          >
            ลังเลตัดสินใจไม่ได้
          </div>
        </div>

        {/* Victory MMR Surge Popup */}
        {frame >= 80 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${mmrScale})`,
              opacity: mmrOpacity,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid #F59E0B',
              borderRadius: '14px',
              padding: '14px 28px',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.4)',
              textAlign: 'center',
              zIndex: 30,
            }}
          >
            <div style={{ fontSize: '11px', color: '#FBBF24', fontWeight: 700, letterSpacing: '2px' }}>
              MATCH VICTORY
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#34D399', margin: '2px 0' }}>
              +28 MMR
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Current: 1,508 MMR • Top 14%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
