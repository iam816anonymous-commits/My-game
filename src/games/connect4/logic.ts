export type Player = 1 | 2; // 1: Player, 2: AI

export class Connect4Logic {
  public static checkWin(board: (Player | null)[][]): Player | 'draw' | null {
    // Check horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && board[r][c] === board[r][c+1] && board[r][c] === board[r][c+2] && board[r][c] === board[r][c+3]) {
          return board[r][c];
        }
      }
    }
    // Check vertical
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] && board[r][c] === board[r+1][c] && board[r][c] === board[r+2][c] && board[r][c] === board[r+3][c]) {
          return board[r][c];
        }
      }
    }
    // Check diagonal (down-right)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && board[r][c] === board[r+1][c+1] && board[r][c] === board[r+2][c+2] && board[r][c] === board[r+3][c+3]) {
          return board[r][c];
        }
      }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && board[r][c] === board[r-1][c+1] && board[r][c] === board[r-2][c+2] && board[r][c] === board[r-3][c+3]) {
          return board[r][c];
        }
      }
    }

    if (board.every(row => row.every(cell => cell !== null))) return 'draw';
    return null;
  }

  public static getBestMove(board: (Player | null)[][], difficulty: 'easy' | 'medium' | 'hard'): number {
    const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
    let bestScore = -Infinity;
    let move = 0;

    for (let c = 0; c < 7; c++) {
      const r = this.getNextOpenRow(board, c);
      if (r !== -1) {
        board[r][c] = 2;
        const score = this.minimax(board, depth, -Infinity, Infinity, false);
        board[r][c] = null;
        if (score > bestScore) {
          bestScore = score;
          move = c;
        }
      }
    }
    return move;
  }

  private static getNextOpenRow(board: (Player | null)[][], c: number): number {
    for (let r = 5; r >= 0; r--) {
      if (!board[r][c]) return r;
    }
    return -1;
  }

  private static minimax(board: (Player | null)[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    const winner = this.checkWin(board);
    if (winner === 2) return 1000000 + depth;
    if (winner === 1) return -1000000 - depth;
    if (winner === 'draw') return 0;
    if (depth === 0) return this.evaluateBoard(board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let c = 0; c < 7; c++) {
        const r = this.getNextOpenRow(board, c);
        if (r !== -1) {
          board[r][c] = 2;
          const evalScore = this.minimax(board, depth - 1, alpha, beta, false);
          board[r][c] = null;
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let c = 0; c < 7; c++) {
        const r = this.getNextOpenRow(board, c);
        if (r !== -1) {
          board[r][c] = 1;
          const evalScore = this.minimax(board, depth - 1, alpha, beta, true);
          board[r][c] = null;
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }

  private static evaluateBoard(board: (Player | null)[][]): number {
    let score = 0;
    // Score center column
    const centerArray = board.map(row => row[3]);
    const centerCount = centerArray.filter(v => v === 2).length;
    score += centerCount * 3;

    // Additional scoring logic for rows, cols, diagonals could be added here for better AI
    return score;
  }
}
