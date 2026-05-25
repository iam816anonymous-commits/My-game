import * as PIXI from 'pixi.js';

export class LinkGame {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private dots: PIXI.Graphics[] = [];
  private lines: PIXI.Graphics;
  private activePoints: number[] = [];
  private onComplete: (score: number) => void;

  constructor(app: PIXI.Application, onComplete: (score: number) => void) {
    this.app = app;
    this.onComplete = onComplete;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.lines = new PIXI.Graphics();
    this.container.addChild(this.lines);

    this.initDots();
  }

  private initDots() {
    const positions = [
        { x: 100, y: 100 }, { x: 300, y: 150 }, { x: 500, y: 100 },
        { x: 150, y: 300 }, { x: 450, y: 350 }, { x: 300, y: 500 }
    ];

    positions.forEach((pos, i) => {
        const dot = new PIXI.Graphics();
        dot.circle(0, 0, 10).fill({ color: 0xffffff, alpha: 0.5 });
        dot.x = pos.x;
        dot.y = pos.y;
        dot.eventMode = 'static';
        dot.cursor = 'pointer';

        dot.on('pointerdown', () => {
            if (!this.activePoints.includes(i)) {
                this.activePoints.push(i);
                dot.clear().circle(0, 0, 10).fill({ color: 0x67E8F9, alpha: 0.9 });
                this.drawLines();

                if (this.activePoints.length === positions.length) {
                    setTimeout(() => this.onComplete(50), 500);
                }
            }
        });

        this.container.addChild(dot);
        this.dots.push(dot);
    });
  }

  private drawLines() {
    this.lines.clear();
    if (this.activePoints.length < 2) return;

    this.lines.moveTo(this.dots[this.activePoints[0]].x, this.dots[this.activePoints[0]].y);
    for (let i = 1; i < this.activePoints.length; i++) {
        this.lines.stroke({ color: 0x67E8F9, width: 2, alpha: 0.6 });
        this.lines.lineTo(this.dots[this.activePoints[i]].x, this.dots[this.activePoints[i]].y);
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
