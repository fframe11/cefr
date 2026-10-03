'use client';

import React from 'react';
import { useCurrentFrame, interpolate, staticFile, Img } from 'remotion';

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
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0F172A',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <img
          src="/assets/hero-students-study.jpg"
          alt="University students studying English together in modern library"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Gradient Scrim for readable text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 40%, rgba(15, 23, 42, 0.2) 100%)',
          }}
        />

        {/* Top Header Status */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#FFFFFF',
              }}
            >
              REAL-WORLD CEFR IMMERSION
            </span>
          </div>

          <div
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(91, 92, 226, 0.3)',
              border: '1px solid rgba(130, 131, 255, 0.4)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'monospace',
            }}
          >
            CAMBRIDGE & OXFORD
          </div>
        </div>

        {/* Bottom Glass Card */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            padding: '18px 24px',
            borderRadius: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, fontFamily: 'monospace' }}>
              CAMPUS STUDY COLLABORATION
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Real English for University & Professional Life
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Standardized A1–C2 curriculum with contextual real-world scenarios.
            </div>
          </div>

          <div
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              backgroundColor: '#5B5CE2',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 20px rgba(91, 92, 226, 0.4)',
            }}
          >
            <span style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase' }}>Target</span>
            <span>CEFR B2-C1</span>
          </div>
        </div>
      </div>
    );
  }

  const frame = useCurrentFrame();

  // Scene 1: University Students Study Session (Frames 0 - 125)
  // Scene 2: Speaking & Language Lab (Frames 115 - 240)
  const isScene1 = frame < 125;
  const isScene2 = frame >= 115;

  // Scene 1 Ken Burns Zoom and Pan
  const scene1Scale = interpolate(frame, [0, 125], [1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scene1TranslateX = interpolate(frame, [0, 125], [0, -15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scene1Opacity = interpolate(frame, [105, 125], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 2 Ken Burns Zoom and Drift
  const scene2Scale = interpolate(frame, [115, 240], [1.08, 1.01], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scene2TranslateX = interpolate(frame, [115, 240], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scene2Opacity = interpolate(frame, [115, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic Audio Waveform Simulation for Scene 2
  const waveHeights = [12, 24, 38, 18, 28, 42, 20, 32, 16, 26, 36, 14];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ===================================================================== */}
      {/* SCENE 1: CAMPUS STUDY COLLABORATION (REAL STUDENTS)                    */}
      {/* ===================================================================== */}
      {isScene1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: scene1Opacity,
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('assets/hero-students-study.jpg')}
            alt="Real university students engaged in collaborative English study"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${scene1Scale}) translateX(${scene1TranslateX}px)`,
              transformOrigin: 'center center',
            }}
          />

          {/* Cinematic Vignette & Bottom Scrim */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.15) 100%)',
            }}
          />

          {/* Scene 1 Floating Glass HUD Card */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              padding: '16px 22px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(91, 92, 226, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 800, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  STUDIO 01 // COLLABORATIVE STUDY
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
                  • 3,860 OXFORD & CAMBRIDGE TERMS
                </span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Active Recall & Spaced Repetition
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Master authentic university vocabulary with peer challenges and contextual sentences.
              </div>
            </div>

            <div
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(91, 92, 226, 0.35)',
                border: '1px solid rgba(130, 131, 255, 0.5)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '12px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontSize: '10px', color: '#A5A6F6', textTransform: 'uppercase' }}>Proficiency</div>
              <div>CEFR B2+</div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCENE 2: SPEAKING & FLUENCY LABORATORY (REAL STUDENT WITH HEADPHONES)   */}
      {/* ===================================================================== */}
      {isScene2 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: scene2Opacity,
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('assets/hero-speaking-lab.jpg')}
            alt="Real female university student practicing English speaking with podcast microphone"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${scene2Scale}) translateX(${scene2TranslateX}px)`,
              transformOrigin: 'center center',
            }}
          />

          {/* Cinematic Vignette & Bottom Scrim */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.15) 100%)',
            }}
          />

          {/* Scene 2 Floating Glass HUD Card with Animated Acoustic Waveform */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              padding: '16px 22px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 800, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  STUDIO 02 // AI SPEAKING & ACOUSTIC LAB
                </span>
                <span style={{ fontSize: '10px', color: '#FFBA38', fontFamily: 'monospace' }}>
                  • LIVE SPEECH RECOGNITION
                </span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Natural Pronunciation & Stress Calibration
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Real-time feedback on speech rhythm, intonation, and conversation fluency.
              </div>
            </div>

            {/* Dynamic Sound Wave Visualizer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              {waveHeights.map((h, i) => {
                const dynamicHeight = Math.max(
                  6,
                  Math.sin((frame * 0.25) + i * 0.7) * (h * 0.5) + h * 0.5
                );
                return (
                  <div
                    key={i}
                    style={{
                      width: '3.5px',
                      height: `${dynamicHeight}px`,
                      borderRadius: '2px',
                      backgroundColor: i % 2 === 0 ? '#10B981' : '#FFBA38',
                      transition: 'height 0.05s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PERSISTENT TOP HUD BAR                                                */}
      {/* ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#FFFFFF',
            }}
          >
            REAL-WORLD CEFR IMMERSION // {isScene1 ? 'COLLABORATIVE STUDY' : 'SPEAKING LAB'}
          </span>
        </div>

        {/* CEFR Level Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl, idx) => {
            const isHighlighted = isScene1 ? idx <= 3 : idx <= 4;
            return (
              <span
                key={lvl}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isHighlighted ? '#5B5CE2' : 'transparent',
                  color: isHighlighted ? '#FFFFFF' : '#64748B',
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
