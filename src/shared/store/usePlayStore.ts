import { create } from 'zustand';
import type { PlayState } from '../types';

interface PlayStore extends PlayState {
  launchGame: (gameId: string) => void;
  exitToDashboard: () => void;
  updateXP: (amount: number) => void;
  toggleFavorite: (gameId: string) => void;
  // Last Light specific (modularized)
  lastLight?: {
    energy: number;
    evolutionLevel: number;
    evolutionProgress: number;
    totalMemoriesCollected: number;
  };
  setLastLightState: (state: any) => void;
}

export const usePlayStore = create<PlayStore>((set) => ({
  currentScene: 'dashboard',
  activeGameId: null,
  lastLight: {
    energy: 100,
    evolutionLevel: 1,
    evolutionProgress: 0,
    totalMemoriesCollected: 0
  },
  profile: {
    name: 'Dreamer One',
    level: 1,
    xp: 0,
    streak: 1,
    lastLogin: Date.now()
  },
  highScores: {},
  favorites: [],

  launchGame: (gameId) => set({ currentScene: 'game', activeGameId: gameId }),

  exitToDashboard: () => set({ currentScene: 'dashboard', activeGameId: null }),

  updateXP: (amount) => set((state) => {
      const newXP = state.profile.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return {
          profile: { ...state.profile, xp: newXP, level: newLevel }
      };
  }),

  toggleFavorite: (gameId) => set((state) => ({
      favorites: state.favorites.includes(gameId)
        ? state.favorites.filter(id => id !== gameId)
        : [...state.favorites, gameId]
  })),

  setLastLightState: (llState) => set((state) => ({
      lastLight: { ...state.lastLight, ...llState }
  }))
}));
