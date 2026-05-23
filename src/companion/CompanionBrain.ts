import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';

export class CompanionBrain {
  private sprite: PIXI.Container;
  private targetPosition: PIXI.Point;
  private moveTimer: number = 0;
  private wanderRadius: number = 300;

  constructor(sprite: PIXI.Container) {
    this.sprite = sprite;
    this.targetPosition = new PIXI.Point(sprite.x, sprite.y);
  }

  public update(delta: number) {
    const { companion } = useStore.getState();

    // AI Wandering
    this.moveTimer += delta;
    if (this.moveTimer > 240) {
      this.setNewTarget();
      this.moveTimer = 0;
    }

    const lerp = 0.015 * delta;
    this.sprite.x += (this.targetPosition.x - this.sprite.x) * lerp;
    this.sprite.y += (this.targetPosition.y - this.sprite.y) * lerp;

    const driftY = Math.sin(Date.now() * 0.001) * 15;
    const driftX = Math.cos(Date.now() * 0.0008) * 10;
    this.sprite.pivot.set(driftX, driftY);

    const dx = this.targetPosition.x - this.sprite.x;
    const targetRot = Math.max(-0.2, Math.min(0.2, dx * 0.001));
    this.sprite.rotation += (targetRot - this.sprite.rotation) * 0.05;

    const pulseSpeed = companion.emotion === 'excited' ? 0.012 : 0.006;
    const scale = 1 + Math.sin(Date.now() * pulseSpeed) * 0.04;
    this.sprite.scale.set(scale);
  }

  private setNewTarget() {
    this.targetPosition.set(
      400 + (Math.random() - 0.5) * this.wanderRadius * 2,
      300 + (Math.random() - 0.5) * this.wanderRadius * 2
    );

    if (Math.random() > 0.9) {
        const emotions: any[] = ['exploring', 'happy', 'waiting'];
        const nextEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        useStore.setState((state) => ({
            companion: { ...state.companion, emotion: nextEmotion }
        }));
    }
  }
}
