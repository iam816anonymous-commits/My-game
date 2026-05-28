export interface GameMetadata {
  id: string;
  name: string;
  category: 'Board' | 'Logic' | 'Arcade' | 'Skill';
  description: string;
  icon: string;
  color: string;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  streak: number;
  lastLogin: number;
}

export interface PlayState {
  currentScene: 'dashboard' | 'game' | 'profile';
  activeGameId: string | null;
  profile: PlayerProfile;
  highScores: Record<string, number>;
  favorites: string[];
}
