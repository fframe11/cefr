# Glova Design System: Tokens, Components & Ergonomics

**Document Version:** 1.0.0  
**Phase:** 6.3.1 — Foundation Only  
**Target:** Web (Next.js 15, React 18, Tailwind CSS 3.4)  
**Author:** Principal Frontend Architect & Design Systems Lead  

---

## 1. Design Token Architecture

The Glova design system bridges Tailwind CSS utility ergonomics with CSS custom properties and a typed TypeScript token registry located at `@/lib/design-tokens/tokens`.

### 1.1 Semantic Color System

Our palette replaces generic sterile slate with warm, radiant jewel tones that feel welcoming to Gen Z learners across all backgrounds without relying on gendered clichés.

```
+---------------------------------------------------------------------------------------+
|  PALETTE ROLES                                                                        |
+---------------------------------------------------------------------------------------+
|  Primary (Brand Radiant):    Indigo 600 (#4F46E5) -> Violet 500 (#8B5CF6)             |
|  Accent (Warm Glow):         Sun Amber 500 (#F59E0B)                                  |
|  Semantic Success:           Emerald 500 (#10B981) [Tint: rgba(16, 185, 129, 0.12)]   |
|  Semantic Warning:           Amber 500 (#F59E0B)   [Tint: rgba(245, 158, 11, 0.12)]   |
|  Semantic Danger:            Rose 500 (#F43F5E)    [Tint: rgba(244, 63, 94, 0.12)]    |
|  Semantic Info / CEFR:       Sky 500 (#0EA5E9)     [Tint: rgba(14, 165, 233, 0.12)]   |
+---------------------------------------------------------------------------------------+
```

#### Dual-Mode Palette Specifications

| Token Name | Dark Mode (Default) | Light Mode | WCAG Contrast Ratio | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `background` | `#090D16` (Deep Obsidian Indigo) | `#F8FAFC` (Crisp Alabaster) | N/A (Canvas) | Base application canvas |
| `surface-card` | `#111827` (Card Surface) | `#FFFFFF` (Pure Card) | > 10:1 vs text | Primary content cards |
| `surface-subtle` | `#1F2937` (Sub-container) | `#F1F5F9` (Muted Slate) | > 8:1 vs text | Inner card blocks, tables |
| `foreground` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | **15.8:1** (AAA) | High-emphasis body & headers |
| `foreground-muted` | `#94A3B8` (Slate 400) | `#64748B` (Slate 500) | **5.2:1** (AA) | Secondary metadata, labels |
| `primary` | `#6366F1` (Indigo 500) | `#4F46E5` (Indigo 600) | **6.4:1** (AA) | Primary buttons, active tabs |
| `primary-glow` | `rgba(99, 102, 241, 0.25)` | `rgba(79, 70, 229, 0.15)` | N/A | Ambient focus rings |
| `accent-sun` | `#F59E0B` (Amber 500) | `#D97706` (Amber 600) | **5.1:1** (AA) | Streaks, achievements, glow |
| `border-hairline` | `rgba(255, 255, 255, 0.08)`| `rgba(15, 23, 42, 0.08)` | N/A | High-density internal borders |

---

## 2. Typography Discipline & Visual Hierarchy

To prevent visual exhaustion during focused study sessions, Glova strictly limits every screen to **a maximum of 3 font scale tiers per viewport**.

### 2.1 The 3-Tier Viewport Hierarchy

| Scale Tier | Desktop Token | Mobile Token | Weight | Line Height | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Page Focal** | `text-2xl` (24px) / `text-3xl` | `text-xl` (20px) | `font-bold` (700) | 1.25 | Primary View Title, Milestone |
| **Tier 2: Section / Card** | `text-base` (16px) | `text-sm` (14px) | `font-semibold` (600)| 1.4 | Card headers, exercise questions |
| **Tier 3: Body & Meta** | `text-sm` (14px) | `text-xs` (12px) | `font-normal` (400) | 1.5 | Explanations, microcopy, tags |

### 2.2 Typography Invariants
- **Primary Typeface:** `'Plus Jakarta Sans'`, `'Noto Sans Thai'`, sans-serif.
- **Microcopy Ban:** 0 em-dashes (`—`) or en-dashes (`–`) in visible UI labels.
- **Button Labels:** Maximum 1–3 words per button. Never use sentence-length button text.

---

## 3. Spatial Rhythm & Layout Composition (The 60-30-10 Rule)

Monotonous padding (`p-4` applied identically everywhere) induces cognitive flatness. Glova uses intentional variable spacing:

```
[ Variable Spatial Grouping ]

+---------------------------------------------------------------+
| Major View Section Container (Margin / Gap: 32px [gap-8])     |
|                                                               |
|  +---------------------------------------------------------+  |
|  | Component Block (Padding: 20px [p-5], Gap: 16px [gap-4])|  |
|  |                                                         |  |
|  |   +-----------------------+  +-----------------------+  |  |
|  |   | Card Element (p-3)    |  | Card Element (p-3)    |  |  |
|  |   | [Icon] Title (gap-2)  |  | [Icon] Title (gap-2)  |  |  |
|  |   +-----------------------+  +-----------------------+  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

- **Generous Spacing (60% of layout rhythm):** `gap-8` to `gap-12` (32px–48px) separating major functional horizons (e.g. Navigation from Hero, Hero from Curriculum Grid).
- **Medium Spacing (30% of rhythm):** `gap-4` to `gap-5` (16px–20px) between sibling cards or form groups.
- **Tight Micro Spacing (10% of rhythm):** `gap-1.5` to `gap-2` (6px–8px) linking icons to labels, or badges to headings.

### 3.1 Nested Border-Radius Invariant
To ensure organic visual harmony:
- **Outer Shell / Card:** `rounded-xl` (12px) or `rounded-2xl` (16px).
- **Inner Interactive Element (Button, Input):** `rounded-md` (6px) or `rounded-lg` (8px).
- **Status Pills & Micro Badges:** `rounded-full` (9999px).
- *Strict Rule:* An inner element must never have a larger corner radius than its enclosing card.

---

## 4. Component Design Contracts

### 4.1 Button Contract (`GlovaButton`)
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```
- **Primary:** Radiant gradient background (`bg-gradient-to-r from-indigo-600 to-violet-600`), text white, `shadow-sm`, subtle ring on focus (`focus-visible:ring-2 focus-visible:ring-indigo-500/40`).
- **Touch Target:** Minimum 44px x 44px (`min-h-[44px]`).
- **Micro-Interaction:** `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}`.

### 4.2 Level Badge Contract (`GlovaLevelBadge`)
```typescript
type CEFRTier = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface LevelBadgeProps {
  level: CEFRTier;
  isActive?: boolean;
  isUnlocked?: boolean;
  score?: number;
}
```
- **Tier Color Mapping:**
  - `A1-A2` (Foundation): Soft Cyan / Sky (`bg-sky-500/10 text-sky-400 border-sky-500/20`)
  - `B1-B2` (Independent): Vibrant Emerald (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`)
  - `C1-C2` (Mastery): Radiant Violet / Amber (`bg-violet-500/10 text-violet-400 border-violet-500/20`)

### 4.3 Streak Counter (`GlovaStreakCounter`)
- Flame icon with radial warm sun amber glow (`#F59E0B`).
- Micro-pulse animation upon completing the daily study milestone.
- Displays consecutive active days with supportive copy (e.g., "5 วันต่อเนื่อง — เริ่มติดลมแล้ว!").

### 4.4 Primary Next Best Action Card (The 70/30 Focal Solution)
Instead of 7 competing equal-weight buttons, the home view renders:
- **70% Focal Canvas:** "Today's Recommended Focus" featuring current skill, lesson title, estimated time (e.g., "7 นาที"), and a prominent single CTA button ("เริ่มฝึกทันที").
- **30% Secondary Shelf:** Compact, clean grid of other learning tracks (Listening, Reading, Speaking, Writing, Grammar, Vocabulary) with clear progress percentages.
