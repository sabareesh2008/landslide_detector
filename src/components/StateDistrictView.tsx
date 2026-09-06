import React, { useState } from 'react';
import { GridCellRisk, NEState } from '../types';
import { NE_STATES, STATE_DISTRICTS } from '../data/mockData';
import { 
  MapPin, 
  Mountain, 
  Droplets, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface StateDistrictViewProps {
  cells: GridCellRisk[];
  selectedState: NEState | 'All NE States';
  onSelectState: (state: NEState) => void;
  onSelectZone: (cell: GridCellRisk) => void;
}

export const StateDistrictView: React.FC<StateDistrictViewProps> = ({
  cells,
  selectedState,
  onSelectState,
  onSelectZone
}) => {
  const activeState = selectedState === 'All NE States' ? 'Sikkim' : selectedState;
  const [activeDistrict, setActiveDistrict] = useState<string>('All Districts');

  const stateCells = cells.filter(c => c.state === activeState);
  const filteredCells = activeDistrict === 'All Districts' 
    ? stateCells 
    : stateCells.filter(c => c.district === activeDistrict);

  const districts = STATE_DISTRICTS[activeState] || [];

  // Elevation & Slope Profile Data for the active state
  const districtRiskData = districts.map(d => {
    const dCells = stateCells.filter(c => c.district === d);
    const avgRisk = dCells.length > 0 
      ? Math.round(dCells.reduce((a, b) => a + b.riskScore, 0) / dCells.length) 
      : 30;
    const maxRain = dCells.length > 0 
      ? Math.max(...dCells.map(c => c.rainfallIntensityMmHr)) 
      : 15;
    return {
      district: d,
      avgRisk,
      maxRain
    };
  });

  return (
    <div className="space-y-6">
      {/* 8-State Quick Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {NE_STATES.map((st) => (
          <button
            key={st}
            onClick={() => {
              onSelectState(st);
              setActiveDistrict('All Districts');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeState === st
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{st}</span>
          </button>
        ))}
      </div>

      {/* State Overview KPI Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-sans text-cyan-400 uppercase tracking-wider font-semibold">
              State Geospatial Profile
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {activeState} Landslide Hazard Assessment
            </h2>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Districts" className="bg-slate-900">All Districts ({districts.length})</option>
              {districts.map(d => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* State Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans">Monitored Catchments</span>
            <div className="text-lg font-bold text-white font-sans mt-0.5">{stateCells.length} Grid Zones</div>
          </div>
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40">
            <span className="text-red-400 text-[10px] uppercase font-sans">Critical Red Alert</span>
            <div className="text-lg font-bold text-red-200 font-sans mt-0.5">
              {stateCells.filter(c => c.severity === 'critical').length} Zones
            </div>
          </div>
          <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-500/40">
            <span className="text-orange-400 text-[10px] uppercase font-sans">High Risk Zones</span>
            <div className="text-lg font-bold text-orange-200 font-sans mt-0.5">
              {stateCells.filter(c => c.severity === 'high').length} Zones
            </div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40">
            <span className="text-cyan-400 text-[10px] uppercase font-sans">Exposed Hill Population</span>
            <div className="text-lg font-bold text-cyan-200 font-sans mt-0.5">
              {stateCells.reduce((a, b) => a + b.populationExposed, 0).toLocaleString()} Pax
            </div>
          </div>
        </div>
      </div>

      {/* District Vulnerability Ranking Chart */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          District-Level Landslide Susceptibility Index ({activeState})
        </h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtRiskData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="district" stroke="#64748b" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              />
              <Bar dataKey="avgRisk" name="Average Risk Score (0-100)" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Cells Cards for Active State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCells.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectZone(c)}
            className={`p-4 rounded-xl border cursor-pointer transition-all shadow-lg flex flex-col justify-between ${
              c.severity === 'critical' ? 'bg-red-950/20 border-red-500/50 hover:border-red-400' :
              c.severity === 'high' ? 'bg-orange-950/20 border-orange-500/50 hover:border-orange-400' :
              'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-sans text-cyan-400 uppercase">
                    {c.cellCode} • {c.district}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{c.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-sans tracking-tight text-white">
                    {c.riskScore}
                  </span>
                  <span className="text-[10px] text-slate-400">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Elevation</span>
                  <span className="text-slate-200 font-semibold">{c.elevationMeters} m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Slope Angle</span>
                  <span className="text-slate-200 font-semibold">{c.slopeDegrees}° ({c.slopeAspect})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Pore Pressure</span>
                  <span className="text-red-300 font-semibold">{c.poreWaterPressureKPa} kPa</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Deformation</span>
                  <span className="text-amber-300 font-semibold">+{c.terrainDeformationMmMonth} mm/mo</span>
                </div>
              </div>

              <div className="mt-2.5 text-[11px] text-slate-300">
                <span className="text-slate-500 text-[10px] uppercase font-sans block">Geology:</span>
                <span className="line-clamp-1">{c.geologyType}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{c.affectedVillages.length} Villages Exposed</span>
              <span className="text-cyan-400 font-medium flex items-center gap-1">
                Inspect Zone <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
