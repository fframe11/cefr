'use client';

import React from 'react';
import { useCurrentFrame, interpolate, spring, Sequence } from 'remotion';

export interface GlovaHeroCinematicVideoProps {
  isStatic?: boolean;
}

export const GlovaHeroCinematicVideo: React.FC<GlovaHeroCinematicVideoProps> = ({ isStatic = false }) => {
  if (isStatic) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0B0F17',
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,92,226,0.35), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(16,185,129,0.2), transparent)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 30px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.12em', color: '#A5A6F6' }}>
              GLOVA LINGUISTIC ENGINE // NEURAL DIAGNOSTIC
            </span>
          </div>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontWeight: 700 }}>
            LIVE CALIBRATION
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(28,36,48,0.95), rgba(15,20,28,0.95))',
              border: '1.5px solid rgba(91,92,226,0.5)',
              borderRadius: '24px',
              padding: '24px 32px',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 35px rgba(91,92,226,0.3)',
              width: '100%',
              maxWidth: '520px',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '999px', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', marginBottom: '14px' }}>
              VERIFIED CAMBRIDGE ALIGNMENT
            </div>
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '4px' }}>
              CEFR B2 <span style={{ color: '#5B5CE2', fontSize: '26px' }}>UPPER VANTAGE</span>
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '18px' }}>
              Cambridge English Scale Equivalent: <strong style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: '18px' }}>178</strong> / 190 pts
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>TARGET EXAM</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E8F0' }}>B2 First (FCE)</div>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>NEXT HORIZON</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>C1 Advanced (CAE)</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
            OXFORD & CAMBRIDGE: <strong style={{ color: '#FFFFFF' }}>3,860 TERMS</strong>
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
            CEFR SPECTRUM: <strong style={{ color: '#10B981' }}>A1 - C2 VERIFIED</strong>
          </span>
        </div>
      </div>
    );
  }

  const frame = useCurrentFrame();
  const fps = 30;

  // Background ambient glow pulse
  const bgGlowOpacity = interpolate(
    Math.sin((frame / 30) * Math.PI),
    [-1, 1],
    [0.15, 0.35],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0B0F17',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,92,226,0.35), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(16,185,129,0.2), transparent)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 30px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Perspective Background Grid & Top Ambient Laser */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header HUD Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
            }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.12em', color: '#A5A6F6' }}>
            GLOVA LINGUISTIC ENGINE // NEURAL DIAGNOSTIC
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(91,92,226,0.2)',
              border: '1px solid rgba(91,92,226,0.4)',
              color: '#8283FF',
              fontWeight: 700,
            }}
          >
            4K 60FPS ENGINE
          </span>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.4)',
              color: '#34D399',
              fontWeight: 700,
            }}
          >
            LIVE CALIBRATION
          </span>
        </div>
      </div>

      {/* Center Cinematic Showcase Sections */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Sequence 1: Neural Scanning & Vocabulary Ingestion (Frames 0 - 65) */}
        <Sequence from={0} durationInFrames={65}>
          <SceneNeuralScan frame={frame} fps={fps} />
        </Sequence>

        {/* Sequence 2: 6-Skill Multi-Modal Hexagonal Radar (Frames 65 - 135) */}
        <Sequence from={65} durationInFrames={70}>
          <SceneSkillRadar frame={frame - 65} fps={fps} />
        </Sequence>

        {/* Sequence 3: Official Cambridge CEFR Certification (Frames 135 - 195) */}
        <Sequence from={135} durationInFrames={60}>
          <SceneCambridgeCert frame={frame - 135} fps={fps} />
        </Sequence>

        {/* Sequence 4: Gateway Triumphant Invitation (Frames 195 - 240) */}
        <Sequence from={195} durationInFrames={45}>
          <SceneTriumphantGateway frame={frame - 195} fps={fps} />
        </Sequence>
      </div>

      {/* Bottom Telemetry Floating Badges */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
            OXFORD & CAMBRIDGE: <strong style={{ color: '#FFFFFF' }}>3,860 TERMS</strong>
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
            CEFR SPECTRUM: <strong style={{ color: '#10B981' }}>A1 - C2 VERIFIED</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl, idx) => {
            const activeIdx = Math.floor((frame / 40) % 6);
            const isHighlighted = idx <= activeIdx;
            return (
              <span
                key={lvl}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: isHighlighted ? '#5B5CE2' : 'rgba(255,255,255,0.05)',
                  color: isHighlighted ? '#FFFFFF' : '#64748B',
                  border: isHighlighted ? '1px solid #8283FF' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}
              >
                {lvl}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 1: NEURAL DIAGNOSTIC SCAN (Frames 0 - 65)
// ============================================================================
const SceneNeuralScan: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 10, 55, 65], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rotation = interpolate(frame, [0, 65], [0, 180]);
  const scale = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });

  const words = [
    { word: 'Pragmatic', ipa: '/præɡˈmæt.ɪk/', level: 'B2', score: '+96%' },
    { word: 'Articulate', ipa: '/ɑːˈtɪk.jə.lət/', level: 'C1', score: '+98%' },
    { word: 'Meticulous', ipa: '/məˈtɪk.jə.ləs/', level: 'C1', score: '+94%' },
  ];
  const activeWordIdx = Math.min(words.length - 1, Math.floor(frame / 20));
  const activeWord = words[activeWordIdx];

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        width: '100%',
        maxWidth: '560px',
      }}
    >
      {/* Rotating Radar Rings with Reticle */}
      <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed rgba(91,92,226,0.6)',
            transform: `rotate(${rotation}deg)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '14px',
            borderRadius: '50%',
            border: '1px solid rgba(16,185,129,0.5)',
            transform: `rotate(-${rotation * 1.5}deg)`,
          }}
        />
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(91,92,226,0.25)',
            border: '2px solid #5B5CE2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(91,92,226,0.6)',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace' }}>
            {activeWord.level}
          </span>
        </div>
      </div>

      {/* Floating Lexical Card */}
      <div
        style={{
          background: 'rgba(28, 36, 48, 0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '18px',
          padding: '16px 28px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.4), 0 0 20px rgba(91,92,226,0.2)',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94A3B8', fontWeight: 700 }}>
            NEURAL PHONETIC ANALYSIS
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#10B981', fontWeight: 800 }}>
            {activeWord.score} ACCURACY
          </span>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {activeWord.word}
        </div>
        <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#A5A6F6' }}>
          {activeWord.ipa}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 2: 6-SKILL MULTI-MODAL RADAR (Frames 65 - 135)
// ============================================================================
const SceneSkillRadar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 10, 60, 70], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const expandProgress = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });

  const skills = [
    { name: 'Listening', score: 92, color: '#06B6D4' },
    { name: 'Reading', score: 95, color: '#3B82F6' },
    { name: 'Speaking', score: 91, color: '#10B981' },
    { name: 'Writing', score: 88, color: '#EC4899' },
    { name: 'Grammar', score: 94, color: '#F59E0B' },
    { name: 'Vocabulary', score: 97, color: '#5B5CE2' },
  ];

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '36px',
        width: '100%',
        maxWidth: '680px',
      }}
    >
      {/* Holographic Hexagon Skill Radar */}
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg width="220" height="220" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
          {/* Concentric Hexagons */}
          {[0.3, 0.6, 1].map((scaleFactor, i) => (
            <polygon
              key={i}
              points="100,20 170,60 170,140 100,180 30,140 30,60"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              transform={`scale(${scaleFactor})`}
              transform-origin="100 100"
            />
          ))}

          {/* Dynamic Radar Fill */}
          <polygon
            points={`
              ${100},${100 - 75 * expandProgress * 0.95}
              ${100 + 65 * expandProgress * 0.92},${100 - 38 * expandProgress * 0.92}
              ${100 + 65 * expandProgress * 0.91},${100 + 38 * expandProgress * 0.91}
              ${100},${100 + 75 * expandProgress * 0.88}
              ${100 - 65 * expandProgress * 0.94},${100 + 38 * expandProgress * 0.94}
              ${100 - 65 * expandProgress * 0.97},${100 - 38 * expandProgress * 0.97}
            `}
            fill="rgba(91,92,226,0.35)"
            stroke="#5B5CE2"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 12px rgba(91,92,226,0.8))' }}
          />

          {/* Center Point */}
          <circle cx="100" cy="100" r="4" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Live Metric Telemetry List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#A5A6F6', fontWeight: 800, marginBottom: '4px' }}>
          MULTI-MODAL PROFICIENCY
        </div>
        {skills.map((s, idx) => {
          const barWidth = interpolate(frame, [idx * 6, idx * 6 + 20], [0, s.score], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ color: '#E2E8F0' }}>{s.name}</span>
                <span style={{ color: s.color, fontFamily: 'monospace' }}>{Math.round(barWidth)}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${barWidth}%`, height: '100%', backgroundColor: s.color, borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 3: CAMBRIDGE CERTIFICATION & CEFR CALIBRATION (Frames 135 - 195)
// ============================================================================
const SceneCambridgeCert: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 10, 50, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardY = spring({ frame, fps, config: { damping: 15, stiffness: 180 } });
  const scoreCount = Math.round(interpolate(frame, [5, 40], [130, 178], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - cardY) * 20}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        width: '100%',
        maxWidth: '520px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(28,36,48,0.95), rgba(15,20,28,0.95))',
          border: '1.5px solid rgba(91,92,226,0.5)',
          borderRadius: '24px',
          padding: '24px 32px',
          textAlign: 'center',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 35px rgba(91,92,226,0.3)',
          width: '100%',
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '999px', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', marginBottom: '14px' }}>
          VERIFIED CAMBRIDGE ALIGNMENT
        </div>

        <div style={{ fontSize: '38px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          CEFR B2 <span style={{ color: '#5B5CE2', fontSize: '26px' }}>UPPER VANTAGE</span>
        </div>

        <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '18px' }}>
          Cambridge English Scale Equivalent Score: <strong style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: '18px' }}>{scoreCount}</strong> / 190 pts
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>TARGET EXAM</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E8F0' }}>B2 First (FCE)</div>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>NEXT HORIZON</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>C1 Advanced (CAE)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 4: TRIUMPHANT GATEWAY INVITATION (Frames 195 - 240)
// ============================================================================
const SceneTriumphantGateway: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 8, 38, 45], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '14px',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          backgroundColor: 'rgba(91,92,226,0.2)',
          border: '1.5px solid #5B5CE2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(91,92,226,0.5)',
          fontSize: '24px',
        }}
      >
        ✨
      </div>
      <div style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
        Discover Where You Stand In 3 Minutes
      </div>
      <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', lineHeight: 1.5 }}>
        Real-world scenarios. Standardized Cambridge rubrics. 100% free calibration without upfront registration.
      </div>
    </div>
  );
};
