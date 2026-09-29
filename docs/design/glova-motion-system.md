# Glova Motion System: Remotion Choreography & Spring Physics

**Document Version:** 2.0.0  
**Phase:** Final Visual Experience Redesign (Remotion + Attention-Friendly)  
**Target:** Remotion 4.0, @remotion/player, Framer Motion v12+, React 18  
**Author:** Principal Interaction Designer & Motion Architect  

---

## 1. Motion Philosophy: Purposeful, Deterministic & Restrained

In Glova, motion is never decorative noise, infinite looping distraction, or gamified pressure. Every movement serves one of four cognitive purposes:
1. **Pedagogical Explanation:** Visualizing abstract linguistic mechanisms (verb tense timelines, phonetic cadence, sentence structure).
2. **Milestone Affirmation:** Providing a calm, dignified sense of accomplishment when mastering a unit or advancing a CEFR level.
3. **Direct Manipulation Feedback:** Instant tactile confirmation when a learner touches, selects, or submits an answer.
4. **Contextual Reorientation:** Guiding the learner's eye naturally to the next recommended action.

---

## 2. Remotion Video Engineering Rules

### 2.1 Deterministic Frame Rendering
- Every visual property in a Remotion composition MUST be strictly derived from `useCurrentFrame()`.
- Non-deterministic sources (`Date.now()`, `Math.random()`, `setTimeout`, `setInterval`) are **strictly prohibited**.
- CSS keyframes, CSS transitions, and Tailwind animation classes (`animate-spin`, `animate-bounce`) are **strictly forbidden** inside Remotion compositions because they fail headless server rendering.

### 2.2 Interpolation & Clamping
- All values animated with `interpolate()` must be clamped:
  `interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`.
- Units across `outputRange` must remain consistent.

### 2.3 Audio & Autoplay Policy
- **Zero Autoplay Audio:** No audio element may autoplay sound. All educational Remotion compositions default to muted/visual-first delivery.

### 2.4 Prefers-Reduced-Motion & SSR Protection
- All Remotion compositions must be wrapped by `RemotionPlayerWrapper`.
- When `prefers-reduced-motion: reduce` is active or during SSR prerendering, the wrapper immediately renders the composition with `isStatic={true}`.
- Fixed container bounding aspect ratios (`16/9`, `4/3`) ensure **0 Cumulative Layout Shift (CLS)**.

---

## 3. Production Remotion Compositions Inventory

| Composition | Path | Target View | Frames / Duration | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `LandingHeroComposition` | `components/remotion/LandingHeroComposition.tsx` | Landing Page Hero | 180 frames (6s) | Visual story: Overwhelmed -> Organized -> Small Win -> Progress -> Milestone |
| `GrammarTimelineComposition` | `components/remotion/GrammarTimelineComposition.tsx` | Grammar View | 90 frames (3s) | Aspect timeline: Past -> Present connection for verb tenses |
| `PhoneticStressComposition` | `components/remotion/PhoneticStressComposition.tsx` | Vocabulary View | 60 frames (2s) | Syllable cadence & primary stress (`ˈ`) pulsation |
| `CefrRevealComposition` | `components/remotion/CefrRevealComposition.tsx` | Assessment View | 90 frames (3s) | Stepped diagnostic reveal (A1 -> C2) with Cambridge scale mapping |
| `ListeningWaveformComposition` | `components/remotion/ListeningWaveformComposition.tsx` | Listening View | 90 frames (3s) | Calm, rhythmic audio waveform visualization during playback |

---

## 4. UI Interaction Spring Physics (Framer Motion)

For lightweight UI feedback outside Remotion:
```typescript
export const MOTION_TOKENS = {
  spring: {
    snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
    gentle: { type: 'spring', stiffness: 300, damping: 25, mass: 1 },
  },
  timing: {
    instant: 0.1,
    standard: 0.2,
  }
} as const;
```

Interactive elements implement `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}` to provide tactile affordance without layout shift.
