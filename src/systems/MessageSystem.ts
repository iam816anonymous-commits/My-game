import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';

export class MessageSystem {
  private static messages = [
    "You are never truly alone in the void.",
    "The stars remember your name.",
    "A soft light is enough to guide you.",
    "Breathe. The world is evolving.",
    "Peace is a choice made in the silence.",
    "Your light shines brighter than you know.",
  ];

  public static spawnMessage(container: PIXI.Container, x: number, y: number) {
    const spark = new PIXI.Graphics() as any;
    spark.circle(0, 0, 4).fill({ color: 0xFDE68A, alpha: 0.8 });
    spark.x = x;
    spark.y = y;
    spark.eventMode = 'static';
    spark.cursor = 'pointer';
    spark.message = this.messages[Math.floor(Math.random() * this.messages.length)];

    spark.on('pointerdown', () => {
      const { addJournalEntry } = useStore.getState();
      addJournalEntry(`Found a Starlight Message: "${spark.message}"`, 'event');
      container.removeChild(spark);
    });

    container.addChild(spark);

    // Animate floating
    const startY = y;
    const tick = () => {
        spark.y = startY + Math.sin(Date.now() * 0.002) * 10;
        if (!container.children.includes(spark)) PIXI.Ticker.shared.remove(tick);
    };
    PIXI.Ticker.shared.add(tick);
  }
}
