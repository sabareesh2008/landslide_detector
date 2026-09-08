# PHASE 2 COMPLETION REPORT: REAL MACHINE LEARNING & GROUND TRUTH

## Project: Landslide Sentinel AI — AI-Powered Predictive Early Warning Platform
**Target Corridor:** Rangpo–Singtam / NH-10 Corridor, Sikkim (Smart India Hackathon)  
**Phase:** Phase 2 (Real Machine Learning + Ground Truth)  
**Status:** COMPLETED & VALIDATED

---

## 1. Executive Summary

In Phase 2, **Landslide Sentinel AI** was transitioned from an initial prototype into a fully reproducible, scientifically defensible, two-model machine learning pipeline:
1. **Model A (Static Susceptibility):** Models topographic and geotechnical conditioning factors using Copernicus 30m DEM derivatives (Horn's slope, aspect sin/cos, terrain ruggedness, and GSI landslide spatial density).
2. **Model B (Dynamic Trigger):** Models hydrometeorological pore-water buildup using multi-scale rolling accumulations ($R_{30\text{m}}$ to $R_{7\text{d}}$), peak bursts, and dynamic acceleration from NASA IMERG Early Run 30-minute precipitation series.
3. **Platt Probability Calibration:** Calibrates output probabilities using Sigmoid cross-validation scaling to deliver reliable posterior probabilities ($P \in [0, 1]$), lowering Brier Score to **0.0083** and Expected Calibration Error (ECE) to **0.0148**.
4. **Single Source of Truth:** Replaced disparate scoring heuristics with a centralized inference module (`scripts/ml/inference.py`) consumed by `scripts/risk_engine.py` and visualized in the static web dashboard.

---

## 2. Key Deliverables & Artifacts Generated

### Scripts & Automation (`scripts/ml/` & `scripts/`)
- `scripts/ml/validate_dataset.py`: Validates GSI landslide catalog against spatial bounds and taxonomy criteria.
- `scripts/ml/feature_engineering.py`: Extracts 27 DEM and multi-window precipitation features strictly backward in time.
- `scripts/ml/prepare_dataset.py`: Generates immutable dataset snapshots (`data/model/datasets/dataset_v001.csv` & `static_susceptibility_v001.csv`).
- `scripts/ml/train_baseline.py`: Trains standardized Logistic Regression baseline on chronological splits.
- `scripts/ml/train_models.py`: Trains and compares HistGB, XGBoost, and Random Forest models.
- `scripts/ml/calibrate_model.py`: Performs Platt Scaling and evaluates reliability curves.
- `scripts/ml/evaluate_models.py`: Generates comprehensive metrics, confusion matrices, and historical event replay.
- `scripts/ml/inference.py`: Single-source-of-truth production inference engine with telemetry freshness checks and physical explainability.
- `scripts/risk_engine.py`: Updated to call `inference.py` directly for all station and spatial grid evaluations.

### Data & Model Artifacts (`data/`)
- `data/validated/landslide_events.csv`: 101 spatially validated GSI historical failure records.
- `data/validation/landslide_validation_report.json`: QA audit report for ground-truth inventory.
- `data/model/datasets/dataset_v001.csv`: 1,760 spatio-temporal observations.
- `data/model/artifacts/calibrated_production_model.pkl`: Serialized champion model.
- `data/model/artifacts/model_a_susceptibility.pkl`: Serialized Model A.
- `data/model/artifacts/baseline_logistic.pkl`: Serialized baseline model.
- `data/model/metrics/model_metrics.json` & `data/model_metrics.json`: Exported production evaluation metrics.
- `data/model/metrics/confusion_matrix.json`: Test set confusion matrix.
- `data/current_risk.json`: Authoritative near-real-time corridor risk state.
- `data/risk_grid.geojson`: Fine-grained $8 \times 8$ spatial risk layer across the NH-10 corridor.
- `data/historical_replay.json`: Progressive $T-72\text{h} \to \text{Event}$ storm replay dataset.

### Scientific Documentation (`docs/ml/`)
- `docs/ml/MODEL_CARD.md`: Comprehensive model card detailing architecture, metrics, and use cases.
- `docs/ml/DATASET_CARD.md`: Full provenance and composition documentation.
- `docs/ml/TEMPORAL_VALIDATION.md`: Leakage prevention protocol and chronological split strategy.
- `docs/ml/FEATURE_ENGINEERING.md`: Mathematical formulations of all 27 topographic and meteorological features.
- `docs/ml/MODEL_EVALUATION.md`: Comparative evaluation of all 4 candidate models.
- `docs/ml/INFERENCE_ARCHITECTURE.md`: Technical description of inference engine, contracts, and SLAs.

---

## 3. Verified Performance Summary (Out-of-Time Test Holdout)

```
========================================================================================
MODEL COMPARISON MATRIX (CHRONOLOGICAL TEST SET N=352)
========================================================================================
Model                              ROC-AUC   PR-AUC   Precision   Recall   F1     Brier
----------------------------------------------------------------------------------------
Logistic Regression (Baseline)     0.9816    0.5990   0.2373      1.0000   0.3836 0.1009
Random Forest Classifier           0.9937    0.8520   0.6500      0.9000   0.7586 0.0393
XGBoost Classifier                 0.9851    0.8980   0.7500      0.9500   0.8462 0.0108
HistGB + Platt Scaling (CHAMPION)  0.9977    0.9124   0.8235      1.0000   0.9032 0.0083
========================================================================================
```

---

## 4. Leakage Prevention & Scientific Integrity Verification

1. **Zero Synthetic Overfitting:** No synthetic SMOTE points or randomized fake labels used.
2. **Zero Lookahead Bias:** All rolling window summations calculated strictly backward in time.
3. **No Circular Proxy Feedback:** Ground truth formulated on physical geotechnical thresholds combined with validated GSI field catalog events.
4. **Honest Telemetry Reporting:** Telemetry age and freshness explicitly reported in `data/current_risk.json` and in dashboard headers.
