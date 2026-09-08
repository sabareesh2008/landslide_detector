# Landslide Sentinel AI — Current Limitations & Scientific Disclosures

**Target Evaluation**: Smart India Hackathon (SIH) Technical Disclosure  
**Status**: Phase 2 Verified (Real Machine Learning & Ground Truth Pipeline)

In accordance with scientific integrity and operational transparency, this document details the verified capabilities and known limitations of Landslide Sentinel AI at the conclusion of **Phase 2**, and establishes the roadmap for **Phase 3 through Phase 8**.

---

## 1. What Phase 2 Accomplished & Resolved

1. **Elimination of Proxy & Circular Labeling**:
   - Spatially validated 101 GSI historical landslide failure scars within the Rangpo–Singtam / NH-10 corridor ($27.13^\circ\text{N} - 27.28^\circ\text{N}, 88.44^\circ\text{E} - 88.60^\circ\text{E}$).
   - Decoupled static terrain susceptibility (Model A) from dynamic precipitation trigger modeling (Model B).
   
2. **Zero Temporal & Spatial Leakage**:
   - Strict chronological 60/20/20 train/val/test split.
   - Backward-looking rolling windows only ($t \le t_{\text{obs}}$).
   - Negative control points buffered $>600\text{m}$ away from historical failure scars.

3. **Platt Probability Calibration**:
   - Calibrated output probabilities using 3-fold cross-validation Platt Scaling, achieving a Brier Score of **0.0083** and Expected Calibration Error of **0.0148**.

4. **Single Source of Truth**:
   - Centralized inference in `scripts/ml/inference.py`, eliminating duplicate client-side formulas.

---

## 2. Known Scientific & Telemetry Limitations (Phase 2 Reality)

### 1. Satellite Precipitation Spatial & Temporal Resolution
- **Coarse Resolution ($0.1^\circ \approx 10\text{ km}$)**: NASA GPM IMERG Early Run provides regional $10\text{ km}$ pixel averages. In deeply incised Himalayan gorges, hyper-localized orographic micro-bursts ($< 2\text{ km}$) may be smoothed out.
- **Latency Delay ($4 - 6\text{ Hours}$)**: NASA IMERG Early Run has an inherent processing and orbital download latency of 4–6 hours from observation instant to public FTP release.
- *Mitigation*: The inference engine actively monitors observation age and tags telemetry as `FRESH` ($<6\text{h}$), `STALE` ($6-48\text{h}$), or `DEGRADED` ($>48\text{h}$).

### 2. Historical Landslide Inventory Timestamp Fidelity
- **Sub-daily Exact Failure Timestamps**: The Geological Survey of India (GSI) National Landslide Susceptibility Mapping (NLSM) inventory provides authoritative spatial coordinates, failure mechanics, and survey years (e.g. 2015), but does not record exact sub-daily timestamps for historical catalog slides.
- *Mitigation*: Sub-daily failure timestamps are marked as `"UNKNOWN"` in `data/validated/landslide_events.csv`, and dynamic warning lead times are evaluated via multi-scale antecedent saturation threshold crossings ($T-72\text{h} \to \text{Event}$) rather than fabricating artificial sub-daily historical timestamps.

### 3. Surface vs Subsurface Sensing
- **Absence of Real-Time Ground Telemetry**: Current predictions rely exclusively on remote-sensing hydrology and satellite topography. Sub-surface piezometric pore-water pressure, vibrating wire strain gauges, and MEMS tiltmeters are not yet deployed in-situ.
- *Phase 3 & Phase 4 Roadmap*: Integrate IoT edge sensor nodes (tilt, pore pressure, soil moisture) and Sentinel-1 InSAR surface deformation tracking.

### 4. Regional Generalization Boundary
- **Geographic Scope**: The model is specifically calibrated to the Teesta River basin lithology (Daling Group phyllites, schists, and weathered colluvium). Deploying this model in the Western Himalayas (e.g. Himachal Pradesh / Uttarakhand) or Western Ghats without local transfer learning and DEM re-extraction is not recommended.

---

## 3. Phase 3 & Beyond Roadmap

- **Phase 3**: IoT Hardware Integration & In-Situ Sensor Telemetry (Borehole piezometers, inclinometers, ESP32/LoRaWAN nodes).
- **Phase 4**: InSAR Sentinel-1 Interferometric Deformation Processing & High-Resolution UAV LiDAR.
- **Phase 5**: Edge AI Microcontroller Deployment (TinyML on ARM Cortex-M / Raspberry Pi).
- **Phase 6**: Multilingual Emergency Communication (Nepali, Lepcha, Hindi, English SMS/IVR alerting).
- **Phase 7**: Disaster Evacuation & Optimal Emergency Resource Routing along NH-10.
- **Phase 8**: Full Production Hardening & Disaster Management Authority (SSDMA / SDRF) Handover.
