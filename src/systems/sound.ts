/** Web Audio API synth sound engine — no audio files needed. */

let ctx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  return _muted;
}

export function setMuted(muted: boolean): void {
  _muted = muted;
}

function play(fn: (ac: AudioContext) => void): void {
  if (_muted) return;
  try {
    fn(getCtx());
  } catch {
    // Audio not available — fail silently
  }
}

// ── Sounds ───────────────────────────────────────────────────

/** Soft ding — sale completed */
export function playSaleDing(): void {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.3);
  });
}

/** Ka-ching — big sale ($50+) */
export function playKaChing(): void {
  play((ac) => {
    const t = ac.currentTime;
    // Two quick high notes
    for (let i = 0; i < 2; i++) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1200 + i * 400, t + i * 0.1);
      gain.gain.setValueAtTime(0.08, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.15);
      osc.connect(gain).connect(ac.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.15);
    }
  });
}

/** Low buzz — error */
export function playError(): void {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, ac.currentTime);
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.25);
  });
}

/** Alert chime — high heat warning */
export function playAlert(): void {
  play((ac) => {
    const t = ac.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(800, t + i * 0.12);
      gain.gain.setValueAtTime(0.08, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.08);
      osc.connect(gain).connect(ac.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.08);
    }
  });
}

/** Click/tick — agent task complete */
export function playClick(): void {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ac.currentTime);
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.06);
  });
}

/** Startup jingle — retro 4-note ascending */
export function playStartup(): void {
  play((ac) => {
    const notes = [330, 440, 550, 660];
    const t = ac.currentTime;
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t + i * 0.15);
      gain.gain.setValueAtTime(0.08, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.2);
      osc.connect(gain).connect(ac.destination);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.2);
    });
  });
}

/** Mail notification — quick two-tone */
export function playMailNotif(): void {
  play((ac) => {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523, t);
    osc.frequency.setValueAtTime(659, t + 0.1);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

/** Game over doom sound */
export function playGameOver(): void {
  play((ac) => {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.8);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.8);
  });
}
