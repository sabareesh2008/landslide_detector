import React from 'react';
import { 
  CloudRain, 
  Droplets, 
  Wind, 
  Compass, 
  AlertTriangle, 
  Activity, 
  Calendar,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { LiveRainfallTracker } from './LiveRainfallTracker';

export const WeatherForecastView: React.FC = () => {
  const sevenDayForecast = [
    { day: 'Wed (Today)', rainMm: 120, cloudburstRisk: 'Extreme', soilSat: 94 },
    { day: 'Thu', rainMm: 145, cloudburstRisk: 'Extreme', soilSat: 98 },
    { day: 'Fri', rainMm: 95, cloudburstRisk: 'High', soilSat: 91 },
    { day: 'Sat', rainMm: 70, cloudburstRisk: 'Moderate', soilSat: 84 },
    { day: 'Sun', rainMm: 45, cloudburstRisk: 'Low', soilSat: 76 },
    { day: 'Mon', rainMm: 30, cloudburstRisk: 'Low', soilSat: 68 },
    { day: 'Tue', rainMm: 25, cloudburstRisk: 'Low', soilSat: 62 },
  ];

  const hourlyRadar = [
    { time: '06:00', intensity: 32, reflectivityDbz: 48 },
    { time: '09:00', intensity: 45, reflectivityDbz: 52 },
    { time: '12:00', intensity: 58, reflectivityDbz: 56 },
    { time: '15:00', intensity: 65, reflectivityDbz: 60 },
    { time: '18:00', intensity: 52, reflectivityDbz: 54 },
    { time: '21:00', intensity: 38, reflectivityDbz: 50 },
    { time: '00:00', intensity: 28, reflectivityDbz: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Live Rainfall Tracker — real data from your pipeline / manual entries */}
      <LiveRainfallTracker />

      {/* Banner */}
      <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs uppercase font-semibold">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span>IMD Doppler Radar & Numerical Weather Prediction (NWP) — Regional Simulation Model</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Precipitation Forecast, Antecedent Soil Moisture & Cloudburst Alert
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coupled hydrological trigger modeling for North Eastern mountain slopes. This section below uses
            illustrative simulated data — see the Live Rainfall Tracker above for real observations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-sans">
            ⚠️ Monsoon Active Surge: Red Advisory
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Rainfall Accumulation */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              7-Day IMD Rainfall Accumulation (mm)
            </h3>
            <span className="text-xs text-slate-400">Regional Average</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDayForecast} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="rainMm" name="Rainfall (mm)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doppler Radar Reflectivity & Intensity */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              IMD Doppler Radar Hourly Storm Intensity (mm/h)
            </h3>
            <span className="text-xs text-cyan-300 font-sans">Max 65 mm/h</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyRadar} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="dopplerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
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
                  dataKey="intensity" 
                  name="Rain Intensity (mm/h)" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#dopplerGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cloudburst & Hydrological Vulnerability Hotspots */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { spot: 'Sohra / Cherrapunji', state: 'Meghalaya', rain24h: '280 mm', status: 'Red Alert' },
          { spot: 'Mawsynram Valley', state: 'Meghalaya', rain24h: '310 mm', status: 'Red Alert' },
          { spot: 'Pasighat Foothills', state: 'Arunachal Pradesh', rain24h: '190 mm', status: 'Orange Alert' },
          { spot: 'Tamenglong Highlands', state: 'Manipur', rain24h: '175 mm', status: 'Orange Alert' },
        ].map((h, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{h.spot}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-500">
                {h.status}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">{h.state}</span>
            <div className="text-xs text-cyan-300 font-sans font-semibold pt-1">
              24h Rain: {h.rain24h}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
