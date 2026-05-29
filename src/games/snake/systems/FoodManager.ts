import * as PIXI from 'pixi.js';

export type FoodType = 'common' | 'rare' | 'golden' | 'legendary';

export class FoodManager {
  private stage: PIXI.Container;
  private container: PIXI.Container;
  private pool: PIXI.Graphics[] = [];

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.container = new PIXI.Container();
    this.stage.addChild(this.container);
  }

  public spawn(x: number, y: number, type: FoodType) {
    const food = this.pool.pop() || new PIXI.Graphics();
    food.clear();

    const colors = {
        common: 0x4ade80,
        rare: 0x22d3ee,
        golden: 0xfacc15,
        legendary: 0x8b5cf6
    };

    const size = type === 'legendary' ? 10 : type === 'golden' ? 8 : type === 'rare' ? 6 : 4;

    food.circle(0, 0, size);
    food.fill({ color: colors[type], alpha: 0.9 });
    food.circle(0, 0, size * 2.5);
    food.fill({ color: colors[type], alpha: 0.2 });

    food.x = x;
    food.y = y;
    (food as any).foodType = type;
    (food as any).pulse = 0;

    this.container.addChild(food);
  }

  public update(delta: number) {
    this.container.children.forEach(f => {
        const gf = f as any;
        gf.pulse += 0.1 * delta;
        gf.scale.set(1 + Math.sin(gf.pulse) * 0.15);
    });
  }

  public collect(food: PIXI.Graphics) {
    this.container.removeChild(food);
    this.pool.push(food);
  }

  public reset() {
      this.container.removeChildren();
  }

  public getActive() {
    return this.container.children as PIXI.Graphics[];
  }
}
