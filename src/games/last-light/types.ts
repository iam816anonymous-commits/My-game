export const EvolutionLevel = {
  Void: 1,
  Grass: 2,
  Fireflies: 3,
  Trees: 4,
  Rain: 5,
  Animals: 6,
  Constellations: 7
} as const;

export type EvolutionLevel = typeof EvolutionLevel[keyof typeof EvolutionLevel];

export type MemoryType = 'standard' | 'rare' | 'gold';

export interface Memory {
  id: string;
  type: MemoryType;
  x: number;
  y: number;
  energyValue: number;
  collected: boolean;
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
  [EvolutionLevel.Grass]: 10,
  [EvolutionLevel.Fireflies]: 25,
  [EvolutionLevel.Trees]: 50,
  [EvolutionLevel.Rain]: 100,
  [EvolutionLevel.Animals]: 200,
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
