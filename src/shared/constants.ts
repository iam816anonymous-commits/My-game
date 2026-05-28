import type { GameMetadata } from './types/game';

export const GAMES: GameMetadata[] = [
  { id: 'chess', name: 'Chess', category: 'Board', description: 'Classical strategy game.', icon: 'Crown', color: '#fde68a' },
  { id: 'checkers', name: 'Checkers', category: 'Board', description: 'Jump and capture.', icon: 'CircleDot', color: '#f9a8d4' },
  { id: 'tictactoe', name: 'Tic Tac Toe', category: 'Logic', description: 'Three in a row.', icon: 'X', color: '#67e8f9' },
  { id: 'connect4', name: 'Connect 4', category: 'Logic', description: 'Gravity-based strategy.', icon: 'Columns', color: '#8b5cf6' },
  { id: 'snake', name: 'Snake', category: 'Arcade', description: 'Classic arcade action.', icon: 'Undo', color: '#67e8f9' },
  { id: '2048', name: '2048', category: 'Arcade', description: 'Merge the tiles.', icon: 'Hash', color: '#fde68a' },
  { id: 'minesweeper', name: 'Mines', category: 'Arcade', description: 'Clear the minefield.', icon: 'Bomb', color: '#f9a8d4' },
  { id: 'sudoku', name: 'Sudoku', category: 'Logic', description: 'Number placement puzzle.', icon: 'Grid', color: '#8b5cf6' },
  { id: 'memory', name: 'Memory', category: 'Skill', description: 'Match the pairs.', icon: 'Eye', color: '#67e8f9' },
  { id: 'flappy', name: 'Flappy', category: 'Skill', description: 'Fly through obstacles.', icon: 'Bird', color: '#f9a8d4' },
  { id: 'wordle', name: 'Lexis', category: 'Logic', description: 'Guess the secret word.', icon: 'Type', color: '#8b5cf6' },
  { id: 'reaction', name: 'Reflex', category: 'Skill', description: 'Test your reaction speed.', icon: 'Zap', color: '#67e8f9' },
  { id: 'tower', name: 'Stack', category: 'Arcade', description: 'Build the tallest tower.', icon: 'Layers', color: '#fde68a' },
  { id: 'dots', name: 'Dots', category: 'Skill', description: 'Connect the same colors.', icon: 'Circle', color: '#f9a8d4' },
  { id: 'color', name: 'Match', category: 'Skill', description: 'Identify the odd color.', icon: 'Palette', color: '#67e8f9' },
  { id: 'hex', name: 'Hexa', category: 'Logic', description: 'Fit the hex blocks.', icon: 'Hexagon', color: '#8b5cf6' },
  { id: 'bubble', name: 'Pop', category: 'Arcade', description: 'Pop the bubbles.', icon: 'Target', color: '#fde68a' },
  { id: 'water', name: 'Sort', category: 'Logic', description: 'Sort the colored water.', icon: 'Droplet', color: '#67e8f9' },
  { id: 'ball', name: 'Bouncer', category: 'Arcade', description: 'Keep the ball up.', icon: 'Dribbble', color: '#f9a8d4' },
  { id: 'slice', name: 'Zen Slice', category: 'Skill', description: 'Slice the falling items.', icon: 'Knife', color: '#8b5cf6' },
];
