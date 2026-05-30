import type { Piece, GameState, Difficulty } from './types';

const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
const START_OFFSETS = [0, 13, 26, 39];

/**
 * Neon Ludo AI Engine V2
 *
 * Scores potential moves based on difficulty and strategic value.
 */
export const getBestMove = (
    pieces: Piece[],
    playerIndex: number,
    roll: number,
    difficulty: Difficulty,
    isValidMove: (p: Piece, d: number) => boolean
): number | null => {
    const playable = pieces.filter(p => p.colorIndex === playerIndex && isValidMove(p, roll));

    if (playable.length === 0) return null;
    if (playable.length === 1) return playable[0].id;

    if (difficulty === 'EASY') {
        // 90% random, 10% prioritize home exit
        if (roll === 6 && Math.random() > 0.9) {
            const homePiece = playable.find(p => p.progress === -1);
            if (homePiece) return homePiece.id;
        }
        return playable[Math.floor(Math.random() * playable.length)].id;
    }

    // Scoring System for Medium/Hard
    const scoredMoves = playable.map(p => {
        let score = 0;

        // Base: progress is good
        score += p.progress * 2;

        // Roll 6 & in base -> High priority to exit
        if (roll === 6 && p.progress === -1) {
            score += difficulty === 'HARD' ? 500 : 200;
        }

        // Entering goal lane
        if (p.progress < 51 && p.progress + roll >= 51) {
            score += 300;
        }

        // Finishing a piece
        if (p.progress + roll === 56) {
            score += 1000;
        }

        // Real Capture Check
        if (difficulty !== 'EASY' && p.progress >= 0 && p.progress + roll <= 50) {
            const nextGlobal = (START_OFFSETS[playerIndex] + p.progress + roll) % 52;
            if (!SAFE_ZONES.includes(nextGlobal)) {
                const victim = pieces.find(pi =>
                    pi.colorIndex !== playerIndex &&
                    pi.progress >= 0 && pi.progress <= 50 &&
                    (START_OFFSETS[pi.colorIndex] + pi.progress) % 52 === nextGlobal
                );
                if (victim) {
                    score += difficulty === 'HARD' ? 800 : 400;
                }
            }
        }

        // Safety: If piece is in home path, it's safe
        if (p.progress + roll >= 51) {
            score += 100;
        }

        return { id: p.id, score };
    });

    // Sort by score and add some noise for variety
    const noise = difficulty === 'HARD' ? 0.1 : 0.5;
    scoredMoves.sort((a, b) => (b.score * (1 + Math.random() * noise)) - (a.score * (1 + Math.random() * noise)));

    return scoredMoves[0].id;
};
