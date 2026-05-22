# Architecture - Last Light

## 1. Feature-First Structure
The project is organized into features to ensure isolation and scalability.

- `src/features/core`: PixiJS Application initialization and main game loop.
- `src/features/world`: Game entities (Player, Memories, Background) and procedural logic.
- `src/features/state`: Global game state management using Zustand.
- `src/features/ui`: Minimalist HUD and overlays.
- `src/features/persistence`: IndexedDB integration for save data.
- `src/features/audio`: Ambient sound layers and management.
- `src/features/assets`: Asset loading and management.

## 2. Rendering Pipeline
- **PixiJS:** Used for the main game world. React is used for the UI layer (HUD) on top of the canvas.
- **Layers:**
  - Background (Stars/Clouds)
  - Environment (Grass/Trees/Animals)
  - Entity (Player/Memories)
  - Overlay (Particles/Effects)

## 3. State Management
- **Zustand:** Stores energy, score, level, unlocked achievements, and world state.
- **Persistence:** State is synced to IndexedDB on key changes.

## 4. Procedural Generation
- Items are spawned in a ring around the player to ensure the world feels endless as they move.
- Object density and variety increase with the current level.

## 5. UI Layer
- React handles the energy bar, settings, and achievement notifications.
- Framer Motion for smooth UI transitions.
