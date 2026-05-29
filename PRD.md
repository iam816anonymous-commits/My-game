# PLAYVERSE Platform - Product Requirements Document (PRD)

## Project Overview
**PLAYVERSE** is a premium, browser-based arcade platform designed for high-engagement, "Zen" gameplay experiences. It transforms traditional arcade mechanics into modern, high-fidelity experiences with a focus on "game feel," kinetic feedback, and progression.

## Core Pillars
1. **Kinetic Juice:** Every action (collection, collision, near-miss) must provide tactile visual and auditory feedback (shakes, flashes, vignettes).
2. **The Flow State:** Games use a 4-phase pacing system (Introduction -> Engagement -> Flow -> Intensity) to maintain player engagement.
3. **Mastery Progression:** A unified XP and leveling system across all titles, with unlockable titles and streaks.
4. **Standalone Quality:** Flagship titles like *Last Light* and *Snake Zen* use dedicated rendering engines (PixiJS) to ensure 60fps performance and sub-pixel precision.

## Flagship Titles

### Last Light (V18 Rebuild)
- **Goal:** Survive as a fading light orb in a procedurally evolving void.
- **Mechanics:** Energy Dash, Cluster Resonance (timed bonuses), and Rare Meteor Events.
- **Progression:** 7 Evolutionary stages from "Void" to "Constellations."

### Snake Zen (V19 Rebuild)
- **Goal:** Achieve "Flow State" through precise, non-grid-based movement.
- **Mechanics:** Wall-Hugger scoring (risk/reward), Tunneling (Ghost mode via Legendary food), and Contextual Failure Analysis.
- **Engine:** PixiJS 8 with smooth angle interpolation.

## Technical Architecture
- **Framework:** React 19 + Vite + TypeScript.
- **Rendering:** Mixed (DOM for puzzles, PixiJS for arcade).
- **State:** Zustand (Global Profile/Hub) + Local Engine State (Games).
- **Persistence:** IndexedDB (idb-keyval) with throttled auto-save.
- **Analytics:** PostHog-ready abstraction for session tracking and funnel analysis.

## UI/UX Design
- **Theme:** "Nature + Cyber" / Premium Glassmorphism.
- **Palette:** Deep Black (#050816), Neon Cyan (#22D3EE), Emerald (#10B981), Electric Violet (#8B5CF6).
- **Responsiveness:** 16:9 adaptive viewport for desktop; touch-optimized overlays for mobile.

## Operations
- **Admin Dashboard:** Hidden "Command Center" for DAU and retention monitoring.
- **Onboarding:** Contextual game-specific tutorials (shown once per game).
- **Persistence:** Save system using IndexedDB for zero-latency resume.
