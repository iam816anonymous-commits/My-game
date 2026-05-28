export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export const DIFFICULTIES = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
};

export class MinesweeperLogic {
  public static generate(difficulty: Difficulty, firstClick: [number, number]) {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    const board = Array(rows).fill(null).map(() => Array(cols).fill(0));

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Ensure first click and its neighbors are safe
      const isNeighbor = Math.abs(r - firstClick[0]) <= 1 && Math.abs(c - firstClick[1]) <= 1;

      if (board[r][c] !== -1 && !isNeighbor) {
        board[r][c] = -1;
        minesPlaced++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) {
              count++;
            }
          }
        }
        board[r][c] = count;
      }
    }

    return board;
  }
}
