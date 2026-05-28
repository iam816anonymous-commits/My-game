import { usePlayStore } from '../store/usePlayStore';

/**
 * Dream Seeds are base64 encoded strings that share a player's state/achievement.
 */
export function generateDreamSeed(): string {
  const { profile, activeGameId, sessionStats } = usePlayStore.getState();
  const data = {
    t: profile.title,
    g: activeGameId,
    s: sessionStats.lastScore,
    ts: Date.now()
  };
  return btoa(JSON.stringify(data));
}

export function decodeDreamSeed(seed: string) {
  try {
    return JSON.parse(atob(seed));
  } catch {
    return null;
  }
}

export function copyShareLink() {
  const seed = generateDreamSeed();
  const url = `${window.location.origin}?seed=${seed}`;
  navigator.clipboard.writeText(url);
  return url;
}
