// Audio synthesizer for crisp barcode scanner beeps using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playScannerBeep(type: 'success' | 'error' | 'warning' = 'success') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Trigger haptic vibration on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'success') navigator.vibrate(40);
      else if (type === 'error') navigator.vibrate([60, 40, 60]);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // Classic retail barcode scanner beep (crisp 1850Hz tone)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, now);
      osc.frequency.exponentialRampToValueAtTime(1950, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'error') {
      // Low dual warning buzzer
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Warning single tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}
