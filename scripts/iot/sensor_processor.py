"""
scripts/iot/sensor_processor.py
=============================================================================
Landslide Sentinel AI - Phase 4: IoT Telemetry & Sensor Health Processor
Validates sensor network connectivity, monitors battery health, and executes
early-stage geotechnical anomaly detection across ground telemetry nodes.
=============================================================================
"""

import json
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
SENSORS_JSON = DATA_DIR / "iot" / "sensors.json"
ANOMALIES_OUT = DATA_DIR / "iot" / "sensor_anomalies.json"

# Operational Anomaly Thresholds
THRESHOLDS = {
    "tilt_rate_deg_h": 0.5,        # Tilt rate > 0.5 deg/hr indicates active creep
    "soil_moisture_vwc": 42.0,     # > 42% indicates near-liquefaction pore saturation
    "pore_pressure_kpa": 35.0,     # > 35 kPa indicates critical hydraulic uplift
    "rain_intensity_mm_h": 15.0,   # > 15 mm/hr indicates intense cloudburst
    "battery_low_percent": 20.0    # < 20% triggers hardware maintenance advisory
}

def process_sensor_telemetry():
    print("=" * 60)
    print("LANDSLIDE SENTINEL AI - IOT TELEMETRY & ANOMALY PROCESSOR")
    print("=" * 60)
    
    if not SENSORS_JSON.exists():
        raise FileNotFoundError(f"Sensors database missing at: {SENSORS_JSON}")
        
    with open(SENSORS_JSON, "r", encoding="utf-8") as f:
        sensor_data = json.load(f)
        
    nodes = sensor_data.get("nodes", [])
    anomalies = []
    
    online_count = 0
    warning_count = 0
    
    for node in nodes:
        sid = node.get("sensor_id")
        sname = node.get("name")
        stype = node.get("sensor_type")
        tele = node.get("telemetry", {})
        health = node.get("hardware_health", {})
        
        # 1. Hardware health check
        if health.get("status") == "ONLINE":
            online_count += 1
            
        bat = health.get("battery_percent", 100)
        if bat < THRESHOLDS["battery_low_percent"]:
            warning_count += 1
            anomalies.append({
                "sensor_id": sid,
                "name": sname,
                "anomaly_type": "HARDWARE_LOW_BATTERY",
                "severity": "WARNING",
                "message": f"Battery level critical ({bat}%)",
                "timestamp_utc": datetime.now(timezone.utc).isoformat()
            })
            
        # 2. Sensor reading geotechnical anomaly detection
        if stype == "TILT_INCLINOMETER":
            tilt_rate = tele.get("tilt_displacement_rate_deg_h", 0.0)
            if tilt_rate >= THRESHOLDS["tilt_rate_deg_h"]:
                anomalies.append({
                    "sensor_id": sid,
                    "name": sname,
                    "anomaly_type": "HIGH_TILT_RATE_ACCELERATION",
                    "severity": "CRITICAL_GEOTECHNICAL",
                    "message": f"Tilt rate ({tilt_rate} deg/h) exceeds safe threshold (0.5 deg/h)",
                    "timestamp_utc": datetime.now(timezone.utc).isoformat()
                })
                
        elif stype == "SOIL_MOISTURE":
            vwc = tele.get("soil_moisture_vwc_percent", 0.0)
            if vwc >= THRESHOLDS["soil_moisture_vwc"]:
                anomalies.append({
                    "sensor_id": sid,
                    "name": sname,
                    "anomaly_type": "PORE_WATER_SATURATION_SURGE",
                    "severity": "HIGH_HYDROLOGICAL",
                    "message": f"Volumetric water content ({vwc}%) indicates saturated failure regime",
                    "timestamp_utc": datetime.now(timezone.utc).isoformat()
                })
                
        elif stype == "PORE_PRESSURE":
            kpa = tele.get("pore_water_pressure_kpa", 0.0)
            if kpa >= THRESHOLDS["pore_pressure_kpa"]:
                anomalies.append({
                    "sensor_id": sid,
                    "name": sname,
                    "anomaly_type": "PIEZOMETRIC_HEAD_EXCEEDANCE",
                    "severity": "HIGH_HYDROLOGICAL",
                    "message": f"Pore pressure ({kpa} kPa) approaching shear failure limit",
                    "timestamp_utc": datetime.now(timezone.utc).isoformat()
                })
                
        elif stype == "RAIN_GAUGE":
            rain_rate = tele.get("current_rainfall_mm_h", 0.0)
            if rain_rate >= THRESHOLDS["rain_intensity_mm_h"]:
                anomalies.append({
                    "sensor_id": sid,
                    "name": sname,
                    "anomaly_type": "TORRENTIAL_INTENSITY_BURST",
                    "severity": "CRITICAL_METEOROLOGICAL",
                    "message": f"High instant rain rate ({rain_rate} mm/h) exceeds cloudburst trigger",
                    "timestamp_utc": datetime.now(timezone.utc).isoformat()
                })
                
    output_report = {
        "analysis_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "total_nodes_monitored": len(nodes),
        "online_nodes": online_count,
        "anomalies_detected": len(anomalies),
        "anomaly_records": anomalies
    }
    
    with open(ANOMALIES_OUT, "w", encoding="utf-8") as f:
        json.dump(output_report, f, indent=2)
        
    print(f"Processed {len(nodes)} sensor nodes. Online: {online_count}/{len(nodes)}.")
    print(f"Detected {len(anomalies)} anomalies -> {ANOMALIES_OUT}")
    print("=" * 60)
    return output_report

if __name__ == "__main__":
    process_sensor_telemetry()
