import { get, set, del } from 'idb-keyval';
import type { GameState } from '../../types/game';

const SAVE_KEY = 'last_light_save_v1';

export const saveGame = async (state: Partial<GameState>) => {
  try {
    const existing = await get(SAVE_KEY) || {};
    const payload = {
      ...existing,
      ...state,
      lastLogin: Date.now()
    };
    await set(SAVE_KEY, payload);
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = async (): Promise<Partial<GameState> | null> => {
  try {
    const data = await get(SAVE_KEY);
    if (!data) return null;

    // Basic validation to check for corruption
    if (typeof data !== 'object' || data === null) {
      console.warn('Corrupted save data found, clearing...');
      await clearSave();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearSave = async () => {
  try {
    await del(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear save:', error);
  }
};
