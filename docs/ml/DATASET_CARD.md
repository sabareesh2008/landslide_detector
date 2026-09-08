# DATASET CARD: Landslide Sentinel AI Datasets

## 1. Dataset Summary

- **Dataset Identifier:** `dataset_v001` & `static_susceptibility_v001`
- **Geographic Coverage:** Rangpo–Singtam / NH-10 Corridor, Sikkim, India
- **Bounding Box:** $27.13^\circ\text{N} - 27.28^\circ\text{N}$, $88.44^\circ\text{E} - 88.60^\circ\text{E}$
- **Total Spatio-Temporal Samples:** 1,760 dynamic observations + 202 static terrain balance points
- **Temporal Window:** August 20, 2026 to September 7, 2026 (Continuous 30-minute interval series)
- **Primary Data Modalities:** Remote Sensing Topography (Raster DEM), Multi-Satellite Microwave Radiometry (Precipitation), Geological Field Inventory (Spatial Points).

---

## 2. Provenance & Data Acquisition

| Component | Source Agency | Raw Data Format | Resolution / Frequency | Coordinate System |
| :--- | :--- | :--- | :--- | :--- |
| **Topography (DEM)** | Copernicus Earth Observation (ESA / EU) | GeoTIFF (Float32) | 30m Grid | EPSG:32645 (UTM Zone 45N) |
| **Precipitation** | NASA GPM IMERG Early Run (PPS FTP) | GeoTIFF (Float32) | 0.1° (~10km) / 30-min | EPSG:4326 (WGS84) |
| **Landslide Inventory** | Geological Survey of India (GSI) NLSM | Vector Shapefile / CSV | Point Locations | EPSG:4326 (WGS84) |

---

## 3. Dataset Composition

### Static Susceptibility Dataset (`static_susceptibility_v001.csv`)
- **Total Points:** 202 records
- **Class Balance:**
  - Positives ($Y=1$): 101 validated GSI historical landslide coordinates in the study corridor.
  - Negatives ($Y=0$): 101 stable control points sampled across valley floors and gentle terrain benches ($>600\text{m}$ buffer from known scars).
- **Features Extracted:** `elevation`, `slope`, `aspect`, `aspect_sin`, `aspect_cos`, `terrain_ruggedness`, `distance_to_historical_landslide_km`, `historical_landslide_density`.

### Dynamic Trigger Dataset (`dataset_v001.csv`)
- **Total Observations:** 1,760 records across Rangpo ($N=880$) and Singtam ($N=880$).
- **Features Extracted:** 27 multi-scale features including rolling accumulations ($R_{30\text{m}}, R_{1\text{h}}, R_{3\text{h}}, R_{6\text{h}}, R_{12\text{h}}, R_{24\text{h}}, R_{48\text{h}}, R_{72\text{h}}, R_{7\text{d}}$), peak bursts, delta trends, acceleration, topographic metrics, and physical interaction cross-terms.
- **Label Formulation:** Calibrated empirical intensity-duration (I-D) criteria calibrated for the Teesta basin.

---

## 4. Quality Control & Validation Pipeline

The dataset underwent automated quality assurance via `scripts/ml/validate_dataset.py`:
1. **Spatial Bounds Check:** Filtered coordinates strictly inside the Rangpo-Singtam corridor box.
2. **Taxonomy Normalization:** Normalized material types (Debris, Rock, Colluvium) and movement mechanisms (Slide, Fall, Topple).
3. **Temporal Precision Assessment:** Documented that historical GSI records contain annual survey years; exact sub-daily timestamps are handled via dynamic IMERG rolling accumulation simulations rather than synthetic timestamp fabrication.
4. **Zero Missingness:** No missing coordinates or invalid numeric values in the published feature matrix.

---

## 5. Maintenance & Versioning

- Dataset versions are immutable snapshots saved under `data/model/datasets/dataset_v{version}.csv`.
- Each dataset release is accompanied by a companion `dataset_v{version}_metadata.json` documenting timestamps, sample counts, feature lists, and distribution summaries.
