# Landslide Sentinel AI — Final IoT & Field AI Architecture

## 1. Ground IoT Telemetry Network (LoRaWAN)

The physical ground telemetry mesh along the NH-10 corridor consists of 6 multi-sensor stations:

| Node ID | Location | Coordinates | Sensor Modality | Telemetry Parameters | Thresholds |
|---|---|---|---|---|---|
| **IOT-NODE-01** | Rangpo Teesta Checkpost | 27.1770°N, 88.5330°E | Dual-reed Rain Gauge | Rain rate (mm/h), 24h & 72h accumulation | $>25\text{ mm/h}$ (Warning) |
| **IOT-NODE-02** | Majhitar Upper Slopes | 27.2080°N, 88.5130°E | FDR Capacitance Soil Probe | Volumetric Water Content (VWC %) | $>45\%$ (Near Saturation) |
| **IOT-NODE-03** | Bardang Chronic Cut | 27.2210°N, 88.5040°E | MEMS Dual-Axis Inclinometer | Angular tilt pitch/roll (°), Rate (mm/h) | $>1.5\text{ mm/h}$ (Active Slip) |
| **IOT-NODE-04** | Singtam Bazar Outskirts | 27.2400°N, 88.4980°E | Optical Tipping Bucket | Real-time precipitation burst | $>30\text{ mm/h}$ (Burst) |
| **IOT-NODE-05** | Mining Slope Escarpment | 27.1950°N, 88.5210°E | Vibrating Wire Piezometer | Pore-water pressure (kPa) | $>35\text{ kPa}$ (High Pressure) |
| **IOT-NODE-06** | 20th Mile Shear Zone | 27.2310°N, 88.5010°E | Differential GNSS Geodesy | 3D surface displacement vector (mm) | $>10\text{ mm/24h}$ (Critical Creep) |

---

## 2. IoT Data Processing & Anomaly Detection Pipeline
- **Script**: `scripts/iot/sensor_processor.py`
- **Anomaly Detection**:
  - Implements Interquartile Range (IQR) gating to filter sensor dropouts, electrical noise, or transmission errors.
  - Multi-sensor cross-correlation: An inclinometer spike without concurrent soil moisture saturation or heavy rainfall triggers a `SENSOR_GLITCH_SUSPECTED` flag rather than a false disaster alarm.
- **Output Artifact**: `data/iot/sensor_anomalies.json`

---

## 3. Computer Vision Field Evidence Pipeline
- **Input**: High-resolution mobile field photos uploaded by highway patrol officers or certified citizens.
- **Vision Model**: Detects asphalt tension cracks, colluvial wash, and rock fragments.
- **Two-Tier Verification**: Automatic AI analysis tags estimated severity, but only human geotechnical engineer review (`FIELD_VERIFIED`) stages the event into `data/field_reports/verified_training_candidates.json` for active learning retraining.
