import * as PIXI from 'pixi.js';

export class FlowGame {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private line: PIXI.Graphics;
  private points: { x: number, y: number }[] = [];
  private onComplete: (score: number) => void;
  private isDrawing: boolean = false;

  constructor(app: PIXI.Application, onComplete: (score: number) => void) {
    this.app = app;
    this.onComplete = onComplete;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.line = new PIXI.Graphics();
    this.container.addChild(this.line);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', this.onStart);
    this.app.stage.on('pointermove', this.onMove);
    this.app.stage.on('pointerup', this.onEnd);
  }

  private onStart = (e: PIXI.FederatedPointerEvent) => {
    this.isDrawing = true;
    this.points = [{ x: e.global.x, y: e.global.y }];
  }

  private onMove = (e: PIXI.FederatedPointerEvent) => {
    if (!this.isDrawing) return;
    this.points.push({ x: e.global.x, y: e.global.y });
    if (this.points.length > 50) this.points.shift();
    this.draw();
  }

  private onEnd = () => {
    this.isDrawing = false;
    if (this.points.length > 20) {
        const score = Math.floor(this.points.length / 5);
        setTimeout(() => this.onComplete(score), 500);
    }
    this.points = [];
    this.line.clear();
  }

  private draw() {
    this.line.clear();
    if (this.points.length < 2) return;

    this.line.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
        const alpha = i / this.points.length;
        this.line.stroke({ color: 0xF9A8D4, width: 2 + alpha * 10, alpha: alpha * 0.5 });
        this.line.lineTo(this.points[i].x, this.points[i].y);
    }
  }

  public destroy() {
    this.app.stage.off('pointerdown', this.onStart);
    this.app.stage.off('pointermove', this.onMove);
    this.app.stage.off('pointerup', this.onEnd);
    this.container.destroy({ children: true });
  }
}
