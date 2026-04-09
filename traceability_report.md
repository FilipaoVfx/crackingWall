# Traceability Report: Image Decoding & Analysis System

This document provides a detailed traceability analysis of the evolution and troubleshooting of `src/pages/api/decode.ts` and `src/components/ImageAnalyzer.tsx` within the CrackingWall project.

## 📋 Executive Summary
The image analysis feature has evolved from a basic Astro-integrated API to a robust Cloudflare Pages Function. The primary challenges addressed throughout its development were:
1. **Cloudflare Deployment Compatibility**: Transitioning from local/Node environments to Cloudflare's serverless runtime.
2. **Environment Variable Management**: Ensuring sensitive API keys (OpenRouter, Supabase) are correctly bound in production.
3. **Advanced Error Diagnostics**: Implementing a structured error handling system to debug remote failures effectively.
4. **Quota and Integrity**: Managing user usage limits and caching results to optimize costs and performance.

---

## 🛠️ File Traceability Analysis

### 1. `src/pages/api/decode.ts` (and its variations)

| Date | Commit Hash | Author | Change Description | Problem Solved |
| :--- | :--- | :--- | :--- | :--- |
| Apr 01 | `9901379` | Philipao | Initial implementation. | Feature launch: AI image style analysis. |
| Apr 02 | `93f6546` | Philipao | Rename/Move to `functions/api/decode.ts`. | Decoupling from Astro to use Cloudflare Native Functions for better edge performance. |
| Apr 02 | `bd4acc2` | Philipao | Changed API endpoint to `.json`. | Fixed 404 errors in Cloudflare production due to routing rules. |
| Apr 03-07| `20aaf21` - `aaf7c77`| Philipao | Strict runtime environment bindings. | Resolved "Missing API Key" errors by correctly accessing Cloudflare secrets via `locals.runtime.env`. |
| Apr 07 | `12016da` | J.F. Gonzalez | Enforced strict environment bindings. | Prevented silent failures by throwing errors when required secrets are missing from the runtime. |
| Apr 07 | `23d7eba` | J.F. Gonzalez | Added actionable diagnostics. | Improved 500 error debugging by including `stage`, `requestId`, and `timestamp` in responses. |
| Apr 07 | `a98718f` | J.F. Gonzalez | `DecodeApiError` Class Refactor. | Standardized error reporting, making it easier for the frontend to handle specific failure modes. |
| Apr 07 | `f292677` | Philipao0122 | Final Env Resolution Logic. | Fixed cross-runtime compatibility (Local Dev fallback vs. Production strictness). |

### 2. `src/components/ImageAnalyzer.tsx`

| Date | Commit Hash | Author | Change Description | Problem Solved |
| :--- | :--- | :--- | :--- | :--- |
| Apr 01 | `9901379` | Philipao | Created component with Drag & Drop. | User interface for image uploads and telemetry display. |
| Apr 02 | `bd4acc2` | Philipao | Updated fetch path to `/api/decode.json`. | Synchronized with API routing changes to fix production 404s. |
| Apr 07 | (Implicit) | - | Enhanced error state handling. | Improved the "Telemetry Feed" to display detailed error messages and diagnostics from the API. |

---

## 🔍 Deep Dive: Key Technical Challenges

### 🚀 Issue 1: The Cloudflare Transition (404 & Routing)
**Problem:** When deployed, standard Astro API routes sometimes collided with Cloudflare's static asset serving, leading to 404 errors.
**Solution:** The API was moved to a Cloudflare Pages Function (`functions/api/decode.ts`) and the frontend was updated to use a `.json` extension in the URL, which forced Cloudflare to treat it as a dynamic request rather than a static file lookup.

### 🔑 Issue 2: Environmental "Ghosts"
**Problem:** `import.meta.env` and `process.env` behave differently in Cloudflare Workers/Pages. Secrets like `OPENROUTER_API_KEY` were often undefined even when set in the dashboard.
**Solution:** Implemented a refined `resolveDecodeEnv` function that prioritizes `locals.runtime.env` (the official Cloudflare way) and only falls back to other methods in development mode.

### 🛡️ Issue 3: The "Black Box" of 500 Errors
**Problem:** Early failures just returned a generic "Internal Server Error", making it impossible to know if the issue was Supabase connectivity, OpenRouter quota, or an invalid image format.
**Solution:** Introduction of `DecodeApiError`. Every failure now tracks exactly where it happened (`stage`), providing a `requestId` that matches Cloudflare logs, and specific error codes (e.g., `OPENROUTER_UNAUTHORIZED`, `SUPABASE_JOB_CREATE`).

---

## 📈 System Flow (Current State)
1. **Frontend**: Image captured via `ImageAnalyzer.tsx` -> Sent as `FormData`.
2. **API (Middleware)**: Bindings resolved -> Quota checked against Supabase.
3. **API (Processing)**: Image hashed (Cache check) -> Base64 conversion.
4. **AI Integration**: Request sent to OpenRouter (Model: `qwen2.5-vl-32b-instruct`).
5. **Persistence**: Result cached in `image_cache` -> Job status updated in `analysis_jobs`.
6. **Telemetry**: JSON results streamed back to component and displayed in the "Telemetry Feed".

---

## 🚨 Incident Report: Persistent 502 Error in Production (2026-04-09)

### Symptom
```
Failed to load resource: the server responded with a status of 502 ()
```
The `POST /api/decode` endpoint returned **502 Bad Gateway** consistently in Cloudflare Pages production. The error persisted across multiple prior fix attempts (commits `9901379` through `f292677`), leading to accumulated confusion about the root cause.

### Root Cause Analysis — Three Compounding Issues

#### Issue A: `arrayBufferToBase64` — O(n²) String Concatenation Crashing Workers

**Severity**: Critical (primary cause of 502)

The original implementation in `src/pages/api/decode.ts:39-48` used a character-by-character loop with string concatenation:

```typescript
// ❌ BEFORE — O(n²), crashes Cloudflare Workers
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]); // each += allocates a new string
  }
  return btoa(binary);
}
```

**Why this crashes**: Each `+=` on a string creates a brand-new string in memory. For a 3MB image (~3,145,728 bytes), this creates **3 million intermediate strings** with increasing size. JavaScript engines optimize small concatenations, but at this scale in Cloudflare Workers — which enforce strict CPU time limits (10ms free / 50ms paid) and memory caps — the worker **exceeds its resource limits and is killed by the runtime**, which Cloudflare surfaces as a `502 Bad Gateway`.

This issue was invisible in local dev because Node.js has generous memory/CPU limits, so the function completed (slowly) without crashing.

**Fix applied** (commit `52c6c63`):
```typescript
// ✅ AFTER — O(n) with chunked conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 8192;
  const chunks: string[] = [];

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode(...chunk));
  }

  return btoa(chunks.join(''));
}
```

**Why 8KB chunks**: `String.fromCharCode(...chunk)` uses the spread operator which is limited by the JS engine's max argument count (~65,536 in V8). 8,192 bytes stays well within that limit while minimizing iterations. The final `chunks.join('')` performs a single allocation instead of millions.

---

#### Issue B: `[vars]` in `wrangler.toml` Not Reaching Production Runtime

**Severity**: High (secondary cause — env vars undefined in production)

The `wrangler.toml` contained all three secrets under `[vars]`:

```toml
[vars]
OPENROUTER_API_KEY = "sk-or-v1-..."
SUPABASE_SERVICE_ROLE_KEY = "eyJhbG..."
PUBLIC_SUPABASE_URL = "https://cauitdpbsedajkuodsaf.supabase.co"
```

**Why this doesn't work in production**: The `@astrojs/cloudflare` adapter (v12.6.12) deploys as a **Cloudflare Pages** project with a custom `_worker.js`. In this deployment model:

| Context | `[vars]` in wrangler.toml | Dashboard Environment Variables |
|---------|--------------------------|--------------------------------|
| `wrangler pages dev` (local) | ✅ Loaded | ✅ Loaded |
| `wrangler pages deploy` (production) | ❌ **Ignored** | ✅ Loaded |

Cloudflare Pages production **only reads bindings from the Dashboard** (or from `wrangler pages secret put` CLI). The `[vars]` section is a Workers-specific feature that Pages does not honor in deployed environments.

This meant `locals.runtime.env.OPENROUTER_API_KEY` was `undefined` in production, triggering the `MISSING_ENV` error path which returned a 500 — but when combined with Issue A (worker crash before reaching env resolution on large images), the net result was the 502.

**Fix applied**: 
- Removed secrets from `wrangler.toml` (also a security fix — they were exposed in git history)
- Documented that `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must be configured in **Cloudflare Dashboard > Pages > Settings > Environment Variables** for both Production and Preview environments

---

#### Issue C: Inconsistent API Keys Across Environments

**Severity**: Medium (would cause silent failures even if A and B were fixed)

Two different `OPENROUTER_API_KEY` values existed:
- `.env` (local dev): `sk-or-v1-e7bfd5b76ad9...`
- `wrangler.toml`: `sk-or-v1-00d26b2dea9e...`

If the wrong key was used in the Dashboard (or if either key was expired/revoked), the OpenRouter API would return 401/403, which `decode.ts` wraps as a 502 (`OPENROUTER_UNAUTHORIZED`).

**Fix**: With secrets now exclusively in the Dashboard, there is a single source of truth per environment.

---

### Improvements to `resolveDecodeEnv`

The environment resolution function was refactored to track the source of **each individual variable**, not just a single global source:

```
// Before: source = "cloudflare_runtime" (single string for all vars)
// After:  sources = {
//   OPENROUTER_API_KEY: "cloudflare_runtime",
//   PUBLIC_SUPABASE_URL: "import_meta",
//   SUPABASE_SERVICE_ROLE_KEY: "cloudflare_runtime"
// }
```

This catches cases where some vars come from Cloudflare runtime and others fall through to `import.meta.env`, which indicates a misconfigured Dashboard.

### Improvements to Error Diagnostics

The catch block now includes two new fields:
- **`stack`**: First 300 chars of stack trace for unhandled exceptions (to identify Worker crashes in Cloudflare logs)
- **`runtimeEnvKeys`**: Array of all keys present in `locals.runtime.env`, so you can verify which bindings Cloudflare actually provides without exposing values

### Updated File Traceability

| Date | Commit Hash | Author | Change Description | Problem Solved |
| :--- | :--- | :--- | :--- | :--- |
| Apr 09 | `52c6c63` | Claude + Philipao | Chunked base64, env resolution refactor, secrets removed from wrangler.toml | **502 in production**: Worker crash from O(n²) base64, missing env vars from `[vars]` not reaching Pages production, exposed secrets in git |

### Pending Action Items

- [ ] **CRITICAL**: Set `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as encrypted environment variables in Cloudflare Dashboard > Pages > crackingwall > Settings > Environment Variables (both Production AND Preview)
- [ ] **RECOMMENDED**: Rotate both API keys since they were exposed in git history (commits `1fee1ff`, `67259cb`, and earlier)
- [ ] **RECOMMENDED**: Add `wrangler.toml` secrets scanning to CI to prevent future exposure

---
*Last updated: 2026-04-09*
*Analysis based on Git Commit History and live debugging session.*
