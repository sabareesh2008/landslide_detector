# IOT & GROUND SENSOR NETWORK ARCHITECTURE

## 1. Multi-Tier Telemetry Architecture

The **Landslide Sentinel AI IoT Layer** connects physical low-power slope instrumentation nodes with the central cloud early-warning risk engine:

```
                            Physical Geotechnical Instrumentation Nodes
                 ┌──────────────────────────────┬──────────────────────────────┐
                 ▼                              ▼                              ▼
      [Tipping Bucket Rain Gauge]     [FDR Soil Moisture Probe]      [Triple-Axis MEMS Inclinometer]
      (Dual-reed 0.2mm precision)      (Depth: 0.5m & 1.0m VWC)      (MPU6050 Pitch/Roll Angles)
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                │
                                                ▼
                                   ESP32-S3 Microcontroller
                                 • 12-bit Precision ADC / I2C
                                 • Edge Calibration & Filtering
                                 • Solar PMU with LiFePO4
                                                │
                                                ▼
                               LoRaWAN / 4G Cellular Gateway
                                (868 MHz / MQTT Protocol)
                                                │
                                                ▼
                              scripts/iot/sensor_processor.py
                               • Telemetry Validation & Health
                               • Threshold Anomaly Detection
                               • Time-Series Buffering
                                                │
                                                ▼
                                scripts/ml/inference.py
                    (Ground-Truth In-Situ Real-Time Risk Fusion)
```

---

## 2. Sensor Node Specifications & Target Locations

| Node ID | Physical Instrumentation | Corridor Sector | Target Hazard Mechanism |
| :--- | :--- | :--- | :--- |
| **IOT-NODE-01** | Dual-Reed Tipping Bucket Rain Gauge | Rangpo Teesta Gateway (Km 0.0) | Border inflow precipitation & storm front tracking |
| **IOT-NODE-02** | FDR Volumetric Water Content (VWC) Probe | Majhitar Upper Slope (Km 6.2) | Colluvial soil profile saturation & infiltration delay |
| **IOT-NODE-03** | MPU6050 IP68 MEMS Inclinometer | Bardang Scarp (Km 9.5) | Angular creep acceleration & shear dislocation |
| **IOT-NODE-04** | Optical Disdrometer + Rain Gauge | Singtam Bazar Junction (Km 12.8) | Micro-catchment cloudburst rain rates |
| **IOT-NODE-05** | Vibrating Wire Piezometer (6m depth) | Mining Sector Road Cut (Km 3.8) | Sub-surface hydraulic uplift & pore-pressure head |
| **IOT-NODE-06** | Dual-Frequency RTK GNSS Receiver | Bardang Retaining Crest | Millimetric cumulative slope surface displacement |

---

## 3. Operational Telemetry & Anomaly Thresholds

1. **Angular Tilt Rate ($> 0.5^\circ/\text{hr}$)**: Triggers an urgent Geotechnical Creep Warning, indicating active progressive shearing along the slip surface.
2. **Volumetric Water Content ($> 42\% \text{ VWC}$)**: Indicates near-complete soil liquefaction threshold in weathered mica-schist saprolite.
3. **Pore-Water Pressure ($> 35\text{ kPa}$)**: Indicates hydraulic uplift forces exceeding normal effective stress.
4. **Rainfall Intensity Burst ($> 15\text{ mm/hr}$)**: Triggers immediate flash flood and debris flow surface detachment alarms.
