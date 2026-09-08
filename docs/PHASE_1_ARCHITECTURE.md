# Landslide Sentinel AI — Phase 1 Architecture Blueprint

**Project**: Landslide Sentinel AI — Predictive Landslide Early Warning & Disaster Response Platform  
**Target Region**: Rangpo–Singtam / NH-10 Corridor, Sikkim, India  
**Scope**: Current Phase 1 Baseline Architecture vs Target Production Architecture (Phases 1–8)

---

## 1. Current Phase 1 Baseline Architecture

In Phase 1, the platform operates as a **dual-layer decoupled system**:

```
                    ┌──────────────────────────────────────────────┐
                    │               REAL DATA SOURCES              │
                    │  • NASA GPM IMERG 30-min Early Run           │
                    │  • Copernicus GLO-30 DSM (UTM Zone 45N)      │
                    │  • GSI National Landslide Inventory (N=103)  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       DATA QUALITY & EXTRACTION LAYER        │
                    │  • scripts/rainfall_incremental_updater.py   │
                    │  • scripts/dem_processor.py                  │
                    │  • data/rainfall_history.csv (Validated)     │
                    │  • data/dem/processed/ (Reprojected Rasters) │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │     MACHINE LEARNING & INFERENCE PIPELINE    │
                    │  • scripts/ml_pipeline.py                    │
                    │    - 24-Dimensional Feature Engineering      │
                    │    - HistGradientBoostingClassifier          │
                    │    - 3-Fold Platt Scaling Calibration        │
                    │  • scripts/risk_engine.py                    │
                    │    - Generates data/current_risk.json        │
                    │    - Generates data/risk_grid.geojson        │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      STATIC ZERO-BUILD PRESENTATION UI       │
                    │  • index.html + css/style.css                │
                    │  • js/app.js (Master Coordinator)            │
                    │  • js/map.js (Leaflet 7-Layer GIS Engine)    │
                    │  • js/charts.js (Chart.js Time-Series)       │
                    │  • js/replay.js (Historical Event Scrubber)  │
                    │  • Visible Data Mode: LIVE DATA              │
                    └──────────────────────────────────────────────┘
```

---

## 2. Multi-Phase Target Enterprise Architecture (Phases 1–8)

```
[DATA SOURCES]
NASA IMERG (30m) ──┐
Sentinel-1 InSAR ──┼──► [DATA VALIDATION & QA] ──► [FEATURE ENGINE] ──► [STATIC SUSCEPTIBILITY] (PHASE 3)
Sentinel-2 NDVI  ──┤    (Outlier Rejection,        (Multi-window Rain,   (Slope, Aspect, Lithology, TWI)
Copernicus DEM   ──┤     Spatial CRS Alignment,     Antecedent Moisture,             +
IMD Doppler Radar ─┤     Latency Tracking)          InSAR Deformation)   [DYNAMIC TRIGGER MODEL] (PHASE 2)
IoT Ground Gauges ─┘                                                     (Short burst, 24h/72h Storm)
                                                                                     │
                                                                                     ▼
                                                                        [CALIBRATED ML RISK FUSION]
                                                                        (Platt / Isotonic GBDT Ensemble)
                                                                                     │
                                                                                     ▼
                                                                        [EXPLAINABLE RISK ENGINE]
                                                                        (SHAP / Physical Drivers)
                                                                                     │
                                   ┌─────────────────────────────────────────────────┴──────────────────────────────┐
                                   ▼                                                                                ▼
                    [IMPACT & INFRASTRUCTURE] (PHASE 5)                                             [EARLY WARNING ALERT ENGINE]
                    • NH-10 Road Blockage Estimation                                                • Multi-Tier Alerts (LOW/WATCH/HIGH/CRITICAL)
                    • Critical Bridge & Settlement Proximity                                        • Automated Webhooks (SMS, Telegram, WhatsApp)
                    • Alternate Evacuation Routing                                                  • Disaster Authority Dispatch Protocols
                                   │                                                                                │
                                   └────────────────────────────────┬───────────────────────────────────────────────┘
                                                                    │
                                                                    ▼
                                                 [DECISION SUPPORT & PRESENTATION LAYER]
                                                 • State / District Command Center (GIS Dashboard)
                                                 • Field Response App (Offline GPS + Multimodal AI)
                                                 • Multilingual Citizen Advisory Portal (EN, HI, NE)
```

---

## 3. Implementation Phases Roadmap

* **PHASE 1 (COMPLETED)**: Complete Project Audit, Data Integrity Cleanup, Real Data Ingestion Baseline, Removal of Randomness, Data Modes, Zero-Build Static Dashboard.
* **PHASE 2 (PLANNED)**: Real Ground-Truth ML Pipeline (ERA5/IMERG meteorological hindcast cross-referencing, elimination of proxy labels, scientific calibration curves).
* **PHASE 3 (PLANNED)**: Advanced Geospatial & Hydrological Processing (Topographic Wetness Index - TWI, stream power index, flow accumulation, lithological overlays).
* **PHASE 4 (PLANNED)**: IoT Telemetry & Multimodal Field AI (Borehole piezometers, tipping-bucket ground rain gauges, verified Gemini 3.7 vision pipeline).
* **PHASE 5 (PLANNED)**: Infrastructure Impact & Disaster Logistics (NH-10 culvert blockage simulation, alternate bypass routing, emergency shelter capacities).
* **PHASE 6 (PLANNED)**: Multilingual Expansion & Accessibility (Nepali, Hindi, Bengali local voice alerts and SMS integration).
* **PHASE 7 (PLANNED)**: Enterprise Hardening & Security (PostGIS spatial database deployment, rate limiting, role-based access control).
* **PHASE 8 (PLANNED)**: Smart India Hackathon (SIH) Live Demo & Evaluation Suite (End-to-end reproducible validation tests and interactive disaster scenario sandbox).
