import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { WeatherManager } from '../systems/WeatherManager';

export class Environment {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private layers: Record<string, PIXI.Container> = {};
  private currentLevel: number = 0;
  private weatherContainer: PIXI.Container;
  private starfield: PIXI.Container;
  private islands: PIXI.Container;
  private weatherPool: PIXI.Graphics[] = [];

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;
    this.container = new PIXI.Container();
    this.weatherContainer = new PIXI.Container();
    this.starfield = new PIXI.Container();
    this.islands = new PIXI.Container();

    if (world) {
      world.addChildAt(this.container, 0);
    } else {
      this.app.stage.addChildAt(this.container, 0);
    }

    this.container.addChild(this.starfield, this.islands);
    this.app.stage.addChild(this.weatherContainer);

    this.initWorld();
  }

  private initWorld() {
    // Deep space background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, 4000, 4000).fill(0x070B18);
    bg.x = -2000; bg.y = -2000;
    this.container.addChildAt(bg, 0);

    // Fog layers
    for (let i = 0; i < 3; i++) {
        const fog = new PIXI.Graphics();
        fog.rect(0, 0, 3000, 1000).fill({ color: 0x111827, alpha: 0.2 });
        fog.x = -1500;
        fog.y = 500 + i * 100;
        this.container.addChild(fog);
    }

    this.initLayers();
  }

  private initLayers() {
    const layerNames = ['void', 'grass', 'flowers', 'trees', 'pond', 'mountains', 'constellations'];
    layerNames.forEach(name => {
      const layer = new PIXI.Container();
      layer.alpha = 0;
      this.layers[name] = layer;
      this.islands.addChild(layer);
    });
    this.layers['void'].alpha = 1;
    this.populateStarfield();
  }

  private populateStarfield() {
    for (let i = 0; i < 200; i++) {
        const star = new PIXI.Graphics();
        const size = Math.random() * 1.5;
        star.circle(0, 0, size).fill({ color: 0xffffff, alpha: 0.2 + Math.random() * 0.6 });
        star.x = (Math.random() - 0.5) * 4000;
        star.y = (Math.random() - 0.5) * 4000;
        this.starfield.addChild(star);
    }
  }

  public update(delta: number) {
    const { world } = useStore.getState();
    const level = this.calculateLevel(world.age);

    if (level !== this.currentLevel) {
      this.transitionToLevel(level);
    }

    WeatherManager.update();
    this.updateWeatherEffects(world.weather, delta);
    this.animateEnvironment(delta);
  }

  private animateEnvironment(delta: number) {
    // Parallax stars slow orbit
    this.starfield.rotation += 0.00005 * delta;

    // Grass flow
    if (this.layers['grass'].alpha > 0) {
        this.layers['grass'].children.forEach((g: any, i) => {
            g.skew.x = Math.sin(Date.now() * 0.001 + i) * 0.1;
        });
    }

    // Island hover
    this.islands.y = Math.sin(Date.now() * 0.0005) * 10;
  }

  private updateWeatherEffects(weather: string, delta: number) {
    if (weather === 'rain') {
        if (Math.random() > 0.5 && this.weatherContainer.children.length < 150) {
            let drop = this.weatherPool.pop();
            if (!drop) {
              drop = new PIXI.Graphics();
              drop.rect(0, 0, 1, 25).fill({ color: 0x67E8F9, alpha: 0.25 });
            }
            drop.alpha = 1;
            drop.x = Math.random() * this.app.screen.width;
            drop.y = -30;
            this.weatherContainer.addChild(drop);
        }
    }

    const children = [...this.weatherContainer.children] as PIXI.Graphics[];
    children.forEach((obj) => {
        if (weather === 'rain') {
          obj.y += 20 * delta;
        } else {
          obj.alpha -= 0.05 * delta;
        }

        if (obj.y > this.app.screen.height + 30 || obj.alpha <= 0) {
            this.weatherContainer.removeChild(obj);
            this.weatherPool.push(obj);
        }
    });
  }

  private calculateLevel(age: number): number {
      if (age >= 100) return 7;
      if (age >= 60) return 6;
      if (age >= 30) return 5;
      if (age >= 15) return 4;
      if (age >= 7) return 3;
      if (age >= 3) return 2;
      return 1;
  }

  private transitionToLevel(newLevel: number) {
    this.currentLevel = newLevel;
    const order = ['void', 'grass', 'flowers', 'trees', 'pond', 'mountains', 'constellations'];
    for(let i = 0; i < newLevel; i++) {
        this.fadeInLayer(order[i]);
    }
  }

  private fadeInLayer(name: string) {
    const layer = this.layers[name];
    if (layer && layer.alpha < 1) {
        if (layer.children.length === 0) this.populateLayer(name);
        layer.alpha = 1; // Instant set, alpha is enough
    }
  }

  private populateLayer(name: string) {
    const w = 2000; const h = 1000;
    const ox = -1000; const oy = 200;

    if (name === 'grass') {
        for (let i = 0; i < 400; i++) {
            const g = new PIXI.Graphics();
            g.rect(0, 0, 2, 15 + Math.random() * 20).fill({ color: 0x111827, alpha: 0.6 });
            g.x = ox + Math.random() * w;
            g.y = oy + Math.random() * h;
            this.layers['grass'].addChild(g);
        }
    } else if (name === 'trees') {
        for (let i = 0; i < 15; i++) {
            const t = new PIXI.Graphics();
            t.poly([0, -100, 30, 0, -30, 0]).fill({ color: 0x070B18, alpha: 0.9 });
            t.x = ox + Math.random() * w;
            t.y = oy + Math.random() * h;
            t.scale.set(0.5 + Math.random());
            this.layers['trees'].addChild(t);
        }
    } else if (name === 'mountains') {
        const m = new PIXI.Graphics();
        m.poly([-1000, 500, 0, -200, 1000, 500]).fill({ color: 0x111827, alpha: 0.5 });
        m.x = 0; m.y = 100;
        this.layers['mountains'].addChild(m);
    } else if (name === 'constellations') {
        for (let i = 0; i < 5; i++) {
          const c = new PIXI.Graphics();
          const points = [];
          for (let p = 0; p < 5; p++) {
            points.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
          }
          c.poly(points).stroke({ color: 0x67E8F9, width: 1, alpha: 0.3 });
          points.forEach((_, pi) => {
            if (pi % 2 === 0) {
              c.circle(points[pi], points[pi+1], 2).fill({ color: 0xffffff });
            }
          });
          c.x = ox + Math.random() * w;
          c.y = oy + Math.random() * h;
          this.layers['constellations'].addChild(c);
        }
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
    this.weatherContainer.destroy({ children: true });
    this.weatherPool.forEach(p => p.destroy());
  }
}
