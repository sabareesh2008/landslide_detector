# EMERGENCY RESPONSE & DECISION SUPPORT ARCHITECTURE

## 1. Operational Scope

The **Landslide Sentinel AI Emergency Response Engine** translates predictive slope-failure probabilities into operational disaster-response actions, evacuation shelter coordination, road blockage mitigation, and resource dispatch advisories for Sikkim state authorities.

```
                          Calibrated ML Threat Probability
                                         │
                                         ▼
                     scripts/emergency/impact_analyzer.py
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
 [Road Blockage Risk]         [Infrastructure Vulnerability]   [Disaster Cascade Model]
 (NH-10 Km 0 to Km 12.8)      (Bridges, Culverts, Hospitals)   (Pore Pressure -> Isolation)
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         │
                                         ▼
                                 Alert Engine
                     • State Machine: WATCH -> WARNING -> CRITICAL
                     • Deduplication & 60-min Cooldown
                     • Multi-Agency Dispatch (SSDMA, SDRF, NHIDCL)
                                         │
                                         ▼
                      Emergency Decision Support Dashboard
                     • Safe vs Blocked Evacuation Routing
                     • Designated Shelter Allocation (SMIT, Rangpo, Singtam)
                     • Pre-Positioned Heavy Machinery (Excavators, Loaders)
                     • Human Authorization Confirmation
```

---

## 2. Alert State Machine & Lifecycle

The Alert Engine operates on a deterministic 5-state finite automaton:
1. **`NORMAL`**: All monitoring station probabilities $P < 0.20$. Automated background telemetry surveillance active.
2. **`WATCH`**: $0.20 \le P < 0.45$. Triggers advisory to SEOC, increases telemetry sampling, alerts highway patrol to inspect weep holes and culvert mouths.
3. **`WARNING`**: $0.45 \le P < 0.75$. Triggers Orange Alert, restricts nighttime heavy freight on NH-10, pre-positions crawler excavators at Bardang depot.
4. **`CRITICAL`**: $P \ge 0.75$. Triggers Red Emergency Alert, closes NH-10 vulnerable sectors, activates designated indoor shelters, dispatches SDRF rescue units to toe settlements.
5. **`RESOLVED`**: Trigger subsides below $P < 0.15$ for $> 6\text{ hours}$ post-event and PWD engineer completes field scarp clearance sign-off.

---

## 3. Human Authorization & Anti-Spam Protocol

- **Zero Autonomous Dispatch**: All heavy equipment mobilizations and road closure orders appear as **Recommended Decision Support Advisories** requiring one-click human authorization by the State Incident Commander or District Magistrate.
- **Alert Deduplication**: Continuous high-risk telemetry streams are hashed and subject to a 60-minute cooldown window, preventing warning fatigue.
