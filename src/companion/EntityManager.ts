import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { CompanionBrain } from './CompanionBrain';

interface MemoryGraphic extends PIXI.Graphics {
  isRare?: boolean;
}

export class EntityManager {
  private app: PIXI.Application;
  private spirit: PIXI.Container;
  private memories: PIXI.Container;
  private world: PIXI.Container;
  private memoryPool: MemoryGraphic[] = [];
  private brain: CompanionBrain;
  private tailParts: PIXI.Graphics[] = [];

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;

    if (world) {
        this.world = world;
    } else {
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);
    }

    // New Stylized Spirit Companion
    this.spirit = new PIXI.Container();
    this.drawSpirit();
    this.app.stage.addChild(this.spirit);

    this.brain = new CompanionBrain(this.spirit);

    this.memories = new PIXI.Container();
    this.world.addChild(this.memories);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointerdown', this.onPointerDown);
  }

  private onPointerDown = (e: PIXI.FederatedPointerEvent) => {
    const { interact } = useStore.getState();
    interact();
    this.createBurst(e.global.x, e.global.y);
  }

  private drawSpirit() {
    // Body - Rounded triangular silhouette
    const body = new PIXI.Graphics();
    body.poly([-20, 20, 20, 20, 0, -25])
        .fill({ color: 0xffffff, alpha: 0.95 });

    // Core glow
    const glow = new PIXI.Graphics();
    glow.circle(0, 0, 40).fill({ color: 0x67E8F9, alpha: 0.15 });

    // Floating ears
    const leftEar = new PIXI.Graphics();
    leftEar.poly([-5, 0, 5, 0, 0, -15]).fill({ color: 0xffffff, alpha: 0.8 });
    leftEar.position.set(-15, -20);
    leftEar.rotation = -0.3;

    const rightEar = new PIXI.Graphics();
    rightEar.poly([-5, 0, 5, 0, 0, -15]).fill({ color: 0xffffff, alpha: 0.8 });
    rightEar.position.set(15, -20);
    rightEar.rotation = 0.3;

    // Eyes (aesthetic slits)
    const eyes = new PIXI.Graphics();
    eyes.rect(-8, -5, 4, 1.5).fill(0x111827);
    eyes.rect(4, -5, 4, 1.5).fill(0x111827);

    // Flowing Tails (Multiple)
    for (let i = 0; i < 3; i++) {
        const tail = new PIXI.Graphics();
        tail.poly([0, 0, 10, 5, 20, 0, 10, -5]).fill({ color: 0xffffff, alpha: 0.4 - (i * 0.1) });
        tail.position.set(0, 15);
        this.tailParts.push(tail);
        this.spirit.addChild(tail);
    }

    this.spirit.addChild(glow, body, leftEar, rightEar, eyes);
  }

  public update(delta: number) {
    this.brain.update(delta);

    // Animate Tails
    this.tailParts.forEach((tail, i) => {
        const time = Date.now() * 0.002;
        tail.rotation = Math.sin(time + i * 0.5) * 0.3;
        tail.scale.set(1 + Math.cos(time + i) * 0.1);
    });

    // Camera/World Parallax Easing
    const targetWorldX = -(this.spirit.x - this.app.screen.width / 2) * 0.15;
    const targetWorldY = -(this.spirit.y - this.app.screen.height / 2) * 0.15;
    this.world.x += (targetWorldX - this.world.x) * 0.05 * delta;
    this.world.y += (targetWorldY - this.world.y) * 0.05 * delta;

    this.updateMemories(delta);
  }

  private updateMemories(delta: number) {
    // Spawning logic
    if (Math.random() > 0.99) this.spawnMemory();

    const children = [...this.memories.children] as MemoryGraphic[];
    children.forEach((memory) => {
      // organic shard movement
      memory.rotation += 0.02 * delta;
      memory.y += Math.sin(Date.now() * 0.001 + memory.x) * 0.1;

      const dx = this.spirit.x - (memory.x + this.world.x);
      const dy = this.spirit.y - (memory.y + this.world.y);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60) {
        this.collectMemory(memory);
      }
    });
  }

  private spawnMemory() {
    const isRare = Math.random() > 0.98;
    let memory = this.memoryPool.pop();
    if (!memory) memory = new PIXI.Graphics() as MemoryGraphic;

    memory.clear();
    memory.isRare = isRare;

    // Shard/ribbon shape
    const color = isRare ? 0xFDE68A : 0x67E8F9;
    memory.poly([0, -8, 5, 0, 0, 8, -5, 0]).fill({ color, alpha: 0.7 });

    const angle = Math.random() * Math.PI * 2;
    const dist = 400 + Math.random() * 400;
    memory.x = (this.spirit.x - this.world.x) + Math.cos(angle) * dist;
    memory.y = (this.spirit.y - this.world.y) + Math.sin(angle) * dist;

    this.memories.addChild(memory);
  }

  private collectMemory(memory: MemoryGraphic) {
    const { addMemory } = useStore.getState();
    addMemory(memory.isRare ? 10 : 1);
    this.createBurst(memory.x + this.world.x, memory.y + this.world.y, memory.isRare ? 0xFDE68A : 0x67E8F9);
    this.memories.removeChild(memory);
    this.memoryPool.push(memory);
  }

  private createBurst(x: number, y: number, color: number = 0xffffff) {
    for (let i = 0; i < 8; i++) {
        const p = new PIXI.Graphics();
        p.circle(0, 0, 2).fill({ color, alpha: 0.8 });
        p.position.set(x, y);
        this.app.stage.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        const vx = Math.cos(angle) * spd;
        const vy = Math.sin(angle) * spd;

        const tick = () => {
            p.x += vx;
            p.y += vy;
            p.alpha -= 0.02;
            if (p.alpha <= 0) {
                this.app.stage.removeChild(p);
                p.destroy();
                this.app.ticker.remove(tick);
            }
        };
        this.app.ticker.add(tick);
    }
  }

  public destroy() {
    this.app.stage.off('pointerdown', this.onPointerDown);
    this.spirit.destroy({ children: true });
    this.memories.destroy({ children: true });
    this.memoryPool.forEach(m => m.destroy());
  }
}
