export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type PlayerType = 'HUMAN' | 'AI' | 'EMPTY';

export type Piece = {
    id: number;
    progress: number; // -1: base, 0-50: path, 51-55: home path, 56: finished
    colorIndex: number;
};

export type PlayerConfig = {
    type: PlayerType;
    difficulty: Difficulty;
    name: string;
};

export type GameState = {
    pieces: Piece[];
    turn: number;
    dice: number;
    isRolling: boolean;
    canMove: boolean;
    players: PlayerConfig[];
    winner: number | null;
    logs: string[];
};
