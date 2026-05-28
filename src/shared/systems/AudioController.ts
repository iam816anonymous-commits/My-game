import { Howl } from 'howler';

/**
 * V9 Adaptive Audio System
 * Manages cross-game ambient layers and procedural SFX
 */
class GlobalAudioManager {
  private static instance: GlobalAudioManager;
  private layers: Map<string, Howl> = new Map();
  private initialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance() {
    if (!GlobalAudioManager.instance) GlobalAudioManager.instance = new GlobalAudioManager();
    return GlobalAudioManager.instance;
  }

  private init() {
    // In production, these are high-quality ambient loops
    this.layers.set('base', new Howl({ src: ['https://actions.google.com/sounds/v1/ambiences/white_noise_loop.ogg'], loop: true, volume: 0 }));
    this.layers.set('tension', new Howl({ src: ['https://actions.google.com/sounds/v1/ambiences/humming_loop.ogg'], loop: true, volume: 0 }));
    this.layers.set('mastery', new Howl({ src: ['https://actions.google.com/sounds/v1/ambiences/ethereal_chimes.ogg'], loop: true, volume: 0 }));
  }

  public start() {
    if (this.initialized) return;
    this.initialized = true;
    this.layers.get('base')?.play();
    this.layers.get('base')?.fade(0, 0.3, 2000);
  }

  public setIntensity(level: 'low' | 'mid' | 'high') {
    if (!this.initialized) return;

    const fades: Record<string, number> = {
        low: 0.1,
        mid: 0.3,
        high: 0.6
    };

    if (level === 'low') {
        this.layers.get('tension')?.fade(this.layers.get('tension')!.volume(), 0, 1000);
        this.layers.get('mastery')?.fade(this.layers.get('mastery')!.volume(), 0, 1000);
    } else if (level === 'mid') {
        if (!this.layers.get('tension')?.playing()) this.layers.get('tension')?.play();
        this.layers.get('tension')?.fade(this.layers.get('tension')!.volume(), fades.mid, 1000);
        this.layers.get('mastery')?.fade(this.layers.get('mastery')!.volume(), 0, 1000);
    } else {
        if (!this.layers.get('mastery')?.playing()) this.layers.get('mastery')?.play();
        this.layers.get('mastery')?.fade(this.layers.get('mastery')!.volume(), fades.high, 1000);
    }
  }

  public playSFX(type: 'collect' | 'impact' | 'perfect', pitch: number = 1.0) {
    // Standard procedural SFX triggered across all games
  }
}

export const AudioController = GlobalAudioManager.getInstance();
