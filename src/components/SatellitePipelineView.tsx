import React from 'react';
import { PIPELINE_STEPS } from '../data/mockData';
import { 
  Satellite, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  Database, 
  Layers, 
  Cpu, 
  Radio, 
  RefreshCw,
  Server,
  CloudRain
} from 'lucide-react';

interface SatellitePipelineViewProps {
  onForceIngest: () => void;
  secondsRemaining: number;
}

export const SatellitePipelineView: React.FC<SatellitePipelineViewProps> = ({
  onForceIngest,
  secondsRemaining
}) => {
  return (
    <div className="space-y-6">
      {/* Pipeline Status Summary Banner */}
      <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs uppercase font-semibold">
            <Satellite className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Automated Hourly Ingestion & Processing Architecture</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Sentinel-1/2 SAR, IMD Weather Radar & ISRO Bhuvan Ingest Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            10-Step autonomous geospatial extraction, distortion correction, feature fusion, and machine learning inference.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Next Scheduled Ingest Cycle</div>
            <div className="text-sm font-bold text-cyan-300 font-sans">
              {Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s
            </div>
          </div>

          <button
            onClick={onForceIngest}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Pipeline Ingest</span>
          </button>
        </div>
      </div>

      {/* Satellite Feeds Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase text-slate-400">Sentinel-1 SAR</span>
            <div className="font-bold text-white text-xs mt-0.5">InSAR Ground Movement</div>
            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-sans bg-emerald-950 text-emerald-300 border border-emerald-500">
              ● NOMINAL (12-day orbit)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase text-slate-400">Sentinel-2 MSI</span>
            <div className="font-bold text-white text-xs mt-0.5">NDVI & Soil Moisture</div>
            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-sans bg-emerald-950 text-emerald-300 border border-emerald-500">
              ● NOMINAL (Cloud-Masked)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase text-slate-400">IMD Doppler Radar</span>
            <div className="font-bold text-white text-xs mt-0.5">GPM Precipitation Feed</div>
            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-sans bg-emerald-950 text-emerald-300 border border-emerald-500">
              ● LIVE STREAMING
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase text-slate-400">ISRO Bhuvan GIS</span>
            <div className="font-bold text-white text-xs mt-0.5">30m DEM & Geological Maps</div>
            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-sans bg-emerald-950 text-emerald-300 border border-emerald-500">
              ● CONNECTED
            </span>
          </div>
        </div>
      </div>

      {/* 10-Step Interactive Pipeline Flow */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            10-Stage Geospatial Processing Pipeline Execution
          </h3>
          <span className="text-xs text-emerald-400 font-sans">
            Total Cycle Latency: 2.49s (100% Complete)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.id}
              className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-bold font-sans text-xs flex items-center justify-center shrink-0 mt-0.5">
                {step.id}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{step.name}</h4>
                  <span className="text-[10px] font-sans text-cyan-400 shrink-0">
                    {step.latencyMs} ms
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-300 font-sans">{step.detail}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failover & Missing Data Policy Box */}
      <div className="bg-[#111827] border border-amber-500/40 rounded-xl p-4 shadow-xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300 font-sans uppercase">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Strict Missing Data & Latency Fallback Protocol</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          If hourly Sentinel or IMD granules encounter temporary satellite occlusions or API timeouts: the platform marks the grid cell as <span className="font-sans text-amber-300">[SATELLITE DATA DELAYED]</span>, retains the latest verified physical observation vector, flags it as outdated, and initiates 3 exponential backoff retries. Fabricated replacement values are strictly disallowed to prevent false positive evacuations.
        </p>
      </div>
    </div>
  );
};
