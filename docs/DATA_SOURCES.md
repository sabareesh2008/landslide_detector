# Landslide Sentinel AI — Data Sources & Scientific Provenance

This document establishes the official data sources, licensing, spatial/temporal resolutions, ingestion cadences, quality metrics, and scientific boundaries for Landslide Sentinel AI.

---

## 1. Primary External Data Sources

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     NASA GPM IMERG Early Run    │      │       Copernicus GLO-30 DSM     │      │   Geological Survey of India    │
│    Near-Real-Time Precipitation │      │    Digital Elevation Model      │      │   National Landslide Inventory  │
├─────────────────────────────────┤      ├─────────────────────────────────┤      ├─────────────────────────────────┤
│ • Provider: NASA GSFC / PPS     │      │ • Provider: European Space Org  │      │ • Provider: GSI NLSM Program    │
│ • Cadence: 30-min (~4h latency) │      │ • Spatial Res: 30m (GLO-30)     │      │ • Extent: 103 Corridor Points   │
│ • Spatial Res: 0.1° (~10 km)    │      │ • CRS: Reprojected UTM 45N      │      │ • Ground Truth: Field GPS       │
│ • Access: HTTPS PPS Earthdata   │      │ • Derived: Slope, Aspect, TR    │      │ • Material: Debris, Rock, Soil  │
└─────────────────────────────────┘      └─────────────────────────────────┘      └─────────────────────────────────┘
```

---

## 2. Detailed Source Profiles

### 2.1 NASA Global Precipitation Measurement (GPM) IMERG Early Run
* **Full Product Name**: Integrated Multi-satellitE Retrievals for GPM Version 07 (Early Run).
* **Publisher / Distributor**: NASA Goddard Space Flight Center (GSFC) / Precipitation Processing System (PPS).
* **Data Type**: Observed multi-satellite microwave & calibrated infrared precipitation.
* **Spatial Resolution**: $0.1^\circ \times 0.1^\circ$ (approx. $10\text{ km} \times 10\text{ km}$ at latitude $27^\circ\text{N}$).
* **Temporal Resolution**: 30-minute observation granules.
* **Ingestion Method**: Automated Python crawler authenticating via NASA Earthdata / PPS HTTPS protocol.
* **Licensing**: NASA Open Data Policy (Free and open access for non-commercial research & disaster management).
* **Quality Assurance**:
  * GeoTIFF digital numbers ($DN$) are scaled by $0.1$ to obtain physical rainfall in millimeters ($mm$).
  * Negative DN or missing granules are flagged with error codes rather than interpolated with synthetic values.

### 2.2 Copernicus GLO-30 Digital Surface Model (DEM)
* **Publisher / Distributor**: European Space Agency (ESA) Copernicus Programme.
* **Data Type**: Global Digital Surface Model derived from TanDEM-X and WorldDEM data.
* **Spatial Resolution**: $30\text{ meters}$ per pixel.
* **Vertical Accuracy**: $< 4\text{ meters}$ linear error.
* **Original CRS**: WGS84 Geographic 2D (`EPSG:4326`).
* **Reprojected CRS**: UTM Zone 45N (`EPSG:32645`) using bilinear resampling to enable metric slope calculations.
* **Derived Topographic Gradients**:
  * Slope in degrees computed via Horn's second-order finite difference gradient method:
    $$\theta = \arctan\left(\sqrt{\left(\frac{\partial Z}{\partial x}\right)^2 + \left(\frac{\partial Z}{\partial y}\right)^2}\right) \times \frac{180^\circ}{\pi}$$
  * Aspect in degrees downslope azimuth:
    $$\alpha = \text{mod}\left(180^\circ - \arctan2\left(\frac{\partial Z}{\partial y}, -\frac{\partial Z}{\partial x}\right), 360^\circ\right)$$

### 2.3 Geological Survey of India (GSI) Landslide Inventory
* **Publisher / Distributor**: Geological Survey of India, Ministry of Mines, Government of India.
* **Program**: National Landslide Susceptibility Mapping (NLSM) Project.
* **Spatial Extent**: $27.13^\circ\text{N} - 27.28^\circ\text{N}$, $88.44^\circ\text{E} - 88.60^\circ\text{E}$ ($N=103$ events along Namchi-Namthang, Melli-Phong, and NH-10 corridors).
* **Field Verification**: Field GPS survey teams recorded slide coordinates, mobilized materials (debris/rock/soil), and movement kinematics (slide/fall/topple).

---

## 3. Data Ingestion Architecture & Modes

The platform enforces four explicit data modes:

```
┌─────────────────┐  NASA PPS / Live Satellite Crawler
│    LIVE MODE    │  ► Real 30-min observations
└─────────────────┘  ► Fails to DATA_UNAVAILABLE on connection loss

┌─────────────────┐  Historical GSI Records & Past IMERG Runs
│ HISTORICAL MODE │  ► Used for training, validation, and historical replay
└─────────────────┘  ► 100% real measured historical data

┌─────────────────┐  Stress-Testing & What-If Hazard Analysis
│ SIMULATION MODE │  ► Isolated scenario engine with synthetic precipitation
└─────────────────┘  ► Visibly labeled: "SIMULATION — NOT LIVE DATA"

┌─────────────────┐  Interactive Hackathon & Stakeholder Walkthrough
│    DEMO MODE    │  ► Static curated snapshot of historical storm events
└─────────────────┘  ► Zero dependency on live internet connection
```
