import type { DailyChallenge } from '../types';

export class ChallengeManager {
  /**
   * Checks if any daily challenges were completed during a game session.
   */
  public static checkProgress(
      gameId: string,
      score: number,
      dailyChallenges: DailyChallenge[],
      completeChallenge: (id: string) => void,
      updateXP: (amount: number) => void
  ) {
    dailyChallenges.forEach(challenge => {
      if (!challenge.completed && challenge.gameId === gameId) {
        if (score >= challenge.goal) {
          completeChallenge(challenge.id);
          updateXP(challenge.rewardXP);
          console.log(`Challenge Completed: ${challenge.description}`);
        }
      }
    });
  }

  /**
   * Returns a random game modifier based on the day of the week.
   */
  public static getDailyModifier() {
    const day = new Date().getDay();
    const modifiers = [
      { id: 'zen', name: 'Zen Mode', desc: 'No energy decay.', gameId: 'last-light' },
      { id: 'speed', name: 'Hyper Speed', desc: '2x faster.', gameId: 'snake' },
      { id: 'gold', name: 'Golden Era', desc: 'Double XP.', gameId: 'any' },
    ];
    return modifiers[day % modifiers.length];
  }
}
