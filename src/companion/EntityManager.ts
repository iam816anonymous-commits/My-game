import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { useTransientStore } from '../store/useTransientStore';
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

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;

    if (world) {
        this.world = world;
    } else {
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);
    }

    // PixiJS Spirit is now an invisible anchor for the 3D entity
    this.spirit = new PIXI.Container();
    this.spirit.x = app.screen.width / 2;
    this.spirit.y = app.screen.height / 2;
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

  public update(delta: number) {
    this.brain.update(delta);

    // Camera/World Parallax Easing
    const targetWorldX = -(this.spirit.x - this.app.screen.width / 2) * 0.15;
    const targetWorldY = -(this.spirit.y - this.app.screen.height / 2) * 0.15;
    this.world.x += (targetWorldX - this.world.x) * 0.05 * delta;
    this.world.y += (targetWorldY - this.world.y) * 0.05 * delta;

    this.updateMemories(delta);

    // Sync PixiJS anchor position to transient store
    useTransientStore.getState().setCompanionPosition(this.spirit.x, this.spirit.y);
  }

  private updateMemories(delta: number) {
    if (Math.random() > 0.99) this.spawnMemory();

    const children = [...this.memories.children] as MemoryGraphic[];
    children.forEach((memory) => {
      memory.rotation += 0.02 * delta;
      memory.y += Math.sin(Date.now() * 0.001 + memory.x) * 0.1;

      const dx = this.spirit.x - (memory.x + this.world.x);
      const dy = this.spirit.y - (memory.y + this.world.y);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 80) {
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

  private particlePool: PIXI.Graphics[] = [];

  private createBurst(x: number, y: number, color: number = 0xffffff) {
    for (let i = 0; i < 8; i++) {
        let p = this.particlePool.pop();
        if (!p) p = new PIXI.Graphics();

        p.clear().circle(0, 0, 2).fill({ color, alpha: 0.8 });
        p.position.set(x, y);
        p.alpha = 1;
        this.app.stage.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        const vx = Math.cos(angle) * spd;
        const vy = Math.sin(angle) * spd;

        const tick = (ticker: PIXI.Ticker) => {
            p.x += vx * ticker.deltaTime;
            p.y += vy * ticker.deltaTime;
            p.alpha -= 0.02 * ticker.deltaTime;
            if (p.alpha <= 0) {
                this.app.stage.removeChild(p);
                this.particlePool.push(p);
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
    this.particlePool.forEach(p => p.destroy());
  }
}
