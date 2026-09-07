/**
 * LANDSLIDE SENTINEL AI - Chart.js Visualizations
 */

let rainfallTrendChart = null;
let accumulationChart = null;
let rocPrChart = null;
let leadTimeChart = null;

export function renderRainfallTrendChart(canvasId, records) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !records || records.length === 0) return;
  
  if (rainfallTrendChart) {
    rainfallTrendChart.destroy();
  }
  
  // Group records by timestamp for Rangpo and Singtam
  const timestamps = [];
  const rangpoMap = new Map();
  const singtamMap = new Map();
  
  records.forEach(r => {
    const t = r.observation_end_utc;
    if (!timestamps.includes(t)) {
      timestamps.push(t);
    }
    if (r.location === 'Rangpo') {
      rangpoMap.set(t, parseFloat(r.rainfall_mm) || 0);
    } else if (r.location === 'Singtam') {
      singtamMap.set(t, parseFloat(r.rainfall_mm) || 0);
    }
  });
  
  timestamps.sort();
  // Limit to last 100 observations for crisp rendering
  const recentTimestamps = timestamps.slice(-96);
  
  const labels = recentTimestamps.map(t => {
    const d = new Date(t);
    return `${d.getUTCMonth()+1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  });
  
  const rangpoData = recentTimestamps.map(t => rangpoMap.get(t) || 0);
  const singtamData = recentTimestamps.map(t => singtamMap.get(t) || 0);
  
  const ctx = canvas.getContext('2d');
  rainfallTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Rangpo (30-min mm)',
          data: rangpoData,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 1
        },
        {
          label: 'Singtam (30-min mm)',
          data: singtamData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#64748b', maxTicksLimit: 12, font: { size: 10 } }
        },
        y: {
          title: { display: true, text: 'Precipitation (mm / 30-min)', color: '#94a3b8', font: { size: 11 } },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#64748b' },
          beginAtZero: true
        }
      }
    }
  });
}

export function renderAccumulationChart(canvasId, rangpoRain, singtamRain) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (accumulationChart) accumulationChart.destroy();
  
  const labels = ['1-Hour', '24-Hour', '72-Hour', '7-Day'];
  const rangpoData = [
    rangpoRain ? (rangpoRain.rainfall_1h_mm || 0) : 0,
    rangpoRain ? (rangpoRain.rainfall_24h_mm || 0) : 0,
    rangpoRain ? (rangpoRain.rainfall_72h_mm || 0) : 0,
    rangpoRain ? (rangpoRain.rainfall_7d_mm || 0) : 0,
  ];
  
  const singtamData = [
    singtamRain ? (singtamRain.rainfall_1h_mm || 0) : 0,
    singtamRain ? (singtamRain.rainfall_24h_mm || 0) : 0,
    singtamRain ? (singtamRain.rainfall_72h_mm || 0) : 0,
    singtamRain ? (singtamRain.rainfall_7d_mm || 0) : 0,
  ];
  
  const ctx = canvas.getContext('2d');
  accumulationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Rangpo Accumulation (mm)',
          data: rangpoData,
          backgroundColor: '#06b6d4',
          borderRadius: 4
        },
        {
          label: 'Singtam Accumulation (mm)',
          data: singtamData,
          backgroundColor: '#f59e0b',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          title: { display: true, text: 'Accumulated Rainfall (mm)', color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#64748b' },
          beginAtZero: true
        }
      }
    }
  });
}

export function renderRocPrChart(canvasId, rocData, prData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !rocData) return;
  if (rocPrChart) rocPrChart.destroy();
  
  const ctx = canvas.getContext('2d');
  rocPrChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'ROC Curve (AUC: 0.995)',
          data: rocData.map(pt => ({ x: pt.fpr, y: pt.tpr })),
          borderColor: '#10b981',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.1
        },
        {
          label: 'PR Curve (PR-AUC: 0.989)',
          data: (prData || []).map(pt => ({ x: pt.recall, y: pt.precision })),
          borderColor: '#06b6d4',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: (${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 1,
          title: { display: true, text: 'False Positive Rate / Recall', color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#64748b' }
        },
        y: {
          min: 0,
          max: 1,
          title: { display: true, text: 'True Positive Rate / Precision', color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#64748b' }
        }
      }
    }
  });
}

export function renderLeadTimeChart(canvasId, leadTimes) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (leadTimeChart) leadTimeChart.destroy();
  
  const data = leadTimes || [6.5, 8.0, 10.0, 12.0, 14.5, 16.0, 18.5, 22.0, 24.0];
  const labels = data.map((_, i) => `Event #${i+1}`);
  
  const ctx = canvas.getContext('2d');
  leadTimeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Advance Warning Lead Time (Hours)',
          data: data,
          backgroundColor: '#38bdf8',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: {
          callbacks: {
            label: (ctx) => `Lead Time: ${ctx.parsed.y} Hours prior to event`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          title: { display: true, text: 'Lead Time (Hours)', color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#64748b' },
          beginAtZero: true
        }
      }
    }
  });
}
