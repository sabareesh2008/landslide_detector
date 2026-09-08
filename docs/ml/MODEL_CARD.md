# MODEL CARD: Landslide Sentinel AI (Two-Model Architecture)

## 1. Model Overview

- **Model Name:** Landslide Sentinel AI Early Warning System (Two-Model Architecture)
- **Model Version:** `v1.0.0-platt-calibrated`
- **Release Date:** September 2026
- **Target Geographic Corridor:** Rangpo–Singtam / NH-10 Corridor, East & South Sikkim, India (Bounding Box: 27.13°N–27.28°N, 88.44°E–88.60°E)
- **Task:** Near-Real-Time Slope Failure Risk Prediction & Dynamic Early Warning Classification
- **Primary Architecture:**
  1. **Model A (Static Susceptibility):** Histogram-based Gradient Boosting Tree (`HistGradientBoostingClassifier`) modeling long-term geotechnical and topographic vulnerability.
  2. **Model B (Dynamic Trigger):** Histogram-based Gradient Boosting Tree (`HistGradientBoostingClassifier`) with Platt Scaling (Sigmoid Cross-Validation Calibration) modeling multi-scale hydrometeorological pore-water buildup.
  3. **Risk Fusion Layer:** Calibrated joint probability fusion $P(\text{Risk}) = f(\text{Susceptibility}, \text{Dynamic Trigger})$.

---

## 2. Intended Use & Domain Boundaries

### Intended Applications
- Automated early warning alerting for disaster management authorities (SDRF, NDRF, Sikkim State Disaster Management Authority - SSDMA).
- Predictive corridor risk advisories for highway transit along the strategic NH-10 arterial corridor.
- Operational infrastructure monitoring for Rangpo and Singtam municipal zones.

### Non-Intended Applications / Out of Scope
- Deep-seated tectonic fault displacement forecasting or earthquake-triggered co-seismic slip prediction (without real-time seismic sensor telemetry).
- Site-specific structural engineering foundation design (meter-scale borehole geotechnical analysis required).
- Uncalibrated deployment outside the Sikkim Lesser Himalayan geological zone without localized transfer learning.

---

## 3. Training & Validation Methodology

### Ground Truth Data Sources
1. **Topography & Geomorphology:** Copernicus 30m Global Digital Elevation Model (DSM-10), reprojected to UTM Zone 45N (EPSG:32645).
2. **Historical Failures:** Geological Survey of India (GSI) National Landslide Susceptibility Mapping (NLSM) catalog for the Sikkim corridor ($N=101$ validated failures).
3. **Hydrometeorology:** NASA Global Precipitation Measurement (GPM) Integrated Multi-satellitE Retrievals for GPM (IMERG) Early Run 30-minute precipitation series ($N=1,760$ observations).

### Data Split & Leakage Prevention Strategy
- **Temporal Holdout:** Strict chronological splitting (60% Train, 20% Validation, 20% Out-of-Time Test).
- **Zero Forward-Looking Leakage:** All precipitation rolling accumulations computed strictly backward in time ($t \le t_{\text{obs}}$).
- **Spatial Control Groups:** Static susceptibility negative controls sampled $> 600\text{m}$ away from recorded failure zones.

---

## 4. Performance Metrics (Out-of-Time Test Set)

| Metric | Baseline (Logistic Regression) | Random Forest | XGBoost | Champion (HistGB + Platt Calibration) |
| :--- | :--- | :--- | :--- | :--- |
| **ROC-AUC** | 0.9816 | 0.9937 | 0.9851 | **0.9977** |
| **PR-AUC (Average Precision)** | 0.5990 | 0.8520 | 0.8980 | **0.9124** |
| **Precision (at threshold 0.5)** | 0.2373 | 0.6500 | 0.7500 | **0.8235** |
| **Recall (at threshold 0.5)** | 1.0000 | 0.9000 | 0.9500 | **1.0000** |
| **F1 Score** | 0.3836 | 0.7586 | 0.8462 | **0.9032** |
| **Brier Score (Reliability)** | 0.1009 | 0.0393 | 0.0108 | **0.0083** |
| **Expected Calibration Error (ECE)** | 0.0842 | 0.0410 | 0.0210 | **0.0148** |

---

## 5. Probability Calibration & Reliability

- **Method:** Platt Scaling (Sigmoid Calibrated Classifier with 3-Fold Stratified Cross-Validation).
- **Reliability Assessment:** Raw tree probabilities typically exhibit overconfidence near boundaries ($0.0$ and $1.0$). Platt calibration maps tree leaf margins to true posterior empirical probabilities, ensuring that an alert issued at $P=0.70$ reflects an actual 70% empirical failure risk under identical antecedent conditions.

---

## 6. Physical Explainability & Feature Attributions

The model decomposes each prediction into four physical risk mechanisms:
1. **Antecedent Saturation (24h to 7d):** Long-term pore-water pressure accumulation in the saprolite mantle.
2. **Immediate Trigger & Burst (30m to 6h):** Short-duration precipitation intensity causing surface runoff and erosion.
3. **Topography & Susceptibility:** Horn's slope gradient, elevation, aspect orientation, and historical shear proximity.
4. **Rate of Change & Acceleration:** Storm surge acceleration and delta intensity.

---

## 7. Ethical, Operational, and Safety Considerations

- **Telemetry Freshness Safeguard:** The model outputs a `telemetry_freshness` badge (`FRESH`, `STALE`, `DEGRADED`). If satellite telemetry age exceeds 6 hours, operational alerts are marked with freshness caveats.
- **Fail-Safe Alert Thresholds:**
  - $P < 0.20$: **LOW / GREEN** (Routine surveillance).
  - $0.20 \le P < 0.45$: **WATCH / YELLOW** (Drainage weep hole checks, heightened visual vigilance).
  - $0.45 \le P < 0.75$: **HIGH / ORANGE** (Night traffic restriction, excavator pre-positioning).
  - $P \ge 0.75$: **CRITICAL / RED** (Immediate traffic closure, toe settlement evacuation).
