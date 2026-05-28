import { create } from 'zustand';
import type { PlayState, DailyChallenge } from '../types';
import { ChallengeManager } from '../systems/ChallengeManager';

interface PlayStore extends PlayState {
  launchGame: (gameId: string) => void;
  finishGame: (score: number) => void;
  exitToDashboard: () => void;
  updateXP: (amount: number) => void;
  toggleFavorite: (gameId: string) => void;
  completeChallenge: (id: string) => void;
  setTitle: (title: string) => void;
  setLastLightState: (state: any) => void;
  lastLight?: any;
}

const DEFAULT_CHALLENGES: DailyChallenge[] = [
    { id: 'c1', gameId: 'last-light', goal: 50, current: 0, description: 'Collect 50 particles in Last Light', rewardXP: 500, completed: false },
    { id: 'c2', gameId: 'snake', goal: 500, current: 0, description: 'Score 500 in Snake Zen', rewardXP: 300, completed: false }
];

export const usePlayStore = create<PlayStore>((set) => ({
  currentScene: 'dashboard',
  activeGameId: null,
  profile: {
    name: 'Dreamer One',
    level: 1,
    xp: 0,
    streak: 1,
    lastLogin: Date.now(),
    title: 'Zen Initiate',
    unlockedTitles: ['Zen Initiate'],
    cosmetics: [],
    activeCosmetic: null
  },
  highScores: {},
  favorites: [],
  dailyChallenges: DEFAULT_CHALLENGES,
  sessionStats: {
    startTime: Date.now(),
    gamesPlayed: 0,
    lastScore: 0
  },
  lastLight: {
    energy: 100,
    evolutionLevel: 1,
    evolutionProgress: 0,
    totalMemoriesCollected: 0
  },

  launchGame: (gameId) => set((state) => ({
    currentScene: 'game',
    activeGameId: gameId,
    sessionStats: { ...state.sessionStats, gamesPlayed: state.sessionStats.gamesPlayed + 1 }
  })),

  finishGame: (score: number) => set((state) => {
      ChallengeManager.checkProgress(state.activeGameId!, score);
      return {
        currentScene: 'postgame',
        sessionStats: { ...state.sessionStats, lastScore: score },
        highScores: {
            ...state.highScores,
            [state.activeGameId!]: Math.max(state.highScores[state.activeGameId!] || 0, score)
        }
      };
  }),

  exitToDashboard: () => set({ currentScene: 'dashboard', activeGameId: null }),

  updateXP: (amount) => set((state) => {
      const newXP = state.profile.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Auto-unlock titles
      let newTitles = [...state.profile.unlockedTitles];
      if (newLevel >= 5 && !newTitles.includes('Void Walker')) newTitles.push('Void Walker');
      if (newLevel >= 10 && !newTitles.includes('Cosmic Weaver')) newTitles.push('Cosmic Weaver');

      return {
          profile: { ...state.profile, xp: newXP, level: newLevel, unlockedTitles: newTitles }
      };
  }),

  toggleFavorite: (gameId) => set((state) => ({
      favorites: state.favorites.includes(gameId)
        ? state.favorites.filter(id => id !== gameId)
        : [...state.favorites, gameId]
  })),

  completeChallenge: (id) => set((state) => ({
      dailyChallenges: state.dailyChallenges.map(c => c.id === id ? { ...c, completed: true } : c)
  })),

  setTitle: (title) => set((state) => ({
      profile: { ...state.profile, title }
  })),

  setLastLightState: (llState) => set((state) => ({
      lastLight: { ...state.lastLight, ...llState }
  }))
}));
