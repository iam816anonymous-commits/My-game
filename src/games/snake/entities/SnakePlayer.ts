import * as PIXI from 'pixi.js';

export class SnakePlayer {
  public container: PIXI.Container;
  private head: PIXI.Graphics;
  private bodyLayer: PIXI.Graphics;
  private points: PIXI.Point[] = [];

  public x: number = 400;
  public y: number = 300;
  private angle: number = 0;
  private targetAngle: number = 0;
  public speed: number = 3;
  public length: number = 30;
  public tunneling: number = 0; // seconds remaining
  private pulse: number = 0;

  constructor(stage: PIXI.Container) {
    this.container = new PIXI.Container();
    stage.addChild(this.container);

    this.bodyLayer = new PIXI.Graphics();
    this.container.addChild(this.bodyLayer);

    this.head = new PIXI.Graphics();
    this.drawHead();
    this.container.addChild(this.head);

    this.reset();
  }

  public reset() {
      this.x = 400;
      this.y = 300;
      this.angle = 0;
      this.targetAngle = 0;
      this.speed = 3;
      this.length = 30;
      this.tunneling = 0;
      this.points = [];
      for (let i = 0; i < 1000; i++) {
          this.points.push(new PIXI.Point(this.x, this.y));
      }
  }

  private drawHead() {
    this.head.clear();
    this.head.circle(0, 0, 10);
    this.head.fill({ color: 0xffffff });
    // Cyber Eyes
    this.head.rect(-4, -6, 2, 4);
    this.head.rect(2, -6, 2, 4);
    this.head.fill({ color: 0x22d3ee });
  }

  public update(delta: number, input: { left: boolean, right: boolean }) {
      if (this.pulse > 0) this.pulse -= 0.1 * delta;

    if (this.tunneling > 0) {
        this.tunneling -= (delta / 60);
        this.head.tint = 0x8b5cf6; // Legendary color
    } else {
        this.head.tint = 0xffffff;
    }

    // Smooth angle interpolation (Phase 2)
    if (input.left) this.targetAngle -= 0.12 * delta;
    if (input.right) this.targetAngle += 0.12 * delta;

    this.angle += (this.targetAngle - this.angle) * 0.2 * delta;

    this.x += Math.cos(this.angle) * this.speed * delta;
    this.y += Math.sin(this.angle) * this.speed * delta;

    // Update history
    this.points.unshift(new PIXI.Point(this.x, this.y));
    if (this.points.length > 1000) this.points.pop();

    this.head.x = this.x;
    this.head.y = this.y;
    this.head.rotation = this.angle + Math.PI / 2;

    this.updateBody();
  }

  private updateBody() {
      this.bodyLayer.clear();

      const spacing = 4;
      const totalPoints = Math.floor(this.length);

      for (let i = totalPoints; i > 0; i--) {
          const p = this.points[i * spacing];
          if (!p) continue;

          const progress = i / totalPoints;
          const size = (8 * (1 - progress * 0.8)) + (this.pulse > 0 ? Math.sin(this.pulse * 10 - i) * 2 : 0);

          // Nature + Cyber Palette (V19)
          const color = this.tunneling > 0 ? 0x8b5cf6 : 0x10b981; // Emerald when normal, Violet when ghost

          this.bodyLayer.circle(p.x, p.y, Math.max(1, size));
          this.bodyLayer.fill({ color, alpha: (0.6 - progress * 0.5) * (this.tunneling > 0 ? 0.4 : 1.0) });

          // Added subtle glow for head segments
          if (i < 5) {
              this.bodyLayer.circle(p.x, p.y, size + 2);
              this.bodyLayer.fill({ color: 0xffffff, alpha: 0.1 * (1 - i/5) });
          }
      }
  }

  public grow(amount: number) {
      this.length += amount;
      this.pulse = 2.0;
  }

  public checkSelfCollision(): boolean {
      if (this.tunneling > 0) return false;
      const spacing = 5;
      const headRadius = 8;
      // Skip the first few points near the head
      for (let i = 10; i < Math.floor(this.length); i++) {
          const p = this.points[i * spacing];
          if (!p) break;
          const dx = this.x - p.x;
          const dy = this.y - p.y;
          if (dx*dx + dy*dy < headRadius * headRadius) return true;
      }
      return false;
  }

  public get pos() { return { x: this.x, y: this.y }; }
}
