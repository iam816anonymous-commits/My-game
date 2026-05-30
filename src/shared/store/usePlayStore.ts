import { create } from 'zustand';
import type { PlayState, DailyChallenge } from '../types';
import { ChallengeManager } from '../systems/ChallengeManager';
import { AnalyticsManager } from '../systems/AnalyticsManager';

interface PlayStore extends PlayState {
  launchGame: (gameId: string) => void;
  finishGame: (score: number) => void;
  exitToDashboard: () => void;
  adminLogin: () => void;
  isAdmin: boolean;
  updateXP: (amount: number) => void;
  toggleFavorite: (gameId: string) => void;
  completeChallenge: (id: string) => void;
  setTitle: (title: string) => void;
  setLastLightState: (state: any) => void;
  markOnboardingSeen: (gameId: string) => void;
  updateStats: (updates: Partial<PlayStore['profile']['stats']>) => void;
  lastLight?: any;
  onboardingSeen: Record<string, number>;
  liveScore: number;
  setLiveScore: (score: number) => void;
}

const DEFAULT_CHALLENGES: DailyChallenge[] = [
    { id: 'c1', gameId: 'last-light', goal: 50, current: 0, description: 'Collect 50 particles in Last Light', rewardXP: 500, completed: false },
    { id: 'c2', gameId: 'snake', goal: 500, current: 0, description: 'Score 500 in Snake Zen', rewardXP: 300, completed: false },
    { id: 'c3', gameId: 'chess', goal: 1, current: 0, description: 'Win a Chess Match', rewardXP: 1000, completed: false },
    { id: 'c4', gameId: 'wordle', goal: 1, current: 0, description: 'Solve the Daily Word Crypt', rewardXP: 500, completed: false },
    { id: 'c5', gameId: 'connect4', goal: 1, current: 0, description: 'Win a Connect 4 Game', rewardXP: 400, completed: false }
];

export const usePlayStore = create<PlayStore>((set) => ({
  currentScene: 'dashboard',
  activeGameId: null,
  isAdmin: false,
  profile: {
    name: 'Dreamer One',
    level: 1,
    xp: 0,
    streak: 1,
    lastLogin: Date.now(),
    title: 'Zen Initiate',
    unlockedTitles: ['Zen Initiate'],
    cosmetics: [],
    activeCosmetic: null,
    stats: {
        totalPlayTime: 0,
        perfectTurns: 0,
        highestCombo: 0,
        puzzlesSolved: 0,
        zenMilestones: 0,
        nearMisses: 0
    }
  },
  highScores: {},
  favorites: [],
  dailyChallenges: DEFAULT_CHALLENGES,
  liveScore: 0,
  onboardingSeen: {},
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
    liveScore: 0,
    sessionStats: { ...state.sessionStats, gamesPlayed: state.sessionStats.gamesPlayed + 1 }
  })),

  setLiveScore: (score: number) => set({ liveScore: score }),

  finishGame: (score: number) => set((state) => {
      ChallengeManager.checkProgress(
          state.activeGameId!,
          score,
          state.dailyChallenges,
          state.completeChallenge,
          state.updateXP
      );
      return {
        currentScene: 'postgame',
        liveScore: score,
        sessionStats: { ...state.sessionStats, lastScore: score },
        highScores: {
            ...state.highScores,
            [state.activeGameId!]: Math.max(state.highScores[state.activeGameId!] || 0, score)
        }
      };
  }),

  exitToDashboard: () => set((state) => {
      if (state.currentScene === 'game' && state.activeGameId) {
          AnalyticsManager.trackGameAbandon(state.activeGameId);
      }
      // Daily Reward Check
      const now = Date.now();
      const lastLogin = state.profile.lastLogin;
      const diff = now - lastLogin;
      const oneDay = 24 * 60 * 60 * 1000;

      let streak = state.profile.streak;
      let bonusXP = 0;

      if (diff > oneDay && diff < oneDay * 2) {
          streak += 1;
          bonusXP = streak * 100;
      } else if (diff >= oneDay * 2) {
          streak = 1;
      }

      if (bonusXP > 0) {
          setTimeout(() => state.updateXP(bonusXP), 500);
      }

      return {
          currentScene: 'dashboard',
          activeGameId: null,
          profile: { ...state.profile, streak, lastLogin: now }
      };
  }),

  adminLogin: () => set({ isAdmin: true, currentScene: 'admin' }),

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
  })),

  markOnboardingSeen: (gameId) => set((state) => ({
      onboardingSeen: { ...state.onboardingSeen, [gameId]: Date.now() }
  })),

  updateStats: (updates) => set((state) => ({
      profile: {
          ...state.profile,
          stats: { ...state.profile.stats, ...updates }
      }
  }))
}));
