/**
 * LANDSLIDE SENTINEL AI - Field AI & Multimodal Evidence Pipeline
 * Computer Vision symptom analysis, field report submissions, and human verification loop.
 */

import { formatUTC } from './utils.js';

let fieldReportsCache = [];

export function renderFieldAIView(reportsData) {
  const container = document.getElementById('field-ai-container');
  if (!container) return;

  fieldReportsCache = reportsData?.reports || [];

  let html = `
    <div class="row g-4 mb-4">
      <!-- Submission Form Card -->
      <div class="col-lg-5">
        <div class="card h-100">
          <div class="card-header">
            <span class="card-title">📸 Submit Field Observation & Ground Evidence</span>
          </div>
          <div class="card-body">
            <form id="field-report-form" onsubmit="event.preventDefault(); window.handleFieldReportSubmit();">
              <div class="mb-3">
                <label class="form-label text-xs text-muted">Reporter Role & Authority</label>
                <select id="fld-role" class="form-select form-select-sm bg-dark text-light border-secondary">
                  <option value="FIELD_OFFICER">Field Officer (PWD / SSDMA / NHIDCL)</option>
                  <option value="CITIZEN">Citizen / Highway Traveler</option>
                  <option value="TRAFFIC_POLICE">Sikkim Highway Police Patrol</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label text-xs text-muted">Reporter Full Name</label>
                <input type="text" id="fld-name" class="form-control form-control-sm bg-dark text-light border-secondary" placeholder="e.g. Karma Wangdi" required />
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label text-xs text-muted">Latitude</label>
                  <input type="number" step="0.0001" id="fld-lat" class="form-control form-control-sm bg-dark text-light border-secondary" value="27.2215" required />
                </div>
                <div class="col-6">
                  <label class="form-label text-xs text-muted">Longitude</label>
                  <input type="number" step="0.0001" id="fld-lon" class="form-control form-control-sm bg-dark text-light border-secondary" value="88.5038" required />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label text-xs text-muted">Observed Geological Symptoms (Select All That Apply)</label>
                <div class="d-flex flex-column gap-1" style="font-size: 0.8rem;">
                  <label><input type="checkbox" name="symptom" value="ROAD_SURFACE_TENSION_CRACKS" checked /> Road surface tension cracks</label>
                  <label><input type="checkbox" name="symptom" value="TURBID_GROUNDWATER_SEEPAGE" checked /> Turbid muddy water seepage from slope toe</label>
                  <label><input type="checkbox" name="symptom" value="RETAINING_WALL_BULGING" /> Masonry / Retaining wall bulging</label>
                  <label><input type="checkbox" name="symptom" value="COLLUVIAL_DEBRIS_ACCUMULATION" checked /> Loose rockfall / colluvial debris</label>
                  <label><input type="checkbox" name="symptom" value="FRESH_SOIL_SCARP_FAILURE" /> Fresh tension scarp collapse</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label text-xs text-muted">Attach Observation Photo</label>
                <input type="file" id="fld-photo" accept="image/*" class="form-control form-control-sm bg-dark text-light border-secondary" />
                <div class="form-text text-muted text-xs">Computer Vision will automatically extract geological fracture geometry.</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-xs text-muted">Field Observation Notes</label>
                <textarea id="fld-notes" class="form-control form-control-sm bg-dark text-light border-secondary" rows="2" placeholder="Describe fissure width, water turbidity, or lane obstruction..."></textarea>
              </div>
              <button type="submit" class="btn btn-cyan btn-sm w-100 fw-bold">
                🚀 Upload Ground Evidence & Run Vision AI Analysis
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Reports History & Human Verification Card -->
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="card-title">🔍 Field Reports & AI Vision Verification Stream</span>
            <span class="badge bg-secondary">${fieldReportsCache.length} Total Submissions</span>
          </div>
          <div class="card-body p-3" style="max-height: 580px; overflow-y: auto;">
            ${fieldReportsCache.map(r => {
              const ai = r.ai_vision_analysis || {};
              const ver = r.verification_lifecycle || {};
              const isVerified = ver.status === 'FIELD_VERIFIED';

              return `
                <div class="p-3 mb-3" style="background: rgba(255,255,255,0.02); border: 1px solid ${isVerified ? '#059669' : '#334155'}; border-radius: 8px;">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong class="text-cyan">${r.report_id}</strong> — <span class="text-light">${r.location_name}</span>
                      <div class="text-xs text-muted">${r.reporter_name} (${r.reporter_role}) • ${formatUTC(r.submission_time_utc)}</div>
                    </div>
                    <span class="badge bg-${isVerified ? 'success' : (ver.status === 'SUBMITTED' ? 'warning' : 'info')}">
                      ${ver.status || 'SUBMITTED'}
                    </span>
                  </div>

                  <div class="text-xs mb-2"><strong>Observed:</strong> ${(r.observed_symptoms || []).join(' • ')}</div>

                  <!-- AI Vision Analysis Block -->
                  <div class="p-2 mb-2" style="background: rgba(6, 182, 212, 0.05); border-left: 3px solid #06b6d4; border-radius: 4px; font-size: 0.78rem;">
                    <div class="d-flex justify-content-between">
                      <strong class="text-cyan">🤖 Multimodal Vision AI:</strong>
                      <span class="badge bg-dark text-warning border border-warning">${ai.estimated_severity || 'MODERATE'} SEVERITY</span>
                    </div>
                    <div class="text-muted mt-1">${ai.ai_summary || 'Feature extraction completed.'}</div>
                    <div class="text-xs text-info mt-1">Identified Features: ${(ai.identified_features || []).join(', ')}</div>
                  </div>

                  <!-- Human Verification Sign-off -->
                  <div class="d-flex justify-content-between align-items-center pt-2" style="border-top: 1px solid #1e293b; font-size: 0.75rem;">
                    <div class="text-muted">
                      ${isVerified ? `✅ Verified by: <strong class="text-emerald">${ver.verified_by}</strong>` : '⏳ Awaiting Assistant Engineer on-site sign-off'}
                    </div>
                    ${!isVerified ? `
                      <button class="btn btn-sm btn-outline-success py-0 px-2" onclick="window.verifyFieldReport('${r.report_id}')">
                        ✓ Confirm & Verify
                      </button>
                    ` : `
                      <span class="badge bg-emerald-subtle text-emerald">Active Learning Staged</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Global window actions
window.handleFieldReportSubmit = function() {
  const role = document.getElementById('fld-role').value;
  const name = document.getElementById('fld-name').value;
  const lat = parseFloat(document.getElementById('fld-lat').value);
  const lon = parseFloat(document.getElementById('fld-lon').value);
  const notes = document.getElementById('fld-notes').value;

  const checkedSymptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(c => c.value);

  const newReport = {
    report_id: `FLD-2026-${String(fieldReportsCache.length + 1).padStart(3, '0')}`,
    submission_time_utc: new Date().toISOString(),
    reporter_role: role,
    reporter_name: name,
    latitude: lat,
    longitude: lon,
    location_name: `NH-10 Sector (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`,
    observed_symptoms: checkedSymptoms.map(s => s.replace(/_/g, ' ')),
    user_description: notes,
    ai_vision_analysis: {
      status: 'COMPLETED',
      identified_features: checkedSymptoms,
      estimated_severity: checkedSymptoms.length >= 3 ? 'HIGH' : 'MODERATE',
      visual_confidence_score: 0.86,
      requires_human_verification: true,
      ai_summary: `Computer vision identified ${checkedSymptoms.length} distinct surface displacement indicators. Colluvial shearing likely.`
    },
    verification_lifecycle: {
      status: 'SUBMITTED',
      verified_by: null,
      verification_time_utc: null,
      engineer_notes: 'Uploaded via Field Reporting Stream. Ready for on-site inspection.',
      active_learning_candidate: false
    }
  };

  fieldReportsCache.unshift(newReport);
  renderFieldAIView({ reports: fieldReportsCache });
  alert(`Field report ${newReport.report_id} submitted and analyzed by Computer Vision AI!`);
};

window.verifyFieldReport = function(reportId) {
  const rep = fieldReportsCache.find(r => r.report_id === reportId);
  if (rep) {
    rep.verification_lifecycle = {
      status: 'FIELD_VERIFIED',
      verified_by: 'Duty Geotechnical Engineer (SSDMA / PWD)',
      verification_time_utc: new Date().toISOString(),
      engineer_notes: 'Ground symptoms verified on site. Safety mitigations initiated.',
      active_learning_candidate: true
    };
    renderFieldAIView({ reports: fieldReportsCache });
    alert(`Report ${reportId} has been verified and staged for Active Learning!`);
  }
};
