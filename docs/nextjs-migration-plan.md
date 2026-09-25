# CEFR Platform: Next.js App Router Architecture Migration Plan

## 1. Current Architecture Overview

The existing application is structured as a client-side Single Page Application (SPA) driven by Vite and React 18, paired with standalone Vercel Serverless Functions in `api/`:

```text
React 18 + TypeScript SPA (Vite)
  - index.html + src/main.tsx + src/App.tsx
  - In-memory view state routing (NavView: 'dashboard' | 'vocabulary' | 'grammar' | etc.)
  - Client state: AuthContext (Supabase Auth client), I18nContext (localStorage)
  - Asset pipeline: Vite 6.1 with Tailwind CSS 3.4
  - Static fallback banks in src/data/*

Vercel Serverless Function Layer (api/*)
  - Node.js http (req: IncomingMessage, res: ServerResponse)
  - Universal handler wrapper: api/_lib/handler/api-handler.ts
  - 25 endpoints handling Auth, Content, Practice, Assessment, Mock Exams, User Progress
  - In-memory sliding window rate limiting
  - Service-role & public Supabase clients (api/_lib/supabase/)

Supabase Backend
  - PostgreSQL 15+ schema with 20 application tables
  - Row Level Security (RLS) policies
```

---

## 2. Target Next.js Architecture

We are migrating in-place to **Next.js 14/15 App Router** with TypeScript, Tailwind CSS, and Supabase. The target architecture replaces the SPA shell with real file-system routing, Server Components, and native Route Handlers:

```text
Next.js App Router
├── app/
│   ├── layout.tsx              # Root Layout: HTML shell, fonts, Theme/I18n/Auth Providers
│   ├── page.tsx                # Dashboard view (/)
│   ├── assessment/page.tsx     # Placement / Diagnostic Assessment (/assessment)
│   ├── vocabulary/page.tsx     # Vocabulary Study & Flashcards (/vocabulary)
│   ├── grammar/page.tsx        # Grammar Explanations & Quizzes (/grammar)
│   ├── reading/page.tsx        # Reading Passages & Comprehension (/reading)
│   ├── listening/page.tsx      # Listening Exercises & Audio (/listening)
│   ├── writing/page.tsx        # Writing Prompts & Self-Rubric (/writing)
│   ├── speaking/page.tsx       # Speaking Prompts & Audio Recording (/speaking)
│   ├── mock-exams/page.tsx     # Cambridge Mock Exam Engine (/mock-exams)
│   ├── analytics/page.tsx      # Skill Analytics & Weakness Remediation (/analytics)
│   └── api/                    # Next.js Route Handlers (app/api/**/route.ts)
├── components/                 # Reusable UI & View components
│   ├── common/                 # Header, Sidebar, MobileBottomNav, Toast, Modals
│   ├── views/                  # View container controllers ("use client")
│   └── ui/                     # Primitives (cards, badges, buttons)
├── lib/
│   ├── api/                    # Frontend typed API client (fetchWithAuth)
│   ├── server/                 # Server-side controllers, validation, rate limiting
│   └── supabase/               # Supabase browser & server clients
├── services/                   # Audio service, localStorage service
├── types/                      # Application domain models & DTOs
├── data/                       # Educational content banks (CEFR curriculum)
├── hooks/                      # Custom React hooks
├── i18n/                       # Localization subsystem (th.json, en.json, context)
└── public/                     # Static media & icons
```

---

## 3. Files Reusable Unchanged

The following modules represent pure domain logic, curriculum data, and types that require zero structural modification:

1. **Curriculum & Data Banks** (`data/`):
   - `data/cefrLevels.ts` (CEFR level metadata & Cambridge scale ranges)
   - `data/diagnosticAssessment.ts` (Placement assessment question bank)
   - `data/grammarBank.ts` (Grammar lessons, formulas, pitfalls, exercises)
   - `data/listeningBank.ts` (Audio scripts, comprehension items)
   - `data/mockExams.ts` (Mock exam catalog & section structures)
   - `data/readingBank.ts` (Passages & comprehension quizzes)
   - `data/speakingBank.ts` (Part 1-4 prompts & sample responses)
   - `data/vocabularyBank.ts` (A1-C2 vocabulary curriculum)
   - `data/writingBank.ts` (Writing tasks, model answers, rubrics)
2. **Type Definitions** (`types/`):
   - `types/index.ts` (CEFR levels, UserProgressState, DiagnosticResult, MockExam types)
3. **Services** (`services/`):
   - `services/audioService.ts` (Web Audio API synthesis & pronunciation)
   - `services/storageService.ts` (LocalStorage guest attempt synchronization)
4. **Localization Dictionaries** (`i18n/locales/`):
   - `i18n/locales/th.json` (Human-reviewed Thai dictionary)
   - `i18n/locales/en.json` (Human-reviewed English dictionary)
   - `i18n/types.ts`
5. **Database Migrations** (`supabase/migrations/`):
   - `20260924000001_initial_schema.sql`
   - `20260924000002_rls_policies.sql`
   - `20260924000003_content_schema.sql`
   - `20260924000004_assessment_mock_schema.sql`

---

## 4. Files Requiring Migration

1. **Package Configuration**:
   - `package.json`: Remove `vite`, `@vitejs/plugin-react`; add `next` (v14/v15), `@types/react`, `@types/react-dom`. Update scripts to `next dev`, `next build`, `next start`.
2. **TypeScript Configuration**:
   - `tsconfig.json`: Add Next.js compiler settings (`jsx: "preserve"`, `plugins: [{ "name": "next" }]`, `"paths": { "@/*": ["./*"] }`).
3. **Tailwind Configuration**:
   - `tailwind.config.js`: Update content paths to `./app/**/*.{js,ts,jsx,tsx}`, `./components/**/*.{js,ts,jsx,tsx}`, `./lib/**/*.{js,ts,jsx,tsx}`.
4. **App Shell & Layout**:
   - `app/layout.tsx`: Root HTML layout with font imports, global CSS, `I18nProvider`, and `AuthProvider`.
   - `app/globals.css`: Migrated from `src/index.css`.
5. **UI Components** (`components/`):
   - Add `"use client"` directive to interactive components (`Header.tsx`, `Sidebar.tsx`, `MobileBottomNav.tsx`, `QuestionCard.tsx`, `AudioPlayer.tsx`, `ProfileModal.tsx`, `LanguageSwitcher.tsx`).
   - Replace manual `onNavigate` callbacks with Next.js navigation (`useRouter`, `usePathname`, `<Link>`) while preserving backward-compatible callbacks for isolated testing.
6. **Views** (`components/views/`):
   - Add `"use client"` directive to view controllers (`DashboardView.tsx`, `MockExamView.tsx`, `AssessmentView.tsx`, etc.).
7. **Supabase Client**:
   - Split `src/lib/supabaseClient.ts` into `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (Route Handlers/server).
8. **API Handlers** (`api/*` -> `app/api/**/route.ts`):
   - Refactor `createApiHandler` into a Web standard handler wrapper that accepts `NextRequest` and returns `NextResponse`.
   - Map all 25 routes into App Router route handlers.

---

## 5. Files Requiring Deletion

1. `vite.config.ts` (replaced by `next.config.js`)
2. `src/vite-env.d.ts` (replaced by `next-env.d.ts`)
3. `index.html` (replaced by `app/layout.tsx`)
4. `src/main.tsx` (replaced by Next.js App Router root)
5. `dist/` (replaced by `.next/`)

---

## 6. Routing Migration Map

| Legacy View State | Next.js App Route | Rendering Mode | Purpose |
|---|---|---|---|
| `dashboard` | `/` (`app/page.tsx`) | Server Shell + Client Content | Main learning journey, CEFR level, daily actions |
| `assessment` | `/assessment` (`app/assessment/page.tsx`) | Client Component | 25-question placement assessment & diagnostic |
| `vocabulary` | `/vocabulary` (`app/vocabulary/page.tsx`) | Client Component | Vocabulary flashcards & spaced repetition |
| `grammar` | `/grammar` (`app/grammar/page.tsx`) | Client Component | Grammar topic lessons & interactive practice |
| `reading` | `/reading` (`app/reading/page.tsx`) | Client Component | Reading passages & comprehension quizzes |
| `listening` | `/listening` (`app/listening/page.tsx`) | Client Component | Audio exercises & transcripts |
| `writing` | `/writing` (`app/writing/page.tsx`) | Client Component | Writing tasks, essay editor & rubric self-scoring |
| `speaking` | `/speaking` (`app/speaking/page.tsx`) | Client Component | Speaking prompts, microphone recorder & audio |
| `mock_exams` | `/mock-exams` (`app/mock-exams/page.tsx`) | Client Component | Timed Cambridge mock exam engine |
| `weaknesses` / `analytics` | `/analytics` (`app/analytics/page.tsx`) | Client Component | Skill radar, exam history & error remediation |

---

## 7. Client/Server Component Boundary Map

```text
[Server Component: app/layout.tsx]
   ├── Root Metadata (SEO, OG, Viewport)
   ├── [Client Component: I18nProvider]
   │     └── [Client Component: AuthProvider]
   │           ├── [Client Component: Header]
   │           │     └── [Client Component: LanguageSwitcher]
   │           ├── [Client Component: Sidebar]
   │           ├── [Server/Client Page Shell: app/[route]/page.tsx]
   │           │     └── [Client Component: View Container]
   │           └── [Client Component: MobileBottomNav]
```

- **Server-Side**: Metadata generation, static layout wrapper, security header dispatch, robots/sitemap.
- **Client-Side**: Audio playback (`AudioPlayer`), timer synchronization (`MockExamView`), canvas confetti (`AssessmentView`), speech synthesis (`audioService`), local storage caching (`storageService`), and real-time form validation.

---

## 8. API Migration Map

All 25 endpoints are mapped from Vercel Serverless Functions (`api/`) to Next.js App Router Route Handlers (`app/api/**/route.ts`):

| # | Endpoint | Method | Target Next.js Route Handler | Auth Requirement |
|---|---|---|---|---|
| 1 | `/api/health` | GET | `app/api/health/route.ts` | Public |
| 2 | `/api/cefr/levels` | GET | `app/api/cefr/levels/route.ts` | Public |
| 3 | `/api/auth/me` | GET | `app/api/auth/me/route.ts` | Required (Bearer JWT) |
| 4 | `/api/content/vocabulary` | GET | `app/api/content/vocabulary/route.ts` | Optional |
| 5 | `/api/content/grammar` | GET | `app/api/content/grammar/route.ts` | Optional |
| 6 | `/api/content/reading` | GET | `app/api/content/reading/route.ts` | Optional |
| 7 | `/api/content/listening` | GET | `app/api/content/listening/route.ts` | Optional |
| 8 | `/api/content/writing` | GET | `app/api/content/writing/route.ts` | Optional |
| 9 | `/api/content/speaking` | GET | `app/api/content/speaking/route.ts` | Optional |
| 10 | `/api/questions` | GET | `app/api/questions/route.ts` | Optional (Sensitive fields stripped) |
| 11 | `/api/practice/submit` | POST | `app/api/practice/submit/route.ts` | Optional (Guest/User) |
| 12 | `/api/assessment/submit` | POST | `app/api/assessment/submit/route.ts` | Optional (5 req/10m rate limit) |
| 13 | `/api/assessment/result` | GET | `app/api/assessment/result/route.ts` | Required |
| 14 | `/api/mock-exams` | GET | `app/api/mock-exams/route.ts` | Optional (Catalog list) |
| 15 | `/api/mock-exams/start` | POST | `app/api/mock-exams/start/route.ts` | Required |
| 16 | `/api/mock-exams/session` | GET | `app/api/mock-exams/session/route.ts` | Required (Session token, 0 answer leak) |
| 17 | `/api/mock-exams/autosave` | POST | `app/api/mock-exams/autosave/route.ts` | Required (60 req/1m) |
| 18 | `/api/mock-exams/submit` | POST | `app/api/mock-exams/submit/route.ts` | Required (Server-authoritative timer) |
| 19 | `/api/mock-exams/results` | GET | `app/api/mock-exams/results/route.ts` | Required |
| 20 | `/api/user/profile` | GET, PUT | `app/api/user/profile/route.ts` | Required |
| 21 | `/api/user/progress` | GET | `app/api/user/progress/route.ts` | Required |
| 22 | `/api/user/analytics` | GET | `app/api/user/analytics/route.ts` | Required |
| 23 | `/api/user/weaknesses` | GET | `app/api/user/weaknesses/route.ts` | Required |
| 24 | `/api/user/vocabulary-mastery` | GET | `app/api/user/vocabulary-mastery/route.ts` | Required |
| 25 | `/api/user/sync-guest` | POST | `app/api/user/sync-guest/route.ts` | Required (Idempotent batch sync) |

---

## 9. Supabase Migration Plan

1. **Browser Client** (`lib/supabase/client.ts`):
   - Initializes `createClient` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Backward-compatible fallback to `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` if configured.
2. **Server Client** (`lib/supabase/server.ts`):
   - Authenticated client extracting Bearer tokens from incoming `request.headers.get('authorization')`.
3. **Service Role Client** (`lib/supabase/service-role.ts`):
   - Uses `SUPABASE_SERVICE_ROLE_KEY` strictly inside server Route Handlers for privileged database operations. Never bundled to client.

---

## 10. Authentication & Session Migration Plan

1. **Auth Context**:
   - `context/AuthContext.tsx` wraps the application in `app/layout.tsx`.
   - Listens to Supabase Auth state changes (`onAuthStateChange`).
   - Automatically synchronizes tokens with the API client (`lib/api/client.ts`).
2. **Route Protection**:
   - Client components display authentication prompts or redirect on unauthorized access.
   - Route Handlers enforce server-side token validation via `requireAuth(request)` throwing HTTP 401 on missing or invalid tokens.

---

## 11. Environment Variable Migration

| Legacy Variable (Vite) | Target Next.js Variable | Scope | Exposure |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Public |
| `VITE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public |
| `SUPABASE_URL` | `SUPABASE_URL` | Server Only | Private |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Private (CRITICAL) |
| `SUPABASE_DB_URL` | `SUPABASE_DB_URL` | Server Only | Private |

---

## 12. Security Migration

1. **HTTP Security Headers** (`next.config.js`):
   - Re-implements `vercel.json` headers via `async headers()` in `next.config.js`:
     - Content-Security-Policy (CSP)
     - X-Content-Type-Options: nosniff
     - X-Frame-Options: DENY
     - Referrer-Policy: strict-origin-when-cross-origin
     - Permissions-Policy: camera=(), microphone=(self), geolocation=(), payment=()
     - Strict-Transport-Security (HSTS): max-age=63072000
2. **Sourcemap Suppression**:
   - `productionBrowserSourceMaps: false` in `next.config.js`.
3. **Payload & Stream Limits**:
   - 1MB body stream cap enforced in Route Handlers.
   - Bounded Zod schemas enforce string and array size constraints.
4. **Answer Key Protection**:
   - Questions and mock exam session endpoints strictly strip `is_correct`, `correct_answer_text`, and explanations prior to JSON response serialization.

---

## 13. Testing Migration Plan

1. **Vitest Configuration**:
   - Configure `vitest.config.ts` with path aliases `@/*` pointing to project root.
2. **Test Adapter**:
   - Provide a Web `Request` / Node `IncomingMessage` adapter so existing 192 unit tests in `tests/*.test.ts` run against Route Handlers without rewriting assertions.
3. **Test Suites**:
   - Preserve all 14 test suites (192 tests baseline).

---

## 14. Risk Assessment & Mitigations

1. **Risk: Hydration Mismatch on LocalStorage Language State**:
   - *Mitigation*: Mount-guard (`isMounted` state) in `I18nProvider` ensures server renders fallback and client hydrates smoothly.
2. **Risk: Missing Route Handler Web API Support in Tests**:
   - *Mitigation*: Implement dual-interface handlers or Web `Request` bridge in `api-handler.ts` allowing both Node `(req, res)` and Next.js `(req: NextRequest)` invocations.
3. **Risk: Service Role Secret Leakage**:
   - *Mitigation*: Verify build artifacts contain zero occurrences of `SUPABASE_SERVICE_ROLE_KEY` via `vulnerability-scanner.scan_secrets`.

---

## 15. Acceptance Criteria Checklist

- [ ] Next.js App Router structure established (`app/`, `components/`, `lib/`, `services/`, `types/`, `data/`, `i18n/`, `public/`)
- [ ] Vite dependencies and config completely removed
- [ ] All 10 product views functional under file-system routing
- [ ] Full i18n support preserved (Thai/English switcher and key parity)
- [ ] All 25 API endpoints functional as Route Handlers
- [ ] Server-authoritative mock exam timer and 60s grace period preserved
- [ ] Answer key protection verified (zero answer leakage prior to submit)
- [ ] Guest sync idempotency preserved
- [ ] Production build (`next build`) passes with zero errors
- [ ] 192/192 automated tests passing in Vitest
- [ ] Browser responsive check verified at 375px, 640px, 768px, 1024px, 1280px
- [ ] Production sourcemaps disabled; zero secrets in client bundle
