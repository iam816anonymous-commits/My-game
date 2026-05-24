import * as PIXI from 'pixi.js';

export class StardustGame {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private particles: PIXI.Graphics[] = [];
  private score: number = 0;
  private timer: number = 30;
  private onComplete: (score: number) => void;

  constructor(app: PIXI.Application, onComplete: (score: number) => void) {
    this.app = app;
    this.onComplete = onComplete;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.init();
  }

  private init() {
    for (let i = 0; i < 50; i++) {
      this.spawnParticle();
    }
    this.app.ticker.add(this.update);
  }

  private spawnParticle() {
    const p = new PIXI.Graphics();
    const color = Math.random() > 0.5 ? 0x67E8F9 : 0x8B5CF6;
    p.circle(0, 0, 5 + Math.random() * 5).fill({ color, alpha: 0.8 });
    p.x = Math.random() * this.app.screen.width;
    p.y = Math.random() * this.app.screen.height;
    p.eventMode = 'static';
    p.cursor = 'pointer';

    p.on('pointerdown', () => {
      this.score += 1;
      this.container.removeChild(p);
      this.spawnParticle();
    });

    this.container.addChild(p);
    this.particles.push(p);
  }

  private update = (ticker: PIXI.Ticker) => {
    this.timer -= ticker.deltaTime / 60;

    this.particles.forEach(p => {
        p.x += Math.sin(Date.now() * 0.001 + p.y) * 0.5;
        p.y += Math.cos(Date.now() * 0.001 + p.x) * 0.5;
    });

    if (this.timer <= 0) {
      this.stop();
    }
  }

  public stop() {
    this.app.ticker.remove(this.update);
    this.onComplete(this.score);
  }

  public destroy() {
    this.stop();
    this.container.destroy({ children: true });
  }
}
