import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';

export class CompanionBrain {
  private sprite: PIXI.Graphics;
  private targetPosition: PIXI.Point;
  private moveTimer: number = 0;

  constructor(sprite: PIXI.Graphics) {
    this.sprite = sprite;
    this.targetPosition = new PIXI.Point(sprite.x, sprite.y);
  }

  public update(delta: number) {
    const { companion } = useStore.getState();

    // AI Wandering logic
    this.moveTimer += delta;
    if (this.moveTimer > 200) {
      this.setNewTarget();
      this.moveTimer = 0;
    }

    // Smooth movement to target
    const lerp = 0.02 * delta;
    this.sprite.x += (this.targetPosition.x - this.sprite.x) * lerp;
    this.sprite.y += (this.targetPosition.y - this.sprite.y) * lerp;

    // Pulse based on emotion
    const pulseSpeed = companion.emotion === 'excited' ? 0.01 : 0.005;
    const scale = 1 + Math.sin(Date.now() * pulseSpeed) * 0.1;
    this.sprite.scale.set(scale);
  }

  private setNewTarget() {
    this.targetPosition.set(
      100 + Math.random() * 600,
      100 + Math.random() * 400
    );

    useStore.setState((state) => ({
      companion: {
        ...state.companion,
        position: { x: this.targetPosition.x, y: this.targetPosition.y },
        emotion: Math.random() > 0.8 ? 'exploring' : state.companion.emotion
      }
    }));
  }
}
