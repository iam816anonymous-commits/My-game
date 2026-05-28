export type Tile = {
  id: number;
  value: number;
  position: [number, number];
  mergedFrom?: [Tile, Tile];
};

export type GameState = {
  grid: (number | null)[][];
  tiles: Tile[];
  score: number;
  gameOver: boolean;
  won: boolean;
};

let nextId = 0;

export const createTile = (value: number, position: [number, number]): Tile => ({
  id: nextId++,
  value,
  position,
});

// Simple Seeded PRNG
class SeededRandom {
    private seed: number;
    constructor(seed: string) {
        this.seed = seed.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

let prng: SeededRandom | null = null;

export const initGame = (seed?: string): GameState => {
  if (seed) prng = new SeededRandom(seed);
  else prng = null;

  let state: GameState = {
    grid: Array(4).fill(null).map(() => Array(4).fill(null)),
    tiles: [],
    score: 0,
    gameOver: false,
    won: false,
  };
  state = spawnTile(state);
  state = spawnTile(state);
  return state;
};

export const spawnTile = (state: GameState): GameState => {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!state.grid[r][c]) emptyCells.push([r, c]);
    }
  }

  if (emptyCells.length === 0) return state;

  const rand = prng ? prng.next() : Math.random();
  const [r, c] = emptyCells[Math.floor(rand * emptyCells.length)];
  const value = (prng ? prng.next() : Math.random()) < 0.9 ? 2 : 4;
  const newTile = createTile(value, [r, c]);

  const newGrid = state.grid.map(row => [...row]);
  newGrid[r][c] = newTile.id;

  return {
    ...state,
    grid: newGrid,
    tiles: [...state.tiles, newTile],
  };
};

export const move = (state: GameState, direction: 'up' | 'down' | 'left' | 'right'): { state: GameState; moved: boolean } => {
  let moved = false;
  let newScore = state.score;
  const newGrid = Array(4).fill(null).map(() => Array(4).fill(null));
  let newTiles: Tile[] = [];

  const traverseRows = direction === 'down' ? [3, 2, 1, 0] : [0, 1, 2, 3];
  const traverseCols = direction === 'right' ? [3, 2, 1, 0] : [0, 1, 2, 3];

  const dr = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
  const dc = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

  // Map of tile ID to Tile object for quick lookup
  const tileMap = new Map(state.tiles.map(t => [t.id, t]));

  for (let r of traverseRows) {
    for (let c of traverseCols) {
      const tileId = state.grid[r][c];
      if (tileId === null) continue;

      const tile = tileMap.get(tileId)!;
      let currR = r;
      let currC = c;

      while (true) {
        const nextR = currR + dr;
        const nextC = currC + dc;

        if (nextR < 0 || nextR >= 4 || nextC < 0 || nextC >= 4) break;

        const targetTileId = newGrid[nextR][nextC];
        if (targetTileId === null) {
          currR = nextR;
          currC = nextC;
          moved = true;
        } else {
          const targetTile = newTiles.find(t => t.id === targetTileId)!;
          if (targetTile.value === tile.value && !targetTile.mergedFrom) {
            // Merge
            const mergedValue = tile.value * 2;
            newScore += mergedValue;

            // Update the target tile to be a merged tile
            const mergedTile = createTile(mergedValue, [nextR, nextC]);
            mergedTile.mergedFrom = [targetTile, { ...tile, position: [nextR, nextC] }];

            newTiles = newTiles.filter(t => t.id !== targetTileId);
            newTiles.push(mergedTile);
            newGrid[nextR][nextC] = mergedTile.id;

            moved = true;
            currR = -1; // Mark as merged
          }
          break;
        }
      }

      if (currR !== -1) {
        const updatedTile = { ...tile, position: [currR, currC] as [number, number] };
        newTiles.push(updatedTile);
        newGrid[currR][currC] = updatedTile.id;
        if (currR !== r || currC !== c) moved = true;
      }
    }
  }

  let nextState = { ...state, grid: newGrid, tiles: newTiles, score: newScore };
  if (moved) {
    nextState = spawnTile(nextState);
    if (isGameOver(nextState)) {
      nextState.gameOver = true;
    }
  }

  return { state: nextState, moved };
};

const isGameOver = (state: GameState): boolean => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!state.grid[r][c]) return false;
      const val = state.tiles.find(t => t.id === state.grid[r][c])?.value;
      // Check neighbors
      if (r < 3) {
          const neighborVal = state.tiles.find(t => t.id === state.grid[r+1][c])?.value;
          if (val === neighborVal) return false;
      }
      if (c < 3) {
          const neighborVal = state.tiles.find(t => t.id === state.grid[r][c+1])?.value;
          if (val === neighborVal) return false;
      }
    }
  }
  return true;
};
