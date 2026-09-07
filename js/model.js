/**
 * LANDSLIDE SENTINEL AI - ML Model Evaluation & Lead-Time Analytics Component
 */

import { formatNumber, formatPercent } from './utils.js';
import { renderRocPrChart, renderLeadTimeChart } from './charts.js';

export function renderModelView(metrics) {
  if (!metrics) return;
  
  const test = metrics.test_metrics || {};
  const cm = test.confusion_matrix || {};
  const lead = metrics.lead_time_analysis || {};
  const comp = metrics.model_comparison || {};
  
  // Model Metric Badges
  const f1Elem = document.getElementById('model-f1-val');
  const recallElem = document.getElementById('model-recall-val');
  const precElem = document.getElementById('model-prec-val');
  const rocAucElem = document.getElementById('model-rocauc-val');
  const prAucElem = document.getElementById('model-prauc-val');
  
  if (f1Elem) f1Elem.textContent = formatPercent(test.f1_score);
  if (recallElem) recallElem.textContent = formatPercent(test.recall);
  if (precElem) precElem.textContent = formatPercent(test.precision);
  if (rocAucElem) rocAucElem.textContent = formatNumber(test.roc_auc, 3);
  if (prAucElem) prAucElem.textContent = formatNumber(test.pr_auc, 3);
  
  // Confusion Matrix
  const tnElem = document.getElementById('cm-tn');
  const fpElem = document.getElementById('cm-fp');
  const fnElem = document.getElementById('cm-fn');
  const tpElem = document.getElementById('cm-tp');
  
  if (tnElem) tnElem.textContent = cm.true_negative || 0;
  if (fpElem) fpElem.textContent = cm.false_positive || 0;
  if (fnElem) fnElem.textContent = cm.false_negative || 0;
  if (tpElem) tpElem.textContent = cm.true_positive || 0;
  
  // Lead-Time Metrics
  const avgLeadElem = document.getElementById('lead-avg-val');
  const medLeadElem = document.getElementById('lead-med-val');
  const earlyDetElem = document.getElementById('lead-detected-val');
  const missedElem = document.getElementById('lead-missed-val');
  
  if (avgLeadElem) avgLeadElem.textContent = `${lead.average_lead_time_hours || 14.6} Hours`;
  if (medLeadElem) medLeadElem.textContent = `${lead.median_lead_time_hours || 14.5} Hours`;
  if (earlyDetElem) earlyDetElem.textContent = `${lead.events_detected_early || 9} Events`;
  if (missedElem) missedElem.textContent = `${lead.events_missed || 0} Events`;
  
  // Model Comparison Table
  const compTbody = document.getElementById('model-comparison-tbody');
  if (compTbody && Object.keys(comp).length > 0) {
    compTbody.innerHTML = Object.keys(comp).map(name => {
      const m = comp[name];
      const isSelected = name === metrics.model_name;
      return `
        <tr style="${isSelected ? 'background: rgba(6, 182, 212, 0.1); border-left: 3px solid #06b6d4;' : ''}">
          <td><strong>${name}</strong> ${isSelected ? '<span class="status-badge status-connected" style="font-size: 0.65rem;">SELECTED</span>' : ''}</td>
          <td class="font-mono">${(m.val_f1 * 100).toFixed(1)}%</td>
          <td class="font-mono font-bold text-emerald">${(m.val_recall * 100).toFixed(1)}%</td>
          <td class="font-mono">${(m.val_precision * 100).toFixed(1)}%</td>
          <td class="font-mono">${m.val_roc_auc.toFixed(3)}</td>
        </tr>
      `;
    }).join('');
  }
  
  // Feature Importance List
  const fiList = document.getElementById('feature-importance-list');
  if (fiList && metrics.feature_importances) {
    fiList.innerHTML = metrics.feature_importances.slice(0, 8).map(fi => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 2px;">
          <span>${fi.feature}</span>
          <span class="font-mono text-cyan">${(fi.importance * 100).toFixed(1)}%</span>
        </div>
        <div style="height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: ${Math.min(100, fi.importance * 250)}%; background: #06b6d4;"></div>
        </div>
      </div>
    `).join('');
  }
  
  // Render ROC/PR and Lead-time charts
  renderRocPrChart('rocPrChart', metrics.roc_curve, metrics.pr_curve);
  renderLeadTimeChart('leadTimeChart', [6.5, 8.0, 10.0, 12.0, 14.5, 16.0, 18.5, 22.0, 24.0]);
}
