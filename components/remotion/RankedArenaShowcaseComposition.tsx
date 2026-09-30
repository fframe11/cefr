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
  // 60 - 90 (2-3s): Correct answer Option A is clicked (presses down 4px, turns emerald)
  // 90 - 150 (3-5s): Victory & XP/MMR Surge (+28 MMR, +25 XP, 3 Streak)
  // 150 - 180 (5-6s): Settle & smooth loop reset

  const timerSeconds = interpolate(frame, [0, 60], [4.0, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const timerProgress = interpolate(frame, [0, 60], [100, 30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isAnswered = frame >= 60;
  const isOptionPressed = frame >= 55 && frame < 65;

  const rewardScale = spring({
    frame: frame - 80,
    fps,
    config: { damping: 14, stiffness: 220 },
  });

  const rewardOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#E6DED2',
        color: '#EDEBE8',
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans Thai', -apple-system, sans-serif",
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
      {/* Subtle Warm Studio Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(#0D1318 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* Top Matchup Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '540px',
          marginBottom: '14px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: '#5B5CE2',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2.5px 0 0 #38399E',
              fontSize: '11px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.5px',
            }}
          >
            4s VOCAB SPEED BATTLE
          </div>
          <span style={{ fontSize: '12px', color: '#6E6870', fontWeight: 700 }}>
            Round 3/5
          </span>
        </div>

        {/* 4.0s Tactile Timer Capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#141A22',
            padding: '5px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(37, 36, 42, 0.12)',
            boxShadow: '0 2px 0 0 #0D1318',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: timerSeconds <= 2.0 ? '#E98278' : '#5B5CE2',
              fontWeight: 800,
              fontFamily: 'monospace',
            }}
          >
            ⏱ {timerSeconds.toFixed(1)}s
          </span>
          <div
            style={{
              width: '60px',
              height: '6px',
              backgroundColor: '#1C2430',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${timerProgress}%`,
                height: '100%',
                backgroundColor: timerSeconds <= 2.0 ? '#E98278' : '#5B5CE2',
                borderRadius: '999px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Authentic Battle Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#141A22',
          border: '1.5px solid rgba(37, 36, 42, 0.14)',
          borderRadius: '24px',
          padding: '24px 28px',
          boxShadow: '0 6px 0 0 #0D1318, 0 12px 24px rgba(37, 36, 42, 0.06)',
          opacity: cardOpacity,
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Word Info & CEFR Tag */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '8px',
                backgroundColor: '#1C2430',
                border: '1px solid rgba(37, 36, 42, 0.12)',
                fontSize: '11px',
                fontWeight: 800,
                color: '#5B5CE2',
                fontFamily: 'monospace',
              }}
            >
              B2 UPPER
            </span>
            <span style={{ fontSize: '12px', color: '#6E6870', fontWeight: 600 }}>
              Adjective • Contextual Collocation
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
            ● LIVE OPPONENT
          </span>
        </div>

        {/* Target Word & Phonetics */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#EDEBE8', letterSpacing: '-0.5px' }}>
            PRAGMATIC
          </div>
          <div style={{ fontSize: '13px', color: '#6E6870', fontStyle: 'italic' }}>
            /præɡˈmæt.ɪk/
          </div>
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#EDEBE8',
            marginBottom: '18px',
            backgroundColor: '#253040',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(37, 36, 42, 0.08)',
            lineHeight: 1.45,
          }}
        >
          &quot;We need a <strong style={{ color: '#5B5CE2' }}>pragmatic</strong> approach to solve this urgent timeline.&quot;
        </div>

        {/* 4 Tactile Option Choices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Option A: Correct & Pressed */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: isAnswered ? '#ECFDF5' : '#141A22',
              border: isAnswered
                ? '2px solid #10B981'
                : '1.5px solid rgba(37, 36, 42, 0.14)',
              color: isAnswered ? '#065F46' : '#EDEBE8',
              boxShadow: isAnswered
                ? 'none'
                : isOptionPressed
                ? 'none'
                : '0 3.5px 0 0 #0D1318',
              transform: isAnswered || isOptionPressed ? 'translateY(3.5px)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
            }}
          >
            <span>A. เน้นใช้ได้จริง / ปฏิบัติได้</span>
            {isAnswered && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 900,
                }}
              >
                ✓
              </span>
            )}
          </div>

          {/* Option B */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#141A22',
              border: '1.5px solid rgba(37, 36, 42, 0.14)',
              color: isAnswered ? '#8D8790' : '#EDEBE8',
              opacity: isAnswered ? 0.45 : 1,
              boxShadow: isAnswered ? 'none' : '0 3.5px 0 0 #0D1318',
            }}
          >
            B. เพ้อฝันเกินจริง
          </div>

          {/* Option C */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#141A22',
              border: '1.5px solid rgba(37, 36, 42, 0.14)',
              color: isAnswered ? '#8D8790' : '#EDEBE8',
              opacity: isAnswered ? 0.45 : 1,
              boxShadow: isAnswered ? 'none' : '0 3.5px 0 0 #0D1318',
            }}
          >
            C. ซับซ้อนเข้าใจยาก
          </div>

          {/* Option D */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#141A22',
              border: '1.5px solid rgba(37, 36, 42, 0.14)',
              color: isAnswered ? '#8D8790' : '#EDEBE8',
              opacity: isAnswered ? 0.45 : 1,
              boxShadow: isAnswered ? 'none' : '0 3.5px 0 0 #0D1318',
            }}
          >
            D. ลังเลตัดสินใจไม่ได้
          </div>
        </div>

        {/* Victory Tactile Toast Overlay */}
        {frame >= 80 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${rewardScale})`,
              opacity: rewardOpacity,
              backgroundColor: '#141A22',
              border: '2px solid #5B5CE2',
              borderRadius: '22px',
              padding: '18px 32px',
              boxShadow: '0 8px 0 0 #38399E, 0 16px 32px rgba(37, 36, 42, 0.15)',
              textAlign: 'center',
              zIndex: 30,
              minWidth: '280px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#5B5CE2',
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}
            >
              🎉 SPEED VICTORY!
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#10B981',
                margin: '2px 0',
                letterSpacing: '-0.5px',
              }}
            >
              +28 MMR
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#EDEBE8',
                marginTop: '4px',
              }}
            >
              <span style={{ color: '#E5A83B' }}>★ +25 XP</span>
              <span>•</span>
              <span style={{ color: '#E98278' }}>🔥 STREAK x3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
