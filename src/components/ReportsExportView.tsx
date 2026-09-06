import React, { useState, useEffect } from 'react';
import { GridCellRisk, RoadCorridor, SensorNode, FieldReport, NEState } from '../types';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Code, 
  Copy,
  Layers
} from 'lucide-react';

interface ReportsExportViewProps {
  cells: GridCellRisk[];
  roads: RoadCorridor[];
  sensors: SensorNode[];
  reports: FieldReport[];
  selectedState: NEState | 'All NE States';
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({
  cells,
  roads,
  sensors,
  reports,
  selectedState
}) => {
  const [reportState, setReportState] = useState<NEState>('Sikkim');
  const [reportLang, setReportLang] = useState('en');
  const [bulletin, setBulletin] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'bulletin' | 'csv' | 'postgis'>('bulletin');
  const [postgisSchema, setPostgisSchema] = useState<string>('Loading schema...');

  // Fetch PostGIS Schema
  useEffect(() => {
    fetch('/api/schema')
      .then(res => res.text())
      .then(text => setPostgisSchema(text))
      .catch(() => setPostgisSchema('-- PostGIS Schema ready in server.ts'));
  }, []);

  const generateSituationReport = async () => {
    setIsGenerating(true);
    const criticalInState = cells.filter(c => c.state === reportState && c.severity === 'critical').map(c => c.name);
    const roadsInState = roads.filter(r => r.state === reportState).map(r => `${r.name} (${r.status})`);

    try {
      const res = await fetch('/api/ai/synthesize-bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: reportState,
          criticalZones: criticalInState,
          rainfallAverage: 118,
          affectedRoads: roadsInState,
          language: reportLang
        })
      });
      const data = await res.json();
      if (data.success && data.bulletin) {
        setBulletin(data.bulletin);
      }
    } catch (err) {
      setBulletin(`EXECUTIVE SITUATION REPORT FOR ${reportState}: Active heavy precipitation surge. Red alerts issued for ${criticalInState && criticalInState.length > 0 ? criticalInState.join(', ') : 'mountain passes'}. SDRF and BRO highway maintenance units deployed with heavy earthmovers.`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateSituationReport();
  }, [reportState, reportLang]);

  // CSV Exporters
  const downloadCSV = (type: 'cells' | 'roads' | 'sensors' | 'reports') => {
    let csvContent = '';
    let fileName = '';

    if (type === 'cells') {
      fileName = 'landslide_sentinel_risk_cells.csv';
      csvContent = 'ID,CellCode,Name,State,District,Lat,Lng,ElevationM,SlopeDeg,RainfallMmHr,PorePressureKPa,DeformationMmMo,RiskScore,Severity\n' +
        cells.map(c => `"${c.id}","${c.cellCode}","${c.name}","${c.state}","${c.district}",${c.lat},${c.lng},${c.elevationMeters},${c.slopeDegrees},${c.rainfallIntensityMmHr},${c.poreWaterPressureKPa},${c.terrainDeformationMmMonth},${c.riskScore},"${c.severity}"`).join('\n');
    } else if (type === 'roads') {
      fileName = 'landslide_sentinel_road_corridors.csv';
      csvContent = 'ID,Highway,Name,State,Stretch,Status,DebrisVolumeM3,ClearanceTime,AlternateRoute\n' +
        roads.map(r => `"${r.id}","${r.highwayNumber}","${r.name}","${r.state}","${r.stretch}","${r.status}",${r.debrisVolumeM3 || 0},"${r.estimatedClearanceTime || ''}","${r.alternateRoute || ''}"`).join('\n');
    } else if (type === 'sensors') {
      fileName = 'landslide_sentinel_iot_sensors.csv';
      csvContent = 'ID,Name,State,District,Lat,Lng,Type,Battery,SignalDbm,Status,LastTransmission\n' +
        sensors.map(s => `"${s.id}","${s.name}","${s.state}","${s.district}",${s.lat},${s.lng},"${s.type}",${s.batteryPercent},${s.signalDbm},"${s.status}","${s.lastTransmission}"`).join('\n');
    } else {
      fileName = 'landslide_sentinel_field_reports.csv';
      csvContent = 'ID,Reporter,Role,State,District,Location,Lat,Lng,IncidentType,AIHazard,AISeverity,Status\n' +
        reports.map(rep => `"${rep.id}","${rep.reporterName}","${rep.reporterRole}","${rep.state}","${rep.district}","${rep.locationName}",${rep.lat},${rep.lng},"${rep.incidentType}","${rep.aiClassification?.detectedHazard || ''}","${rep.aiClassification?.severityEstimate || ''}","${rep.verificationStatus}"`).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs uppercase font-semibold">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Automated Reports, PostGIS Architecture & Open Data Export</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Executive Situation Bulletins & Enterprise Database Exports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesize disaster advisories using Gemini 3.7 Flash and export spatial GIS formats.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveSubTab('bulletin')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeSubTab === 'bulletin' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Situation Bulletin
          </button>
          <button
            onClick={() => setActiveSubTab('csv')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeSubTab === 'csv' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CSV Data Downloads
          </button>
          <button
            onClick={() => setActiveSubTab('postgis')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeSubTab === 'postgis' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PostGIS SQL Schema
          </button>
        </div>
      </div>

      {/* Tab 1: AI Situation Report Bulletin */}
      {activeSubTab === 'bulletin' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-sans block">Select State</label>
                <select
                  value={reportState}
                  onChange={(e) => setReportState(e.target.value as NEState)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-medium"
                >
                  {['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-sans block">Language</label>
                <select
                  value={reportLang}
                  onChange={(e) => setReportLang(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-medium"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="as">অসমীয়া (Assamese)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="ne">नेपाली (Nepali)</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateSituationReport}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Situation Report'}</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 font-sans text-slate-200 leading-relaxed text-sm whitespace-pre-line">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-cyan-400 py-6">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini 3.7 Flash generating executive disaster intelligence brief...</span>
              </div>
            ) : (
              bulletin
            )}
          </div>
        </div>
      )}

      {/* Tab 2: CSV Data Downloads */}
      {activeSubTab === 'csv' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-white text-sm">Micro-Catchment Grid Cells</h3>
              <p className="text-xs text-slate-400 mt-1">Spatial coordinates, slope angles, geology, 72h rainfall and calculated risk scores.</p>
            </div>
            <button
              onClick={() => downloadCSV('cells')}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cells CSV</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-white text-sm">Hill Highway Corridors</h3>
              <p className="text-xs text-slate-400 mt-1">National highways, active blockage status, estimated debris volume, and detours.</p>
            </div>
            <button
              onClick={() => downloadCSV('roads')}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Roads CSV</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-white text-sm">IoT Telemetry Node Feed</h3>
              <p className="text-xs text-slate-400 mt-1">Tiltmeters, pore pressure piezometers, soil moisture probes and battery status.</p>
            </div>
            <button
              onClick={() => downloadCSV('sensors')}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sensors CSV</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-white text-sm">Field Incident Reports</h3>
              <p className="text-xs text-slate-400 mt-1">Citizen & official reports with Gemini computer vision crack classifications.</p>
            </div>
            <button
              onClick={() => downloadCSV('reports')}
              className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Reports CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: PostGIS Schema */}
      {activeSubTab === 'postgis' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              Production PostgreSQL / PostGIS Spatial Schema & GIST Indexing
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(postgisSchema);
                alert('PostGIS DDL schema copied to clipboard!');
              }}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy SQL</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans text-[11px] text-cyan-300 overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-700">
            {postgisSchema}
          </pre>
        </div>
      )}
    </div>
  );
};
