import * as PIXI from 'pixi.js';
import { useStore } from '../state/useStore';

interface AnimatableGraphic extends PIXI.Graphics {
  vx?: number;
  vy?: number;
}

export class Environment {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private layers: Record<string, PIXI.Container> = {};
  private currentLevel: number = 0;

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;
    this.container = new PIXI.Container();

    if (world) {
      world.addChildAt(this.container, 0);
    } else {
      this.app.stage.addChildAt(this.container, 0); // Behind everything
    }

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

    // Initial void state
    this.layers['void'].alpha = 1;
    const bg = new PIXI.Graphics();
    bg.fill(0x050505);
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.layers['void'].addChild(bg);
  }

  public update(delta: number) {
    const { level } = useStore.getState();

    if (level !== this.currentLevel) {
      this.transitionToLevel(level);
    }

    // Level-specific animations
    if (level >= 3) this.updateFireflies(delta);
    if (level >= 5) this.updateRain(delta);
    if (level >= 6) this.updateAnimals(delta);
    if (level >= 7) this.updateConstellations();
  }

  private transitionToLevel(newLevel: number) {
    this.currentLevel = newLevel;

    if (newLevel >= 2) this.fadeInLayer('grass');
    if (newLevel >= 3) this.fadeInLayer('fireflies');
    if (newLevel >= 4) this.fadeInLayer('trees');
    if (newLevel >= 5) this.fadeInLayer('rain');
    if (newLevel >= 6) this.fadeInLayer('animals');
    if (newLevel >= 7) this.fadeInLayer('constellations');
  }

  private fadeInLayer(name: string) {
    const layer = this.layers[name];
    if (layer) {
      if (layer.children.length === 0) {
        this.populateLayer(name);
      }

      const ticker = () => {
        if (layer.alpha < 1 && !layer.destroyed) {
          layer.alpha += 0.005;
          requestAnimationFrame(ticker);
        }
      };
      ticker();
    }
  }

  private populateLayer(name: string) {
    const { width, height } = this.app.screen;

    if (name === 'grass') {
      for (let i = 0; i < 60; i++) {
        const blade = new PIXI.Graphics();
        blade.fill({ color: 0x2d5a27, alpha: 0.3 });
        blade.rect(0, 0, 3, 20 + Math.random() * 30);
        blade.x = Math.random() * width;
        blade.y = height - Math.random() * 40;
        this.layers['grass'].addChild(blade);
      }
    } else if (name === 'fireflies') {
      for (let i = 0; i < 25; i++) {
        const firefly = new PIXI.Graphics() as AnimatableGraphic;
        firefly.fill({ color: 0xffffaa, alpha: 0.7 });
        firefly.circle(0, 0, 2);
        firefly.x = Math.random() * width;
        firefly.y = Math.random() * height;
        firefly.vx = (Math.random() - 0.5) * 1.5;
        firefly.vy = (Math.random() - 0.5) * 1.5;
        this.layers['fireflies'].addChild(firefly);
      }
    } else if (name === 'trees') {
      for (let i = 0; i < 8; i++) {
        const tree = new PIXI.Graphics();
        tree.fill({ color: 0x1a1a1a, alpha: 0.8 });
        tree.rect(-5, -60, 10, 60); // Trunk
        tree.circle(0, -70, 30); // Foliage
        tree.x = Math.random() * width;
        tree.y = height - 20;
        tree.scale.set(0.8 + Math.random() * 0.5);
        this.layers['trees'].addChild(tree);
      }
    } else if (name === 'rain') {
      for (let i = 0; i < 100; i++) {
        const drop = new PIXI.Graphics();
        drop.fill({ color: 0x4444ff, alpha: 0.2 });
        drop.rect(0, 0, 1, 10);
        drop.x = Math.random() * width;
        drop.y = Math.random() * height;
        this.layers['rain'].addChild(drop);
      }
    } else if (name === 'animals') {
      for (let i = 0; i < 3; i++) {
        const animal = new PIXI.Graphics() as AnimatableGraphic;
        animal.fill({ color: 0xffffff, alpha: 0.1 });
        animal.ellipse(0, 0, 15, 10); // Simple blob
        animal.x = Math.random() * width;
        animal.y = height - 40;
        animal.vx = (Math.random() - 0.5) * 0.5;
        this.layers['animals'].addChild(animal);
      }
    } else if (name === 'constellations') {
      for (let i = 0; i < 40; i++) {
        const star = new PIXI.Graphics();
        star.fill({ color: 0xffffff, alpha: Math.random() });
        star.circle(0, 0, 1.5);
        star.x = Math.random() * width;
        star.y = Math.random() * (height * 0.6);
        this.layers['constellations'].addChild(star);
      }
    }
  }

  private updateRain(delta: number) {
    this.layers['rain'].children.forEach((drop) => {
      drop.y += 10 * delta;
      if (drop.y > this.app.screen.height) drop.y = -10;
    });
  }

  private updateAnimals(delta: number) {
    this.layers['animals'].children.forEach((animal: AnimatableGraphic) => {
      if (animal.vx) {
          animal.x += animal.vx * delta;
          if (animal.x < -20) animal.x = this.app.screen.width + 20;
          if (animal.x > this.app.screen.width + 20) animal.x = -20;
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

          if (f.x < 0) f.x = this.app.screen.width;
          if (f.x > this.app.screen.width) f.x = 0;
          if (f.y < 0) f.y = this.app.screen.height;
          if (f.y > this.app.screen.height) f.y = 0;

          f.alpha = 0.5 + Math.sin(Date.now() * 0.002 + f.x) * 0.5;
      }
    });
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
