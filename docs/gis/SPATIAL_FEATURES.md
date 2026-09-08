# SPATIAL FEATURES & DERIVATION SPECIFICATION

## 1. Topographic Derivatives (Copernicus 30m DEM)

### 1. Metric Slope Gradient ($\theta$)
Calculated in projected metric space (UTM Zone 45N, EPSG:32645) using Horn's 8-neighbor weighted finite-difference algorithm:
$$\theta = \arctan\left(\sqrt{\left(\frac{\partial z}{\partial x}\right)^2 + \left(\frac{\partial z}{\partial y}\right)^2}\right) \times \frac{180}{\pi}$$
- Range in Rangpo-Singtam Corridor: $5.2^\circ$ (River valley floor) to $54.8^\circ$ (Upper mountain scarps).

### 2. Trigonometric Aspect Azimuth ($\alpha$)
Aspect is decomposed into orthogonal components to preserve directional continuity:
$$\text{Aspect}_{\sin} = \sin\left(\frac{\pi \cdot \alpha}{180}\right), \quad \text{Aspect}_{\cos} = \cos\left(\frac{\pi \cdot \alpha}{180}\right)$$
- South-facing and South-East facing slopes receive maximum monsoonal moisture flux from the Bay of Bengal depression tracks.

### 3. Terrain Ruggedness Index (TRI)
Quantifies gravitational potential energy and local slope relief:
$$\text{TRI} = 1.5 \cdot \theta + \frac{z}{100}$$

---

## 2. Spatial Infrastructure & Proximity Features

### 1. Distance to NH-10 Highway Network ($d_{\text{NH10}}$)
Computed via Haversine distance from each grid centroid to the nearest line segment vertex of NH-10:
$$d_{\text{NH10}} = \min_{v \in \text{NH10}} \text{Haversine}(\text{lat}_{\text{grid}}, \text{lon}_{\text{grid}}, \text{lat}_v, \text{lon}_v)$$

### 2. Distance to Historical Landslide Scars ($d_{\text{landslide}}$)
Minimum distance in kilometers to the closest validated GSI failure scar in the corridor catalog ($N=101$).

### 3. Historical Spatial Failure Density ($\rho_{\text{landslide}}$)
Number of documented failure scars per square kilometer within a $2.0\text{ km}$ circular catchment:
$$\rho_{\text{landslide}} = \frac{N_{\text{slides}}(r \le 2\text{ km})}{\pi \cdot (2.0)^2} \quad [\text{events}/\text{km}^2]$$
