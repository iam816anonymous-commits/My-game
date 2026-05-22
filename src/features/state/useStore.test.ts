import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

describe('Game Store', () => {
  beforeEach(() => {
    const { resetGame } = useStore.getState();
    resetGame();
  });

  it('should initialize with correct default values', () => {
    const state = useStore.getState();
    expect(state.energy).toBe(100);
    expect(state.level).toBe(1);
    expect(state.totalMemories).toBe(0);
    expect(state.isGameOver).toBe(false);
  });

  it('should decrease energy on tick', () => {
    const { tick, startGame } = useStore.getState();
    startGame();
    tick(1);
    const state = useStore.getState();
    expect(state.energy).toBeLessThan(100);
  });

  it('should increase level after collecting memories', () => {
    const { addMemory } = useStore.getState();
    addMemory(10); // Threshold for level 2 is 10
    const state = useStore.getState();
    expect(state.level).toBe(2);
  });

  it('should set isGameOver when energy reaches zero', () => {
    const { tick, startGame, setEnergy } = useStore.getState();
    startGame();
    setEnergy(0.01);
    tick(10); // Should be enough to reach 0
    const state = useStore.getState();
    expect(state.isGameOver).toBe(true);
    expect(state.energy).toBe(0);
  });
});
