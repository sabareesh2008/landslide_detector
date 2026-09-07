/**
 * LANDSLIDE SENTINEL AI - Main Application Controller
 * Zero Build / Pure Vanilla JavaScript ES6+
 */

import {
  fetchCurrentRisk,
  fetchRainfallLatest,
  fetchRainfallHistory,
  fetchHistoricalLandslides,
  fetchTerrainPoints,
  fetchRiskGridGeoJSON,
  fetchModelMetrics,
  fetchHistoricalReplay
} from './api.js';

import { initMap, updateMapRiskGrid, updateMapLandslides, updateMapStations } from './map.js';
import { renderTopKPIs } from './dashboard.js';
import { renderRainfallView } from './rainfall.js';
import { renderRiskView } from './risk.js';
import { renderTerrainView } from './terrain.js';
import { renderHistoricalView } from './historical.js';
import { renderReplayView } from './replay.js';
import { renderModelView } from './model.js';
import { renderExplainabilityView } from './explainability.js';
import { renderCitizenView } from './citizen.js';
import { playNotificationChime, playDisasterSiren } from './utils.js';

// Application State
const state = {
  currentTab: 'command',
  currentRole: 'Disaster Management Authority',
  currentLang: 'en',
  audioAlertsEnabled: true,
  refreshCountdown: 60,
  refreshInterval: null,
  
  // Data Cache
  currentRisk: null,
  rainfallLatest: null,
  rainfallHistory: [],
  landslides: [],
  terrainPoints: [],
  riskGridGeoJSON: null,
  modelMetrics: null,
  historicalReplay: []
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupNavigation();
  setupControls();
  initMap('map');
  
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
      riskRes,
      latestRainRes,
      historyRainRes,
      landslidesRes,
      terrainRes,
      gridRes,
      modelRes,
      replayRes
    ] = await Promise.all([
      fetchCurrentRisk(),
      fetchRainfallLatest(),
      fetchRainfallHistory(),
      fetchHistoricalLandslides(),
      fetchTerrainPoints(),
      fetchRiskGridGeoJSON(),
      fetchModelMetrics(),
      fetchHistoricalReplay()
    ]);
    
    state.currentRisk = riskRes.data;
    state.rainfallLatest = latestRainRes.data;
    state.rainfallHistory = historyRainRes.data;
    state.landslides = landslidesRes.data;
    state.terrainPoints = terrainRes.data;
    state.riskGridGeoJSON = gridRes.data;
    state.modelMetrics = modelRes.data;
    state.historicalReplay = replayRes.data;
    
    // Update Top KPIs and Alerts Ribbon
    renderTopKPIs(state.currentRisk, state.rainfallLatest, state.modelMetrics);
    
    // Update Geospatial Map
    if (state.riskGridGeoJSON) updateMapRiskGrid(state.riskGridGeoJSON);
    if (state.landslides) updateMapLandslides(state.landslides);
    if (state.currentRisk) updateMapStations(state.currentRisk);
    
    // Render Individual Tab Components
    renderRainfallView(state.rainfallLatest, state.rainfallHistory);
    renderRiskView(state.currentRisk);
    renderTerrainView(state.terrainPoints);
    renderHistoricalView(state.landslides);
    renderReplayView(state.historicalReplay);
    renderModelView(state.modelMetrics);
    renderExplainabilityView();
    renderCitizenView(state.currentLang);
    
    // Audio Chime if Critical Risk
    const level = state.currentRisk?.overall_corridor_risk?.risk_level;
    if ((level === 'CRITICAL' || level === 'HIGH') && state.audioAlertsEnabled) {
      playNotificationChime();
    }
  } catch (err) {
    console.error('Data loading error:', err);
  } finally {
    if (syncBtn) {
      syncBtn.innerHTML = '🔄 Refresh Data';
      syncBtn.disabled = false;
    }
  }
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      if (!tab) return;
      
      switchTab(tab);
    });
  });
  
  // Mobile sidebar toggle
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
}

export function switchTab(tabId) {
  state.currentTab = tabId;
  
  // Update sidebar active classes
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update view visibility
  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });
  
  // Invalidate Leaflet Map Size if switching to GIS or Command tab
  if (tabId === 'gis' || tabId === 'command') {
    setTimeout(() => {
      const map = initMap('map');
      if (map) map.invalidateSize();
    }, 100);
  }
}

window.switchTab = switchTab;

function setupControls() {
  // Sync Data Button
  const syncBtn = document.getElementById('sync-data-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      state.refreshCountdown = 60;
      loadAllData();
    });
  }
  
  // Audio Alert Toggle
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      state.audioAlertsEnabled = !state.audioAlertsEnabled;
      audioBtn.innerHTML = state.audioAlertsEnabled ? '🔊 Audio Alerts: ON' : '🔇 Audio Alerts: OFF';
      audioBtn.classList.toggle('btn-primary', state.audioAlertsEnabled);
      if (state.audioAlertsEnabled) playNotificationChime();
    });
  }
  
  // Role Selector
  const roleSelect = document.getElementById('role-selector');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      state.currentRole = e.target.value;
    });
  }
  
  // Language Selector
  const langSelect = document.getElementById('lang-selector');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      state.currentLang = e.target.value;
      renderCitizenView(state.currentLang);
    });
  }
  
  // Siren Test Button
  const sirenBtn = document.getElementById('siren-test-btn');
  if (sirenBtn) {
    sirenBtn.addEventListener('click', () => {
      playDisasterSiren();
    });
  }
  
  // Safety Modal
  const openModalBtn = document.getElementById('open-safety-modal-btn');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const modal = document.getElementById('safety-modal');
  
  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
}

function startAutoRefreshTimer() {
  if (state.refreshInterval) clearInterval(state.refreshInterval);
  
  const timerElem = document.getElementById('countdown-timer');
  
  state.refreshInterval = setInterval(() => {
    state.refreshCountdown--;
    if (timerElem) {
      timerElem.textContent = `${state.refreshCountdown}s`;
    }
    
    if (state.refreshCountdown <= 0) {
      state.refreshCountdown = 60;
      loadAllData();
    }
  }, 1000);
}
