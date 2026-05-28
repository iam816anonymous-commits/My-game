import { Howl } from 'howler';
import { EvolutionLevel } from '../types';

export class AudioManager {
  private ambientLayers: Map<EvolutionLevel, Howl> = new Map();
  private initialized = false;

  constructor() {
    // Note: In a real production environment, these would be actual audio files.
    // Using placeholders or silent loops for now as per requirements.
    this.initLayers();
  }

  private initLayers() {
    // Simplified: Mapping evolution levels to specific ambient "moods"
    // In production, these would be separate files that layer on top of each other.
    const levels = Object.values(EvolutionLevel).filter(v => typeof v === 'number') as EvolutionLevel[];

    levels.forEach(level => {
        this.ambientLayers.set(level, new Howl({
            src: ['https://actions.google.com/sounds/v1/ambiences/wind_chimes_loop.ogg'], // Example ambient
            loop: true,
            volume: 0,
            autoplay: false
        }));
    });
  }

  public playCollect(combo: number) {
    if (!this.initialized) return;
    const sound = this.ambientLayers.get(1); // Reusing a layer for sfx for now
    if (sound) {
        sound.rate(1 + (combo * 0.1));
        sound.play();
    }
  }

  public update(level: EvolutionLevel) {
    if (!this.initialized) return;

    this.ambientLayers.forEach((howl, l) => {
      const targetVolume = l <= level ? 0.2 : 0;
      if (howl.volume() !== targetVolume) {
        howl.fade(howl.volume(), targetVolume, 2000);
        if (targetVolume > 0 && !howl.playing()) {
          howl.play();
        }
      }
    });
  }

  public resume() {
    if (!this.initialized) {
        this.initialized = true;
        this.ambientLayers.get(EvolutionLevel.Void)?.play();
        this.ambientLayers.get(EvolutionLevel.Void)?.fade(0, 0.2, 2000);
    }
  }
}
