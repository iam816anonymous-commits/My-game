import { get, set, del } from 'idb-keyval';
import type { GameState } from '../../types/game';

const SAVE_KEY = 'last_light_save';

export const saveGame = async (state: Partial<GameState>) => {
  try {
    const existing = await get(SAVE_KEY) || {};
    await set(SAVE_KEY, { ...existing, ...state, lastLogin: Date.now() });
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = async (): Promise<Partial<GameState> | null> => {
  try {
    return await get(SAVE_KEY) || null;
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
