import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineSimulationManager } from './OfflineSimulationManager';
import { useStore } from '../store/useStore';

describe('OfflineSimulationManager', () => {
  beforeEach(() => {
    useStore.getState().resetGame();
  });

  it('should generate journal entries after time away', () => {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Manually set lastSeen to 1 day ago
    useStore.setState({ lastSeen: now - oneDay, isStarted: true });

    OfflineSimulationManager.simulate();

    const state = useStore.getState();
    expect(state.journal.length).toBeGreaterThan(1);
    expect(state.world.age).toBe(2);
  });
});
