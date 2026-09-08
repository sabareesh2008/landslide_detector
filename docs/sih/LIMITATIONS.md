# SIH Scientific Limitations & Assumptions

## 1. Satellite Latency vs. Rapid Cloudbursts
- **NASA GPM / IMERG V07 Early Run**: Updates every 30 minutes with a nominal latency of 4 to 6 hours.
- **Mitigation**: Complemented with ground IoT tipping-bucket rain gauges providing sub-minute precipitation bursts to catch sudden localized cloudbursts.

---

## 2. Spatial Resolution of Open DEMs
- **SRTM 30m Resolution**: Sufficient for regional slope gradients and catchment rugosity, but cannot resolve micro-scale road cut fractures (<5 meters).
- **Mitigation**: Integrated Computer Vision field photo analysis and MEMS inclinometer nodes at chronic toe cuts (e.g. Bardang and 20th Mile).

---

## 3. Subsurface Geotechnical Unknowns
- **Hydrogeological Heterogeneity**: Complex subterranean fissure networks and localized pore pressure spikes vary across metamorphic thrust sheets.
- **Mitigation**: Model outputs calibrated confidence bounds and explicitly prompts geotechnical field inspection rather than declaring absolute certainty.

---

## 4. Operational Boundaries
- The platform functions strictly as an **AI Decision-Support System** for certified disaster authorities; automated emergency dispatches require human authorization from the Incident Commander.
