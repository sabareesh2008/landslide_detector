# RISK MAP & INTERACTIVE GIS VISUALIZATION

## 1. Multi-Layer Map Engine

The map interface in **Landslide Sentinel AI** is built on Leaflet 1.9.4 and provides seamless layer toggles, drill-down modals, and dual color/symbol indicators:

```
 MAP LAYERS
 ├─ Basemaps:
 │   ├─ OpenStreetMap Standard
 │   ├─ CartoDB Dark Matter (Disaster Command Aesthetic)
 │   └─ Esri World Imagery (Satellite Topography)
 ├─ Environmental Overlays:
 │   ├─ Copernicus Elevation Contour Shading
 │   ├─ Slope Gradient Vector Heatmap (>20° Critical Thresholds)
 │   ├─ Teesta & Rangpo Chu River Drainage Lines
 │   └─ NASA IMERG 30-min Rainfall Interpolation
 └─ Infrastructure & Response Overlays:
     ├─ NH-10 Highway Segment Vulnerability Lines
     ├─ Critical Lifeline Infrastructure (Bridges, Hospitals, Culverts)
     ├─ Settlements & Municipal Zones
     ├─ GSI Validated Historical Failure Scars (101 Points)
     ├─ Spatial AI Hazard Grid (10x10 Polygons)
     └─ Real-Time Hazard Hotspots
```

---

## 2. Universal Threat Tier Standards (Non-Color-Only)

To prevent miscommunication and ensure universal accessibility:

| Threat Level | Symbol | Color Code | Risk Probability Window | Operational Action |
| :--- | :--- | :--- | :--- | :--- |
| **LOW** | `[✓]` | `#10b981` (Emerald) | $P < 0.20$ | Routine automated telemetry surveillance |
| **WATCH** | `[◆]` | `#f59e0b` (Amber) | $0.20 \le P < 0.45$ | Visual slope monitoring & weep-hole checks |
| **HIGH** | `[▲]` | `#f97316` (Orange) | $0.45 \le P < 0.75$ | Night transit halt; excavator pre-positioning |
| **CRITICAL** | `[!]` | `#ef4444` (Red) | $P \ge 0.75$ | Immediate corridor closure & evacuation |

---

## 3. Location Drill-Down Specification

Clicking any grid polygon, station marker, road segment, or infrastructure node invokes the interactive location drill-down displaying:
1. **Calibrated Probability & Threat Tier**: Alphanumeric and percentage breakdown.
2. **Prediction Horizon**: 24-hour warning window.
3. **Model Decomposition**: Model A (Static Susceptibility) vs Model B (Dynamic Trigger).
4. **Physical Risk Drivers**: Soil pore saturation, gravitational shear stress, historical shear proximity.
5. **Impact Proxies**: Distance to nearest NH-10 highway segment, downstream hospital, and nearest emergency shelter.
