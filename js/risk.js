/**
 * LANDSLIDE SENTINEL AI - Risk Prediction & Operational Warnings
 */

import { formatNumber, formatPercent } from './utils.js';

let operationalThresholds = {
  watch: 0.25,
  high: 0.50,
  critical: 0.75
};

export function setOperationalThresholds(watch, high, critical) {
  operationalThresholds.watch = parseFloat(watch);
  operationalThresholds.high = parseFloat(high);
  operationalThresholds.critical = parseFloat(critical);
}

export function renderRiskView(currentRisk) {
  const stations = currentRisk?.stations || {};
  const rangpo = stations['Rangpo'] || {};
  const singtam = stations['Singtam'] || {};
  
  // Rangpo Card
  const rangpoCard = document.getElementById('risk-card-rangpo');
  if (rangpoCard && rangpo.risk_probability !== undefined) {
    const prob = rangpo.risk_probability;
    const level = rangpo.risk_level || 'LOW';
    rangpoCard.innerHTML = `
      <div class="card-header">
        <span class="card-title">📡 Rangpo Monitoring Station</span>
        <span class="risk-badge risk-${level.toLowerCase()}">${level}</span>
      </div>
      <div class="card-body">
        <div style="font-size: 2.2rem; font-weight: 800;" class="text-${level === 'CRITICAL' ? 'red' : (level === 'HIGH' ? 'orange' : (level === 'WATCH' ? 'amber' : 'emerald'))}">
          ${(prob * 100).toFixed(1)}%
        </div>
        <div class="text-xs text-muted" style="margin-bottom: 12px;">Calibrated Landslide Risk Probability (Platt Scaling)</div>
        
        <div style="font-size: 0.8rem; margin-bottom: 8px;"><strong>Top Contributing Factors:</strong></div>
        <ul style="font-size: 0.8rem; padding-left: 18px; color: #cbd5e1; margin-bottom: 14px; line-height: 1.5;">
          ${(rangpo.contributing_factors || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
        
        <div class="p-3" style="background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 8px; font-size: 0.78rem;">
          <strong class="text-cyan">Recommended Action:</strong><br/>
          <span>${rangpo.recommended_action || 'Routine Telemetry Vigilance.'}</span>
        </div>
      </div>
    `;
  }
  
  // Singtam Card
  const singtamCard = document.getElementById('risk-card-singtam');
  if (singtamCard && singtam.risk_probability !== undefined) {
    const prob = singtam.risk_probability;
    const level = singtam.risk_level || 'LOW';
    singtamCard.innerHTML = `
      <div class="card-header">
        <span class="card-title">📡 Singtam Monitoring Station</span>
        <span class="risk-badge risk-${level.toLowerCase()}">${level}</span>
      </div>
      <div class="card-body">
        <div style="font-size: 2.2rem; font-weight: 800;" class="text-${level === 'CRITICAL' ? 'red' : (level === 'HIGH' ? 'orange' : (level === 'WATCH' ? 'amber' : 'emerald'))}">
          ${(prob * 100).toFixed(1)}%
        </div>
        <div class="text-xs text-muted" style="margin-bottom: 12px;">Calibrated Landslide Risk Probability (Platt Scaling)</div>
        
        <div style="font-size: 0.8rem; margin-bottom: 8px;"><strong>Top Contributing Factors:</strong></div>
        <ul style="font-size: 0.8rem; padding-left: 18px; color: #cbd5e1; margin-bottom: 14px; line-height: 1.5;">
          ${(singtam.contributing_factors || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
        
        <div class="p-3" style="background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 8px; font-size: 0.78rem;">
          <strong class="text-cyan">Recommended Action:</strong><br/>
          <span>${singtam.recommended_action || 'Routine Telemetry Vigilance.'}</span>
        </div>
      </div>
    `;
  }
}
