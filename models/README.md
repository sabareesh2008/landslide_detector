# Landslide Sentinel AI — Model Registry & Lifecycle Management

This directory manages the machine learning model registry for Landslide Sentinel AI.

## Directory Structure

```
models/
├── production/      # Active models deployed for real-time inference
├── staging/         # Validated candidate models undergoing benchmark evaluation
├── archived/        # Previous model versions preserved for auditability and replay
├── registry/        # Model artifacts, serialized scalers, and metadata descriptors
└── README.md        # Registry documentation and promotion policy
```

## Model Metadata Schema

Every model promoted to `staging` or `production` MUST have an accompanying `<model_name>_<version>.json` metadata file adhering to this schema:

```json
{
  "modelName": "HistGradientBoosting",
  "version": "v1.0.0",
  "status": "production",
  "trainedAt": "2026-09-07T16:42:54Z",
  "trainingDataset": {
    "source": "NASA IMERG + Copernicus DEM + GSI Landslide Inventory",
    "samples": 1056,
    "features": 24,
    "target": "landslide_trigger_event",
    "startDate": "2026-08-20T08:59:59Z",
    "endDate": "2026-09-02T12:00:00Z"
  },
  "validationStrategy": "Strict Temporal Split (Train 60% / Val 20% / Test 20%)",
  "metrics": {
    "validation": {
      "f1Score": 0.9961,
      "recall": 1.0000,
      "precision": 0.9922,
      "rocAuc": 0.9980
    },
    "test": {
      "f1Score": 0.8276,
      "recall": 0.8571,
      "precision": 0.8000,
      "rocAuc": 0.9949,
      "prAuc": 0.8708
    }
  },
  "calibration": {
    "method": "Platt Scaling (Sigmoid 3-Fold Cross-Validation)",
    "status": "calibrated"
  },
  "provenance": {
    "framework": "scikit-learn",
    "frameworkVersion": "1.9.0",
    "commitHash": "UNKNOWN"
  }
}
```

## Promotion Policy

1. **Experimental $\to$ Staging**: Candidate models must be trained with zero temporal/spatial data leakage and achieve $\ge 80\%$ recall on the validation set.
2. **Staging $\to$ Production**: Models must be evaluated on unseen holdout test data, successfully undergo probability calibration (Platt scaling / Isotonic regression), and pass automated inference latency checks ($< 100\text{ ms}$).
3. **Production $\to$ Archived**: Retired models are moved to `archived/` along with their full test logs to ensure reproducible historical replays.
