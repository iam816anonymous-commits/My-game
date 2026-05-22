# Last Light - Product Requirements Document

## 1. Overview
"Last Light" is an emotional, relaxing, and addictive browser-based game where the player controls a glowing light orb in an endless floating world. The goal is to collect memory particles to maintain light energy and evolve the world.

## 2. Core Mechanics
- **Movement:** Player controls the orb via mouse or touch. The orb follows the pointer with smooth interpolation.
- **Energy:** Light energy fades over time. Collecting "Memory Particles" restores energy.
- **Game Over:** If energy reaches zero, the light goes out, and the game ends (or resets).
- **Progression:** As the player collects more memories, the world evolves through 7 levels.

## 3. Levels
1. **Empty Void:** Dark, minimal.
2. **Grass:** Floating patches of grass appear.
3. **Fireflies:** Small glowing particles add life.
4. **Trees:** Silhouettes of trees emerge.
5. **Rain:** Soft rain effects.
6. **Animals:** Ghostly animal shapes.
7. **Constellations:** The sky fills with stars and patterns.

## 4. Features
- **Procedural Spawning:** Memories and environmental elements spawn around the player.
- **Save System:** Progress (total memories, level, achievements) is saved to IndexedDB.
- **PWA:** Can be installed on mobile devices for a native-like experience.
- **Achievements:** Rewards for milestones (e.g., "First Light", "Nature Lover").
- **Rare Memories:** Occasionally, unique particles spawn that provide a large energy boost or unique visual effect.
- **Daily Rewards:** Bonus energy/progression for returning daily.
- **Idle Decay:** If the game is left open but inactive, the world slowly reverts/decays.

## 5. Technical Requirements
- **Framework:** React + Vite + TypeScript.
- **Rendering:** PixiJS for high-performance 2D rendering.
- **State Management:** Zustand.
- **Audio:** Howler.js for layered ambient music.
- **Persistence:** idb-keyval.
- **Responsiveness:** Adapts to any screen size.
- **Performance:** Maintain a steady 60fps.
