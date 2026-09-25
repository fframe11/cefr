# Next.js App Router Client / Server Component Audit

## 1. Audit Taxonomy & Classification Criteria

To optimize bundle sizes, streaming SSR, and security boundaries while strictly avoiding regression, every component is classified under one of four architectural categories:

- **Category A (Server Component)**: Pure presentational layout or server-rendered component that does not use React client hooks (`useState`, `useEffect`, `useContext`), event listeners (`onClick`, `onChange`), or browser-only APIs (`window`, `localStorage`, `Audio`).
- **Category B (Client Component Required)**: Authentically interactive UI element requiring browser APIs (Web Audio, SpeechSynthesis, MediaRecorder), interactive event handlers, client-side React Context (`useAuth`, `useApp`, `useTranslation`), local storage, or countdown timers.
- **Category C (Client Component Currently, Can Convert Later)**: Pure presentational components that currently have `'use client'` attached to maintain compatibility with client-heavy parent views, but contain no internal hooks or browser API dependencies and can be safely converted to Server Components during future UI refactoring passes.
- **Category D (Needs Architectural Review)**: Complex containers blending data fetching with heavy client state, which would benefit from splitting into a Server Component (for initial server-side data fetching / SEO) and an inner Client Component (for interaction).

---

## 2. Component Audit Table

| Component Path | Current Status | Primary Reason | Recommended Status | Changed in Phase 5.3.1? |
|---|---|---|---|---|
| `app/layout.tsx` | Server Component | Defines HTML shell, fonts, `<head>`, metadata, and injects global security headers. Does not access client state directly. | **Server Component** | No (Retained Server Component) |
| `app/page.tsx` | Client Component | Passes `useApp()` progress and routing callbacks to `DashboardView`. | **Client Component** | No |
| `app/assessment/page.tsx` | Client Component | Connects `handleAssessmentComplete` and router state to `AssessmentView`. | **Client Component** | No |
| `app/vocabulary/page.tsx` | Client Component | Connects `progress.masteredWordIds` and `handleToggleWordMastery` to `VocabularyView`. | **Client Component** | No |
| `app/grammar/page.tsx` | Client Component | Connects `remediationTopic` and `handleQuestionCompleted` to `GrammarView`. | **Client Component** | No |
| `app/reading/page.tsx` | Client Component | Passes practice question handlers to `ReadingView`. | **Client Component** | No |
| `app/listening/page.tsx` | Client Component | Passes practice question handlers to `ListeningView`. | **Client Component** | No |
| `app/writing/page.tsx` | Client Component | Hosts self-contained `WritingView`. | **Client Component** | No |
| `app/speaking/page.tsx` | Client Component | Hosts self-contained `SpeakingView`. | **Client Component** | No |
| `app/mock-exams/page.tsx` | Client Component | Connects `handleExamSubmitted` and `setIsProfileModalOpen` to `MockExamView`. | **Client Component** | No |
| `app/analytics/page.tsx` | Client Component | Connects `progress` and remediation navigation to `AnalyticsView`. | **Client Component** | No |
| `components/Providers.tsx` | Client Component | Mounts React Context Providers (`I18nProvider`, `AuthProvider`, `ToastProvider`, `AppProvider`). | **Client Component Required** | No |
| `components/AppShell.tsx` | Client Component | Uses `usePathname()`, `useRouter()`, theme state, scroll position, and coordinates Header/Sidebar. | **Client Component Required** | No |
| `components/common/Header.tsx` | Client Component | Uses click events for theme toggle, profile modal, retake test, and language switcher. | **Client Component Required** | No |
| `components/common/Sidebar.tsx` | Client Component | Uses click events for navigation, active route styling, and collapsible sections. | **Client Component Required** | No |
| `components/common/MobileBottomNav.tsx` | Client Component | Uses click events for mobile navigation and active tab highlighting. | **Client Component Required** | No |
| `components/common/ProfileModal.tsx` | Client Component | Uses modal visibility state, form input states, auth mode toggles, and async login/signup handlers. | **Client Component Required** | No |
| `components/common/LanguageSwitcher.tsx` | Client Component | Uses click-outside listener, dropdown state, and `setLanguage` hook. | **Client Component Required** | No |
| `components/common/Toast.tsx` | Client Component | Uses `useState`, `setTimeout` dismissal loops, and global notification context. | **Client Component Required** | No |
| `components/common/AudioPlayer.tsx` | Client Component | Uses Web Audio API / `speechSynthesis`, audio play/pause state, and quota counter. | **Client Component Required** | No |
| `components/common/QuestionCard.tsx` | Client Component | Uses click handlers for option selection, text inputs for fill-in-the-blank, and instant feedback state. | **Client Component Required** | No |
| `components/common/LoadingSpinner.tsx` | Client Component | Pure presentational SVG spinner with size tokens. | **Can convert to Server Component** | No (Preserved to avoid churn) |
| `components/common/EmptyState.tsx` | Client Component | Pure presentational empty-state illustration card. | **Can convert to Server Component** | No (Preserved to avoid churn) |
| `components/common/ErrorMessage.tsx` | Client Component | Presentational alert box with retry button. | **Can convert to Server Component** | No (Preserved to avoid churn) |
| `components/views/DashboardView.tsx` | Client Component | Uses interactive navigation handlers, target exam cards, and active remediation buttons. | **Client Component Required** | No |
| `components/views/AssessmentView.tsx` | Client Component | Multi-step interactive diagnostic wizard with answer state, step progression, and timer. | **Client Component Required** | No |
| `components/views/VocabularyView.tsx` | Client Component | Search filter state, level filtering pills, flashcard flip animation state, and word mastery toggling. | **Client Component Required** | No |
| `components/views/GrammarView.tsx` | Client Component | Accordion expand/collapse state, interactive exercise submission, and pitfall tabs. | **Client Component Required** | No |
| `components/views/ReadingView.tsx` | Client Component | Passage tab switching, passage font size scaling, and inline question submission. | **Client Component Required** | No |
| `components/views/ListeningView.tsx` | Client Component | Audio track selection, audio synthesis player, replay limits, and answer verification. | **Client Component Required** | No |
| `components/views/WritingView.tsx` | Client Component | Real-time textarea input, dynamic word count tracking, countdown timer, and rubric sliders. | **Client Component Required** | No |
| `components/views/SpeakingView.tsx` | Client Component | Microphone recording state, audio blob synthesis, playback simulation, and rubric checkboxes. | **Client Component Required** | No |
| `components/views/MockExamView.tsx` | Client Component | Server exam session lifecycle, 60s timer countdown, 30s autosave timer loop, and question navigation. | **Client Component Required** | No |
| `components/views/AnalyticsView.tsx` | Client Component | Skill radar charts, weakness frequency filters, and direct remediation navigation handlers. | **Client Component Required** | No |
| `lib/supabase/client.ts` | Client Module | Uses `@supabase/ssr` `createBrowserClient` for browser-side session hydration. | **Client Module** | Yes (New in Phase 5.3.1) |
| `lib/supabase/server.ts` | Server Module | Uses `@supabase/ssr` `createServerClient` with Next.js 15 async `cookies()` for SSR. | **Server Module** | Yes (New in Phase 5.3.1) |
| `lib/supabase/middleware.ts`| Server Module | Uses `@supabase/ssr` `createServerClient` to refresh authentication cookies during routing. | **Server Module** | Yes (New in Phase 5.3.1) |
| `middleware.ts` | Server Module | Next.js root Edge/Node middleware updating session cookies. | **Server Module** | Yes (New in Phase 5.3.1) |

---

## 3. Safe Refactoring Strategy for Future Phases

1. **Phase 5.4 (Live Supabase Verification)**: Keep all interactive view controllers as Client Components while verifying live database connections, remote RLS policies, and real user authentication flows.
2. **Phase 5.5+ (SSR Optimization)**:
   - Convert presentational primitives (`LoadingSpinner.tsx`, `EmptyState.tsx`, `ErrorMessage.tsx`) to pure Server Components.
   - For educational catalog pages (`/vocabulary`, `/grammar`, `/reading`), pre-render initial lists on the server using Server Components and stream filtered views via React Suspense boundaries.
