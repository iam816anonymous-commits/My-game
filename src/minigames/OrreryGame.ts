import * as PIXI from 'pixi.js';

export class OrreryGame {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private orbit: PIXI.Graphics;
  private planet: PIXI.Graphics;
  private target: PIXI.Graphics;
  private angle: number = 0;
  private targetAngle: number = 0;
  private score: number = 0;
  private onComplete: (score: number) => void;

  constructor(app: PIXI.Application, onComplete: (score: number) => void) {
    this.app = app;
    this.onComplete = onComplete;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    const cx = app.screen.width / 2;
    const cy = app.screen.height / 2;

    this.orbit = new PIXI.Graphics();
    this.orbit.circle(cx, cy, 150).stroke({ color: 0xffffff, alpha: 0.1, width: 2 });
    this.container.addChild(this.orbit);

    this.target = new PIXI.Graphics();
    this.container.addChild(this.target);
    this.setNewTarget();

    this.planet = new PIXI.Graphics();
    this.planet.circle(0, 0, 10).fill({ color: 0x67E8F9 });
    this.container.addChild(this.planet);

    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointerdown', this.onCheck);
    this.app.ticker.add(this.update);
  }

  private setNewTarget() {
    this.targetAngle = Math.random() * Math.PI * 2;
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    this.target.clear();
    this.target.arc(cx, cy, 150, this.targetAngle - 0.2, this.targetAngle + 0.2).stroke({ color: 0xFDE68A, width: 6 });
  }

  private onCheck = () => {
    const diff = Math.abs(this.angle % (Math.PI * 2) - this.targetAngle);
    if (diff < 0.2 || diff > Math.PI * 2 - 0.2) {
        this.score += 1;
        this.setNewTarget();
    } else {
        this.onComplete(this.score * 5);
    }
  }

  private update = (ticker: PIXI.Ticker) => {
    this.angle += 0.05 * ticker.deltaTime;
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    this.planet.x = cx + Math.cos(this.angle) * 150;
    this.planet.y = cy + Math.sin(this.angle) * 150;
  }

  public destroy() {
    this.app.stage.off('pointerdown', this.onCheck);
    this.app.ticker.remove(this.update);
    this.container.destroy({ children: true });
  }
}
