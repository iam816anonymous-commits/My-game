import type { GameState } from '../types';

export class RewardSystem {
  public static calculateDailyRewards(state: GameState): { energyBoost: number, streak: number } {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const timeSinceLastPlay = now - state.lastPlayTime;

    let energyBoost = 0;
    let streak = state.dailyStreak;

    if (timeSinceLastPlay > oneDay && timeSinceLastPlay < oneDay * 2) {
      streak += 1;
      energyBoost = 20; // Bonus for returning
    } else if (timeSinceLastPlay >= oneDay * 2) {
      streak = 1; // Reset streak
      energyBoost = 10;
    }

    return { energyBoost, streak };
  }
}
