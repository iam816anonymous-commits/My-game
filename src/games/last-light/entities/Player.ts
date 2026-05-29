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

  private readonly TRAIL_LENGTH = 20;
  private readonly LERP_FACTOR = 0.08;
  private dashVelocity = 0;
  private dashTime = 0;

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
      t.fill({ color: 0x22d3ee, alpha: 0.4 * (1 - i / this.TRAIL_LENGTH) });
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
    for (let i = 1; i <= 6; i++) {
      this.glow.circle(0, 0, 6 + i * 12);
      this.glow.fill({ color: 0x22d3ee, alpha: 0.08 / i });
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

  private handleDash = (e: MouseEvent | TouchEvent) => {
      if (this.dashTime <= 0) {
          this.dashTime = 1.0; // 1 second cooldown
          this.dashVelocity = 15;
          this.container.emit('dash');
      }
  };

  private setupListeners() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleDash);
    window.addEventListener('touchstart', this.handleTouch, { passive: false });
    window.addEventListener('touchmove', this.handleTouch, { passive: false });
  }

  public cleanup() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleDash);
    window.removeEventListener('touchstart', this.handleTouch);
    window.removeEventListener('touchmove', this.handleTouch);
  }

  private shakeTime = 0;

  public shake(intensity: number) {
    this.shakeTime = intensity;
  }

  public update(delta: number, energy: number, isOverload: boolean = false) {
    const parent = this.container.parent?.parent as any;
    const viewWidth = parent?.clientWidth || window.innerWidth;
    const viewHeight = parent?.clientHeight || window.innerHeight;

    // Constrain target within viewport
    this.targetX = Math.max(20, Math.min(viewWidth - 20, this.targetX));
    this.targetY = Math.max(20, Math.min(viewHeight - 20, this.targetY));

    // Screen Shake
    let offsetX = 0;
    let offsetY = 0;
    if (this.shakeTime > 0) {
        offsetX = (Math.random() - 0.5) * this.shakeTime;
        offsetY = (Math.random() - 0.5) * this.shakeTime;
        this.shakeTime -= delta;
    }

    // Update energy-based scaling
    const baseScale = 0.5 + (energy / 100) * 0.5;
    const overloadScale = isOverload ? 1.5 : 1.0;
    const finalScale = baseScale * overloadScale;

    this.orb.scale.set(finalScale);
    this.glow.scale.set(finalScale + (Math.sin(Date.now() * 0.005) * 0.05));
    this.glow.alpha = (0.3 + (energy / 100) * 0.7) * (isOverload ? 1.5 : 1.0);

    // Color shift on overload
    if (isOverload) {
        this.glow.tint = 0xfacc15;
    } else {
        this.glow.tint = 0xffffff;
    }

    // Smooth movement
    const dx = (this.targetX - this.currentX);
    const dy = (this.targetY - this.currentY);
    const dist = Math.sqrt(dx*dx + dy*dy);

    const speed = (this.LERP_FACTOR + (this.dashVelocity / 100)) * delta;
    this.currentX += dx * speed;
    this.currentY += dy * speed;

    if (this.dashVelocity > 0) {
        this.dashVelocity *= Math.pow(0.92, delta);
        if (this.dashVelocity < 0.1) this.dashVelocity = 0;
    }
    if (this.dashTime > 0) this.dashTime -= (delta / 60);

    this.orb.position.set(this.currentX + offsetX, this.currentY + offsetY);
    this.glow.position.set(this.currentX + offsetX, this.currentY + offsetY);

    // Update trail
    for (let i = this.TRAIL_LENGTH - 1; i > 0; i--) {
      this.trail[i].position.set(this.trail[i - 1].x, this.trail[i - 1].y);
    }
    this.trail[0].position.set(this.currentX, this.currentY);
  }

  public get x() { return this.currentX; }
  public get y() { return this.currentY; }
}
