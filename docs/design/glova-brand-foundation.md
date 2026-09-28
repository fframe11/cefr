# Glova Brand Foundation & Visual Identity

**Document Version:** 1.0.0  
**Phase:** 6.3.1 — Foundation Only  
**Brand:** Glova  
**Author:** Principal Brand & Design Systems Architect  

---

## 1. Brand Essence & Mission

### 1.1 The Name: Glova
*Glova* merges the evocative roots of **Glow** (illumination, warmth, uncovering hidden potential) and **Nova** (new energy, sudden brightness, celestial discovery). It signifies the moment an English learner transitions from hesitant word-by-word translation to radiant, confident, autonomous communication.

### 1.2 Mission Statement
> "To provide an emotionally safe, intellectually empowering, and cognitively effortless English learning space where every learner discovers their authentic global voice."

### 1.3 Target Audience & Modern Inclusivity Ethos
- **Primary Audience:** Gen Z and young millennial learners (ages 18–32), college students, career starters, and adult lifelong learners preparing for CEFR (A1–C2), IELTS, TOEIC, and Cambridge examinations.
- **Inclusive Design Invariant (Women, LGBTQ+, and All Learners):**
  - **No Gendered Tropes:** We explicitly reject patronizing design shortcuts: no saccharine baby pastels, no clichéd hot pink accents, no superficial rainbow novelty badges, and no patronizing "girl boss" or overly playful infantilizing cartoons.
  - **Substantive Inclusivity:** True inclusivity is achieved through **dignified ergonomics, accessible contrast, emotional psychological safety, diverse and authentic editorial photography, and gender-neutral microcopy**.
  - **Universal Appeal:** The interface feels vibrant, sophisticated, and contemporary — equally respected and embraced by men, women, non-binary individuals, and LGBTQ+ learners across Southeast Asia and globally.

---

## 2. Brand Personality & Voice Attributes

| Attribute | What We Are | What We Are Never |
| :--- | :--- | :--- |
| **Warm & Welcoming** | Encouraging, calm, approachable, and respectful of learner time. | Saccharine, condescending, frantic, or overly casual. |
| **Intellectually Clear** | Grounded in Cambridge/CEFR standards, structured, logical, and actionable. | Academic jargon heavy, pedantic, rigid, or punishing. |
| **Vibrant & Energetic** | Clean typography, subtle physics-based spring motions, and radiant jewel-tone accents. | AI-slop neon gradients, sensory-overload confetti loops, or casino-style gamification. |
| **Empowering & Safe** | Focused on continuous mastery, celebrating daily micro-wins, and reframing errors as discovery. | Deficit-focused, anxiety-inducing (e.g. "You failed today's goal"), or shaming streaks. |

---

## 3. Brand Tone of Voice

1. **Lead with Direct Value:**  
   - *Instead of:* "Welcome back! Are you ready to crush your English learning goals today?"  
   - *We say:* "Welcome back, Alex. Unit 4: Natural Workplace Collocations is ready (8 min)."
2. **Normalize Mistakes as Natural Acquisition:**  
   - *Instead of:* "Wrong Answer! You lost 1 heart."  
   - *We say:* "Close match! 'Discuss about' is a common reflex, but 'discuss' takes a direct object: *Let's discuss the project.*"
3. **No Dual-Language Parentheses:**  
   - Viewport text is strictly localized based on active language setting. Zero robotic strings like `คำศัพท์ (Vocabulary)`.

---

## 4. Logo Mark Concept & Vector Geometry

### 4.1 Concept: The Radiant Prism ("The Open Spark")
The Glova mark represents an open geometric arc interlocking with an upward-pointing spark:
- The **outer fluid loop** represents the continuous journey of language learning, conversational dialogue, and forward momentum.
- The **inner radiant spark** represents clarity, intellectual awakening, and finding one's authentic voice.

```
       .---.
     /       \       * (The Inner Spark: Clarity & Insight)
    |         |
    |    *    |
     \       /
      '---\ \        (The Open Loop: Growth & Flow)
           \ \
            '--'
```

### 4.2 Standalone SVG Specifications (ViewBox: 0 0 48 48)

```xml
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Glova Logo">
  <!-- Soft Ambient Glow Filter -->
  <defs>
    <linearGradient id="glova-radiant" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366F1" /> <!-- Vibrant Indigo -->
      <stop offset="50%" stop-color="#8B5CF6" /> <!-- Electric Violet -->
      <stop offset="100%" stop-color="#F59E0B" /> <!-- Warm Sun Amber -->
    </linearGradient>
    <linearGradient id="glova-spark" x1="20" y1="12" x2="32" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F43F5E" />
    </linearGradient>
  </defs>

  <!-- Continuous Growth Arc (Outer Loop) -->
  <path 
    d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C30.4285 42 36.0887 38.6293 39.2942 33.5682C39.9866 32.4754 39.4215 31.0267 38.1631 30.7121C36.9048 30.3976 35.6322 31.3853 34.9398 32.4781C32.4208 36.4552 27.9715 38.8 24 38.8C15.826 38.8 9.2 32.174 9.2 24C9.2 15.826 15.826 9.2 24 9.2C32.174 9.2 38.8 15.826 38.8 24V26C38.8 27.7673 37.3673 29.2 35.6 29.2C33.8327 29.2 32.4 27.7673 32.4 26V24C32.4 19.361 28.639 15.6 24 15.6C19.361 15.6 15.6 19.361 15.6 24C15.6 28.639 19.361 32.4 24 32.4C26.3195 32.4 28.4144 31.4586 29.9197 29.9372" 
    stroke="url(#glova-radiant)" 
    stroke-width="3.2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  />

  <!-- The Radiance Spark (Central Luminescence) -->
  <path 
    d="M24 18.5V21.5M24 26.5V29.5M18.5 24H21.5M26.5 24H29.5" 
    stroke="url(#glova-spark)" 
    stroke-width="2.5" 
    stroke-linecap="round"
  />
  <circle cx="24" cy="24" r="1.5" fill="#FBBF24" />
</svg>
```

### 4.3 Colorway Applications

1. **Primary Radiant (Digital App & Web Hero):**
   - Gradients: Indigo-600 (`#4F46E5`) -> Violet-500 (`#8B5CF6`) with Sun Amber (`#F59E0B`) spark.
   - Backgrounds: Dark slate surface (`#0F172A`) or clean light canvas (`#FAFAFA`).
2. **Monochrome Dark Mode (High Restraint):**
   - Stroke: `#F8FAFC` (Slate-50, 95% opacity).
   - Spark: Subtle luminous gold (`#FDE68A`).
3. **Monochrome Light Mode (Print & High Contrast):**
   - Stroke: `#0F172A` (Slate-900).
   - Spark: `#D97706` (Amber-600).

### 4.4 Clearspace and Scaling Constraints
- **Clear Space:** Minimum bounding exclusion zone equal to `x` (where `x = 25% of mark width`).
- **Minimum Digital Height:**
  - Standalone Favicon/Icon: 24px x 24px (optimized path simplification without internal crosshair).
  - Full Logotype + Wordmark: 32px height (web navigation).
- **Prohibited Modifications:**
  - Never distort, stretch, or rotate the mark off-axis.
  - Never place the mark on busy photographic backgrounds without an optical dark/light scrim.
  - Never enclose the mark in clichéd glossy 3D app bubbles.
