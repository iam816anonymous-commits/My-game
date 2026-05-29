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

  public setIntensity(level: 'discovery' | 'comfort' | 'challenge' | 'mastery') {
    if (!this.initialized) return;

    const fades: Record<string, number> = {
        discovery: 0.1,
        comfort: 0.2,
        challenge: 0.4,
        mastery: 0.7
    };

    const tension = this.layers.get('tension');
    const mastery = this.layers.get('mastery');

    if (level === 'discovery') {
        tension?.fade(tension.volume(), 0, 2000);
        mastery?.fade(mastery.volume(), 0, 2000);
    } else if (level === 'comfort') {
        if (!tension?.playing()) tension?.play();
        tension?.fade(tension!.volume(), fades.comfort, 2000);
        mastery?.fade(mastery.volume(), 0, 2000);
    } else if (level === 'challenge') {
        if (!tension?.playing()) tension?.play();
        tension?.fade(tension!.volume(), fades.challenge, 2000);
        mastery?.fade(mastery.volume(), 0, 2000);
    } else if (level === 'mastery') {
        if (!mastery?.playing()) mastery?.play();
        mastery?.fade(mastery!.volume(), fades.mastery, 2000);
    }
  }

  public playSFX(type: 'collect' | 'impact' | 'perfect', pitch: number = 1.0) {
    // Standard procedural SFX triggered across all games
  }
}

export const AudioController = GlobalAudioManager.getInstance();
