export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export class SudokuLogic {
  public static generate(difficulty: SudokuDifficulty): { puzzle: (number | null)[][]; solution: number[][] } {
    const solution = this.solve(this.createEmptyGrid());
    const puzzle = solution.map(row => [...row]);

    let cellsToRemove = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
    while (cellsToRemove > 0) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (puzzle[r][c] !== null) {
        puzzle[r][c] = null;
        cellsToRemove--;
      }
    }

    return { puzzle, solution };
  }

  private static createEmptyGrid(): (number | null)[][] {
    return Array(9).fill(null).map(() => Array(9).fill(null));
  }

  public static solve(grid: (number | null)[][]): number[][] {
    const solution = grid.map(row => row.map(v => v));
    this.solveRecursive(solution);
    return solution as number[][];
  }

  private static solveRecursive(grid: (number | null)[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === null) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (let num of nums) {
            if (this.isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (this.solveRecursive(grid)) return true;
              grid[r][c] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  public static isValid(grid: (number | null)[][], r: number, c: number, num: number): boolean {
    // Check row
    for (let i = 0; i < 9; i++) if (grid[r][i] === num) return false;
    // Check column
    for (let i = 0; i < 9; i++) if (grid[i][c] === num) return false;
    // Check 3x3 box
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  }
}
