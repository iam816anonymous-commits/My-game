import { create } from 'zustand';
import type { GameState, GameActions } from '../types/game';

const INITIAL_STATE: GameState = {
  version: '2.0.0',
  lastSeen: Date.now(),
  createdAt: Date.now(),
  streak: 0,
  totalMemories: 0,
  isStarted: false,
  isPaused: false,
  isGameOver: false,

  companion: {
    emotion: 'waiting',
    traits: {
      curious: 10,
      playful: 10,
      sleepy: 10,
      adventurous: 10,
      gentle: 10,
      shy: 10,
    },
    lastAction: 'Waiting for you...',
    skin: 'default',
    accessories: [],
  },

  world: {
    age: 1,
    energy: 100,
    unlockedFeatures: ['void'],
    theme: 'aurora',
    weather: 'clear',
    lastWeatherChange: Date.now(),
  },

  journal: [
    {
      id: 'initial',
      day: 1,
      timestamp: Date.now(),
      text: 'A soft light appeared in the void.',
      type: 'milestone',
    }
  ],

  achievements: [],
};

export const useStore = create<GameState & GameActions>((set, get) => ({
  ...INITIAL_STATE,

  startGame: () => set({ isStarted: true, lastSeen: Date.now() }),

  tick: (delta, now) => set((state) => {
    if (!state.isStarted || state.isPaused) return {};

    // Slow energy decay
    const energyDecay = 0.001 * delta;
    const newEnergy = Math.max(0, state.world.energy - energyDecay);

    return {
      world: { ...state.world, energy: newEnergy },
      lastSeen: now
    };
  }),

  returnToWorld: (now) => {
    const state = get();
    const diff = now - state.lastSeen;
    const daysAway = Math.floor(diff / (24 * 60 * 60 * 1000));

    // Streak logic
    let newStreak = state.streak;
    if (daysAway === 0) {
      // Returned same day
    } else if (daysAway === 1) {
      newStreak += 1;
    } else {
      newStreak = 0;
    }

    set({
      streak: newStreak,
      lastSeen: now,
      world: {
        ...state.world,
        age: state.world.age + daysAway,
        energy: Math.min(100, state.world.energy + (newStreak > 0 ? 20 : 0)) // Reward for returning
      }
    });
  },

  interact: () => set((state) => {
    // Increase playful trait
    const newPlayful = Math.min(100, state.companion.traits.playful + 1);
    return {
      companion: {
        ...state.companion,
        emotion: 'happy',
        traits: { ...state.companion.traits, playful: newPlayful }
      }
    };
  }),

  addMemory: (amount) => set((state) => ({
    totalMemories: state.totalMemories + amount,
    world: { ...state.world, energy: Math.min(100, state.world.energy + (amount * 2)) }
  })),

  unlockFeature: (id) => set((state) => ({
    world: {
      ...state.world,
      unlockedFeatures: [...state.world.unlockedFeatures, id]
    }
  })),

  setTheme: (theme) => set((state) => ({
    world: { ...state.world, theme }
  })),

  addJournalEntry: (text, type = 'event') => set((state) => ({
    journal: [
      {
        id: Math.random().toString(36).substr(2, 9),
        day: state.world.age,
        timestamp: Date.now(),
        text,
        type,
      },
      ...state.journal
    ].slice(0, 50) // Keep last 50
  })),

  resetGame: () => set(INITIAL_STATE),
}));
