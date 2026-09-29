# Glova Visual-Content Map & Multi-Modal Asset Inventory

**Date**: 2026-09-29  
**Version**: 1.0.0-final  
**Objective**: Purposeful multi-modal visual content mapping across all 10 major learner-facing views in the Glova English Learning Platform.

---

## 1. Visual Modality Principles

To prevent generic AI slop, decorative clutter, and visual distraction, every visual element in Glova must adhere to one of five explicit classifications:

1. **Real Photography (Editorial / Contextual)**:
   - *Where it adds value*: Grounding abstract language learning in authentic real-world environments (university lecture halls, airport departure lounges, collaborative offices, reading study desks).
   - *Implementation standard*: Authentic Unsplash CDN assets with explicit width/height bounding boxes, `object-cover`, overflow-hidden containers, zero CLS (anti-layout thrashing), and semantic descriptive alt text.
2. **Remotion Deterministic Animation**:
   - *Where it adds value*: When motion conveys temporal or rhythmic pedagogical concepts that static text cannot easily represent (e.g. grammar tense timelines, phonetic syllable stress cadence, CEFR diagnostic level calibration sweep).
   - *Implementation standard*: 100% frame-driven via `useCurrentFrame()` and clamped `interpolate()`. CSS keyframes and Tailwind animation classes strictly forbidden. Muted audio (zero unexpected sound). Native `prefers-reduced-motion` detection rendering instantaneous static diagrams.
3. **Clean Vector Illustration (Lucide / Minimalist SVG)**:
   - *Where it adds value*: Status indicators, skill domain identity badges, empty state guidance, and interactive control feedback.
   - *Implementation standard*: Tree-shaken SVG icon primitives (`lucide-react`) within semi-transparent tinted containers (`bg-emerald-500/10 text-emerald-700`). Zero raw Unicode emojis.
4. **Static UI (High-Density Structured Typography)**:
   - *Where it adds value*: Data tables, rule formula cards, reading passage bodies, test question options, and analytical charts.
   - *Implementation standard*: Clean 3-tier typography, hairline internal borders (`border-foreground/10`), variable spacing rhythm (60-30-10), and maximum cognitive legibility.
5. **No Visual Needed (Distraction-Free Canvas)**:
   - *Where it applies*: Active mock exam testing, diagnostic question answering, writing essay drafting, and audio playback scrubbers.
   - *Rationale*: Extraneous graphics degrade test validity, increase cognitive fatigue, and disrupt high-stakes focus.

---

## 2. Page-by-Page Visual Audit & Inventory

### View 1: Learner Dashboard (`DashboardView.tsx`)
- **Real Photography**:
  - *Location*: Welcome Header / Daily Focus Hero banner.
  - *Asset*: `photo-1523240795612-9a054b0db644` (Priscilla Du Preez) — University students engaged in collaborative academic study.
  - *Purpose*: Frames the learner's study session in a focused, scholarly, and supportive environment.
  - *Dimensions*: 1600x900 (16:9), rendered in fixed `h-40 md:h-48` bounding box with subtle dark gradient overlay for text contrast.
  - *Alt Text*: "University students studying together with books and laptops in a modern library".
- **Static UI**: 6 Skill Progress bars, telemetry streak counter, recent activity log, and targeted weakness cards.
- **Illustration**: Skill category badges (BookOpen, Compass, Award, Headphones).
- **No Visual**: Activity list rows and diagnostic breakdown (clean tabular layout).

---

### View 2: Vocabulary Studio (`VocabularyView.tsx`)
- **Remotion Animation**:
  - *Location*: Word Detail Card / Flashcard Mode — Syllable Stress & Cadence Visualizer (`PhoneticStressAnimation`).
  - *Purpose*: Visually pulses the primary stressed syllable at the exact metric beat (e.g., `ar-chi-TEC-ture`, `co-LLA-bo-rate`), teaching phonological awareness and stress timing.
  - *Parameters*: 60 frames (2.0s @ 30fps), looped, muted.
  - *Fallback*: Static bold colored syllable pill for `prefers-reduced-motion`.
- **Real Photography**:
  - *Location*: Flashcard contextual illustration card for concrete vocabulary items.
  - *Asset*: `photo-1434030216411-0b793f4b4173` (Green Chameleon) — Student writing notes and studying vocabulary.
  - *Alt Text*: "Student writing vocabulary notes with pen in open study journal".
- **Static UI**: 10,021 searchable vocabulary datatable, POS filter chips, IPA transcription box, and collocation pairs.

---

### View 3: Grammar Lab (`GrammarView.tsx`)
- **Remotion Animation**:
  - *Location*: Topic Header / Concept Visualizer — Tense Aspect Timeline (`GrammarTimelineAnimation`).
  - *Purpose*: Animates temporal relations between past actions and present relevance (e.g., Present Perfect showing continuous bridge to the present, vs Past Simple completed point in time).
  - *Parameters*: 90 frames (3.0s @ 30fps), looped, muted.
  - *Fallback*: Static horizontal timeline diagram with past/now markers.
- **Static UI**: Formula syntax block (`Subject + have/has + Past Participle`), Common Mistakes callout (`Don't say / Say`), and practice exercise items.
- **Illustration**: CheckCircle2 and AlertCircle status icons.

---

### View 4: Reading Room (`ReadingView.tsx`)
- **Real Photography**:
  - *Location*: Passage Article Header.
  - *Asset*: `photo-1522071820081-009f0129c71c` (Annie Spratt) — Agile team collaborating in workspace.
  - *Purpose*: Provides authentic editorial context matching international CEFR passage themes (business, technology, science).
  - *Dimensions*: 16:9 aspect ratio, bounded container, anti-CLS.
  - *Alt Text*: "Professional team collaborating around laptops in a modern sunlit workspace".
- **Static UI**: Full-text reading passage with paragraph markers, font size toggles, and multi-choice question list.
- **No Visual Needed**: Passage body and question options (strictly 0 visual noise to ensure reading comprehension test validity).

---

### View 5: Listening Lab (`ListeningView.tsx`)
- **Real Photography**:
  - *Location*: Scenario Context Card before audio playback.
  - *Asset*: `photo-1526374965328-7f61d4dc18c5` / Commons Airport Terminal — Airport Flight Announcement / Travel Scenario.
  - *Purpose*: Activates learner schema and situational vocabulary prior to listening.
  - *Alt Text*: "Modern airport departure gate and terminal concourse".
- **Remotion Animation**:
  - *Location*: Audio Waveform Playback Monitor (`AcousticPlaybackAnimation`).
  - *Purpose*: Visualizes acoustic rhythm and audio state during playback without sound autoplay.
  - *Fallback*: Static sound wave bars.
- **Static UI**: Audio player scrubber, playback speed buttons (0.75x, 1x, 1.25x), collapsible transcript, and comprehension items.

---

### View 6: Writing Studio (`WritingView.tsx`)
- **Real Photography**:
  - *Location*: Writing Prompt Context Stimulus Card.
  - *Asset*: `photo-1434030216411-0b793f4b4173` — Scholarly essay preparation.
  - *Alt Text*: "Academic writing materials, desk, and draft paper".
- **Static UI**: Essay textarea, real-time word counter with target range indicator (e.g. 140–190 words for B2 First), CEFR rubric criteria guide.
- **No Visual Needed**: Text editor canvas is completely distraction-free.

---

### View 7: Speaking Studio (`SpeakingView.tsx`)
- **Real Photography**:
  - *Location*: Conversational Partner Scenario Card.
  - *Asset*: `photo-1522071820081-009f0129c71c` — Professional interview discussion.
  - *Alt Text*: "Two professionals in an active interview discussion".
- **Remotion Animation**:
  - *Location*: Recording Pulse & Speech Rhythm Monitor (`SpeechRhythmAnimation`).
  - *Purpose*: Indicates active microphone capture and speech pacing without distracting colors.
  - *Fallback*: Static recording badge (`REC`).
- **Static UI**: Guiding prompt questions, timer countdown, transcript playback.

---

### View 8: Diagnostic Assessment (`AssessmentView.tsx`)
- **Static UI (During Exam)**: 100% distraction-free exam canvas. Absolutely NO photography or animation during testing.
- **Remotion Animation (Results Reveal Screen)**:
  - *Location*: CEFR Diagnostic Level Reveal (`CefrRadarCalibrationAnimation`).
  - *Purpose*: Smooth deterministic reveal of estimated CEFR score from A1 to assessed level across 6 skills.
  - *Parameters*: 90 frames (3.0s @ 30fps), non-looping.
  - *Fallback*: Instant static CEFR badge.

---

### View 9: Mock Exam Engine (`MockExamView.tsx`)
- **Real Photography**:
  - *Location*: Exam Catalog / Hall Selection Cards.
  - *Asset*: `photo-1434030216411-0b793f4b4173` — Formal examination setting.
  - *Alt Text*: "Structured exam desk with question paper and stationery".
- **Static UI**: Exam section timer, question palette grid, auto-save status indicator, answer options.
- **No Visual Needed**: 100% zero decorative visuals during timed examination.

---

### View 10: Progress & Analytics (`AnalyticsView.tsx`)
- **Static UI / Data Visualizations**: Skill radar charts, study streak calendar, comparative CEFR growth graphs.
- **Illustration**: Clean Lucide icon status badges.
- **No Visual Needed**: Telemetry tables and weakness lists.
