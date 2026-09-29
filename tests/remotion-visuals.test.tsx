import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  GrammarTimelineComposition,
  PhoneticStressComposition,
  CefrRevealComposition,
  LandingHeroComposition,
  ListeningWaveformComposition,
  RemotionPlayerWrapper,
} from '../components/remotion';

describe('Remotion Visual & Educational Compositions', () => {
  it('renders GrammarTimelineComposition in static deterministic mode', () => {
    const html = renderToString(
      <GrammarTimelineComposition
        tenseName="Present Perfect Aspect"
        exampleSentence="I have finished my work."
        isStatic={true}
      />
    );
    expect(html).toContain('Present Perfect Aspect');
    expect(html).toContain('I have finished my work.');
    expect(html).toContain('NOW (Present)');
  });

  it('renders PhoneticStressComposition with syllables and primary stress indicators', () => {
    const syllables = [
      { text: 'pho', ipa: 'fə', isStressed: false },
      { text: 'NET', ipa: 'ˈnet', isStressed: true },
      { text: 'ic', ipa: 'ɪk', isStressed: false },
    ];
    const html = renderToString(
      <PhoneticStressComposition
        word="phonetic"
        syllables={syllables}
        cefrLevel="B1"
        isStatic={true}
      />
    );
    expect(html).toContain('NET');
    expect(html).toContain('ˈnet');
    expect(html).toContain('B1');
    expect(html).toContain('Word Stress Pattern');
  });

  it('renders CefrRevealComposition with CEFR score tiers', () => {
    const html = renderToString(
      <CefrRevealComposition
        targetLevel="B2"
        cambridgeScore={164}
        isStatic={true}
      />
    );
    expect(html).toContain('B2');
    expect(html).toContain('CEFR Calibrated Proficiency');
    expect(html).toContain('164');
  });

  it('renders RemotionPlayerWrapper with accessible region and static fallback when SSR rendering', () => {
    const html = renderToString(
      <RemotionPlayerWrapper
        component={GrammarTimelineComposition}
        inputProps={{ tenseName: 'Past Continuous' }}
        durationInFrames={90}
        ariaLabel="Grammar aspect timeline"
      />
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('Grammar aspect timeline');
    expect(html).toContain('Past Continuous');
  });

  it('renders LandingHeroComposition in static mode with CEFR progression', () => {
    const html = renderToString(<LandingHeroComposition isStatic={true} />);
    expect(html).toContain('CEFR PROGRESSION');
    expect(html).toContain('One Small Win Everyday');
    expect(html).toContain('A1');
    expect(html).toContain('C2');
  });

  it('renders ListeningWaveformComposition in static mode', () => {
    const html = renderToString(<ListeningWaveformComposition isPlaying={true} isStatic={true} />);
    expect(html).toBeDefined();
    expect(html).toContain('background-color:#FAF7F2');
  });
});
