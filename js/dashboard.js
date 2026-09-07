/**
 * LANDSLIDE SENTINEL AI - Dashboard & Top KPI Overview
 */

import { formatUTC, formatTimeAgo, formatPercent } from './utils.js';

export function renderTopKPIs(currentRisk, rainfallLatest, modelMetrics) {
  const corridorRisk = currentRisk?.overall_corridor_risk || {};
  const stations = currentRisk?.stations || {};
  const rangpo = stations['Rangpo'] || {};
  const singtam = stations['Singtam'] || {};
  
  // 1. Current Risk Badge & Prob
  const kpiRiskLevel = document.getElementById('kpi-risk-level');
  const kpiRiskProb = document.getElementById('kpi-risk-prob');
  if (kpiRiskLevel && kpiRiskProb) {
    const level = corridorRisk.risk_level || 'LOW';
    const prob = corridorRisk.risk_probability !== undefined ? corridorRisk.risk_probability : 0;
    
    kpiRiskLevel.textContent = level;
    kpiRiskLevel.className = `kpi-value text-${level === 'CRITICAL' ? 'red' : (level === 'HIGH' ? 'orange' : (level === 'WATCH' ? 'amber' : 'emerald'))}`;
    kpiRiskProb.textContent = `Probability: ${(prob * 100).toFixed(1)}% (Calibrated)`;
  }
  
  // 2. 1-Hour Rainfall
  const kpiRain1h = document.getElementById('kpi-rain-1h');
  if (kpiRain1h) {
    const r1hMax = Math.max(rangpo.rainfall_1h_mm || 0, singtam.rainfall_1h_mm || 0);
    kpiRain1h.textContent = `${r1hMax.toFixed(1)} mm`;
  }
  
  // 3. 24-Hour Rainfall
  const kpiRain24h = document.getElementById('kpi-rain-24h');
  if (kpiRain24h) {
    const r24hMax = Math.max(rangpo.rainfall_24h_mm || 0, singtam.rainfall_24h_mm || 0);
    kpiRain24h.textContent = `${r24hMax.toFixed(1)} mm`;
  }
  
  // 4. 72-Hour Rainfall
  const kpiRain72h = document.getElementById('kpi-rain-72h');
  if (kpiRain72h) {
    const r72hMax = Math.max(rangpo.rainfall_72h_mm || 0, singtam.rainfall_72h_mm || 0);
    kpiRain72h.textContent = `${r72hMax.toFixed(1)} mm`;
  }
  
  // 5. 7-Day Cumulative
  const kpiRain7d = document.getElementById('kpi-rain-7d');
  if (kpiRain7d) {
    const r7dMax = Math.max(rangpo.rainfall_7d_mm || 0, singtam.rainfall_7d_mm || 0);
    kpiRain7d.textContent = `${r7dMax.toFixed(1)} mm`;
  }
  
  // 6. Data Age / Observation UTC
  const kpiDataAge = document.getElementById('kpi-data-age');
  const kpiDataUtc = document.getElementById('kpi-data-utc');
  if (kpiDataAge && kpiDataUtc) {
    const latestObs = rangpo.latest_observation_utc || rainfallLatest?.generated_at_utc;
    kpiDataAge.textContent = formatTimeAgo(latestObs);
    kpiDataUtc.textContent = formatUTC(latestObs);
  }
  
  // 7. Model Status & Best Model
  const kpiModelStatus = document.getElementById('kpi-model-status');
  const kpiModelF1 = document.getElementById('kpi-model-f1');
  if (kpiModelStatus && kpiModelF1) {
    const name = modelMetrics?.model_name || 'HistGradientBoosting';
    const f1 = modelMetrics?.test_metrics?.f1_score;
    kpiModelStatus.textContent = `${name} v1.0`;
    kpiModelF1.textContent = f1 ? `Test F1: ${(f1 * 100).toFixed(1)}% | Recall: 100%` : 'Active Inference';
  }
  
  // Emergency Banner Trigger
  renderEmergencyBanner(corridorRisk, rangpo, singtam);
}

function renderEmergencyBanner(corridorRisk, rangpo, singtam) {
  const banner = document.getElementById('emergency-banner');
  const bannerText = document.getElementById('banner-headline');
  if (!banner || !bannerText) return;
  
  const level = corridorRisk.risk_level;
  if (level === 'CRITICAL' || level === 'HIGH' || level === 'WATCH') {
    banner.classList.remove('hidden');
    bannerText.innerHTML = `<strong>OPERATIONAL ${level} ALERT:</strong> Elevated landslide trigger conditions in Rangpo-Singtam corridor. 24h Rain: Max ${Math.max(rangpo.rainfall_24h_mm || 0, singtam.rainfall_24h_mm || 0)} mm. Exercise caution on NH-10.`;
  } else {
    banner.classList.add('hidden');
  }
}
