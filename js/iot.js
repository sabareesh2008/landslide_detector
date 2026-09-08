/**
 * LANDSLIDE SENTINEL AI - IoT Telemetry & Sensor Network Dashboard
 */

import { formatUTC } from './utils.js';

export function renderIoTView(iotData, anomaliesData) {
  const container = document.getElementById('iot-view-container');
  if (!container) return;

  const nodes = iotData?.nodes || [];
  const anomalies = anomaliesData?.anomaly_records || [];
  const systemStatus = iotData?.system_status || 'READY_FOR_DEPLOYMENT';

  let html = `
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">TOTAL SENSOR NODES</div>
          <div class="kpi-value text-cyan">${nodes.length}</div>
          <div class="kpi-sub">Pilot Grid (Rangpo-Singtam)</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">HARDWARE STATUS</div>
          <div class="kpi-value text-emerald">${nodes.filter(n => n.hardware_health?.status === 'ONLINE').length} ONLINE</div>
          <div class="kpi-sub">LoRaWAN / 4G Uplink Active</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">GEOTECHNICAL ANOMALIES</div>
          <div class="kpi-value text-${anomalies.length > 0 ? 'orange' : 'emerald'}">${anomalies.length} DETECTED</div>
          <div class="kpi-sub">Real-Time Threshold Vigilance</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="kpi-card">
          <div class="kpi-title">DEPLOYMENT READINESS</div>
          <div class="kpi-value text-purple" style="font-size: 1.1rem; line-height: 2rem;">${systemStatus}</div>
          <div class="kpi-sub">Corridor Pilot Infrastructure</div>
        </div>
      </div>
    </div>

    <!-- Active Sensor Nodes Table -->
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="card-title">📡 Ground Telemetry Instrumentation Nodes</span>
        <span class="badge bg-dark border border-cyan text-cyan">Real-Time Hardware Telemetry</span>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0" style="font-size: 0.85rem;">
            <thead>
              <tr class="text-muted" style="border-bottom: 1px solid #1e293b;">
                <th>Node ID</th>
                <th>Station & Location</th>
                <th>Sensor Type</th>
                <th>Current Telemetry Reading</th>
                <th>Battery</th>
                <th>Signal (RSSI)</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              ${nodes.map(n => {
                const tele = n.telemetry || {};
                const health = n.hardware_health || {};
                let readingStr = '';
                if (n.sensor_type === 'TILT_INCLINOMETER') {
                  readingStr = `Pitch: ${tele.pitch_angle_deg}° | Roll: ${tele.roll_angle_deg}° (${tele.tilt_displacement_rate_deg_h}°/h)`;
                } else if (n.sensor_type === 'SOIL_MOISTURE') {
                  readingStr = `VWC: ${tele.soil_moisture_vwc_percent}% (Limit: ${tele.saturation_threshold_percent}%)`;
                } else if (n.sensor_type === 'PORE_PRESSURE') {
                  readingStr = `Pressure: ${tele.pore_water_pressure_kpa} kPa (Limit: ${tele.hydrostatic_limit_kpa} kPa)`;
                } else if (n.sensor_type === 'RAIN_GAUGE') {
                  readingStr = `Rate: ${tele.current_rainfall_mm_h} mm/h | 24h: ${tele.rainfall_24h_mm} mm`;
                } else if (n.sensor_type === 'GNSS_DISPLACEMENT') {
                  readingStr = `Creep: ${tele.cumulative_creep_mm} mm (${tele.velocity_mm_day} mm/day)`;
                }

                return `
                  <tr>
                    <td><strong class="text-cyan">${n.sensor_id}</strong></td>
                    <td>
                      <div><strong>${n.name}</strong></div>
                      <div class="text-xs text-muted">${n.location_name}</div>
                    </td>
                    <td><span class="badge bg-secondary">${n.sensor_type}</span></td>
                    <td><strong class="text-warning">${readingStr}</strong></td>
                    <td>
                      <span class="text-${health.battery_percent > 50 ? 'emerald' : 'orange'}">
                        🔋 ${health.battery_percent}% (${health.battery_voltage}V)
                      </span>
                    </td>
                    <td class="text-muted">${health.rssi_dbm} dBm</td>
                    <td>
                      <span class="badge bg-${health.status === 'ONLINE' ? 'success' : 'danger'}">${health.status}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
