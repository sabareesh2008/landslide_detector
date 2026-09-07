/**
 * LANDSLIDE SENTINEL AI - Static Data API Access Layer
 * Loads real processed datasets from relative ./data/ endpoints.
 * ZERO MOCK FALLBACK POLICY: If a data stream fails, returns error state.
 */

import { parseCSV } from './utils.js';

const DATA_PATHS = {
  currentRisk: './data/current_risk.json',
  rainfallLatest: './data/rainfall_latest.json',
  rainfallHistory: './data/rainfall_history.csv',
  landslides: './data/landslides.csv',
  terrainPoints: './data/terrain_points.csv',
  riskGrid: './data/risk_grid.geojson',
  modelMetrics: './data/model_metrics.json',
  historicalReplay: './data/historical_replay.json'
};

export async function fetchCurrentRisk() {
  try {
    const res = await fetch(DATA_PATHS.currentRisk);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load current risk`);
    const data = await res.json();
    return { available: true, data };
  } catch (err) {
    console.error('fetchCurrentRisk Error:', err);
    return { available: false, error: err.message, data: null };
  }
}

export async function fetchRainfallLatest() {
  try {
    const res = await fetch(DATA_PATHS.rainfallLatest);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load latest rainfall`);
    const data = await res.json();
    return { available: true, data };
  } catch (err) {
    console.error('fetchRainfallLatest Error:', err);
    return { available: false, error: err.message, data: null };
  }
}

export async function fetchRainfallHistory() {
  try {
    const res = await fetch(DATA_PATHS.rainfallHistory);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load rainfall history`);
    const text = await res.text();
    const rows = parseCSV(text);
    
    // Strict validation
    const validRows = rows.filter(r => {
      const rain = parseFloat(r.rainfall_mm);
      return !isNaN(rain) && rain >= 0 && r.location && r.observation_end_utc;
    });
    
    return { available: true, count: validRows.length, data: validRows };
  } catch (err) {
    console.error('fetchRainfallHistory Error:', err);
    return { available: false, error: err.message, data: [] };
  }
}

export async function fetchHistoricalLandslides() {
  try {
    const res = await fetch(DATA_PATHS.landslides);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load historical landslides`);
    const text = await res.text();
    const rows = parseCSV(text);
    
    // Filter and validate coordinates
    const validRows = rows.filter(r => {
      const lat = parseFloat(r.latitude);
      const lon = parseFloat(r.longitude);
      return !isNaN(lat) && !isNaN(lon) && lat >= 25.0 && lat <= 29.0 && lon >= 87.0 && lon <= 90.0;
    });
    
    return { available: true, count: validRows.length, data: validRows };
  } catch (err) {
    console.error('fetchHistoricalLandslides Error:', err);
    return { available: false, error: err.message, data: [] };
  }
}

export async function fetchTerrainPoints() {
  try {
    const res = await fetch(DATA_PATHS.terrainPoints);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load terrain points`);
    const text = await res.text();
    const rows = parseCSV(text);
    return { available: true, data: rows };
  } catch (err) {
    console.error('fetchTerrainPoints Error:', err);
    return { available: false, error: err.message, data: [] };
  }
}

export async function fetchRiskGridGeoJSON() {
  try {
    const res = await fetch(DATA_PATHS.riskGrid);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load risk grid GeoJSON`);
    const data = await res.json();
    return { available: true, data };
  } catch (err) {
    console.error('fetchRiskGridGeoJSON Error:', err);
    return { available: false, error: err.message, data: null };
  }
}

export async function fetchModelMetrics() {
  try {
    const res = await fetch(DATA_PATHS.modelMetrics);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load model metrics`);
    const data = await res.json();
    return { available: true, data };
  } catch (err) {
    console.error('fetchModelMetrics Error:', err);
    return { available: false, error: err.message, data: null };
  }
}

export async function fetchHistoricalReplay() {
  try {
    const res = await fetch(DATA_PATHS.historicalReplay);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load historical replay`);
    const data = await res.json();
    return { available: true, data };
  } catch (err) {
    console.error('fetchHistoricalReplay Error:', err);
    return { available: false, error: err.message, data: [] };
  }
}
