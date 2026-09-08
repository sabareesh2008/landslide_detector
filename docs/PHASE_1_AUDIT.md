# Phase 1 Audit Report — Landslide Sentinel AI

**Project**: Landslide Sentinel AI — AI-Powered Predictive Landslide Early Warning and Disaster Response Platform  
**Target Area**: Rangpo–Singtam / NH-10 Lifeline Corridor, Sikkim, India  
**Scope**: Complete Codebase, Data Pipeline, ML Models, APIs, Frontend, and Documentation Audit  
**Date**: September 2026 (SIH Phase 1 Baseline)

---

## 1. System Architecture Audit

### 1.1 Frontend Architecture
* **Current State**: Dual-stack transition state:
  * **Static Zero-Build Application**: Pure HTML5 (`index.html`), CSS3 (`css/style.css`), and Vanilla JavaScript ES6+ modules (`js/*.js`) consuming static assets in `./data/`.
  * **Legacy React Stack**: React 19 + TypeScript + Vite (`src/`) located in repository root, previously relying on Express backend (`server.ts`).
* **Data Flow**: The static frontend fetches pre-processed JSON/CSV data files via relative paths (`./data/current_risk.json`, `./data/rainfall_latest.json`, `./data/landslides.csv`, `./data/risk_grid.geojson`).
* **Deployment Flow**: Deployable to GitHub Pages directly from the root repository without a build step.

### 1.2 Backend Architecture
* **Current State**: Express 4.21.2 + TypeScript server (`server.ts`) with Gemini 3.7 Flash integration for computer vision field report analysis and situation bulletin generation.
* **API Flow**: Provides REST endpoints (`/api/health`, `/api/ai/analyze-field-media`, `/api/ai/synthesize-bulletin`, `/api/rainfall/*`, `/api/schema`).
* **Weakness Identified**: In offline mode or when `GEMINI_API_KEY` was missing, `/api/ai/analyze-field-media` returned heuristic mock responses masquerading as AI outputs with fake `confidence: 0.93`. **Remediation in Phase 1**: Label unconfigured responses explicitly as `AI_SERVICE_UNAVAILABLE`.

### 1.3 Python & Machine Learning Pipeline
* **Current State**: Modular Python scripts in `scripts/`:
  * `scripts/dem_processor.py`: Reprojects Copernicus GLO-30 DSM to UTM Zone 45N (`EPSG:32645`) and calculates Horn's slope and aspect.
  * `scripts/rainfall_incremental_updater.py`: Ingests 30-minute NASA GPM IMERG Early Run GeoTIFFs incrementally.
  * `scripts/ml_pipeline.py`: Trains and benchmarks XGBoost, LightGBM, `HistGradientBoostingClassifier`, and `RandomForestClassifier` using time-based holdout splitting.
  * `scripts/risk_engine.py`: Computes calibrated risk probabilities and generates `data/risk_grid.geojson`.
* **Data & Model Flow**:
  $$\text{NASA IMERG} + \text{Copernicus DEM} + \text{GSI Landslides} \longrightarrow \text{Feature Matrix } \mathbf{x} \in \mathbb{R}^{24} \longrightarrow \text{HistGB} \longrightarrow \text{Platt Scaling} \longrightarrow \text{JSON/GeoJSON}$$

---

## 2. Comprehensive Data Sources Audit

| Dataset | File Path | Format | Rows | Coverage | Temporal Span | Type | Production Readiness | Key Limitations |
|---|---|---|---|---|---|---|---|---|
| **NASA IMERG Early Run** | `data/rainfall/processed/rainfall_history.csv` | CSV | 1,760 | Rangpo & Singtam stations | 2026-08-20 to 2026-09-07 | Observed (Satellite) | **Production-Ready** | ~4-6 hour latency intrinsic to IMERG Early Run product. |
| **Copernicus DEM** | `data/dem/raw/Copernicus_DSM_10_N27_00_E088_00_DEM.tif` | GeoTIFF | $3735 \times 3339$ grid | Sikkim / Teesta Basin | Static (2020 baseline) | Observed (SAR/DSM) | **Production-Ready** | 30m resolution does not resolve small roadside toe cuts. |
| **Horn's Slope & Aspect** | `data/dem/processed/slope_degrees.tif` | GeoTIFF | $3735 \times 3339$ grid | Sikkim UTM 45N | Static derived | Derived (DEM) | **Production-Ready** | Derived from 30m DEM; micro-topography smoothed. |
| **GSI Landslide Inventory** | `data/landslides/processed/rangpo_singtam_landslides.csv` | CSV | 103 | Rangpo–Singtam Corridor | Historical GSI Records | Observed Ground Truth | **Production-Ready** | Point locations lack exact failure timestamps. |
| **Spatial Risk Grid** | `data/risk_grid.geojson` | GeoJSON | 64 polygons | Corridor ($27.14^\circ - 27.27^\circ\text{N}$, $88.46^\circ - 88.58^\circ\text{E}$) | Dynamic (Current) | Derived (ML + DEM) | **Production-Ready** | Spatial interpolation between monitoring stations. |
| **Historical Replay** | `data/historical_replay.json` | JSON | 2 events ($16$ timesteps) | Rangpo & Singtam | Historical storm episodes | Derived / Historical | **Demonstration/Replay** | Structured for timeline scrubbing. |
| **Legacy Mock Data** | `src/data/mockData.ts` | TypeScript | 1,180 lines | Northeast India | Synthetic / Mock | **DEMO / SIMULATION** | **Not for Production** — isolated to simulation modes. |

---

## 3. Machine Learning & Statistical Audit

### 3.1 Training vs. Inference Separation
* **Where Training Happens**: `scripts/ml_pipeline.py`.
* **Where Inference Happens**: `scripts/risk_engine.py` (offline batch / automated pipeline) generating `data/current_risk.json`.
* **Model Selected**: `HistGradientBoostingClassifier` calibrated with Platt scaling (`CalibratedClassifierCV(method='sigmoid', cv=3)`).

### 3.2 Label Formulation (Weak / Proxy Labeling)
* **Audit Finding**: In the initial prototype, binary labels ($y \in \{0, 1\}$) were constructed using hydrometeorological trigger criteria ($R_{24\text{h}} \ge 15\text{mm}$, $R_{72\text{h}} \ge 35\text{mm}$, $\theta \ge 13^\circ$).
* **Scientific Classification**: This constitutes **weak / proxy labeling**. While physically grounded in Sikkim GSI empirical thresholds, it is not direct event-by-event ground truth matching.
* **Phase 1 Resolution**: Explicitly documented in `docs/AI_METHODOLOGY.md` and `docs/CURRENT_LIMITATIONS.md`. Genuine event-matching with hourly meteorological hindcasts is scheduled for **Phase 2**.

### 3.3 Data Leakage Audit
* **Temporal Leakage**: **Eliminated**. Data is partitioned strictly by time:
  * Train: $60\%$ (Oldest: 2026-08-20 to 2026-09-01)
  * Validation: $20\%$ (Middle: 2026-09-01 to 2026-09-04)
  * Test: $20\%$ (Unseen Future: 2026-09-04 to 2026-09-07)
* **Spatial Leakage**: Low. Rangpo and Singtam have distinct topographic coordinates and localized precipitation measurements.

### 3.4 Hardcoded Confidence & Lead-Time Audit
* **Audit Finding 1**: `confidence: 0.94` was hardcoded in `scripts/risk_engine.py` and `src/data/mockData.ts`.
  * **Fix**: Removed hardcoded confidence. Replaced with model state indicator and true calibrated probability.
* **Audit Finding 2**: Lead-time array `[6.5, 12.0, 18.5, 24.0, 8.0, 14.5, 10.0, 16.0, 22.0]` was defined as a fallback array in `scripts/ml_pipeline.py`.
  * **Fix**: Clearly labeled in `docs/CURRENT_LIMITATIONS.md` as empirical historical episode benchmarks; lead time in Phase 2 will be dynamically calculated strictly from event timestamp difference.

---

## 4. Frontend & Component Audit

| Component | File | Finding | Action Taken |
|---|---|---|---|
| **GISMap** | `src/components/GISMap.tsx` / `js/map.js` | Loaded synthetic sensors and simulated grid cells in legacy React view. | Replaced with real Leaflet GIS engine consuming `data/risk_grid.geojson` and `data/landslides.csv`. |
| **FieldReportView** | `src/components/FieldReportView.tsx` | Used `Math.random()` to generate report coordinates. | Removed `Math.random()`; coordinates must come from browser geolocation or user input. |
| **mlEngine** | `src/services/mlEngine.ts` | Used `Math.random()` in `simulateHourlyStep` to fluctuate moisture and pore pressure. | Isolated strictly to `SIMULATION_MODE`; disabled in production dashboard. |
| **Dashboard KPIs** | `js/dashboard.js` | Truthfully displays real 30m, 1h, 24h, 72h, 7d accumulations and calibrated probabilities. | Verified and active. |

---

## 5. Backend & Security Audit

* **CORS**: Currently unrestricted in `server.ts`. **Fix**: Bound to configured host origins.
* **API Validation**: Payload validation added for file uploads and coordinate ranges.
* **Credential Protection**: Verified zero API keys or NASA PPS passwords in client JavaScript or committed files.

---

## 6. Documentation Contradiction Audit

* **Contradiction Identified**: Early documentation claimed "Zero Simulation / Zero Mock Data" while legacy React files in `src/` still imported `src/data/mockData.ts`.
* **Resolution**:
  1. Clearly segregated application modes: `LIVE`, `HISTORICAL`, `SIMULATION`, `DEMO`.
  2. Established that the production static dashboard (`index.html`) operates in **100% Real Data Mode**, while simulation tools in legacy components are explicitly quarantined under `SIMULATION_MODE`.
  3. Aligned `README.md` and created `docs/CURRENT_LIMITATIONS.md` with transparent technical disclosures.
