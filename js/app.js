/**
 * LANDSLIDE SENTINEL AI - Main Application Controller
 * Master orchestrator for Phases 1-8 (AI, GIS, IoT, Field AI, Emergency, i18n, Security, SIH Demo)
 * Zero Build / Pure Vanilla JavaScript ES6+
 */

import { api } from './api.js';
import {
  initMap,
  renderSpatialRiskZones,
  renderRoadNetwork,
  renderInfrastructure,
  renderSettlements,
  renderRivers,
  renderSensorsOnMap,
  renderFieldReportsOnMap,
  renderLandslideMarkers,
  renderStationMarkers
} from './map.js';

import { renderTopKPIs } from './dashboard.js';
import { renderRainfallView } from './rainfall.js';
import { renderRiskView } from './risk.js';
import { renderTerrainView } from './terrain.js';
import { renderHistoricalView } from './historical.js';
import { renderReplayView } from './replay.js';
import { renderModelView } from './model.js';
import { renderExplainabilityView } from './explainability.js';
import { renderCitizenView } from './citizen.js';

import { renderIoTView } from './iot.js';
import { renderFieldAIView } from './field_ai.js';
import { renderEmergencyView } from './emergency.js';
import { initI18n, setLanguage, speakEmergencyWarning, t } from './i18n.js';
import { initAuth, switchRole, getCurrentUser } from './auth.js';
import { renderDemoTourModal, simulateScenario } from './demo.js';
import { playNotificationChime, playDisasterSiren } from './utils.js';

// Global Application State
const state = {
  currentTab: 'command',
  currentRole: 'FIELD_OFFICER',
  currentLang: 'en',
  dataMode: 'LIVE',
  audioAlertsEnabled: true,
  refreshCountdown: 60,
  refreshInterval: null,
  isOffline: !navigator.onLine,
  
  // Datasets Cache
  currentRisk: null,
  rainfallLatest: null,
  modelMetrics: null,
  historicalReplay: null,
  landslides: [],
  riskZonesGeoJSON: null,
  hotspots: null,
  roadsGeoJSON: null,
  infraGeoJSON: null,
  settlementsGeoJSON: null,
  riversGeoJSON: null,
  sensors: null,
  fieldReports: null,
  roadImpact: null,
  shelters: null,
  resources: null,
  alerts: null
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  console.log('[App] Initializing Landslide Sentinel AI (Phases 1-8 Master Engine)...');
  
  // 1. Initialize i18n & RBAC
  await initI18n(state.currentLang);
  initAuth();
  
  // 2. Setup Controls & Map
  setupNavigation();
  setupControls();
  setupOfflineDetection();
  registerServiceWorker();
  
  initMap('map');
  
  // 3. Load Datasets & Render
  await loadAllData();
  startAutoRefreshTimer();
}

async function loadAllData() {
  const syncBtn = document.getElementById('sync-data-btn');
  if (syncBtn) {
    syncBtn.innerHTML = '🔄 Syncing...';
    syncBtn.disabled = true;
  }
  
  try {
    const [
      riskData,
      rainData,
      metricsData,
      replayData,
      landslidesData,
      zonesData,
      hotspotsData,
      roadsData,
      infraData,
      settlementsData,
      riversData,
      sensorsData,
      reportsData,
      impactData,
      sheltersData,
      resourcesData,
      alertsData
    ] = await Promise.all([
      api.getCurrentRisk(),
      api.getRainfallLatest(),
      api.getModelMetrics(),
      api.getHistoricalReplay(),
      api.getLandslides(),
      api.getRiskZonesGeoJSON(),
      api.getHotspots(),
      api.getRoadNetworkGeoJSON(),
      api.getInfrastructureGeoJSON(),
      api.getSettlementsGeoJSON(),
      api.getRiversGeoJSON(),
      api.getSensors(),
      api.getFieldReports(),
      api.getRoadImpact(),
      api.getShelters(),
      api.getEmergencyResources(),
      api.getAlerts()
    ]);
    
    state.currentRisk = riskData;
    state.rainfallLatest = rainData;
    state.modelMetrics = metricsData;
    state.historicalReplay = replayData;
    state.landslides = landslidesData;
    state.riskZonesGeoJSON = zonesData;
    state.hotspots = hotspotsData;
    state.roadsGeoJSON = roadsData;
    state.infraGeoJSON = infraData;
    state.settlementsGeoJSON = settlementsData;
    state.riversGeoJSON = riversData;
    state.sensors = sensorsData;
    state.fieldReports = reportsData;
    state.roadImpact = impactData;
    state.shelters = sheltersData;
    state.resources = resourcesData;
    state.alerts = alertsData;
    
    // Update Map Layers
    renderSpatialRiskZones(zonesData);
    renderRoadNetwork(roadsData);
    renderInfrastructure(infraData);
    renderSettlements(settlementsData);
    renderRivers(riversData);
    renderSensorsOnMap(sensorsData);
    renderFieldReportsOnMap(reportsData);
    renderLandslideMarkers(landslidesData);
    renderStationMarkers(riskData);
    
    // Update KPI Header & Ribbon
    renderTopKPIs(riskData, rainData, metricsData);
    updateEmergencyBanner(riskData);
    
    // Render Active Tab
    renderCurrentTab();
    
    console.log('[App] All datasets successfully loaded and rendered.');
  } catch (err) {
    console.error('[App] Error loading datasets:', err);
  } finally {
    if (syncBtn) {
      syncBtn.innerHTML = '🔄 Refresh Data';
      syncBtn.disabled = false;
    }
  }
}

function renderCurrentTab() {
  const tab = state.currentTab;
  if (tab === 'command' || tab === 'overview') {
    renderRiskView(state.currentRisk);
  } else if (tab === 'rainfall') {
    renderRainfallView(state.rainfallLatest);
  } else if (tab === 'terrain') {
    renderTerrainView(state.currentRisk);
  } else if (tab === 'historical') {
    renderHistoricalView(state.landslides);
  } else if (tab === 'replay') {
    renderReplayView(state.historicalReplay);
  } else if (tab === 'model') {
    renderModelView(state.modelMetrics);
  } else if (tab === 'explainability') {
    renderExplainabilityView(state.currentRisk);
  } else if (tab === 'iot') {
    renderIoTView(state.sensors, null);
  } else if (tab === 'field-ai') {
    renderFieldAIView(state.fieldReports);
  } else if (tab === 'emergency') {
    renderEmergencyView(state.roadImpact, state.shelters, state.resources, state.alerts);
  } else if (tab === 'citizen') {
    renderCitizenView();
  }
}

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchDashboardTab(tabId);
    });
  });
}

export function switchDashboardTab(tabId) {
  state.currentTab = tabId;
  
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  
  document.querySelectorAll('.tab-view').forEach(view => {
    const isTarget = view.id === `view-${tabId}` || (tabId === 'command' && view.id === 'view-command');
    view.classList.toggle('active', isTarget);
  });
  
  renderCurrentTab();
}

window.switchDashboardTab = switchDashboardTab;

function setupControls() {
  // 1. Language Selector (9 Languages)
  const langSel = document.getElementById('lang-selector');
  if (langSel) {
    langSel.addEventListener('change', e => {
      state.currentLang = e.target.value;
      setLanguage(e.target.value);
    });
  }
  
  // 2. Role Selector (RBAC)
  const roleSel = document.getElementById('role-selector');
  if (roleSel) {
    roleSel.addEventListener('change', e => {
      state.currentRole = e.target.value;
      switchRole(e.target.value);
    });
  }
  
  // 3. Operational Data Mode Selector
  const modeSel = document.getElementById('data-mode-selector');
  if (modeSel) {
    modeSel.addEventListener('change', e => {
      state.dataMode = e.target.value;
      const badge = document.getElementById('active-data-mode-badge');
      if (badge) {
        badge.innerHTML = `<span>●</span> MODE: ${state.dataMode}`;
        badge.className = `status-badge ${state.dataMode === 'LIVE' ? 'status-connected' : 'status-warning'}`;
      }
      if (state.dataMode === 'DEMO') {
        renderDemoTourModal();
      }
    });
  }
  
  // 4. SIH Judge Tour Button
  const tourBtn = document.getElementById('sih-tour-btn');
  if (tourBtn) {
    tourBtn.addEventListener('click', () => {
      renderDemoTourModal();
    });
  }
  
  // 5. Audio Alert Toggle & Siren Test
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      state.audioAlertsEnabled = !state.audioAlertsEnabled;
      audioBtn.textContent = state.audioAlertsEnabled ? '🔊 Audio Alerts: ON' : '🔇 Audio Alerts: OFF';
      audioBtn.className = state.audioAlertsEnabled ? 'btn btn-primary' : 'btn btn-secondary';
    });
  }
  
  const sirenBtn = document.getElementById('siren-test-btn');
  if (sirenBtn) {
    sirenBtn.addEventListener('click', () => {
      playDisasterSiren();
      speakEmergencyWarning('Emergency Alert: Siren test initiated along NH-10 corridor.', state.currentLang);
    });
  }
  
  // 6. Manual Sync Button
  const syncBtn = document.getElementById('sync-data-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      loadAllData();
      state.refreshCountdown = 60;
    });
  }
}

function updateEmergencyBanner(currentRisk) {
  const banner = document.getElementById('emergency-banner');
  const headline = document.getElementById('banner-headline');
  if (!banner || !headline) return;
  
  const corridor = currentRisk?.overall_corridor_risk || {};
  const level = corridor.risk_level || 'LOW';
  
  if (level === 'CRITICAL') {
    banner.className = 'emergency-banner emergency-critical';
    headline.textContent = t('alert_ribbon_critical', 'EMERGENCY ALERT: Imminent landslide danger on NH-10!');
    banner.classList.remove('hidden');
    if (state.audioAlertsEnabled) playDisasterSiren();
  } else if (level === 'HIGH') {
    banner.className = 'emergency-banner emergency-high';
    headline.textContent = t('alert_ribbon_high', 'WARNING: High landslide risk along NH-10 corridor.');
    banner.classList.remove('hidden');
    if (state.audioAlertsEnabled) playNotificationChime();
  } else if (level === 'WATCH') {
    banner.className = 'emergency-banner emergency-watch';
    headline.textContent = t('alert_ribbon_watch', 'ADVISORY: Elevated soil saturation detected.');
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function setupOfflineDetection() {
  window.addEventListener('offline', () => {
    state.isOffline = true;
    const offlineNotice = document.getElementById('offline-indicator');
    if (offlineNotice) offlineNotice.classList.remove('hidden');
    console.warn('[Network] Internet connection lost. Running in Offline-First Mode.');
  });
  
  window.addEventListener('online', () => {
    state.isOffline = false;
    const offlineNotice = document.getElementById('offline-indicator');
    if (offlineNotice) offlineNotice.classList.add('hidden');
    console.log('[Network] Internet connection restored. Resuming live telemetry.');
    loadAllData();
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[ServiceWorker] Registered successfully with scope:', reg.scope))
        .catch(err => console.warn('[ServiceWorker] Registration failed:', err));
    });
  }
}

function startAutoRefreshTimer() {
  if (state.refreshInterval) clearInterval(state.refreshInterval);
  state.refreshInterval = setInterval(() => {
    state.refreshCountdown--;
    const timerEl = document.getElementById('countdown-timer');
    if (timerEl) {
      timerEl.textContent = `${state.refreshCountdown}s`;
    }
    if (state.refreshCountdown <= 0) {
      state.refreshCountdown = 60;
      loadAllData();
    }
  }, 1000);
}
