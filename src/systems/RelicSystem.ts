import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';

export class RelicSystem {
  private static relics = ["Ancient Lantern", "Void Crystal", "Echoing Shell", "Star Map", "Spirit Flute"];

  public static spawnRelic(container: PIXI.Container, x: number, y: number) {
    const relic = new PIXI.Graphics() as any;
    relic.poly([0, -15, 10, 5, 0, 15, -10, 5]).fill({ color: 0xFDE68A, alpha: 0.9 });
    relic.stroke({ color: 0xffffff, width: 2 });
    relic.x = x;
    relic.y = y;
    relic.eventMode = 'static';
    relic.cursor = 'pointer';
    relic.relicName = this.relics[Math.floor(Math.random() * this.relics.length)];

    relic.on('pointerdown', () => {
      const { addRelic, addJournalEntry } = useStore.getState();
      addRelic(relic.relicName);
      addJournalEntry(`Discovered a rare relic: ${relic.relicName}`, 'milestone');
      container.removeChild(relic);
    });

    container.addChild(relic);

    // Sparkle effect
    const sparkle = new PIXI.Graphics();
    sparkle.circle(0, 0, 20).fill({ color: 0xffffff, alpha: 0.2 });
    relic.addChild(sparkle);

    const tick = () => {
        relic.rotation += 0.02;
        sparkle.alpha = 0.2 + Math.sin(Date.now() * 0.005) * 0.1;
        if (!container.children.includes(relic)) PIXI.Ticker.shared.remove(tick);
    };
    PIXI.Ticker.shared.add(tick);
  }
}
