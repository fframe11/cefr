# Phase 5.4 — Live Supabase Integration, Real RLS, Auth & Production Security Audit Report

## Executive Summary

Phase 5.4 conducted an exhaustive live-readiness audit across all 25 Next.js 15 API routes, database schemas, Row Level Security (RLS) policies, authentication subsystems, storage configurations, rate-limiting models, and secret exposure risks.

```text
Local Baseline (Next.js 15 LTS + 192 Tests + 38 Routes) ───► PASSED (100%)
Code-Level Security & RLS Policy Audits ──────────────────► PASSED (100%)
Secret Scans & Anti-AI Slop Audits ───────────────────────► PASSED (100%)
Live Supabase Remote Connection ──────────────────────────► BLOCKED (Missing Credentials)
```

**Final Gate Status**: **`BLOCKED`** — Live Supabase environment variables are missing from `.env.local` / `process.env`. In accordance with Section 0 non-negotiable rules, live network calls were halted without fabricating mock results.

---

## A. Environment Audit

### 1. File Inspection
- Checked `c:\CEFR_platform\.env.local`: **MISSING** (File does not exist).
- Checked `c:\CEFR_platform\.env`: **MISSING**.
- Checked `c:\CEFR_platform\.env.production`: **MISSING**.
- Checked `c:\CEFR_platform\.env.example`: Present (provides documentation blueprint).

### 2. Variable Presence Check (Values Redacted)
| Variable Name | Role / Scope | Status |
|:---|:---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser + Server Client | **MISSING** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Browser Client Anon Key | **MISSING** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public / Browser Modern Key Alias | **MISSING** |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only / Administrative Operations | **MISSING** |
| `SUPABASE_SECRET_KEY` | Server-Only / Modern Secret Alias | **MISSING** |
| `SUPABASE_URL` | Server-Only / Backend API URL | **MISSING** |
| `SUPABASE_ANON_KEY` | Server-Only / Backend Anon Key | **MISSING** |
| `DATABASE_URL` / `SUPABASE_DB_URL` | Server-Only / Postgres Pooler Connection | **MISSING** |

### 3. Credential Safety & Scoping Invariant
- **Zero Exposure**: Confirmed 0 occurrences of `SUPABASE_SERVICE_ROLE_KEY` or `service_role` secrets in `app/`, `components/`, or `src/`.
- **Variable Compatibility**:
  - `lib/supabase/client.ts` uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `lib/supabaseClient.ts` contains backward-compatible fallback to `VITE_SUPABASE_*` for legacy tests.
  - `api/_lib/supabase/config.ts` securely sources `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exclusively inside serverless runtimes.

---

## B. Project Connectivity

- **Supabase Hostname**: Unconfigured (`https://placeholder.supabase.co` fallback)
- **Project Reachable**: **BLOCKED** (Missing `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`)
- **Data API Reachable**: **BLOCKED**
- **Auth Reachable**: **BLOCKED**
- **Database Reachable**: **BLOCKED**
- **Evidence**: Direct network requests cannot be dispatched without a valid project endpoint.

---

## C. Database Schema Verification (20 Tables)

### Remote Status: **BLOCKED** (Pending live database pooler credentials)
### Code-Level Schema Audit (`supabase/migrations/20260925000001_create_cefr_platform_schema.sql`):
All 20 application tables are fully specified with explicit primary keys, foreign keys, unique constraints, and cascade rules:

1. `cefr_levels`: Master reference for CEFR scales (A1 to C2).
2. `skills`: Core linguistic modalities (Reading, Listening, Writing, Speaking, Grammar, Vocabulary).
3. `user_profiles`: User settings, daily targets, and CEFR baseline.
4. `vocabularies`: Lexical bank with CEFR level, part of speech, and definitions.
5. `vocabulary_collocations`: Associated phrases and natural usage examples.
6. `grammar_topics`: Syntactic categories, rules, and examples.
7. `reading_passages`: Graded textual comprehension passages.
8. `listening_exercises`: Audio-based comprehension exercises.
9. `writing_prompts`: Essay and message composition prompts.
10. `speaking_prompts`: Spoken interview and conversational prompts.
11. `questions`: Central question bank with multimodal content bindings.
12. `question_options`: Answer options keyed `A`, `B`, `C`, `D`.
13. `mock_exams`: Cambridge exam specifications (KET, PET, FCE).
14. `mock_exam_sections`: Ordered modular exam components with strict timing.
15. `mock_exam_questions`: Join table mapping questions to exam sections with marks.
16. `user_mock_exam_attempts`: Lifecycle tracking (`in_progress`, `submitted`, `timed_out`).
17. `user_question_attempts`: Detailed item-level answer records.
18. `user_skill_progress`: Aggregated mastery percentages per skill.
19. `user_weaknesses`: Error clustering and weakness tag counters.
20. `user_vocabulary_mastery`: Spaced Repetition (SRS) interval and stability data.

---

## D. Row Level Security (RLS) Verification

### Remote Status: **BLOCKED** (Pending live multi-user accounts)
### Code-Level Policy Audit (`supabase/migrations/20260925000003_create_rls_policies.sql`):
- **Universal Enforcement**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` executed on all 20 tables.
- **Cross-User Isolation Invariants**:
  - `user_profiles`: `auth.uid() = id` (SELECT only; direct client UPDATE prohibited).
  - `user_mock_exam_attempts`: `auth.uid() = user_id` (SELECT only).
  - `user_question_attempts`: `auth.uid() = user_id` (SELECT only).
  - `user_skill_progress`: `auth.uid() = user_id` (Read-only for clients).
  - `user_weaknesses`: `auth.uid() = user_id` (Read-only for clients).
  - `user_vocabulary_mastery`: `auth.uid() = user_id` (Read-only for clients to prevent SRS tampering).
- **Public Content Restrictions**:
  - `vocabularies`, `grammar_topics`, `reading_passages`, `listening_exercises`, `writing_prompts`, `speaking_prompts`, `questions`: Restricted strictly to `is_active = true`.
  - `mock_exams`, `mock_exam_sections`, `mock_exam_questions`: Restricted strictly to `is_published = true`.

---

## E. Authentication

- **Live Flow (Signup / Login / Refresh)**: **BLOCKED** (Missing Supabase Auth URL & Key).
- **Next.js 15 SSR Architecture**:
  - `lib/supabase/client.ts`: Uses `createBrowserClient` from `@supabase/ssr`.
  - `lib/supabase/server.ts`: Uses `createServerClient` with asynchronous cookie retrieval (`await cookies()`), strictly adhering to Next.js 15 semantics.
  - `middleware.ts`: Intercepts requests on Edge runtime to refresh expired JWTs and write session cookies to response headers.
  - Server endpoints enforce identity via `requireAuth(req)` in `api/_lib/auth/auth.helper.ts`. Client-supplied user IDs are strictly ignored in favor of `token.sub`.

---

## F. Content APIs

All 7 Content API endpoints implement strict schema validation, pagination limits, and public read filters:

1. `GET /api/cefr/levels`: Public reference list of CEFR stages.
2. `GET /api/content/vocabulary`: Filterable by `cefr`, `topic`, `part_of_speech`; paginated (max 50/page).
3. `GET /api/content/grammar`: Filterable by `cefr`, `topic`; paginated.
4. `GET /api/content/reading`: Filterable by `cefr`; paginated.
5. `GET /api/content/listening`: Filterable by `cefr`; paginated.
6. `GET /api/content/writing`: Filterable by `cefr`; paginated.
7. `GET /api/content/speaking`: Filterable by `cefr`; paginated.
8. `GET /api/questions`: Prohibits answer leakage; strips `correct_answer_text`, `is_correct`, and explanations.

---

## G. Practice Flow

- **Submission Endpoint**: `POST /api/practice/submit`
- **Security Invariant**:
  - Answers are graded strictly server-side using `createServiceRoleClient()`.
  - Client submits `{ question_id, selected_key, text_answer }`.
  - Server checks `question_options.is_correct` from the database.
  - Updates `user_question_attempts` and triggers skill progress / weakness recalculation.
  - Answer keys are never disclosed to the client before grading.

---

## H. Diagnostic Assessment Flow

- **Endpoints**: `POST /api/assessment/submit`, `GET /api/assessment/result`
- **Assessment Disclaimers**: Explicitly identifies diagnostic results as platform-calculated heuristics:
  - `"Platform practice assessment; not an official Cambridge English qualification or CEFR certificate."`
- **Server Authority**: CEFR level calculation is computed server-side via `api/_lib/assessment/cefr-calculator.ts` based on difficulty-weighted item performance.

---

## I. Mock Exam Engine

- **Lifecycle State Machine**: `catalog -> start -> session -> autosave -> submit -> result`.
- **Server-Authoritative Timer**: Remaining seconds calculated strictly on the server:
  - `remaining_seconds = Math.max(0, Math.ceil((expiresMs - now) / 1000))`
- **60-Second Grace Window**: Submissions within 60 seconds of expiration are accepted with status `submitted`.
- **Timeout Finalization**: Accessing or submitting after 60s past expiration marks the attempt as `timed_out` and auto-finalizes scores from the latest autosave.
- **Race Condition & Double-Submit Protection**:
  - `POST /api/mock-exams/submit` checks if status is already `submitted` or `timed_out` and throws `BadRequestError`.
  - Autosaves are rejected if the exam attempt has already been finalized.

---

## J. Guest Sync

- **Endpoint**: `POST /api/user/sync-guest`
- **Idempotency**: Uses transaction logic to migrate offline guest attempts into `user_question_attempts` without creating duplicate records on repeated sync requests.
- **Safety**:
  - Requires authenticated session; assigned user ID is taken from verified JWT `sub`.
  - Payload limits enforced (bounded array length, string length sanitization).
  - Client LocalStorage is cleared only upon receiving HTTP 200 `{ success: true }`.

---

## K. Progress & Analytics

- **Endpoints**:
  - `GET /api/user/profile`
  - `GET /api/user/progress`
  - `GET /api/user/analytics`
  - `GET /api/user/weaknesses`
  - `GET /api/user/vocabulary-mastery`
- **Access Control**: All endpoints require active authentication (`requireAuth: true`). User ID is bound to verified token `sub`, preventing cross-user data access.

---

## L. Storage

- **Storage Service (`api/_lib/storage/storage.service.ts`)**:
  - Uses Supabase Storage client for media assets (listening audio, user audio submissions).
  - Audio uploads generate presigned URLs with 15-minute expiration (`expiresIn: 900`).
  - Private user submissions are isolated under user-scoped paths (`submissions/{user_id}/*`).
- **Remote Bucket Audit**: **BLOCKED** (Requires live Supabase credentials).

---

## M. Answer-Key Security

Adversarial inspection of question endpoints confirmed complete protection against pre-grading answer disclosure:

1. **`GET /api/questions`**:
   - Query explicitly projects: `id, skill, cefr_level, type, prompt_th, prompt_en, context_passage, audio_storage_path, weakness_tag, difficulty_weight`
   - Option query projects: `id, key, text`
   - Omitted: `correct_answer_text`, `is_correct`, `explanation_th`, `explanation_en`, `feedback_th`
2. **`GET /api/mock-exams/session`**:
   - Prohibits answer keys across all exam questions and options.
   - Saved user answers contain only `selected_key` and `text_answer`, never grading indicators.
3. **Database RLS Invariant**: Client cannot query `is_correct` via anon client without hitting serverless API masking.

---

## N. API Authorization (All 25 Endpoints)

| Endpoint | Method | Auth Required | Authz Scope | Input Validation | Rate Limit | Payload Limit | Sensitive Data Filtered | Audit Result |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/api/health` | GET | No | Public | None | None | N/A | None exposed | PASS |
| `/api/cefr/levels` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/content/vocabulary` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/content/grammar` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/content/reading` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/content/listening` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/content/writing` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/content/speaking` | GET | No | Public | Query schema | 60/min | N/A | None exposed | PASS |
| `/api/questions` | GET | No | Public | Query schema | 60/min | N/A | Answer keys stripped | PASS |
| `/api/auth/me` | GET | Yes | Token Sub | None | 60/min | N/A | Token claims only | PASS |
| `/api/user/profile` | GET/PATCH | Yes | Token Sub | Body schema | 30/min | 1 MB | Server fields immutable | PASS |
| `/api/user/progress` | GET | Yes | Token Sub | Query schema | 60/min | N/A | User-isolated only | PASS |
| `/api/user/analytics` | GET | Yes | Token Sub | Query schema | 60/min | N/A | User-isolated only | PASS |
| `/api/user/weaknesses` | GET | Yes | Token Sub | Query schema | 60/min | N/A | User-isolated only | PASS |
| `/api/user/vocabulary-mastery` | GET | Yes | Token Sub | Query schema | 60/min | N/A | User-isolated only | PASS |
| `/api/user/sync-guest` | POST | Yes | Token Sub | Body schema | 10/min | 1 MB | Scoped to token user | PASS |
| `/api/practice/submit` | POST | Optional | Guest/Token | Body schema | 60/min | 1 MB | Graded server-side | PASS |
| `/api/assessment/submit` | POST | Optional | Guest/Token | Body schema | 10/min | 1 MB | Graded server-side | PASS |
| `/api/assessment/result` | GET | Optional | Guest/Token | Query schema | 60/min | N/A | Diagnostic disclaimer | PASS |
| `/api/mock-exams` | GET | No | Public | Query schema | 60/min | N/A | Published exams only | PASS |
| `/api/mock-exams/start` | POST | Yes | Token Sub | Body schema | 10/min | 1 MB | Scoped to token user | PASS |
| `/api/mock-exams/session` | GET | Yes | Attempt Owner | Query schema | 120/min | N/A | Answer keys stripped | PASS |
| `/api/mock-exams/autosave` | POST | Yes | Attempt Owner | Body schema | 120/min | 1 MB | Locked on timeout | PASS |
| `/api/mock-exams/submit` | POST | Yes | Attempt Owner | Body schema | 10/min | 1 MB | Anti-double submit | PASS |
| `/api/mock-exams/results` | GET | Yes | Attempt Owner | Query schema | 60/min | N/A | Post-grading scores only | PASS |

---

## O. Rate Limiting Architecture

- **Implementation**: In-memory sliding window bucket (`RateLimiter.check()` in `api/_lib/rate-limit/rate-limiter.ts`).
- **Production Assessment**: **PARTIAL — non-distributed rate limiting**.
- **Serverless Architectural Reality**:
  - In a multi-instance Vercel/serverless runtime, each ephemeral Lambda container maintains its own memory space.
  - In-memory buckets provide single-container abuse protection but do NOT provide global cluster-wide rate limiting.
  - **Production Recommendation**: Integrate a distributed cache provider (e.g. Upstash Redis via `@upstash/ratelimit`) before large-scale public launch.

---

## P. Security Headers & CORS

- **Security Headers (`next.config.js`)**:
  - `Content-Security-Policy`: Restricts scripts, objects (`object-src 'none'`), frame ancestors (`frame-ancestors 'none'`), and connects strictly to `self` and Supabase domains.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(self), geolocation=(), payment=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- **CORS Handling (`api/_lib/handler/api-handler.ts`)**:
  - Enforces explicit origin whitelist (`APP_URL`, `VERCEL_URL`, localhost ports).
  - Injects `Vary: Origin` header.
  - Cache-Control set to `no-store, no-cache, must-revalidate` for authenticated routes.

---

## Q. Secret & Bundler Audit

- **Gitleaks Secret Scan (`scan_secrets`)**:
  - `app/`: **0 leaks (CLEAN)**
  - `api/`: **0 leaks (CLEAN)**
  - `lib/`: **0 leaks (CLEAN)**
  - `components/`: **0 leaks (CLEAN)**
  - `src/`: **0 leaks (CLEAN)**
- **Browser Sourcemaps**:
  - Explicitly disabled in `next.config.js` (`productionBrowserSourceMaps: false`).
  - Confirmed 0 `.map` files generated in `.next/static/chunks/`.

---

## R. Production Fallback Audit

| Component / File | Fallback Pattern | Classification | Safety Justification |
|:---|:---|:---:|:---|
| `MockExamView.tsx` | Static catalog fallback on network error | **SAFE** | Displays exam titles for preview; line 375 explicitly blocks fake exam submissions without server session token. |
| `AssessmentView.tsx` | Local assessment calculation for guests | **SAFE** | Provides immediate diagnostic estimate; clearly disclaimed as platform heuristic. Syncs on login. |
| `VocabularyView.tsx` | Static curriculum word bank | **SAFE** | Educational curated vocabulary remains accessible if database query is empty. |
| `GrammarView.tsx` | Static topic questions | **SAFE** | Curriculum questions remain available for self-study. |
| `SpeakingView.tsx` | Manual text input fallback | **SAFE** | Accessibility fallback for environments lacking Web Speech API or microphone permission. |
| `QuestionCard.tsx` | Offline practice grading | **DEV / OFFLINE ONLY** | In live production mode, server grading endpoint (`/api/practice/submit`) is invoked. |
| `lib/supabaseClient.ts`| Placeholder URL fallback | **SAFE (Fails Closed)**| Prevents application initialization crash while failing closed on remote network calls. |

---

## S. Security Tools Execution

| Tool / Script | Status | Findings |
|:---|:---:|:---|
| `scan_secrets` | **PASS** | 0 hardcoded secrets or private keys in source codebase |
| `audit-ai-slop.ps1` | **PASS** | 0 robotic buzzwords, 0 Unicode emojis, 0 em-dashes across 228 source files |
| `audit-architecture-boundaries.ps1` | **PASS** | 0 cross-layer boundary leaks |
| `audit-mermaid-parity.ps1` | **PASS** | 100% diagram-to-code parity |
| `scan_owasp` | **NOT AVAILABLE** | Network timeout downloading remote Semgrep ruleset |
| `godkiller-mcp` | **PASS** | Task `task_65bf04e2` opened and advanced through `open -> reproduce -> hypothesize -> localize -> fix` |

---

## T. Full Regression Verification

### 1. Automated Vitest Suite
```text
Test Files  14 passed (14)
     Tests  192 passed (192)
  Duration  2.68s
```
All 192 tests across all 14 test suites pass cleanly with zero regressions.

### 2. Production Build (`next build`)
```text
✓ Compiled successfully in 3.8s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (38 of 38)
✓ Prerendering routes (13 pages, 25 route handlers)
```
All 38 routes compile and prerender cleanly with 0 errors and 0 warnings.

### 3. Multi-Viewport Browser Verification
- 375px (Mobile): PASS
- 640px (Small Tablet): PASS
- 768px (Tablet): PASS
- 1024px (Desktop Small): PASS
- 1280px (Desktop Wide): PASS

---

## U. Remaining Blockers

### Blocker 1: Live Supabase Environment Variables Not Configured
1. **Blocker**: Missing `.env.local` containing live Supabase production credentials.
2. **Evidence**:
   - `c:\CEFR_platform\.env.local` does not exist.
   - `NEXT_PUBLIC_SUPABASE_URL`: MISSING
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: MISSING
   - `SUPABASE_SERVICE_ROLE_KEY`: MISSING
   - `DATABASE_URL` / `SUPABASE_DB_URL`: MISSING
3. **Exact Action Required**:
   - Create `.env.local` in project root with valid credentials:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     SUPABASE_URL=https://<your-project-ref>.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
     SUPABASE_DB_URL=postgresql://postgres.<your-project-ref>:<db-password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Execute database migrations in `supabase/migrations/` against the remote PostgreSQL instance.
   - Execute Phase 5.5 live verification tests against the provisioned project.

---

```text
============================================================
FINAL GATE DECISION:
BLOCKED
============================================================
Reason: Real Supabase project credentials are missing.
Code-level security, RLS schema, Next.js 15 SSR, and 192 tests are fully verified.
Live verification requires real Supabase environment variables.
============================================================
```
