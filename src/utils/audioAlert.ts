/**
 * Web Audio API Emergency Siren & Alert Chime Synthesizer
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDisasterSiren(durationSeconds = 3) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;

    // Siren sweep from 440Hz to 880Hz
    osc.frequency.setValueAtTime(440, now);
    for (let i = 0; i < durationSeconds; i++) {
      osc.frequency.exponentialRampToValueAtTime(880, now + i + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, now + i + 1.0);
    }

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.setValueAtTime(0.2, now + durationSeconds - 0.2);
    gain.gain.linearRampToValueAtTime(0.01, now + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSeconds);
  } catch (err) {
    console.warn('Audio alert play blocked or unsupported:', err);
  }
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.0, now + 0.12); // A5

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {
    console.warn('Audio chime blocked:', err);
  }
}
