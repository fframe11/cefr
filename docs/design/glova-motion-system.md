# Glova Motion System: Physics, Choreography & Ergonomics

**Document Version:** 1.0.0  
**Phase:** 6.3.1 — Foundation Only  
**Target:** Framer Motion / Motion v12+, React 18, Tailwind CSS  
**Author:** Principal Interaction Designer & Motion Architect  

---

## 1. Motion Philosophy: Purposeful, Fluid & Restrained

In Glova, motion is never decorative noise or gamified distraction. Every movement serves one of three cognitive purposes:
1. **Direct Manipulation Feedback:** Instant tactile confirmation when a learner touches, clicks, or submits an answer.
2. **Contextual Orientation:** Guiding the learner's eye naturally from current progress to the next recommended action without visual disorientation.
3. **Celebratory Affirmation:** Providing a warm, dignified sense of accomplishment when mastering a difficult concept or advancing a CEFR tier.

---

## 2. Standard Spring Physics Tokens

We standardize on deterministic spring physics rather than arbitrary linear CSS easing curves. Springs adjust naturally across screen densities and gesture velocities.

```typescript
// Standard Spring Physics Preset (exported from @/lib/design-tokens/tokens)
export const MOTION_TOKENS = {
  spring: {
    // Interactive controls: Fast, crisp, zero overshoot
    snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
    
    // Cards, modals & panels: Smooth, natural deceleration
    gentle: { type: 'spring', stiffness: 300, damping: 25, mass: 1 },
    
    // Floating bubble & celebratory icons: Slight playful resonance
    bouncy: { type: 'spring', stiffness: 350, damping: 20, mass: 1.1 },
  },
  timing: {
    instant: 0.1,    // 100ms: micro-interactions, tooltips
    standard: 0.2,   // 200ms: hover, focus rings
    extended: 0.35,  // 350ms: sheet transitions, panel disclosure
  }
} as const;
```

---

## 3. Micro-Interaction Invariants

### 3.1 Interactive Buttons & Action Tiles
All interactive buttons, chips, and learning cards must implement subtle physical feedback:
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={MOTION_TOKENS.spring.snappy}
  className="..."
>
  {children}
</motion.button>
```
*Rationale:* `1.02` provides perceptible desktop confirmation without causing pixel overflow or layout shift. `0.98` delivers crisp tactile compression on mobile touch devices.

### 3.2 Focus Rings & Hover Lighting
- Instead of high-contrast solid borders that pop abruptly, interactive cards use smooth opacity transitions on ambient glow rings:
  ```css
  /* Ambient card hover glow */
  .glova-card-interactive {
    transition: box-shadow 200ms ease, border-color 200ms ease;
  }
  .glova-card-interactive:hover {
    box-shadow: 0 4px 20px -2px rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.3);
  }
  ```

---

## 4. Learning Flow Choreographies

### 4.1 Staggered Section Reveals
When switching views (e.g. from Dashboard to Practice or Assessment), elements reveal in an orchestrated cascade to minimize visual scanning chaos:

```typescript
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: MOTION_TOKENS.spring.gentle 
  },
};
```
*Discipline:* Notice `y: 8px` max offset. Never use dramatic 40px–100px slides that disorient learners reading dense text.

### 4.2 Level-Up Milestone & Streak Celebration
When completing a CEFR milestone or extending a 7-day streak:
- **Particle Restraint:** Use `canvas-confetti` with a controlled, elegant burst:
  - Particle count capped at `40` (never 200+).
  - Palette restricted to Glova jewel tones: Amber (`#F59E0B`), Indigo (`#6366F1`), Emerald (`#10B981`).
  - Duration capped at `1200ms`.
- **Streak Flame Ignition:** Subtle breathing pulse:
  ```tsx
  <motion.div
    animate={{ scale: [1, 1.08, 1] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
  >
    <Flame className="w-5 h-5 text-amber-500" />
  </motion.div>
  ```

---

## 5. Feedback Bubble Motion Choreography

The persistent floating feedback bubble is docked in the bottom-right corner:
- **Resting State:** Subtle ambient breathing glow (`ring-1 ring-primary/20`).
- **Hover State:** `whileHover={{ scale: 1.08, rotate: 2 }}`.
- **Drawer / Dialog Open:**
  ```tsx
  <AnimatePresence mode="wait">
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={MOTION_TOKENS.spring.gentle}
        style={{ transformOrigin: 'bottom right' }}
      >
        <FeedbackModalContent />
      </motion.div>
    )}
  </AnimatePresence>
  ```

---

## 6. Accessibility & Reduced Motion Invariants

Learners with vestibular disorders or ADHD can be easily nauseated or distracted by continuous motion.

### 6.1 Strict Reduced Motion Fallback
```tsx
import { useReducedMotion } from 'framer-motion';

export function useGlovaMotion() {
  const shouldReduceMotion = useReducedMotion();

  return {
    shouldReduceMotion,
    cardHover: shouldReduceMotion ? {} : { scale: 1.02 },
    buttonTap: shouldReduceMotion ? {} : { scale: 0.98 },
    fadeTransition: shouldReduceMotion 
      ? { duration: 0.01 } 
      : MOTION_TOKENS.spring.gentle,
  };
}
```
*Rule:* Whenever `prefers-reduced-motion: reduce` is detected by the browser:
1. All physical translations (`y`, `x`, `scale`, `rotate`) are **disabled**.
2. Transitions fall back to simple, subtle opacity fades (`opacity: 0 -> 1` over 150ms).
3. Continuous particle loops or confetti bursts are suppressed entirely.
