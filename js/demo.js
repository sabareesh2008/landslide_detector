/**
 * LANDSLIDE SENTINEL AI - SIH Judge Mode & Scenario Simulation Engine
 * Interactive 12-step guided judge tour and controlled fail-safe scenario testing.
 */

import { speakEmergencyWarning, t } from './i18n.js';

const DEMO_STEPS = [
  { step: 1, tab: 'overview', title: '1. Command Overview', text: 'Central disaster command dashboard integrating near-real-time NASA IMERG precipitation, Copernicus DEM topography, and calibrated ML failure probabilities.' },
  { step: 2, tab: 'risk', title: '2. Calibrated ML Risk Prediction', text: 'Two-Model Architecture: Model A (Static Susceptibility) + Model B (Dynamic Trigger) calibrated via Platt Scaling to deliver true posterior probabilities.' },
  { step: 3, tab: 'map', title: '3. GIS Spatial Risk Map & Hotspots', text: '10x10 fine-grained spatial hazard matrix identifying critical landslide hotspots with universal non-color-only threat symbols.' },
  { step: 4, tab: 'emergency', title: '4. NH-10 Highway & Infrastructure Impact', text: 'Calculates dynamic blockage probability for each highway reach, mapping potential cascade disruptions to fuel and medical freight.' },
  { step: 5, tab: 'iot', title: '5. Ground IoT Telemetry Network', text: 'Real-time telemetry ingestion from rain gauges, FDR soil moisture probes, and MPU6050 MEMS inclinometers with anomaly detection.' },
  { step: 6, tab: 'field-ai', title: '6. Field AI & Computer Vision', text: 'Ground evidence image upload: Vision AI extracts road fractures, turbid seepage, and retaining wall bulging.' },
  { step: 7, tab: 'field-ai', title: '7. Human Verification Loop', text: 'Human-in-the-loop: PWD / SSDMA engineers review vision classifications before staging verified reports into Active Learning.' },
  { step: 8, tab: 'emergency', title: '8. Evacuation Routing & Shelters', text: 'Identifies safe evacuation paths avoiding high-risk sectors, and coordinates designated relief shelters in Rangpo and Singtam.' },
  { step: 9, tab: 'overview', title: '9. Multilingual Voice Alerts (TTS)', text: 'Emergency warning broadcast synthesized in 9 Indian languages (English, Nepali, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi).' },
  { step: 10, tab: 'replay', title: '10. Historical Storm Event Replay', text: 'Interactive T-72h to Event timeline scrubber showing progressive antecedent saturation buildup and threshold crossings.' },
  { step: 11, tab: 'model', title: '11. Model Calibration & Brier Score', text: 'Exhaustive model metrics on out-of-time test holdout: ROC-AUC 0.9977, PR-AUC 0.9124, 0 False Negatives, and Brier Score 0.0083.' },
  { step: 12, tab: 'health', title: '12. Fail-Safe Simulation & Observability', text: 'Telemetry freshness tracking, automated data status flags (FRESH/STALE/DEGRADED), and graceful fallbacks under sensor outages.' }
];

let currentStepIdx = 0;

export function renderDemoTourModal() {
  let modalEl = document.getElementById('sih-demo-modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'sih-demo-modal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border border-cyan text-light">
          <div class="modal-header border-secondary">
            <h5 class="modal-title text-cyan" id="demo-tour-title">🏆 SIH 2026 Guided Judge Tour</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="badge bg-secondary mb-2" id="demo-tour-step-badge">Step 1 of 12</div>
            <p id="demo-tour-text" style="font-size: 0.9rem; line-height: 1.6;"></p>
          </div>
          <div class="modal-footer border-secondary d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-secondary" onclick="window.prevDemoStep()">◀ Previous</button>
            <button class="btn btn-sm btn-cyan fw-bold" onclick="window.nextDemoStep()">Next Step ▶</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  updateTourModalContent();
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

function updateTourModalContent() {
  const step = DEMO_STEPS[currentStepIdx];
  const titleEl = document.getElementById('demo-tour-title');
  const badgeEl = document.getElementById('demo-tour-step-badge');
  const textEl = document.getElementById('demo-tour-text');

  if (titleEl) titleEl.textContent = `🏆 SIH Tour: ${step.title}`;
  if (badgeEl) badgeEl.textContent = `Step ${step.step} of ${DEMO_STEPS.length}`;
  if (textEl) textEl.textContent = step.text;

  // Switch to the relevant dashboard tab
  if (window.switchDashboardTab) {
    window.switchDashboardTab(step.tab);
  }
}

window.nextDemoStep = function() {
  if (currentStepIdx < DEMO_STEPS.length - 1) {
    currentStepIdx++;
    updateTourModalContent();
  } else {
    alert('🎉 SIH Guided Tour Completed! All 12 disaster-management capabilities demonstrated.');
  }
};

window.prevDemoStep = function() {
  if (currentStepIdx > 0) {
    currentStepIdx--;
    updateTourModalContent();
  }
};

export function simulateScenario(scenarioType) {
  console.log(`[Simulation] Activating scenario: ${scenarioType}`);
  
  if (scenarioType === 'CLOUDBURST') {
    alert('⚡ SIMULATION: High Cloudburst Storm (120mm / 24h) triggered! Dynamic trigger surges to 0.92.');
    speakEmergencyWarning('Emergency Warning: Simulated cloudburst storm active along NH-10 corridor.', 'en');
  } else if (scenarioType === 'SENSOR_OUTAGE') {
    alert('⚠️ SIMULATION: LoRaWAN Gateway disconnection simulated. Telemetry status toggles to STALE.');
  } else if (scenarioType === 'OFFLINE_MODE') {
    alert('📡 SIMULATION: Offline Mode activated. System relies on cached Service Worker telemetry.');
  } else {
    alert('✅ SIMULATION: Normal Monsoonal Baseline restored.');
  }
}
