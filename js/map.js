/**
 * LANDSLIDE SENTINEL AI - Real Geospatial Leaflet Map Engine
 */

let mapInstance = null;
let layerControl = null;

// Layer Groups
let baseLayers = {};
let overlayLayers = {
  riskHeatmap: null,
  landslides: null,
  stations: null,
  nh10Corridor: null,
  slopeOverlay: null,
  elevationOverlay: null,
  aspectOverlay: null
};

export function initMap(containerId = 'map') {
  const container = document.getElementById(containerId);
  if (!container || mapInstance) return mapInstance;
  
  // Center on Rangpo - Singtam Corridor (Sikkim)
  const centerLat = 27.205;
  const centerLon = 88.517;
  
  mapInstance = L.map(containerId, {
    center: [centerLat, centerLon],
    zoom: 12,
    zoomControl: false,
    attributionControl: false
  });
  
  // Custom Controls
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(mapInstance);
  
  // Base Layers
  const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  });
  
  const osmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  });
  
  const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  });
  
  const topoTiles = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17
  });
  
  darkTiles.addTo(mapInstance);
  
  baseLayers = {
    "Dark Command Center": darkTiles,
    "OpenStreetMap Basemap": osmTiles,
    "Satellite Imagery": satelliteTiles,
    "Topographic Terrain": topoTiles
  };
  
  // Initialize Overlay Groups
  overlayLayers.riskHeatmap = L.layerGroup().addTo(mapInstance);
  overlayLayers.landslides = L.layerGroup().addTo(mapInstance);
  overlayLayers.stations = L.layerGroup().addTo(mapInstance);
  overlayLayers.nh10Corridor = L.layerGroup().addTo(mapInstance);
  overlayLayers.slopeOverlay = L.layerGroup().addTo(mapInstance);
  overlayLayers.elevationOverlay = L.layerGroup();
  overlayLayers.aspectOverlay = L.layerGroup();
  
  const overlays = {
    "🚨 Current AI Landslide Risk Heatmap": overlayLayers.riskHeatmap,
    "📍 Historical Landslide Records": overlayLayers.landslides,
    "🛰️ NASA Rainfall Stations (Rangpo/Singtam)": overlayLayers.stations,
    "🛣️ NH-10 Highway Corridor": overlayLayers.nh10Corridor,
    "⛰️ Copernicus DEM Slope Susceptibility": overlayLayers.slopeOverlay,
    "📈 Elevation Derivatives": overlayLayers.elevationOverlay,
    "🧭 Aspect Orientation": overlayLayers.aspectOverlay
  };
  
  layerControl = L.control.layers(baseLayers, overlays, { position: 'topright', collapsed: false }).addTo(mapInstance);
  
  // Draw NH-10 Corridor Line
  renderNH10Corridor();
  
  return mapInstance;
}

function renderNH10Corridor() {
  const nh10Coords = [
    [27.135, 88.540], // Teesta Bazar approach
    [27.155, 88.535], // Melli junction
    [27.177, 88.533], // Rangpo Checkpost
    [27.195, 88.520], // Majhitar
    [27.210, 88.510], // Mining Area
    [27.234, 88.501], // Singtam Bazar
    [27.255, 88.515], // Bardang
    [27.275, 88.525]  // 5th Mile
  ];
  
  const polyline = L.polyline(nh10Coords, {
    color: '#06b6d4',
    weight: 4,
    opacity: 0.85,
    dashArray: '8, 6'
  }).bindPopup(`
    <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0f172a;">
      <strong style="color: #0284c7; font-size: 13px;">NH-10 Lifeline Corridor</strong><br/>
      <strong>Section:</strong> Rangpo – Singtam Highway, Sikkim<br/>
      <strong>Vulnerability:</strong> Chronic slope instability corridor (Teesta Basin)
    </div>
  `);
  
  overlayLayers.nh10Corridor.addLayer(polyline);
}

export function updateMapRiskGrid(geojsonData) {
  if (!mapInstance || !overlayLayers.riskHeatmap || !geojsonData) return;
  overlayLayers.riskHeatmap.clearLayers();
  overlayLayers.slopeOverlay.clearLayers();
  
  const getColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'WATCH': return '#f59e0b';
      case 'LOW':
      default: return '#10b981';
    }
  };
  
  const getSlopeColor = (slope) => {
    if (slope > 40) return '#7f1d1d';
    if (slope > 30) return '#b91c1c';
    if (slope > 20) return '#ea580c';
    if (slope > 10) return '#d97706';
    return '#059669';
  };
  
  L.geoJSON(geojsonData, {
    style: (feature) => {
      const p = feature.properties || {};
      const color = getColor(p.risk_level);
      return {
        fillColor: color,
        weight: 1.5,
        opacity: 0.7,
        color: '#1e293b',
        fillOpacity: p.risk_level === 'CRITICAL' ? 0.65 : 0.45
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0f172a; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: ${getColor(p.risk_level)}; margin-bottom: 4px;">
            ${p.cell_id} (${p.risk_level})
          </div>
          <strong>Risk Probability:</strong> ${(p.risk_probability * 100).toFixed(1)}%<br/>
          <strong>24h Rainfall:</strong> ${p.rainfall_24h_mm} mm<br/>
          <strong>72h Accumulated:</strong> ${p.rainfall_72h_mm} mm<br/>
          <strong>Elevation:</strong> ${p.elevation_m} m<br/>
          <strong>Slope:</strong> ${p.slope_degrees}°<br/>
          <strong>Aspect:</strong> ${p.aspect_degrees}°<br/>
          <span style="font-size: 10px; color: #64748b;">${p.model_version}</span>
        </div>
      `);
    }
  }).addTo(overlayLayers.riskHeatmap);
  
  // Populate Slope overlay with color-coded polygons
  L.geoJSON(geojsonData, {
    style: (feature) => {
      const p = feature.properties || {};
      return {
        fillColor: getSlopeColor(p.slope_degrees),
        weight: 1,
        opacity: 0.5,
        color: '#334155',
        fillOpacity: 0.5
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0f172a;">
          <strong>Slope Angle:</strong> ${p.slope_degrees}°<br/>
          <strong>Elevation:</strong> ${p.elevation_m} m<br/>
          <strong>Susceptibility Class:</strong> ${p.slope_degrees > 30 ? 'High' : (p.slope_degrees > 20 ? 'Moderate' : 'Low')}
        </div>
      `);
    }
  }).addTo(overlayLayers.slopeOverlay);
}

export function updateMapLandslides(landslides) {
  if (!mapInstance || !overlayLayers.landslides || !landslides) return;
  overlayLayers.landslides.clearLayers();
  
  landslides.forEach(item => {
    const lat = parseFloat(item.latitude);
    const lon = parseFloat(item.longitude);
    if (isNaN(lat) || isNaN(lon)) return;
    
    const marker = L.circleMarker([lat, lon], {
      radius: 5,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 1.5,
      opacity: 0.9,
      fillOpacity: 0.85
    });
    
    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0f172a;">
        <strong style="color: #dc2626;">GSI Historical Landslide</strong><br/>
        <strong>Slide ID:</strong> ${item.slide_no || item.sl_no}<br/>
        <strong>Location:</strong> ${item.nh_sh_location || 'Rangpo-Singtam Corridor'}<br/>
        <strong>Material:</strong> ${item.material_involved || 'Debris'}<br/>
        <strong>Movement Type:</strong> ${item.movement_type || 'Slide'}<br/>
        <strong>District:</strong> ${item.district || 'East/South Sikkim'}
      </div>
    `);
    
    overlayLayers.landslides.addLayer(marker);
  });
}

export function updateMapStations(currentRiskData) {
  if (!mapInstance || !overlayLayers.stations || !currentRiskData) return;
  overlayLayers.stations.clearLayers();
  
  const stations = currentRiskData.stations || {};
  Object.keys(stations).forEach(name => {
    const s = stations[name];
    const iconHtml = `
      <div style="
        background: #0284c7;
        color: white;
        border: 2px solid #ffffff;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
      ">
        📡
      </div>
    `;
    
    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'station-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    const marker = L.marker([s.latitude, s.longitude], { icon: customIcon });
    
    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0f172a; min-width: 200px;">
        <strong style="color: #0284c7; font-size: 14px;">📡 ${s.location} Monitoring Station</strong><br/>
        <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;"/>
        <strong>Current Risk:</strong> <span style="font-weight: bold; color: ${s.risk_level === 'CRITICAL' ? '#dc2626' : (s.risk_level === 'HIGH' ? '#ea580c' : '#059669')}">${s.risk_level} (${(s.risk_probability*100).toFixed(1)}%)</span><br/>
        <strong>24h Precipitation:</strong> ${s.rainfall_24h_mm} mm<br/>
        <strong>72h Cumulative:</strong> ${s.rainfall_72h_mm} mm<br/>
        <strong>Elevation:</strong> ${s.elevation_m} m | <strong>Slope:</strong> ${s.slope_degrees}°<br/>
        <strong>Aspect:</strong> ${s.aspect_degrees}° (${s.aspect_direction})<br/>
        <strong>Last Observation:</strong> ${s.latest_observation_utc.substring(0, 16)} UTC
      </div>
    `);
    
    overlayLayers.stations.addLayer(marker);
  });
}
