export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameState {
  energy: number; // 0 to 100
  score: number;
  totalMemories: number;
  level: Level;
  achievements: Achievement[];
  lastLogin: number;
  lastRewardClaim: number;
  isPaused: boolean;
  isGameOver: boolean;
  isStarted: boolean;
}

export interface GameActions {
  setEnergy: (energy: number) => void;
  addEnergy: (amount: number) => void;
  addMemory: (amount: number) => void;
  setLevel: (level: Level) => void;
  unlockAchievement: (id: string) => void;
  resetGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  tick: (delta: number) => void;
}
