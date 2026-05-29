import * as PIXI from 'pixi.js';

export class EntityManager {
  private stage: PIXI.Container;
  private memories: PIXI.Container;
  private environment: PIXI.Container;
  private ambient: PIXI.Container;
  private effects: PIXI.Container;
  private pool: PIXI.Graphics[] = [];

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.ambient = new PIXI.Container();
    this.environment = new PIXI.Container();
    this.memories = new PIXI.Container();
    this.effects = new PIXI.Container();
    this.stage.addChild(this.ambient);
    this.stage.addChild(this.environment);
    this.stage.addChild(this.memories);
    this.stage.addChild(this.effects);

    this.initAmbient();
  }

  private initAmbient() {
    // Permanent faint floating dust
    for (let i = 0; i < 150; i++) {
        const d = new PIXI.Graphics();
        d.circle(0, 0, 1);
        d.fill({ color: 0xffffff, alpha: 0.1 });
        d.x = Math.random() * window.innerWidth;
        d.y = Math.random() * window.innerHeight;
        (d as any).vx = (Math.random() - 0.5) * 0.3;
        (d as any).vy = (Math.random() - 0.5) * 0.3;
        (d as any).depth = 0.5 + Math.random() * 0.5;
        this.ambient.addChild(d);
    }
  }

  public spawnAmbientEffect(x: number, y: number, color: number = 0xffffff) {
    const p = new PIXI.Graphics();
    p.circle(0, 0, 1 + Math.random() * 2);
    p.fill({ color, alpha: 0.3 });
    p.x = x;
    p.y = y;
    (p as any).vx = (Math.random() - 0.5) * 2;
    (p as any).vy = -Math.random() * 2;
    (p as any).life = 1.0;
    this.effects.addChild(p);
  }

  public spawnMemory(x: number, y: number, type: 'standard' | 'rare' | 'gold' | 'legendary' = 'standard') {
    const memory = this.getFromPool();
    memory.clear();

    const color = type === 'legendary' ? 0xfb7185 : type === 'gold' ? 0xfacc15 : type === 'rare' ? 0x22d3ee : 0xe2e8f0;
    const size = type === 'legendary' ? 10 : type === 'gold' ? 6 : type === 'rare' ? 4 : 2;

    memory.circle(0, 0, size);
    memory.fill({ color, alpha: 0.9 });

    // Outer Glow
    memory.circle(0, 0, size * 4);
    memory.fill({ color, alpha: 0.2 });

    memory.x = x;
    memory.y = y;
    (memory as any).memoryType = type;
    (memory as any).pulse = Math.random() * Math.PI;

    this.memories.addChild(memory);
  }

  private getFromPool(): PIXI.Graphics {
    return this.pool.pop() || new PIXI.Graphics();
  }

  public collect(memory: PIXI.Graphics) {
    this.memories.removeChild(memory);
    this.pool.push(memory);
  }

  public update(playerX: number, playerY: number, delta: number, totalCollected: number, evolutionLevel: number) {
    const difficultyMultiplier = Math.min(3, 1 + totalCollected / 100);
    const maxMemories = 40 + Math.floor(totalCollected / 4); // Denser V9

    // Ambient Atmosphere Spawning (V9)
    if (Math.random() < 0.05 * delta) {
        const ax = playerX + (Math.random() - 0.5) * 2000;
        const ay = playerY + (Math.random() - 0.5) * 2000;
        const color = evolutionLevel >= 3 ? 0xfacc15 : 0xffffff; // Fireflies color
        this.spawnAmbientEffect(ax, ay, color);
    }

    // Enhanced Spawning (V18 Rebuild)
    if (this.memories.children.length < maxMemories && Math.random() < 0.1 * difficultyMultiplier * delta) {
      const centerX = playerX + (Math.random() - 0.5) * 1200;
      const centerY = playerY + (Math.random() - 0.5) * 1200;

      const isLegendarySpawn = Math.random() < 0.01;
      const clusterSize = isLegendarySpawn ? 1 : 3 + Math.floor(Math.random() * 5);

      for(let i=0; i<clusterSize; i++) {
          const type = isLegendarySpawn ? 'legendary' :
                       Math.random() < 0.05 ? 'gold' :
                       Math.random() < 0.15 ? 'rare' : 'standard';
          this.spawnMemory(
              centerX + (Math.random() - 0.5) * (isLegendarySpawn ? 0 : 200),
              centerY + (Math.random() - 0.5) * (isLegendarySpawn ? 0 : 200),
              type
          );
      }
    }

    // Update Memories (Pulsing and Floating)
    this.memories.children.forEach(m => {
        const gm = m as any;
        gm.pulse += 0.05 * delta;
        gm.scale.set(1 + Math.sin(gm.pulse) * 0.1);
        gm.alpha = 0.8 + Math.sin(gm.pulse) * 0.2;
    });

    // Update Ambient Particles with Bounds Awareness
    const parent = this.stage.parent?.parent as any;
    const viewWidth = parent?.clientWidth || window.innerWidth;
    const viewHeight = parent?.clientHeight || window.innerHeight;

    this.ambient.children.forEach(d => {
        d.x += (d as any).vx * delta;
        d.y += (d as any).vy * delta;

        // Wrap around viewport boundaries
        if (d.x < -100) d.x = viewWidth + 100;
        if (d.x > viewWidth + 100) d.x = -100;
        if (d.y < -100) d.y = viewHeight + 100;
        if (d.y > viewHeight + 100) d.y = -100;
    });

    // Update Temporary Effects
    for (let i = this.effects.children.length - 1; i >= 0; i--) {
        const p = this.effects.children[i] as any;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.life -= 0.01 * delta;
        p.alpha = p.life * 0.5;
        if (p.life <= 0) this.effects.removeChild(p);
    }

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
