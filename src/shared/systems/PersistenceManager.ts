import { get, set } from 'idb-keyval';
import { usePlayStore } from '../store/usePlayStore';

const STORAGE_KEY = 'playverse_state';

export async function saveState() {
  const state = usePlayStore.getState();
  const persistable = {
    profile: state.profile,
    highScores: state.highScores,
    favorites: state.favorites,
    dailyChallenges: state.dailyChallenges,
    onboardingSeen: state.onboardingSeen
  };
  await set(STORAGE_KEY, persistable);
}

export async function loadState() {
  const saved = await get(STORAGE_KEY);
  if (saved) {
    usePlayStore.setState({
      profile: saved.profile,
      highScores: saved.highScores,
      favorites: saved.favorites,
      dailyChallenges: saved.dailyChallenges || usePlayStore.getState().dailyChallenges,
      onboardingSeen: saved.onboardingSeen || {}
    });
    return true;
  }
  return false;
}
