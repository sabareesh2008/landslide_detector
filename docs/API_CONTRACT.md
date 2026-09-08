# Landslide Sentinel AI — REST API Contract & Data Protocols

This document defines the formal REST API contract, request/response formats, authentication, error schemas, and data provenance for Landslide Sentinel AI.

---

## 1. Global Response Envelopes & Data Modes

Every API response adheres to a standard envelope indicating the active operational mode and provenance:

### Standard Success Envelope
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-09-08T04:15:00Z",
  "mode": "LIVE",
  "source": "NASA GPM IMERG Early Run",
  "dataQuality": {
    "status": "VALIDATED",
    "freshnessMinutes": 12
  }
}
```

### Standard Error / Fallback Envelope
When an external upstream service is unavailable, the API **never** fabricates synthetic data. Instead, it returns an explicit error envelope:
```json
{
  "success": false,
  "error": {
    "code": "DATA_UNAVAILABLE",
    "message": "NASA IMERG satellite stream is currently unreachable",
    "source": "NASA PPS HTTPS",
    "lastSuccessfulObservation": "2026-09-07T16:30:00Z",
    "recommendedAction": "Rely on latest validated historical telemetry or local rain gauge readings."
  }
}
```

---

## 2. API Endpoints

### 2.1 System Health & Service Readiness
* **Endpoint**: `GET /api/health`
* **Authentication**: None
* **Response**:
```json
{
  "status": "online",
  "system": "Landslide Sentinel AI Backend",
  "version": "2.4.0",
  "timestamp": "2026-09-08T04:15:00Z",
  "activeMode": "LIVE",
  "services": {
    "geminiVisionReady": true,
    "rainfallPipelineConnected": true,
    "databaseConnected": false
  }
}
```

---

### 2.2 Near-Real-Time Rainfall Latest Summary
* **Endpoint**: `GET /api/rainfall/latest`
* **Authentication**: None
* **Response**:
```json
{
  "generated_at_utc": "2026-09-07T16:43:00Z",
  "source": "NASA GPM IMERG Early Run",
  "mode": "LIVE",
  "locations": {
    "Rangpo": {
      "rainfall_1h_mm": 0.8,
      "rainfall_24h_mm": 10.4,
      "rainfall_72h_mm": 29.8,
      "rainfall_7d_mm": 77.0,
      "latest_rainfall_mm": 0.4,
      "latest_observation_utc": "2026-09-07T16:30:00Z",
      "records": 880
    },
    "Singtam": {
      "rainfall_1h_mm": 0.6,
      "rainfall_24h_mm": 11.2,
      "rainfall_72h_mm": 30.8,
      "rainfall_7d_mm": 83.6,
      "latest_rainfall_mm": 0.3,
      "latest_observation_utc": "2026-09-07T16:30:00Z",
      "records": 880
    }
  }
}
```

---

### 2.3 Computer Vision Field Media Hazard Analysis
* **Endpoint**: `POST /api/ai/analyze-field-media`
* **Authentication**: Optional Bearer Token (Disaster Authority)
* **Request Body**:
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg",
  "locationName": "NH-10 Km 44 Majhitar",
  "state": "Sikkim",
  "incidentType": "Tension Crack / Toe Erosion",
  "userNotes": "Subsurface water weeping through road shoulder retaining wall"
}
```
* **Success Response (Gemini 3.7 Flash Active)**:
```json
{
  "success": true,
  "source": "Gemini 3.7 Flash Multimodal Vision",
  "analysis": {
    "detectedHazard": "Longitudinal Road Tension Crack",
    "severityEstimate": "Severe",
    "confidence": 0.91,
    "detectedFeatures": [
      "Asphalt shear aperture approx 8-12 cm",
      "Subsurface mud slurry discharge along hill toe",
      "Downhill slope tilt > 35 degrees"
    ],
    "annotatedRegions": [
      { "x": 25, "y": 35, "w": 50, "h": 40, "label": "Active Shear Plane" }
    ],
    "geminiAnalysis": "Active differential settlement threatening road shoulder integrity. Immediate single-lane traffic restriction and geotextile covering recommended."
  }
}
```
* **Unconfigured API Key Response**:
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "GEMINI_API_KEY is not configured. Field image queued for manual engineer review."
  }
}
```

---

### 2.4 Emergency Situation Bulletin Synthesis
* **Endpoint**: `POST /api/ai/synthesize-bulletin`
* **Authentication**: None
* **Request Body**:
```json
{
  "state": "Sikkim",
  "criticalZones": ["Rangpo Checkpost", "Singtam Bazar Bypass", "Majhitar Slopeline"],
  "rainfallAverage": 28.5,
  "affectedRoads": ["NH-10", "Melli-Phong Road"],
  "language": "en"
}
```
* **Response**:
```json
{
  "success": true,
  "bulletin": "DISASTER SITUATION REPORT (Sikkim): Continuous 72h precipitation has increased slope failure susceptibility across the Rangpo–Singtam NH-10 corridor. Pre-positioned SDRF tactical teams are alerted. Night vehicular movement restricted on vulnerable stretches."
}
```
