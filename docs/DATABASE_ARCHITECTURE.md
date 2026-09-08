# Landslide Sentinel AI — Enterprise Spatial Database Architecture (PostGIS)

This document specifies the enterprise spatial database architecture, PostGIS schema, entity-relationship model, spatial indices, and partitioning strategies for Landslide Sentinel AI.

---

## 1. Entity-Relationship Overview

```
                      ┌──────────────────────┐
                      │      grid_cells      │ (Polygon, 4326)
                      └──────────┬───────────┘
                                 │ 1:N
        ┌────────────────────────┼────────────────────────┐
        │ 1:N                    │ 1:N                    │ 1:N
        ▼                        ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────┐
│  hourly_rainfall │   │  sensor_nodes    │   │ landslide_prediction │
│  (Observations)  │   │  (IoT Telemetry) │   │ (Calibrated Risk)    │
└──────────────────┘   └──────────────────┘   └──────────┬───────────┘
                                                         │ 1:N
                                                         ▼
                                              ┌──────────────────────┐
                                              │ early_warning_alerts │
                                              │ (NDRF/SDRF Dispatch) │
                                              └──────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│    road_corridors    │   │    field_reports     │   │   historical_events  │
│  (MultiLineString)   │   │  (Citizen GPS / AI)  │   │    (GSI Inventory)   │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

---

## 2. Core PostGIS Table DDL

### 2.1 Micro-Catchment Spatial Grid Cells (`public.grid_cells`)
```sql
CREATE TABLE IF NOT EXISTS public.grid_cells (
    cell_id VARCHAR(64) PRIMARY KEY,
    cell_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(64) NOT NULL,
    district VARCHAR(64) NOT NULL,
    elevation_meters NUMERIC(7,2) NOT NULL,
    slope_degrees NUMERIC(5,2) NOT NULL,
    slope_aspect VARCHAR(32),
    geology_type VARCHAR(255),
    soil_type VARCHAR(255),
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grid_cells_geom ON public.grid_cells USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_grid_cells_state_dist ON public.grid_cells(state, district);
```

### 2.2 Time-Series Environmental Observations (`public.hourly_environmental_observations`)
```sql
CREATE TABLE IF NOT EXISTS public.hourly_environmental_observations (
    observation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cell_id VARCHAR(64) REFERENCES public.grid_cells(cell_id),
    observation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    rainfall_intensity_mm_hr NUMERIC(6,2) NOT NULL DEFAULT 0,
    cumulative_rainfall_24h_mm NUMERIC(7,2) NOT NULL DEFAULT 0,
    cumulative_rainfall_72h_mm NUMERIC(7,2) NOT NULL DEFAULT 0,
    surface_soil_moisture_percent NUMERIC(5,2),
    insar_ground_displacement_mm NUMERIC(6,2),
    pore_water_pressure_kpa NUMERIC(6,2),
    satellite_source VARCHAR(64) DEFAULT 'NASA GPM IMERG Early Run',
    data_quality_flag VARCHAR(32) DEFAULT 'VALIDATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (observation_timestamp);
CREATE INDEX IF NOT EXISTS idx_obs_cell_time ON public.hourly_environmental_observations(cell_id, observation_timestamp DESC);
```

### 2.3 AI Model Inference & Risk Predictions (`public.landslide_predictions`)
```sql
CREATE TABLE IF NOT EXISTS public.landslide_predictions (
    prediction_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cell_id VARCHAR(64) REFERENCES public.grid_cells(cell_id),
    calculation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    severity VARCHAR(32) CHECK (severity IN ('low', 'watch', 'high', 'critical')),
    calibrated_probability NUMERIC(4,3) NOT NULL,
    model_version VARCHAR(64) DEFAULT 'HistGradientBoosting-v1.0',
    primary_factors JSONB,
    recommended_action TEXT
);
CREATE INDEX IF NOT EXISTS idx_pred_cell_sev ON public.landslide_predictions(cell_id, severity);
```

### 2.4 GSI Historical Landslide Inventory (`public.historical_landslides`)
```sql
CREATE TABLE IF NOT EXISTS public.historical_landslides (
    slide_id VARCHAR(64) PRIMARY KEY,
    gsi_code VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    district VARCHAR(64) NOT NULL,
    road_corridor VARCHAR(255),
    material_involved VARCHAR(64),
    movement_type VARCHAR(64),
    geom GEOMETRY(Point, 4326) NOT NULL,
    recorded_at DATE
);
CREATE INDEX IF NOT EXISTS idx_hist_landslides_geom ON public.historical_landslides USING GIST(geom);
```

---

## 3. Key Spatial Queries for Highway Decision Support

### Proximity of High-Risk Zones to NH-10 Corridor Buffer ($500\text{ meters}$):
```sql
SELECT c.cell_id, c.name, p.severity, p.calibrated_probability
FROM public.grid_cells c
JOIN public.landslide_predictions p ON c.cell_id = p.cell_id
JOIN public.road_corridors r ON ST_DWithin(c.geom::geography, r.geom::geography, 500)
WHERE r.highway_number = 'NH-10'
  AND p.severity IN ('high', 'critical')
ORDER BY p.calibrated_probability DESC;
```
