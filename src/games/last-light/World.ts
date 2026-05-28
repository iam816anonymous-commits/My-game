import * as PIXI from 'pixi.js';
import { EvolutionLevel } from './types';

export class World {
  private container: PIXI.Container;
  private grassLayer: PIXI.Container;
  private fireflyLayer: PIXI.Container;
  private treeLayer: PIXI.Container;
  private rainLayer: PIXI.Container;
  private animalLayer: PIXI.Container;
  private constellationLayer: PIXI.Container;

  private fireflies: PIXI.Graphics[] = [];
  private rainParticles: PIXI.Graphics[] = [];

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);

    this.grassLayer = new PIXI.Container();
    this.fireflyLayer = new PIXI.Container();
    this.treeLayer = new PIXI.Container();
    this.rainLayer = new PIXI.Container();
    this.animalLayer = new PIXI.Container();
    this.constellationLayer = new PIXI.Container();

    this.container.addChild(this.grassLayer);
    this.container.addChild(this.treeLayer);
    this.container.addChild(this.fireflyLayer);
    this.container.addChild(this.rainLayer);
    this.container.addChild(this.animalLayer);
    this.container.addChild(this.constellationLayer);

    this.initFireflies();
    this.initRain();
  }

  private initFireflies() {
    for (let i = 0; i < 50; i++) {
      const f = new PIXI.Graphics();
      f.circle(0, 0, 2);
      f.fill({ color: 0xfde68a, alpha: 0.6 });
      f.x = Math.random() * window.innerWidth;
      f.y = Math.random() * window.innerHeight;
      (f as any).vx = (Math.random() - 0.5) * 1;
      (f as any).vy = (Math.random() - 0.5) * 1;
      this.fireflies.push(f);
      this.fireflyLayer.addChild(f);
    }
  }

  private initRain() {
    for (let i = 0; i < 100; i++) {
      const r = new PIXI.Graphics();
      r.rect(0, 0, 1, 10);
      r.fill({ color: 0x67e8f9, alpha: 0.3 });
      r.x = Math.random() * window.innerWidth;
      r.y = Math.random() * window.innerHeight;
      this.rainParticles.push(r);
      this.rainLayer.addChild(r);
    }
  }

  public update(delta: number, level: EvolutionLevel, playerX: number, playerY: number) {
    // Level 2: Grass (Simulated with simple green flecks)
    this.grassLayer.visible = level >= EvolutionLevel.Grass;
    if (this.grassLayer.visible && this.grassLayer.children.length < 100) {
        for(let i=0; i<5; i++) {
            const g = new PIXI.Graphics();
            g.rect(0, 0, 2, 4);
            g.fill({ color: 0x4ade80, alpha: 0.4 });
            g.x = playerX + (Math.random() - 0.5) * 1000;
            g.y = playerY + (Math.random() - 0.5) * 1000;
            this.grassLayer.addChild(g);
        }
    }

    // Level 3: Fireflies
    this.fireflyLayer.visible = level >= EvolutionLevel.Fireflies;
    if (this.fireflyLayer.visible) {
      this.fireflies.forEach(f => {
        f.x += (f as any).vx * delta;
        f.y += (f as any).vy * delta;
        if (f.x < 0) f.x = window.innerWidth;
        if (f.x > window.innerWidth) f.x = 0;
        if (f.y < 0) f.y = window.innerHeight;
        if (f.y > window.innerHeight) f.y = 0;
        f.alpha = 0.3 + Math.sin(Date.now() * 0.002 + f.x) * 0.3;
      });
    }

    // Level 4: Trees (Silhouettes)
    this.treeLayer.visible = level >= EvolutionLevel.Trees;
    if (this.treeLayer.visible && this.treeLayer.children.length < 20) {
        const t = new PIXI.Graphics();
        t.rect(-10, -50, 20, 100);
        t.fill({ color: 0x064e3b, alpha: 0.2 });
        t.x = playerX + (Math.random() - 0.5) * 2000;
        t.y = playerY + (Math.random() - 0.5) * 2000;
        this.treeLayer.addChild(t);
    }

    // Level 5: Rain
    this.rainLayer.visible = level >= EvolutionLevel.Rain;
    if (this.rainLayer.visible) {
      this.rainParticles.forEach(r => {
        r.y += 10 * delta;
        if (r.y > window.innerHeight) {
          r.y = -20;
          r.x = Math.random() * window.innerWidth;
        }
      });
    }

    // Level 6: Animals (Ghostly spirits)
    this.animalLayer.visible = level >= EvolutionLevel.Animals;
    if (this.animalLayer.visible && this.animalLayer.children.length < 5) {
        const a = new PIXI.Graphics();
        a.circle(0, 0, 8);
        a.fill({ color: 0xffffff, alpha: 0.1 });
        a.x = playerX + (Math.random() - 0.5) * 1500;
        a.y = playerY + (Math.random() - 0.5) * 1500;
        (a as any).vx = (Math.random() - 0.5) * 2;
        (a as any).vy = (Math.random() - 0.5) * 2;
        this.animalLayer.addChild(a);
    }
    if (this.animalLayer.visible) {
        this.animalLayer.children.forEach(a => {
            a.x += (a as any).vx * delta;
            a.y += (a as any).vy * delta;
        });
    }

    // Level 7: Constellations
    this.constellationLayer.visible = level >= EvolutionLevel.Constellations;
    if (this.constellationLayer.visible && this.constellationLayer.children.length < 50) {
        for(let i=0; i<10; i++) {
            const s = new PIXI.Graphics();
            s.circle(0, 0, 1);
            s.fill({ color: 0xffffff, alpha: 0.8 });
            s.x = (Math.random() - 0.5) * 4000;
            s.y = (Math.random() - 0.5) * 4000;
            this.constellationLayer.addChild(s);
        }
    }
  }
}
