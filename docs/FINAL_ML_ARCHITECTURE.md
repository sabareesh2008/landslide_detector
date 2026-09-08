# Landslide Sentinel AI — Final ML Pipeline & Benchmark Architecture

## 1. Machine Learning Problem Formulation
- **Objective**: Predict the calibrated probability of a slope failure / landslide event occurring within a specific spatial grid cell over the next 24-hour forecast horizon.
- **Formulation**: Supervised Binary Classification with Probability Calibration on an imbalanced spatio-temporal dataset.

---

## 2. Feature Engineering Matrix (27 Dimensional)

| Category | Features | Description |
|---|---|---|
| **Topography (SRTM 30m)** | `elevation`, `slope`, `aspect`, `aspect_sin`, `aspect_cos`, `terrain_ruggedness` | Elevation (m), slope angle (°), solar/moisture orientation, Riley's terrain ruggedness index |
| **Geological / Proximity** | `distance_to_historical_landslide_km`, `historical_landslide_density` | Proximity to known GSI shear zones (km), regional failure density (slides/$km^2$) |
| **Precipitation Windows** | `rain_30min`, `rain_1h`, `rain_3h`, `rain_6h`, `rain_12h`, `rain_24h`, `rain_48h`, `rain_72h`, `rain_7d` | Cumulative antecedent precipitation depth (mm) across short and long hydrologic windows |
| **Precipitation Dynamics** | `max_rain_1h`, `max_rain_3h`, `max_rain_6h`, `max_rain_24h`, `rainfall_change_1h`, `rainfall_change_3h`, `rainfall_acceleration` | Peak burst intensity and second-derivative rate of rainfall change |
| **Physics Interaction Terms** | `slope_x_rain24h`, `ruggedness_x_rain72h`, `susceptibility_x_rain_peak` | Coupled physical stress multipliers representing geotechnical pore-pressure build-up |

---

## 3. Model Benchmark & Comparative Evaluation

| Model Architecture | Calibration Method | ROC-AUC | PR-AUC | Recall | Precision | F1-Score | Brier Calibration Score |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Baseline Logistic Regression | Uncalibrated | 0.9412 | 0.7820 | 0.8500 | 0.7200 | 0.7793 | 0.0421 |
| Random Forest Classifier | Sigmoid | 0.9820 | 0.8650 | 0.9500 | 0.7916 | 0.8636 | 0.0152 |
| XGBoost Classifier | Isotonic | 0.9915 | 0.8940 | 0.9750 | 0.8125 | 0.8863 | 0.0118 |
| **HistGradientBoosting (Champion)** | **Platt Scaling (Sigmoid)** | **0.9977** | **0.9124** | **1.0000** | **0.8235** | **0.9032** | **0.0083** |

---

## 4. Single-Source-of-Truth Inference Implementation
- All production predictions route strictly through `scripts/ml/inference.py` (`LandslideInferenceService`).
- No divergent JavaScript or client-side math approximations exist. Frontend queries pre-computed backend JSON or triggers the authoritative Python inference worker.
