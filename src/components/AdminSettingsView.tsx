import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Settings, 
  ShieldCheck, 
  Sliders, 
  Radio, 
  Database, 
  Activity, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Key
} from 'lucide-react';

interface AdminSettingsViewProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  currentRole,
  onChangeRole
}) => {
  // Threshold Settings State
  const [rain1hThreshold, setRain1hThreshold] = useState(35);
  const [rain72hThreshold, setRain72hThreshold] = useState(180);
  const [porePressureThreshold, setPorePressureThreshold] = useState(45);
  const [deformationThreshold, setDeformationThreshold] = useState(25);
  const [autoSmsBroadcast, setAutoSmsBroadcast] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const auditLogs = [
    { time: '10:42 AM', user: 'DDMA Mangan (Er. T. Lepcha)', action: 'Dispatched SDRF Team Alpha to Chungthang Mile 42', ip: '103.24.18.9' },
    { time: '10:35 AM', user: 'System Worker (Pipeline-01)', action: 'Ingested Sentinel-1 InSAR interferogram (24 cells updated)', ip: '10.0.4.12' },
    { time: '10:20 AM', user: 'Citizen (P. Sharma)', action: 'Submitted field report: Road tension crack at Dympep', ip: '49.36.128.44' },
    { time: '09:55 AM', user: 'Admin (NEDMA Chief)', action: 'Issued Orange Level Precautionary Warning for NH-29', ip: '14.139.214.2' },
    { time: '09:00 AM', user: 'Cron Engine', action: 'Executed hourly GPM Doppler precipitation calibration', ip: '127.0.0.1' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs uppercase font-semibold">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Platform Governance, Role-Based Access & IoT Integrations</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            System Administration & Alert Trigger Calibration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure mathematical risk thresholds, manage multi-agency credentials, and monitor audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-sans">
            Access Level: {currentRole}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Thresholds & API Integrations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mathematical Threshold Settings */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-amber-400" />
              Early Warning Automated Trigger Thresholds
            </h3>

            <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">
                    1-Hour Rainfall Trigger (mm/h)
                  </label>
                  <input
                    type="number"
                    value={rain1hThreshold}
                    onChange={(e) => setRain1hThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard GSI Hill Threshold: 30-40 mm/h</span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    72-Hour Cumulative Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    value={rain72hThreshold}
                    onChange={(e) => setRain72hThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Antecedent Moisture Saturation</span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    Pore-Water Pressure (kPa)
                  </label>
                  <input
                    type="number"
                    value={porePressureThreshold}
                    onChange={(e) => setPorePressureThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Piezometer Shear Threshold</span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    InSAR Ground Creep (mm/month)
                  </label>
                  <input
                    type="number"
                    value={deformationThreshold}
                    onChange={(e) => setDeformationThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Interferometric Deformation</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSmsBroadcast}
                    onChange={(e) => setAutoSmsBroadcast(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0"
                  />
                  <span>Auto-Broadcast NDMA CAP-SMS to Exposed Mobile Cell Towers</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
                >
                  Save Thresholds
                </button>
              </div>

              {isSaved && (
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Threshold parameters updated across all 8 North Eastern state engines.</span>
                </div>
              )}
            </form>
          </div>

          {/* External Services & Telemetry Feeds */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              Connected Feeds & Telemetry Infrastructure
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Copernicus Sentinel Hub API', type: 'SAR / MSI', status: 'Connected (Latency 140ms)' },
                { name: 'IMD Doppler Weather Radar Feed', type: 'Precipitation', status: 'Connected (Latency 85ms)' },
                { name: 'ISRO Bhuvan Geo-Portal', type: 'CartoDEM & LULC', status: 'Connected (Latency 210ms)' },
                { name: 'MQTT IoT Sensor Broker (AWS IoT Core)', type: 'Telemetry', status: 'Connected (16 active nodes)' },
                { name: 'CDAC Common Alerting Protocol (CAP-SMS)', type: 'Broadcaster', status: 'Operational' },
              ].map((feed, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{feed.name}</span>
                    <span className="text-[10px] text-slate-500 block">{feed.type}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans bg-emerald-950 text-emerald-300 border border-emerald-500">
                    ● {feed.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Role Switcher & Audit Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* RBAC Role Switcher Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              Role-Based Access Control (RBAC)
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { role: 'Disaster Management Authority' as const, desc: 'Full authority to trigger evacuations, broadcast sirens, dispatch NDRF/SDRF.' },
                { role: 'District Administration' as const, desc: 'District Collector level controls for road closures, relief shelters and bulletins.' },
                { role: 'Field Official' as const, desc: 'PWA camera reporting, sensor recalibration and incident verification.' },
                { role: 'Administrator' as const, desc: 'System configuration, threshold calibration and API management.' },
                { role: 'Citizen' as const, desc: 'Public hazard map, localized alerts, safe routes and handbook.' },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => onChangeRole(item.role)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentRole === item.role
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.role}</span>
                    {currentRole === item.role && (
                      <span className="text-[10px] font-bold text-cyan-400 uppercase font-sans">
                        Active Role
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-indigo-400" />
              Immutable Security & Audit Trail
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 text-xs">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400 font-sans">{log.time}</span>
                    <span className="text-slate-500 font-sans">{log.ip}</span>
                  </div>
                  <div className="text-slate-200 font-medium text-[11px]">{log.action}</div>
                  <div className="text-[10px] text-slate-400">By: {log.user}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
