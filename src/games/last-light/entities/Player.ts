import * as PIXI from 'pixi.js';

export class Player {
  public container: PIXI.Container;
  private orb: PIXI.Graphics;
  private glow: PIXI.Graphics;
  private trail: PIXI.Graphics[];
  private targetX: number = window.innerWidth / 2;
  private targetY: number = window.innerHeight / 2;
  private currentX: number = window.innerWidth / 2;
  private currentY: number = window.innerHeight / 2;

  private readonly TRAIL_LENGTH = 15;
  private readonly LERP_FACTOR = 0.1;

  constructor() {
    this.container = new PIXI.Container();

    // Create the glow
    this.glow = new PIXI.Graphics();
    this.drawGlow();
    this.container.addChild(this.glow);

    // Create the trail
    this.trail = [];
    for (let i = 0; i < this.TRAIL_LENGTH; i++) {
      const t = new PIXI.Graphics();
      t.circle(0, 0, 4 - (i / this.TRAIL_LENGTH) * 3);
      t.fill({ color: 0xffffff, alpha: 0.5 * (1 - i / this.TRAIL_LENGTH) });
      this.trail.push(t);
      this.container.addChild(t);
    }

    // Create the core orb
    this.orb = new PIXI.Graphics();
    this.orb.circle(0, 0, 6);
    this.orb.fill({ color: 0xffffff });
    this.container.addChild(this.orb);

    this.setupListeners();
  }

  private drawGlow() {
    this.glow.clear();
    for (let i = 1; i <= 5; i++) {
      this.glow.circle(0, 0, 6 + i * 8);
      this.glow.fill({ color: 0xffffff, alpha: 0.1 / i });
    }
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
  };

  private handleTouch = (e: TouchEvent) => {
    if (e.touches[0]) {
      this.targetX = e.touches[0].clientX;
      this.targetY = e.touches[0].clientY;
    }
  };

  private setupListeners() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchstart', this.handleTouch, { passive: false });
    window.addEventListener('touchmove', this.handleTouch, { passive: false });
  }

  public cleanup() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchstart', this.handleTouch);
    window.removeEventListener('touchmove', this.handleTouch);
  }

  public update(delta: number, energy: number) {
    // Update energy-based scaling
    const scale = 0.5 + (energy / 100) * 0.5;
    this.orb.scale.set(scale);
    this.glow.scale.set(scale);
    this.glow.alpha = 0.3 + (energy / 100) * 0.7;

    // Smooth movement
    this.currentX += (this.targetX - this.currentX) * this.LERP_FACTOR * delta;
    this.currentY += (this.targetY - this.currentY) * this.LERP_FACTOR * delta;

    this.orb.position.set(this.currentX, this.currentY);
    this.glow.position.set(this.currentX, this.currentY);

    // Update trail
    for (let i = this.TRAIL_LENGTH - 1; i > 0; i--) {
      this.trail[i].position.set(this.trail[i - 1].x, this.trail[i - 1].y);
    }
    this.trail[0].position.set(this.currentX, this.currentY);
  }

  public get x() { return this.currentX; }
  public get y() { return this.currentY; }
}
