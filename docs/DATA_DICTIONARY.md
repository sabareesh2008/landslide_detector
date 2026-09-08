# Landslide Sentinel AI — Comprehensive Data Dictionary

This document defines the schema, units, data types, allowed ranges, and semantic definitions for all datasets used in Landslide Sentinel AI.

---

## 1. Rainfall Datasets

### 1.1 `data/rainfall_history.csv` (Time-Series Observations)

| Column Name | Data Type | Units / Format | Allowed Range / Values | Description | Provenance |
|---|---|---|---|---|---|
| `date_utc` | String | `YYYY-MM-DD` | Valid calendar date | UTC date of observation window | NASA GPM IMERG Early Run |
| `start_time_utc` | String | `HH:MM:SS` | `00:00:00` to `23:30:00` | Start time of 30-minute observation interval | NASA GPM IMERG Early Run |
| `end_time_utc` | String | `HH:MM:SS` | `00:29:59` to `23:59:59` | End time of 30-minute observation interval | NASA GPM IMERG Early Run |
| `observation_end_utc` | String | ISO 8601 UTC | `YYYY-MM-DDTHH:MM:SS+00:00` | Exact UTC observation end timestamp (Primary Key component) | NASA GPM IMERG Early Run |
| `location` | String | Categorical | `Rangpo`, `Singtam` | Name of the monitoring station point | Derived station coordinate |
| `latitude` | Float | Decimal Degrees | `27.10` to `27.30` | Latitude coordinate in WGS84 (`EPSG:4326`) | Station definition |
| `longitude` | Float | Decimal Degrees | `88.40` to `88.60` | Longitude coordinate in WGS84 (`EPSG:4326`) | Station definition |
| `rainfall_mm` | Float | Millimeters ($mm$) | $\ge 0.0$ (typically $0.0 - 50.0$) | Accumulated precipitation in the 30-minute interval | Scaled from IMERG GeoTIFF ($0.1 \times \text{DN}$) |
| `source_file` | String | Filename | `3B-HHR-E.MS.MRG.3IMERG.*.tif` | Source NASA HDF5/GeoTIFF product granule name | NASA PPS |

---

### 1.2 `data/rainfall_latest.json` (Real-Time Summary Schema)

| Field Path | Data Type | Units / Format | Description |
|---|---|---|---|
| `generated_at_utc` | String | ISO 8601 UTC | Timestamp when the JSON summary was compiled |
| `source` | String | Text | Data provider attribution (`NASA GPM IMERG Early Run`) |
| `update_mode` | String | Categorical | Ingestion mode (`incremental`) |
| `cadence` | String | Text | Temporal resolution (`30-minute`) |
| `locations.<Loc>.rainfall_1h_mm` | Float | $mm$ | Rolling accumulated precipitation over the trailing 1 hour |
| `locations.<Loc>.rainfall_24h_mm` | Float | $mm$ | Rolling accumulated precipitation over the trailing 24 hours |
| `locations.<Loc>.rainfall_72h_mm` | Float | $mm$ | Rolling accumulated precipitation over the trailing 72 hours (Antecedent Soil Loading) |
| `locations.<Loc>.rainfall_7d_mm` | Float | $mm$ | Rolling accumulated precipitation over the trailing 7 days (Baseflow saturation) |
| `locations.<Loc>.latest_rainfall_mm` | Float | $mm$ | Precipitation recorded in the single most recent 30-min window |
| `locations.<Loc>.latest_observation_utc` | String | ISO 8601 UTC | UTC timestamp of the latest valid satellite observation |
| `locations.<Loc>.records` | Integer | Count | Total cumulative count of valid 30-min records in history |

---

## 2. Terrain & DEM Datasets

### 2.1 `data/terrain_points.csv` (Station Geotechnical Derivatives)

| Column Name | Data Type | Units | Description | Provenance |
|---|---|---|---|---|
| `location` | String | Name | Monitoring station identifier (`Rangpo`, `Singtam`) | Study definition |
| `latitude` | Float | Decimal Degrees | Latitude in WGS84 | Study definition |
| `longitude` | Float | Decimal Degrees | Longitude in WGS84 | Study definition |
| `elevation_m` | Float | Meters ($m$) | Metric elevation above sea level | Copernicus GLO-30 DSM |
| `slope_degrees` | Float | Degrees ($^\circ$) | Local topographic gradient ($0^\circ - 90^\circ$) via Horn's formula | Copernicus DEM reprojected to UTM Zone 45N |
| `aspect_degrees` | Float | Degrees ($^\circ$) | Downslope azimuth orientation ($0^\circ - 360^\circ$) | Copernicus DEM reprojected to UTM Zone 45N |
| `aspect_direction` | String | Compass | Cardinal/ordinal orientation (`N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`) | Derived from aspect degrees |

---

## 3. Historical Landslide Inventory

### 3.1 `data/landslides.csv` / `rangpo_singtam_landslides.csv`

| Column Name | Data Type | Allowed Values | Description | Provenance |
|---|---|---|---|---|
| `sl_no` | Integer | $\ge 1$ | National Landslide Susceptibility Mapping sequential index | Geological Survey of India |
| `slide_no` | String | Text | Official GSI slide code (e.g. `SKM/SS/78A08/2015/175`) | Geological Survey of India |
| `state` | String | Text | State name (`Sikkim`) | GSI NLSM |
| `district` | String | Text | District administrative name (`East Sikkim`, `South Sikkim`) | GSI NLSM |
| `nh_sh_location` | String | Text | Highway corridor or road name (e.g. `Namchi-Namthang Road`, `Melli-Phong Road`, `NH-10`) | GSI NLSM |
| `latitude` | Float | $27.13^\circ - 27.28^\circ\text{N}$ | Ground-truth latitude coordinate in WGS84 | GSI NLSM Field GPS |
| `longitude` | Float | $88.44^\circ - 88.60^\circ\text{E}$ | Ground-truth longitude coordinate in WGS84 | GSI NLSM Field GPS |
| `material_involved` | String | `Debris`, `Rock`, `Soil` | Primary geological material mobilized | GSI Field Classification |
| `movement_type` | String | `Slide`, `Fall`, `Topple`, `Flow` | Varnes (1978) kinematic failure classification | GSI Field Classification |
| `history` | String | Text / `NA` | Historical recurrence notes | GSI NLSM |

---

## 4. Operational Risk & GeoJSON Outputs

### 4.1 `data/current_risk.json`

| Field Path | Data Type | Units / Enum | Description |
|---|---|---|---|
| `overall_corridor_risk.risk_level` | String | `LOW`, `WATCH`, `HIGH`, `CRITICAL` | Operational danger tier for the entire corridor |
| `overall_corridor_risk.risk_probability` | Float | $0.000 - 1.000$ | Platt-calibrated empirical landslide initiation probability |
| `stations.<Loc>.contributing_factors` | Array of Strings | Text | Identified primary hydrometeorological and slope drivers |
| `stations.<Loc>.recommended_action` | String | Text | Standard Operating Procedure (SOP) action for disaster authorities |

---

### 4.2 `data/risk_grid.geojson` (Feature Properties)

| Property Name | Data Type | Units | Description |
|---|---|---|---|
| `cell_id` | String | Identifier | Unique micro-catchment cell code (`CORRIDOR-GRID-001` to `064`) |
| `elevation_m` | Float | Meters ($m$) | Mean cell surface elevation |
| `slope_degrees` | Float | Degrees ($^\circ$) | Mean cell slope gradient |
| `aspect_degrees` | Float | Degrees ($^\circ$) | Mean cell slope facing azimuth |
| `rainfall_24h_mm` | Float | Millimeters ($mm$) | Trailing 24-hour interpolated precipitation |
| `rainfall_72h_mm` | Float | Millimeters ($mm$) | Trailing 72-hour antecedent precipitation |
| `risk_probability` | Float | $0.000 - 1.000$ | Model calibrated failure probability |
| `risk_level` | String | Enum | Operational hazard class (`LOW`, `WATCH`, `HIGH`, `CRITICAL`) |
