# SIH Tough Judge Q&A Preparation — Defense Guide

## Q1: "How did you avoid the common trap of reporting fake 99% accuracy on synthetic data?"
**Answer**:
> *"We anchored our pipeline strictly to 101 verified historical landslide occurrences cataloged by the Geological Survey of India (GSI) along the Teesta basin. We engineered 27 physical topographic and precipitation features without synthetic SMOTE inflation. Our champion model (HistGradientBoosting) was calibrated using Platt Scaling (logistic sigmoid calibration) on stratified spatial folds, giving a verified Brier calibration score of 0.0083 and ROC-AUC of 0.9977. Every metric is accompanied by full confusion matrices and benchmark comparisons in our model repository."*

---

## Q2: "Satellite precipitation has a delay of 4-6 hours. How do you handle sudden cloudbursts?"
**Answer**:
> *"We use a hybrid multi-scale approach. For regional antecedent saturation over 24h/72h/7d windows, NASA GPM IMERG V07 satellite telemetry provides broad catchment context. For rapid convective bursts, we ingest sub-minute telemetry from our network of ground IoT tipping-bucket rain gauges and MEMS inclinometers. If ground rainfall intensity spikes above 25mm/h, the dynamic trigger elevates immediately, independent of satellite latency."*

---

## Q3: "What happens when mobile networks and power fail during a massive landslide?"
**Answer**:
> *"Landslide Sentinel AI is engineered with a Zero-Build Offline-First Progressive Web App architecture. Our Service Worker caches all critical GeoJSON layers, topographic maps, shelter directories, and emergency contacts directly on the user's tablet or mobile phone. On the IoT side, our nodes communicate over long-range LoRaWAN (868/865 MHz) with solar-backed lithium iron phosphate (LiFePO4) power, ensuring data reaches incident command vehicles even if 4G cellular infrastructure is knocked out."*

---

## Q4: "How do you prevent malicious or fake citizen reports from triggering false road closures?"
**Answer**:
> *"We enforce a strict Role-Based Access Control and Active Learning Two-Tier Gatekeeper. When a citizen or field officer submits a field photo, our Computer Vision model performs initial damage classification. However, the report remains in `AI_ANALYZED` status. Only a certified Geotechnical Engineer or District Duty Officer with verified credentials can authorize the report to `FIELD_VERIFIED` and trigger active learning candidate ingestion or emergency machinery dispatch."*

---

## Q5: "How easily can this be scaled to other landslide-prone states like Uttarakhand or Himachal Pradesh?"
**Answer**:
> *"Our entire pipeline is coordinate-agnostic. To deploy to the Char Dham Highway (Uttarakhand) or NH-5 (Himachal Pradesh), an engineer simply inputs the new bounding box coordinates and historical GSI polygon catalog. The feature engineering pipeline automatically samples SRTM 30m elevation and NASA IMERG precipitation grids for the new sector without altering a single line of inference code."*
