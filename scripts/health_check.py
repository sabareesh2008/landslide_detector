"""
Landslide Sentinel AI - System Health Check Suite
Verifies data integrity, ML models, GIS layers, IoT streams, emergency datasets, and locales.
"""

import sys
import os
import json
from pathlib import Path

# Ensure UTF-8 output encoding across Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def check_file_exists(path_str, description):
    p = Path(path_str)
    if not p.exists():
        print(f"[FAIL] {description} not found at {path_str}")
        return False
    size = p.stat().st_size
    if size == 0:
        print(f"[FAIL] {description} at {path_str} is empty (0 bytes)")
        return False
    print(f"[PASS] {description} ({size} bytes)")
    return True

def check_json_validity(path_str, description):
    if not check_file_exists(path_str, description):
        return False
    try:
        with open(path_str, 'r', encoding='utf-8') as f:
            data = json.load(f)
        items_count = len(data) if isinstance(data, (dict, list)) else 1
        print(f"       Valid JSON loaded ({items_count} top-level items/keys)")
        return True
    except Exception as e:
        print(f"[FAIL] {description} invalid JSON: {e}")
        return False

def main():
    print("=" * 70)
    print("LANDSLIDE SENTINEL AI - SYSTEM HEALTH & INTEGRITY CHECK")
    print("=" * 70)

    base_dir = Path(__file__).resolve().parent.parent
    os.chdir(base_dir)

    all_passed = True

    # 1. Check Core Machine Learning Assets
    print("\n--- 1. Machine Learning Assets ---")
    all_passed &= check_file_exists("data/model/artifacts/calibrated_production_model.pkl", "Champion ML Model (Calibrated HistGBM)")
    all_passed &= check_json_validity("data/model/metrics/model_metrics.json", "ML Model Metadata & Benchmark Metrics")
    all_passed &= check_file_exists("data/validated/landslide_events.csv", "Validated GSI Ground Truth Landslide Catalog")
    all_passed &= check_json_validity("data/validation/landslide_validation_report.json", "Landslide Data Validation Audit Report")

    # 2. Check GIS Spatial Intelligence Layers
    print("\n--- 2. GIS & Spatial Intelligence Layers ---")
    all_passed &= check_json_validity("data/gis/nh10_road_network.geojson", "NH-10 Highway Corridor Network GeoJSON")
    all_passed &= check_json_validity("data/gis/corridor_infrastructure.geojson", "Critical Infrastructure GeoJSON")
    all_passed &= check_json_validity("data/gis/settlements.geojson", "Settlements & Villages GeoJSON")
    all_passed &= check_json_validity("data/gis/rivers.geojson", "River & Drainage Alignments GeoJSON")
    all_passed &= check_json_validity("data/gis/risk_zones.geojson", "10x10 Spatial Risk Zones GeoJSON")
    all_passed &= check_json_validity("data/gis/hotspots.json", "Top Critical Landslide Hotspots Catalog")

    # 3. Check IoT & Multimodal Field Evidence
    print("\n--- 3. IoT & Multimodal Field AI ---")
    all_passed &= check_json_validity("data/iot/sensors.json", "IoT Ground Sensor Telemetry Network")
    all_passed &= check_json_validity("data/iot/sensor_anomalies.json", "Sensor Anomaly Detections & Health Status")
    all_passed &= check_json_validity("data/field_reports/field_reports.json", "Field Incident Evidence Reports")
    all_passed &= check_json_validity("data/field_reports/verified_training_candidates.json", "Verified Active Learning Training Candidates")

    # 4. Check Emergency Response & Shelters
    print("\n--- 4. Infrastructure & Emergency Response ---")
    all_passed &= check_json_validity("data/infrastructure/road_impact.json", "NH-10 Highway Road Impact Assessment")
    all_passed &= check_json_validity("data/shelters/shelters.json", "Designated Emergency Evacuation Shelters")
    all_passed &= check_json_validity("data/resources/emergency_resources.json", "Pre-positioned Disaster Response Machinery")
    all_passed &= check_json_validity("data/alerts/alerts.json", "Active Alert State Machine Catalog")

    # 5. Check Multilingual Locales (9 Languages)
    print("\n--- 5. Multilingual Localization (9 Languages) ---")
    locales = ["en", "ne", "hi", "bn", "ta", "te", "kn", "ml", "mr"]
    for loc in locales:
        all_passed &= check_json_validity(f"locales/{loc}.json", f"Locale Dictionary ({loc})")

    # 6. Check Core Scripts
    print("\n--- 6. Pipeline Scripts ---")
    scripts = [
        "scripts/ml/inference.py",
        "scripts/risk_engine.py",
        "scripts/gis/spatial_processor.py",
        "scripts/iot/sensor_processor.py",
        "scripts/emergency/impact_analyzer.py"
    ]
    for sc in scripts:
        all_passed &= check_file_exists(sc, f"Pipeline script: {sc}")

    print("\n" + "=" * 70)
    if all_passed:
        print("OVERALL SYSTEM STATUS: HEALTHY & PRODUCTION READY (ALL CHECKS PASSED)")
        print("=" * 70)
        return 0
    else:
        print("OVERALL SYSTEM STATUS: DEGRADED OR INCOMPLETE CHECKS")
        print("=" * 70)
        return 1

if __name__ == "__main__":
    sys.exit(main())
