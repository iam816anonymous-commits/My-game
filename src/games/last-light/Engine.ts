import * as PIXI from 'pixi.js';

export class Engine {
  public app: PIXI.Application;
  private static instance: Engine;

  private constructor() {
    this.app = new PIXI.Application();
  }

  public static async getInstance(): Promise<Engine> {
    if (!Engine.instance || !Engine.instance.app.renderer) {
      Engine.instance = new Engine();
      await Engine.instance.init();
    }
    return Engine.instance;
  }

  private handleResize = () => {
    const parent = this.app.canvas.parentElement;
    if (parent) {
        this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
    }
  };

  private async init() {
    await this.app.init({
      background: '#0a0a0c',
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
      hello: false,
    });

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  public get stage() {
    return this.app.stage;
  }

  public get renderer() {
    return this.app.renderer;
  }

  public get ticker() {
    return this.app.ticker;
  }

  public get view() {
    return this.app.canvas;
  }

  public destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.app.destroy({
      removeView: true
    });
  }
}
