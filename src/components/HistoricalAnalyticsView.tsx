import React from 'react';
import { HISTORICAL_EVENTS } from '../data/mockData';
import { 
  Database, 
  TrendingUp, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Award, 
  History, 
  FileText 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid,
  Line 
} from 'recharts';

export const HistoricalAnalyticsView: React.FC = () => {
  // GSI Rainfall Intensity-Duration Trigger Curve Data points
  const thresholdCurveData = [
    { durationHours: 1, rainIntensityMmHr: 58, type: 'Trigger Threshold' },
    { durationHours: 6, rainIntensityMmHr: 34, type: 'Trigger Threshold' },
    { durationHours: 12, rainIntensityMmHr: 22, type: 'Trigger Threshold' },
    { durationHours: 24, rainIntensityMmHr: 14, type: 'Trigger Threshold' },
    { durationHours: 48, rainIntensityMmHr: 9, type: 'Trigger Threshold' },
    { durationHours: 72, rainIntensityMmHr: 6.5, type: 'Trigger Threshold' },
  ];

  const historicalScatter = [
    { durationHours: 18, rainIntensityMmHr: 42, event: 'Tupul Manipur (2022)', fatal: 58 },
    { durationHours: 36, rainIntensityMmHr: 38, event: 'Chungthang Sikkim (2023)', fatal: 42 },
    { durationHours: 24, rainIntensityMmHr: 45, event: 'Sohra Meghalaya (2021)', fatal: 14 },
    { durationHours: 12, rainIntensityMmHr: 28, event: 'Dimapur Nagaland (2023)', fatal: 4 },
    { durationHours: 8, rainIntensityMmHr: 16, event: 'Aizawl Mizoram (2020)', fatal: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs uppercase font-semibold">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Geological Survey of India (GSI) & ISRO Historical Inventory</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Historical Landslide Database & Geotechnical Threshold Calibration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated against 10+ years of North East India cloudburst and slope-failure records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-sans">
            Model ROC-AUC: 0.942
          </span>
        </div>
      </div>

      {/* Model Performance Validation Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400 uppercase font-sans text-[10px]">Precision Rate</span>
          <div className="text-2xl font-bold font-sans tracking-tight text-emerald-400 mt-1">91.8%</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Minimal false-alarm rate</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400 uppercase font-sans text-[10px]">Recall / Detection</span>
          <div className="text-2xl font-bold font-sans tracking-tight text-cyan-400 mt-1">95.4%</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Critical slope failures caught</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400 uppercase font-sans text-[10px]">F1-Score</span>
          <div className="text-2xl font-bold font-sans tracking-tight text-indigo-400 mt-1">0.935</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Weighted harmonic mean</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400 uppercase font-sans text-[10px]">Lead Warning Time</span>
          <div className="text-2xl font-bold font-sans tracking-tight text-amber-400 mt-1">6 to 12 Hours</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Before catastrophic shear</span>
        </div>
      </div>

      {/* Historical Incidents Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            North East Landmark Landslide Event Archive
          </h3>
          <span className="text-xs text-slate-400">GSI Disaster Archive</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-sans text-[10px]">
                <th className="pb-2.5">Date & Event</th>
                <th className="pb-2.5">State & Location</th>
                <th className="pb-2.5">72h Rainfall</th>
                <th className="pb-2.5">Casualties</th>
                <th className="pb-2.5">Primary Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {HISTORICAL_EVENTS.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 font-semibold text-white">
                    {e.location} ({e.date})
                  </td>
                  <td className="py-3 text-cyan-300">{e.state}</td>
                  <td className="py-3 font-sans">{e.rainfallMm} mm</td>
                  <td className="py-3">
                    <span className="font-bold text-red-400">{e.casualties}</span>
                  </td>
                  <td className="py-3 text-slate-400">{e.mechanism}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
