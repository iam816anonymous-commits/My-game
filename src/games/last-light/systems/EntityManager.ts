import * as PIXI from 'pixi.js';

export class EntityManager {
  private stage: PIXI.Container;
  private memories: PIXI.Container;
  private environment: PIXI.Container;
  private ambient: PIXI.Container;
  private pool: PIXI.Graphics[] = [];

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.ambient = new PIXI.Container();
    this.environment = new PIXI.Container();
    this.memories = new PIXI.Container();
    this.stage.addChild(this.ambient);
    this.stage.addChild(this.environment);
    this.stage.addChild(this.memories);

    this.initAmbient();
  }

  private initAmbient() {
    // Permanent faint floating dust
    for (let i = 0; i < 100; i++) {
        const d = new PIXI.Graphics();
        d.circle(0, 0, 1);
        d.fill({ color: 0xffffff, alpha: 0.1 });
        d.x = Math.random() * window.innerWidth;
        d.y = Math.random() * window.innerHeight;
        (d as any).vx = (Math.random() - 0.5) * 0.5;
        (d as any).vy = (Math.random() - 0.5) * 0.5;
        this.ambient.addChild(d);
    }
  }

  public spawnMemory(x: number, y: number, type: 'standard' | 'rare' | 'gold' = 'standard') {
    const memory = this.getFromPool();
    memory.clear();

    const color = type === 'gold' ? 0xfacc15 : type === 'rare' ? 0x22d3ee : 0xe2e8f0;
    const size = type === 'gold' ? 6 : type === 'rare' ? 4 : 2;

    memory.circle(0, 0, size);
    memory.fill({ color, alpha: 0.9 });

    // Outer Glow
    memory.circle(0, 0, size * 3);
    memory.fill({ color, alpha: 0.15 });

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
    const difficultyMultiplier = Math.min(3, 1 + totalCollected / 100);
    const maxMemories = 40 + Math.floor(totalCollected / 5); // Dense world V5

    // Cluster Spawning
    if (this.memories.children.length < maxMemories && Math.random() < 0.1 * difficultyMultiplier * delta) {
      const centerX = playerX + (Math.random() - 0.5) * 1200;
      const centerY = playerY + (Math.random() - 0.5) * 1200;

      const clusterSize = 3 + Math.floor(Math.random() * 5);
      for(let i=0; i<clusterSize; i++) {
          const type = Math.random() < 0.05 ? 'gold' : Math.random() < 0.15 ? 'rare' : 'standard';
          this.spawnMemory(
              centerX + (Math.random() - 0.5) * 100,
              centerY + (Math.random() - 0.5) * 100,
              type
          );
      }
    }

    // Update Ambient Particles
    this.ambient.children.forEach(d => {
        d.x += (d as any).vx * delta;
        d.y += (d as any).vy * delta;
        if (d.x < 0) d.x = window.innerWidth;
        if (d.x > window.innerWidth) d.x = 0;
        if (d.y < 0) d.y = window.innerHeight;
        if (d.y > window.innerHeight) d.y = 0;
    });

    // Cull distant memories
    for (let i = this.memories.children.length - 1; i >= 0; i--) {
      const m = this.memories.children[i] as PIXI.Graphics;
      const dx = m.x - playerX;
      const dy = m.y - playerY;
      if (dx * dx + dy * dy > 2500 * 2500) {
        this.collect(m);
      }
    }
  }

  public getMemories() {
    return this.memories.children as PIXI.Graphics[];
  }
}
