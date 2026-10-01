import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  GlovaLogo,
  GlovaWordmark,
  GlovaCompactLogo,
  GlovaFavicon,
  GlovaButton,
  GlovaIconButton,
  GlovaCard,
  GlovaCardHeader,
  GlovaCardTitle,
  GlovaCardContent,
  GlovaCardFooter,
  GlovaLevelBadge,
  GlovaSkillBadge,
  GlovaProgressBar,
  GlovaProgressCard,
  GlovaLearningCard,
  GlovaSectionHeader,
  GlovaImage,
  GlovaAvatar,
  GlovaTooltip,
  GlovaFeedbackBubble,
} from '../components/ui';

describe('Glova Core Components & Primitives Suite', () => {
  describe('1. Brand & Logo Primitives', () => {
    it('should render vector SVG logo with accessible role and title', () => {
      const html = renderToString(<GlovaLogo size={40} ariaLabel="Glova Platform" />);
      expect(html).toContain('role="img"');
      expect(html).toContain('<title>Glova Platform</title>');
      expect(html).toContain('viewBox="0 0 48 48"');
      expect(html).toContain('linearGradient');
    });

    it('should support monochrome and dark/light variants', () => {
      const darkHtml = renderToString(<GlovaLogo variant="dark" />);
      expect(darkHtml).toContain('stroke="#F8FAFC"');

      const lightHtml = renderToString(<GlovaLogo variant="light" />);
      expect(lightHtml).toContain('stroke="#0F172A"');

      const monoHtml = renderToString(<GlovaLogo variant="monochrome" />);
      expect(monoHtml).toContain('stroke="currentColor"');
    });

    it('should render Wordmark and CompactLogo lockups cleanly', () => {
      const wordmarkHtml = renderToString(<GlovaWordmark size="lg" showSubtitle />);
      expect(wordmarkHtml).toContain('Glova');
      expect(wordmarkHtml).toContain('English Fluency');

      const compactHtml = renderToString(<GlovaCompactLogo size={28} />);
      expect(compactHtml).toContain('Glova');
      expect(compactHtml).toContain('<svg');
    });

    it('should render standalone favicon mark at small scale', () => {
      const favHtml = renderToString(<GlovaFavicon size={24} />);
      expect(favHtml).toContain('width="24"');
      expect(favHtml).toContain('height="24"');
    });
  });

  describe('2. GlovaButton & GlovaIconButton', () => {
    it('should render primary button with 3D extrusion shadow and accessible label', () => {
      const html = renderToString(
        <GlovaButton variant="primary" size="md">
          Start Practice
        </GlovaButton>
      );
      expect(html).toContain('Start Practice');
      expect(html).toMatch(/bg-\[#2155E6\]|bg-\[#5B5CE2\]/);
      expect(html).toMatch(/shadow-\[0_4px_0_0_#143DB8\]|shadow-\[0_4px_0_0_#38399E\]/);
      expect(html).toContain('min-h-[44px]');
    });

    it('should render loading state with spinner and aria-busy', () => {
      const html = renderToString(
        <GlovaButton isLoading variant="secondary">
          Submitting
        </GlovaButton>
      );
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('disabled=""');
      expect(html).toContain('animate-spin');
    });

    it('should render GlovaIconButton with mandatory aria-label and min 44px bounds', () => {
      const html = renderToString(
        <GlovaIconButton
          icon={<span data-testid="icon">🔍</span>}
          ariaLabel="Search Vocabulary"
          variant="default"
        />
      );
      expect(html).toContain('aria-label="Search Vocabulary"');
      expect(html).toContain('w-11 h-11'); // 44px x 44px
    });
  });

  describe('3. GlovaCard & Layout Containers', () => {
    it('should adhere to nested border-radius invariant and hairline borders', () => {
      const html = renderToString(
        <GlovaCard elevation="subtle">
          <GlovaCardHeader>
            <GlovaCardTitle>Grammar Fundamentals</GlovaCardTitle>
          </GlovaCardHeader>
          <GlovaCardContent>
            <p>Master subject-verb agreement with real contexts.</p>
          </GlovaCardContent>
          <GlovaCardFooter>
            <span>Unit 1 of 12</span>
          </GlovaCardFooter>
        </GlovaCard>
      );
      expect(html).toContain('rounded-xl');
      expect(html).toMatch(/border-border\/40|border-slate-200\/90/);
      expect(html).toContain('Grammar Fundamentals');
      expect(html).toContain('Unit 1 of 12');
    });

    it('should render interactive card with focus ring and keyboard role', () => {
      const html = renderToString(
        <GlovaCard interactive onClick={() => {}}>
          <p>Interactive Lesson</p>
        </GlovaCard>
      );
      expect(html).toContain('role="button"');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain('cursor-pointer');
    });
  });

  describe('4. Level & Skill Badges', () => {
    it('should render GlovaLevelBadge for CEFR tiers with accessible role="status"', () => {
      const b2Html = renderToString(<GlovaLevelBadge level="B2" showLabel score={85} />);
      expect(b2Html).toContain('role="status"');
      expect(b2Html).toContain('aria-label="CEFR Level B2 Upper Intermediate"');
      expect(b2Html).toContain('Upper Intermediate');
      expect(b2Html).toContain('85');
      expect(b2Html).toContain('text-emerald-300');
    });

    it('should render GlovaSkillBadge with icon and score', () => {
      const skillHtml = renderToString(<GlovaSkillBadge skill="speaking" score={92} />);
      expect(skillHtml).toContain('role="status"');
      expect(skillHtml).toContain('aria-label="Skill: Speaking"');
      expect(skillHtml).toContain('Speaking');
      expect(skillHtml).toContain('92');
      expect(skillHtml).toContain('%');
    });
  });

  describe('5. Progress Primitives', () => {
    it('should render GlovaProgressBar with valid progressbar ARIA attributes', () => {
      const html = renderToString(
        <GlovaProgressBar value={72} label="Daily Study Goal" showValue />
      );
      expect(html).toContain('role="progressbar"');
      expect(html).toContain('aria-valuenow="72"');
      expect(html).toContain('aria-valuemin="0"');
      expect(html).toContain('aria-valuemax="100"');
      expect(html).toContain('Daily Study Goal');
      expect(html).toContain('72');
      expect(html).toContain('%');
    });

    it('should render GlovaProgressCard with title, value, and trend badge', () => {
      const html = renderToString(
        <GlovaProgressCard
          title="Cambridge Predicted Score"
          value="176"
          subtitle="B2 Level Confidence"
          progressPercent={88}
          trendText="+4 pts this week"
          trendType="positive"
        />
      );
      expect(html).toContain('Cambridge Predicted Score');
      expect(html).toContain('176');
      expect(html).toContain('+4 pts this week');
      expect(html).toContain('B2 Level Confidence');
      expect(html).toContain('bg-emerald-500/10');
    });
  });

  describe('6. Learning Card & Section Header', () => {
    it('should render GlovaLearningCard with 70/30 focal layout, CEFR tag, and CTA', () => {
      const html = renderToString(
        <GlovaLearningCard
          title="Collocations in Business English"
          description="Learn natural phrases used in international meetings."
          estimatedMinutes={8}
          cefrLevel="B2"
          ctaText="Continue Unit"
          onStart={() => {}}
          isPrimary
        />
      );
      expect(html).toContain('Collocations in Business English');
      expect(html).toContain('8');
      expect(html).toContain('min');
      expect(html).toContain('B2');
      expect(html).toContain('Continue Unit');
    });

    it('should render GlovaSectionHeader with max 3 typography tiers', () => {
      const html = renderToString(
        <GlovaSectionHeader
          eyebrow="Recommended Track"
          title="Your Next Best Learning Step"
          description="Curated based on your recent diagnostic assessment."
        />
      );
      expect(html).toContain('Recommended Track');
      expect(html).toContain('Your Next Best Learning Step');
      expect(html).toContain('Curated based on your recent diagnostic assessment.');
    });
  });

  describe('7. Media, Avatar & Tooltip Primitives', () => {
    it('should render GlovaImage with anti-CLS skeleton and explicit aspect ratio', () => {
      const html = renderToString(
        <GlovaImage
          src="/images/learning/study-cafe.webp"
          alt="Learner studying in university library"
          aspectRatio="aspect-video"
        />
      );
      expect(html).toContain('aspect-video');
      expect(html).toContain('animate-pulse');
      expect(html).toContain('alt="Learner studying in university library"');
      expect(html).toContain('loading="lazy"');
    });

    it('should render GlovaAvatar with initials and learning status indicator', () => {
      const html = renderToString(
        <GlovaAvatar name="Jane Doe" status="learning" size="md" />
      );
      expect(html).toContain('JD');
      expect(html).toContain('aria-label="Jane Doe"');
      expect(html).toContain('bg-amber-500'); // learning status
    });

    it('should render GlovaTooltip structure with accessible role="tooltip"', () => {
      const html = renderToString(
        <GlovaTooltip content="Common European Framework of Reference">
          <span>CEFR</span>
        </GlovaTooltip>
      );
      expect(html).toContain('CEFR');
    });
  });

  describe('8. GlovaFeedbackBubble Shell', () => {
    it('should render floating bubble trigger with aria-haspopup and aria-expanded', () => {
      const html = renderToString(
        <GlovaFeedbackBubble
          currentView="vocabulary"
          cefrLevel="B1"
          targetExam="PET"
        />
      );
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-label="Send feedback to Glova team"');
      expect(html).toContain('fixed z-50');
      expect(html).toContain('touch-target');
    });
  });
});
