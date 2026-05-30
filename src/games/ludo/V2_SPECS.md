# Neon Ludo V2 — Production Specs

## Core Philosophy
Transform a basic board prototype into a premium, high-intensity neon arcade experience. Maximize board presence, simplify UI, and deepen the AI competitive edge.

## 1. Player Setup System (Lobby)
- **Phase 1:** Select Player Count (1-4).
- **Phase 2:** Slot Configuration.
  - Slots: P1 (Red), P2 (Blue), P3 (Yellow), P4 (Green).
  - Types: HUMAN, AI (Easy/Medium/Hard), EMPTY.
- **Persistence:** Save last used setup in IndexedDB.

## 2. Advanced AI (Neural Opponents)
- **Difficulty Levels:**
  - **Easy:** Random legal moves. 10% chance to prioritize home-exit.
  - **Medium:** Prioritizes captures and exiting home. Avoids danger zones if possible.
  - **Hard:** Advanced move scoring.
    - +100 for captures.
    - +50 for entering safe zones.
    - +200 for reaching goal lanes.
    - +500 for finishing a piece.
    - -50 for leaving a piece vulnerable to capture by an opponent within 6 tiles.

## 3. Visual Redesign
- **Board Focus:** 70% of screen height/width.
- **Aesthetic:** "Glass-Neon." Glowing tracks, translucent home bases, and pulse effects on active lanes.
- **Contrast:** High-contrast tokens with directional indicators.
- **Responsive:** Fluid scaling for mobile/tablet.

## 4. Dice & Kinetic Systems
- **Dice:** Animated 2D component with rotational velocity and "weight."
- **Path Preview:** Ghost markers show where a piece will land when hovered/selected.
- **Movement:** Step-by-step traversal with a small "hop" animation.
- **Juice:**
  - Capture -> Screenshake + Chromatic Aberration.
  - Goal -> Confetti + Success Flash.
  - Six Roll -> Glow pulse on the dice.

## 5. End Game Analytics
- **Winner:** Hero display.
- **Stats:**
  - **Luck Rating:** Deviation from average dice rolls.
  - **Aggression:** Total captures.
  - **Most Valuable Move:** Single move that resulted in a capture + goal lane entry.
  - **Total Turns.**

## 6. Architecture
- `src/games/ludo/ai.ts`: Pure logic for move evaluation.
- `src/games/ludo/logic.ts`: Board state, path mapping, and capture validation.
- `src/games/ludo/components/Board.tsx`: SVG-based board rendering.
- `src/games/ludo/components/Lobby.tsx`: Configuration UI.
- `src/games/ludo/components/Dice.tsx`: Animated dice system.
- `src/games/ludo/Ludo.tsx`: Main scene manager.
