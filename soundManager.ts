
// soundManager.ts

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private isInitialized = false;

  constructor() {
    // The AudioContext should be created after a user gesture.
  }

  public init(): boolean {
    if (this.isInitialized && this.audioContext && this.audioContext.state === 'running') {
      return true;
    }
    try {
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Attempt to resume if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log("AudioContext resumed successfully.");
          this.setupMasterGain();
          this.isInitialized = true;
        }).catch(e => console.error("Failed to resume AudioContext:", e));
      } else if (this.audioContext.state === 'running') {
         this.setupMasterGain();
         this.isInitialized = true;
      }
      return this.isInitialized;

    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
      this.isInitialized = false;
      return false;
    }
  }

  private setupMasterGain() {
    if (!this.audioContext) return;
    if (this.masterGainNode) {
      this.masterGainNode.disconnect();
    }
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
    this.masterGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime); // Default master volume
  }

  private playSound(
    frequency: number,
    type: OscillatorType = 'sine',
    duration: number = 0.1,
    volume: number = 0.5,
    attack: number = 0.005,
    decay: number = 0.01,
    sustainRatio: number = 0.7, // Ratio of peak volume
    release: number = 0.05,
    freq2?: number, // For sweeps or dual tones
    freq2Type?: OscillatorType,
    detuneAmount?: number // For detuning/distortion
  ) {
    if (!this.audioContext || !this.masterGainNode || this.audioContext.state !== 'running' || !this.isInitialized) return;

    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.masterGainNode);

    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (detuneAmount) {
        osc.detune.setValueAtTime(detuneAmount, now);
        osc.detune.linearRampToValueAtTime(0, now + duration * 0.5); // Detune fades
    }

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(volume * sustainRatio, now + attack + decay);

    const releaseStartTime = now + Math.max(0, duration - release);
    if (releaseStartTime > now + attack + decay) {
         gainNode.gain.setValueAtTime(volume * sustainRatio, releaseStartTime);
    }
    gainNode.gain.linearRampToValueAtTime(0, releaseStartTime + release);

    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + duration);

    if (freq2 && freq2Type) {
        const osc2 = this.audioContext.createOscillator();
        osc2.type = freq2Type;
        osc2.frequency.setValueAtTime(freq2, now);
        if (detuneAmount) {
            osc2.detune.setValueAtTime(-detuneAmount, now); // Opposite detune for stereo/chorus like effect
            osc2.detune.linearRampToValueAtTime(0, now + duration * 0.5);
        }
        osc2.connect(gainNode);
        osc2.start(now);
        osc2.stop(now + duration);
        osc2.onended = () => osc2.disconnect();
    }

    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  }

  // Specific game sounds
  public playPlayerShoot() {
    this.playSound(880, 'triangle', 0.08, 0.2, 0.005, 0.01, 0.6, 0.05);
    this.playSound(1200, 'sine', 0.06, 0.1, 0.01, 0.02, 0.5, 0.04); // click/zap
  }

  public playEnemyShoot() {
    this.playSound(660, 'square', 0.1, 0.15, 0.01, 0.02, 0.7, 0.05);
  }

  public playEnemyHit() {
    this.playSound(220, 'sawtooth', 0.12, 0.25, 0.005, 0.05, 0.3, 0.06);
    this.playSound(440, 'square', 0.1, 0.1, 0.01, 0.08, 0.1, 0.05);
  }

  public playPlayerDamage() {
    this.playSound(160, 'sawtooth', 0.3, 0.4, 0.01, 0.1, 0.8, 0.15);
    this.playSound(120, 'sine', 0.3, 0.3, 0.02, 0.1, 0.7, 0.15);
  }

  public playEnemyDefeat() {
    this.playSound(300, 'sine', 0.3, 0.3, 0.01, 0.05, 0.1, 0.2);
    this.playSound(150, 'sawtooth', 0.35, 0.25, 0.02, 0.1, 0.05, 0.2, 50); // Descending pitch (freq2 is target)
  }

  public playUIClick() {
    this.playSound(1200, 'square', 0.05, 0.2, 0.001, 0.01, 0.5, 0.03);
  }

  public playWaveStart() {
    this.playSound(440, 'sine', 0.2, 0.3, 0.01, 0.05, 0.8, 0.1);
    this.audioContext?.resume().then(() => { // ensure context is active for timed sounds
        if (!this.audioContext) return;
        setTimeout(() => this.playSound(554.37, 'sine', 0.2, 0.3, 0.01, 0.05, 0.8, 0.1), 150);
        setTimeout(() => this.playSound(659.25, 'sine', 0.25, 0.35, 0.01, 0.05, 0.8, 0.1), 300);
    });
  }

  public playGameOverSound() {
    this.playSound(200, 'sawtooth', 1.0, 0.4, 0.01, 0.2, 0.5, 0.7, 50); // Descending
  }

  public playAscensionTrigger() {
    this.playSound(800, 'sawtooth', 0.5, 0.35, 0.01, 0.1, 0.7, 0.3, 1200); // Rising
    this.playSound(1000, 'sine', 0.6, 0.25, 0.05, 0.15, 0.6, 0.3, 1500); // Shimmer
  }

  public playAnomalySound() {
    this.playSound(200 + Math.random() * 800, 'sawtooth', 0.2, 0.3, 0.001, 0.001, 0.9, 0.15, 100 + Math.random() * 500, 'noise' as OscillatorType, Math.random() * 1200 - 600); // 'noise' is not standard, use sawtooth with detune for similar effect
  }
}

// Export a single instance
export const soundManager = new SoundManager();
