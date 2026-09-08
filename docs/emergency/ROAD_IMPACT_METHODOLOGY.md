# ROAD NETWORK IMPACT & BLOCKAGE METHODOLOGY

## 1. Highway Corridor Overview

National Highway 10 (NH-10) is the sole arterial highway lifeline connecting the state of Sikkim with Siliguri and mainland India. The $12.8\text{ km}$ stretch between Rangpo (border checkpost) and Singtam represents one of the most landslide-prone highway reaches in the Eastern Himalaya.

---

## 2. Dynamic Road Blockage Model Formulation

The probability of highway lane blockage $P(\text{Blockage})$ for a road segment $s$ is computed as a joint function of inherent road-cut vulnerability and dynamic hydrometeorological trigger loading:

$$P(\text{Blockage}_s) = \min\left(0.95, \max\left(0.02, 0.55 \cdot V_s + 0.45 \cdot \frac{R_{72\text{h}}}{100}\right)\right)$$

Where:
- $V_s \in [0, 1]$: Segment geomorphic vulnerability factor derived from cut slope angle, colluvial overburden thickness, and historical recurrence density.
- $R_{72\text{h}}$: 72-hour antecedent rainfall accumulation ($\text{mm}$) from NASA IMERG Early Run / local ground gauge.

### Segment Vulnerability Classification

| Segment ID | Highway Sector | Length | Criticality | Chronic Slip Zone | Vulnerability Factor ($V_s$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NH10-SEG-01` | Rangpo Checkpost to Mining | $3.2\text{ km}$ | EXTREME | No | $0.35$ |
| `NH10-SEG-02` | Mining to Majhitar Sector | $3.4\text{ km}$ | EXTREME | Yes | $0.72$ |
| `NH10-SEG-03` | Majhitar to Bardang Sector | $3.1\text{ km}$ | EXTREME | Yes (High Scarp) | $0.85$ |
| `NH10-SEG-04` | Bardang to Singtam Bazar Bridge | $3.1\text{ km}$ | EXTREME | No | $0.45$ |

---

## 3. Disaster Cascade Chain Model

```
 ┌────────────────────────────────────────────────────────┐
 │ 1. Primary Meteorological Trigger                     │
 │    Monsoonal precipitation burst (>100mm / 24h)        │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Hydrogeological Subsurface Infiltration            │
 │    Colluvial saturation -> Elevated pore-water head    │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Geotechnical Slope Destabilization                  │
 │    Reduction of effective stress on 25°-35° cut slopes │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Physical Infrastructure Impact                      │
 │    Debris spillage across NH-10 Majhitar-Bardang lanes │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. Socio-Economic Lifeline Disruption                 │
 │    Severing of food, medicine & fuel transit to Gangtok│
 └────────────────────────────────────────────────────────┘
```
