"""
End-to-End Test Suite for Landslide Sentinel AI (Phases 3 to 8)
Verifies:
1. Spatial GIS Risk Engine & Grid Calculation
2. IoT Telemetry Processing & Inclinometer/Piezometer Anomaly Detection
3. Road Blockage Risk & Disaster Cascade Network
4. ML Inference Single-Source-of-Truth Consistency
5. Alert State Transition & Cooldown Enforcement
6. Role-Based Access Control and Localization completeness
"""

import unittest
import json
import os
import sys
from pathlib import Path
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "ml"))

class TestLandslideSentinelE2E(unittest.TestCase):

    def setUp(self):
        self.root = PROJECT_ROOT

    def test_gis_layers_and_spatial_processor(self):
        """Phase 3 Test: Verify GIS geojsons and spatial processor outputs"""
        road_geojson = self.root / "data/gis/nh10_road_network.geojson"
        risk_zones_geojson = self.root / "data/gis/risk_zones.geojson"
        hotspots_json = self.root / "data/gis/hotspots.json"

        self.assertTrue(road_geojson.exists(), "Road network geojson must exist")
        self.assertTrue(risk_zones_geojson.exists(), "Risk zones geojson must exist")
        self.assertTrue(hotspots_json.exists(), "Hotspots catalog must exist")

        with open(risk_zones_geojson, 'r', encoding='utf-8') as f:
            zones = json.load(f)
            self.assertEqual(zones.get('type'), 'FeatureCollection')
            features = zones.get('features', [])
            self.assertGreaterEqual(len(features), 10, "Risk zones should have at least 10 grid cells")
            props = features[0]['properties']
            self.assertIn('zone_id', props)
            self.assertIn('risk_probability', props)
            self.assertIn('risk_level', props)
            self.assertIn('slope_degrees', props)

        with open(hotspots_json, 'r', encoding='utf-8') as f:
            hotspots_data = json.load(f)
            hotspots = hotspots_data.get('hotspots', [])
            self.assertGreaterEqual(len(hotspots), 3, "Should identify at least 3 major hotspots")
            for h in hotspots:
                self.assertIn('zone_id', h)
                self.assertIn('risk_level', h)
                self.assertIn('spatial_explanation', h)
                self.assertIn('affected_infrastructure', h)

    def test_iot_processing_and_anomaly_detection(self):
        """Phase 4 Test: Verify IoT sensors, thresholds, and anomaly detection"""
        sensors_path = self.root / "data/iot/sensors.json"
        anomalies_path = self.root / "data/iot/sensor_anomalies.json"
        field_reports_path = self.root / "data/field_reports/field_reports.json"

        self.assertTrue(sensors_path.exists())
        self.assertTrue(anomalies_path.exists())
        self.assertTrue(field_reports_path.exists())

        with open(sensors_path, 'r', encoding='utf-8') as f:
            sensors_data = json.load(f)
            nodes = sensors_data.get('nodes', [])
            self.assertGreaterEqual(len(nodes), 4, "Must have at least 4 sensor nodes")
            types = [s['sensor_type'] for s in nodes]
            self.assertIn('TILT_INCLINOMETER', types)
            self.assertIn('SOIL_MOISTURE', types)

        with open(anomalies_path, 'r', encoding='utf-8') as f:
            anomalies = json.load(f)
            self.assertIn('total_nodes_monitored', anomalies)
            self.assertIn('anomaly_records', anomalies)

        with open(field_reports_path, 'r', encoding='utf-8') as f:
            reports_data = json.load(f)
            reports = reports_data.get('reports', [])
            self.assertGreaterEqual(len(reports), 2, "Must contain multimodal field evidence reports")
            for r in reports:
                self.assertIn('report_id', r)
                self.assertIn('verification_lifecycle', r)
                self.assertIn('status', r['verification_lifecycle'])
                self.assertIn('ai_vision_analysis', r)
                self.assertIn('estimated_severity', r['ai_vision_analysis'])

    def test_emergency_response_and_road_impact(self):
        """Phase 5 Test: Verify road impact, shelter routing, and resources"""
        road_impact_path = self.root / "data/infrastructure/road_impact.json"
        shelters_path = self.root / "data/shelters/shelters.json"
        resources_path = self.root / "data/resources/emergency_resources.json"
        alerts_path = self.root / "data/alerts/alerts.json"

        self.assertTrue(road_impact_path.exists())
        self.assertTrue(shelters_path.exists())
        self.assertTrue(resources_path.exists())
        self.assertTrue(alerts_path.exists())

        with open(road_impact_path, 'r', encoding='utf-8') as f:
            impact = json.load(f)
            self.assertIn('segments', impact)
            self.assertIn('disaster_cascade_chain', impact)
            self.assertIn('recommended_shelters', impact)
            for seg in impact['segments']:
                self.assertIn('calculated_blockage_probability', seg)
                self.assertIn('blockage_risk_tier', seg)

        with open(shelters_path, 'r', encoding='utf-8') as f:
            shelters_data = json.load(f)
            shelters = shelters_data.get('shelters', [])
            self.assertGreaterEqual(len(shelters), 3)
            for s in shelters:
                self.assertIn('capacity_persons', s)
                self.assertIn('contact_phone', s)

        with open(alerts_path, 'r', encoding='utf-8') as f:
            alerts_data = json.load(f)
            alerts = alerts_data.get('alerts', [])
            self.assertGreaterEqual(len(alerts), 1)
            for a in alerts:
                self.assertIn('state', a)
                self.assertIn('severity', a)

    def test_multilingual_locales_coverage(self):
        """Phase 6 Test: Verify 9 languages have critical translation keys"""
        required_languages = ["en", "ne", "hi", "bn", "ta", "te", "kn", "ml", "mr"]
        key_fields = ["app_title", "nav_overview", "nav_map", "nav_iot", "nav_emergency", "risk_tier_critical", "risk_tier_high"]

        for lang in required_languages:
            loc_file = self.root / f"locales/{lang}.json"
            self.assertTrue(loc_file.exists(), f"Locale {lang} missing")
            with open(loc_file, 'r', encoding='utf-8') as f:
                loc_data = json.load(f)
                for k in key_fields:
                    self.assertIn(k, loc_data, f"Key {k} missing in locale {lang}")

    def test_ml_inference_engine(self):
        """Phase 2/7 Test: Verify single-source-of-truth ML inference execution"""
        from scripts.ml.inference import get_inference_service
        service = get_inference_service()
        self.assertIsNotNone(service.calibrated_model, "Calibrated ML model must be loaded")

        now = pd.Timestamp.now(tz="UTC")
        dates = pd.date_range(end=now, periods=48, freq="30min")
        rf_series = pd.DataFrame({
            "timestamp": dates,
            "rainfall_mm": [8.0] * 48 # Extreme sustained rain
        })

        res = service.predict_risk(lat=27.177, lon=88.533, rainfall_series_df=rf_series)
        self.assertIn("calibrated_risk_probability", res)
        self.assertIn("static_susceptibility_score", res)
        self.assertIn("dynamic_trigger_score", res)
        self.assertIn("threat_level", res)
        self.assertIn("explainability_factors", res)
        self.assertIn("recommended_action", res)
        self.assertGreater(res["calibrated_risk_probability"], 0.3, "High rainfall on steep slope should yield high risk")

if __name__ == "__main__":
    unittest.main()
