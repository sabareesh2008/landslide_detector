# FIELD AI & MULTIMODAL COMPUTER VISION SYSTEM

## 1. System Mission & Operational Boundaries

The **Field AI System** enables field engineers, highway patrol officers, and citizens to capture ground-level photographic evidence along the NH-10 corridor.

```
       Field Smartphone Camera
                 │
                 ▼
       Image Upload & EXIF GPS
                 │
                 ▼
      Multimodal Vision Pipeline
      • Surface Tension Crack Detection
      • Colluvial Mud & Rockfall Debris
      • Retaining Wall Shear Bulging
      • Turbid Groundwater Seepage
                 │
                 ▼
       AI Feature Classification
                 │
                 ▼
      Human Verification Lifecycle
  [SUBMITTED] -> [AI_ANALYZED] -> [FIELD_VERIFIED] -> [RESOLVED]
                 │
                 ▼
     Active Learning Feedback Loop
   (data/field_reports/verified_training_candidates.json)
```

---

## 2. Identified Visual Symptoms

The Computer Vision engine classifies images into 8 distinct hazard symptom classes:
1. `ROAD_SURFACE_TENSION_CRACKS`: Longitudinal or en-echelon tensile fractures on asphalt pavement.
2. `COLLUVIAL_DEBRIS_ACCUMULATION`: Loose gravel and rock fragments on highway shoulders.
3. `RETAINING_WALL_BULGING`: Structural masonry displacement indicating lateral earth pressure overload.
4. `TURBID_GROUNDWATER_SEEPAGE`: High pore-water pressure manifesting as muddy spring discharges at slope toes.
5. `FRESH_SOIL_SCARP_FAILURE`: Freshly exposed un-vegetated headscarps.
6. `VEGETATION_DISTURBANCE`: Tilted or jackstrawed tree trunks indicating active soil creep.
7. `DRAINAGE_CULVERT_BLOCKAGE`: Silt and woody debris obstructing road culvert inlets.
8. `RIVER_TOE_SCOURING`: High-velocity Teesta river current cutting into toe colluvium.

---

## 3. Human-in-the-Loop Verification Protocol

1. **AI As Decision Support**: The Vision model strictly reports **Observed Surface Features** and estimated severity; it never issues autonomous unconditional alerts.
2. **Authority Sign-off**: A designated PWD / SSDMA Geotechnical Engineer or Field Officer reviews the AI report, verifies on-site conditions, and signs off with engineer notes.
3. **Continuous Model Learning**: Validated reports are automatically exported to `verified_training_candidates.json` for quarterly retraining.
