/**
 * LANDSLIDE SENTINEL AI - Emergency Decision Support, Road Impact & Evacuation Routing
 */

import { formatUTC } from './utils.js';

export function renderEmergencyView(impactData, sheltersData, resourcesData, alertsData) {
  const container = document.getElementById('emergency-view-container');
  if (!container) return;

  const segments = impactData?.segments || [];
  const cascade = impactData?.disaster_cascade_chain || {};
  const shelters = sheltersData?.shelters || [];
  const resources = resourcesData?.resources || [];
  const alerts = alertsData?.alerts || [];

  let html = `
    <!-- Top KPI Grid -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">CORRIDOR STATUS</div>
          <div class="kpi-value text-${impactData?.overall_corridor_threat_level === 'CRITICAL' ? 'red' : (impactData?.overall_corridor_threat_level === 'HIGH' ? 'orange' : 'emerald')}">
            ${impactData?.overall_corridor_threat_level || 'LOW'}
          </div>
          <div class="kpi-sub">NH-10 Lifeline (12.8 km Total)</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">IMPAIRED SECTORS</div>
          <div class="kpi-value text-orange">${impactData?.potentially_impaired_length_km || 0.0} km</div>
          <div class="kpi-sub">High Blockage Probability</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">DESIGNATED SHELTERS</div>
          <div class="kpi-value text-cyan">${shelters.length} READY</div>
          <div class="kpi-sub">Total Capacity: 3,000 Persons</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">RESPONSE RESOURCES</div>
          <div class="kpi-value text-emerald">${resources.length} UNITS</div>
          <div class="kpi-sub">SDRF, Heavy JCBs, ALS 108</div>
        </div>
      </div>
    </div>

    <!-- Road Segments Vulnerability & Blockage Table -->
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="card-title">🛣️ NH-10 Highway Segment Impact & Blockage Assessment</span>
        <span class="badge bg-dark border border-secondary text-muted">Dynamic Hydrometeorological Load</span>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0" style="font-size: 0.85rem;">
            <thead>
              <tr class="text-muted" style="border-bottom: 1px solid #1e293b;">
                <th>Segment ID</th>
                <th>Highway Reach</th>
                <th>Length</th>
                <th>Criticality</th>
                <th>Blockage Prob</th>
                <th>Risk Tier</th>
                <th>Traffic Status</th>
                <th>Mitigation Directive</th>
              </tr>
            </thead>
            <tbody>
              ${segments.map(s => `
                <tr>
                  <td><strong class="text-cyan">${s.segment_id}</strong></td>
                  <td>
                    <strong>${s.name}</strong>
                    ${s.chronic_slide_zone ? '<span class="badge bg-danger ms-1 text-xs">Chronic Slip Scarp</span>' : ''}
                  </td>
                  <td>${s.length_km} km</td>
                  <td><span class="badge bg-secondary">${s.criticality}</span></td>
                  <td><strong class="text-warning">${(s.calculated_blockage_probability * 100).toFixed(1)}%</strong></td>
                  <td>
                    <span class="badge bg-${s.blockage_risk_tier === 'HIGH' ? 'danger' : (s.blockage_risk_tier === 'MODERATE' ? 'warning' : 'success')}">
                      ${s.blockage_risk_tier}
                    </span>
                  </td>
                  <td><span class="text-${s.operational_status === 'OPEN' ? 'emerald' : 'orange'}">${s.operational_status}</span></td>
                  <td class="text-xs text-muted">${s.recommended_action}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Disaster Cascade Chain Visualizer -->
    <div class="card mb-4">
      <div class="card-header">
        <span class="card-title">⛓️ Disaster Cascade & Multi-Hazard Consequence Chain</span>
      </div>
      <div class="card-body">
        <div class="row g-2 text-center" style="font-size: 0.8rem;">
          <div class="col-md-2">
            <div class="p-2 border border-info rounded bg-dark h-100">
              <strong class="text-cyan">1. Rain Burst</strong>
              <div class="text-xs text-muted mt-1">${cascade.primary_trigger || 'Monsoonal Influx'}</div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-2 border border-warning rounded bg-dark h-100">
              <strong class="text-warning">2. Saturation</strong>
              <div class="text-xs text-muted mt-1">${cascade.subsurface_mechanism || 'Pore Pressure Surge'}</div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-2 border border-danger rounded bg-dark h-100">
              <strong class="text-danger">3. Slope Slip</strong>
              <div class="text-xs text-muted mt-1">${cascade.geotechnical_consequence || 'Shear Failure'}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-2 border border-danger rounded bg-dark h-100">
              <strong class="text-danger">4. NH-10 Blockage</strong>
              <div class="text-xs text-muted mt-1">${cascade.infrastructure_consequence || 'Carriage Disruption'}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-2 border border-purple rounded bg-dark h-100">
              <strong class="text-purple">5. Corridor Isolation</strong>
              <div class="text-xs text-muted mt-1">${cascade.socio_economic_impact || 'Essential Freight Halt'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Designated Evacuation Shelters -->
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">
            <span class="card-title">🏕️ Designated Emergency Shelters</span>
          </div>
          <div class="card-body p-3">
            ${shelters.map(sh => `
              <div class="p-3 mb-3" style="background: rgba(255,255,255,0.02); border: 1px solid #1e293b; border-radius: 8px;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-cyan">${sh.name}</strong>
                  <span class="badge bg-success">${sh.status}</span>
                </div>
                <div class="text-xs text-muted mb-2">📍 ${sh.location} (Elev: ${sh.elevation_m}m) • Capacity: <strong class="text-light">${sh.capacity_persons}</strong> persons</div>
                <div class="text-xs mb-2"><strong>Amenities:</strong> ${(sh.amenities || []).join(' • ')}</div>
                <div class="d-flex justify-content-between align-items-center text-xs pt-2" style="border-top: 1px solid #1e293b;">
                  <span>Nodal: ${sh.nodal_officer}</span>
                  <a href="tel:${sh.contact_phone}" class="text-cyan text-decoration-none">📞 ${sh.contact_phone}</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Pre-positioned Emergency Resources -->
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">
            <span class="card-title">🚜 Pre-Positioned Response Machinery & Rescue Teams</span>
          </div>
          <div class="card-body p-3">
            ${resources.map(res => `
              <div class="p-3 mb-3" style="background: rgba(255,255,255,0.02); border: 1px solid #1e293b; border-radius: 8px;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-warning">${res.name}</strong>
                  <span class="badge bg-info">${res.type}</span>
                </div>
                <div class="text-xs text-muted mb-2">📍 Station: ${res.station_location} • Status: <strong class="text-emerald">${res.status}</strong></div>
                <div class="d-flex justify-content-between align-items-center text-xs pt-2" style="border-top: 1px solid #1e293b;">
                  <span>Contact: ${res.contact}</span>
                  <button class="btn btn-xs btn-outline-cyan py-0 px-2" onclick="alert('Dispatch Advisory generated for ${res.name}. Human authorization required.')">
                    Recommend Dispatch
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
