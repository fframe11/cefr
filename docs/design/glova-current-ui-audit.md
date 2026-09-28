# Glova UI Audit: Baseline Architecture & Cognitive Load Analysis

**Document Version:** 1.0.0  
**Phase:** 6.3.1 — Foundation Only  
**Target Platform:** Web (Next.js 15 App Router, React 18, Tailwind CSS 3.4, Lucide React)  
**Author:** Senior UX/UI & Product Engineering Lead  

---

## 1. Executive Summary

Glova is transitioning from an internal, administrative-oriented CEFR learning portal into an engaging consumer English learning application. This audit documents the structural strengths, visual bottlenecks, cognitive load friction points, and component lifecycles in the existing codebase (`components/views/DashboardView.tsx`, `app/page.tsx`, and associated modular views).

The findings establish the empirical justification for the Phase 6.3.1 Brand & Design System Foundation.

---

## 2. Empirical Codebase Audit

### 2.1 Visual Language & Aesthetic Direction

| Visual Attribute | Current State (`app/globals.css`, `tailwind.config.js`) | Problem & Impact |
| :--- | :--- | :--- |
| **Color Palette** | Monochromatic zinc/slate dark baseline (`--background: 240 10% 3.9%`) with generic high-saturation blue (`217.2 91.2% 59.8%`). | Evokes an enterprise cloud console or database management UI rather than an inviting educational space. Lacks warmth, vibrance, and emotional safety. |
| **Visual Hierarchy** | Flat cards with uniform `border border-border/60` and zero elevation layering (`shadow-none`). | Every section carries identical visual weight. Eye tracking wanders across the screen with no primary focal point. |
| **Typography Scale** | Standard system stack (`font-sans` with uncalibrated Tailwind sizing). Fluid hero styles exist in CSS but are underutilized in learning views. | High information density without proportional leading creates visual fatigue, especially during multi-paragraph reading tasks. |
| **Brand Presence** | Plain text title "Glova" rendered with generic Lucide graduation cap icon. | No distinctive graphic symbol, favicon identity, or visual cohesion across learning domains. |

### 2.2 Cognitive Load & Interaction Flow

```
[ Current Dashboard Layout: Cognitive Competition ]

+-----------------------------------------------------------------------+
|  Top Banner: Target Exam & Level (Dual-Language String Concatenation)  |
+-----------------------------------------------------------------------+
|  CEFR Progression Bar: A1 -> A2 -> B1 -> B2 -> C1 -> C2 (All Visible)  |
+-----------------------------------------------------------------------+
|  Metric Row: [Overall Score] [Cambridge Match] [Study Streak]         |
+-----------------------------------------------------------------------+
|  Remediation Tile: "จุดที่ควรพัฒนา" (Weakest Skill Urgent Warning)     |
+-----------------------------------------------------------------------+
|  Action Grid (7 Tiles): Listening | Speaking | Reading | Writing      |
|                         Grammar   | Vocab    | Mock Exam              |
|  * All 7 tiles share identical visual hierarchy and button weight *   |
+-----------------------------------------------------------------------+
```

#### Key Usability Deficits:
1. **Choice Paralysis (Hick's Law Violation)**:
   - When learners land on `DashboardView.tsx`, they are presented with 7 equal-weight skill tiles plus a remediation card plus metric cards simultaneously.
   - There is no single, unmistakable **"Primary Next Best Action"** (e.g., "Continue Unit 3: Phrasal Verbs" or "Daily 5-Min Warm-up").
2. **Deficit-First Framing**:
   - The prominent "Weakest Skill" (`จุดที่ควรพัฒนา`) card uses high-friction warning semantics (`border-amber-500/30 bg-amber-500/10`) right above the main action grid.
   - For anxious adult and Gen Z learners, highlighting failure states before celebrating ongoing progress discourages daily habit loops.
3. **Dual-Language String Concatenation**:
   - `DashboardView.tsx` (L133): `เป้าหมายการสอบ: {progress.targetExam} ({progress.currentLevel})`.
   - Concatenating Thai prefixes with parenthetical English creates visual clutter and violates strict single-locale microcopy principles.
4. **Zero Live Feedback Loop**:
   - Learners who encounter vocabulary ambiguities, typo reports, or UI issues have no in-context feedback mechanism. They must leave the task or abandon the flow.

---

## 3. Component Lifecycle Matrix

| Component | Current File | Recommendation | Rationale |
| :--- | :--- | :--- | :--- |
| **Top Navigation** | `app/page.tsx` | **Redesign** | Needs authentic Glova logo mark, sleek level indicator pill, streak badge with micro-animation, and quick profile anchor. |
| **CEFR Stepper Bar** | `components/views/DashboardView.tsx` | **Preserve & Polish** | The 6-tier CEFR model (A1-C2) is academically sound. Polish with micro-interactions, clear unlocked/locked states, and responsive collapsing on mobile. |
| **Diagnostic Assessment View** | `components/views/AssessmentView.tsx` | **Preserve** | Core evaluation logic is sound; needs tokenized styling and reduced visual distraction during test-taking. |
| **Remediation Alert Card** | `components/views/DashboardView.tsx` | **Redesign** | Transform from a high-anxiety warning card into an empowering "Recommended Practice" card with an actionable 1-click CTA. |
| **7-Tile Skill Matrix** | `components/views/DashboardView.tsx` | **Redesign** | Separate into a **Primary Hero Action** (70% visual prominence) and a **Curated Skills Drawer/Grid** (30% secondary exploratory prominence). |
| **Floating Feedback Widget** | *Non-existent* | **New Addition** | Introduce a persistent, draggable floating bubble supporting instant categorization (Bug, Content Error, Suggestion, Praise) and device/CEFR context capture. |
| **Monochrome Metric Cards** | `components/views/DashboardView.tsx` | **Redesign** | Group into unified container with internal hairline borders (`border-foreground/10`) and subtle tinted trend badges. |

---

## 4. Architectural Baseline & Safe Refactoring Rules

1. **Zero Database Mutations**: The backend schema (`supabase/migrations/*`) and PostgreSQL/Supabase data contracts remain completely untouched.
2. **Zero API Contract Alterations**: All API routes (`api/content/*`, `api/listening/*`, `src/lib/api/*`) retain existing parameters and payloads.
3. **No Styling Framework Replacement**: Tailwind CSS 3.4 + standard CSS custom properties remain the sole styling engine. Framer Motion / Motion primitives enhance interaction without bloating dependencies.
4. **Tokenization Precedes Migration**: All new color tokens, typography scales, radii, and spring physics tokens must reside in `lib/design-tokens/tokens.ts` and pass automated unit tests before any view refactoring begins in Phase 6.3.2+.
