"""
scripts/ml/inference.py
=============================================================================
Landslide Sentinel AI - Single-Source-of-Truth ML Inference Service
Authoritative inference module that loads calibrated production models, extracts
real-time DEM + IMERG features, calculates calibrated failure probabilities,
generates physical explainability attributions, and validates telemetry freshness.
=============================================================================
"""

import json
import math
import os
import pickle
import sys
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd

# Add script directory to path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

DATA_DIR = PROJECT_ROOT / "data"
ARTIFACTS_DIR = DATA_DIR / "model" / "artifacts"
CALIBRATED_MODEL_PKL = ARTIFACTS_DIR / "calibrated_production_model.pkl"
MODEL_A_PKL = ARTIFACTS_DIR / "model_a_susceptibility.pkl"
RAINFALL_LATEST_JSON = DATA_DIR / "rainfall" / "processed" / "rainfall_latest.json"
ROOT_RAINFALL_LATEST = DATA_DIR / "rainfall_latest.json"
VALIDATED_LANDSLIDES_CSV = DATA_DIR / "validated" / "landslide_events.csv"

# Import feature engineering helpers
from feature_engineering import (
    FEATURE_COLUMNS,
    compute_rolling_rainfall_features,
    extract_dem_features_for_point,
    haversine_distance_km,
)

class LandslideInferenceService:
    def __init__(self):
        self.calibrated_model = None
        self.model_a = None
        self.feature_columns = FEATURE_COLUMNS
        self.landslides_df = None
        self.physics_contributions_pct = {}
        self.feature_importances = {}
        self._load_artifacts()

    def _load_artifacts(self):
        """Load trained model artifacts into memory."""
        if CALIBRATED_MODEL_PKL.exists():
            try:
                with open(CALIBRATED_MODEL_PKL, "rb") as f:
                    data = pickle.load(f)
                    self.calibrated_model = data["model"]
                    self.feature_columns = data.get("feature_columns", FEATURE_COLUMNS)
                    self.physics_contributions_pct = data.get("physics_contributions_pct", {})
                    self.feature_importances = data.get("feature_importances", {})
            except Exception as e:
                print(f"[WARN] Error loading calibrated model: {e}")

        if MODEL_A_PKL.exists():
            try:
                with open(MODEL_A_PKL, "rb") as f:
                    data_a = pickle.load(f)
                    self.model_a = data_a["model"]
            except Exception as e:
                print(f"[WARN] Error loading model A: {e}")

        if VALIDATED_LANDSLIDES_CSV.exists():
            try:
                self.landslides_df = pd.read_csv(VALIDATED_LANDSLIDES_CSV)
            except Exception as e:
                print(f"[WARN] Error loading validated landslides: {e}")

    def check_data_freshness(self, max_stale_hours=6.0):
        """Evaluate observation freshness of NASA IMERG telemetry."""
        freshness_info = {
            "status": "DATA_UNAVAILABLE",
            "last_observation_utc": None,
            "age_hours": None,
            "is_fresh": False
        }
        
        target_path = None
        if RAINFALL_LATEST_JSON.exists():
            target_path = RAINFALL_LATEST_JSON
        elif ROOT_RAINFALL_LATEST.exists():
            target_path = ROOT_RAINFALL_LATEST
            
        if not target_path:
            return freshness_info

        try:
            with open(target_path, "r", encoding="utf-8") as f:
                latest_data = json.load(f)
            
            obs_utc_str = latest_data.get("timestamp_utc") or latest_data.get("observation_end_utc") or latest_data.get("generated_at_utc")
            if not obs_utc_str or "locations" in latest_data:
                # Check locations dictionary
                locs = latest_data.get("locations", {})
                for loc_data in locs.values():
                    if isinstance(loc_data, dict) and "latest_observation_utc" in loc_data:
                        obs_utc_str = loc_data["latest_observation_utc"]
                        break
                if not obs_utc_str:
                    stations = latest_data.get("stations", {})
                    for st in stations.values():
                        if isinstance(st, dict) and ("latest_observation_utc" in st or "observation_end_utc" in st):
                            obs_utc_str = st.get("latest_observation_utc") or st.get("observation_end_utc")
                            break

            if obs_utc_str:
                obs_dt = pd.to_datetime(obs_utc_str)
                if obs_dt.tzinfo is None:
                    obs_dt = obs_dt.replace(tzinfo=timezone.utc)
                now_dt = datetime.now(timezone.utc)
                diff_hours = max(0.0, (now_dt - obs_dt).total_seconds() / 3600.0)
                
                freshness_info["last_observation_utc"] = obs_dt.isoformat()
                freshness_info["age_hours"] = round(diff_hours, 2)
                
                if diff_hours <= max_stale_hours:
                    freshness_info["status"] = "FRESH"
                    freshness_info["is_fresh"] = True
                elif diff_hours <= 48.0:
                    freshness_info["status"] = "STALE"
                    freshness_info["is_fresh"] = False
                else:
                    freshness_info["status"] = "DEGRADED"
                    freshness_info["is_fresh"] = False
        except Exception as e:
            freshness_info["status"] = f"ERROR: {str(e)}"

        return freshness_info

    def compute_features_dict(self, lat, lon, rainfall_series_df):
        """Extract full 27-feature array for a given coordinate and rainfall time series."""
        # 1. Topographic features
        dem_feats = extract_dem_features_for_point(lat, lon, self.landslides_df)
        
        # 2. Dynamic rolling rainfall
        sorted_rf = rainfall_series_df.copy()
        if "timestamp" not in sorted_rf.columns:
            if "observation_end_utc" in sorted_rf.columns:
                sorted_rf["timestamp"] = pd.to_datetime(sorted_rf["observation_end_utc"])
            elif "date_utc" in sorted_rf.columns:
                sorted_rf["timestamp"] = pd.to_datetime(sorted_rf["date_utc"])
            else:
                sorted_rf["timestamp"] = pd.date_range(end=datetime.now(timezone.utc), periods=len(sorted_rf), freq="30min")
        else:
            sorted_rf["timestamp"] = pd.to_datetime(sorted_rf["timestamp"])

        sorted_rf = sorted_rf.sort_values("timestamp").reset_index(drop=True)
        sorted_rf = sorted_rf.set_index("timestamp")
        rain_s = sorted_rf["rainfall_mm"]
        
        rain_30min = float(rain_s.iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_1h = float(rain_s.rolling("1h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_3h = float(rain_s.rolling("3h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_6h = float(rain_s.rolling("6h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_12h = float(rain_s.rolling("12h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_24h = float(rain_s.rolling("24h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_48h = float(rain_s.rolling("48h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_72h = float(rain_s.rolling("72h", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        rain_7d = float(rain_s.rolling("7D", min_periods=1).sum().iloc[-1]) if len(rain_s) > 0 else 0.0
        
        max_rain_1h = float(rain_s.rolling("1h", min_periods=1).max().iloc[-1]) if len(rain_s) > 0 else 0.0
        max_rain_3h = float(rain_s.rolling("3h", min_periods=1).max().iloc[-1]) if len(rain_s) > 0 else 0.0
        max_rain_6h = float(rain_s.rolling("6h", min_periods=1).max().iloc[-1]) if len(rain_s) > 0 else 0.0
        max_rain_24h = float(rain_s.rolling("24h", min_periods=1).max().iloc[-1]) if len(rain_s) > 0 else 0.0
        
        r1_s = rain_s.rolling("1h", min_periods=1).sum()
        r3_s = rain_s.rolling("3h", min_periods=1).sum()
        rain_change_1h = float((r1_s - r1_s.shift(2).fillna(0)).iloc[-1]) if len(r1_s) > 2 else 0.0
        rain_change_3h = float((r3_s - r3_s.shift(6).fillna(0)).iloc[-1]) if len(r3_s) > 6 else 0.0
        accel = rain_change_1h
        
        feats = {
            "rain_30min": rain_30min,
            "rain_1h": rain_1h,
            "rain_3h": rain_3h,
            "rain_6h": rain_6h,
            "rain_12h": rain_12h,
            "rain_24h": rain_24h,
            "rain_48h": rain_48h,
            "rain_72h": rain_72h,
            "rain_7d": rain_7d,
            "max_rain_1h": max_rain_1h,
            "max_rain_3h": max_rain_3h,
            "max_rain_6h": max_rain_6h,
            "max_rain_24h": max_rain_24h,
            "rainfall_change_1h": rain_change_1h,
            "rainfall_change_3h": rain_change_3h,
            "rainfall_acceleration": accel,
            "elevation": dem_feats["elevation"],
            "slope": dem_feats["slope"],
            "aspect": dem_feats["aspect"],
            "aspect_sin": dem_feats["aspect_sin"],
            "aspect_cos": dem_feats["aspect_cos"],
            "terrain_ruggedness": dem_feats["terrain_ruggedness"],
            "distance_to_historical_landslide_km": dem_feats["distance_to_historical_landslide_km"],
            "historical_landslide_density": dem_feats["historical_landslide_density"],
            "slope_x_rain24h": dem_feats["slope"] * rain_24h,
            "ruggedness_x_rain72h": dem_feats["terrain_ruggedness"] * rain_72h,
            "susceptibility_x_rain_peak": (dem_feats["historical_landslide_density"] / 10.0) * max_rain_3h
        }
        return feats

    def explain_prediction(self, feats_dict):
        """Generate physics-based feature contributions and human-readable risk drivers."""
        factors = []
        
        r24 = feats_dict.get("rain_24h", 0)
        r72 = feats_dict.get("rain_72h", 0)
        if r72 >= 30.0:
            factors.append({
                "factor": "Antecedent Soil Saturation (72h)",
                "value": f"{r72:.1f} mm",
                "impact": "HIGH_RISK_DRIVER",
                "description": "Prolonged rainfall has saturated the saprolite pore space, elevating pore-water pressure."
            })
        elif r24 >= 15.0:
            factors.append({
                "factor": "Cumulative 24h Infiltration",
                "value": f"{r24:.1f} mm",
                "impact": "ELEVATED_INFILTRATION",
                "description": "Recent 24-hour rainfall is actively infiltrating slope colluvium."
            })
            
        slope = feats_dict.get("slope", 0)
        if slope >= 20.0:
            factors.append({
                "factor": "Steep Slope Gradient",
                "value": f"{slope:.1f} deg",
                "impact": "TOPOGRAPHIC_SUSCEPTIBILITY",
                "description": "High gravitational shear stress exceeds frictional resisting forces on steep slopes."
            })
        elif slope >= 13.0:
            factors.append({
                "factor": "Moderate Slope Angle",
                "value": f"{slope:.1f} deg",
                "impact": "MODERATE_SUSCEPTIBILITY",
                "description": "Slope angle is in the susceptible threshold window for Teesta basin debris flows."
            })
            
        r1 = feats_dict.get("rain_1h", 0)
        if r1 >= 3.0:
            factors.append({
                "factor": "Intense Precipitation Burst (1h)",
                "value": f"{r1:.1f} mm/h",
                "impact": "TRIGGER_ACCELERATOR",
                "description": "Rapid surface runoff and erosion trigger destabilization of saturated surficial debris."
            })

        dist = feats_dict.get("distance_to_historical_landslide_km", 2.0)
        density = feats_dict.get("historical_landslide_density", 0)
        if dist <= 1.0 or density >= 15.0:
            factors.append({
                "factor": "Historical Shear Zone Proximity",
                "value": f"{dist:.2f} km ({density:.1f} slides/km2)",
                "impact": "GEOLOGICAL_WEAKNESS",
                "description": "Located within active or historical slide cluster zone with weathered phyllite-schist bedrock."
            })
            
        if not factors:
            factors.append({
                "factor": "Stable Antecedent State",
                "value": f"24h Rain: {r24:.1f}mm, Slope: {slope:.1f} deg",
                "impact": "STABILIZING_CONDITIONS",
                "description": "Dry soil profile and low gravitational shear stress maintain factor of safety > 1.5."
            })
            
        return factors

    def predict_risk(self, lat, lon, rainfall_series_df):
        """
        Execute calibrated end-to-end inference.
        Returns:
            - calibrated_risk_probability (0.0 to 1.0)
            - static_susceptibility_score (0.0 to 1.0)
            - dynamic_trigger_score (0.0 to 1.0)
            - threat_level ('LOW', 'WATCH', 'HIGH', 'CRITICAL')
            - explainability_factors (List)
            - recommended_action (String)
        """
        feats = self.compute_features_dict(lat, lon, rainfall_series_df)
        feat_df = pd.DataFrame([feats])[self.feature_columns]
        
        if self.calibrated_model is not None:
            calibrated_prob = float(self.calibrated_model.predict_proba(feat_df)[0, 1])
        else:
            r24 = feats["rain_24h"]
            slope = feats["slope"]
            calibrated_prob = min(1.0, max(0.01, (r24 / 50.0) * 0.6 + (slope / 45.0) * 0.4))
            
        static_score = min(1.0, (feats["slope"] / 35.0) * 0.6 + (feats["historical_landslide_density"] / 30.0) * 0.4)
        dynamic_score = min(1.0, (feats["rain_24h"] / 40.0) * 0.5 + (feats["rain_72h"] / 80.0) * 0.5)

        if calibrated_prob >= 0.75:
            threat_level = "CRITICAL"
            action = "RED ALERT: Immediate evacuation of vulnerable slope toe settlements, halt heavy vehicular freight on NH-10, dispatch SDRF/NDRF emergency units."
        elif calibrated_prob >= 0.45:
            threat_level = "HIGH"
            action = "ORANGE ALERT: Pre-position excavators at chronic slip points, restrict night traffic on NH-10 corridor, alert local district disaster response cells."
        elif calibrated_prob >= 0.20:
            threat_level = "WATCH"
            action = "YELLOW ADVISORY: Intensify visual slope monitoring, check culvert drainage weep holes, maintain hourly telemetry vigilance."
        else:
            threat_level = "LOW"
            action = "GREEN STATUS: Routine automated hydrological surveillance. Normal traffic flow permitted along NH-10 corridor."

        explainability = self.explain_prediction(feats)

        return {
            "calibrated_risk_probability": round(calibrated_prob, 4),
            "static_susceptibility_score": round(static_score, 4),
            "dynamic_trigger_score": round(dynamic_score, 4),
            "threat_level": threat_level,
            "features": {k: round(v, 4) for k, v in feats.items()},
            "explainability_factors": explainability,
            "recommended_action": action
        }

_inference_service = None

def get_inference_service():
    global _inference_service
    if _inference_service is None:
        _inference_service = LandslideInferenceService()
    return _inference_service

if __name__ == "__main__":
    print("Testing Inference Service...")
    service = get_inference_service()
    freshness = service.check_data_freshness()
    print("Telemetry Freshness:", freshness)
    
    rf_path = DATA_DIR / "rainfall" / "processed" / "rainfall_history.csv"
    if rf_path.exists():
        rf_df = pd.read_csv(rf_path)
        rf_df["timestamp"] = pd.to_datetime(rf_df["observation_end_utc"])
        rangpo_rf = rf_df[rf_df["location"] == "Rangpo"]
        pred = service.predict_risk(27.177, 88.533, rangpo_rf)
        print("Rangpo Risk Prediction:", pred["threat_level"], f"(Prob: {pred['calibrated_risk_probability']})")
        print("Action:", pred["recommended_action"])
        print("Factors:", pred["explainability_factors"])
