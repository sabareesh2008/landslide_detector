# FEATURE ENGINEERING SPECIFICATION

## 1. Overview

The feature space of **Landslide Sentinel AI** combines high-resolution digital terrain derivatives with multi-scale cumulative precipitation metrics and physical geotechnical cross-terms ($D=27$ total features).

---

## 2. Topographic & Spatial Susceptibility Features

Topographic features are computed from the 30m Copernicus Digital Elevation Model reprojected to UTM Zone 45N (EPSG:32645):

### 1. Slope Gradient ($\theta$) via Horn's Algorithm
Calculated on a $3 \times 3$ elevation moving window:
$$p = \frac{(z_{13} + 2z_{23} + z_{33}) - (z_{11} + 2z_{21} + z_{31})}{8 \cdot \Delta x}$$
$$q = \frac{(z_{11} + 2z_{12} + z_{13}) - (z_{31} + 2z_{32} + z_{33})}{8 \cdot \Delta y}$$
$$\theta = \arctan\left(\sqrt{p^2 + q^2}\right) \times \frac{180}{\pi}$$

### 2. Trigonometric Aspect Decomposition
Because compass aspect azimuth $\alpha \in [0^\circ, 360^\circ]$ is circular (where $0^\circ \approx 360^\circ$ both represent North), it is decomposed into continuous orthogonal components:
$$\text{Aspect}_{\sin} = \sin\left(\frac{\pi \cdot \alpha}{180}\right), \quad \text{Aspect}_{\cos} = \cos\left(\frac{\pi \cdot \alpha}{180}\right)$$

### 3. Terrain Ruggedness Index (TRI)
$$\text{TRI} = 1.5 \cdot \theta + \frac{z}{100}$$
Quantifies local shear relief potential and gravitational acceleration potential.

### 4. Proximity & Spatial Failure Cluster Density
- $d_{\text{landslide}}$: Haversine distance to the nearest historical landslide scar in kilometers.
- $\rho_{\text{landslide}}$: Spatial density of historical failure scars within a $2\text{ km}$ radius ($\text{slides}/\text{km}^2$).

---

## 3. Hydrometeorological Dynamic Features (NASA IMERG)

Computed on 30-minute interval precipitation series $r(t)$ ($\text{mm}/30\text{min}$):

### 1. Cumulative Multi-Window Rolling Accumulations
- $R_{30\text{m}}(t) = r(t)$
- $R_{1\text{h}}(t) = \sum_{k=0}^{1} r(t - k \cdot 30\text{m})$
- $R_{3\text{h}}(t) = \sum_{k=0}^{5} r(t - k \cdot 30\text{m})$
- $R_{6\text{h}}(t) = \sum_{k=0}^{11} r(t - k \cdot 30\text{m})$
- $R_{12\text{h}}(t) = \sum_{k=0}^{23} r(t - k \cdot 30\text{m})$
- $R_{24\text{h}}(t) = \sum_{k=0}^{47} r(t - k \cdot 30\text{m})$
- $R_{48\text{h}}(t) = \sum_{k=0}^{95} r(t - k \cdot 30\text{m})$
- $R_{72\text{h}}(t) = \sum_{k=0}^{143} r(t - k \cdot 30\text{m})$
- $R_{7\text{d}}(t) = \sum_{k=0}^{335} r(t - k \cdot 30\text{m})$

### 2. Peak Rainfall Intensities
- $I_{\max, 1\text{h}} = \max_{\tau \in [t-1\text{h}, t]} r(\tau)$
- $I_{\max, 3\text{h}} = \max_{\tau \in [t-3\text{h}, t]} r(\tau)$
- $I_{\max, 6\text{h}} = \max_{\tau \in [t-6\text{h}, t]} r(\tau)$
- $I_{\max, 24\text{h}} = \max_{\tau \in [t-24\text{h}, t]} r(\tau)$

### 3. Rainfall Rate of Change and Dynamic Acceleration
$$\Delta R_{1\text{h}}(t) = R_{1\text{h}}(t) - R_{1\text{h}}(t - 1\text{h})$$
$$\Delta R_{3\text{h}}(t) = R_{3\text{h}}(t) - R_{3\text{h}}(t - 3\text{h})$$
$$A_{\text{rain}}(t) = \Delta R_{1\text{h}}(t) - \Delta R_{1\text{h}}(t - 1\text{h})$$

---

## 4. Physical Interaction Cross-Terms

To assist tree models in capturing non-linear geotechnical physics:
1. **$\theta \times R_{24\text{h}}$:** Slope gradient scaled by 24h infiltration (direct pore-water destabilization proxy on steep terrain).
2. **$\text{TRI} \times R_{72\text{h}}$:** Terrain ruggedness scaled by 72h antecedent soil moisture saturation.
3. **$\frac{\rho_{\text{landslide}}}{10} \times I_{\max, 3\text{h}}$:** Historical weakness zones excited by short-duration intense rainfall bursts.
