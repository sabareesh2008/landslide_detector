# 🛡️ Landslide Sentinel AI

### AI-Powered Predictive Early Warning & Emergency Response Platform
**Target Corridor**: Rangpo–Singtam / NH-10 Highway Lifeline, Sikkim, India  
**System Version**: `1.0.0-SIH` (Smart India Hackathon)

[![NASA IMERG Pipeline](https://img.shields.io/badge/NASA%20IMERG-Near%20Real--Time%20(30--min)-0284c7.svg)](https://gpm.nasa.gov/)
[![Copernicus DEM](https://img.shields.io/badge/Copernicus%20DEM-30m%20UTM%2045N-10b981.svg)](https://spacedata.copernicus.eu/)
[![ML Recall](https://img.shields.io/badge/ML%20Recall-100%25%20(0%20FN)-emerald.svg)](docs/ml/MODEL_CARD.md)
[![Brier Calibration](https://img.shields.io/badge/Brier%20Score-0.0083-blue.svg)](docs/ml/MODEL_CARD.md)
[![Localization](https://img.shields.io/badge/Languages-9%20Indian%20Languages%20%2B%20TTS-orange.svg)](locales/)
[![Deployment](https://img.shields.io/badge/Deployment-Docker%20%7C%20GitHub%20Pages-purple.svg)](Dockerfile)

---

## 📌 1. Project Overview

**Landslide Sentinel AI** is a **100% Pure Software, AI, and GIS Decision-Support Platform** designed to predict rainfall-triggered landslides along the vital **Rangpo–Singtam / NH-10 mountain lifeline in Sikkim** before they occur. 

By coupling **NASA satellite precipitation (GPM/IMERG)** with **high-resolution Copernicus 30m Digital Elevation Models (DEM)**, **101 validated Geological Survey of India (GSI) historical events**, and **mobile smartphone Computer Vision**, the platform delivers calibrated risk early warnings, automated road blockage impact modeling, designated shelter evacuation routing, and multilingual voice broadcasts.

---

## 🎯 2. Core Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LANDSLIDE SENTINEL AI                           │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┤
│ 🛰️ SATELLITE     │ 🗺️ SPATIAL GIS  │ 📸 FIELD AI     │ 🚨 EMERGENCY     │
│   TELEMETRY     │   10x10 MATRIX  │   VISION        │    RESPONSE      │
├─────────────────┼─────────────────┼─────────────────┼──────────────────┤
│ • 30-min NASA   │ • 100 Grid      │ • Mobile crack  │ • NH-10 road     │
│   IMERG early     Cells with live   detection with    blockage risk &  │
│   run data        probability       Computer Vision   clearance hours  │
│ • 30m DEM slope │ • 4 Highway     │ • Two-tier      │ • 4 High-ground  │
│   & ruggedness    segments        geotechnical      shelters routing   │
│ • Zero hardware │ • 6 Ranked      engineer review   │ • 1-Click rescue │
│   deployment      hotspots        gatekeeper          machinery dispatch│
└─────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

1. **Calibrated Machine Learning Engine**: Champion **HistGradientBoosting with Platt Sigmoid Scaling** delivering **ROC-AUC: 0.9977**, **PR-AUC: 0.9124**, and **Brier Score: 0.0083** across 27 engineered physical features.
2. **Spatial Risk Matrix (10x10)**: Dynamic corridor heatmaps with explicit non-color accessibility badges (`🔴 [!] CRITICAL`, `🟠 [▲] HIGH`, `🟡 [◆] WATCH`, `🟢 [✓] LOW`).
3. **Mobile Field Evidence & Active Learning**: Highway officers upload photos of tension cracks; Computer Vision evaluates fracture severity; certified engineers approve verified candidates for model retraining.
4. **Actionable Emergency Dispatch**: Computes highway blockage probability, debris clearance estimates, evacuation paths to designated shelters, and pre-positioned heavy excavators.
5. **Multilingual & Offline-First (PWA)**: Supports **9 Indian Languages** (English, Nepali, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi), Web Speech API TTS voice sirens, and complete Service Worker offline caching.

---

## 🏗️ 3. System Architecture

```
[NASA GPM IMERG 30-min Rain] ──┐
                               ├──► [Python Ingestion & Freshness Engine]
[Copernicus 30m DEM Grids]   ──┘                 │
                                                 ▼
[101 Validated GSI Events]   ──► [27-Dimensional Feature Extractor]
                                                 │
                                                 ▼
                                  [Calibrated ML Model (HistGB)]
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
[10x10 Spatial Risk Grid]                                                   [NH-10 Highway Impact Model]
         │                                                                               │
         ▼                                                                               ▼
[Leaflet Multi-Layer GIS Map]                                               [Shelters & Resource Routing]
         │                                                                               │
         └───────────────────────────────────────┬───────────────────────────────────────┘
                                                 │
                                                 ▼
                                [Zero-Build Progressive Web App]
                          • Sub-100ms UI Render on GitHub Pages / Docker
                          • 9 Languages + Voice Alerts + Offline PWA
```

---

## 📊 4. Machine Learning Benchmarks

Evaluated on strict chronological out-of-time test holdouts ($N=352$):

| Model Architecture | Model Family | ROC-AUC | PR-AUC | Precision | Recall | F1-Score | Brier Score | Role |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Baseline Logistic Regression | GLM Baseline | 0.9816 | 0.5990 | 0.2373 | 1.0000 | 0.3836 | 0.1009 | Baseline Benchmark |
| Random Forest Classifier | Bagging Ensemble | 0.9937 | 0.8520 | 0.6500 | 0.9000 | 0.7586 | 0.0393 | Comparison Ensemble |
| XGBoost Classifier | Boosted Trees | 0.9851 | 0.8980 | 0.7500 | 0.9500 | 0.8462 | 0.0108 | High-Capacity Tree |
| **HistGradientBoosting (Champion)** | **Platt Calibrated** | **0.9977** | **0.9124** | **0.8235** | **1.0000** | **0.9032** | **0.0083** | **PRODUCTION CHAMPION** |

---

## 🚀 5. Quickstart & Installation

### Option A: Open Immediately in Browser (Zero Build)
No installation required! Simply open `index.html` in any modern web browser or host on GitHub Pages.

### Option B: Run via Docker
```bash
# Build and run with Nginx Alpine container
docker-compose up -d

# Access the dashboard at http://localhost:8080
```

### Option C: Python Pipeline Environment
```bash
# 1. Clone repository
git clone https://github.com/sabareesh2008/landslide_detector.git
cd landslide_detector

# 2. Create virtual environment & install dependencies
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r scripts/requirements.txt

# 3. Execute End-to-End System Health Check
python scripts/health_check.py

# 4. Run Automated E2E Test Suite
python -m unittest tests/test_e2e_phases3_8.py -v
```

---

## 🎪 6. SIH Live Jury Demonstration Guide

1. **Start Dashboard**: Open `index.html`.
2. **Click "🏆 SIH Judge Tour"** (Top Navbar): Automatically steps through the 12 key platform innovations.
3. **Switch Data Modes**: Toggle between **LIVE DATA**, **HISTORICAL REPLAY**, and **SIMULATION MODE**.
4. **Trigger Cloudburst Scenario**: Select *"Extreme Cloudburst Scenario (120mm/24h)"* to see real-time corridor escalation to **CRITICAL [!]**.
5. **Test Multilingual Voice Alert**: Switch language to **नेपाली (Nepali)** or **हिन्दी (Hindi)** and click **🔊 Voice Broadcast (TTS)**.

---

## 📚 7. Project Documentation Index

* **SIH Pitch Suite**: [`docs/sih/`](docs/sih/) (`PROBLEM_STATEMENT.md`, `SOLUTION.md`, `INNOVATION.md`, `TECHNICAL_ARCHITECTURE.md`, `IMPACT.md`, `FEASIBILITY.md`, `SCALABILITY.md`, `LIMITATIONS.md`, `DEMO_SCRIPT.md`, `JUDGE_QA.md`)
* **Machine Learning**: [`docs/ml/`](docs/ml/) (`MODEL_CARD.md`, `DATASET_CARD.md`, `TEMPORAL_VALIDATION.md`, `FEATURE_ENGINEERING.md`, `INFERENCE_ARCHITECTURE.md`)
* **GIS & Spatial**: [`docs/gis/`](docs/gis/) (`GIS_ARCHITECTURE.md`, `SPATIAL_FEATURES.md`, `RISK_MAP.md`)
* **Emergency & Civil Defense**: [`docs/emergency/`](docs/emergency/) (`EMERGENCY_RESPONSE_ARCHITECTURE.md`, `ROAD_IMPACT_METHODOLOGY.md`)
* **Security & Governance**: [`docs/security/`](docs/security/) (`SECURITY_AND_RBAC.md`, `FINAL_SECURITY_ARCHITECTURE.md`)
* **Master System Architecture**: [`docs/FINAL_SYSTEM_ARCHITECTURE.md`](docs/FINAL_SYSTEM_ARCHITECTURE.md)
* **Project Audit Matrix**: [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md)

---

## ⚖️ 8. Scientific Limitations & Disclaimers

1. **Satellite Latency**: NASA IMERG Early Run has an intrinsic delivery latency of 4–6 hours. Real-time ground gauge data augments this pipeline for localized cloudburst detection.
2. **Topographic Granularity**: SRTM 30m digital elevation provides regional catchment slope gradients; localized sub-meter road cut fissures are identified via mobile Computer Vision field uploads.
3. **Decision Support**: The system is designed as an operational **Decision-Support System** for state and district disaster management authorities; emergency dispatches require human Incident Commander confirmation.
