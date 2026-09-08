# Landslide Sentinel AI — Final Master Data Flow

## 1. End-to-End Data Lifecycle

```
[NASA IMERG & Ground IoT]
           │
           ▼
[Automated Fetch / CRON] ──► Validate Age & Check Integrity ──► [data/rainfall/processed/]
                                                                       │
           ┌───────────────────────────────────────────────────────────┘
           ▼
[Feature Engineering] ◄── [SRTM 30m DEM + GSI Landslide Database]
           │
           ▼ (27 Physical Dimensions)
[Calibrated ML Inference] ──► [scripts/ml/inference.py]
           │
           ├──► [scripts/gis/spatial_processor.py] ──► [data/gis/risk_zones.geojson]
           │                                      ──► [data/gis/hotspots.json]
           │
           ├──► [scripts/emergency/impact_analyzer.py] ──► [data/infrastructure/road_impact.json]
           │                                            ──► [data/alerts/alerts.json]
           │
           └──► [scripts/iot/sensor_processor.py] ──► [data/iot/sensor_anomalies.json]
                                                             │
                                                             ▼
                                                [Zero-Build Frontend UI]
                                                • GIS Map & Hotspots Layer
                                                • Segment Risk Badges
                                                • Shelter Routing & Alerts
                                                • Multilingual TTS Audio
```

---

## 2. Ingestion Freshness & Latency Management
- **Half-Hourly Update Cycle**: Ingests new IMERG half-hourly precipitation files via automated GitHub Actions or cron.
- **Freshness Classification**:
  - `FRESH`: Age $\le 6$ hours (Normal real-time operational status).
  - `STALE`: Age between 6 and 48 hours (Advisory notice displayed on UI).
  - `DEGRADED`: Age $> 48$ hours (Fallback to historical or simulation telemetry with explicit amber/red warning banners).

---

## 3. Multimodal Field Data Flow & Active Learning Retraining
1. **Citizen/Officer Submission**: Photo + GPS captured via mobile PWA.
2. **Edge/Cloud Vision AI**: ResNet/YOLO feature extractor identifies tension cracks, rockfalls, and debris flow runout.
3. **Queue Staging**: Item placed in `data/field_reports/field_reports.json` under `AI_ANALYZED`.
4. **Human Geotechnical Approval**: Geotechnical Engineer reviews and stamps with `FIELD_VERIFIED`.
5. **Candidate Staging**: Automatically added to `data/field_reports/verified_training_candidates.json`.
6. **Model Calibration Cycle**: Periodic retraining script merges new candidates into `dataset_v001.csv`, generating model `v002` with updated provenance hashes.
