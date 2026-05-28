export interface GameMetadata {
  id: string;
  name: string;
  category: 'Board' | 'Logic' | 'Arcade' | 'Skill';
  description: string;
  icon: string;
  color: string;
}

export interface DailyChallenge {
  id: string;
  gameId: string;
  goal: number;
  current: number;
  description: string;
  rewardXP: number;
  completed: boolean;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  streak: number;
  lastLogin: number;
  title: string;
  unlockedTitles: string[];
  cosmetics: string[];
  activeCosmetic: string | null;
}

export interface PlayState {
  currentScene: 'dashboard' | 'game' | 'profile' | 'postgame';
  activeGameId: string | null;
  profile: PlayerProfile;
  highScores: Record<string, number>;
  favorites: string[];
  dailyChallenges: DailyChallenge[];
  onboardingSeen: Record<string, number>;
  sessionStats: {
    startTime: number;
    gamesPlayed: number;
    lastScore: number;
  };
}
