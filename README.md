# 🛡️ Landslide Sentinel AI

### AI-Driven Early Landslide Risk Detection & Early-Warning System for the Rangpo–Singtam / NH-10 Corridor, Sikkim

[![NASA IMERG Pipeline](https://img.shields.io/badge/NASA%20IMERG-Near%20Real--Time%20(30--min)-0284c7.svg)](https://gpm.nasa.gov/)
[![Copernicus DEM](https://img.shields.io/badge/Copernicus%20DEM-30m%20UTM%2045N-10b981.svg)](https://spacedata.copernicus.eu/)
[![Model Performance](https://img.shields.io/badge/ML%20Recall-100%25%20(0%20FN)-emerald.svg)](docs/AI_METHODOLOGY.md)
[![Lead Time](https://img.shields.io/badge/Avg%20Lead%20Time-14.6%20Hours-f59e0b.svg)](docs/AI_METHODOLOGY.md)
[![Deployment](https://img.shields.io/badge/GitHub%20Pages-Zero--Build%20Static-purple.svg)](index.html)

---

## 📌 1. Project Objective

**Landslide Sentinel AI** is a production-grade, real-data landslide early-warning and spatial risk monitoring system designed specifically for the **Rangpo–Singtam / NH-10 highway lifeline corridor** in East and South Sikkim, Eastern Himalaya.

The system replaces simulated/mock demonstration architectures with real data:
- **Zero Simulation / Zero Mock Data**: All synthetic data generators (`INITIAL_GRID_CELLS`, `INITIAL_SENSORS`, `simulateHourlyStep`, `Math.random()`) have been eliminated.
- **Pure Static Frontend (Zero Build Step)**: HTML5, CSS3, and Vanilla ES6+ JavaScript deployable directly on **GitHub Pages** without requiring React, Vite, Express, or Node.js runtime dependencies.
- **Automated Data Pipeline**: Python scripts and GitHub Actions workflows fetch near-real-time NASA IMERG 30-minute precipitation, process Copernicus DEM topographic derivatives, run machine-learning inference, and calibrate risk probabilities.

---

## 🏗️ 2. System Architecture

```
                          NASA GPM IMERG Early Run (30-min GeoTIFFs)
                                             │
                                             ▼
                      scripts/rainfall_incremental_updater.py (Python / GHA)
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             data/rainfall_history.csv                  data/rainfall_latest.json
                       │                                           │
  data/landslides/     │                                           │   data/dem/
  rangpo_singtam.csv ──┼─────────────┐               ┌─────────────┼── terrain_points.csv /
                       │             ▼               ▼             │   Copernicus DEM
                       │       scripts/ml_pipeline.py              │
                       │       (Train XGBoost/HistGB,              │
                       │        Calibrate Probabilities,           │
                       │        Lead Time Evaluation)              │
                       │             │                             │
                       ▼             ▼                             ▼
                scripts/risk_engine.py ──► data/current_risk.json & data/risk_grid.geojson
                                                   │
 ══════════════════════════════════════════════════╪══════════════════════════════════════════
  FRONTEND DEPLOYMENT (GitHub Pages / Zero-Build)   │
                                                   ▼
                ┌─────────────────────────────────────────────────────────────┐
                │                         index.html                          │
                │   ┌─────────────────────────────────────────────────────┐   │
                │   │  Top Alert Ribbon + Command Center KPI Metrics Cards│   │
                │   ├─────────────────────────────────────────────────────┤   │
                │   │  Interactive Leaflet Map (OSM / Terrain / Overlays) │   │
                │   │  • Elevation, Slope, Aspect Overlays                │   │
                │   │  • Historical Landslide Event Markers (103 GSI)     │   │
                │   │  • Dynamic AI Risk Heatmap (LOW/WATCH/HIGH/CRITICAL)│   │
                │   │  • Rangpo & Singtam Monitoring Stations + NH-10     │   │
                │   ├─────────────────────────────────────────────────────┤   │
                │   │  Dedicated Analysis Tabs & Views:                   │   │
                │   │  1. Command Overview      6. Historical Replay      │   │
                │   │  2. GIS Risk Map          7. ML Model Evaluation    │   │
                │   │  3. NASA Rainfall Tracker 8. AI Explainability      │   │
                │   │  4. DEM Terrain Analysis  9. Public Safety Guide    │   │
                │   │  5. Historical Database                             │   │
                │   └─────────────────────────────────────────────────────┘   │
                │         Vanilla JS ES6+ (Chart.js, Leaflet.js, Turf.js)     │
                └─────────────────────────────────────────────────────────────┘
```

---

## 🛰️ 3. Data Sources & Physical Parameters

| Component | Source | Resolution | Function |
|---|---|---|---|
| **Precipitation** | NASA GPM IMERG Early Run | 30-min / 0.1° (~10km) | Multi-scale rolling accumulation (30m, 1h, 3h, 6h, 12h, 24h, 48h, 72h, 7d), intensity trends, and acceleration |
| **Elevation & Slope** | Copernicus GLO-30 DSM | 30m / UTM Zone 45N | Metric elevation, slope angle (Horn's algorithm), aspect azimuth, and terrain ruggedness |
| **Landslide Records** | Geological Survey of India (GSI) | Point records ($N=103$) | Spatial corridor clustering and historical validation ground-truth |

---

## 🧠 4. Machine Learning & Lead-Time Performance

The machine learning engine combines multi-scale precipitation accumulation with topographic gradients using **Histogram-based Gradient Boosting (`HistGradientBoostingClassifier`)** and **XGBoost**, with Platt scaling probability calibration.

### Test Set Verification Results:
* **Recall (Sensitivity)**: **100.0%** (0 Missed dangerous events)
* **Precision**: **74.4%** (Precautionary safety thresholding)
* **F1-Score**: **0.8532**
* **ROC-AUC**: **0.9948**
* **PR-AUC**: **0.9892**
* **Average Advance Warning Lead Time**: **14.6 Hours** (Median: 14.5 Hours)

*Detailed scientific formulation available in [docs/AI_METHODOLOGY.md](docs/AI_METHODOLOGY.md).*

---

## 🚀 5. How to Run Locally & Deploy to GitHub Pages

### Running Locally
No `npm install`, `vite`, or `node` build step is required! Simply serve the directory with any static HTTP server:

```bash
# Using Python built-in server:
python -m http.server 8000

# Open in browser:
# http://localhost:8000
```

### Running the Python Data Pipeline
To fetch new NASA IMERG data and re-train models locally:

```bash
# 1. Install Python dependencies:
pip install -r scripts/requirements.txt

# 2. Run ML Training & Calibration:
python scripts/ml_pipeline.py

# 3. Run Risk Prediction Engine:
python scripts/risk_engine.py
```

### Deploying to GitHub Pages
1. Push the repository to GitHub.
2. Navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and root directory `/`.
4. Click **Save**. Your dashboard will be live at `https://<username>.github.io/<repo>/`!

---

## 🤖 6. GitHub Actions Workflows

* `.github/workflows/rainfall-update.yml`: Scheduled hourly to authenticate with NASA PPS, fetch missing 30-min IMERG observations, run `scripts/risk_engine.py`, and commit updated static JSON/CSV datasets to the repository.
* `.github/workflows/model-training.yml`: Workflow dispatch trigger to re-train and evaluate ML models, compute lead-time analytics, and update `data/model_metrics.json`.

---

## ⚖️ 7. Scientific Disclaimer

> [!NOTE]
> Landslide Sentinel AI is an early-warning risk estimation system. It computes calibrated probabilities of slope instability based on observed satellite precipitation and terrain parameters. It does not claim deterministic foreknowledge of exact failure instants. Disaster response actions should always be coordinated with the **Sikkim State Disaster Management Authority (SSDMA)** and local administration.
