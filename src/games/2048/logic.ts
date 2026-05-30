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
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  stats: {
      merges: number;
      maxTile: number;
      longestChain: number;
  };
};

let nextId = 0;

export const createTile = (value: number, position: [number, number]): Tile => ({
  id: nextId++,
  value,
  position,
});

export const initGame = (seed?: string): GameState => {
  let state: GameState = {
    grid: Array(4).fill(null).map(() => Array(4).fill(null)),
    tiles: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false,
    stats: {
        merges: 0,
        maxTile: 2,
        longestChain: 0
    }
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

  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
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
  let currentMerges = 0;
  const newGrid: (number | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  let newTiles: Tile[] = [];

  const dr = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
  const dc = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

  const traverseRows = direction === 'down' ? [3, 2, 1, 0] : [0, 1, 2, 3];
  const traverseCols = direction === 'right' ? [3, 2, 1, 0] : [0, 1, 2, 3];

  const tileMap = new Map(state.tiles.map(t => [t.id, t]));

  for (let r of traverseRows) {
    for (let c of traverseCols) {
      const tileId = state.grid[r][c];
      if (tileId === null) continue;

      const tile = tileMap.get(tileId)!;
      let currR = r;
      let currC = c;

      // Find the furthest possible position
      let nextR = currR + dr;
      let nextC = currC + dc;

      while (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4 && newGrid[nextR][nextC] === null) {
          currR = nextR;
          currC = nextC;
          nextR = currR + dr;
          nextC = currC + dc;
          moved = true;
      }

      // Check for merge
      if (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4) {
          const targetTileId = newGrid[nextR][nextC];
          if (targetTileId !== null) {
              const targetTile = newTiles.find(t => t.id === targetTileId)!;
              if (targetTile.value === tile.value && !targetTile.mergedFrom) {
                  // Merge!
                  const mergedValue = tile.value * 2;
                  newScore += mergedValue;
                  currentMerges++;
                  moved = true;

                  const mergedTile = createTile(mergedValue, [nextR, nextC]);
                  mergedTile.mergedFrom = [targetTile, { ...tile, position: [nextR, nextC] }];

                  newTiles = newTiles.filter(t => t.id !== targetTileId);
                  newTiles.push(mergedTile);
                  newGrid[nextR][nextC] = mergedTile.id;

                  // Don't place current tile anywhere else
                  currR = -1;
              }
          }
      }

      if (currR !== -1) {
          const finalTile = { ...tile, position: [currR, currC] as [number, number] };
          newTiles.push(finalTile);
          newGrid[currR][currC] = finalTile.id;
          if (currR !== r || currC !== c) moved = true;
      }
    }
  }

  const maxVal = Math.max(...newTiles.map(t => t.value), 0);

  let nextState: GameState = {
      ...state,
      grid: newGrid,
      tiles: newTiles,
      score: newScore,
      stats: {
          merges: state.stats.merges + currentMerges,
          maxTile: Math.max(state.stats.maxTile, maxVal),
          longestChain: Math.max(state.stats.longestChain, currentMerges)
      }
  };

  if (moved) {
    nextState = spawnTile(nextState);
    if (isGameOver(nextState)) {
      nextState.gameOver = true;
    }
    if (maxVal >= 2048) nextState.won = true;
  }

  return { state: nextState, moved };
};

const isGameOver = (state: GameState): boolean => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!state.grid[r][c]) return false;
      const tileId = state.grid[r][c]!;
      const val = state.tiles.find(t => t.id === tileId)?.value;

      // Check neighbors
      if (r < 3) {
          const neighborId = state.grid[r+1][c];
          if (neighborId !== null) {
              const neighborVal = state.tiles.find(t => t.id === neighborId)?.value;
              if (val === neighborVal) return false;
          }
      }
      if (c < 3) {
          const neighborId = state.grid[r][c+1];
          if (neighborId !== null) {
              const neighborVal = state.tiles.find(t => t.id === neighborId)?.value;
              if (val === neighborVal) return false;
          }
      }
    }
  }
  return true;
};

/**
 * Phase 12 - Failure Analysis Logic
 */
export const analyzeFailure = (state: GameState) => {
    const tiles = state.tiles;
    const maxTile = Math.max(...tiles.map(t => t.value));
    const highestTile = tiles.find(t => t.value === maxTile);

    // Board Efficiency: How much of the score is concentrated in the largest tiles
    const totalValue = tiles.reduce((acc, t) => acc + t.value, 0);
    const efficiency = (maxTile / totalValue) * 100;

    // Corner Stability
    const isInCorner = highestTile && (
        (highestTile.position[0] === 0 || highestTile.position[0] === 3) &&
        (highestTile.position[1] === 0 || highestTile.position[1] === 3)
    );

    let insight = "Board Saturation: Space management was the primary failure point.";
    let suggestion = "Try to keep your largest tile in one of the four corners.";

    if (!isInCorner) {
        insight = "Anchor Instability: Your largest tile moved away from the corner.";
        suggestion = "Use three directional keys mainly to keep the largest tile locked.";
    } else if (efficiency < 40) {
        insight = "Fragmentation: Too many small tiles prevented high-value merges.";
        suggestion = "Focus on clearing smaller tiles before building larger ones.";
    }

    return {
        maxTile,
        efficiency: Math.round(efficiency),
        insight,
        suggestion,
        chain: state.stats.longestChain
    };
};
