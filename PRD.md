# Last Light: Companion - Product Requirements Document

## 1. Overview
"Last Light: Companion" is an emotional companion web game where players care for a glowing fox spirit in an evolving, infinite world. It focuses on attachment, identity, and narrative over traditional gameplay complexity.

## 2. Core Mechanics
- **Companion AI:** A fox spirit that wanders, reacts to interactions, and experiences emotions (happy, lonely, excited, etc.).
- **Offline Simulation:** The world and companion continue to exist when the player is away. Upon return, the game reconstructs the history of the absence.
- **Permanent Evolution:** The world grows older in "Days". Progression is permanent and unlocks new environmental layers.
- **Narrative Journal:** A scrollable log of events and interactions that builds a personal history.

## 3. World Evolution (7 Levels)
1. **Day 1 (Void):** Empty darkness.
2. **Day 10 (Grass):** Soft greenery appears.
3. **Day 20 (Fireflies):** Glowing life emerges.
4. **Day 30 (Trees):** Silhouetted forests rise.
5. **Day 50 (Weather):** Rain and clouds begin to cycle.
6. **Day 90 (Animals):** Other ghostly spirits wander by.
7. **Day 145 (Constellations):** The sky fills with permanent star patterns.

## 4. Key Systems
- **Emotion System:** Derives companion mood from interaction frequency and world state.
- **Weather Manager:** Handles dynamic transitions between clear, rain, and snow.
- **Screenshot Exporter:** Generates 1080x1920 PNG share cards with world statistics.
- **Event System:** Triggers rare occurrences like meteor showers or companion gifts.

## 5. Technical Requirements
- **Rendering:** PixiJS 8 for stable 60fps on mobile.
- **State:** Zustand with atomic selectors for performance.
- **Persistence:** Versioned IndexedDB (idb-keyval) with corruption recovery.
- **Platform:** Progressive Web App (PWA) with offline support.
