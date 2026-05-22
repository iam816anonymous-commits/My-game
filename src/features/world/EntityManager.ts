import * as PIXI from 'pixi.js';
import { useStore } from '../state/useStore';

export class EntityManager {
  private app: PIXI.Application;
  private player: PIXI.Graphics;
  private memories: PIXI.Container;
  private world: PIXI.Container;
  private pointer: { x: number; y: number };
  private memorySpawnTimer: number = 0;

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
    this.app.stage.addChild(this.player); // Player is UI-locked in center? No, let's keep it moving.

    // Memories Container
    this.memories = new PIXI.Container();
    this.world.addChild(this.memories);

    // Event listeners
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointermove', (e) => {
      this.pointer.x = e.global.x;
      this.pointer.y = e.global.y;
    });
  }

  private drawPlayer() {
    this.player.clear();
    this.player.beginFill(0xffffff, 0.8);
    this.player.drawCircle(0, 0, 10);
    this.player.endFill();

    // Simple glow effect
    const glow = new PIXI.Graphics();
    glow.beginFill(0xffffff, 0.2);
    glow.drawCircle(0, 0, 20);
    glow.endFill();
    this.player.addChild(glow);
  }

  public update(delta: number) {
    // Lerp player to pointer
    const lerp = 0.1 * delta;
    const oldX = this.player.x;
    const oldY = this.player.y;
    this.player.x += (this.pointer.x - this.player.x) * lerp;
    this.player.y += (this.pointer.y - this.player.y) * lerp;

    // Camera follow (Move world container inversely)
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
    this.memories.children.forEach((memory: any) => {
      // Gentle drift
      memory.y += Math.sin(Date.now() * 0.001 + memory.x) * 0.5;

      const dx = this.player.x - (memory.x + this.memories.x);
      const dy = this.player.y - (memory.y + this.memories.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 30) {
        this.collectMemory(memory);
      }

      // Remove off-screen or old memories (simplified)
      if (memory.alpha < 0.1) {
        this.memories.removeChild(memory);
      }
    });
  }

  private spawnMemory() {
    const memory = new PIXI.Graphics();
    const isRare = Math.random() > 0.95;

    memory.beginFill(isRare ? 0xffcc00 : 0x00ccff, 0.8);
    memory.drawCircle(0, 0, isRare ? 6 : 4);
    memory.endFill();

    // Procedural ring spawning around player
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 300;

    // Position relative to player in world space
    memory.x = (this.player.x - this.world.x) + Math.cos(angle) * distance;
    memory.y = (this.player.y - this.world.y) + Math.sin(angle) * distance;
    memory.alpha = 0;

    this.memories.addChild(memory);

    // Fade in
    const fadeIn = () => {
        if (memory.alpha < 1) {
            memory.alpha += 0.05;
            requestAnimationFrame(fadeIn);
        }
    }
    fadeIn();
  }

  private collectMemory(memory: PIXI.Graphics) {
    const { addMemory } = useStore.getState();
    addMemory(1);
    this.memories.removeChild(memory);

    // Simple collection effect (could be particles later)
  }

  public destroy() {
    this.app.stage.off('pointermove');
    this.player.destroy();
    this.memories.destroy();
  }
}
