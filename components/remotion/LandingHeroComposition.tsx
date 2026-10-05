import React from 'react';
import { useCurrentFrame, interpolate, Sequence } from 'remotion';

export interface LandingHeroCompositionProps {
  isStatic?: boolean;
}

export const LandingHeroComposition: React.FC<LandingHeroCompositionProps> = ({ isStatic = false }) => {
  const frame = isStatic ? 165 : useCurrentFrame();

  // Static keyframe fallback: show the triumphant organized journey
  if (isStatic) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FAF7F2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#24233A',
          padding: '24px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: '#FFFDF8',
            border: '1px solid #EDE8DF',
            borderRadius: '20px',
            padding: '24px 32px',
            boxShadow: '0 4px 20px rgba(36, 35, 58, 0.06)',
            textAlign: 'center',
            maxWidth: '460px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: '#E9E5FF',
              color: '#FA5D5D',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            CEFR PROGRESSION
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#24233A', marginBottom: '8px' }}>
            One Small Win Everyday
          </div>
          <div style={{ fontSize: '13px', color: '#77758A', marginBottom: '18px' }}>
            Personalized English journey designed for your pace and focus
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl, i) => (
              <span
                key={lvl}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: i <= 3 ? '#FA5D5D' : '#F4EFEA',
                  color: i <= 3 ? '#FFFFFF' : '#77758A',
                }}
              >
                {lvl}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FAF7F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#24233A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* SCENE 1: The Noise (Frames 0 - 35) - Fragmented scattered study rules */}
      <Sequence from={0} durationInFrames={36}>
        <SceneNoise frame={frame} />
      </Sequence>

      {/* SCENE 2: The Alignment (Frames 36 - 75) - Cards smoothly snap into an elegant path */}
      <Sequence from={36} durationInFrames={40}>
        <SceneAlignment frame={frame - 36} />
      </Sequence>

      {/* SCENE 3: One Small Win (Frames 76 - 115) - A focused bite-sized victory */}
      <Sequence from={76} durationInFrames={40}>
        <SceneSmallWin frame={frame - 76} />
      </Sequence>

      {/* SCENE 4: 6 Skill Harmony (Frames 116 - 150) - All 6 skills lighting up */}
      <Sequence from={116} durationInFrames={35}>
        <SceneSkillHarmony frame={frame - 116} />
      </Sequence>

      {/* SCENE 5: Milestone Celebration (Frames 151 - 180) - Confident achievement */}
      <Sequence from={151} durationInFrames={30}>
        <SceneMilestone frame={frame - 151} />
      </Sequence>
    </div>
  );
};

// Scene 1: Overwhelmed learner with floating jargon
const SceneNoise: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 8, 28, 35], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shiftY = interpolate(frame, [0, 35], [10, -5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${shiftY}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#77758A',
          letterSpacing: '0.05em',
        }}
      >
        BEFORE GLOVA
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#24233A' }}>
        Fragmented rules. Memorization fatigue.
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '340px' }}>
        {['500 Flashcards', 'Past Participles', 'Grammar Tables', 'Word Lists'].map((item, idx) => (
          <div
            key={item}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#F4EFEA',
              border: '1px dashed #EDE8DF',
              fontSize: '12px',
              color: '#77758A',
              transform: `rotate(${idx % 2 === 0 ? '-2deg' : '3deg'})`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

// Scene 2: The Alignment - Cards snap into clear CEFR progression
const SceneAlignment: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 8, 32, 39], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 20], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: '4px 12px',
          borderRadius: '999px',
          backgroundColor: '#E9E5FF',
          color: '#FA5D5D',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        STRUCTURED CALIBRATION
      </div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: '#24233A' }}>
        Your path aligned to CEFR A1 - C2
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((tier, idx) => {
          const itemProgress = interpolate(frame, [idx * 3, idx * 3 + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={tier}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: itemProgress > 0.5 ? '#FA5D5D' : '#FFFDF8',
                color: itemProgress > 0.5 ? '#FFFFFF' : '#77758A',
                border: '1px solid #EDE8DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                transform: `scale(${0.8 + itemProgress * 0.2})`,
              }}
            >
              {tier}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Scene 3: One Small Win - Bite-sized achievability
const SceneSmallWin: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 8, 32, 39], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const barWidth = interpolate(frame, [5, 25], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'center',
        padding: '24px',
        background: '#FFFDF8',
        borderRadius: '18px',
        border: '1px solid #EDE8DF',
        boxShadow: '0 4px 20px rgba(36, 35, 58, 0.05)',
        maxWidth: '360px',
        width: '90%',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#B9E8D3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10B981',
          fontSize: '20px',
          fontWeight: 800,
        }}
      >
        ✓
      </div>
      <div>
        <div style={{ fontSize: '17px', fontWeight: 800, color: '#24233A' }}>
          Today's Small Win Completed
        </div>
        <div style={{ fontSize: '12px', color: '#77758A', marginTop: '2px' }}>
          3 Words in Context + 1 Listening Bite
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          borderRadius: '999px',
          backgroundColor: '#F4EFEA',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: '100%',
            backgroundColor: '#10B981',
            borderRadius: '999px',
          }}
        />
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>
        5 minutes of focused learning
      </div>
    </div>
  );
};

// Scene 4: 6 Skill Harmony
const SceneSkillHarmony: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 8, 28, 34], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const skills = [
    { name: 'Vocabulary', color: '#E9E5FF', text: '#FA5D5D' },
    { name: 'Grammar', color: '#FAF7F2', text: '#FA5D5D' },
    { name: 'Reading', color: '#B9E8D3', text: '#059669' },
    { name: 'Listening', color: '#E0F2FE', text: '#FA5D5D' },
    { name: 'Writing', color: '#FFE4E6', text: '#E11D48' },
    { name: 'Speaking', color: '#FFEDD5', text: '#EA580C' },
  ];

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#77758A', letterSpacing: '0.05em' }}>
        COMPLETE INTEGRATION
      </div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: '#24233A' }}>
        All 6 skills growing together
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        {skills.map((skill, idx) => {
          const itemScale = interpolate(frame, [idx * 3, idx * 3 + 10], [0.85, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={skill.name}
              style={{
                padding: '10px 8px',
                borderRadius: '12px',
                backgroundColor: skill.color,
                color: skill.text,
                fontSize: '11px',
                fontWeight: 700,
                textAlign: 'center',
                transform: `scale(${itemScale})`,
              }}
            >
              {skill.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Scene 5: Milestone Celebration
const SceneMilestone: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow = interpolate(frame, [0, 20], [0, 16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'center',
        padding: '24px 32px',
        background: '#FFFDF8',
        borderRadius: '20px',
        border: '1px solid #EDE8DF',
        boxShadow: `0 8px 30px rgba(91, 92, 226, ${glow * 0.01})`,
        maxWidth: '380px',
        width: '90%',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: '4px 12px',
          borderRadius: '999px',
          backgroundColor: '#F6D978',
          color: '#78350F',
          fontSize: '11px',
          fontWeight: 800,
        }}
      >
        CAMBRIDGE EQUIVALENT
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#FA5D5D' }}>
        B2 First Ready
      </div>
      <div style={{ fontSize: '13px', color: '#77758A', maxWidth: '280px' }}>
        English that feels effortless, natural, and truly yours.
      </div>
    </div>
  );
};
