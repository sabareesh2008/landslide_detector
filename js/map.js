/**
 * LANDSLIDE SENTINEL AI - Advanced GIS Leaflet Map Engine
 * Multi-layer rendering for fine-grained spatial risk grid, NH-10 road segments,
 * critical infrastructure, rivers, settlements, ground sensors, field reports, and GSI failures.
 */

let mapInstance = null;
let layerControl = null;

let baseLayers = {};
let overlayLayers = {
  riskZones: null,
  landslides: null,
  stations: null,
  nh10Roads: null,
  infrastructure: null,
  settlements: null,
  rivers: null,
  sensors: null,
  fieldReports: null,
  slopeOverlay: null
};

export function initMap(containerId = 'map') {
  const container = document.getElementById(containerId);
  if (!container || mapInstance) return mapInstance;
  
  const centerLat = 27.205;
  const centerLon = 88.517;
  
  mapInstance = L.map(containerId, {
    center: [centerLat, centerLon],
    zoom: 12,
    zoomControl: false,
    attributionControl: false
  });
  
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
    "Satellite Topography": satelliteTiles,
    "Topographic Terrain": topoTiles
  };
  
  // Initialize Overlay Layer Groups
  overlayLayers.riskZones = L.layerGroup().addTo(mapInstance);
  overlayLayers.nh10Roads = L.layerGroup().addTo(mapInstance);
  overlayLayers.infrastructure = L.layerGroup().addTo(mapInstance);
  overlayLayers.settlements = L.layerGroup().addTo(mapInstance);
  overlayLayers.rivers = L.layerGroup().addTo(mapInstance);
  overlayLayers.sensors = L.layerGroup().addTo(mapInstance);
  overlayLayers.fieldReports = L.layerGroup().addTo(mapInstance);
  overlayLayers.landslides = L.layerGroup().addTo(mapInstance);
  overlayLayers.stations = L.layerGroup().addTo(mapInstance);
  overlayLayers.slopeOverlay = L.layerGroup();
  
  const overlays = {
    "🚨 AI Spatial Risk Zones": overlayLayers.riskZones,
    "🛣️ NH-10 Highway Lifeline Segments": overlayLayers.nh10Roads,
    "🏥 Critical Infrastructure & Bridges": overlayLayers.infrastructure,
    "🏘️ Municipalities & Settlements": overlayLayers.settlements,
    "🌊 Teesta & Rangpo Drainage Lines": overlayLayers.rivers,
    "📡 Ground IoT Telemetry Nodes": overlayLayers.sensors,
    "📸 Field AI Evidence Reports": overlayLayers.fieldReports,
    "📍 GSI Historical Landslides": overlayLayers.landslides,
    "🛰️ NASA Monitoring Stations": overlayLayers.stations
  };
  
  layerControl = L.control.layers(baseLayers, overlays, { position: 'topright', collapsed: false }).addTo(mapInstance);
  
  return mapInstance;
}

export function renderSpatialRiskZones(geojsonData) {
  if (!mapInstance || !overlayLayers.riskZones) return;
  overlayLayers.riskZones.clearLayers();
  
  if (!geojsonData || !geojsonData.features) return;
  
  L.geoJSON(geojsonData, {
    style: function(feature) {
      const p = feature.properties || {};
      const prob = p.risk_probability || 0;
      let fillColor = '#10b981';
      let borderColor = '#059669';
      
      if (prob >= 0.75) {
        fillColor = '#ef4444';
        borderColor = '#b91c1c';
      } else if (prob >= 0.45) {
        fillColor = '#f97316';
        borderColor = '#c2410c';
      } else if (prob >= 0.20) {
        fillColor = '#f59e0b';
        borderColor = '#d97706';
      }
      
      return {
        fillColor: fillColor,
        weight: 1.5,
        opacity: 0.8,
        color: borderColor,
        fillOpacity: 0.35
      };
    },
    onEachFeature: function(feature, layer) {
      const p = feature.properties || {};
      const prob = p.risk_probability || 0;
      const level = p.risk_level || 'LOW';
      
      const symbol = level === 'CRITICAL' ? '[!]' : (level === 'HIGH' ? '[▲]' : (level === 'WATCH' ? '[◆]' : '[✓]'));
      
      layer.bindPopup(`
        <div style="font-family: sans-serif; font-size: 0.85rem; color: #0f172a; min-width: 230px;">
          <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #0e7490;">${p.zone_id || 'Grid Cell'}</strong>
            <span style="float: right; font-weight: bold; color: ${level === 'CRITICAL' ? '#dc2626' : (level === 'HIGH' ? '#ea580c' : '#059669')}">
              ${symbol} ${level} (${(prob * 100).toFixed(1)}%)
            </span>
          </div>
          <div><strong>Elevation:</strong> ${p.elevation_m || 350} m | <strong>Slope:</strong> ${p.slope_degrees || 18}°</div>
          <div><strong>24h Rain:</strong> ${p.rainfall_24h_mm || 0} mm | <strong>72h Rain:</strong> ${p.rainfall_72h_mm || 0} mm</div>
          <div><strong>Nearest NH-10:</strong> ${p.distance_to_nh10_km !== undefined ? p.distance_to_nh10_km + ' km' : 'Adjacent'}</div>
          <div style="margin-top: 6px; padding: 4px 6px; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem;">
            <em>${p.spatial_explanation || 'Hydrometeorological trigger state within safe thresholds.'}</em>
          </div>
        </div>
      `);
    }
  }).addTo(overlayLayers.riskZones);
}

export function renderRoadNetwork(roadsGeoJSON) {
  if (!mapInstance || !overlayLayers.nh10Roads || !roadsGeoJSON) return;
  overlayLayers.nh10Roads.clearLayers();
  
  L.geoJSON(roadsGeoJSON, {
    style: function(feature) {
      const p = feature.properties || {};
      const isChronic = p.chronic_slide_zone;
      return {
        color: isChronic ? '#f43f5e' : '#38bdf8',
        weight: 5,
        opacity: 0.9,
        dashArray: isChronic ? '6, 6' : null
      };
    },
    onEachFeature: function(feature, layer) {
      const p = feature.properties || {};
      layer.bindPopup(`
        <div style="font-size: 0.85rem; color: #0f172a; min-width: 220px;">
          <strong style="color: #0284c7;">${p.name}</strong><br/>
          <span style="font-size: 0.75rem; color: #64748b;">Segment ID: ${p.segment_id} • Length: ${p.length_km} km</span>
          <hr style="margin: 4px 0;" />
          <div><strong>Criticality:</strong> <span style="color: #dc2626; font-weight: bold;">${p.criticality}</span></div>
          <div><strong>Chronic Slide Zone:</strong> ${p.chronic_slide_zone ? '⚠️ YES (High Scarp)' : 'No'}</div>
          <div><strong>Traffic Status:</strong> <span style="color: #16a34a; font-weight: bold;">${p.status}</span></div>
        </div>
      `);
    }
  }).addTo(overlayLayers.nh10Roads);
}

export function renderInfrastructure(infraGeoJSON) {
  if (!mapInstance || !overlayLayers.infrastructure || !infraGeoJSON) return;
  overlayLayers.infrastructure.clearLayers();
  
  L.geoJSON(infraGeoJSON, {
    pointToLayer: function(feature, latlng) {
      const p = feature.properties || {};
      let iconEmoji = '🏥';
      if (p.type === 'BRIDGE') iconEmoji = '🌉';
      else if (p.type === 'CULVERT') iconEmoji = '🚰';
      else if (p.type === 'RETAINING_WALL') iconEmoji = '🧱';
      else if (p.type === 'SCHOOL') iconEmoji = '🏫';
      else if (p.type === 'EMERGENCY_SERVICES') iconEmoji = '🚒';
      else if (p.type === 'TELECOM') iconEmoji = '🗼';
      
      const icon = L.divIcon({
        className: 'custom-infra-icon',
        html: `<div style="background: rgba(15,23,42,0.85); border: 1.5px solid #06b6d4; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 8px rgba(6,182,212,0.5);">${iconEmoji}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      return L.marker(latlng, { icon });
    },
    onEachFeature: function(feature, layer) {
      const p = feature.properties || {};
      layer.bindPopup(`
        <div style="font-size: 0.85rem; color: #0f172a; min-width: 220px;">
          <strong style="color: #0e7490;">${p.name}</strong><br/>
          <span style="font-size: 0.75rem; color: #64748b;">Type: ${p.type} • Elev: ${p.elevation_m}m</span>
          <hr style="margin: 4px 0;" />
          <div><strong>Criticality:</strong> ${p.criticality}</div>
          <div style="font-size: 0.75rem; color: #334155; margin-top: 4px;">${p.description || ''}</div>
        </div>
      `);
    }
  }).addTo(overlayLayers.infrastructure);
}

export function renderSettlements(settlementsGeoJSON) {
  if (!mapInstance || !overlayLayers.settlements || !settlementsGeoJSON) return;
  overlayLayers.settlements.clearLayers();
  
  L.geoJSON(settlementsGeoJSON, {
    pointToLayer: function(feature, latlng) {
      const icon = L.divIcon({
        className: 'custom-settle-icon',
        html: `<div style="background: rgba(15,23,42,0.9); border: 1.5px solid #a855f7; border-radius: 6px; padding: 1px 5px; font-size: 11px; font-weight: bold; color: #d8b4fe; white-space: nowrap;">🏘️ ${feature.properties.name}</div>`,
        iconAnchor: [30, 10]
      });
      return L.marker(latlng, { icon });
    }
  }).addTo(overlayLayers.settlements);
}

export function renderRivers(riversGeoJSON) {
  if (!mapInstance || !overlayLayers.rivers || !riversGeoJSON) return;
  overlayLayers.rivers.clearLayers();
  
  L.geoJSON(riversGeoJSON, {
    style: {
      color: '#38bdf8',
      weight: 3.5,
      opacity: 0.75
    }
  }).addTo(overlayLayers.rivers);
}

export function renderSensorsOnMap(sensorsData) {
  if (!mapInstance || !overlayLayers.sensors || !sensorsData) return;
  overlayLayers.sensors.clearLayers();
  
  (sensorsData.nodes || []).forEach(node => {
    const lat = node.latitude;
    const lon = node.longitude;
    const icon = L.divIcon({
      className: 'custom-sensor-icon',
      html: `<div style="background: #0f172a; border: 2px solid #10b981; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 10px rgba(16,185,129,0.7);">📡</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    L.marker([lat, lon], { icon }).bindPopup(`
      <div style="font-size: 0.85rem; color: #0f172a;">
        <strong style="color: #059669;">${node.name}</strong><br/>
        <span class="badge bg-dark text-cyan">${node.sensor_type}</span>
        <hr style="margin: 4px 0;" />
        <div><strong>Status:</strong> <span style="color: #10b981;">${node.hardware_health.status}</span></div>
        <div><strong>Battery:</strong> ${node.hardware_health.battery_percent}% (${node.hardware_health.battery_voltage}V)</div>
      </div>
    `).addTo(overlayLayers.sensors);
  });
}

export function renderFieldReportsOnMap(reportsData) {
  if (!mapInstance || !overlayLayers.fieldReports || !reportsData) return;
  overlayLayers.fieldReports.clearLayers();
  
  (reportsData.reports || []).forEach(rep => {
    const isVerified = rep.verification_lifecycle?.status === 'FIELD_VERIFIED';
    const icon = L.divIcon({
      className: 'custom-field-icon',
      html: `<div style="background: #0f172a; border: 2px solid ${isVerified ? '#10b981' : '#f59e0b'}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 8px rgba(245,158,11,0.6);">📸</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    L.marker([rep.latitude, rep.longitude], { icon }).bindPopup(`
      <div style="font-size: 0.85rem; color: #0f172a;">
        <strong style="color: #d97706;">${rep.report_id}</strong> — ${rep.location_name}<br/>
        <span class="badge bg-secondary">${rep.verification_lifecycle?.status || 'SUBMITTED'}</span>
        <hr style="margin: 4px 0;" />
        <div><strong>Observed:</strong> ${(rep.observed_symptoms || []).join(', ')}</div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">AI Severity: ${rep.ai_vision_analysis?.estimated_severity || 'MODERATE'}</div>
      </div>
    `).addTo(overlayLayers.fieldReports);
  });
}

export function renderLandslideMarkers(landslides) {
  if (!mapInstance || !overlayLayers.landslides || !landslides) return;
  overlayLayers.landslides.clearLayers();
  
  landslides.forEach(item => {
    const lat = parseFloat(item.latitude);
    const lon = parseFloat(item.longitude);
    if (isNaN(lat) || isNaN(lon)) return;
    
    const marker = L.circleMarker([lat, lon], {
      radius: 4.5,
      fillColor: '#ec4899',
      color: '#ffffff',
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.75
    });
    
    marker.bindPopup(`
      <div style="font-size: 0.82rem; color: #0f172a;">
        <strong style="color: #db2777;">GSI Historical Failure Scar</strong><br/>
        <span>Slide No: ${item.event_id || item.slide_no || 'GSI-REC'}</span>
        <hr style="margin: 4px 0;" />
        <div><strong>Location:</strong> ${item.location_name || item.nh_sh_location || 'NH-10 Sector'}</div>
        <div><strong>Material:</strong> ${item.material_type || item.material_involved || 'Debris'}</div>
        <div><strong>Survey Year:</strong> ${item.survey_year || 2015}</div>
      </div>
    `);
    
    marker.addTo(overlayLayers.landslides);
  });
}

export function renderStationMarkers(currentRisk) {
  if (!mapInstance || !overlayLayers.stations) return;
  overlayLayers.stations.clearLayers();
  
  const stations = currentRisk?.stations || {};
  
  Object.values(stations).forEach(st => {
    const lat = parseFloat(st.latitude);
    const lon = parseFloat(st.longitude);
    if (isNaN(lat) || isNaN(lon)) return;
    
    const level = st.risk_level || 'LOW';
    const prob = st.risk_probability !== undefined ? st.risk_probability : 0;
    
    let markerColor = '#10b981';
    if (level === 'CRITICAL') markerColor = '#ef4444';
    else if (level === 'HIGH') markerColor = '#f97316';
    else if (level === 'WATCH') markerColor = '#f59e0b';
    
    const icon = L.divIcon({
      className: 'station-div-icon',
      html: `<div style="background: #0f172a; border: 2.5px solid ${markerColor}; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: ${markerColor}; font-weight: bold; font-size: 11px; box-shadow: 0 0 14px ${markerColor}99;">${(prob * 100).toFixed(0)}%</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    
    const marker = L.marker([lat, lon], { icon });
    marker.bindPopup(`
      <div style="font-size: 0.85rem; color: #0f172a; min-width: 220px;">
        <strong style="font-size: 0.95rem; color: #0891b2;">${st.location} Monitoring Station</strong><br/>
        <span style="font-weight: bold; color: ${markerColor};">${level} RISK TIER (${(prob * 100).toFixed(1)}%)</span>
        <hr style="margin: 6px 0;" />
        <div><strong>Elevation:</strong> ${st.elevation_m} m | <strong>Slope:</strong> ${st.slope_degrees}°</div>
        <div><strong>24h Rain:</strong> ${st.rainfall_24h_mm} mm | <strong>72h Rain:</strong> ${st.rainfall_72h_mm} mm</div>
        <div style="margin-top: 6px; padding: 4px; background: #f8fafc; border-radius: 4px; font-size: 0.75rem;">
          <strong>Action Directive:</strong><br/>
          <span>${st.recommended_action || 'Routine surveillance.'}</span>
        </div>
      </div>
    `);
    marker.addTo(overlayLayers.stations);
  });
}
