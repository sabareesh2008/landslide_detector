import React from 'react';
import { 
  GridCellRisk, 
  SensorNode, 
  RoadCorridor, 
  FieldReport, 
  EarlyWarningAlert, 
  EmergencyTask, 
  NEState 
} from '../types';
import { NE_STATES } from '../data/mockData';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  Radio, 
  Truck, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useI18n } from '../i18n/I18nContext';

interface RegionalCommandViewProps {
  cells: GridCellRisk[];
  sensors: SensorNode[];
  roads: RoadCorridor[];
  reports: FieldReport[];
  alerts: EarlyWarningAlert[];
  tasks: EmergencyTask[];
  onSelectState: (state: NEState) => void;
  onSelectZone: (cell: GridCellRisk) => void;
  onNavigateTab: (tab: string) => void;
}

export const RegionalCommandView: React.FC<RegionalCommandViewProps> = ({
  cells,
  sensors,
  roads,
  reports,
  tasks,
  onSelectState,
  onSelectZone,
  onNavigateTab
}) => {
  const { t } = useI18n();

  const criticalCells = cells.filter(c => c.severity === 'critical');
  const highCells = cells.filter(c => c.severity === 'high');
  const blockedRoads = roads.filter(r => r.status === 'fully_blocked' || r.status === 'partially_blocked');
  const activeSensors = sensors.filter(s => s.status === 'active');
  const faultySensors = sensors.filter(s => s.status === 'faulty' || s.status === 'warning');
  const totalExposedPop = cells.reduce((acc, c) => acc + (c.severity === 'critical' || c.severity === 'high' ? c.populationExposed : 0), 0);

  // Rainfall vs Risk Correlation Data for Chart
  const chartData = [
    { time: '00:00', rainfall: 12, riskAvg: 38, soilMoisture: 65 },
    { time: '01:00', rainfall: 22, riskAvg: 48, soilMoisture: 72 },
    { time: '02:00', rainfall: 35, riskAvg: 62, soilMoisture: 81 },
    { time: '03:00', rainfall: 48, riskAvg: 79, soilMoisture: 89 },
    { time: '04:00 (Now)', rainfall: 54, riskAvg: 86, soilMoisture: 93 },
    { time: '+1h (Fcst)', rainfall: 42, riskAvg: 88, soilMoisture: 95 },
    { time: '+2h (Fcst)', rainfall: 30, riskAvg: 82, soilMoisture: 92 },
    { time: '+3h (Fcst)', rainfall: 18, riskAvg: 74, soilMoisture: 86 }
  ];

  // State-wise risk tally
  const stateMatrix = NE_STATES.map((st) => {
    const stCells = cells.filter(c => c.state === st);
    const critical = stCells.filter(c => c.severity === 'critical').length;
    const high = stCells.filter(c => c.severity === 'high').length;
    const maxRisk = stCells.length > 0 ? Math.max(...stCells.map(c => c.riskScore)) : 20;
    const avgRain = stCells.length > 0 ? (stCells.reduce((a, b) => a + b.rainfallIntensityMmHr, 0) / stCells.length).toFixed(1) : '0';
    return {
      state: st,
      totalCells: stCells.length,
      critical,
      high,
      maxRisk,
      avgRain
    };
  });

  return (
    <div className="space-y-6">
      {/* Top High-Level KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#111827] border border-red-500/40 rounded-xl p-3.5 shadow-lg shadow-red-950/20">
          <div className="flex items-center justify-between text-red-400 text-xs">
            <span className="font-sans uppercase font-bold text-[11px] tracking-wide">{t('criticalSectors')}</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans tracking-tight text-white">
              {criticalCells.length}
            </span>
            <span className="text-xs text-red-400 font-medium">{t('critical')}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            + {highCells.length} {t('high')}
          </div>
        </div>

        <div className="bg-[#111827] border border-orange-500/40 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-orange-400 text-xs">
            <span className="font-sans uppercase font-bold text-[11px] tracking-wide">{t('exposedPopulation')}</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans tracking-tight text-white">
              {(totalExposedPop / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400">citizens</span>
          </div>
          <div className="text-[11px] text-orange-300 mt-1">
            {t('highRiskVillages')}
          </div>
        </div>

        <div className="bg-[#111827] border border-amber-500/40 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span className="font-sans uppercase font-bold text-[11px] tracking-wide">{t('blockedRoads')}</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans tracking-tight text-white">
              {blockedRoads.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">{t('highwayStatusBlocked')}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            NH-10, NH-29, NH-37
          </div>
        </div>

        <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400 text-xs">
            <span className="font-sans uppercase font-bold text-[11px] tracking-wide">{t('iotSensorsActive')}</span>
            <Radio className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans tracking-tight text-white">
              {activeSensors.length} / {sensors.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">{t('onlineStatus')}</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            {faultySensors.length} in Alert/Warning
          </div>
        </div>

        <div className="bg-[#111827] border border-purple-500/40 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-purple-400 text-xs">
            <span className="font-sans uppercase font-bold text-[11px] tracking-wide">{t('navFieldVision')}</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans tracking-tight text-white">
              {reports.length}
            </span>
            <span className="text-xs text-purple-300 font-medium">{t('verifiedOfficial')}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('aiClassification')}
          </div>
        </div>

        <div className="bg-[#111827] border border-emerald-500/40 rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span className="font-sans uppercase font-bold text-[11px] tracking-wide">{t('priorityDispatchTasks')}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans tracking-tight text-white">
              {tasks.filter(t => t.status === 'dispatched' || t.status === 'active_rescue').length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">{t('statusDispatched')}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            NDRF, SDRF & BRO
          </div>
        </div>
      </div>

      {/* Main Charts & State Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall Intensity vs Landslide Risk Curve (2 Cols) */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                {t('riskFactorCurve')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('livePrecipitationRadar')}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-sans font-semibold text-cyan-300">
              Live AI Model Ensemble
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="riskAvg" 
                  name={t('colRiskScore')} 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#riskGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="rainfall" 
                  name={t('colRain72h')} 
                  stroke="#06b6d4" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#rainGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500"></span>
              <span className="text-slate-300">{t('critical')}: <strong className="text-white">03:00 - 06:00 AM</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-500"></span>
              <span className="text-slate-300">Max Rain: <strong className="text-cyan-300">58 mm/h (Sohra)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span className="text-slate-300">{t('saturationLevel')}: <strong className="text-amber-300">96% Critical</strong></span>
            </div>
          </div>
        </div>

        {/* 8 North Eastern States Risk Matrix */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                {t('allStates')} {t('colRiskScore')}
              </h3>
              <span className="text-[11px] text-slate-400">{t('navStateDistrict')}</span>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {stateMatrix.map((st) => (
                <div
                  key={st.state}
                  onClick={() => {
                    onSelectState(st.state);
                    onNavigateTab('state_drilldown');
                  }}
                  className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                      <span>{st.state}</span>
                      {st.critical > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 text-red-300 border border-red-500">
                          {st.critical} {t('critical')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {t('colRain72h')}: {st.avgRain} mm/h
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white font-sans">
                        Max {st.maxRisk}/100
                      </div>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${
                            st.maxRisk >= 76 ? 'bg-red-500' :
                            st.maxRisk >= 51 ? 'bg-orange-500' :
                            st.maxRisk >= 26 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${st.maxRisk}%` }}
                        />
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('gis')}
            className="w-full mt-4 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-colors"
          >
            {t('viewGISMapBtn')}
          </button>
        </div>
      </div>

      {/* Bottom Section: Active Critical Zones & Emergency Dispatch Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Hazard Micro-Zones List */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              {t('prioritySlopeSectors')}
            </h3>
            <span className="text-xs text-red-400 font-sans font-semibold">
              {criticalCells.length} {t('critical')}
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {criticalCells.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectZone(c)}
                className="p-3 rounded-lg bg-red-950/20 border border-red-500/40 hover:border-red-400 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-sans font-semibold text-cyan-400 uppercase tracking-wide">
                      {c.cellCode} • {c.district}, {c.state}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{c.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-red-400 font-sans">
                      {c.riskScore}
                    </span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                  {c.primaryContributingFactors[0]}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-950/60 text-[11px]">
                  <span className="text-slate-400">
                    {t('colRain72h')}: <strong className="text-white">{c.rainfallIntensityMmHr} mm/h</strong> • {t('colSlope')}: <strong className="text-white">{c.slopeDegrees}°</strong>
                  </span>
                  <span className="text-red-300 font-medium">
                    {c.populationExposed.toLocaleString()} {t('exposedPopulation')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Response & Tactical Dispatch Priorities */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              {t('eocTitle')}
            </h3>
            <span className="text-xs text-slate-400 font-sans">
              {t('dispatchRank')}
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {tasks.map((tItem) => (
              <div key={tItem.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-900/80 border border-red-500/60 text-red-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{tItem.priorityRank}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{tItem.title}</h4>
                      <span className="text-[10px] text-slate-400">{tItem.district}, {tItem.state}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    tItem.status === 'active_rescue' ? 'bg-red-950 text-red-300 border border-red-500' :
                    tItem.status === 'dispatched' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {tItem.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {tItem.requiredAction}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-cyan-300 font-medium">
                    {t('assignedUnit')}: {tItem.assignedTeam.name} ({tItem.assignedTeam.members} Pax)
                  </span>
                  <span className="text-slate-400">
                    {t('estimatedArrival')}: <strong className="text-white">{tItem.assignedTeam.estimatedArrivalMins} mins</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
