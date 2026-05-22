import { useStore } from '../store/useStore';

export class EventSystem {
  private static lastCheck: number = 0;

  public static update(delta: number) {
    this.lastCheck += delta;
    if (this.lastCheck > 1000) {
      this.checkRandomEvents();
      this.lastCheck = 0;
    }
  }

  private static checkRandomEvents() {
    const { addJournalEntry, world } = useStore.getState();
    const rand = Math.random();

    // Meteor Shower (Rare)
    if (rand < 0.0001 && world.weather === 'clear') {
      addJournalEntry("A meteor shower lit up the night sky.", 'event');
    }

    // Golden Fox Visit (Extremely Rare)
    if (rand < 0.00005) {
      addJournalEntry("A golden spirit visited the world today.", 'event');
    }

    // Companion bringing gift
    if (rand < 0.0005) {
      const flowers = ["Moon Petal", "Star Bloom", "Night Lily"];
      const gift = flowers[Math.floor(Math.random() * flowers.length)];
      addJournalEntry(`Your companion brought you a ${gift}.`, 'interaction');
    }
  }
}
