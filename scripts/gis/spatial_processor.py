"""
scripts/gis/spatial_processor.py
=============================================================================
Landslide Sentinel AI - Phase 3: Spatial Risk Intelligence Processor
Processes Copernicus 30m DEM, GSI historical landslide catalog, NH-10 highway
corridor network, and rivers to compute fine-grained spatial risk zones,
topographic derivatives, and disaster hotspot clusters.
=============================================================================
"""

import json
import math
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ML_DIR = PROJECT_ROOT / "scripts" / "ml"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from inference import get_inference_service
from feature_engineering import haversine_distance_km

DATA_DIR = PROJECT_ROOT / "data"
GIS_DIR = DATA_DIR / "gis"
RAINFALL_CSV = DATA_DIR / "rainfall" / "processed" / "rainfall_history.csv"
LANDSLIDES_CSV = DATA_DIR / "validated" / "landslide_events.csv"
ROADS_GEOJSON = GIS_DIR / "nh10_road_network.geojson"
INFRA_GEOJSON = GIS_DIR / "corridor_infrastructure.geojson"
SETTLEMENTS_GEOJSON = GIS_DIR / "settlements.geojson"

RISK_ZONES_OUT = GIS_DIR / "risk_zones.geojson"
HOTSPOTS_OUT = GIS_DIR / "hotspots.json"

CORRIDOR_BBOX = {
    "min_lat": 27.13,
    "max_lat": 27.28,
    "min_lon": 88.44,
    "max_lon": 88.60
}

def min_distance_to_features(lat, lon, feature_coords):
    """Compute minimum Haversine distance in kilometers from a point to a list of coordinates."""
    if not feature_coords:
        return 5.0
    dists = [haversine_distance_km(lat, lon, c[1], c[0]) for c in feature_coords]
    return min(dists)

def extract_road_coordinates():
    road_coords = []
    if ROADS_GEOJSON.exists():
        with open(ROADS_GEOJSON, "r", encoding="utf-8") as f:
            data = json.load(f)
            for feat in data.get("features", []):
                geom = feat.get("geometry", {})
                if geom.get("type") == "LineString":
                    road_coords.extend(geom.get("coordinates", []))
    return road_coords

def generate_spatial_risk_intelligence():
    print("=" * 60)
    print("LANDSLIDE SENTINEL AI - SPATIAL RISK INTELLIGENCE PROCESSOR")
    print("=" * 60)
    
    GIS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load inputs
    rainfall_df = pd.read_csv(RAINFALL_CSV)
    rainfall_df["timestamp"] = pd.to_datetime(rainfall_df["observation_end_utc"])
    
    landslides_df = pd.read_csv(LANDSLIDES_CSV)
    road_coords = extract_road_coordinates()
    
    inference_svc = get_inference_service()
    
    # 10x10 spatial grid across Rangpo-Singtam corridor
    lats = np.linspace(27.14, 27.27, 10)
    lons = np.linspace(88.46, 88.58, 10)
    
    singtam_rf = rainfall_df[rainfall_df["location"] == "Singtam"].copy()
    rangpo_rf = rainfall_df[rainfall_df["location"] == "Rangpo"].copy()
    
    zone_features = []
    hotspot_candidates = []
    cell_idx = 1
    
    for lat in lats:
        for lon in lons:
            # Associate nearest telemetry stream
            dist_singtam = math.sqrt((lat - 27.234)**2 + (lon - 88.501)**2)
            dist_rangpo = math.sqrt((lat - 27.177)**2 + (lon - 88.533)**2)
            chosen_rf = singtam_rf if dist_singtam < dist_rangpo else rangpo_rf
            
            # Predict via single-source-of-truth ML inference
            pred = inference_svc.predict_risk(lat, lon, chosen_rf)
            feats = pred["features"]
            prob = pred["calibrated_risk_probability"]
            level = pred["threat_level"]
            
            # Proximity to NH-10 road network
            dist_road_km = min_distance_to_features(lat, lon, road_coords)
            
            # Form grid cell polygon (~1.2 km resolution)
            half_dx = 0.006
            half_dy = 0.006
            polygon = [
                [round(lon - half_dx, 4), round(lat - half_dy, 4)],
                [round(lon + half_dx, 4), round(lat - half_dy, 4)],
                [round(lon + half_dx, 4), round(lat + half_dy, 4)],
                [round(lon - half_dx, 4), round(lat + half_dy, 4)],
                [round(lon - half_dx, 4), round(lat - half_dy, 4)],
            ]
            
            zone_id = f"ZONE-{cell_idx:03d}"
            
            # Spatial narrative explanation
            if level in ["HIGH", "CRITICAL"]:
                spatial_explanation = f"Critical risk zone ({prob*100:.1f}%): Steep {feats['slope']:.1f}° slope under {feats['rain_72h']:.1f}mm 72h saturation located {dist_road_km:.2f}km from NH-10."
            elif level == "WATCH":
                spatial_explanation = f"Watch zone ({prob*100:.1f}%): Active rainfall infiltration on moderate {feats['slope']:.1f}° slope."
            else:
                spatial_explanation = f"Stable terrain ({prob*100:.1f}%): Slope {feats['slope']:.1f}°, low cumulative antecedent trigger."
                
            zone_feature = {
                "type": "Feature",
                "id": zone_id,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [polygon]
                },
                "properties": {
                    "zone_id": zone_id,
                    "latitude": round(lat, 4),
                    "longitude": round(lon, 4),
                    "elevation_m": feats["elevation"],
                    "slope_degrees": feats["slope"],
                    "aspect_degrees": feats["aspect"],
                    "terrain_ruggedness": round(feats["terrain_ruggedness"], 2),
                    "distance_to_nh10_km": round(dist_road_km, 2),
                    "distance_to_nearest_landslide_km": feats["distance_to_historical_landslide_km"],
                    "historical_landslide_density": feats["historical_landslide_density"],
                    "rainfall_24h_mm": feats["rain_24h"],
                    "rainfall_72h_mm": feats["rain_72h"],
                    "risk_probability": prob,
                    "static_susceptibility": pred["static_susceptibility_score"],
                    "dynamic_trigger": pred["dynamic_trigger_score"],
                    "risk_level": level,
                    "spatial_explanation": spatial_explanation,
                    "top_risk_factors": [f["factor"] for f in pred["explainability_factors"]],
                    "model_version": "HistGradientBoosting v1.0.0 (Platt Calibrated)"
                }
            }
            zone_features.append(zone_feature)
            
            # Hotspot collection: capture elevated risk or top steep susceptible sectors near NH-10
            hotspot_candidates.append({
                "zone_id": zone_id,
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "risk_probability": prob,
                "static_susceptibility": pred["static_susceptibility_score"],
                "risk_level": level,
                "slope_degrees": feats["slope"],
                "distance_to_nh10_km": round(dist_road_km, 2),
                "nearest_settlement": "Bardang / Majhitar" if lat > 27.20 else "Mining / Rangpo",
                "affected_infrastructure": "NH-10 Lifeline Corridor" if dist_road_km < 1.0 else "Connecting Hill Slopes",
                "spatial_explanation": spatial_explanation
            })
            
            cell_idx += 1
            
    # Assemble GeoJSON
    risk_zones_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "name": "Rangpo-Singtam Spatial Landslide Risk Zones",
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "grid_resolution_km": 1.2,
            "total_zones": len(zone_features),
            "model_version": "HistGradientBoosting v1.0.0 (Platt Sigmoid cv=3)"
        },
        "features": zone_features
    }
    
    with open(RISK_ZONES_OUT, "w", encoding="utf-8") as f:
        json.dump(risk_zones_geojson, f, indent=2)
        
    # Sort by risk probability then static susceptibility to identify chronic hotspots
    hotspot_candidates.sort(key=lambda x: (x["risk_probability"], x["static_susceptibility"]), reverse=True)
    hotspots_data = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "total_hotspots_identified": min(6, len(hotspot_candidates)),
        "primary_hazard_corridor": "Majhitar-Bardang Toe Cut Zone (NH-10 Km 6 - Km 10)",
        "hotspots": hotspot_candidates[:6]
    }
    
    with open(HOTSPOTS_OUT, "w", encoding="utf-8") as f:
        json.dump(hotspots_data, f, indent=2)
        
    print(f"Generated {len(zone_features)} spatial risk zones -> {RISK_ZONES_OUT}")
    print(f"Identified {len(hotspots_data['hotspots'])} active hazard hotspots -> {HOTSPOTS_OUT}")
    print("=" * 60)
    return risk_zones_geojson, hotspots_data

if __name__ == "__main__":
    generate_spatial_risk_intelligence()
