import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { WeatherManager } from '../systems/WeatherManager';

interface AnimatableGraphic extends PIXI.Graphics {
  vx?: number;
  vy?: number;
}

export class Environment {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private layers: Record<string, PIXI.Container> = {};
  private currentLevel: number = 0;
  private weatherContainer: PIXI.Container;

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;
    this.container = new PIXI.Container();
    this.weatherContainer = new PIXI.Container();

    if (world) {
      world.addChildAt(this.container, 0);
    } else {
      this.app.stage.addChildAt(this.container, 0);
    }

    this.app.stage.addChild(this.weatherContainer); // Weather on top

    this.initLayers();
  }

  private initLayers() {
    const layerNames = ['void', 'grass', 'fireflies', 'trees', 'rain', 'animals', 'constellations'];
    layerNames.forEach(name => {
      const layer = new PIXI.Container();
      layer.alpha = 0;
      this.layers[name] = layer;
      this.container.addChild(layer);
    });

    this.layers['void'].alpha = 1;
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, 4000, 4000).fill(0x050505); // Larger BG
    bg.x = -2000;
    bg.y = -2000;
    this.layers['void'].addChild(bg);
  }

  public update(delta: number) {
    const { world } = useStore.getState();
    const level = this.calculateLevel(world.age);

    if (level !== this.currentLevel) {
      this.transitionToLevel(level);
    }

    WeatherManager.update();
    this.updateWeatherEffects(world.weather, delta);

    // Level-specific animations
    if (level >= 3) this.updateFireflies(delta);
    if (level >= 6) this.updateAnimals(delta);
    if (level >= 7) this.updateConstellations();
  }

  private updateWeatherEffects(weather: string, delta: number) {
    if (weather === 'rain') {
      if (this.weatherContainer.children.length < 100) {
        const drop = new PIXI.Graphics();
        drop.rect(0, 0, 1, 15).fill({ color: 0x60a5fa, alpha: 0.4 });
        drop.x = Math.random() * this.app.screen.width;
        drop.y = -20;
        this.weatherContainer.addChild(drop);
      }
    } else if (weather === 'snow') {
      if (this.weatherContainer.children.length < 50) {
        const flake = new PIXI.Graphics();
        flake.circle(0, 0, 2).fill({ color: 0xffffff, alpha: 0.8 });
        flake.x = Math.random() * this.app.screen.width;
        flake.y = -10;
        this.weatherContainer.addChild(flake);
      }
    }

    this.weatherContainer.children.forEach((obj: PIXI.Graphics) => {
      if (weather === 'rain') {
        obj.y += 15 * delta;
      } else if (weather === 'snow') {
        obj.y += 2 * delta;
        obj.x += Math.sin(Date.now() * 0.002) * 1;
      } else {
        obj.alpha -= 0.01;
      }

      if (obj.y > this.app.screen.height || obj.alpha <= 0) {
        this.weatherContainer.removeChild(obj);
        obj.destroy();
      }
    });
  }

  private calculateLevel(age: number): number {
      if (age >= 145) return 7;
      if (age >= 90) return 6;
      if (age >= 50) return 5;
      if (age >= 30) return 4;
      if (age >= 20) return 3;
      if (age >= 10) return 2;
      return 1;
  }

  private transitionToLevel(newLevel: number) {
    this.currentLevel = newLevel;
    if (newLevel >= 2) this.fadeInLayer('grass');
    if (newLevel >= 3) this.fadeInLayer('fireflies');
    if (newLevel >= 4) this.fadeInLayer('trees');
    if (newLevel >= 6) this.fadeInLayer('animals');
    if (newLevel >= 7) this.fadeInLayer('constellations');
  }

  private fadeInLayer(name: string) {
    const layer = this.layers[name];
    if (layer) {
      if (layer.children.length === 0) {
        this.populateLayer(name);
      }
      layer.alpha = 1;
    }
  }

  private populateLayer(name: string) {
    const areaW = 2000;
    const areaH = 2000;
    const offsetX = -1000;
    const offsetY = -1000;

    if (name === 'grass') {
      for (let i = 0; i < 300; i++) {
        const blade = new PIXI.Graphics();
        blade.rect(0, 0, 3, 20 + Math.random() * 30).fill({ color: 0x4ade80, alpha: 0.4 });
        blade.x = offsetX + Math.random() * areaW;
        blade.y = 400 + (Math.random() - 0.5) * 100;
        this.layers['grass'].addChild(blade);
      }
    } else if (name === 'fireflies') {
      for (let i = 0; i < 150; i++) {
        const firefly = new PIXI.Graphics() as AnimatableGraphic;
        firefly.circle(0, 0, 2).fill({ color: 0xfef08a, alpha: 0.9 });
        firefly.x = offsetX + Math.random() * areaW;
        firefly.y = offsetY + Math.random() * areaH;
        firefly.vx = (Math.random() - 0.5) * 2;
        firefly.vy = (Math.random() - 0.5) * 2;
        this.layers['fireflies'].addChild(firefly);
      }
    } else if (name === 'trees') {
      for (let i = 0; i < 40; i++) {
        const tree = new PIXI.Graphics();
        tree.rect(-6, -80, 12, 80).fill({ color: 0x171717, alpha: 0.9 });
        tree.circle(0, -90, 40).fill({ color: 0x171717, alpha: 0.9 });
        tree.x = offsetX + Math.random() * areaW;
        tree.y = 450 + (Math.random() - 0.5) * 50;
        tree.scale.set(0.8 + Math.random() * 1.5);
        this.layers['trees'].addChild(tree);
      }
    } else if (name === 'animals') {
      for (let i = 0; i < 15; i++) {
        const animal = new PIXI.Graphics() as AnimatableGraphic;
        animal.ellipse(0, 0, 20, 12).fill({ color: 0xf8fafc, alpha: 0.3 });
        animal.x = offsetX + Math.random() * areaW;
        animal.y = 420 + (Math.random() - 0.5) * 100;
        animal.vx = (Math.random() - 0.5) * 1;
        this.layers['animals'].addChild(animal);
      }
    } else if (name === 'constellations') {
      for (let i = 0; i < 200; i++) {
        const star = new PIXI.Graphics();
        star.circle(0, 0, 2).fill({ color: 0xffffff, alpha: 0.4 + Math.random() * 0.6 });
        star.x = offsetX + Math.random() * areaW;
        star.y = offsetY + Math.random() * (areaH * 0.4);
        this.layers['constellations'].addChild(star);
      }
    }
  }

  private updateAnimals(delta: number) {
    this.layers['animals'].children.forEach((animal: AnimatableGraphic) => {
      if (animal.vx) {
          animal.x += animal.vx * delta;
          if (animal.x < -1000) animal.x = 1000;
          if (animal.x > 1000) animal.x = -1000;
      }
    });
  }

  private updateConstellations() {
    this.layers['constellations'].children.forEach((star) => {
      star.alpha = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + star.x)) * 0.7;
    });
  }

  private updateFireflies(delta: number) {
    const layer = this.layers['fireflies'];
    layer.children.forEach((f: AnimatableGraphic) => {
      if (f.vx && f.vy) {
          f.x += f.vx * delta;
          f.y += f.vy * delta;
          if (f.x < -1000) f.x = 1000;
          if (f.x > 1000) f.x = -1000;
          if (f.y < -1000) f.y = 1000;
          if (f.y > 1000) f.y = -1000;
          f.alpha = 0.5 + Math.sin(Date.now() * 0.002 + f.x) * 0.5;
      }
    });
  }

  public destroy() {
    this.container.destroy({ children: true });
    this.weatherContainer.destroy({ children: true });
  }
}
