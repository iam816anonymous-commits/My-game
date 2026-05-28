export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export class SudokuLogic {
  public static generate(difficulty: SudokuDifficulty): { puzzle: (number | null)[][]; solution: number[][] } {
    // 1. Generate full solved grid
    const solution = this.createEmptyGrid() as number[][];
    this.fillGrid(solution);

    // 2. Create puzzle by removing cells
    const puzzle = solution.map(row => [...row]) as (number | null)[][];
    const attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : difficulty === 'hard' ? 55 : 64;

    // Shuffle all positions
    const positions = [];
    for (let i = 0; i < 81; i++) positions.push(i);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    let removed = 0;
    for (const pos of positions) {
      if (removed >= attempts) break;
      const r = Math.floor(pos / 9);
      const c = pos % 9;

      const backup = puzzle[r][c];
      puzzle[r][c] = null;

      // Check if still unique
      const gridCopy = puzzle.map(row => [...row]);
      if (this.countSolutions(gridCopy) !== 1) {
        puzzle[r][c] = backup;
      } else {
        removed++;
      }
    }

    return { puzzle, solution };
  }

  private static createEmptyGrid(): (number | null)[][] {
    return Array(9).fill(null).map(() => Array(9).fill(null));
  }

  private static fillGrid(grid: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 || grid[r][c] === null) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (let num of nums) {
            if (this.isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (this.fillGrid(grid)) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private static countSolutions(grid: (number | null)[][], limit: number = 2): number {
    let count = 0;
    const solve = (g: (number | null)[][]) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === null) {
            for (let num = 1; num <= 9; num++) {
              if (this.isValid(g, r, c, num)) {
                g[r][c] = num;
                solve(g);
                g[r][c] = null;
                if (count >= limit) return;
              }
            }
            return;
          }
        }
      }
      count++;
    };
    solve(grid);
    return count;
  }

  public static isValid(grid: (number | null)[][], r: number, c: number, num: number): boolean {
    for (let i = 0; i < 9; i++) if (grid[r][i] === num) return false;
    for (let i = 0; i < 9; i++) if (grid[i][c] === num) return false;
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
