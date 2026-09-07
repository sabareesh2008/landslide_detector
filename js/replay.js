/**
 * LANDSLIDE SENTINEL AI - Historical Event Replay Timeline Component
 */

let replayEvents = [];
let currentEvent = null;
let currentStepIdx = 0;

export function renderReplayView(events) {
  replayEvents = events || [];
  if (replayEvents.length === 0) return;
  
  const select = document.getElementById('replay-event-select');
  if (select) {
    select.innerHTML = replayEvents.map((evt, idx) => `
      <option value="${idx}">${evt.title} (${evt.location})</option>
    `).join('');
    
    select.onchange = (e) => {
      loadEvent(parseInt(e.target.value));
    };
  }
  
  loadEvent(0);
}

function loadEvent(index) {
  currentEvent = replayEvents[index];
  if (!currentEvent) return;
  currentStepIdx = 0;
  
  // Set event metadata
  const title = document.getElementById('replay-event-title');
  const desc = document.getElementById('replay-event-desc');
  const leadTime = document.getElementById('replay-lead-time');
  
  if (title) title.textContent = `${currentEvent.title} — ${currentEvent.road}`;
  if (desc) desc.textContent = currentEvent.description;
  if (leadTime) leadTime.textContent = `${currentEvent.lead_time_achieved_hours} Hours Early Warning Achieved`;
  
  // Render scrubber buttons
  const timeline = currentEvent.timeline || [];
  const scrubber = document.getElementById('replay-timeline-buttons');
  if (scrubber) {
    scrubber.innerHTML = timeline.map((step, idx) => `
      <button class="btn ${idx === currentStepIdx ? 'btn-primary' : ''}" style="font-size: 0.75rem; padding: 6px 10px;" onclick="window.setReplayStep(${idx})">
        ${step.step}
      </button>
    `).join('');
  }
  
  updateStepDisplay();
}

export function setReplayStep(stepIndex) {
  currentStepIdx = stepIndex;
  
  // Update scrubber button styles
  const scrubber = document.getElementById('replay-timeline-buttons');
  if (scrubber) {
    const buttons = scrubber.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
      if (idx === stepIndex) {
        btn.classList.add('btn-primary');
      } else {
        btn.classList.remove('btn-primary');
      }
    });
  }
  
  updateStepDisplay();
}

// Make setReplayStep global for button callbacks
window.setReplayStep = setReplayStep;

function updateStepDisplay() {
  if (!currentEvent || !currentEvent.timeline) return;
  const step = currentEvent.timeline[currentStepIdx];
  if (!step) return;
  
  const stepProb = document.getElementById('replay-step-prob');
  const stepLevel = document.getElementById('replay-step-level');
  const stepR24 = document.getElementById('replay-step-r24');
  const stepR72 = document.getElementById('replay-step-r72');
  const stepWarning = document.getElementById('replay-step-warning');
  
  if (stepProb) stepProb.textContent = `${(step.risk_probability * 100).toFixed(1)}%`;
  if (stepLevel) {
    stepLevel.textContent = step.risk_level;
    stepLevel.className = `risk-badge risk-${step.risk_level.toLowerCase()}`;
  }
  if (stepR24) stepR24.textContent = `${step.rainfall_24h_mm} mm`;
  if (stepR72) stepR72.textContent = `${step.rainfall_72h_mm} mm`;
  if (stepWarning) {
    stepWarning.innerHTML = step.warning_raised
      ? `<span class="text-red font-bold">⚠️ WARNING ACTIVE (${step.risk_level})</span>`
      : `<span class="text-emerald">Standard Surveillance</span>`;
  }
}
