import { Howl } from 'howler';

class SoundController {
  private ambient: Howl | null = null;

  public playBase() {
    if (!this.ambient) {
        this.ambient = new Howl({
            src: ['https://actions.google.com/sounds/v1/ambiences/night_ambience.ogg'],
            loop: true,
            volume: 0.3,
            html5: true
        });
    }
    this.ambient.play();
  }

  public setMute(muted: boolean) {
    this.ambient?.mute(muted);
  }
}

export const soundController = new SoundController();
