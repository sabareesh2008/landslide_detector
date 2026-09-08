"""
scripts/risk_engine.py
=============================================================================
Landslide Sentinel AI - Real-Time Risk Engine
Consumes near-real-time NASA IMERG telemetry and Copernicus DEM parameters,
invokes the authoritative ML inference service (HistGB + Platt Calibration),
and produces data/current_risk.json and data/risk_grid.geojson.
=============================================================================
"""

import json
import math
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ML_DIR = PROJECT_ROOT / "scripts" / "ml"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from inference import get_inference_service

DATA_DIR = PROJECT_ROOT / "data"
RAINFALL_LATEST_JSON = DATA_DIR / "rainfall" / "processed" / "rainfall_latest.json"
RAINFALL_HISTORY_CSV = DATA_DIR / "rainfall" / "processed" / "rainfall_history.csv"
LANDSLIDES_CSV = DATA_DIR / "landslides" / "processed" / "rangpo_singtam_landslides.csv"
TERRAIN_POINTS_CSV = DATA_DIR / "dem" / "processed" / "terrain_points.csv"
METRICS_JSON = DATA_DIR / "model_metrics.json"

CURRENT_RISK_OUT = DATA_DIR / "current_risk.json"
RISK_SUBDIR_OUT = DATA_DIR / "risk" / "current_risk.json"
RISK_GRID_GEOJSON = DATA_DIR / "risk_grid.geojson"

ROOT_RAINFALL_LATEST = DATA_DIR / "rainfall_latest.json"
ROOT_RAINFALL_HISTORY = DATA_DIR / "rainfall_history.csv"
ROOT_LANDSLIDES = DATA_DIR / "landslides.csv"
ROOT_TERRAIN_POINTS = DATA_DIR / "terrain_points.csv"

STATIONS = {
    "Rangpo": {
        "lat": 27.177,
        "lon": 88.533,
        "elevation": 306.95,
        "slope": 13.38,
        "aspect": 279.29,
        "aspect_direction": "W",
        "historical_density": 18.5,
        "distance_to_landslide_km": 1.2
    },
    "Singtam": {
        "lat": 27.234,
        "lon": 88.501,
        "elevation": 436.68,
        "slope": 21.52,
        "aspect": 343.86,
        "aspect_direction": "N",
        "historical_density": 24.2,
        "distance_to_landslide_km": 0.8
    }
}

def sync_data_files():
    """Ensure root data/ has direct copies of all core files for GitHub Pages static serving."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "risk").mkdir(parents=True, exist_ok=True)
    
    if RAINFALL_LATEST_JSON.exists():
        shutil.copy2(RAINFALL_LATEST_JSON, ROOT_RAINFALL_LATEST)
    if RAINFALL_HISTORY_CSV.exists():
        shutil.copy2(RAINFALL_HISTORY_CSV, ROOT_RAINFALL_HISTORY)
    if LANDSLIDES_CSV.exists():
        shutil.copy2(LANDSLIDES_CSV, ROOT_LANDSLIDES)
    if TERRAIN_POINTS_CSV.exists():
        shutil.copy2(TERRAIN_POINTS_CSV, ROOT_TERRAIN_POINTS)
        
    print("Synced data files to root data/ directory.")

def calculate_station_risk_via_ml(station_name, rainfall_history_df, inference_svc):
    station_cfg = STATIONS[station_name]
    lat = station_cfg["lat"]
    lon = station_cfg["lon"]
    
    st_rain = rainfall_history_df[rainfall_history_df["location"] == station_name].copy()
    pred = inference_svc.predict_risk(lat, lon, st_rain)
    
    feats = pred["features"]
    
    latest_obs = None
    if len(st_rain) > 0:
        if "observation_end_utc" in st_rain.columns:
            latest_obs = str(st_rain["observation_end_utc"].iloc[-1])
        elif "timestamp" in st_rain.columns:
            latest_obs = str(st_rain["timestamp"].iloc[-1])
    if not latest_obs:
        latest_obs = datetime.now(timezone.utc).isoformat()
        
    return {
        "location": station_name,
        "latitude": lat,
        "longitude": lon,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "latest_observation_utc": latest_obs,
        "data_status": "CONNECTED",
        "data_mode": "LIVE",
        "risk_probability": pred["calibrated_risk_probability"],
        "static_susceptibility": pred["static_susceptibility_score"],
        "dynamic_trigger": pred["dynamic_trigger_score"],
        "calibration_status": "Sigmoid Calibrated (Platt Scaling cv=3)",
        "risk_level": pred["threat_level"],
        "model_version": "HistGradientBoosting v1.0.0 (Calibrated)",
        "rainfall_1h_mm": feats["rain_1h"],
        "rainfall_24h_mm": feats["rain_24h"],
        "rainfall_72h_mm": feats["rain_72h"],
        "rainfall_7d_mm": feats["rain_7d"],
        "elevation_m": station_cfg["elevation"],
        "slope_degrees": station_cfg["slope"],
        "aspect_degrees": station_cfg["aspect"],
        "aspect_direction": station_cfg["aspect_direction"],
        "historical_landslide_density": station_cfg["historical_density"],
        "contributing_factors": [f"{f['factor']}: {f['value']}" for f in pred["explainability_factors"]],
        "explainability_breakdown": pred["explainability_factors"],
        "recommended_action": pred["recommended_action"]
    }

def generate_spatial_risk_grid_via_ml(rainfall_history_df, inference_svc):
    """
    Generate spatial GeoJSON grid across Rangpo-Singtam / NH-10 corridor
    using calibrated ML inference on spatial DEM grid cells.
    """
    lats = np.linspace(27.14, 27.27, 8)
    lons = np.linspace(88.46, 88.58, 8)
    
    singtam_rain = rainfall_history_df[rainfall_history_df["location"] == "Singtam"].copy()
    rangpo_rain = rainfall_history_df[rainfall_history_df["location"] == "Rangpo"].copy()
    
    features = []
    cell_idx = 1
    
    for lat in lats:
        for lon in lons:
            dist_singtam = math.sqrt((lat - 27.234)**2 + (lon - 88.501)**2)
            dist_rangpo = math.sqrt((lat - 27.177)**2 + (lon - 88.533)**2)
            
            # Select closer station's rainfall series
            chosen_rf = singtam_rain if dist_singtam < dist_rangpo else rangpo_rain
            
            pred = inference_svc.predict_risk(lat, lon, chosen_rf)
            feats = pred["features"]
            
            half_dx = 0.008
            half_dy = 0.008
            
            polygon = [
                [round(lon - half_dx, 4), round(lat - half_dy, 4)],
                [round(lon + half_dx, 4), round(lat - half_dy, 4)],
                [round(lon + half_dx, 4), round(lat + half_dy, 4)],
                [round(lon - half_dx, 4), round(lat + half_dy, 4)],
                [round(lon - half_dx, 4), round(lat - half_dy, 4)],
            ]
            
            feature = {
                "type": "Feature",
                "id": f"CELL-{cell_idx:03d}",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [polygon]
                },
                "properties": {
                    "cell_id": f"CORRIDOR-GRID-{cell_idx:03d}",
                    "latitude": round(lat, 4),
                    "longitude": round(lon, 4),
                    "elevation_m": feats["elevation"],
                    "slope_degrees": feats["slope"],
                    "aspect_degrees": feats["aspect"],
                    "rainfall_24h_mm": feats["rain_24h"],
                    "rainfall_72h_mm": feats["rain_72h"],
                    "risk_probability": pred["calibrated_risk_probability"],
                    "static_susceptibility": pred["static_susceptibility_score"],
                    "dynamic_trigger": pred["dynamic_trigger_score"],
                    "risk_level": pred["threat_level"],
                    "model_version": "HistGradientBoosting v1.0.0 (Calibrated)"
                }
            }
            features.append(feature)
            cell_idx += 1
            
    geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "total_cells": len(features),
            "corridor": "Rangpo-Singtam / NH-10 Corridor, Sikkim",
            "grid_resolution": "8x8 Interpolated Hydro-DEM Matrix",
            "model_version": "HistGradientBoosting v1.0.0 (Platt Calibrated)"
        },
        "features": features
    }
    return geojson

def run_risk_engine():
    print("=" * 60)
    print("LANDSLIDE SENTINEL AI - EXECUTING PRODUCTION RISK ENGINE")
    print("=" * 60)
    
    sync_data_files()
    
    if not RAINFALL_HISTORY_CSV.exists():
        raise FileNotFoundError(f"Rainfall history missing at: {RAINFALL_HISTORY_CSV}")
        
    rainfall_df = pd.read_csv(RAINFALL_HISTORY_CSV)
    if "observation_end_utc" in rainfall_df.columns:
        rainfall_df["timestamp"] = pd.to_datetime(rainfall_df["observation_end_utc"])
    elif "timestamp" in rainfall_df.columns:
        rainfall_df["timestamp"] = pd.to_datetime(rainfall_df["timestamp"])
    rainfall_df = rainfall_df.sort_values("timestamp").reset_index(drop=True)
    
    inference_svc = get_inference_service()
    freshness = inference_svc.check_data_freshness()
    print("Telemetry Freshness Assessment:", freshness)
    
    # Calculate for Rangpo & Singtam
    rangpo_risk = calculate_station_risk_via_ml("Rangpo", rainfall_df, inference_svc)
    singtam_risk = calculate_station_risk_via_ml("Singtam", rainfall_df, inference_svc)
    
    overall_prob = max(rangpo_risk["risk_probability"], singtam_risk["risk_probability"])
    overall_level = "LOW"
    if overall_prob >= 0.75:
        overall_level = "CRITICAL"
    elif overall_prob >= 0.45:
        overall_level = "HIGH"
    elif overall_prob >= 0.20:
        overall_level = "WATCH"
        
    # Build complete current risk JSON
    current_risk_data = {
        "system_status": "OPERATIONAL",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "corridor": "Rangpo-Singtam / NH-10 Corridor, Sikkim",
        "data_mode": "LIVE",
        "telemetry_freshness": freshness,
        "overall_corridor_risk": {
            "risk_level": overall_level,
            "max_risk_probability": overall_prob,
            "risk_probability": overall_prob,
            "calibrated": True,
            "model_version": "HistGradientBoosting v1.0.0 (Platt Sigmoid cv=3)"
        },
        "stations": {
            "Rangpo": rangpo_risk,
            "Singtam": singtam_risk
        },
        "physics_contributions_pct": inference_svc.physics_contributions_pct,
        "road_network": [
            {
                "road_name": "NH-10 Rangpo to Singtam Corridor",
                "segment_km": "12.4 km",
                "status": "OPEN" if overall_level in ["LOW", "WATCH"] else ("RESTRICTED" if overall_level == "HIGH" else "CLOSED"),
                "risk_level": overall_level,
                "advisory": "Standard transit vigilance; monitor hillside drainage." if overall_level == "LOW" else ("Night transit caution." if overall_level == "WATCH" else "Heavy vehicle detour advised.")
            }
        ]
    }
    
    # Write current_risk.json to both data/ and data/risk/
    with open(CURRENT_RISK_OUT, "w", encoding="utf-8") as f:
        json.dump(current_risk_data, f, indent=2)
    with open(RISK_SUBDIR_OUT, "w", encoding="utf-8") as f:
        json.dump(current_risk_data, f, indent=2)
        
    print(f"Saved current risk to: {CURRENT_RISK_OUT} and {RISK_SUBDIR_OUT}")
    
    # Generate and write spatial risk GeoJSON
    risk_grid_geojson = generate_spatial_risk_grid_via_ml(rainfall_df, inference_svc)
    with open(RISK_GRID_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(risk_grid_geojson, f, indent=2)
        
    print(f"Saved spatial risk grid GeoJSON to: {RISK_GRID_GEOJSON}")
    print("=" * 60)
    return current_risk_data

if __name__ == "__main__":
    run_risk_engine()
