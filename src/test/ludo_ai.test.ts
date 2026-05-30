import { describe, it, expect } from 'vitest';
import { getBestMove } from '../games/ludo/ai';
import type { Piece } from '../games/ludo/types';

describe('Ludo AI', () => {
    const mockIsValid = (p: Piece, d: number) => {
        if (p.progress === 56) return false;
        if (p.progress === -1) return d === 6;
        if (p.progress + d > 56) return false;
        return true;
    };

    it('should prioritize exiting home on a 6 for Hard difficulty', () => {
        const pieces: Piece[] = [
            { id: 0, progress: -1, colorIndex: 0 },
            { id: 1, progress: 10, colorIndex: 0 }
        ];

        const move = getBestMove(pieces, 0, 6, 'HARD', mockIsValid);
        expect(move).toBe(0);
    });

    it('should prioritize finishing a piece', () => {
        const pieces: Piece[] = [
            { id: 0, progress: 54, colorIndex: 0 },
            { id: 1, progress: 10, colorIndex: 0 }
        ];

        const move = getBestMove(pieces, 0, 2, 'HARD', mockIsValid);
        expect(move).toBe(0); // 54 + 2 = 56 (Finish)
    });

    it('should return null if no legal moves exist', () => {
        const pieces: Piece[] = [
            { id: 0, progress: -1, colorIndex: 0 }
        ];

        const move = getBestMove(pieces, 0, 3, 'HARD', mockIsValid);
        expect(move).toBe(null);
    });

    it('should prioritize capturing an opponent', () => {
        const pieces: Piece[] = [
            { id: 0, progress: 10, colorIndex: 0 }, // Player 0 at global 10
            { id: 4, progress: 3, colorIndex: 1 }   // Player 1 at global 13 + 3 = 16
        ];

        // Player 0 rolls a 6. 10 + 6 = 16. Capture!
        const move = getBestMove(pieces, 0, 6, 'HARD', mockIsValid);
        expect(move).toBe(0);
    });
});
