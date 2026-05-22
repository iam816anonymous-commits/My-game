# Last Light

An emotional, relaxing, and addictive browser-based game about light, memories, and evolution.

## Overview
"Last Light" is a Zen-like experience where you control a glowing light orb in an endless floating world. Collect memory particles to maintain your light energy and watch as the world evolved through seven distinct stages of life and beauty.

## Features
- **Endless Procedural World:** Explore a floating void that expands infinitely as you move.
- **7 Levels of Evolution:** Transform the world from a silent void to a vibrant ecosystem with grass, fireflies, trees, rain, animals, and constellations.
- **Responsive Controls:** Optimized for both mouse and touch input.
- **Production-Ready Performance:** Powered by PixiJS 8, maintaining a stable 60 FPS even on mobile through object pooling and optimized rendering.
- **PWA Support:** Installable as a standalone app on iOS and Android for offline play.
- **Save System:** Automatic progress persistence using IndexedDB.
- **Daily Rewards:** Return daily to receive an energy boost.
- **Minimalist HUD:** atmospheric design with a clean, unobtrusive energy bar.

## Tech Stack
- **Framework:** React 18 + Vite 5 + TypeScript
- **Rendering:** PixiJS 8
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Persistence:** idb-keyval
- **Audio:** Howler.js
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Building for Production
Create an optimized production build:
```bash
npm run build
```

### Testing & Linting
Run the test suite:
```bash
npm run test
```
Run the linter:
```bash
npm run lint
```

## Architecture
The project follows a **Feature-First** structure for maximum isolation and maintainability:
- `src/features/core`: Main engine, game loop, and PixiJS initialization.
- `src/features/world`: Game entities, procedural spawning, and environment evolution.
- `src/features/state`: Centralized game state management.
- `src/features/ui`: React-based HUD and Menu components.
- `src/features/persistence`: IndexedDB storage layer.
- `src/features/audio`: Sound and music controllers.
