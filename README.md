# PLAYVERSE

A social microgaming platform built for the next generation of players. Atmospheric, addictive, and community-driven.

## Overview
PLAYVERSE is a unified dashboard of high-fidelity mini-games ("Realities") featuring a deep meta-progression system. Players earn XP, level up, unlock titles, and compete in daily challenges across a variety of genres.

## Featured Realities
- **Last Light:** The flagship atmospheric experience. Collect memories to evolve the world.
- **Snake Zen:** Minimalist snake action with a focus on flow and combo chains.
- **2048 Fusion:** A fast-paced take on the classic merge puzzle with physics-based feedback.
- **Mine Rush:** High-pressure minesweeper where speed is the only way to survive.
- **Reaction Arena:** Test your focus and speed in this minimalist aim trainer.
- **Stack Rush:** A rhythm-based tower builder that demands perfect timing.

## Platform Features
- **Meta-Progression:** Global XP system, Leveling, and dynamic Titles (e.g., "Void Walker").
- **Social Engagement:** "Dream Seeds" (shareable score states) and Viral loops.
- **Daily Challenges:** Rotating goals and unique gameplay modifiers.
- **Persistence:** High-performance IndexedDB saving for all stats and progress.
- **PWA Ready:** Installable standalone app with offline support.
- **Production Performance:** 60FPS guaranteed through modular architecture and optimized rendering.

## Tech Stack
- **Framework:** React 19 + Vite 5 + TypeScript
- **Rendering:** PixiJS 8 (WebGPU/WebGL)
- **State:** Zustand (Global State Management)
- **Style:** Tailwind CSS 4 + Framer Motion
- **Database:** IndexedDB (via idb-keyval)
- **Testing:** Vitest

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Architecture
- `src/apps`: Dashboard and platform-level application logic.
- `src/games`: Independent game modules (encapsulated logic and assets).
- `src/shared`: Global systems (Store, Persistence, Social, UI components).
- `src/audio`: Unified sound controller and spatial audio systems.
