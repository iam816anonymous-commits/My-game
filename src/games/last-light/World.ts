import * as PIXI from 'pixi.js';
import { EvolutionLevel } from './types';

export class World {
  private container: PIXI.Container;
  private bgLayer: PIXI.Container;
  private grassLayer: PIXI.Container;
  private fireflyLayer: PIXI.Container;
  private treeLayer: PIXI.Container;
  private weatherLayer: PIXI.Container;
  private animalLayer: PIXI.Container;
  private cosmicLayer: PIXI.Container;

  private stars: PIXI.Graphics[] = [];
  private fireflies: PIXI.Graphics[] = [];
  private rainDrops: PIXI.Graphics[] = [];

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);

    this.bgLayer = new PIXI.Container();
    this.grassLayer = new PIXI.Container();
    this.treeLayer = new PIXI.Container();
    this.fireflyLayer = new PIXI.Container();
    this.weatherLayer = new PIXI.Container();
    this.animalLayer = new PIXI.Container();
    this.cosmicLayer = new PIXI.Container();

    this.container.addChild(this.bgLayer);
    this.container.addChild(this.grassLayer);
    this.container.addChild(this.treeLayer);
    this.container.addChild(this.fireflyLayer);
    this.container.addChild(this.weatherLayer);
    this.container.addChild(this.animalLayer);
    this.container.addChild(this.cosmicLayer);

    this.initStars();
  }

  private levelFlash = 0;
  private meteorTime = 0;
  private meteors: PIXI.Graphics[] = [];

  public flashLevelTransition() {
    this.levelFlash = 1.0;
  }

  public spawnMeteorShower() {
      this.meteorTime = 10.0; // 10 seconds of meteors
  }

  private initStars() {
    for (let i = 0; i < 200; i++) {
      const s = new PIXI.Graphics();
      s.circle(0, 0, Math.random() * 1.5);
      s.fill({ color: 0xffffff, alpha: Math.random() * 0.5 });
      s.x = Math.random() * 4000 - 2000;
      s.y = Math.random() * 4000 - 2000;
      (s as any).depth = 0.1 + Math.random() * 0.5;
      this.stars.push(s);
      this.bgLayer.addChild(s);
    }
  }

  public update(delta: number, level: EvolutionLevel, playerX: number, playerY: number) {
    // Meteor Shower (V11 Rare Event)
    if (this.meteorTime > 0) {
        this.meteorTime -= delta / 60;
        if (Math.random() < 0.1) {
            const m = new PIXI.Graphics();
            m.rect(0, 0, 2, 40);
            m.fill({ color: 0x22d3ee, alpha: 0.4 });
            m.x = Math.random() * window.innerWidth;
            m.y = -50;
            m.rotation = Math.PI / 4;
            this.bgLayer.addChild(m);
            this.meteors.push(m);
        }
    }
    for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += 10 * delta;
        m.y += 10 * delta;
        m.alpha -= 0.01 * delta;
        if (m.alpha <= 0) {
            this.bgLayer.removeChild(m);
            this.meteors.splice(i, 1);
        }
    }

    // Level Transition Flash
    if (this.levelFlash > 0) {
      this.levelFlash -= 0.05 * delta;
      this.container.alpha = 0.5 + Math.random() * 0.5;
    } else {
      this.container.alpha = 1;
    }

    // Parallax Stars
    this.stars.forEach(s => {
        s.pivot.x = playerX * (s as any).depth;
        s.pivot.y = playerY * (s as any).depth;
    });

    // V5 Evolution Stages

    // Level 2: Soft Particles (Already handled by ambient in EntityManager)

    // Level 3: Fireflies
    if (level >= EvolutionLevel.Fireflies && this.fireflies.length < 40) {
        const f = new PIXI.Graphics();
        f.circle(0, 0, 2);
        f.fill({ color: 0xfacc15, alpha: 0.6 });
        f.x = playerX + (Math.random() - 0.5) * 1000;
        f.y = playerY + (Math.random() - 0.5) * 1000;
        (f as any).vx = (Math.random() - 0.5) * 1.5;
        (f as any).vy = (Math.random() - 0.5) * 1.5;
        this.fireflies.push(f);
        this.fireflyLayer.addChild(f);
    }
    this.fireflies.forEach(f => {
        // Wind influence in later stages
        const wind = level >= EvolutionLevel.Weather ? Math.sin(Date.now() * 0.001) * 0.5 : 0;
        f.x += ((f as any).vx + wind) * delta;
        f.y += (f as any).vy * delta;
        f.alpha = 0.2 + Math.sin(Date.now() * 0.002 + f.x) * 0.4;
    });

    // Level 4: Grasslands (V18 Rebuild)
    if (level >= EvolutionLevel.Grasslands && this.grassLayer.children.length < 200) {
        const g = new PIXI.Graphics();
        g.rect(0, 0, 1, 6);
        g.fill({ color: 0x22d3ee, alpha: 0.2 });
        g.x = playerX + (Math.random() - 0.5) * 2000;
        g.y = playerY + (Math.random() - 0.5) * 2000;
        this.grassLayer.addChild(g);
    }

    // Level 5: Forest (V18 Rebuild)
    if (level >= EvolutionLevel.Forest && this.treeLayer.children.length < 30) {
        const t = new PIXI.Graphics();
        const height = 100 + Math.random() * 200;
        t.rect(-15, -height/2, 30, height);
        t.fill({ color: 0x0f172a, alpha: 0.3 });
        t.x = playerX + (Math.random() - 0.5) * 3000;
        t.y = playerY + (Math.random() - 0.5) * 3000;
        this.treeLayer.addChild(t);
    }

    // Level 6: Weather Systems (Rain)
    if (level >= EvolutionLevel.Weather && this.rainDrops.length < 150) {
        const r = new PIXI.Graphics();
        r.rect(0, 0, 1, 15);
        r.fill({ color: 0x22d3ee, alpha: 0.2 });
        r.x = Math.random() * window.innerWidth;
        r.y = -20;
        this.rainDrops.push(r);
        this.weatherLayer.addChild(r);
    }
    this.rainDrops.forEach(r => {
        r.y += 12 * delta;
        if (r.y > window.innerHeight) {
            r.y = -20;
            r.x = Math.random() * window.innerWidth;
        }
    });

    // Level 7: Cosmic Atmosphere (V15 Rebuild)
    if (level >= EvolutionLevel.Constellations) {
        this.cosmicLayer.alpha = Math.min(1, this.cosmicLayer.alpha + 0.001);
        if (this.cosmicLayer.children.length < 8) {
            const nebula = new PIXI.Graphics();
            const radius = 300 + Math.random() * 300;
            nebula.circle(0, 0, radius);
            const color = Math.random() > 0.5 ? 0x8b5cf6 : 0x22d3ee;
            nebula.fill({ color, alpha: 0.03 });
            nebula.x = playerX + (Math.random() - 0.5) * 5000;
            nebula.y = playerY + (Math.random() - 0.5) * 5000;
            (nebula as any).pulse = Math.random() * Math.PI;
            this.cosmicLayer.addChild(nebula);
        }
    }
    this.cosmicLayer.children.forEach(n => {
        if ((n as any).pulse !== undefined) {
            (n as any).pulse += 0.01 * delta;
            n.alpha = 0.5 + Math.sin((n as any).pulse) * 0.2;
        }
    });
  }
}
