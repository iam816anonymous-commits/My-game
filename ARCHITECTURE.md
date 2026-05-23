# Architecture - Last Light: Companion

## 1. Domain-Driven Structure
The project is organized into domains to ensure clear separation between the companion's AI, the world's evolution, and the supporting systems.

- `src/companion`: Companion AI brain, movement, and interaction logic.
- `src/world`: Permanent evolution levels and environmental layer management.
- `src/systems`: Logic engines for Offline Simulation, Weather, Persistence, and Screenshot Export.
- `src/store`: Centralized game state using Zustand with atomic selectors.
- `src/ui`: React/Framer-Motion components for the HUD, Journal, and Overlays.
- `src/game`: Main GameLoop coordinating the engine ticker.
- `src/rendering`: PixiJS 8 Application and canvas mounting.

## 2. Simulation Pipeline
- **Offline Simulation:** Upon launch, the system calculates time elapsed since `lastSeen`. It simulates companion activities and environmental changes, populating the `Journal` with narrative results.
- **Game Loop:** A fixed-timestep ticker (capped delta) ensures energy and evolution logic remains stable across devices.

## 3. Persistent State
- **IndexedDB:** State is versioned and synced via `idb-keyval`.
- **Validation:** The loader includes corruption detection and default state fallback.

## 4. Performance & Rendering
- **Object Pooling:** Used for weather particles and memory entities to eliminate per-frame allocations.
- **Capped DPR:** Resolution is capped at 2x to ensure consistent 60fps on high-density mobile screens.
- **PixiJS 8:** Utilizes the latest rendering engine for high-performance sprite and poly management.

## 5. Shareability
- **Screenshot Exporter:** Renders a 1080x1920 social card by compositing the game canvas with high-resolution text and statistics overlays.
