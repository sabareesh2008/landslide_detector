/**
 * LANDSLIDE SENTINEL AI - Utilities & Audio Alerts
 */

// Audio Alert Synthesizer using Web Audio API (Zero external audio file dependency)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
}

export function playDisasterSiren() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.3);
    osc.frequency.linearRampToValueAtTime(440, now + 0.6);
    osc.frequency.linearRampToValueAtTime(880, now + 0.9);
    osc.frequency.linearRampToValueAtTime(440, now + 1.2);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 1.2);
  } catch (e) {
    console.warn('Audio siren playback failed:', e);
  }
}

// Date and Time Formatters (UTC & Local)
export function formatUTC(dateStr) {
  if (!dateStr) return 'DATA UNAVAILABLE';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'DATA UNAVAILABLE';
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return 'DATA UNAVAILABLE';
  }
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return 'DATA UNAVAILABLE';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'DATA UNAVAILABLE';
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 3600);
    
    if (diffHours < 0) return 'Just now';
    if (diffHours < 1) return `${Math.max(1, Math.round(diffHours * 60))} min ago`;
    if (diffHours < 48) return `${diffHours.toFixed(1)} hrs ago`;
    return `${(diffHours / 24).toFixed(1)} days ago`;
  } catch {
    return 'DATA UNAVAILABLE';
  }
}

// Numerical & Scientific Formatters
export function formatNumber(val, decimals = 1, fallback = 'DATA UNAVAILABLE') {
  if (val === null || val === undefined || isNaN(Number(val))) return fallback;
  return Number(val).toFixed(decimals);
}

export function formatPercent(val, decimals = 1, fallback = 'DATA UNAVAILABLE') {
  if (val === null || val === undefined || isNaN(Number(val))) return fallback;
  return `${(Number(val) * 100).toFixed(decimals)}%`;
}

// CSV Parser Helper
export function parseCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple regex for CSV parsing (handles quotes)
    const values = [];
    let insideQuote = false;
    let currVal = '';
    
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currVal.trim());
        currVal = '';
      } else {
        currVal += char;
      }
    }
    values.push(currVal.trim());
    
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    results.push(obj);
  }
  return results;
}
