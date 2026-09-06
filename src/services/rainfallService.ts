// Client for the live rainfall API in server.ts.
// This is the bridge between the React dashboard and the data written by
// scripts/live_rainfall_automation.py (NASA GPM IMERG) plus any manual
// readings logged from the "Add a reading" form in LiveRainfallTracker.

export interface RainfallWindow {
  rainfall_mm: number;
  records_available: number;
}

export interface RainfallLocationSummary {
  latest_observation_utc: string;
  data_lag_hours: number;
  rainfall_1h: RainfallWindow;
  rainfall_24h: RainfallWindow;
  rainfall_72h: RainfallWindow;
  rainfall_7d: RainfallWindow;
}

export interface RainfallLatestResponse {
  available: boolean;
  source?: string;
  generated_utc?: string;
  locations: Record<string, RainfallLocationSummary>;
}

export interface RainfallRecord {
  observation_end_utc: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  rainfall_mm: number;
  source: 'live' | 'manual';
  notes?: string;
}

export interface RainfallHistoryResponse {
  count: number;
  records: RainfallRecord[];
}

export interface RainfallStatusResponse {
  livePipelineConnected: boolean;
  liveLastUpdatedUtc: string | null;
  liveRecordCount: number;
  manualRecordCount: number;
  manualLastUpdatedUtc: string | null;
  knownLocations: string[];
}

export async function fetchRainfallStatus(): Promise<RainfallStatusResponse> {
  const res = await fetch('/api/rainfall/status');
  if (!res.ok) throw new Error('Failed to fetch rainfall status');
  return res.json();
}

export async function fetchRainfallLatest(): Promise<RainfallLatestResponse> {
  const res = await fetch('/api/rainfall/latest');
  if (!res.ok) throw new Error('Failed to fetch latest rainfall summary');
  return res.json();
}

export async function fetchRainfallHistory(location?: string): Promise<RainfallHistoryResponse> {
  const url = location ? `/api/rainfall/history?location=${encodeURIComponent(location)}` : '/api/rainfall/history';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch rainfall history');
  return res.json();
}

export async function addManualRainfallReading(entry: {
  location: string;
  rainfall_mm: number;
  observed_at: string; // ISO string
  notes?: string;
}): Promise<{ success: boolean; summary: RainfallLatestResponse }> {
  const res = await fetch('/api/rainfall/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to add manual reading');
  }
  return res.json();
}
