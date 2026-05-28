import * as PIXI from 'pixi.js';

export class EntityManager {
  private stage: PIXI.Container;
  private memories: PIXI.Container;
  private environment: PIXI.Container;
  private pool: PIXI.Graphics[] = [];

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.environment = new PIXI.Container();
    this.memories = new PIXI.Container();
    this.stage.addChild(this.environment);
    this.stage.addChild(this.memories);
  }

  public spawnMemory(x: number, y: number, type: 'standard' | 'rare' = 'standard') {
    const memory = this.getFromPool();
    memory.clear();

    const color = type === 'rare' ? 0x67e8f9 : 0xffffff;
    const size = type === 'rare' ? 5 : 3;

    memory.circle(0, 0, size);
    memory.fill({ color, alpha: 0.8 });

    // Add inner glow
    memory.circle(0, 0, size * 2);
    memory.fill({ color, alpha: 0.2 });

    memory.x = x;
    memory.y = y;
    (memory as any).memoryType = type;

    this.memories.addChild(memory);
  }

  private getFromPool(): PIXI.Graphics {
    return this.pool.pop() || new PIXI.Graphics();
  }

  public collect(memory: PIXI.Graphics) {
    this.memories.removeChild(memory);
    this.pool.push(memory);
  }

  public update(playerX: number, playerY: number, delta: number, totalCollected: number) {
    // Mastery Curve: Spawning gets tighter and more frequent as score increases
    const difficultyMultiplier = Math.min(2, 1 + totalCollected / 100);
    const maxMemories = 15 + Math.floor(totalCollected / 20);

    // Basic procedural spawning around player
    if (this.memories.children.length < maxMemories && Math.random() < 0.05 * difficultyMultiplier * delta) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 500;
      const x = playerX + Math.cos(angle) * dist;
      const y = playerY + Math.sin(angle) * dist;
      const type = Math.random() < 0.1 ? 'rare' : 'standard';
      this.spawnMemory(x, y, type);
    }

    // Cull distant memories
    for (let i = this.memories.children.length - 1; i >= 0; i--) {
      const m = this.memories.children[i] as PIXI.Graphics;
      const dx = m.x - playerX;
      const dy = m.y - playerY;
      if (dx * dx + dy * dy > 2000 * 2000) {
        this.collect(m);
      }
    }
  }

  public getMemories() {
    return this.memories.children as PIXI.Graphics[];
  }

  public getEnvironment() {
    return this.environment;
  }
}
