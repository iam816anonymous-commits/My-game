# Architecture: PLAYVERSE

## Domain-Driven Structure
The platform is divided into three primary domains to ensure scalability and isolation.

### 1. The Core Platform (`src/apps`)
- **Dashboard:** The entry point. Handles game discovery, filtering, and profile overviews.
- **Scene Manager:** Orchestrates transitions between the Dashboard, Game sessions, and Post-game overlays.

### 2. The Game Ecosystem (`src/games`)
Each game is a self-contained module.
- **PIXI-based:** Games like "Last Light" use the `Engine.ts` and `EntityManager` patterns for high-performance rendering.
- **React-based:** Logic games use Framer Motion for high-fidelity UI animations.
- **Standardized API:** Every game must call `finishGame(score)` and `updateXP(amount)` to interface with the platform.

### 3. Shared Infrastructure (`src/shared`)
- **Persistence Layer:** Uses `idb-keyval` for async storage with a throttle mechanism to prevent main-thread blocking.
- **Meta-State:** A centralized Zustand store (`usePlayStore`) managing global user stats.
- **Component Library:** Unified "Glass Card" and "Action Button" components for aesthetic consistency.

## State Management Flow
1. Game triggers an event (e.g., Merge in 2048).
2. Store updates `XP` and `Combo`.
3. Persistence Manager captures state changes via a throttled listener.
4. UI reflects progress (XP bar, Combo counter) in real-time.

## Optimization Strategies
- **Object Pooling:** Used in "Last Light" for particles and memories.
- **Lazy Loading:** Each game is an dynamic import, reducing initial load.
- **RAF Loops:** All high-frequency updates are kept within `requestAnimationFrame` and synced sparingly to React.
