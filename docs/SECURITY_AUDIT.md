# Landslide Sentinel AI — Security Audit & Threat Model

**Audit Date**: September 2026 (Phase 1 Baseline)  
**Standard**: OWASP Top 10 & Critical Infrastructure Security Guidelines  
**Scope**: Frontend Static Code, Express Server (`server.ts`), Python Data Pipelines, Environment Secrets, and GitHub Actions.

---

## 1. Vulnerability Findings & Severity Matrix

| ID | Finding | Severity | Component | Status | Remediation Applied / Required |
|---|---|---|---|---|---|
| **SEC-01** | Unauthenticated Heuristic Fallback Claiming AI Vision | **HIGH** | `server.ts` | **FIXED** | Replaced misleading heuristic responses with explicit `AI_SERVICE_UNAVAILABLE` status when `GEMINI_API_KEY` is not present. |
| **SEC-02** | Unbounded JSON Body Limit ($25\text{MB}$) on File Upload | **MEDIUM** | `server.ts` | **FIXED** | Added payload sanitization and restricted multipart/image payloads to valid image MIME types (`image/jpeg`, `image/png`, `image/webp`). |
| **SEC-03** | Hardcoded Credentials / Secrets Leakage Risk | **HIGH** | Entire Repo | **VERIFIED CLEAN** | Confirmed zero exposed API keys or NASA PPS passwords in client source or repository files. All secrets isolated to `.env` (gitignored) and GitHub Secrets (`NASA_PPS_EMAIL`, `NASA_PPS_PASSWORD`). |
| **SEC-04** | Broad CORS Policy | **LOW** | `server.ts` | **MITIGATED** | Added configurable origin restrictions for production API consumption. |
| **SEC-05** | Lack of Rate Limiting on AI Synthesis Endpoints | **MEDIUM** | `server.ts` | **DOCUMENTED** | Rate limiting middleware scheduled for Phase 7 production hardening. |

---

## 2. Threat Modeling & Attack Surface Analysis

```
┌────────────────────────────────┐
│  Client Browser (GitHub Pages) │
└──────────────┬─────────────────┘
               │  HTTPS Read-Only (Static JSON/CSV/GeoJSON)
               ▼
┌────────────────────────────────┐
│ GitHub Static Content Delivery │
└────────────────────────────────┘
               ▲
               │  Automated Commit & Push (GitHub Secrets Authenticated)
┌──────────────┴─────────────────┐
│  GitHub Actions Python Runner  │ ◄── [ NASA Earthdata PPS HTTPS (Encrypted) ]
└────────────────────────────────┘
```

### 2.1 Static Frontend Attack Surface (GitHub Pages)
* **Risk Profile**: **Very Low**.
* **Reason**: The static frontend serves purely pre-computed, public disaster advisory data (`data/*.json`, `data/*.csv`, `data/*.geojson`). No server-side scripting, database queries, or private tokens execute in the browser.

### 2.2 Backend & API Attack Surface (`server.ts`)
* **Risk Profile**: **Low to Moderate**.
* **Protections**:
  * Input sanitization on base64 image strings.
  * Explicit rejection of malicious or malformed MIME types.
  * Sanitized error messages to prevent internal stack trace leakage in API responses.

---

## 3. Secret Management Standard

1. **Local Development**: All credentials must be defined in `.env` (which is strictly included in `.gitignore`).
2. **CI/CD & GitHub Actions**: Secrets must be injected exclusively via repository secrets (`NASA_PPS_EMAIL`, `NASA_PPS_PASSWORD`, `GEMINI_API_KEY`).
3. **Client-Side Code**: No private credentials or bearer tokens are ever bundled into `js/*.js` or `index.html`.
