# SIH Technical Architecture — Landslide Sentinel AI

## 1. System Technology Stack

| Layer | Technologies & Frameworks | Key Highlights |
|---|---|---|
| **Frontend UI/UX** | HTML5, Modern Vanilla ES6+ JavaScript, CSS Grid/Flexbox | Zero-build architecture; no bundler lock-in; sub-100ms render |
| **GIS Mapping** | Leaflet.js, OpenStreetMap CartoDB, GeoJSON | Multi-layer toggle (Highway, Rivers, Infrastructure, Shelters, Risk Heatmap) |
| **ML Engine** | Python 3.11, Scikit-Learn, HistGradientBoosting, Platt Scaling | 27 physical features, sub-50ms single point inference |
| **Data Ingestion** | NASA GPM / IMERG V07, SRTM DEM 30m, GSI Ground Truth | 101 validated landslide events from Sikkim Geological Records |
| **IoT & Edge** | LoRaWAN Protocol, MEMS Inclinometers, Capacitive VWC Probes | Outlier filtering, IQR anomaly scoring, physical cross-check |
| **Offline Engine** | Service Worker (Cache-First + Network Fallback), IndexedDB | Offline GeoJSON tile and emergency dataset caching |
| **Deployment** | Docker, Nginx Alpine, GitHub Actions, GitHub Pages | Continuous deployment with automated health check pipelines |

---

## 2. End-to-End Data Pipeline Architecture

```
[NASA IMERG V07 Satellite] ──┐
                             ├─► [Python Ingestion & Freshness Engine]
[Ground IoT LoRa Sensors]   ──┘           │
                                          ▼
[SRTM 30m Digital Elevation] ──► [27-Dimensional Feature Extractor]
                                          │
                                          ▼
                                [Calibrated HistGBM Model]
                                          │
         ┌────────────────────────────────┴──────────────────────────────┐
         ▼                                                               ▼
[Corridor Risk Matrix (10x10)]                                [Road Blockage & Cascade]
         │                                                               │
         ▼                                                               ▼
[Multi-Layer Leaflet GIS Map]                                  [Emergency Response Engine]
         │                                                               │
         └────────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
                     [Zero-Build Progressive Web App]
               (9 Indian Languages + Voice TTS + Offline PWA)
```

---

## 3. Machine Learning Specifications
- **Champion Architecture**: Histogram-based Gradient Boosting Classifier (`HistGradientBoostingClassifier`).
- **Feature Count**: 27 engineered physical features (topography, antecedent rolling rainfall, interaction terms).
- **Validation Protocol**: GroupKFold / Stratified Spatial Split on 101 validated Sikkim historical events.
- **Benchmark Performance**:
  - ROC-AUC: `0.9977`
  - PR-AUC: `0.9124`
  - Recall: `1.0000`
  - Precision: `0.8235`
  - F1-Score: `0.9032`
  - Brier Calibration Score: `0.0083`
