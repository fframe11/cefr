# Phase 6.1 — Production Deployment Target & Configuration Audit Report

## Executive Summary & Target Comparison Matrix

Phase 6.1 performed an exhaustive architectural inspection, container build verification, environment variable classification, upload payload constraint analysis, and deployment target evaluation comparing **Vercel** vs. **Google Cloud Run** for the CEFR English Preparation Platform.

| Architectural Dimension | Vercel Serverless | Google Cloud Run (Container) | Current Baseline Status |
|:---|:---:|:---:|:---|
| **Next.js 15 Standalone Support** | Serverless adapter (overrides standalone) | Native execution of `node server.js` | Built & verified in Docker (`cefr-platform:1.0.0`) |
| **Containerization (`Dockerfile`)** | Not utilized (direct source build) | Fully supported (352MB Alpine image) | Built cleanly; runs as unprivileged user `nextjs` |
| **API Route Handlers (27 endpoints)** | AWS Lambda Serverless Functions | Persistent Node.js container process | All 27 endpoints operational |
| **Supabase SSR / Cookies** | Native Vercel Edge / Serverless integration | Native Node 22 cookie headers | Fully verified live in Phase 5.4 & 5.5 |
| **Audio Upload Payload Limit** | **4.5 MB Hard Limit** (HTTP 413 Gateway) | **32 MB HTTP Body** (Streaming supported) | Speaking uploads up to 10MB base64 (~13.3MB) |
| **In-Memory Rate Limiting** | Ephemeral / Non-distributed (resets on invocations) | Persistent per container instance | Works per-container; needs Redis for multi-instance |
| **Health Checks & Probes** | Managed serverless (no probe required) | Native HTTP Startup / Liveness `/api/health` | Verified in local container (HTTP 200) |
| **Cold Starts** | ~200ms - 500ms | 0s with min-instances=1 (~1.5s if min=0) | Fast startup on standalone |
| **Deployment Complexity** | Low (`git push` / Vercel CLI) | Medium (Artifact Registry + `gcloud run`) | Dockerfile + CI pipeline ready |

---

## 1. Current Architecture

- **Web Framework**: Next.js 15.5.26 App Router with React 18.2.0.
- **Output Mode**: `standalone` (generates `.next/standalone/server.js` and standalone node_modules traces).
- **Runtime Environment**: Node.js 22 Alpine (`node:22-alpine` in multi-stage Dockerfile).
- **Security Profile**: Container runs as unprivileged system user `nextjs` (UID 1001, GID 1001).
- **Backend Services**:
  - Remote Supabase PostgreSQL (20 relational application tables).
  - Supabase GoTrue Auth (Session refresh via Edge middleware & async cookies).
  - Remote Supabase Storage (`audio-listening` public, `audio-speaking-submissions` private RLS).
- **Current Route Count**: 40 routes (13 static pages, 27 dynamic API route handlers).

---

## 2. Environment Variable Inventory

Every environment variable utilized by the application has been cataloged without exposing secret values.

| Variable Name | Classification | Lifetime | Requirement | Purpose |
|:---|:---:|:---:|:---:|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser-safe | Build & Runtime | **Required** | Base HTTPS URL for remote Supabase instance (`atmatooytieelwiarffp.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public / Browser-safe | Build & Runtime | **Required** | Public API key for client-side Auth and storage downloads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Secret | Runtime only | **Required (Server)** | Bypasses RLS on server for grading, scoring, sync, admin, and storage upload. |
| `SUPABASE_URL` | Server-only | Runtime only | Optional | Fallback server-side Supabase URL. |
| `SUPABASE_ANON_KEY` | Server-only | Runtime only | Optional | Fallback server-side Supabase anonymous key. |
| `APP_URL` | Server-only | Runtime only | Optional | Canonical production origin for CORS validation (e.g. `https://cefr.example.com`). |
| `VERCEL_URL` | Public / Platform | Runtime only | Optional | Auto-populated by Vercel for preview and production origin verification. |
| `NODE_ENV` | System Flag | Build & Runtime | **Required** | Controls production optimizations, debug logging suppression, and cookie flags. |
| `PORT` | System / Container | Runtime only | Optional | Port for the HTTP server to listen on (default: `3000`). |
| `HOSTNAME` | System / Container | Runtime only | Optional | Host interface binding (default: `0.0.0.0` in container). |
| `NEXT_TELEMETRY_DISABLED` | Build Flag | Build & Runtime | Optional | Set to `1` to disable telemetry in Docker and CI environments. |

---

## 3. Docker Verification Result

The container image was built and inspected locally:
- **Build Command**: `docker build -t cefr-platform:1.0.0 .` (Clean build exit code 0).
- **Image Size**: **352 MB** (Optimized Alpine standalone footprint).
- **Runtime User**: `nextjs` (UID 1001, non-root).
- **Exposed Port**: `3000/tcp`.
- **Local Container Run**: Started container `cefr-test-container` on port `3001:3000`.
- **Live Container Probes**:
  - `GET http://localhost:3001/api/health` -> **HTTP 200 OK** (`{"status":"healthy","database_configured":true,"auth_configured":true}`).
  - `POST http://localhost:3001/api/speaking/upload` -> **HTTP 401 Unauthorized** (Auth guard active inside container).
  - `GET http://localhost:3001/api/listening/audio-url` -> **HTTP 400 Bad Request** (Validation guard active inside container).
- **Container Cleanup**: Stopped and removed container `cefr-test-container` cleanly.

---

## 4. Deployment Target Evaluation: Vercel vs. Google Cloud Run

### A. Vercel Evaluation
- **What Works Out-of-the-Box**:
  - Next.js 15 App Router pages, Server Components, client bundles, and font/image optimization.
  - Global edge CDN distribution for static assets.
  - Edge middleware for Supabase session refreshes.
  - Zero-config deployment from GitHub.
- **Required Configuration**:
  - Project environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`).
- **Critical Technical Limitations on Vercel**:
  1. **Serverless Payload Limit (4.5 MB)**:
     - Vercel strictly enforces a 4.5 MB request body limit on all Serverless Function invocations.
     - Student speaking audio files can reach up to 10 MB (Base64 payload ~13.3 MB).
     - Any upload exceeding 4.5 MB sent to `/api/speaking/upload` will immediately fail at Vercel's edge gateway with **HTTP 413 (Payload Too Large)** before reaching application code.
     - *Resolution required if using Vercel*: Must refactor upload architecture to use direct-to-Supabase Storage client uploads or signed presigned upload URLs.
  2. **In-Memory Rate Limiting**:
     - Vercel Serverless Functions spin up and down ephemerally across multiple AWS Lambda instances.
     - The in-memory sliding window `RateLimiter` Map does not share state across invocations, rendering rate limiting ineffective without external Redis / Upstash.

### B. Google Cloud Run Evaluation
- **What Works Out-of-the-Box**:
  - Native execution of the verified `Dockerfile` (`cefr-platform:1.0.0`).
  - Next.js 15 standalone output (`node server.js`).
  - **32 MB Request Body Limit**: Fully accommodates the 10 MB audio upload and Base64 payloads without truncation or gateway rejection.
  - Native HTTP Health Check probes mapped to `/api/health`.
  - Non-root security execution (`USER nextjs`).
  - In-memory rate limiting works reliably within active container instances.
- **Required Configuration**:
  - Google Cloud Artifact Registry repository.
  - Cloud Run Service creation with `PORT=3000` and memory allocation (recommended: 1 vCPU, 512 MB or 1 GB).
  - Secret Manager integration for `SUPABASE_SERVICE_ROLE_KEY`.
- **Limitations**:
  - Cold starts take ~1.5s if `min-instances=0` (can be eliminated by setting `min-instances=1`).

---

## 5. Upload Endpoint Review (`POST /api/speaking/upload`)

- **Payload Structure**: JSON payload `{ prompt_id, attempt_id, audio_base64, mime_type }`.
- **Size Characteristics**: 10 MB binary audio -> ~13.3 MB Base64 string.
- **Compatibility Verdict**:
  - **Docker / Cloud Run**: **100% Compatible**. Cloud Run handles up to 32 MB HTTP request bodies natively.
  - **Vercel**: **Incompatible for files >4.5 MB**. Requires architectural refactoring to presigned upload URLs if deployed to Vercel.

---

## 6. CI/CD Readiness

- **Workflow File**: `.github/workflows/ci.yml`.
- **Pipeline Stages**:
  1. Checkout repository (`actions/checkout@v4`).
  2. Setup Node.js 22 with npm caching (`actions/setup-node@v4`).
  3. Install dependencies (`npm ci`).
  4. Run automated regression suite (`npm test` — 205 tests).
  5. Compile Next.js 15 standalone output (`npm run build` — 40 routes).
  6. Verify Docker container build (`docker build -t cefr-platform:latest .`).
- **Security Check**: Pipeline does not store or leak production secrets.

---

## 7. Required Production Configuration Checklist

Before going live on the selected deployment platform, ensure:
1. `NEXT_PUBLIC_SUPABASE_URL`: Set to production instance (`https://atmatooytieelwiarffp.supabase.co`).
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Set to production publishable key.
3. `SUPABASE_SERVICE_ROLE_KEY`: Injected strictly into server runtime environment (never prefixed with `NEXT_PUBLIC_`).
4. `APP_URL`: Set to production custom domain (e.g. `https://cefr.example.com`) to enforce CORS headers.
5. `NODE_ENV`: Set to `production`.

---

## 8. Technical Recommendation

Based on the empirical findings:
1. **Primary Recommended Target: Google Cloud Run (or any container runtime such as AWS ECS / Fly.io)**:
   - Reasons:
     - Full zero-refactoring compatibility with the 10 MB audio upload endpoint (`POST /api/speaking/upload`).
     - Native standalone Docker image execution (352 MB, unprivileged user, `/api/health` probes).
     - Predictable in-memory rate limiting per instance.
2. **Alternative Target: Vercel**:
   - Viable if the team prefers zero-ops git deployment, BUT requires either:
     - Capping speaking recordings at 3 MB (~4 MB base64).
     - Refactoring `/api/speaking/upload` to issue presigned Supabase upload URLs for direct client-to-storage uploads.

---

```text
============================================================
DEPLOYMENT TARGET AUDIT COMPLETE
============================================================
Target A (Cloud Run): 100% Compatible with Current Architecture
Target B (Vercel): Compatible for Web/Auth; 4.5MB Body Limit on Speaking Upload
Container: 352MB Standalone Docker Image Verified Live
Health Check: HTTP 200 OK on Container Runtime
CI/CD: GitHub Actions Configured with Test, Build & Docker Checks
Recommended Action: Proceed to Cloud Run configuration OR implement presigned uploads for Vercel
============================================================
```
