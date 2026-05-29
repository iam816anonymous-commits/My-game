import { EvolutionLevel, EVOLUTION_THRESHOLDS, INITIAL_STATE } from '../types';
import type { GameState } from '../types';

export class ProgressionManager {
  private state: GameState;
  private readonly DECAY_RATE = 0.05; // energy loss per second

  constructor(initialState: GameState = INITIAL_STATE) {
    this.state = { ...initialState };
  }

  public update(delta: number): GameState {
    // Decay energy (V11: Slower decay early on)
    const decayMult = this.state.evolutionLevel === 1 ? 0.4 : 1.0;
    const decay = (this.DECAY_RATE * delta * decayMult) / 60;
    this.state.energy = Math.max(0, this.state.energy - decay);

    // Update evolution progress
    this.updateEvolution();

    return this.state;
  }

  private comboCount = 0;
  private lastCollectTime = 0;

  public collectMemory(type: 'standard' | 'rare' | 'gold'): GameState {
    const now = Date.now();
    if (now - this.lastCollectTime < 1500) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastCollectTime = now;

    const energyGain = type === 'gold' ? 50 : type === 'rare' ? 25 : 10;
    const comboBonus = Math.min(2, 1 + this.comboCount * 0.1);

    this.state.energy = Math.min(100, this.state.energy + energyGain * comboBonus);
    this.state.memoriesCollected += 1;
    this.state.totalMemoriesCollected += 1;
    (this.state as any).currentCombo = this.comboCount;

    // Check achievements and evolution
    this.checkAchievements(type);
    this.updateEvolution();

    return this.state;
  }

  private updateEvolution() {
    const levels = Object.values(EvolutionLevel).filter(v => typeof v === 'number') as number[];
    let currentLevel: EvolutionLevel = EvolutionLevel.Void;

    for (const level of levels) {
      const threshold = EVOLUTION_THRESHOLDS[level as EvolutionLevel];
      if (this.state.totalMemoriesCollected >= threshold) {
        currentLevel = level as EvolutionLevel;
      }
    }

    if (currentLevel !== this.state.evolutionLevel) {
      this.state.evolutionLevel = currentLevel;
      const ach = this.state.achievements.find(a => a.id === 'level_2');
      if (currentLevel >= EvolutionLevel.Grass && ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = Date.now();
      }
    }

    // Calculate progress to next level
    const currentThreshold = EVOLUTION_THRESHOLDS[this.state.evolutionLevel];
    const nextLevel = (this.state.evolutionLevel + 1) as EvolutionLevel;
    const nextThreshold = EVOLUTION_THRESHOLDS[nextLevel] || currentThreshold * 2;

    this.state.evolutionProgress = Math.min(1,
      (this.state.totalMemoriesCollected - currentThreshold) / (nextThreshold - currentThreshold)
    );
  }

  private checkAchievements(type: 'standard' | 'rare' | 'gold') {
    if (this.state.totalMemoriesCollected === 1) {
      const ach = this.state.achievements.find(a => a.id === 'first_memory');
      if (ach) { ach.unlocked = true; ach.unlockedAt = Date.now(); }
    }
    if (type === 'rare') {
      const ach = this.state.achievements.find(a => a.id === 'rare_memory');
      if (ach) { ach.unlocked = true; ach.unlockedAt = Date.now(); }
    }
  }

  public getState(): GameState {
    return this.state;
  }
}
