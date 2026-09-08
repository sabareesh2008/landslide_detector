# Landslide Sentinel AI — Final Master System Architecture

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LANDSLIDE SENTINEL AI                                   │
│            AI-Powered Early Warning & Emergency Response Platform (NH-10 Sikkim)        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                1. INGESTION & SENSING LAYER                             │
├──────────────────────────┬─────────────────────────────┬────────────────────────────────┤
│ NASA GPM / IMERG V07     │ SRTM 30m Global DEM         │ Ground IoT LoRaWAN Mesh        │
│ • Half-hourly rain (mm)  │ • Slope, Aspect, Rugosity   │ • Inclinometers, VWC probes    │
│ • Age & latency monitor  │ • Distance to shear zones   │ • Anomaly IQR scoring & filter │
└──────────────────────────┴─────────────────────────────┴────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               2. MACHINE LEARNING ENGINE                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • Feature Engineering: 27 Physical & Dynamic Features                                   │
│ • Champion Model: HistGradientBoostingClassifier + Platt Logistic Sigmoid Scaling       │
│ • Metrics: ROC-AUC: 0.9977 | PR-AUC: 0.9124 | Brier Score: 0.0083 | Recall: 1.0000     │
│ • Single-Source-of-Truth Inference: scripts/ml/inference.py                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           3. SPATIAL & IMPACT INTELLIGENCE                              │
├──────────────────────────┬─────────────────────────────┬────────────────────────────────┤
│ 10x10 Spatial Risk Grid  │ NH-10 Lifeline Modeling     │ Multimodal Field Vision AI     │
│ • 100 Grid Cells         │ • Segment Blockage %        │ • Mobile Tension Crack CV      │
│ • Dynamic Threat Tiers   │ • Clearance Hours Estimate  │ • Active Learning Staging      │
│ • Hotspot Identification │ • Alternate Route Routing   │ • Geotech Engineer Sign-off    │
└──────────────────────────┴─────────────────────────────┴────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        4. PRESENTATION & EMERGENCY DISPATCH                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • Zero-Build Static Web App / Docker Nginx Container (Sub-100ms render)                 │
│ • Leaflet Multi-Layer GIS Map (Highway, Infrastructure, Rivers, Shelters, Hotspots)     │
│ • Multilingual Localization (9 Languages: EN, NE, HI, BN, TA, TE, KN, ML, MR)          │
│ • Web Speech API Text-to-Speech Voice Broadcast                                         │
│ • Offline PWA Service Worker (Cache-First + Network Fallback)                           │
│ • Role-Based Access Control (5 Roles: Public, Officer, Analyst, Geotech, Commander)     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Directory Structure

```
├── .github/workflows/          # Continuous deployment and automated telemetry update
├── css/                        # Modern responsive CSS architecture
├── data/
│   ├── alerts/                 # State machine active alerts
│   ├── field_reports/          # Multimodal evidence & verified training candidates
│   ├── gis/                    # GeoJSON layers (Roads, Infrastructure, Rivers, Risk Zones)
│   ├── infrastructure/         # NH-10 road blockage assessments & cascade chains
│   ├── iot/                    # LoRa sensor telemetry & anomaly logs
│   ├── model/                  # ML artifacts, metrics, and dataset v001
│   ├── rainfall/               # Processed IMERG time series
│   ├── resources/              # Pre-positioned disaster response machinery
│   ├── shelters/               # Designated high-ground evacuation shelters
│   └── validated/              # 101 GSI Ground Truth landslide events
├── docs/                       # Comprehensive architectural & SIH documentation
├── js/                         # Zero-build modular ES6+ JavaScript modules
│   ├── api.js                  # Centralized asynchronous data repository
│   ├── app.js                  # Master application orchestrator
│   ├── auth.js                 # Role-Based Access Control & audit logger
│   ├── demo.js                 # SIH guided judge tour & scenario simulator
│   ├── emergency.js            # Infrastructure impact & shelter routing view
│   ├── field_ai.js             # Computer Vision & field report review view
│   ├── i18n.js                 # 9-language translation engine & TTS speech synthesizer
│   ├── iot.js                  # IoT ground sensor dashboard view
│   └── map.js                  # Multi-layer Leaflet GIS spatial engine
├── locales/                    # 9 localized language dictionaries (JSON)
├── scripts/                    # Verified Python processing & ML pipeline scripts
│   ├── emergency/              # Road impact & disaster cascade analyzer
│   ├── gis/                    # 10x10 spatial risk grid generator
│   ├── iot/                    # IoT anomaly detector & telemetry processor
│   ├── ml/                     # Model training, calibration, benchmark & inference
│   ├── health_check.py         # End-to-end system health validator
│   └── risk_engine.py          # Unified spatial risk orchestrator
├── tests/                      # Python automated E2E unit & integration test suite
├── Dockerfile                  # Production Nginx Alpine multi-stage container
├── docker-compose.yml          # Single-command local container runner
├── nginx.conf                  # Hardened web server config with security headers
└── VERSION                     # Semantic release version tag (1.0.0-SIH)
```
