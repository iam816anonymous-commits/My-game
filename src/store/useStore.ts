import { create } from 'zustand';
import type { GameState, GameActions } from '../types/game';

const INITIAL_STATE: GameState = {
  currentScene: 'hub',
  scores: {},
  unlockedGames: ['stardust', 'echoes', 'flow', 'orrery', 'logic', 'words', 'link', 'pairs'],
};

export const useStore = create<GameState & GameActions>((set) => ({
  ...INITIAL_STATE,

  setScene: (scene) => set({ currentScene: scene }),

  addScore: (gameId, amount) => set((state) => ({
    scores: {
      ...state.scores,
      [gameId]: (state.scores[gameId] || 0) + amount
    }
  })),

  resetGame: () => set(INITIAL_STATE),
}));
