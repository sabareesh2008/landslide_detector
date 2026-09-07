/**
 * LANDSLIDE SENTINEL AI - NASA IMERG Near-Real-Time Rainfall Component
 */

import { formatUTC, formatTimeAgo, formatNumber } from './utils.js';
import { renderRainfallTrendChart, renderAccumulationChart } from './charts.js';

export function renderRainfallView(rainfallLatest, rainfallHistory) {
  const locs = rainfallLatest?.locations || {};
  const rangpo = locs['Rangpo'] || {};
  const singtam = locs['Singtam'] || {};
  
  // Station Table / Metric Cards
  const tbody = document.getElementById('rainfall-summary-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td><strong>📡 Rangpo</strong><br/><span class="text-dim font-mono text-xs">27.177°N, 88.533°E</span></td>
        <td><span class="font-mono font-bold">${formatNumber(rangpo.latest_rainfall_mm, 1)} mm</span></td>
        <td><span class="font-mono">${formatNumber(rangpo.rainfall_1h_mm, 1)} mm</span></td>
        <td><span class="font-mono font-bold text-cyan">${formatNumber(rangpo.rainfall_24h_mm, 1)} mm</span></td>
        <td><span class="font-mono text-amber">${formatNumber(rangpo.rainfall_72h_mm, 1)} mm</span></td>
        <td><span class="font-mono">${formatNumber(rangpo.rainfall_7d_mm, 1)} mm</span></td>
        <td><span class="text-xs text-muted font-mono">${formatUTC(rangpo.latest_observation_utc)}</span></td>
        <td><span class="status-badge status-connected">CONNECTED</span></td>
      </tr>
      <tr>
        <td><strong>📡 Singtam</strong><br/><span class="text-dim font-mono text-xs">27.234°N, 88.501°E</span></td>
        <td><span class="font-mono font-bold">${formatNumber(singtam.latest_rainfall_mm, 1)} mm</span></td>
        <td><span class="font-mono">${formatNumber(singtam.rainfall_1h_mm, 1)} mm</span></td>
        <td><span class="font-mono font-bold text-cyan">${formatNumber(singtam.rainfall_24h_mm, 1)} mm</span></td>
        <td><span class="font-mono text-amber">${formatNumber(singtam.rainfall_72h_mm, 1)} mm</span></td>
        <td><span class="font-mono">${formatNumber(singtam.rainfall_7d_mm, 1)} mm</span></td>
        <td><span class="text-xs text-muted font-mono">${formatUTC(singtam.latest_observation_utc)}</span></td>
        <td><span class="status-badge status-connected">CONNECTED</span></td>
      </tr>
    `;
  }
  
  // Render Charts
  renderRainfallTrendChart('rainfallTrendChart', rainfallHistory || []);
  renderAccumulationChart('accumulationChart', rangpo, singtam);
}
