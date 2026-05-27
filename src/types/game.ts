export type Scene = 'hub' | 'stardust' | 'echoes' | 'flow' | 'orrery' | 'logic' | 'words' | 'link' | 'pairs';

export interface GameState {
  currentScene: Scene;
  scores: Record<string, number>;
  unlockedGames: string[];
}

export interface GameActions {
  setScene: (scene: Scene) => void;
  addScore: (gameId: string, amount: number) => void;
  resetGame: () => void;
}
