import { Howl } from 'howler';

class SoundController {
  private ambient: Howl | null = null;
  private weatherLayers: Record<string, Howl> = {};

  constructor() {
  }

  public playBase() {
    if (!this.ambient) {
        this.ambient = new Howl({
            src: ['https://actions.google.com/sounds/v1/ambiences/night_ambience.ogg'],
            loop: true,
            volume: 0.3
        });
    }
    this.ambient.play();
  }

  public updateWeatherAudio(weather: string) {
    Object.entries(this.weatherLayers).forEach(([type, howl]) => {
      if (type === weather) {
        howl.fade(howl.volume(), 0.4, 3000);
      } else {
        howl.fade(howl.volume(), 0, 3000);
      }
    });
  }

  public setMute(muted: boolean) {
    Object.values(this.weatherLayers).forEach(h => h.mute(muted));
    this.ambient?.mute(muted);
  }
}

export const soundController = new SoundController();
