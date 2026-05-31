export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface LudoPiece {
    id: number;
    progress: number; // -1: base, 0-50: path, 51-55: home path, 56: finished
    colorIndex: number;
}

export interface AIState {
    pieces: LudoPiece[];
    turn: number;
    dice: number;
    safeZones: number[];
    startOffsets: number[];
}

/**
 * Neon Ludo Strategic Engine
 */
export const evaluateAIMove = (state: AIState, difficulty: AIDifficulty): number => {
    const { pieces, turn, dice, safeZones, startOffsets } = state;
    const validPieces = pieces.filter(p => p.colorIndex === turn && isValid(p, dice));

    if (validPieces.length === 0) return -1;
    if (difficulty === 'EASY') {
        return validPieces[Math.floor(Math.random() * validPieces.length)].id;
    }

    let bestPieceId = validPieces[0].id;
    let highestScore = -Infinity;

    for (const p of validPieces) {
        let score = 0;
        const currentProgress = p.progress;
        const nextProgress = currentProgress === -1 ? 0 : currentProgress + dice;
        const currentGlobal = currentProgress === -1 ? -1 : (startOffsets[turn] + currentProgress) % 52;
        const nextGlobal = (startOffsets[turn] + nextProgress) % 52;

        // 1. Home Exit Priority
        if (currentProgress === -1 && dice === 6) {
            score += difficulty === 'HARD' ? 500 : 200;
        }

        // 2. Capture Priority (The most valuable move)
        if (nextProgress <= 50 && !safeZones.includes(nextGlobal)) {
            const victim = pieces.find(pi =>
                pi.colorIndex !== turn &&
                pi.progress >= 0 && pi.progress <= 50 &&
                (startOffsets[pi.colorIndex] + pi.progress) % 52 === nextGlobal
            );
            if (victim) {
                score += difficulty === 'HARD' ? 1000 : 400;
            }
        }

        // 3. Goal Entrance / Finishing
        if (nextProgress === 56) score += 800;
        if (nextProgress > 50) score += 300;

        // 4. Safe Zone Strategy
        if (safeZones.includes(nextGlobal) && !safeZones.includes(currentGlobal)) {
            score += difficulty === 'HARD' ? 400 : 150;
        }

        // 5. Danger Evaluation (Escaping opponent range)
        if (difficulty === 'HARD' && currentProgress >= 0 && currentProgress <= 50) {
            const inRange = pieces.some(pi =>
                pi.colorIndex !== turn &&
                pi.progress >= 0 && pi.progress <= 50 &&
                isWithinReach((startOffsets[pi.colorIndex] + pi.progress) % 52, currentGlobal)
            );
            if (inRange) {
                const stillInRange = pieces.some(pi =>
                    pi.colorIndex !== turn &&
                    pi.progress >= 0 && pi.progress <= 50 &&
                    isWithinReach((startOffsets[pi.colorIndex] + pi.progress) % 52, nextGlobal)
                );
                if (!stillInRange) score += 350; // Successfully escaped
            }
        }

        // 6. General Progress
        score += nextProgress * 2;

        if (score > highestScore) {
            highestScore = score;
            bestPieceId = p.id;
        }
    }

    return bestPieceId;
};

const isValid = (p: LudoPiece, d: number) => {
    if (p.progress === 56) return false;
    if (p.progress === -1) return d === 6;
    if (p.progress + d > 56) return false;
    return true;
};

const isWithinReach = (attackerPos: number, victimPos: number) => {
    const dist = (victimPos - attackerPos + 52) % 52;
    return dist > 0 && dist <= 6;
};
