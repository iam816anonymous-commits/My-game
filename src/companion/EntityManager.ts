import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { CompanionBrain } from './CompanionBrain';

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
  private memoryPool: MemoryGraphic[] = [];
  private brain: CompanionBrain;

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;
    this.pointer = { x: app.screen.width / 2, y: app.screen.height / 2 };

    if (world) {
        this.world = world;
    } else {
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);
    }

    // Player/Companion (Glowing Spirit Fox)
    this.player = new PIXI.Graphics();
    this.drawPlayer();
    this.app.stage.addChild(this.player);

    this.brain = new CompanionBrain(this.player);

    // Memories Container
    this.memories = new PIXI.Container();
    this.world.addChild(this.memories);

    // Event listeners
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointermove', this.onPointerMove);
    this.app.stage.on('pointerdown', this.onPointerDown);
  }

  private onPointerMove = (e: PIXI.FederatedPointerEvent) => {
    this.pointer.x = e.global.x;
    this.pointer.y = e.global.y;
  };

  private onPointerDown = () => {
    const { interact } = useStore.getState();
    interact();
  }

  private drawPlayer() {
    this.player.clear();
    // Fox-like shape simplified
    this.player.circle(0, 0, 15).fill({ color: 0xffffff, alpha: 0.9 });
    this.player.circle(0, 0, 30).fill({ color: 0xffffff, alpha: 0.1 });
    // Ears
    this.player.poly([-10, -10, -5, -25, 0, -10]).fill({ color: 0xffffff, alpha: 0.9 });
    this.player.poly([10, -10, 5, -25, 0, -10]).fill({ color: 0xffffff, alpha: 0.9 });
  }

  public update(delta: number) {
    // Companion AI updates
    this.brain.update(delta);

    // World drift based on companion position
    this.world.x -= (this.player.x - this.app.screen.width / 2) * 0.01;
    this.world.y -= (this.player.y - this.app.screen.height / 2) * 0.01;

    // Spawn memories
    this.memorySpawnTimer += delta;
    if (this.memorySpawnTimer > 120) {
      this.spawnMemory();
      this.memorySpawnTimer = 0;
    }

    // Update memories and check collisions
    const children = [...this.memories.children] as MemoryGraphic[];
    children.forEach((memory) => {
      memory.y += Math.sin(Date.now() * 0.001 + memory.x) * 0.2;

      const dxColl = this.player.x - (memory.x + this.world.x);
      const dyColl = this.player.y - (memory.y + this.world.y);
      const distance = Math.sqrt(dxColl * dxColl + dyColl * dyColl);

      if (distance < 50) {
        this.collectMemory(memory);
      } else if (memory.alpha < 0.1) {
        this.releaseMemory(memory);
      }
    });
  }

  private spawnMemory() {
    const isRare = Math.random() > 0.98;
    let memory = this.memoryPool.pop();

    if (!memory) {
      memory = new PIXI.Graphics() as MemoryGraphic;
    }

    memory.clear();
    memory.isRare = isRare;
    memory.circle(0, 0, isRare ? 8 : 5).fill({ color: isRare ? 0xffcc00 : 0x00ccff, alpha: 0.7 });

    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 400;

    memory.x = (this.player.x - this.world.x) + Math.cos(angle) * distance;
    memory.y = (this.player.y - this.world.y) + Math.sin(angle) * distance;
    memory.alpha = 1;

    this.memories.addChild(memory);
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
    const { addMemory, addJournalEntry } = useStore.getState();
    addMemory(memory.isRare ? 10 : 1);
    if (memory.isRare) {
        addJournalEntry("The companion found a rare golden memory.");
    }
    this.releaseMemory(memory);
  }

  public destroy() {
    this.app.stage.off('pointermove', this.onPointerMove);
    this.app.stage.off('pointerdown', this.onPointerDown);
    this.player.destroy({ children: true });
    this.memories.destroy({ children: true });
    this.memoryPool.forEach(m => m.destroy());
    this.memoryPool = [];
  }
}
