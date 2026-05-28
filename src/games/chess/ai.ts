import { Chess, Move } from 'chess.js';

export class ChessAI {
  private board: Chess;
  private depth: number;

  constructor(fen: string, difficulty: 'easy' | 'medium' | 'hard') {
    this.board = new Chess(fen);
    this.depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  }

  public getBestMove(): string | null {
    const moves = this.board.moves();
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestValue = -Infinity;

    for (const move of moves) {
      this.board.move(move);
      const boardValue = -this.minimax(this.depth - 1, -Infinity, Infinity, false);
      this.board.undo();

      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number {
    if (depth === 0) {
      return -this.evaluateBoard();
    }

    const moves = this.board.moves();

    if (isMaximizingPlayer) {
      let bestValue = -Infinity;
      for (const move of moves) {
        this.board.move(move);
        bestValue = Math.max(bestValue, this.minimax(depth - 1, alpha, beta, !isMaximizingPlayer));
        this.board.undo();
        alpha = Math.max(alpha, bestValue);
        if (beta <= alpha) return bestValue;
      }
      return bestValue;
    } else {
      let bestValue = Infinity;
      for (const move of moves) {
        this.board.move(move);
        bestValue = Math.min(bestValue, this.minimax(depth - 1, alpha, beta, !isMaximizingPlayer));
        this.board.undo();
        beta = Math.min(beta, bestValue);
        if (beta <= alpha) return bestValue;
      }
      return bestValue;
    }
  }

  private evaluateBoard(): number {
    let totalEvaluation = 0;
    const board = this.board.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        totalEvaluation = totalEvaluation + this.getPieceValue(board[i][j]);
      }
    }
    return totalEvaluation;
  }

  private getPieceValue(piece: any): number {
    if (piece === null) return 0;
    const getAbsoluteValue = (p: string) => {
      if (p === 'p') return 10;
      if (p === 'r') return 50;
      if (p === 'n') return 30;
      if (p === 'b') return 30;
      if (p === 'q') return 90;
      if (p === 'k') return 900;
      return 0;
    };
    const absoluteValue = getAbsoluteValue(piece.type);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
  }
}
