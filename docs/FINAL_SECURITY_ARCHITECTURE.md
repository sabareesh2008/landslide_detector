# Landslide Sentinel AI - Final Security & Governance Architecture

## 1. Executive Summary
Landslide Sentinel AI is designed as a mission-critical disaster warning and early response platform. Operating in high-stakes environments where inaccurate data can lead to panic or delayed evacuations, the platform implements defense-in-depth security principles across ingestion, processing, human verification, and dissemination.

---

## 2. Threat Modeling & Mitigation Matrix

| Threat Category | Potential Attack Vector | Impact | Engineering Mitigation |
|---|---|---|---|
| **Data Poisoning** | Malicious submission of fake field photos claiming imminent slides | False alarms, misallocated rescue assets | Automated CV pre-filter + Mandatory Geotechnical Engineer Sign-off before active learning inclusion |
| **Telemetry Tampering** | Spoofed IoT sensor packets reporting false tilt or pore-pressure | Unwarranted road closures | Moving-window outlier rejection, IQR anomaly gating, and physical cross-correlation with collocated rain gauges |
| **Unauthorized Dispatch** | Public viewer triggering emergency machinery dispatch | Disruption of civil response | Strict client/server RBAC requiring `INCIDENT_COMMANDER` role token and dual-confirmation modal |
| **Denial of Service** | Network link disruption during heavy monsoons | Inability to load warnings | Progressive Web App (PWA) with Service Worker pre-caching, offline GeoJSON storage, and fallback emergency protocols |
| **Data Hallucination** | Generative/uncalibrated ML model giving random risk scores | Loss of trust, catastrophic failure | Purely deterministic inference on calibrated HistGradientBoosting model; Platt scaling; no LLM in numeric risk scoring |

---

## 3. Governance and Auditability

- **Event Ledger**: All state machine changes (e.g. `LOW -> WATCH -> HIGH -> CRITICAL`) are immutably logged with timestamp, triggering hydrological factors, and acknowledging operator ID.
- **Reproducibility Guarantee**: Model provenance metadata, feature arrays, and raw NASA GPM/IMERG telemetry are stored with fixed hashes to allow post-incident review and validation.
