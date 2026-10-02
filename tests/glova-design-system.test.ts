import { describe, it, expect } from 'vitest';
import {
  GLOVA_PALETTE,
  GLOVA_TYPOGRAPHY,
  GLOVA_SPACING,
  GLOVA_RADII,
  GLOVA_SHADOWS,
  GLOVA_MOTION,
  FEEDBACK_BUBBLE_CONFIG,
  getCefrBadgeStyle,
  calculateContrastRatio,
  CEFRTier,
} from '../lib/design-tokens/tokens';

describe('Glova Design System & Token Foundation', () => {
  describe('1. Semantic Palette & Color Contrast', () => {
    it('should define core jewel-tone brand colors without clichéd tropes', () => {
      expect(GLOVA_PALETTE.brand.indigo).toBe('#6366F1');
      expect(GLOVA_PALETTE.brand.violet).toBe('#8B5CF6');
      expect(GLOVA_PALETTE.brand.sunAmber).toBe('#F59E0B');
    });

    it('should define both dark and light mode surface palettes', () => {
      expect(GLOVA_PALETTE.dark.background).toBe('#090D16');
      expect(GLOVA_PALETTE.dark.card).toBe('#111827');
      expect(GLOVA_PALETTE.light.background).toBe('#F8FAFC');
      expect(GLOVA_PALETTE.light.card).toBe('#FFFFFF');
    });

    it('should satisfy WCAG AAA contrast for dark mode text on card background', () => {
      const contrast = calculateContrastRatio(
        GLOVA_PALETTE.dark.foreground,
        GLOVA_PALETTE.dark.card
      );
      // AAA requires >= 7:1
      expect(contrast).toBeGreaterThanOrEqual(7.0);
    });

    it('should satisfy WCAG AAA contrast for light mode text on card background', () => {
      const contrast = calculateContrastRatio(
        GLOVA_PALETTE.light.foreground,
        GLOVA_PALETTE.light.card
      );
      // AAA requires >= 7:1
      expect(contrast).toBeGreaterThanOrEqual(7.0);
    });

    it('should satisfy WCAG AA contrast (>= 4.5:1) for primary brand indigo on light background', () => {
      const contrast = calculateContrastRatio(
        GLOVA_PALETTE.brand.indigoDark,
        GLOVA_PALETTE.light.background
      );
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('should define all 4 functional semantic statuses', () => {
      expect(GLOVA_PALETTE.semantic.success).toBe('#10B981');
      expect(GLOVA_PALETTE.semantic.warning).toBe('#F59E0B');
      expect(GLOVA_PALETTE.semantic.danger).toBe('#F43F5E');
      expect(GLOVA_PALETTE.semantic.info).toBe('#0EA5E9');
    });
  });

  describe('2. CEFR Tier Tokens & Style Resolver', () => {
    const tiers: CEFRTier[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    it('should contain full definitions for all 6 CEFR tiers', () => {
      tiers.forEach((tier) => {
        const badge = GLOVA_PALETTE.cefrTiers[tier];
        expect(badge).toBeDefined();
        expect(badge.tier).toBe(tier);
        expect(badge.label).toBeTypeOf('string');
        expect(badge.bgClass).toBeTypeOf('string');
        expect(badge.textClass).toBeTypeOf('string');
      });
    });

    it('should resolve styling dynamically via getCefrBadgeStyle', () => {
      const b2Style = getCefrBadgeStyle('B2');
      expect(b2Style.tier).toBe('B2');
      expect(b2Style.label).toBe('Upper Intermediate');
      expect(b2Style.hex).toBe('#34D399');

      // Fallback test
      // @ts-expect-error test fallback for unknown tier
      const fallback = getCefrBadgeStyle('UNKNOWN');
      expect(fallback.tier).toBe('A1');
    });
  });

  describe('3. Typography Discipline & Viewport Rules', () => {
    it('should strictly limit viewport font scales to a maximum of 3 tiers', () => {
      const tiers = Object.keys(GLOVA_TYPOGRAPHY.scaleTiers);
      expect(tiers.length).toBe(3);
      expect(GLOVA_TYPOGRAPHY.maxScaleTiersPerViewport).toBe(3);
    });

    it('should provide desktop and mobile classes with generous line heights', () => {
      const focal = GLOVA_TYPOGRAPHY.scaleTiers.tier1_focal;
      expect(focal.desktopClass).toContain('text-2xl');
      expect(focal.mobileClass).toContain('text-xl');

      const body = GLOVA_TYPOGRAPHY.scaleTiers.tier3_body;
      expect(body.desktopClass).toContain('text-sm');
      expect(body.mobileClass).toContain('text-xs');
      expect(parseFloat(body.lineHeight)).toBeGreaterThanOrEqual(1.4);
    });
  });

  describe('4. Spatial Rhythm & Nested Border-Radius Invariant', () => {
    it('should support the 60-30-10 variable spacing rhythm', () => {
      expect(GLOVA_SPACING.generous).toBe('2rem');
      expect(GLOVA_SPACING.medium).toBe('1rem');
      expect(GLOVA_SPACING.tight).toBe('0.5rem');
      expect(GLOVA_SPACING.rule).toBe('60-30-10 Spatial Rhythm');
    });

    it('should uphold the nested border-radius invariant (inner < outer)', () => {
      const outerNum = parseFloat(GLOVA_RADII.outerCard);
      const innerNum = parseFloat(GLOVA_RADII.innerElement);
      expect(innerNum).toBeLessThan(outerNum);
    });

    it('should cap shadows to restrained elevations avoiding ungrounded blur slop', () => {
      expect(GLOVA_SHADOWS.subtle).toContain('0 2px 8px');
    });
  });

  describe('5. Physics-Based Motion Tokens', () => {
    it('should define spring physics configurations with zero artificial lag', () => {
      expect(GLOVA_MOTION.spring.snappy.stiffness).toBe(400);
      expect(GLOVA_MOTION.spring.snappy.damping).toBe(30);

      expect(GLOVA_MOTION.spring.gentle.stiffness).toBe(300);
      expect(GLOVA_MOTION.spring.gentle.damping).toBe(25);
    });

    it('should specify 1.02 hover and 0.98 tap micro-interaction scales', () => {
      expect(GLOVA_MOTION.microInteractions.buttonHover.scale).toBe(1.02);
      expect(GLOVA_MOTION.microInteractions.buttonTap.scale).toBe(0.98);
      expect(GLOVA_MOTION.microInteractions.floatingBubbleHover.scale).toBe(1.08);
    });
  });

  describe('6. Feedback Bubble Specification & Client Config', () => {
    it('should include 4 exhaustive non-overlapping feedback categories', () => {
      const categories = FEEDBACK_BUBBLE_CONFIG.categories.map((c) => c.id);
      expect(categories).toEqual(['CONTENT_ERROR', 'BUG', 'SUGGESTION', 'PRAISE']);
    });

    it('should provide localized Thai and English labels for each category', () => {
      FEEDBACK_BUBBLE_CONFIG.categories.forEach((cat) => {
        expect(cat.labelTh).toBeTypeOf('string');
        expect(cat.labelEn).toBeTypeOf('string');
        expect(cat.labelTh.length).toBeGreaterThan(0);
        expect(cat.labelEn.length).toBeGreaterThan(0);
      });
    });

    it('should enforce reasonable character bounds for learner submissions', () => {
      expect(FEEDBACK_BUBBLE_CONFIG.minMessageLength).toBe(3);
      expect(FEEDBACK_BUBBLE_CONFIG.maxMessageLength).toBe(1000);
    });

    it('should ensure touch target geometry conforms to >= 44px touch-target rule', () => {
      const desktopSize = parseInt(FEEDBACK_BUBBLE_CONFIG.desktopBounds.size, 10);
      const mobileSize = parseInt(FEEDBACK_BUBBLE_CONFIG.mobileBounds.size, 10);
      expect(desktopSize).toBeGreaterThanOrEqual(44);
      expect(mobileSize).toBeGreaterThanOrEqual(44);
    });
  });

  describe('7. Tri-Hybrid (Terraria x Valorant x Duolingo) & 5 Vibe-Coder Sites Registry', () => {
    it('should include all 5 mandated Vibe-Coder reference sites', async () => {
      const { VIBE_CODER_SOURCES } = await import('../components/ui/GlovaPrimitives');
      expect(VIBE_CODER_SOURCES).toHaveLength(5);
      const urls = VIBE_CODER_SOURCES.map((s) => s.url);
      expect(urls).toContain('https://21st.dev/');
      expect(urls).toContain('https://godly.design/website/melius/');
      expect(urls).toContain('https://ui.aceternity.com/');
      expect(urls).toContain('https://uiverse.io/');
      expect(urls).toContain('https://reactbits.dev/');
    }, 30000);

    it('should export 21st.dev BorderBeam component with customizable parameters', async () => {
      const { BorderBeam } = await import('../components/ui/GlovaPrimitives');
      expect(BorderBeam).toBeDefined();
      expect(typeof BorderBeam).toBe('function');
    });
  });
});
