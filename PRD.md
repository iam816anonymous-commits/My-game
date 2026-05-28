# PRD: PLAYVERSE Platform

## Vision
To build a high-fidelity, social microgaming platform that prioritizes "Game Feel" and "Obsession Loops" over complex mechanics.

## Core Pillars
1. **Atmospheric Design:** "Premium Dark" aesthetics, glassmorphism, and minimal UI.
2. **Kinetic Feedback:** Every action must result in visual or tactile satisfaction (screen shake, vignettes, pulses).
3. **Low Friction:** Instant load times, one-tap restarts, and universal controls.
4. **Meta-Addiction:** XP bursts, level-up celebrations, and daily streaks.

## User Persona
- **The Zen Seeker:** Plays for relaxation and atmospheric beauty (Last Light, Snake Zen).
- **The Competitor:** Plays for high scores and perfect combos (Color Rush, Orbit Dodge, Tap Dash).
- **The Strategic:** Plays for logical mastery (2048 Fusion, Mine Rush).

## Functional Requirements
- Global Player Profile (XP, Level, Title).
- Modular Game Registry (Lazy-loaded modules).
- Throttled Persistence (Save to IDB every 5 seconds or on significant event).
- Unified Post-Game Experience (Score breakdown, XP progress, Viral sharing).
- Daily Modifier System (Global gameplay changes).

## Non-Functional Requirements
- 60FPS on Mobile (iPhone 12+ / Galaxy S21+).
- < 1MB Initial Bundle Size (Gzip).
- Full PWA support (Offline manifests, Service Workers).
