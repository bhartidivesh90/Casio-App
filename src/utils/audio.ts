// Audio synthesizer for authentic tactile Casio key clicks
let audioCtx: AudioContext | null = null;

export const playKeySound = (soundType: 'standard' | 'action' | 'equals' | 'beep' = 'standard') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (soundType === 'beep') {
      // Casio error or mode switch beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    // Authentic tactile key click simulation
    // A quick damped pulse with high frequency mechanical click
    osc.type = soundType === 'equals' ? 'triangle' : 'sine';
    const baseFreq = soundType === 'action' ? 380 : soundType === 'equals' ? 520 : 280;
    
    osc.frequency.setValueAtTime(baseFreq * 2.5, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.015);

    // Ultra-short envelope for mechanical plastic snap
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    // Connect noise buffer for plastic click tactile transient
    const bufferSize = audioCtx.sampleRate * 0.008; // 8ms noise burst
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3200;
    noiseFilter.Q.value = 3;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.03, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    whiteNoise.start(now);
    osc.stop(now + 0.03);
    whiteNoise.stop(now + 0.01);
  } catch {
    // Gracefully ignore audio errors (e.g. autoplay permissions)
  }
};
