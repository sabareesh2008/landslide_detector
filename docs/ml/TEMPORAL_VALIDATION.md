# TEMPORAL VALIDATION & LEAKAGE PREVENTION

## 1. The Risk of Leakage in Environmental Early Warning Systems

In meteorological and landslide early warning machine learning, data leakage can easily inflate model evaluation metrics while causing severe failure in live operational deployment:
1. **Lookahead Leakage:** Calculating rolling rainfall windows that include future timestamps ($t > t_{\text{obs}}$).
2. **Random Split Leakage:** Using standard random train/test splits on time-series data, allowing the model to memorize antecedent rainfall from adjacent hours.
3. **Spatial Overlap Leakage:** Evaluating test performance on spatial coordinates that are physically adjacent to training points without spatial holdout controls.

---

## 2. Landslide Sentinel AI Leakage Prevention Protocol

To guarantee rigorous scientific reproducibility, our pipeline implements four strict architectural controls:

```
 Chronological Timeline (1,760 30-min Observations)
├───────────────────────────────┼───────────────────────┼───────────────────────┤
│         TRAIN SET (60%)       │  VALIDATION SET (20%) │     TEST SET (20%)    │
│       Aug 20 - Aug 31         │    Aug 31 - Sep 03    │    Sep 03 - Sep 07    │
│      N = 1,056 samples        │   N = 352 samples     │   N = 352 samples     │
└───────────────────────────────┴───────────────────────┴───────────────────────┘
                                                           ▲
                                                           │
                                             Completely Out-of-Time
                                             Zero Future Lookahead
```

### Protocol 1: Chronological Out-of-Time Splitting
- The full dataset is strictly sorted by timestamp.
- **Train Split (60%):** August 20 to August 31, 2026.
- **Validation Split (20%):** August 31 to September 03, 2026 (used strictly for hyperparameter comparison and Platt calibration tuning).
- **Test Split (20%):** September 03 to September 07, 2026 (held completely blind until final evaluation).

### Protocol 2: Backward-Looking Rolling Windows
All temporal features are calculated strictly on past observations:
$$R_{24\text{h}}(t) = \sum_{k=0}^{47} r(t - k \cdot \Delta t), \quad \Delta t = 30\text{ minutes}$$
No forward-looking operators or symmetric rolling windows are permitted.

### Protocol 3: Spatial Independence in Control Points
For Model A (Static Susceptibility), negative non-failure controls are extracted with a strict minimum buffer of $600\text{ meters}$ away from all recorded landslide failure scars to prevent false-negative contamination near shear zones.

### Protocol 4: Stratified Calibration Cross-Validation
Calibration using `CalibratedClassifierCV` is executed with 3-fold cross-validation on the train/validation splits, preventing calibration parameters from overfitting to the out-of-time test holdout.
