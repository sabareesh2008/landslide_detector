# GIS & SPATIAL RISK INTELLIGENCE ARCHITECTURE

## 1. System Overview

The **Landslide Sentinel AI GIS Layer** transforms raw remote sensing topography, hydrometeorological time series, and geospatial infrastructure vectors into actionable spatial early-warning intelligence for the **Rangpo–Singtam / NH-10 Corridor** in Sikkim.

```
                      Copernicus 30m Global DEM (UTM Zone 45N)
                                         │
                                         ▼
                                Topographic Processing
                 (Elevation, Horn Slope, Aspect Sin/Cos, TRI, Curvature)
                                         │
 ┌───────────────────────────────────────┼───────────────────────────────────────┐
 ▼                                       ▼                                       ▼
GSI Landslide Inventory            NASA IMERG Rainfall                 NH-10 Highway Vector &
(N=101 Validated Points)           (30-minute Series)                  Critical Infrastructure
 │                                       │                                       │
 └───────────────────────────────────────┼───────────────────────────────────────┘
                                         │
                                         ▼
                            scripts/gis/spatial_processor.py
                                         │
                                         ▼
                            scripts/ml/inference.py
                     (Two-Model Calibrated Inference Engine)
                                         │
                                         ▼
                  ┌──────────────────────┴──────────────────────┐
                  ▼                                             ▼
        data/gis/risk_zones.geojson                   data/gis/hotspots.json
   (10x10 Fine-Grained Risk Matrix)            (Clustered Critical Threat Hotspots)
                  │                                             │
                  └──────────────────────┬──────────────────────┘
                                         │
                                         ▼
                       Interactive Leaflet GIS Command Engine
                     • Multi-Layer Map (Overlays & Base Layers)
                     • Non-Color-Only Threat Badges (LOW, WATCH, HIGH, CRITICAL)
                     • Click Location Drill-Down & Physics Breakdown
                     • Temporal Scrubber (Past -> Current -> Replay)
```

---

## 2. Geospatial Datasets & Coordinate Reference Systems (CRS)

| Layer | Source Authority | Format | Resolution | CRS |
| :--- | :--- | :--- | :--- | :--- |
| **Digital Elevation Model (DEM)** | Copernicus GLO-30 | GeoTIFF | 30 Meters | EPSG:32645 (UTM Zone 45N) |
| **Historical Landslides** | Geological Survey of India (GSI) | GeoJSON / CSV | Point Scars ($N=101$) | EPSG:4326 (WGS84) |
| **Highway Alignment** | OpenStreetMap / NHIDCL | GeoJSON LineString | 4 Segments ($12.8\text{ km}$) | EPSG:4326 (WGS84) |
| **Critical Infrastructure** | Sikkim PWD / SSDMA / Survey of India | GeoJSON Point | 12 Lifeline Assets | EPSG:4326 (WGS84) |
| **Settlements** | Census of India / Govt of Sikkim | GeoJSON Point | 5 Municipal/Village Hubs | EPSG:4326 (WGS84) |
| **Drainage Network** | HydroSHEDS / Survey of India | GeoJSON LineString | Teesta & Rangpo Chu | EPSG:4326 (WGS84) |
| **Spatial Risk Zones** | Landslide Sentinel AI Pipeline | GeoJSON Polygon | $10 \times 10$ Grid ($\approx 1.2\text{ km}$) | EPSG:4326 (WGS84) |

---

## 3. Spatial Resolution & GIS Limitations

1. **Pixel vs Road-Cut Resolution**: Copernicus 30m DEM models regional slope gradients and watershed morphology accurately. However, sub-meter road cut vertical faces ($< 5\text{m}$) cannot be resolved without high-resolution UAV LiDAR or ground laser scanning.
2. **Dynamic Channel Scouring**: Teesta river toe erosion varies seasonally; static vector alignments are supplemented by proximity buffers in the feature matrix.
3. **Cartographic Transparency**: All hazard zones present explicit alphanumeric badges (`CRITICAL [!]`, `HIGH [▲]`, `WATCH [◆]`, `LOW [✓]`) alongside standard color gradations to ensure compliance with universal accessibility standards.
