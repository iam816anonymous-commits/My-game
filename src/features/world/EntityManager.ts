import * as PIXI from 'pixi.js';
import { useStore } from '../state/useStore';

interface MemoryGraphic extends PIXI.Graphics {
  isRare?: boolean;
}

export class EntityManager {
  private app: PIXI.Application;
  private player: PIXI.Graphics;
  private memories: PIXI.Container;
  private world: PIXI.Container;
  private pointer: { x: number; y: number };
  private memorySpawnTimer: number = 0;

  // Basic object pool
  private memoryPool: MemoryGraphic[] = [];

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;
    this.pointer = { x: app.screen.width / 2, y: app.screen.height / 2 };

    if (world) {
        this.world = world;
    } else {
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);
    }

    // Player (Glowing Orb)
    this.player = new PIXI.Graphics();
    this.drawPlayer();
    this.app.stage.addChild(this.player);

    // Memories Container
    this.memories = new PIXI.Container();
    this.world.addChild(this.memories);

    // Event listeners
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointermove', this.onPointerMove);
  }

  private onPointerMove = (e: PIXI.FederatedPointerEvent) => {
    this.pointer.x = e.global.x;
    this.pointer.y = e.global.y;
  };

  private drawPlayer() {
    this.player.clear();
    this.player.circle(0, 0, 10).fill({ color: 0xffffff, alpha: 0.8 });
    this.player.circle(0, 0, 20).fill({ color: 0xffffff, alpha: 0.2 });
  }

  public update(delta: number) {
    // Lerp player to pointer
    const lerp = 0.1 * delta;
    const oldX = this.player.x;
    const oldY = this.player.y;
    this.player.x += (this.pointer.x - this.player.x) * lerp;
    this.player.y += (this.pointer.y - this.player.y) * lerp;

    // Camera follow
    const dx = this.player.x - oldX;
    const dy = this.player.y - oldY;
    this.world.x -= dx;
    this.world.y -= dy;

    // Pulse effect
    const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    this.player.scale.set(scale);

    // Spawn memories
    this.memorySpawnTimer += delta;
    if (this.memorySpawnTimer > 60) {
      this.spawnMemory();
      this.memorySpawnTimer = 0;
    }

    // Update memories and check collisions
    const children = [...this.memories.children] as MemoryGraphic[];
    children.forEach((memory) => {
      memory.y += Math.sin(Date.now() * 0.001 + memory.x) * 0.5;

      const dxColl = this.player.x - (memory.x + this.world.x);
      const dyColl = this.player.y - (memory.y + this.world.y);
      const distance = Math.sqrt(dxColl * dxColl + dyColl * dyColl);

      if (distance < 30) {
        this.collectMemory(memory);
      } else if (memory.alpha < 0.1) {
        this.releaseMemory(memory);
      }
    });
  }

  private spawnMemory() {
    const isRare = Math.random() > 0.95;
    let memory = this.memoryPool.pop();

    if (!memory) {
      memory = new PIXI.Graphics() as MemoryGraphic;
    }

    memory.clear();
    memory.isRare = isRare;
    memory.circle(0, 0, isRare ? 6 : 4).fill({ color: isRare ? 0xffcc00 : 0x00ccff, alpha: 0.8 });

    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 300;

    memory.x = (this.player.x - this.world.x) + Math.cos(angle) * distance;
    memory.y = (this.player.y - this.world.y) + Math.sin(angle) * distance;
    memory.alpha = 0;

    this.memories.addChild(memory);

    // Fade in without requestAnimationFrame leak potential
    memory.alpha = 1; // Simplified for stability, or could use a ticker
  }

  private releaseMemory(memory: MemoryGraphic) {
    this.memories.removeChild(memory);
    if (this.memoryPool.length < 50) {
      this.memoryPool.push(memory);
    } else {
      memory.destroy();
    }
  }

  private collectMemory(memory: MemoryGraphic) {
    const { addMemory } = useStore.getState();
    addMemory(memory.isRare ? 5 : 1);
    this.releaseMemory(memory);
  }

  public destroy() {
    this.app.stage.off('pointermove', this.onPointerMove);
    this.player.destroy({ children: true });
    this.memories.destroy({ children: true });
    this.memoryPool.forEach(m => m.destroy());
    this.memoryPool = [];
  }
}
