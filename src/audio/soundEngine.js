// Real-Life Studio Audio Engine (Mixkit Real Recordings + Cozy Cafe BGM)
const AUDIO_FILES = {
  pour_tea: '/audio/pour_tea.mp3',
  pour_milk: '/audio/pour_milk.mp3',
  ice_drop: '/audio/ice_drop.mp3',
  boba_plop: '/audio/boba_plop.mp3',
  glass_clink: '/audio/glass_clink.mp3',
  slurp: '/audio/slurp.mp3',
  door_bell: '/audio/door_bell.mp3',
  happy_bell: '/audio/happy_bell.mp3',
  cash_coins: '/audio/cash_coins.mp3',
  coin_win: '/audio/coin_win.mp3',
  kitty_meow: '/audio/kitty_meow.mp3',
  cafe_bgm: '/audio/cafe_bgm.mp3',
};

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = false;
    this.cache = {};
    this.bgmAudio = null;
    this.preloaded = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  preload() {
    if (this.preloaded || typeof window === 'undefined') return;
    this.preloaded = true;
    Object.entries(AUDIO_FILES).forEach(([key, url]) => {
      if (key === 'cafe_bgm') return;
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.cache[key] = audio;
      } catch {
        // Ignore in headless/non-audio environments
      }
    });
  }

  playSample(key, { volume = 0.5, maxDurationMs = 1400, playbackRate = 1.0 } = {}) {
    if (!this.sfxEnabled || typeof window === 'undefined') return false;
    const url = AUDIO_FILES[key];
    if (!url) return false;
    try {
      const base = this.cache[key];
      const audio = base ? base.cloneNode(true) : new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.playbackRate = playbackRate;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
      if (maxDurationMs > 0) {
        setTimeout(() => {
          try {
            if (!audio.paused) {
              audio.pause();
              audio.currentTime = 0;
            }
          } catch {
            // Ignore cleanup errors
          }
        }, maxDurationMs);
      }
      return true;
    } catch {
      return false;
    }
  }

  playTone(freq, type = 'sine', duration = 0.14, gainVal = 0.1, slideTo = null) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
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
    } catch {
      // Ignore WebAudio fallback errors
    }
  }

  playClick() {
    this.playTone(620, 'sine', 0.055, 0.06, 860);
  }

  playPour() {
    this.playSample('pour_tea', { volume: 0.55, maxDurationMs: 1100, playbackRate: 1.05 });
  }

  playPourMilk() {
    this.playSample('pour_milk', { volume: 0.55, maxDurationMs: 1000, playbackRate: 1.0 });
  }

  playPearlDrop() {
    this.playSample('boba_plop', { volume: 0.62, maxDurationMs: 750, playbackRate: 1.05 + Math.random() * 0.12 });
  }

  playIceClink() {
    this.playSample('ice_drop', { volume: 0.52, maxDurationMs: 850, playbackRate: 1.0 });
  }

  playShake() {
    this.playSample('glass_clink', { volume: 0.48, maxDurationMs: 420, playbackRate: 1.15 + Math.random() * 0.15 });
  }

  playSealMachine() {
    this.playTone(170, 'triangle', 0.2, 0.09, 110);
    setTimeout(() => {
      this.playSample('happy_bell', { volume: 0.5, maxDurationMs: 1100, playbackRate: 1.08 });
    }, 180);
  }

  playSlurp() {
    this.playSample('slurp', { volume: 0.55, maxDurationMs: 950, playbackRate: 1.0 });
  }

  playDoorBell() {
    this.playSample('door_bell', { volume: 0.34, maxDurationMs: 1300, playbackRate: 1.0 });
  }

  playKittyMeow() {
    this.playSample('kitty_meow', { volume: 0.62, maxDurationMs: 1200, playbackRate: 1.0 });
  }

  playShutter() {
    this.playTone(1200, 'triangle', 0.04, 0.08, 450);
    setTimeout(() => this.playTone(1600, 'sine', 0.05, 0.06, 900), 65);
  }

  playCoin() {
    this.playSample('cash_coins', { volume: 0.52, maxDurationMs: 1100, playbackRate: 1.0 });
  }

  playSuccessFanfare() {
    this.playSample('coin_win', { volume: 0.58, maxDurationMs: 1700, playbackRate: 1.0 });
  }

  playAngrySplat() {
    this.playTone(195, 'sawtooth', 0.25, 0.16, 110);
    setTimeout(() => {
      this.playSample('boba_plop', { volume: 0.65, maxDurationMs: 650, playbackRate: 0.65 });
      this.playTone(130, 'square', 0.3, 0.14, 65);
    }, 140);
  }

  playAlienUFO() {
    const freqs = [440, 620, 510, 790, 560, 920];
    freqs.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.16, 0.11, f * 1.25), idx * 95);
    });
  }

  playLaser() {
    this.playTone(920, 'sawtooth', 0.12, 0.09, 210);
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (typeof window === 'undefined') return this.bgmEnabled;

    if (this.bgmEnabled) {
      try {
        if (!this.bgmAudio) {
          this.bgmAudio = new Audio(AUDIO_FILES.cafe_bgm);
          this.bgmAudio.loop = true;
          this.bgmAudio.volume = 0.24;
        }
        const p = this.bgmAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {
        // Ignore in headless environment
      }
    } else if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
      } catch {
        // Ignore
      }
    }
    return this.bgmEnabled;
  }
}

export const sound = new SoundEngine();
