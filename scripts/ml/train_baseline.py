"""
scripts/ml/train_baseline.py
=============================================================================
Landslide Sentinel AI - Baseline Model Training
Trains a standardized Logistic Regression baseline on the temporal split
and evaluates initial baseline metrics.
=============================================================================
"""

import json
import pickle
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
DATASET_CSV = DATA_DIR / "model" / "datasets" / "dataset_v001.csv"
ARTIFACTS_DIR = DATA_DIR / "model" / "artifacts"
BASELINE_METRICS_OUT = DATA_DIR / "model" / "metrics" / "baseline_metrics.json"

from feature_engineering import FEATURE_COLUMNS

def train_baseline():
    print("=" * 60)
    print("TRAINING BASELINE LOGISTIC REGRESSION MODEL")
    print("=" * 60)
    
    if not DATASET_CSV.exists():
        raise FileNotFoundError(f"Dataset missing at: {DATASET_CSV}")
        
    df = pd.read_csv(DATASET_CSV)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)
    
    n = len(df)
    train_end = int(n * 0.60)
    val_end = int(n * 0.80)
    
    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()
    
    X_train_raw = train_df[FEATURE_COLUMNS]
    y_train = train_df["label"].values
    
    X_val_raw = val_df[FEATURE_COLUMNS]
    y_val = val_df["label"].values
    
    X_test_raw = test_df[FEATURE_COLUMNS]
    y_test = test_df["label"].values
    
    # Standardize
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train_raw)
    X_val = scaler.transform(X_val_raw)
    X_test = scaler.transform(X_test_raw)
    
    clf = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)
    
    # Predict on Test Set
    test_probs = clf.predict_proba(X_test)[:, 1]
    test_preds = (test_probs >= 0.5).astype(int)
    
    cm = confusion_matrix(y_test, test_preds)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (int(cm[0, 0]), 0, 0, 0)
    
    has_positives = len(np.unique(y_test)) > 1
    roc_auc = float(roc_auc_score(y_test, test_probs)) if has_positives else 0.5
    pr_auc = float(average_precision_score(y_test, test_probs)) if has_positives else float(np.mean(y_test))
    brier = float(brier_score_loss(y_test, test_probs))
    precision = float(precision_score(y_test, test_preds, zero_division=0))
    recall = float(recall_score(y_test, test_preds, zero_division=0))
    f1 = float(f1_score(y_test, test_preds, zero_division=0))
    
    print(f"Test Set Evaluation:")
    print(f"  Accuracy:  {float((tp + tn) / len(y_test)):.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")
    print(f"  PR-AUC:    {pr_auc:.4f}")
    print(f"  Brier:     {brier:.4f}")
    print(f"  Confusion Matrix: TP={tp}, FP={fp}, FN={fn}, TN={tn}")
    
    # Save Artifacts
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    BASELINE_METRICS_OUT.parent.mkdir(parents=True, exist_ok=True)
    
    artifact = {
        "model_type": "LogisticRegression_Baseline",
        "scaler": scaler,
        "model": clf,
        "feature_columns": FEATURE_COLUMNS,
        "coefficients": dict(zip(FEATURE_COLUMNS, clf.coef_[0].tolist())),
        "intercept": float(clf.intercept_[0]),
    }
    
    with open(ARTIFACTS_DIR / "baseline_logistic.pkl", "wb") as f:
        pickle.dump(artifact, f)
        
    metrics = {
        "model_name": "LogisticRegression (Baseline)",
        "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "brier_score": round(brier, 4),
        },
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_negative": int(tn)
        }
    }
    
    with open(BASELINE_METRICS_OUT, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Saved baseline metrics to: {BASELINE_METRICS_OUT}")
    print("=" * 60)
    return metrics

if __name__ == "__main__":
    train_baseline()
