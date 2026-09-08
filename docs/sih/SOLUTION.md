# SIH Solution — Landslide Sentinel AI

## 1. Solution Overview
Landslide Sentinel AI is an integrated, dual-model early warning platform designed specifically for the Rangpo–Singtam / NH-10 mountain lifeline. It bridges the gap between raw remote sensing, ground telemetry, and ground-level civil defense action.

---

## 2. Core Pillars of the Solution

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LANDSLIDE SENTINEL AI                           │
└────────────────────────────────────────────────────────────────────────┘
         │                           │                          │
         ▼                           ▼                          ▼
 ┌───────────────┐           ┌───────────────┐          ┌───────────────┐
 │ Predictive ML │           │  Spatial GIS  │          │  IoT & Vision │
 │ Pipeline      │           │  Risk Grid    │          │  Ground AI    │
 ├───────────────┤           ├───────────────┤          ├───────────────┤
 │ • 101 GSI     │           │ • 10x10 Grid  │          │ • LoRaWAN     │
 │   Events      │           │ • 4 NH-10     │          │   Sensors     │
 │ • 27 Physics  │           │   Segments    │          │ • CV Tension  │
 │   Features    │           │ • Multi-Layer │          │   Crack AI    │
 │ • Platt-      │           │   Leaflet GIS │          │ • Active      │
 │   Calibrated  │           │ • Hotspot     │          │   Learning    │
 │   HistGBM     │           │   Ranking     │          │   Staging     │
 └───────────────┘           └───────────────┘          └───────────────┘
         │                           │                          │
         └───────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │  Actionable Emergency Response  │
                    ├─────────────────────────────────┤
                    │ • Road Blockage Risk Modeling   │
                    │ • Disaster Cascade Analysis     │
                    │ • Designated Shelter Routing    │
                    │ • Pre-positioned Earthmovers    │
                    │ • 9 Indian Languages + Voice    │
                    │ • Offline-First Service Worker  │
                    └─────────────────────────────────┘
```

---

## 3. Key Operational Differentiators
1. **Calibrated Probabilistic Output**: Rather than binary labels, provides true calibrated probabilities (Brier score 0.0083) that incident commanders can trust.
2. **Deterministic Physical Attribution**: Explains *why* a slope is vulnerable (e.g. 72h antecedent rainfall exceeding colluvial saturation threshold on a 32° slope).
3. **Decisive Incident Action Plan**: Automatically pairs high hazard zones with the closest PWD JCB excavators, SDRF battalions, and designated high-ground shelters.
4. **Zero-Build Offline Resilience**: Fully functional PWA that works seamlessly inside field control vehicles even when cellular connectivity drops.
