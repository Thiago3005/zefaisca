
import { SoundEffectKey } from '../types';

// Options for playing a sound
interface SoundOptions {
  volume?: number;      // Overrides default/global volume for this instance (0.0 to 1.0)
  loop?: boolean;       // If the sound should loop (primarily for music or continuous effects)
  playbackRate?: number;// Speed of playback
  id?: string;          // Unique ID for managing stoppable/loopable sounds
  pan?: number;         // Stereo panning (-1 left, 0 center, 1 right)
  // --- Synthesis specific params (can be expanded) ---
  frequency?: number;   // Base frequency for tonal sounds
  duration?: number;    // Duration for non-decaying sounds
  attack?: number;      // Attack time for envelope
  decay?: number;       // Decay time for envelope
  type?: OscillatorType;// Oscillator type
}

interface SoundParams {
  volumeMultiplier?: number;
  baseFrequency?: number;
  baseDuration?: number;
  oscillatorType?: OscillatorType;
}

// Store default parameters for synthesized sounds if needed (e.g., base volume)
const SOUND_PARAM_OVERRIDES: Partial<Record<SoundEffectKey, SoundParams>> = {
  player_shoot_magic: { volumeMultiplier: 0.3, baseFrequency: 660, oscillatorType: 'triangle' },
  player_shoot_chinelo: { volumeMultiplier: 0.4, baseDuration: 0.15 },
  player_shoot_pipoca: { volumeMultiplier: 0.25, baseDuration: 0.05 },
  player_shoot_soap: { volumeMultiplier: 0.35, baseFrequency: 880, oscillatorType: 'sine' },
  player_shoot_plunger: { volumeMultiplier: 0.4, baseDuration: 0.1 },
  player_shoot_slipper: { volumeMultiplier: 0.5, baseDuration: 0.2 },
  player_shoot_chicken: { volumeMultiplier: 0.35 },
  player_jump: { volumeMultiplier: 0.4, baseFrequency: 440 },
  player_land: { volumeMultiplier: 0.5, baseDuration: 0.15 },
  player_hit: { volumeMultiplier: 0.7, baseDuration: 0.15 },
  player_death: { volumeMultiplier: 0.8, baseFrequency: 330, baseDuration: 0.8 },
  player_shield_block: { volumeMultiplier: 0.6, baseFrequency: 1500, baseDuration: 0.15, oscillatorType: 'triangle' }, // Adjusted for new synth
  player_dodge: { volumeMultiplier: 0.5, baseFrequency: 900, baseDuration: 0.15 },
  enemy_hit_generic: { volumeMultiplier: 0.5, baseDuration: 0.1 },
  enemy_hit_slime: { volumeMultiplier: 0.45, baseDuration: 0.15 },
  enemy_death_generic: { volumeMultiplier: 0.6, baseFrequency: 220, baseDuration: 0.5 },
  enemy_death_slime: { volumeMultiplier: 0.55, baseDuration: 0.4 },
  enemy_shoot_generic: { volumeMultiplier: 0.3, baseFrequency: 440, oscillatorType: 'square' },
  enemy_shoot_ufo: { volumeMultiplier: 0.35, baseFrequency: 700, oscillatorType: 'sawtooth' },
  enemy_shoot_alien: { volumeMultiplier: 0.3, baseFrequency: 500, oscillatorType: 'square' },
  sombra_obscure_cast: { volumeMultiplier: 0.7, baseFrequency: 150, baseDuration: 1.0 },
  tecelao_gravity_cast: { volumeMultiplier: 0.8, baseFrequency: 100, baseDuration: 1.2 },
  sentinela_heal_cast: { volumeMultiplier: 0.6, baseFrequency: 1000, baseDuration: 0.5 },
  sentinela_heal_beam_loop: { volumeMultiplier: 0.3, baseFrequency: 1200, oscillatorType: 'sine' }, // Will be a continuous tone
  boss_spawn: { volumeMultiplier: 0.9, baseFrequency: 80, baseDuration: 2.5 },
  boss_hit: { volumeMultiplier: 0.8, baseDuration: 0.25 },
  boss_death: { volumeMultiplier: 1.0, baseFrequency: 150, baseDuration: 3.0 },
  boss_attack_homing: { volumeMultiplier: 0.5, baseFrequency: 300, oscillatorType: 'sawtooth' },
  boss_attack_beam_charge: { volumeMultiplier: 0.7, baseFrequency: 100, baseDuration: 1.5 }, // Rising pitch
  boss_attack_beam_fire: { volumeMultiplier: 0.6, baseFrequency: 400, oscillatorType: 'sawtooth' }, // Continuous, modulated
  boss_attack_slam_warn: { volumeMultiplier: 0.7, baseFrequency: 200, baseDuration: 0.8 },
  boss_attack_slam_impact: { volumeMultiplier: 1.0, baseDuration: 0.4 },
  projectile_bounce: { volumeMultiplier: 0.4, baseFrequency: 600, baseDuration: 0.1 },
  projectile_explode: { volumeMultiplier: 0.7, baseDuration: 0.3 },
  projectile_impact_wall: { volumeMultiplier: 0.3, baseDuration: 0.08 },
  orb_collect_heal: { volumeMultiplier: 0.5, baseFrequency: 800 },
  entropic_fragment_collect: { volumeMultiplier: 0.45, baseFrequency: 900 },
  upgrade_select: { volumeMultiplier: 0.5, baseFrequency: 700, baseDuration: 0.2 },
  level_up: { volumeMultiplier: 0.8 }, // Fanfare
  wave_start: { volumeMultiplier: 0.7 }, // Fanfare
  meteor_warn: { volumeMultiplier: 0.6, baseFrequency: 300, baseDuration: 0.5 }, // Descending pitch
  meteor_impact: { volumeMultiplier: 0.9, baseDuration: 0.35 },
  ui_button_click: { volumeMultiplier: 0.3, baseFrequency: 1000, baseDuration: 0.05 },
  ui_modal_open: { volumeMultiplier: 0.4, baseFrequency: 500, baseDuration: 0.2 },
  ui_modal_close: { volumeMultiplier: 0.4, baseFrequency: 400, baseDuration: 0.2 },
  game_over_fanfare: { volumeMultiplier: 0.8 }, // Fanfare
  ambient_music_menu: { volumeMultiplier: 0.2 },
  ambient_music_game: { volumeMultiplier: 0.15 },
};


interface ActiveSourceEntry {
  source: AudioScheduledSourceNode;
  gainNode?: GainNode; // For individual volume control of looped sounds
  pannerNode?: StereoPannerNode;
  isMusic?: boolean; // Special flag for music tracks
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.5; // Default volume
  private musicVolume: number = 0.4; // Separate volume for music
  private sfxVolume: number = 0.6;   // Separate volume for SFX
  private isMuted: boolean = false;
  private masterGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  
  private activeSources: Map<string, ActiveSourceEntry[]> = new Map();

  constructor() {
    // AudioContext will be initialized on first user interaction (common practice)
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.value = this.masterVolume;
        this.masterGainNode.connect(this.audioContext.destination);

        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.gain.value = this.musicVolume;
        this.musicGainNode.connect(this.masterGainNode);

        this.sfxGainNode = this.audioContext.createGain();
        this.sfxGainNode.gain.value = this.sfxVolume;
        this.sfxGainNode.connect(this.masterGainNode);

      } catch (e) {
        console.error("Web Audio API is not supported or could not be initialized.", e);
        this.audioContext = null;
      }
    }
    // If context was suspended, resume it
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private _createOscillator(
    freq: number,
    type: OscillatorType = 'sine',
    detune: number = 0
  ): OscillatorNode | null {
    if (!this.audioContext) return null;
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    return osc;
  }
  
  private _createNoiseBuffer(duration: number = 0.5): AudioBuffer | null {
      if (!this.audioContext) return null;
      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1; // White noise
      }
      return buffer;
  }

  private _createNoiseSource(duration: number = 0.5): AudioBufferSourceNode | null {
      if (!this.audioContext) return null;
      const noiseBuffer = this._createNoiseBuffer(duration);
      if (!noiseBuffer) return null;
      const noiseSource = this.audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      return noiseSource;
  }


  // --- Synthesis Functions ---

  private _synthesizeShortTone(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode) return;
    const params = SOUND_PARAM_OVERRIDES[key] || {};
    const now = this.audioContext.currentTime;
    
    const osc = this._createOscillator(
        options.frequency ?? params.baseFrequency ?? 440,
        options.type ?? params.oscillatorType ?? 'sine'
    );
    if (!osc) return;

    const gainNode = this.audioContext.createGain();
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 1.0);
    const duration = options.duration ?? params.baseDuration ?? 0.1;
    const attack = options.attack ?? 0.005;
    const decay = options.decay ?? (duration - attack);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(overallVolume, now + attack);
    gainNode.gain.linearRampToValueAtTime(0, now + attack + Math.max(0.01, decay));
    
    osc.connect(gainNode);
    gainNode.connect(this.sfxGainNode);
    osc.start(now);
    osc.stop(now + duration + 0.05); // Add a small buffer for ramps
  }

  private _synthesizeNoiseBurst(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode) return;
    const params = SOUND_PARAM_OVERRIDES[key] || {};
    const now = this.audioContext.currentTime;
    const duration = options.duration ?? params.baseDuration ?? 0.1;

    const noiseSource = this._createNoiseSource(duration);
    if (!noiseSource) return;

    const gainNode = this.audioContext.createGain();
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 1.0);
    const attack = options.attack ?? 0.005;
    const decay = options.decay ?? (duration * 0.9);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(overallVolume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + Math.max(0.01, decay));

    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(key === 'player_land' ? 800 : (key === 'projectile_explode' || key === 'meteor_impact' || key === 'boss_attack_slam_impact' ? 5000 : 2000) , now);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGainNode);
    noiseSource.start(now);
    noiseSource.stop(now + duration + 0.05);
  }
  
  private _synthesizeFanfare(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode) return;
    const params = SOUND_PARAM_OVERRIDES[key] || {};
    const now = this.audioContext.currentTime;
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 1.0);

    const notes = key === 'level_up' ?
        [{ freq: 523.25, time: 0, dur: 0.15 }, { freq: 659.25, time: 0.15, dur: 0.15 }, { freq: 783.99, time: 0.3, dur: 0.25 }] : // C5, E5, G5
        key === 'wave_start' ?
        [{ freq: 440, time: 0, dur: 0.1 }, { freq: 587.33, time: 0.1, dur: 0.1 }, { freq: 659.25, time: 0.2, dur: 0.2 }] : // A4, D5, E5
        []; // game_over_fanfare could be more complex or just a descending tone

    notes.forEach(note => {
        const osc = this._createOscillator(note.freq, params.oscillatorType ?? 'triangle');
        if(!osc) return;
        const gainNode = this.audioContext!.createGain();
        gainNode.gain.setValueAtTime(0, now + note.time);
        gainNode.gain.linearRampToValueAtTime(overallVolume, now + note.time + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + note.time + note.dur);
        osc.connect(gainNode);
        gainNode.connect(this.sfxGainNode!);
        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur + 0.05);
    });
  }

  private _synthesizeShieldBlockSound(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode) return;
    const params = SOUND_PARAM_OVERRIDES[key] || {}; // Use params for base values
    const now = this.audioContext.currentTime;
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 0.6);
    const duration = options.duration ?? params.baseDuration ?? 0.15;

    // Tonal part (sharp, high pitch)
    const osc = this._createOscillator(
        options.frequency ?? params.baseFrequency ?? 1500,
        options.type ?? params.oscillatorType ?? 'triangle', // Changed to triangle from SOUND_PARAM_OVERRIDES
        (Math.random() - 0.5) * 10 
    );
    if (osc) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(overallVolume * 0.8, now + 0.005); // Sharp attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Quick decay

        osc.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + duration + 0.05);
    }

    // Click/Impact part (short noise burst)
    const noiseSource = this._createNoiseSource(0.05); // Very short noise
    if (noiseSource) {
        const noiseGainNode = this.audioContext.createGain();
        noiseGainNode.gain.setValueAtTime(0, now);
        noiseGainNode.gain.linearRampToValueAtTime(overallVolume * 0.6, now + 0.002); // Sharp attack for click
        noiseGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05); // Quick decay

        const filter = this.audioContext.createBiquadFilter();
        filter.type = "bandpass"; 
        filter.frequency.setValueAtTime(2500, now); // Higher frequency focus for 'snap'
        filter.Q.setValueAtTime(1.5, now);

        noiseSource.connect(filter);
        filter.connect(noiseGainNode);
        noiseGainNode.connect(this.sfxGainNode);
        noiseSource.start(now);
        noiseSource.stop(now + 0.05 + 0.05);
    }
  }


  // --- Public Methods ---

  playSound(key: SoundEffectKey, options: SoundOptions = {}): void {
    this.initAudioContext(); // Ensure context is active
    if (!this.audioContext || this.isMuted) return;

    // Special handling for music as it uses a different gain node and logic
    if (key === 'ambient_music_menu') { this.playMenuMusic(options); return; }
    if (key === 'ambient_music_game') { this.playGameMusic(options); return; }
    
    if (!this.sfxGainNode) return;


    switch (key) {
      case 'ui_button_click':
      case 'player_shoot_soap': // Similar short, bright tone
      case 'upgrade_select':
      case 'projectile_bounce':
        this._synthesizeShortTone(key, options);
        break;
      
      case 'player_shield_block': // Call the new specific function
        this._synthesizeShieldBlockSound(key, options);
        break;

      case 'player_jump':
        this._synthesizeShortTone(key, { ...options, type: 'sine', decay: 0.15 }); // Rising pitch might be nice but harder
        break;
      case 'orb_collect_heal':
      case 'entropic_fragment_collect':
         this._synthesizeShortTone(key, { ...options, type: 'sine', attack:0.01, decay: 0.2, frequency: (SOUND_PARAM_OVERRIDES[key]?.baseFrequency ?? 800) + Math.random()*100 });
        break;

      case 'player_shoot_magic':
      case 'enemy_shoot_generic':
      case 'enemy_shoot_ufo':
      case 'enemy_shoot_alien':
      case 'boss_attack_homing':
        this._synthesizeShortTone(key, {
            ...options,
            type: SOUND_PARAM_OVERRIDES[key]?.oscillatorType ?? 'triangle',
            duration: options.duration ?? SOUND_PARAM_OVERRIDES[key]?.baseDuration ?? 0.15,
            decay: options.decay ?? SOUND_PARAM_OVERRIDES[key]?.baseDuration ?? 0.15 * 0.8,
        });
        break;

      case 'player_hit':
      case 'enemy_hit_generic':
      case 'boss_hit':
      case 'projectile_impact_wall':
      case 'player_land': // Thud
      case 'player_shoot_chinelo': // Percussive
      case 'player_shoot_slipper':
      case 'player_shoot_plunger':
        this._synthesizeNoiseBurst(key, options);
        break;

      case 'player_shoot_pipoca': // Multiple small bursts
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this._synthesizeNoiseBurst(key, {...options, volume: (options.volume ?? 1) * 0.5, duration: 0.03}), i * 30);
        }
        break;
      
      case 'enemy_hit_slime': // Squishy
         this._synthesizeNoiseBurst(key, {...options, duration: 0.15}); // Add pitch bend later if complex
        break;

      case 'projectile_explode':
      case 'meteor_impact':
      case 'boss_attack_slam_impact':
        this._synthesizeNoiseBurst(key, {...options, duration: (options.duration ?? SOUND_PARAM_OVERRIDES[key]?.baseDuration ?? 0.3) });
        break;
        
      case 'player_death':
      case 'enemy_death_generic':
      case 'boss_death': // Falling tone/noise
        // Simple falling tone for now
        const deathParams = SOUND_PARAM_OVERRIDES[key] || {};
        const deathOsc = this._createOscillator(options.frequency ?? deathParams.baseFrequency ?? 330, 'sawtooth');
        if (!deathOsc) break;
        const deathGain = this.audioContext.createGain();
        const deathVol = (options.volume ?? 1.0) * (deathParams.volumeMultiplier ?? 1.0);
        const deathDur = options.duration ?? deathParams.baseDuration ?? 0.5;
        deathGain.gain.setValueAtTime(deathVol, this.audioContext.currentTime);
        deathGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + deathDur);
        deathOsc.frequency.setValueAtTime(options.frequency ?? deathParams.baseFrequency ?? 330, this.audioContext.currentTime);
        deathOsc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + deathDur * 0.8);
        deathOsc.connect(deathGain); deathGain.connect(this.sfxGainNode);
        deathOsc.start(); deathOsc.stop(this.audioContext.currentTime + deathDur);
        break;

      case 'sombra_obscure_cast':
      case 'tecelao_gravity_cast':
      case 'boss_spawn': // Low, sustained, possibly rising/falling pitch
        const castParams = SOUND_PARAM_OVERRIDES[key] || {};
        const castOsc = this._createOscillator(options.frequency ?? castParams.baseFrequency ?? 150, castParams.oscillatorType ?? 'sawtooth');
        if (!castOsc) break;
        const castGain = this.audioContext.createGain();
        const castVol = (options.volume ?? 1.0) * (castParams.volumeMultiplier ?? 1.0);
        const castDur = options.duration ?? castParams.baseDuration ?? 1.0;
        castGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        castGain.gain.linearRampToValueAtTime(castVol, this.audioContext.currentTime + castDur * 0.2);
        castGain.gain.setValueAtTime(castVol, this.audioContext.currentTime + castDur * 0.8);
        castGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + castDur);
        if (key === 'boss_spawn') {
            castOsc.frequency.setValueAtTime(castParams.baseFrequency! * 0.8, this.audioContext.currentTime);
            castOsc.frequency.linearRampToValueAtTime(castParams.baseFrequency!, this.audioContext.currentTime + castDur);
        }
        castOsc.connect(castGain); castGain.connect(this.sfxGainNode);
        castOsc.start(); castOsc.stop(this.audioContext.currentTime + castDur);
        break;

      case 'boss_attack_beam_charge':
          this._synthesizeBeamCharge(key,options);
          break;
      case 'boss_attack_beam_fire': // Loopable
          this._synthesizeBeamFire(key,options);
          break;
      case 'sentinela_heal_beam_loop':
          this._synthesizeHealBeam(key,options);
          break;


      case 'level_up':
      case 'wave_start':
      case 'game_over_fanfare':
        this._synthesizeFanfare(key, options);
        break;
      
      case 'meteor_warn': // Descending tone
        const warnParams = SOUND_PARAM_OVERRIDES[key] || {};
        const warnOsc = this._createOscillator(options.frequency ?? warnParams.baseFrequency ?? 400, 'triangle');
        if (!warnOsc) break;
        const warnGain = this.audioContext.createGain();
        const warnVol = (options.volume ?? 1.0) * (warnParams.volumeMultiplier ?? 1.0);
        const warnDur = options.duration ?? warnParams.baseDuration ?? 0.5;
        warnGain.gain.setValueAtTime(warnVol, this.audioContext.currentTime);
        warnGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + warnDur);
        warnOsc.frequency.setValueAtTime(options.frequency ?? warnParams.baseFrequency ?? 400, this.audioContext.currentTime);
        warnOsc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + warnDur * 0.9);
        warnOsc.connect(warnGain); warnGain.connect(this.sfxGainNode);
        warnOsc.start(); warnOsc.stop(this.audioContext.currentTime + warnDur);
        break;


      default:
        console.warn(`Synthesizer for sound key "${key}" not implemented or uses default.`);
        this._synthesizeShortTone(key, options); // Fallback to a simple tone
    }
  }

  private _synthesizeBeamCharge(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode || !options.id) return;
    this.stopSound(options.id); // Stop previous if any

    const params = SOUND_PARAM_OVERRIDES[key] || {};
    const now = this.audioContext.currentTime;
    const duration = options.duration ?? params.baseDuration ?? 1.5;
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 1.0);

    const osc = this._createOscillator(params.baseFrequency ?? 100, params.oscillatorType ?? 'sawtooth');
    if (!osc) return;
    const gainNode = this.audioContext.createGain();

    osc.frequency.setValueAtTime(params.baseFrequency ?? 100, now);
    osc.frequency.linearRampToValueAtTime((params.baseFrequency ?? 100) * 3, now + duration * 0.8); // Rising pitch

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(overallVolume, now + duration * 0.2); // Fade in
    gainNode.gain.setValueAtTime(overallVolume, now + duration * 0.9); // Hold
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Fade out quickly at end


    osc.connect(gainNode);
    gainNode.connect(this.sfxGainNode);
    osc.start(now);
    osc.stop(now + duration); // Should stop automatically

    this.activeSources.set(options.id, [{ source: osc, gainNode }]);
}

  private _synthesizeBeamFire(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode || !options.id) return;
    this.stopSound(options.id);

    const params = SOUND_PARAM_OVERRIDES[key] || {};
    const now = this.audioContext.currentTime;
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 1.0);

    const osc = this._createOscillator(params.baseFrequency ?? 400, params.oscillatorType ?? 'sawtooth');
    if(!osc) return;
    const gainNode = this.audioContext.createGain();
    
    // LFO for intensity/modulation
    const lfo = this._createOscillator(5, 'sine'); // 5Hz LFO
    if(!lfo) return;
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 50; // Modulation depth for frequency

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency); // Modulate main oscillator frequency

    gainNode.gain.setValueAtTime(overallVolume, now); // Constant volume while beam is active

    osc.connect(gainNode);
    gainNode.connect(this.sfxGainNode);
    
    osc.start(now);
    lfo.start(now);
    // This sound needs to be stopped explicitly by calling stopSound(options.id)
    this.activeSources.set(options.id, [{ source: osc, gainNode }, {source: lfo}]);
}

  private _synthesizeHealBeam(key: SoundEffectKey, options: SoundOptions): void {
    if (!this.audioContext || !this.sfxGainNode || !options.id) return;
    this.stopSound(options.id);

    const params = SOUND_PARAM_OVERRIDES[key] || {};
    const now = this.audioContext.currentTime;
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 1.0);

    const osc = this._createOscillator(params.baseFrequency ?? 1200, params.oscillatorType ?? 'sine');
     if(!osc) return;
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(overallVolume * 0.5, now); // Softer sound

    osc.connect(gainNode);
    gainNode.connect(this.sfxGainNode);
    osc.start(now);
    // Needs explicit stop
    this.activeSources.set(options.id, [{ source: osc, gainNode }]);
  }

  playMenuMusic(options: SoundOptions = {}): void {
    this.initAudioContext();
    if (!this.audioContext || !this.musicGainNode || this.isMuted) return;
    this.stopSound('menu_music');

    const now = this.audioContext.currentTime;
    const params = SOUND_PARAM_OVERRIDES['ambient_music_menu'] || {};
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 0.3);
    const sources: ActiveSourceEntry[] = [];

    // Pad 1
    const pad1Osc = this._createOscillator(82.41, 'triangle'); // E2
    if(!pad1Osc) return;
    const pad1Gain = this.audioContext.createGain();
    pad1Gain.gain.setValueAtTime(0, now);
    pad1Gain.gain.linearRampToValueAtTime(overallVolume * 0.7, now + 3);
    pad1Osc.connect(pad1Gain); pad1Gain.connect(this.musicGainNode);
    pad1Osc.start(now);
    sources.push({ source: pad1Osc, gainNode: pad1Gain, isMusic: true });
    
    // Pad 2 (slightly detuned, higher octave)
    const pad2Osc = this._createOscillator(164.81, 'sine', 5); // E3 detuned
    if(!pad2Osc) return;
    const pad2Gain = this.audioContext.createGain();
    pad2Gain.gain.setValueAtTime(0, now);
    pad2Gain.gain.linearRampToValueAtTime(overallVolume * 0.5, now + 4);
    pad2Osc.connect(pad2Gain); pad2Gain.connect(this.musicGainNode);
    pad2Osc.start(now);
    sources.push({ source: pad2Osc, gainNode: pad2Gain, isMusic: true });

    this.activeSources.set('menu_music', sources);
  }

  playGameMusic(options: SoundOptions = {}): void {
    this.initAudioContext();
    if (!this.audioContext || !this.musicGainNode || this.isMuted) return;
    this.stopSound('game_music');

    const now = this.audioContext.currentTime;
    const params = SOUND_PARAM_OVERRIDES['ambient_music_game'] || {};
    const overallVolume = (options.volume ?? 1.0) * (params.volumeMultiplier ?? 0.2);
    const sources: ActiveSourceEntry[] = [];
    const bpm = 120; 
    const quarterNoteTime = 60 / bpm;

    // Bass line
    const bassOsc = this._createOscillator(55, 'square'); // A1
     if(!bassOsc) return;
    const bassGain = this.audioContext.createGain();
    bassOsc.connect(bassGain); bassGain.connect(this.musicGainNode);
    
    const bassPattern = [
        { freq: 55, time: 0*quarterNoteTime, dur: quarterNoteTime*0.9 }, // A1
        { freq: 55, time: 1*quarterNoteTime, dur: quarterNoteTime*0.9 },
        { freq: 65.41, time: 2*quarterNoteTime, dur: quarterNoteTime*0.9 }, // C2
        { freq: 65.41, time: 3*quarterNoteTime, dur: quarterNoteTime*0.9 },
    ];
    const bassLoopDuration = 4 * quarterNoteTime;

    function scheduleBass(loopStartTime: number) {
        bassPattern.forEach(note => {
            bassOsc!.frequency.setValueAtTime(note.freq, loopStartTime + note.time);
            bassGain.gain.setValueAtTime(overallVolume * 0.8, loopStartTime + note.time);
            bassGain.gain.setValueAtTime(0, loopStartTime + note.time + note.dur); // Quick decay
        });
    }
    
    bassOsc.start(now);
    sources.push({ source: bassOsc, gainNode: bassGain, isMusic: true });
    
    // Arpeggio
    const arpOsc = this._createOscillator(220, 'triangle'); // A3
    if(!arpOsc) return;
    const arpGain = this.audioContext.createGain();
    arpOsc.connect(arpGain); arpGain.connect(this.musicGainNode);

    const arpPattern = [
        { freq: 220, time: 0*quarterNoteTime*0.5, dur: quarterNoteTime*0.45}, // A3
        { freq: 329.63, time: 1*quarterNoteTime*0.5, dur: quarterNoteTime*0.45}, // E4
        { freq: 440, time: 2*quarterNoteTime*0.5, dur: quarterNoteTime*0.45}, // A4
        { freq: 329.63, time: 3*quarterNoteTime*0.5, dur: quarterNoteTime*0.45}, // E4
    ];
    const arpLoopDuration = 4 * quarterNoteTime * 0.5;

    function scheduleArp(loopStartTime: number) {
        arpPattern.forEach(note => {
            arpOsc!.frequency.setValueAtTime(note.freq, loopStartTime + note.time);
            arpGain.gain.setValueAtTime(overallVolume * 0.6, loopStartTime + note.time);
            arpGain.gain.setValueAtTime(0, loopStartTime + note.time + note.dur);
        });
    }
    arpOsc.start(now);
    sources.push({ source: arpOsc, gainNode: arpGain, isMusic: true });

    // Rudimentary loop scheduling using a recurring timeout
    // This is not sample-accurate but good enough for simple BGM
    let currentLoopTime = now;
    const looper = () => {
        scheduleBass(currentLoopTime);
        scheduleArp(currentLoopTime);
        currentLoopTime += bassLoopDuration; // Use the longest pattern's duration for loop sync
        
        // Check if music should still be playing before scheduling next loop
        if (this.activeSources.has('game_music')) {
           const timeToNextLoop = currentLoopTime - this.audioContext!.currentTime;
           const timeoutId = setTimeout(looper, timeToNextLoop * 1000);
           // Store timeout ID if needed for more robust stopping, for now rely on activeSources check
        }
    };
    looper(); // Start the loop

    this.activeSources.set('game_music', sources);
  }


  stopSound(id: string): void {
    if (!this.audioContext) return;
    const sourcesGroup = this.activeSources.get(id);
    if (sourcesGroup) {
      sourcesGroup.forEach(entry => {
        try {
          entry.source.stop();
          entry.source.disconnect();
          if (entry.gainNode) entry.gainNode.disconnect();
          if (entry.pannerNode) entry.pannerNode.disconnect();
        } catch (e) { /* Already stopped or disconnected */ }
      });
      this.activeSources.delete(id);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode && !this.isMuted) {
      this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.audioContext?.currentTime ?? 0);
    }
  }
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGainNode && !this.isMuted) {
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext?.currentTime ?? 0);
    }
  }
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGainNode && !this.isMuted) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext?.currentTime ?? 0);
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    const targetMasterVolume = this.isMuted ? 0 : this.masterVolume;
    if (this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(targetMasterVolume, this.audioContext?.currentTime ?? 0);
    }
    // Note: Individual music/sfx gain nodes are already routed through masterGainNode,
    // so muting masterGainNode effectively mutes everything.
    // If you wanted to mute only SFX or only Music, you'd target their respective gain nodes.
  }

  getIsMuted(): boolean { return this.isMuted; }
  getMasterVolume(): number { return this.masterVolume; }
  getMusicVolume(): number { return this.musicVolume; }
  getSfxVolume(): number { return this.sfxVolume; }

  // Call this on a user interaction to enable audio
  ensureAudioContext(): void {
    this.initAudioContext();
  }
}

const audioManager = new AudioManager();
// On first user interaction (e.g., a click anywhere, or specifically on a "start game" button), call:
// document.addEventListener('click', () => audioManager.ensureAudioContext(), { once: true });
// This should ideally be handled in App.tsx or a similar top-level component.

export default audioManager;
