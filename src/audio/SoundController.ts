import { Howl } from 'howler';

class SoundController {
  private ambient: Howl | null = null;
  private weatherLayers: Record<string, Howl> = {};

  constructor() {
    // Structure for production audio
  }

  public playBase() {
    this.ambient?.play();
  }

  public updateWeatherAudio(weather: string) {
    Object.entries(this.weatherLayers).forEach(([type, howl]) => {
      if (type === weather) {
        howl.fade(howl.volume(), 0.5, 2000);
      } else {
        howl.fade(howl.volume(), 0, 2000);
      }
    });
  }

  public setMute(muted: boolean) {
    Object.values(this.weatherLayers).forEach(h => h.mute(muted));
    this.ambient?.mute(muted);
  }
}

export const soundController = new SoundController();
