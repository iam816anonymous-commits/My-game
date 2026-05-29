export const EvolutionLevel = {
  Void: 1,
  Starlight: 2,
  Fireflies: 3,
  Grasslands: 4,
  Forest: 5,
  Weather: 6,
  Constellations: 7
} as const;

export type EvolutionLevel = typeof EvolutionLevel[keyof typeof EvolutionLevel];

export type MemoryType = 'standard' | 'rare' | 'gold' | 'legendary';

export interface Memory {
  id: string;
  type: MemoryType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energyValue: number;
  collected: boolean;
  expiry?: number; // Time in seconds before it implodes (for clusters)
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameState {
  energy: number; // 0 to 100
  evolutionLevel: EvolutionLevel;
  memoriesCollected: number;
  totalMemoriesCollected: number;
  achievements: Achievement[];
  lastPlayTime: number;
  dailyStreak: number;
  evolutionProgress: number; // 0 to 1
}

export const EVOLUTION_THRESHOLDS = {
  [EvolutionLevel.Void]: 0,
  [EvolutionLevel.Starlight]: 15,
  [EvolutionLevel.Fireflies]: 40,
  [EvolutionLevel.Grasslands]: 80,
  [EvolutionLevel.Forest]: 150,
  [EvolutionLevel.Weather]: 250,
  [EvolutionLevel.Constellations]: 400
};

export const INITIAL_STATE: GameState = {
  energy: 100,
  evolutionLevel: EvolutionLevel.Void,
  memoriesCollected: 0,
  totalMemoriesCollected: 0,
  achievements: [
    { id: 'first_memory', title: 'First Spark', description: 'Collect your first memory particle.', unlocked: false },
    { id: 'level_2', title: 'Life Emerges', description: 'Reach Evolution Level 2.', unlocked: false },
    { id: 'rare_memory', title: 'Rare Glimpse', description: 'Collect a rare memory particle.', unlocked: false },
    { id: 'survivor', title: 'Eternal Light', description: 'Keep your light alive for 10 minutes.', unlocked: false }
  ],
  lastPlayTime: Date.now(),
  dailyStreak: 0,
  evolutionProgress: 0
};
