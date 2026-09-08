"""
scripts/ml/calibrate_model.py
=============================================================================
Landslide Sentinel AI - Probability Calibration & Reliability Assessment
Calibrates model probabilities using Platt Scaling (Sigmoid) with CV.
Computes Brier Score, Expected Calibration Error (ECE), and Reliability Curves.
=============================================================================
"""

import json
import pickle
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.inspection import permutation_importance

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
DYNAMIC_DATASET_CSV = DATA_DIR / "model" / "datasets" / "dataset_v001.csv"
ARTIFACTS_DIR = DATA_DIR / "model" / "artifacts"
CALIBRATION_METRICS_OUT = DATA_DIR / "model" / "metrics" / "calibration_report.json"

from feature_engineering import FEATURE_COLUMNS

def calibrate_pipeline():
    print("=" * 60)
    print("LANDSLIDE SENTINEL AI - PROBABILITY CALIBRATION")
    print("=" * 60)
    
    # Load dataset
    df = pd.read_csv(DYNAMIC_DATASET_CSV)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)
    
    n = len(df)
    train_end = int(n * 0.60)
    val_end = int(n * 0.80)
    
    # Combine train + val for CV calibration, hold test completely untouched
    train_val_df = df.iloc[:val_end].copy()
    test_df = df.iloc[val_end:].copy()
    
    X_train_val = train_val_df[FEATURE_COLUMNS]
    y_train_val = train_val_df["label"].values
    
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["label"].values
    
    # Uncalibrated Base Model (Trained on Train split only to evaluate raw test Brier)
    train_df = df.iloc[:train_end].copy()
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["label"].values
    
    raw_base = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=4,
        learning_rate=0.05,
        class_weight="balanced",
        random_state=42
    )
    raw_base.fit(X_train, y_train)
    raw_test_probs = raw_base.predict_proba(X_test)[:, 1]
    raw_brier = brier_score_loss(y_test, raw_test_probs)
    
    # Calibrated Classifier (Platt Sigmoid with 3-fold cross-validation on train+val)
    print("Training CalibratedClassifierCV (Platt Sigmoid)...")
    base_for_cal = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=4,
        learning_rate=0.05,
        class_weight="balanced",
        random_state=42
    )
    calibrated_model = CalibratedClassifierCV(
        estimator=base_for_cal,
        method="sigmoid",
        cv=3
    )
    calibrated_model.fit(X_train_val, y_train_val)
    
    cal_test_probs = calibrated_model.predict_proba(X_test)[:, 1]
    cal_brier = brier_score_loss(y_test, cal_test_probs)
    
    # Compute Calibration Reliability Curves
    prob_true_raw, prob_pred_raw = calibration_curve(y_test, raw_test_probs, n_bins=10, strategy="uniform")
    prob_true_cal, prob_pred_cal = calibration_curve(y_test, cal_test_probs, n_bins=10, strategy="uniform")
    
    # Expected Calibration Error (ECE)
    def compute_ece(y_true, y_probs, n_bins=10):
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        ece = 0.0
        for i in range(n_bins):
            bin_mask = (y_probs > bin_boundaries[i]) & (y_probs <= bin_boundaries[i + 1])
            if np.sum(bin_mask) > 0:
                bin_acc = np.mean(y_true[bin_mask])
                bin_conf = np.mean(y_probs[bin_mask])
                bin_prop = np.sum(bin_mask) / len(y_true)
                ece += bin_prop * np.abs(bin_acc - bin_conf)
        return float(ece)
        
    ece_raw = compute_ece(y_test, raw_test_probs)
    ece_cal = compute_ece(y_test, cal_test_probs)
    
    print(f"Raw Model Test Brier Score:        {raw_brier:.4f} | ECE: {ece_raw:.4f}")
    print(f"Calibrated Model Test Brier Score: {cal_brier:.4f} | ECE: {ece_cal:.4f}")
    
    # Feature Importances via Permutation on Test Set
    perm_imp = permutation_importance(calibrated_model, X_test, y_test, n_repeats=10, random_state=42)
    feat_importances = {}
    for idx, col in enumerate(FEATURE_COLUMNS):
        feat_importances[col] = float(perm_imp.importances_mean[idx])
        
    # Physical contribution grouping
    physics_contributions = {
        "Antecedent Saturation (24h-7d)": sum(feat_importances.get(k, 0) for k in ["rain_24h", "rain_48h", "rain_72h", "rain_7d", "ruggedness_x_rain72h"]),
        "Immediate Trigger & Burst (30m-6h)": sum(feat_importances.get(k, 0) for k in ["rain_30min", "rain_1h", "rain_3h", "rain_6h", "max_rain_1h", "max_rain_3h", "max_rain_6h", "susceptibility_x_rain_peak"]),
        "Topography & Susceptibility": sum(feat_importances.get(k, 0) for k in ["elevation", "slope", "aspect", "aspect_sin", "aspect_cos", "terrain_ruggedness", "distance_to_historical_landslide_km", "historical_landslide_density"]),
        "Rate of Change & Acceleration": sum(feat_importances.get(k, 0) for k in ["rainfall_change_1h", "rainfall_change_3h", "rainfall_acceleration", "slope_x_rain24h"])
    }
    
    total_phys = sum(max(0, v) for v in physics_contributions.values())
    if total_phys > 0:
        physics_contributions_pct = {k: round((max(0, v) / total_phys) * 100, 1) for k, v in physics_contributions.items()}
    else:
        physics_contributions_pct = {k: 25.0 for k in physics_contributions}
        
    # Save Calibrated Production Model Artifact
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(ARTIFACTS_DIR / "calibrated_production_model.pkl", "wb") as f:
        pickle.dump({
            "model_type": "HistGradientBoosting_PlattCalibrated",
            "model": calibrated_model,
            "feature_columns": FEATURE_COLUMNS,
            "calibration_method": "sigmoid_platt_cv3",
            "brier_score": round(cal_brier, 4),
            "ece": round(ece_cal, 4),
            "feature_importances": feat_importances,
            "physics_contributions_pct": physics_contributions_pct
        }, f)
        
    report = {
        "calibration_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "method": "Platt Scaling (Sigmoid CalibratedClassifierCV, cv=3)",
        "brier_score": {
            "uncalibrated": round(raw_brier, 4),
            "calibrated": round(cal_brier, 4),
            "improvement_pct": round(((raw_brier - cal_brier) / max(1e-6, raw_brier)) * 100, 2)
        },
        "expected_calibration_error": {
            "uncalibrated": round(ece_raw, 4),
            "calibrated": round(ece_cal, 4)
        },
        "reliability_curve_calibrated": {
            "mean_predicted_probabilities": [round(float(p), 4) for p in prob_pred_cal],
            "fraction_of_positives": [round(float(p), 4) for p in prob_true_cal]
        },
        "physics_contributions_pct": physics_contributions_pct,
        "feature_importances": {k: round(v, 6) for k, v in sorted(feat_importances.items(), key=lambda x: x[1], reverse=True)}
    }
    
    with open(CALIBRATION_METRICS_OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"Saved calibration report to: {CALIBRATION_METRICS_OUT}")
    print("=" * 60)
    return report

if __name__ == "__main__":
    calibrate_pipeline()
