// Procedural Web Audio API Sound Engine & Cozy Boba Cafe BGM
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = false;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.14, gainVal = 0.12, slideTo = null) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playClick() {
    this.playTone(580, 'triangle', 0.07, 0.1, 780);
  }

  playPour() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.linearRampToValueAtTime(980, now + 0.35);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playPearlDrop() {
    // Cute bubble pop "bloop!"
    this.playTone(280, 'sine', 0.11, 0.16, 660);
    setTimeout(() => this.playTone(340, 'sine', 0.09, 0.12, 740), 65);
  }

  playIceClink() {
    this.playTone(1850, 'sine', 0.09, 0.09, 2250);
    setTimeout(() => this.playTone(2150, 'triangle', 0.08, 0.08, 2500), 60);
  }

  playShake() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.09;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playSealMachine() {
    // Hydraulic press + ding!
    this.playTone(160, 'sawtooth', 0.25, 0.12, 95);
    setTimeout(() => this.playTone(980, 'sine', 0.22, 0.15, 1320), 240);
  }

  playCoin() {
    this.playTone(987.77, 'sine', 0.11, 0.14); // B5
    setTimeout(() => this.playTone(1318.51, 'sine', 0.24, 0.15), 85); // E6
  }

  playSuccessFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.22, 0.15), idx * 90);
    });
  }

  playAngrySplat() {
    // Angry buzzer + messy splash!
    this.playTone(190, 'sawtooth', 0.28, 0.2, 110);
    setTimeout(() => {
      this.playPour();
      this.playTone(130, 'square', 0.35, 0.18, 65);
    }, 150);
  }

  playAlienUFO() {
    const freqs = [440, 620, 510, 790, 560, 920];
    freqs.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.16, 0.12, f * 1.25), idx * 95);
    });
  }

  playLaser() {
    this.playTone(920, 'sawtooth', 0.13, 0.1, 210);
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.init();
      const chords = [
        [261.63, 329.63, 392.0, 493.88],  // Cmaj7
        [220.0, 261.63, 329.63, 392.0],   // Am7
        [174.61, 220.0, 261.63, 349.23],  // Fmaj7
        [196.0, 246.94, 293.66, 392.0],   // G6
      ];
      let step = 0;
      const playChord = () => {
        if (!this.bgmEnabled || !this.ctx) return;
        const chord = chords[step % chords.length];
        chord.forEach((freq, i) => {
          setTimeout(() => {
            if (!this.bgmEnabled) return;
            this.playTone(freq * 1.5, 'sine', 0.85, 0.032);
          }, i * 140);
        });
        step++;
      };
      playChord();
      this.bgmInterval = setInterval(playChord, 1800);
    } else if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    return this.bgmEnabled;
  }
}

export const sound = new SoundEngine();
