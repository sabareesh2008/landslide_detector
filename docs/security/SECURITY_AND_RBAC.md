# Security and Role-Based Access Control (RBAC) Architecture

## 1. Authentication & Authorization Model

Landslide Sentinel AI enforces strict Least-Privilege Role-Based Access Control across 5 operational personas:

| Role Name | Scope & Responsibilities | Read Access | Simulation / Replay | Verification / Triage | Emergency Dispatch | System Administration |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **PUBLIC_VIEWER** | Local citizens, commuters, tourists | Public Warnings, Evacuation Shelters, Safe Routes | ❌ | ❌ | ❌ | ❌ |
| **FIELD_OFFICER** | Ground patrols, PWD beat inspectors, SDRF guards | All telemetry, road status, field report submission | ❌ | ❌ | ❌ | ❌ |
| **NDMA_ANALYST** | Disaster management analysts, SEOC officers | Full spatial risk grid, rainfall trends, storm replay | ✅ | ❌ | ❌ | ❌ |
| **GEOTECH_ENGINEER** | Certified geologists, geotechnical researchers | Model diagnostics, IoT anomalies, SHAP features | ✅ | ✅ (Active Learning approval) | ❌ | ❌ |
| **INCIDENT_COMMANDER**| District Magistrate, Police SP, SEOC Director | Full executive command, multi-agency dispatch authorization | ✅ | ✅ | ✅ | ✅ |

---

## 2. Active Learning Human-in-the-Loop Verification Pipeline

To maintain scientific integrity and prevent catastrophic model poisoning:
1. **Raw Submission**: Public/Officer submits field photo + GPS coordinates (`status: SUBMITTED`).
2. **Computer Vision Inference**: Automated vision model detects surface fractures, colluvial accumulation, and rockfalls, generating an initial severity tag (`status: AI_ANALYZED`).
3. **Geotechnical Review**: A verified Geotechnical Engineer or Field Supervisor must review the photo, confirm the deformation type, and approve the observation (`status: FIELD_VERIFIED`).
4. **Staging for Retraining**: Only `FIELD_VERIFIED` candidate data points are added to `data/field_reports/verified_training_candidates.json` for subsequent model calibration cycles.

---

## 3. Data Ingestion & Sanitization

1. **Client-Side File Upload Sanitization**:
   - MIME type restriction: `image/jpeg`, `image/png`, `image/webp`.
   - Payload limit: Maximum 5MB per upload.
   - EXIF Sanitization: Strips non-geospatial device metadata to protect reporter privacy while preserving validated latitude/longitude.
2. **Input Coordinate Bounds Enforcement**:
   - All spatial inputs are bounded to the Sikkim Teesta corridor bounding box (`27.05°N - 27.35°N`, `88.35°E - 88.65°E`).
   - Out-of-bounds coordinates are flagged as invalid.
3. **Audit Trail Logging**:
   - All role transitions, scenario triggers, and dispatch actions generate timestamped audit records in browser `localStorage` and SEOC telemetry logs.

---

## 4. Network and Container Hardening

- **Content Security Policy (CSP)**: Disallows unauthorized inline script injection and limits map tile sources to approved CDNs.
- **Nginx Reverse Proxy**:
  - `X-Frame-Options: DENY` (prevents clickjacking).
  - `X-Content-Type-Options: nosniff` (prevents MIME type sniffing).
  - `X-XSS-Protection: 1; mode=block`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Non-Root Docker Execution**: Container runs on a lightweight Nginx Alpine base with minimal attack surface.
