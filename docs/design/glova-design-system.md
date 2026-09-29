# Glova Design System: Tokens, Components & Ergonomics

**Document Version:** 2.0.0  
**Phase:** Final Visual Experience Redesign (Gen Z Women + Attention-Friendly + Light Editorial)  
**Target:** Web (Next.js 15, React 18, Tailwind CSS, Remotion)  
**Author:** Principal Frontend Architect & Design Systems Lead  

---

## 1. Design Token Architecture & Color System

The Glova design system bridges Tailwind CSS utility ergonomics with CSS custom properties and a typed TypeScript token registry located at `@/lib/design-tokens/tokens`.

### 1.1 Light Mode First Editorial Palette

Our palette transitions Glova away from dark, sterile dashboard aesthetics toward a **Warm Ivory and Light Editorial** experience that feels like a premium lifestyle magazine combined with an emotionally calm learning ritual.

```
+---------------------------------------------------------------------------------------+
|  GLOVA LIGHT EDITORIAL PALETTE                                                        |
+---------------------------------------------------------------------------------------+
|  Base Canvas (Warm Ivory / Soft Cream):  #FAF7F2  (hsl: 38 38% 96.5%)                 |
|  Card Surface (Warm Pure White):         #FFFDF8  (hsl: 43 100% 98.8%)                |
|  Card Subtle (Soft Muted Cream):         #F4EFEA  (hsl: 38 25% 94%)                   |
|  Primary Brand (Glova Indigo):           #5B5CE2  (hsl: 240 72% 62%)                  |
|  Primary Text (Deep Ink):                #24233A  (hsl: 243 25% 18%)                  |
|  Secondary Text (Muted Plum / Slate):    #77758A  (hsl: 246 8% 50%)                   |
|  Hairline Border (Warm Sand Tint):       #EDE8DF  (hsl: 38 20% 90%)                   |
+---------------------------------------------------------------------------------------+
|  PURPOSE-DRIVEN FUNCTIONAL ACCENTS (<= 10% Viewport Area)                              |
+---------------------------------------------------------------------------------------+
|  Accent 1 (Vocabulary / Focus):          Soft Lavender  #E9E5FF  (hsl: 249 100% 95%)  |
|  Accent 2 (Speaking / Energy):           Warm Coral     #FF8F82  (hsl: 6 100% 75%)    |
|  Accent 3 (Milestones / Glow):           Butter Yellow  #F6D978  (hsl: 46 87% 72%)    |
|  Accent 4 (Reading / Calm):              Soft Mint      #B9E8D3  (hsl: 153 50% 82%)   |
|  Semantic Success:                       Emerald Green  #10B981  (Tint: rgba(16, 185, 129, 0.12)) |
|  Semantic Warning:                       Warm Amber     #F59E0B  (Tint: rgba(245, 158, 11, 0.12)) |
|  Semantic Danger:                        Warm Red       #EF4444  (Tint: rgba(239, 68, 68, 0.12))  |
|  Semantic Info / CEFR:                   Sky 500        #0EA5E9  (Tint: rgba(14, 165, 233, 0.12)) |
+---------------------------------------------------------------------------------------+
```

#### Dual-Mode Palette Specifications

| Token Name | Light Mode (Default) | Dark Mode (Accessible Alternative) | Contrast vs Card | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `background` | `#FAF7F2` (Warm Ivory) | `#090D16` (Deep Obsidian Indigo) | N/A (Canvas) | Base application canvas |
| `surface-card` | `#FFFDF8` (Warm Pure White) | `#111827` (Card Surface) | > 10:1 vs text | Primary content cards |
| `surface-subtle` | `#F4EFEA` (Muted Cream) | `#1F2937` (Sub-container) | > 8:1 vs text | Inner card blocks, tables |
| `foreground` | `#24233A` (Deep Ink) | `#F8FAFC` (Slate 50) | **14.2:1** (AAA) | High-emphasis body & headers |
| `foreground-muted` | `#77758A` (Muted Plum) | `#94A3B8` (Slate 400) | **5.3:1** (AA) | Secondary metadata, labels |
| `primary` | `#5B5CE2` (Glova Indigo) | `#6366F1` (Indigo 500) | **5.8:1** (AA) | Primary buttons, active tabs |
| `border-hairline` | `#EDE8DF` (Warm Sand) | `rgba(255, 255, 255, 0.08)` | N/A | High-density internal borders |

---

## 2. Typography Discipline & Editorial Visual Hierarchy

To prevent visual exhaustion during focused study sessions, Glova strictly limits every screen to **a maximum of 3 font scale tiers per viewport**.

### 2.1 The 3-Tier Viewport Hierarchy

| Scale Tier | Desktop Token | Mobile Token | Weight | Line Height | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Page Focal** | `text-2xl` (24px) / `text-3xl` | `text-xl` (20px) | `font-bold` (700) | 1.25 | Primary View Title, Milestone |
| **Tier 2: Section / Card** | `text-base` (16px) | `text-sm` (14px) | `font-semibold` (600)| 1.4 | Card headers, exercise questions |
| **Tier 3: Body & Meta** | `text-sm` (14px) | `text-xs` (12px) | `font-normal` (400) | 1.5 | Explanations, microcopy, tags |

### 2.2 Typography Invariants
- **Primary Typefaces:** `'Plus Jakarta Sans'`, `'Noto Sans Thai'`, sans-serif.
- **Editorial Tone:** Warm, confident, calm, intelligent.
- **Microcopy Ban:** 0 em-dashes (`—`) or en-dashes (`–`) in visible UI labels.
- **Parenthetical Ban:** 0 dual-language parenthetical labels (`คำไทย (English Word)`).
- **Button Labels:** Maximum 1–3 words per button. Never use sentence-length button text.

---

## 3. Attention-Friendly & Cognitive Architecture

1. **One Primary Action per Viewport:** Avoid multiple competing CTAs. The primary action is unmistakable within 3 seconds.
2. **Chunking & Small Wins:** Every study session is framed as an achievable milestone ("5 minutes", "3 words", "1 sentence transformation").
3. **No Memory Traps:** Always keep linguistic context visible during question answering.
4. **Calm Mode Switching:** Clear visual distinction between Relaxed Practice Mode and Formal Cambridge Exam Mode.

---

## 4. Components & Interactive Affordances

- **Unified KPI Containers:** Border-boxed container with shared internal dividing lines (`border-border/40`).
- **Tactile Touch Targets:** All buttons and interactive pills meet the minimum 44px touch target requirement (`min-h-[44px]`).
- **Low-Opacity Tinted Badges:** `bg-emerald-500/10 text-emerald-700` (success), `bg-indigo-500/10 text-indigo-700` (cefr).
- **Feedback & Reorientation:** Persistent breadcrumbs and session indicators allow instant resumption after distraction.
