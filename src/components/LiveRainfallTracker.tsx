import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Radio,
  Satellite,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  fetchRainfallStatus,
  fetchRainfallLatest,
  fetchRainfallHistory,
  addManualRainfallReading,
  RainfallStatusResponse,
  RainfallLatestResponse,
  RainfallRecord,
} from '../services/rainfallService';

const REFRESH_INTERVAL_MS = 60_000; // poll every 60 seconds
const KNOWN_LOCATIONS = ['Rangpo', 'Singtam'];
const LINE_COLORS: Record<string, string> = {
  Rangpo: '#22d3ee',
  Singtam: '#f472b6',
};

function formatTimeAgo(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min ago`;
  if (hours < 48) return `${hours.toFixed(1)} hrs ago`;
  return `${(hours / 24).toFixed(1)} days ago`;
}

function buildChartData(records: RainfallRecord[]) {
  // Merge records by timestamp into rows keyed by location for recharts
  const byTime = new Map<string, any>();
  for (const r of records) {
    const t = new Date(r.observation_end_utc);
    const label = t.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    if (!byTime.has(r.observation_end_utc)) {
      byTime.set(r.observation_end_utc, { timestamp: r.observation_end_utc, label });
    }
    byTime.get(r.observation_end_utc)[r.location] = r.rainfall_mm;
  }
  return Array.from(byTime.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export const LiveRainfallTracker: React.FC = () => {
  const [status, setStatus] = useState<RainfallStatusResponse | null>(null);
  const [latest, setLatest] = useState<RainfallLatestResponse | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formLocation, setFormLocation] = useState<string>('Rangpo');
  const [formCustomLocation, setFormCustomLocation] = useState('');
  const [formRainfall, setFormRainfall] = useState('');
  const [formDateTime, setFormDateTime] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [statusRes, latestRes, historyRes] = await Promise.all([
        fetchRainfallStatus(),
        fetchRainfallLatest(),
        fetchRainfallHistory(),
      ]);
      setStatus(statusRes);
      setLatest(latestRes);
      setChartData(buildChartData(historyRes.records));
      setLastSynced(new Date());
    } catch (err: any) {
      setError(err?.message || 'Could not reach the live rainfall API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const location = formLocation === '__custom__' ? formCustomLocation.trim() : formLocation;
      if (!location) throw new Error('Enter a location name.');
      const rainfallValue = Number(formRainfall);
      if (!Number.isFinite(rainfallValue) || rainfallValue < 0) {
        throw new Error('Enter a valid rainfall amount in mm.');
      }
      const observedAt = formDateTime ? new Date(formDateTime).toISOString() : new Date().toISOString();

      await addManualRainfallReading({
        location,
        rainfall_mm: rainfallValue,
        observed_at: observedAt,
        notes: formNotes || undefined,
      });

      setSubmitMessage('Reading added — the dashboard is now tracking it.');
      setFormRainfall('');
      setFormNotes('');
      setFormDateTime('');
      await loadData();
    } catch (err: any) {
      setSubmitMessage(err?.message || 'Could not add that reading.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasAnyData = latest?.available && Object.keys(latest.locations).length > 0;
  const locationsToShow = hasAnyData ? Object.keys(latest!.locations) : [];

  return (
    <div className="bg-[#111827] border border-emerald-500/30 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-sans text-xs uppercase font-semibold">
            <Satellite className="w-4 h-4" />
            <span>Live Field Data Feed</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Live Rainfall Tracker</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Reads real observations from{' '}
            <code className="text-emerald-300">scripts/live_rainfall_automation.py</code> (NASA GPM IMERG), plus
            any readings you log by hand below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status?.livePipelineConnected ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-sans">
              <AlertCircle className="w-3.5 h-3.5" /> Waiting for live pipeline
            </span>
          )}
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-sans hover:bg-slate-700 transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary cards */}
      {hasAnyData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locationsToShow.map((loc) => {
            const data = latest!.locations[loc];
            return (
              <div key={loc} className="bg-[#0c121e] border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{loc}</span>
                  <span className="text-[10px] text-slate-500">
                    {formatTimeAgo(data.data_lag_hours)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ['1h', data.rainfall_1h],
                    ['24h', data.rainfall_24h],
                    ['72h', data.rainfall_72h],
                    ['7d', data.rainfall_7d],
                  ].map(([label, w]: any) => (
                    <div key={label} className="bg-slate-900/60 rounded-md py-2">
                      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
                      <div className="text-sm font-bold text-cyan-300">{w.rainfall_mm} mm</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="bg-[#0c121e] border border-dashed border-slate-700 rounded-lg p-6 text-center space-y-1">
            <Radio className="w-5 h-5 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">No live data yet</p>
            <p className="text-xs text-slate-500">
              Run <code className="text-cyan-300">python scripts/live_rainfall_automation.py</code> to start
              pulling real NASA rainfall data, or add a reading manually below to start tracking right away.
            </p>
          </div>
        )
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#0c121e] border border-slate-800 rounded-lg p-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-3">
            Rainfall Over Time (mm)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0c121e', border: '1px solid #1e293b', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {KNOWN_LOCATIONS.map((loc) => (
                <Line
                  key={loc}
                  type="monotone"
                  dataKey={loc}
                  stroke={LINE_COLORS[loc] || '#94a3b8'}
                  dot={false}
                  connectNulls
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Manual entry space */}
      <div className="bg-[#0c121e] border border-slate-800 rounded-lg p-4">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Add a reading manually
          </span>
          <span className="text-[10px] text-slate-500">
            {showForm ? 'Hide' : 'Use this if the live feed is not connected yet'}
          </span>
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Location</label>
              <select
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200"
              >
                {KNOWN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="__custom__">Other / custom location…</option>
              </select>
              {formLocation === '__custom__' && (
                <input
                  type="text"
                  placeholder="Location name"
                  value={formCustomLocation}
                  onChange={(e) => setFormCustomLocation(e.target.value)}
                  className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200"
                />
              )}
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Rainfall (mm)</label>
              <input
                type="number"
                min={0}
                step="0.1"
                required
                value={formRainfall}
                onChange={(e) => setFormRainfall(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200"
                placeholder="e.g. 12.5"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">
                Observed at (leave blank for now)
              </label>
              <input
                type="datetime-local"
                value={formDateTime}
                onChange={(e) => setFormDateTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Notes (optional)</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200"
                placeholder="e.g. gauge reading"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? 'Adding…' : 'Add & Track'}
              </button>
              {submitMessage && <span className="text-xs text-slate-400">{submitMessage}</span>}
            </div>
          </form>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span>
          Live rows: {status?.liveRecordCount ?? 0} · Manual rows: {status?.manualRecordCount ?? 0}
        </span>
        {lastSynced && <span>Synced {lastSynced.toLocaleTimeString()} · auto-refreshes every 60s</span>}
      </div>
    </div>
  );
};
