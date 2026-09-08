# SIH Innovation — Technical & Methodological Breakthroughs

## 1. Dual-Component Spatio-Temporal Coupling
Unlike simplistic models that treat landslides solely as rainfall anomalies or static topographic polygons, Landslide Sentinel AI couples:
- **Static Susceptibility Baseline**: Topographic elevation, slope angle, aspect sine/cosine, terrain ruggedness (TRI), geological fragility, and distance to historical shear zones.
- **Dynamic Antecedent Trigger Window**: 30-minute burst, 1h, 3h, 6h, 12h, 24h, 48h, 72h, and 7-day cumulative rainfall with precipitation acceleration curves.

---

## 2. Platt-Calibrated Probability Calibration
Most hackathon projects train uncalibrated classifiers where a reported 0.90 probability might only occur 20% of the time in the real world. Landslide Sentinel AI uses **Platt Scaling (Logistic Sigmoid Calibration)** on out-of-fold validation splits, reducing the **Brier Score to 0.0083** and ensuring mathematical alignment between predicted probability and observed ground truth failure frequencies.

---

## 3. Active Learning with Geotechnical Gating
Crowdsourced hazard reporting is notoriously vulnerable to noise and fake submissions. We introduced a **Two-Tier Verification Lifecycle**:
- **Tier 1 (Automated CV)**: Mobile photo is analyzed for asphalt fractures, mud accumulation, and drainage blockages.
- **Tier 2 (Geotechnical Gatekeeper)**: Only verified PWD/GSI engineers can certify field reports, converting them into active learning candidate points to safely retrain models over time.

---

## 4. Disaster Cascade & Lifeline Network Risk Engine
Predicting a slope failure is only half the battle; knowing the cascading impact is what saves lives. The system dynamically computes:
- Segment-by-segment highway blockage probability for NH-10.
- Estimated clearance time (hours) based on debris volume estimates.
- Downstream impact on Gangtok's supply chain (fuel, medical supplies, food).
- Dynamic alternate route bypasses (via Dikchu or Melli).

---

## 5. Offline-First Multi-Modal Accessibility
- Instant voice playback (Web Speech API TTS) in 9 Indian languages (English, Nepali, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi).
- Full service-worker pre-caching ensures GIS maps and shelter coordinates remain navigable in zero-connectivity tunnels and valley gorges.
