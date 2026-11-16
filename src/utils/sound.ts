let audioCtx: AudioContext | null = null;

export function playBeep(enabled: boolean, freq = 880, duration = 0.12): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = audioCtx || new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Audio playback blocked or unavailable
  }
}

export function playLevelUpChime(enabled: boolean): void {
  playBeep(enabled, 523.25, 0.14);
  setTimeout(() => playBeep(enabled, 659.25, 0.16), 130);
  setTimeout(() => playBeep(enabled, 783.99, 0.22), 260);
  setTimeout(() => playBeep(enabled, 1046.5, 0.32), 400);
}
