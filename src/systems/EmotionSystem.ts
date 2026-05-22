import { useStore } from '../store/useStore';
import type { Emotion } from '../types/game';

export class EmotionSystem {
  public static deriveEmotion(): Emotion {
    const { world, lastSeen, companion } = useStore.getState();
    const now = Date.now();
    const timeAway = now - lastSeen;

    // Lonely if gone for more than 4 hours
    if (timeAway > 4 * 60 * 60 * 1000) {
      return 'lonely';
    }

    // Excited if world energy is high
    if (world.energy > 80) {
      return 'excited';
    }

    // Happy is default if recently seen
    return companion.emotion === 'happy' ? 'happy' : 'waiting';
  }

  public static updatePersonality() {
    const { lastSeen } = useStore.getState();
    const timeAway = Date.now() - lastSeen;

    // Frequent visits -> More playful
    if (timeAway < 15 * 60 * 1000) {
      useStore.setState((state) => ({
        companion: {
          ...state.companion,
          traits: {
            ...state.companion.traits,
            playful: Math.min(100, state.companion.traits.playful + 1)
          }
        }
      }));
    }
  }
}
