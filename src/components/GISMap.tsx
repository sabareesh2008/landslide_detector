import React, { useEffect, useRef, useState } from 'react';
import { 
  GridCellRisk, 
  SensorNode, 
  RoadCorridor, 
  FieldReport, 
  NEState 
} from '../types';
import { STATE_COORDINATES } from '../data/mockData';
import { 
  Layers, 
  Maximize2, 
  Radio, 
  AlertTriangle, 
  Sliders, 
  ShieldAlert, 
  Droplets, 
  Mountain, 
  Compass, 
  Activity,
  X,
  Eye,
  Info,
  Building,
  Navigation
} from 'lucide-react';
import L from 'leaflet';

interface GISMapProps {
  cells: GridCellRisk[];
  sensors: SensorNode[];
  roads: RoadCorridor[];
  reports: FieldReport[];
  selectedState: NEState | 'All NE States';
  onSelectZone: (cell: GridCellRisk) => void;
  selectedZone: GridCellRisk | null;
}

export const GISMap: React.FC<GISMapProps> = ({
  cells,
  sensors,
  roads,
  reports,
  selectedState,
  onSelectZone,
  selectedZone
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Layer Controls
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'terrain'>('dark');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [temporalStep, setTemporalStep] = useState<'now' | '-1h' | '-3h' | '+6h_forecast' | '+24h_forecast'>('now');

  // Filter cells based on state
  const visibleCells = selectedState === 'All NE States' 
    ? cells 
    : cells.filter(c => c.state === selectedState);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = selectedState === 'All NE States' 
      ? [26.0, 92.5] 
      : [STATE_COORDINATES[selectedState]?.lat || 26.0, STATE_COORDINATES[selectedState]?.lng || 92.5];

    const initialZoom = selectedState === 'All NE States' ? 7 : (STATE_COORDINATES[selectedState]?.zoom || 8);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter as L.LatLngExpression,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((l) => {
      if (l instanceof L.TileLayer) {
        map.removeLayer(l);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapStyle]);

  // Handle State Pan/Zoom Transition
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedState === 'All NE States') {
      map.flyTo([26.0, 92.5], 7, { duration: 1.2 });
    } else if (STATE_COORDINATES[selectedState]) {
      const coord = STATE_COORDINATES[selectedState];
      map.flyTo([coord.lat, coord.lng], coord.zoom, { duration: 1.2 });
    }
  }, [selectedState]);

  // Render Geospatial Overlays (Risk Polygons, Heat Circles, Sensors, Roads, Reports)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Risk Polygons / Micro-Catchments
    if (showHeatmap) {
      visibleCells.forEach((cell) => {
        let fillColor = '#10b981'; // green
        let strokeColor = '#059669';
        if (cell.severity === 'critical') {
          fillColor = '#ef4444';
          strokeColor = '#dc2626';
        } else if (cell.severity === 'high') {
          fillColor = '#f97316';
          strokeColor = '#ea580c';
        } else if (cell.severity === 'moderate') {
          fillColor = '#eab308';
          strokeColor = '#ca8a04';
        }

        // Create buffer circle for cell
        const radius = cell.severity === 'critical' ? 7500 : 5500;

        const circle = L.circle([cell.lat, cell.lng], {
          radius: radius,
          color: strokeColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: cell.severity === 'critical' ? 0.45 : 0.28,
          className: cell.severity === 'critical' ? 'animate-pulse' : ''
        });

        const isSelected = selectedZone?.id === cell.id;
        if (isSelected) {
          circle.setStyle({ weight: 4, color: '#06b6d4', fillOpacity: 0.6 });
        }

        circle.on('click', () => {
          onSelectZone(cell);
        });

        // Popup tooltip
        circle.bindTooltip(`
          <div class="font-sans text-xs bg-slate-900/95 text-slate-100 p-2 rounded border border-slate-700 shadow-xl">
            <div class="font-bold flex items-center justify-between gap-2">
              <span>${cell.name}</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] uppercase font-sans ${
                cell.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-500' :
                cell.severity === 'high' ? 'bg-orange-950 text-orange-300 border border-orange-500' :
                'bg-emerald-950 text-emerald-300 border border-emerald-500'
              }">${cell.severity}</span>
            </div>
            <div class="text-[11px] text-slate-300 mt-1">
              Risk Score: <strong class="text-white">${cell.riskScore}/100</strong> • Rainfall: <strong>${cell.rainfallIntensityMmHr} mm/h</strong>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              Deformation: +${cell.terrainDeformationMmMonth} mm/mo | Slope: ${cell.slopeDegrees}°
            </div>
          </div>
        `, { sticky: true });

        lg.addLayer(circle);

        // Marker center pin
        const pinIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-[9px] text-white ${
            cell.severity === 'critical' ? 'bg-red-600' :
            cell.severity === 'high' ? 'bg-orange-500' :
            cell.severity === 'moderate' ? 'bg-yellow-500 text-slate-900' : 'bg-emerald-600'
          }">${cell.riskScore}</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const pinMarker = L.marker([cell.lat, cell.lng], { icon: pinIcon });
        pinMarker.on('click', () => onSelectZone(cell));
        lg.addLayer(pinMarker);
      });
    }

    // 2. Road Lifelines & Blockages
    if (showRoads) {
      roads.forEach((r) => {
        if (r.blockageLocation) {
          const roadColor = r.status === 'fully_blocked' ? '#dc2626' : 
                           r.status === 'partially_blocked' ? '#ea580c' : 
                           r.status === 'high_hazard_warning' ? '#f59e0b' : '#10b981';

          const iconHtml = `<div class="w-6 h-6 rounded-md bg-slate-950 border-2 flex items-center justify-center shadow-lg" style="border-color: ${roadColor}">
            <span class="text-[10px] font-bold" style="color: ${roadColor}">⛔</span>
          </div>`;

          const roadIcon = L.divIcon({
            className: 'custom-road-icon',
            html: iconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const roadMarker = L.marker([r.blockageLocation.lat, r.blockageLocation.lng], { icon: roadIcon });
          roadMarker.bindPopup(`
            <div class="font-sans text-xs bg-slate-900 text-slate-100 p-2.5 rounded max-w-[220px]">
              <div class="font-bold text-white">${r.name}</div>
              <div class="text-[11px] text-red-400 font-semibold mt-1 uppercase">${r.status.replace('_', ' ')}</div>
              <p class="text-[11px] text-slate-300 mt-1">${r.stretch}</p>
              <div class="mt-2 pt-1.5 border-t border-slate-700 text-[10px] text-slate-400">
                Detour: <span class="text-cyan-300">${r.alternateRoute || 'None'}</span>
              </div>
            </div>
          `);
          lg.addLayer(roadMarker);
        }
      });
    }

    // 3. IoT Sensor Markers
    if (showSensors) {
      sensors.forEach((s) => {
        const sensorColor = s.status === 'active' ? '#06b6d4' : s.status === 'warning' ? '#f59e0b' : '#ef4444';
        const sensorIcon = L.divIcon({
          className: 'custom-sensor-icon',
          html: `<div class="w-5 h-5 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow" style="border-color: ${sensorColor}">
            <div class="w-2 h-2 rounded-full" style="background-color: ${sensorColor}"></div>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const sensorMarker = L.marker([s.lat, s.lng], { icon: sensorIcon });
        sensorMarker.bindPopup(`
          <div class="font-sans text-xs bg-slate-900 text-slate-100 p-2 rounded">
            <div class="font-bold text-cyan-300">${s.name}</div>
            <div class="text-[11px] text-slate-300 mt-1">Type: <strong>${s.type}</strong></div>
            <div class="text-[11px] text-slate-400">Battery: <strong>${s.batteryPercent}%</strong> • Signal: ${s.signalDbm} dBm</div>
            <div class="text-[10px] text-slate-500 mt-1">Last ping: ${s.lastTransmission}</div>
          </div>
        `);
        lg.addLayer(sensorMarker);
      });
    }

    // 4. Field Reports
    if (showReports) {
      reports.forEach((rep) => {
        const repIcon = L.divIcon({
          className: 'custom-report-icon',
          html: `<div class="w-6 h-6 rounded-full bg-purple-950 border-2 border-purple-400 text-purple-200 flex items-center justify-center shadow-lg text-[11px]">
            📸
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const repMarker = L.marker([rep.lat, rep.lng], { icon: repIcon });
        repMarker.bindPopup(`
          <div class="font-sans text-xs bg-slate-900 text-slate-100 p-2.5 rounded max-w-[240px]">
            <div class="font-bold text-purple-300">${rep.incidentType}</div>
            <div class="text-[10px] text-slate-400">${rep.locationName} (${rep.timestamp})</div>
            <p class="text-[11px] text-slate-300 mt-1.5 line-clamp-2">${rep.description}</p>
            ${rep.aiClassification ? `
              <div class="mt-2 p-1.5 rounded bg-purple-950/60 border border-purple-800 text-[10px] text-purple-200">
                AI Vision: <strong>${rep.aiClassification.severityEstimate}</strong> (${(rep.aiClassification.confidence * 100).toFixed(0)}%)
              </div>
            ` : ''}
          </div>
        `);
        lg.addLayer(repMarker);
      });
    }

  }, [visibleCells, sensors, roads, reports, showHeatmap, showSensors, showRoads, showReports, selectedZone]);

  return (
    <div className="relative w-full h-[78vh] min-h-[540px] rounded-xl overflow-hidden border border-slate-800 bg-[#070b12] shadow-2xl flex">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls (Top-Left) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Style Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 flex items-center gap-1 shadow-lg text-xs">
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mapStyle === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark Carto
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mapStyle === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sentinel Satellite
          </button>
          <button
            onClick={() => setMapStyle('terrain')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mapStyle === 'terrain' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Topographic DEM
          </button>
        </div>

        {/* Layer Checkbox Toggles */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2 flex flex-col gap-1.5 shadow-lg text-xs">
          <div className="text-[10px] uppercase font-sans tracking-wider text-slate-400 font-semibold px-1">
            GIS Layers
          </div>
          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer px-1">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0"
            />
            <span>Landslide Risk Heatmap</span>
          </label>
          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer px-1">
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-red-500 focus:ring-0"
            />
            <span>Road Lifelines & Blockages</span>
          </label>
          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer px-1">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-cyan-400 focus:ring-0"
            />
            <span>IoT Sensors (Tilt/Pore/ESP32)</span>
          </label>
          <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer px-1">
            <input
              type="checkbox"
              checked={showReports}
              onChange={(e) => setShowReports(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-purple-400 focus:ring-0"
            />
            <span>Field Incident Reports (AI Vision)</span>
          </label>
        </div>
      </div>

      {/* Floating Temporal Risk Slider (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl text-xs">
        <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-[11px] font-sans text-slate-300 hidden sm:inline">Temporal Horizon:</span>
        <div className="flex items-center gap-1">
          {[
            { id: '-3h', label: '-3h Historical' },
            { id: '-1h', label: '-1h Prev' },
            { id: 'now', label: 'Current Live' },
            { id: '+6h_forecast', label: '+6h Forecast' },
            { id: '+24h_forecast', label: '+24h Forecast' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTemporalStep(item.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                temporalStep === item.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 hidden md:flex flex-col gap-1.5 shadow-lg text-[11px]">
        <div className="text-[10px] uppercase font-sans tracking-wider text-slate-400 font-semibold">
          Risk Classification
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          <span className="text-slate-200 font-medium">Critical (76-100) — Immediate Evacuation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-slate-200 font-medium">High (51-75) — Prepare Response Teams</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-slate-200 font-medium">Moderate (26-50) — High Surveillance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-200 font-medium">Low (0-25) — Normal Baseline</span>
        </div>
      </div>

      {/* Zone Inspection Slide-Over Panel (Right Side) */}
      {selectedZone && (
        <div className="absolute top-0 right-0 h-full w-full max-w-md z-20 bg-[#0d1424]/95 backdrop-blur-md border-l border-slate-700/80 shadow-2xl overflow-y-auto p-5 text-slate-100 flex flex-col justify-between animate-slide-in">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-cyan-400">
                  {selectedZone.cellCode} • {selectedZone.district}, {selectedZone.state}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedZone.name}
                </h3>
              </div>
              <button
                onClick={() => onSelectZone(null as any)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Badge & Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                selectedZone.severity === 'critical' ? 'bg-red-950/60 border-red-500/60 text-red-100' :
                selectedZone.severity === 'high' ? 'bg-orange-950/60 border-orange-500/60 text-orange-100' :
                'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
              }`}>
                <span className="text-[10px] uppercase font-sans tracking-wider text-slate-400">
                  Landslide Risk Index
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight font-sans">
                    {selectedZone.riskScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <span className="text-xs font-bold uppercase mt-1">
                  {selectedZone.severity} Hazard
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-sans tracking-wider text-slate-400">
                  Model Confidence & Trend
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-cyan-300 font-sans">
                    {(selectedZone.predictionConfidence * 100).toFixed(0)}%
                  </span>
                  <div className="text-[11px] text-amber-400 font-medium capitalize mt-0.5">
                    {selectedZone.riskTrend.replace('_', ' ')}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Ensemble XGBoost-RF</span>
              </div>
            </div>

            {/* Geotechnical & Environmental Parameters */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans border-b border-slate-800 pb-1">
                Real-Time Physical Telemetry
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px]">Hourly Rain Intensity</span>
                  <div className="font-semibold text-cyan-300">{selectedZone.rainfallIntensityMmHr} mm/h</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">72h Cumulative Rain</span>
                  <div className="font-semibold text-white">{selectedZone.cumulativeRainfall72hMm} mm</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Soil Moisture Saturation</span>
                  <div className="font-semibold text-amber-300">{selectedZone.surfaceSoilMoisturePercent}%</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Pore Pressure (Piezometer)</span>
                  <div className="font-semibold text-red-300">{selectedZone.poreWaterPressureKPa} kPa</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Slope Angle & Aspect</span>
                  <div className="font-semibold text-slate-200">{selectedZone.slopeDegrees}° ({selectedZone.slopeAspect})</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">InSAR Ground Displacement</span>
                  <div className="font-semibold text-red-400 font-sans">+{selectedZone.terrainDeformationMmMonth} mm/mo</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[10px]">Geology & Lithology:</span>
                <p className="text-slate-200 text-[11px] font-medium mt-0.5">{selectedZone.geologyType}</p>
              </div>
            </div>

            {/* Primary Contributing Factors */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans mb-2">
                Primary Trigger Drivers
              </div>
              <ul className="space-y-1.5">
                {(selectedZone.primaryContributingFactors || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exposed Assets */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans">
                Exposed Population & Lifelines
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Estimated Exposed Population:</span>
                <span className="font-bold text-red-300">{(selectedZone.populationExposed || 0).toLocaleString()} people</span>
              </div>
              <div className="text-[11px]">
                <span className="text-slate-400">Impacted Villages: </span>
                <span className="text-slate-200">{selectedZone.affectedVillages?.join(', ') || 'No direct settlements identified'}</span>
              </div>
              <div className="text-[11px]">
                <span className="text-slate-400">Highways / Tracks: </span>
                <span className="text-cyan-300">{selectedZone.affectedRoads?.join(', ') || 'Local feeder roads only'}</span>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-red-300 uppercase font-sans text-[11px] mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Recommended Disaster Directive</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {selectedZone.recommendedAction}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-2 mt-4">
            <button
              onClick={() => alert(`Broadcasting targeted SMS & siren alert for ${selectedZone.name} to ${selectedZone.populationExposed} residents.`)}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950 transition-colors"
            >
              Broadcast Zone Evacuation Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
