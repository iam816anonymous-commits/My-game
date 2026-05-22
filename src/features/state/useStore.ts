import { create } from 'zustand';
import type { GameState, GameActions, Level, Achievement } from '../../types/game';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_light', title: 'First Light', description: 'Collect your first memory', unlocked: false },
  { id: 'level_2', title: 'Awakening', description: 'Reach Level 2', unlocked: false },
  { id: 'nature_lover', title: 'Nature Lover', description: 'Reach Level 4', unlocked: false },
  { id: 'stargazer', title: 'Stargazer', description: 'Reach Level 7', unlocked: false },
];

const LEVEL_THRESHOLDS: Record<Level, number> = {
  1: 0,
  2: 10,
  3: 25,
  4: 50,
  5: 100,
  6: 200,
  7: 500,
};

const ENERGY_DECAY_RATE = 0.05;

export const useStore = create<GameState & GameActions>((set) => ({
  energy: 100,
  score: 0,
  totalMemories: 0,
  level: 1,
  achievements: INITIAL_ACHIEVEMENTS,
  lastLogin: Date.now(),
  lastRewardClaim: 0,
  isPaused: false,
  isGameOver: false,
  isStarted: false,

  setEnergy: (energy) => set({ energy: Math.min(100, Math.max(0, energy)) }),

  addEnergy: (amount) => set((state) => ({
    energy: Math.min(100, state.energy + amount)
  })),

  addMemory: (amount) => set((state) => {
    const newTotal = state.totalMemories + amount;
    let nextLevel = state.level;

    for (let i = 7; i >= 1; i--) {
      if (newTotal >= LEVEL_THRESHOLDS[i as Level]) {
        nextLevel = i as Level;
        break;
      }
    }

    const newAchievements = state.achievements.map(ach => {
      if (ach.id === 'first_light' && !ach.unlocked && newTotal > 0) {
        return { ...ach, unlocked: true, unlockedAt: Date.now() };
      }
      if (ach.id === 'level_2' && !ach.unlocked && nextLevel >= 2) {
        return { ...ach, unlocked: true, unlockedAt: Date.now() };
      }
      if (ach.id === 'nature_lover' && !ach.unlocked && nextLevel >= 4) {
        return { ...ach, unlocked: true, unlockedAt: Date.now() };
      }
      if (ach.id === 'stargazer' && !ach.unlocked && nextLevel >= 7) {
        return { ...ach, unlocked: true, unlockedAt: Date.now() };
      }
      return ach;
    });

    return {
      totalMemories: newTotal,
      score: state.score + (amount * state.level),
      level: nextLevel,
      achievements: newAchievements,
      energy: Math.min(100, state.energy + (amount * 2)) // Reduced bonus per memory
    };
  }),

  setLevel: (level) => set({ level }),

  unlockAchievement: (id) => set((state) => ({
    achievements: state.achievements.map(ach =>
      ach.id === id ? { ...ach, unlocked: true, unlockedAt: Date.now() } : ach
    )
  })),

  resetGame: () => set({
    energy: 100,
    score: 0,
    totalMemories: 0,
    level: 1,
    isGameOver: false,
    isStarted: true,
  }),

  startGame: () => set({ isStarted: true, isPaused: false, isGameOver: false, energy: 100 }),

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => set({ isPaused: false }),

  tick: (delta) => set((state) => {
    if (!state.isStarted || state.isPaused || state.isGameOver) return {};

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let currentEnergy = state.energy;
    let rewardUpdate = {};

    // Use a safer reward check (throttle)
    if (state.lastRewardClaim === 0 || now - state.lastRewardClaim > oneDay) {
      currentEnergy = Math.min(100, state.energy + 20);
      rewardUpdate = {
        lastRewardClaim: now
      };
    }

    const decayMultiplier = state.totalMemories === 0 ? 1.5 : 1;
    // Cap delta to prevent massive jumps after long backgrounding
    const cappedDelta = Math.min(delta, 100);
    const newEnergy = currentEnergy - (ENERGY_DECAY_RATE * cappedDelta * decayMultiplier);

    if (newEnergy <= 0) {
      return { ...rewardUpdate, energy: 0, isGameOver: true };
    }

    return { ...rewardUpdate, energy: newEnergy };
  }),
}));
