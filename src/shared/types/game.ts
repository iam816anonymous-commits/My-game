export type GameId =
  | 'chess' | 'checkers' | 'tictactoe' | 'connect4' | 'snake'
  | '2048' | 'minesweeper' | 'sudoku' | 'memory' | 'flappy'
  | 'wordle' | 'reaction' | 'tower' | 'dots' | 'color' | 'hex' | 'bubble' | 'water' | 'ball' | 'slice'
  | 'ludo' | 'snakes-ladders' | 'last-light' | 'color-rush' | 'orbit-dodge' | 'tap-dash';

export type Category = 'Logic' | 'Board' | 'Arcade' | 'Skill';

export interface GameMetadata {
  id: GameId;
  name: string;
  category: Category;
  description: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastPlayed: number;
}

export interface GameScore {
  gameId: GameId;
  score: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt?: number;
}

export type Scene = 'dashboard' | 'profile' | 'game';
