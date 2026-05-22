import { useStore } from '../store/useStore';
import { JournalManager } from '../journal/JournalManager';

export class OfflineSimulationManager {
  public static simulate() {
    const { lastSeen, returnToWorld, addJournalEntry } = useStore.getState();
    const now = Date.now();
    const diff = now - lastSeen;

    // Only simulate if gone for more than 1 minute
    if (diff < 60000) return;

    const hoursAway = diff / (1000 * 60 * 60);
    const daysAway = Math.floor(hoursAway / 24);

    // Narrative generation
    const messages = JournalManager.generateReturnMessages(daysAway, hoursAway);
    messages.forEach(msg => addJournalEntry(msg));

    // Update world state
    returnToWorld(now);

    // Simulate memory collection while away
    const memoriesFound = Math.floor(hoursAway * 0.5); // 1 memory every 2 hours
    if (memoriesFound > 0) {
      useStore.getState().addMemory(memoriesFound);
      addJournalEntry(`While you were away, your companion collected ${memoriesFound} memories.`);
    }
  }
}
