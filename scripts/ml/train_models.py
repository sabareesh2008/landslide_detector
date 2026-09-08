"""
scripts/ml/train_models.py
=============================================================================
Landslide Sentinel AI - Advanced Model Training & Comparison
Trains HistGradientBoosting, XGBoost, and Random Forest on the temporal split
with class weighting and validation tracking. Also trains Model A (Static Susceptibility).
=============================================================================
"""

import json
import pickle
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
import xgboost as xgb

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
DYNAMIC_DATASET_CSV = DATA_DIR / "model" / "datasets" / "dataset_v001.csv"
STATIC_DATASET_CSV = DATA_DIR / "model" / "datasets" / "static_susceptibility_v001.csv"
ARTIFACTS_DIR = DATA_DIR / "model" / "artifacts"
TRAINING_REPORT_OUT = DATA_DIR / "model" / "metrics" / "training_comparison.json"

from feature_engineering import FEATURE_COLUMNS

STATIC_FEATURE_COLUMNS = [
    "elevation",
    "slope",
    "aspect",
    "aspect_sin",
    "aspect_cos",
    "terrain_ruggedness",
    "distance_to_historical_landslide_km",
    "historical_landslide_density"
]

def evaluate_predictions(y_true, y_probs, threshold=0.5):
    y_preds = (y_probs >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_preds)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (int(cm[0, 0]), 0, 0, 0)
    
    has_positives = len(np.unique(y_true)) > 1
    roc_auc = float(roc_auc_score(y_true, y_probs)) if has_positives else 0.5
    pr_auc = float(average_precision_score(y_true, y_probs)) if has_positives else float(np.mean(y_true))
    brier = float(brier_score_loss(y_true, y_probs))
    precision = float(precision_score(y_true, y_preds, zero_division=0))
    recall = float(recall_score(y_true, y_preds, zero_division=0))
    f1 = float(f1_score(y_true, y_preds, zero_division=0))
    accuracy = float((tp + tn) / max(1, len(y_true)))
    
    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_negative": int(tn)
        }
    }

def train_all_models():
    print("=" * 60)
    print("TRAINING ADVANCED LANDSLIDE PREDICTION MODELS")
    print("=" * 60)
    
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # -------------------------------------------------------------
    # 1. Train Model A (Static Susceptibility Model)
    # -------------------------------------------------------------
    print("\n--- Training Model A: Static Topographic Susceptibility ---")
    static_df = pd.read_csv(STATIC_DATASET_CSV)
    X_static = static_df[STATIC_FEATURE_COLUMNS]
    y_static = static_df["label"].values
    
    # Stratified 80/20 train/test
    from sklearn.model_selection import train_test_split
    X_st_train, X_st_test, y_st_train, y_st_test = train_test_split(
        X_static, y_static, test_size=0.25, random_state=42, stratify=y_static
    )
    
    model_a = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=3,
        learning_rate=0.05,
        random_state=42
    )
    model_a.fit(X_st_train, y_st_train)
    static_probs = model_a.predict_proba(X_st_test)[:, 1]
    static_metrics = evaluate_predictions(y_st_test, static_probs)
    print(f"Model A (Susceptibility) Test ROC-AUC: {static_metrics['roc_auc']}, F1: {static_metrics['f1_score']}")
    
    with open(ARTIFACTS_DIR / "model_a_susceptibility.pkl", "wb") as f:
        pickle.dump({
            "model_type": "StaticSusceptibility_HistGB",
            "model": model_a,
            "feature_columns": STATIC_FEATURE_COLUMNS,
            "metrics": static_metrics
        }, f)
        
    # -------------------------------------------------------------
    # 2. Train Model B Candidates (Dynamic Hydrometeorological Trigger)
    # -------------------------------------------------------------
    print("\n--- Training Model B Candidates: Dynamic Trigger ---")
    df = pd.read_csv(DYNAMIC_DATASET_CSV)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)
    
    n = len(df)
    train_end = int(n * 0.60)
    val_end = int(n * 0.80)
    
    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()
    
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["label"].values
    
    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df["label"].values
    
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["label"].values
    
    neg_count = int((y_train == 0).sum())
    pos_count = int((y_train == 1).sum())
    scale_weight = float(neg_count / max(1, pos_count)) if pos_count > 0 else 1.0
    print(f"Train split class balance: {pos_count} positive / {neg_count} negative (scale_weight={scale_weight:.2f})")
    
    # Candidate 1: HistGradientBoosting
    print("Training HistGradientBoosting...")
    hgb = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=4,
        learning_rate=0.05,
        class_weight="balanced",
        random_state=42
    )
    hgb.fit(X_train, y_train)
    hgb_val_probs = hgb.predict_proba(X_val)[:, 1]
    hgb_test_probs = hgb.predict_proba(X_test)[:, 1]
    hgb_val_metrics = evaluate_predictions(y_val, hgb_val_probs)
    hgb_test_metrics = evaluate_predictions(y_test, hgb_test_probs)
    
    # Candidate 2: XGBoost
    print("Training XGBoost...")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05,
        scale_pos_weight=scale_weight,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_clf.fit(X_train, y_train)
    xgb_val_probs = xgb_clf.predict_proba(X_val)[:, 1]
    xgb_test_probs = xgb_clf.predict_proba(X_test)[:, 1]
    xgb_val_metrics = evaluate_predictions(y_val, xgb_val_probs)
    xgb_test_metrics = evaluate_predictions(y_test, xgb_test_probs)
    
    # Candidate 3: Random Forest
    print("Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        class_weight="balanced",
        random_state=42
    )
    rf.fit(X_train, y_train)
    rf_val_probs = rf.predict_proba(X_val)[:, 1]
    rf_test_probs = rf.predict_proba(X_test)[:, 1]
    rf_val_metrics = evaluate_predictions(y_val, rf_val_probs)
    rf_test_metrics = evaluate_predictions(y_test, rf_test_probs)
    
    print("\nModel Comparison (Validation Set):")
    print(f"  HistGB:  F1={hgb_val_metrics['f1_score']}, ROC-AUC={hgb_val_metrics['roc_auc']}, Brier={hgb_val_metrics['brier_score']}")
    print(f"  XGBoost: F1={xgb_val_metrics['f1_score']}, ROC-AUC={xgb_val_metrics['roc_auc']}, Brier={xgb_val_metrics['brier_score']}")
    print(f"  RF:      F1={rf_val_metrics['f1_score']}, ROC-AUC={rf_val_metrics['roc_auc']}, Brier={rf_val_metrics['brier_score']}")
    
    print("\nModel Comparison (Test Set):")
    print(f"  HistGB:  F1={hgb_test_metrics['f1_score']}, ROC-AUC={hgb_test_metrics['roc_auc']}, Brier={hgb_test_metrics['brier_score']}")
    print(f"  XGBoost: F1={xgb_test_metrics['f1_score']}, ROC-AUC={xgb_test_metrics['roc_auc']}, Brier={xgb_test_metrics['brier_score']}")
    print(f"  RF:      F1={rf_test_metrics['f1_score']}, ROC-AUC={rf_test_metrics['roc_auc']}, Brier={rf_test_metrics['brier_score']}")
    
    # Select Best Model based on Validation PR-AUC and F1
    candidates = [
        ("HistGradientBoosting", hgb, hgb_val_metrics, hgb_test_metrics),
        ("XGBoost", xgb_clf, xgb_val_metrics, xgb_test_metrics),
        ("RandomForest", rf, rf_val_metrics, rf_test_metrics)
    ]
    # Sort by validation F1 score then ROC-AUC
    candidates.sort(key=lambda x: (x[2]["f1_score"], x[2]["roc_auc"]), reverse=True)
    best_name, best_model, best_val_m, best_test_m = candidates[0]
    print(f"\n>>> Selected Best Model: {best_name} <<<")
    
    # Save uncalibrated best model
    with open(ARTIFACTS_DIR / "best_model_raw.pkl", "wb") as f:
        pickle.dump({
            "model_name": best_name,
            "model": best_model,
            "feature_columns": FEATURE_COLUMNS,
            "val_metrics": best_val_m,
            "test_metrics": best_test_m
        }, f)
        
    # Save training comparison report
    comparison_report = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "best_model": best_name,
        "models": {
            "HistGradientBoosting": {
                "validation": hgb_val_metrics,
                "test": hgb_test_metrics
            },
            "XGBoost": {
                "validation": xgb_val_metrics,
                "test": xgb_test_metrics
            },
            "RandomForest": {
                "validation": rf_val_metrics,
                "test": rf_test_metrics
            }
        },
        "model_a_susceptibility": static_metrics
    }
    
    with open(TRAINING_REPORT_OUT, "w", encoding="utf-8") as f:
        json.dump(comparison_report, f, indent=2)
        
    print(f"Saved comparison report to: {TRAINING_REPORT_OUT}")
    print("=" * 60)
    return comparison_report

if __name__ == "__main__":
    train_all_models()
