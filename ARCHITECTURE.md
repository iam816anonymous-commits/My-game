# Last Light - Architecture

## 1. Domain-Driven Design
The game is structured into clear domains to separate concerns between rendering, logic, and state.

### Core domains:
- `src/game/Engine.ts`: Centralized PixiJS application and ticker management.
- `src/game/World.ts`: Layered environment system handling evolution visuals.
- `src/game/entities/Player.ts`: Smooth orb movement and light trail logic.
- `src/game/systems/ProgressionManager.ts`: Logic for energy decay, memories, and evolution.
- `src/game/systems/EntityManager.ts`: Object pooling and procedural spawning.
- `src/game/systems/AudioManager.ts`: Multi-layered ambient audio using Howler.js.
- `src/shared/store/usePlayStore.ts`: Global state management and persistence.

## 2. Rendering Pipeline
- **PixiJS 8:** High-performance 2D rendering.
- **Object Pooling:** Used in `EntityManager` to reuse memory particles and reduce GC pressure.
- **Ticker Loop:** A fixed-timestep loop for consistent gameplay regardless of monitor refresh rate.

## 3. Progression & Evolution
- The world transitions through 7 distinct levels based on `totalMemoriesCollected`.
- Each level activates a new visual layer in `World.ts` and a corresponding audio layer in `AudioManager.ts`.

## 4. Performance Optimization
- **DPR Capping:** Resolution is capped at 2x to ensure stability on high-density displays.
- **Distance Culling:** `EntityManager` automatically removes objects that are too far from the player.
- **Framer Motion:** Used for smooth UI transitions in the HUD.
