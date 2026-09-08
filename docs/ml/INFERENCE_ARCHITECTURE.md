# INFERENCE SERVICE ARCHITECTURE

## 1. System Architecture

The **Landslide Sentinel AI Inference Service** acts as the single source of truth for all risk calculations across the backend and frontend visualization layers.

```
                          Incoming 30-min NASA IMERG Telemetry
                                            │
                                            ▼
                           scripts/ml/inference.py (Service)
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
       [Data Freshness Check]                                 [Feature Extraction]
   Evaluates Telemetry Age (hours)                     Extracts 27 Topographic & Rolling
   • FRESH (< 6h)                                      Precipitation Features
   • STALE (6h - 48h)                                                    │
   • DEGRADED (> 48h)                                                    ▼
               │                                      [Model A: Static Susceptibility]
               │                                      HistGB on Copernicus DEM Parameters
               │                                                         │
               │                                                         ▼
               │                                      [Model B: Calibrated Dynamic Trigger]
               │                                      HistGB + Platt Sigmoid Scaling
               │                                                         │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
                               [Risk Fusion & Classification]
                               • Probability P in [0.0, 1.0]
                               • Tiers: LOW, WATCH, HIGH, CRITICAL
                               • Physical Explainability Attribution
                               • Operational Action Recommendation
                                            │
                                            ▼
                    scripts/risk_engine.py ──► data/current_risk.json & risk_grid.geojson
                                            │
                                            ▼
                          Static Frontend / Dashboard UI Consumption
```

---

## 2. API Contract & Method Signatures

### `check_data_freshness(max_stale_hours=6.0)`
- **Returns:**
  ```json
  {
    "status": "FRESH" | "STALE" | "DEGRADED" | "DATA_UNAVAILABLE",
    "last_observation_utc": "2026-09-07T16:30:00+00:00",
    "age_hours": 12.06,
    "is_fresh": false
  }
  ```

### `predict_risk(lat, lon, rainfall_series_df)`
- **Parameters:**
  - `lat` (float): Latitude coordinate.
  - `lon` (float): Longitude coordinate.
  - `rainfall_series_df` (pd.DataFrame): Time series containing `rainfall_mm` and `timestamp`.
- **Returns:**
  ```json
  {
    "calibrated_risk_probability": 0.0081,
    "static_susceptibility_score": 0.4764,
    "dynamic_trigger_score": 0.1704,
    "threat_level": "LOW",
    "features": { ... 27 features ... },
    "explainability_factors": [
      {
        "factor": "Moderate Slope Angle",
        "value": "13.4 deg",
        "impact": "MODERATE_SUSCEPTIBILITY",
        "description": "Slope angle is in the susceptible threshold window for Teesta basin debris flows."
      }
    ],
    "recommended_action": "GREEN STATUS: Routine automated hydrological surveillance. Normal traffic flow permitted along NH-10 corridor."
  }
  ```

---

## 3. Operational Guarantees

1. **Deterministic Reproducibility:** Fixed random seeds (`seed=42`) and frozen serialized artifacts ensure identical inputs yield identical outputs.
2. **Sub-millisecond Latency:** Inference on a single coordinate executes in $< 1.5\text{ ms}$; full $8 \times 8$ corridor grid interpolation executes in $< 45\text{ ms}$.
3. **Graceful Fallback:** If serialized pickle artifacts are absent or corrupt, physics-based deterministic rules execute automatically to maintain fail-safe operational surveillance.
