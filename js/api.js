/**
 * LANDSLIDE SENTINEL AI - Central Static Data Loader
 * Robust loaders for static JSON/CSV/GeoJSON artifacts with graceful fallbacks.
 */

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch ${url}:`, err.message);
    return null;
  }
}

async function fetchCSV(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const text = await res.text();
    return parseCSV(text);
  } catch (err) {
    console.warn(`[API] Failed to fetch CSV ${url}:`, err.message);
    return [];
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(r => r.trim());
    if (row.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = row[idx]; });
      records.push(obj);
    }
  }
  return records;
}

export const api = {
  getCurrentRisk: () => fetchJSON('./data/current_risk.json'),
  getRainfallLatest: () => fetchJSON('./data/rainfall_latest.json'),
  getModelMetrics: () => fetchJSON('./data/model_metrics.json'),
  getHistoricalReplay: () => fetchJSON('./data/historical_replay.json'),
  getLandslides: async () => {
    let data = await fetchCSV('./data/validated/landslide_events.csv');
    if (!data.length) data = await fetchCSV('./data/landslides.csv');
    return data;
  },
  getRiskZonesGeoJSON: () => fetchJSON('./data/gis/risk_zones.geojson'),
  getHotspots: () => fetchJSON('./data/gis/hotspots.json'),
  getRoadNetworkGeoJSON: () => fetchJSON('./data/gis/nh10_road_network.geojson'),
  getInfrastructureGeoJSON: () => fetchJSON('./data/gis/corridor_infrastructure.geojson'),
  getSettlementsGeoJSON: () => fetchJSON('./data/gis/settlements.geojson'),
  getRiversGeoJSON: () => fetchJSON('./data/gis/rivers.geojson'),
  getSensors: () => fetchJSON('./data/iot/sensors.json'),
  getFieldReports: () => fetchJSON('./data/field_reports/field_reports.json'),
  getRoadImpact: () => fetchJSON('./data/infrastructure/road_impact.json'),
  getShelters: () => fetchJSON('./data/shelters/shelters.json'),
  getEmergencyResources: () => fetchJSON('./data/resources/emergency_resources.json'),
  getAlerts: () => fetchJSON('./data/alerts/alerts.json')
};
