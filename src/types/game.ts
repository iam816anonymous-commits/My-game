export type Emotion = 'waiting' | 'happy' | 'sleeping' | 'exploring' | 'lonely' | 'excited';
export type PersonalityTrait = 'curious' | 'playful' | 'sleepy' | 'adventurous' | 'gentle' | 'shy';
export type Weather = 'clear' | 'rain' | 'snow' | 'clouds';

export interface JournalEntry {
  id: string;
  day: number;
  timestamp: number;
  text: string;
  type: 'event' | 'interaction' | 'milestone';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface CompanionState {
  emotion: Emotion;
  traits: Record<PersonalityTrait, number>;
  lastAction: string;
  skin: string;
  accessories: string[];
}

export interface WorldState {
  age: number; // In days
  energy: number;
  unlockedFeatures: string[];
  theme: string;
  weather: Weather;
  lastWeatherChange: number;
}

export interface GameState {
  // Metadata
  version: string;
  lastSeen: number;
  createdAt: number;
  streak: number;

  // Systems
  companion: CompanionState;
  world: WorldState;
  journal: JournalEntry[];
  achievements: Achievement[];
  totalMemories: number;

  // UI/Game State
  isStarted: boolean;
  isPaused: boolean;
  isGameOver: boolean; // Note: "No death system", but maybe used for resets
}

export interface GameActions {
  // Core
  startGame: () => void;
  tick: (delta: number, now: number) => void;
  returnToWorld: (now: number) => void;

  // Interactions
  interact: () => void;
  addMemory: (amount: number) => void;

  // Customization
  unlockFeature: (id: string) => void;
  setTheme: (theme: string) => void;

  // Journal
  addJournalEntry: (text: string, type?: JournalEntry['type']) => void;

  // Reset
  resetGame: () => void;
}
