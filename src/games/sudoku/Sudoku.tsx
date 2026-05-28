import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Trophy, Lightbulb, Pencil, Eraser, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SudokuLogic } from './logic';
import type { SudokuDifficulty } from './logic';

type CellState = {
    value: number | null;
    isInitial: boolean;
    notes: number[];
};

const SudokuGame: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('medium');
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const init = useCallback(() => {
    const { puzzle, solution: sol } = SudokuLogic.generate(difficulty);
    const newGrid = puzzle.map(row => row.map(v => ({
        value: v,
        isInitial: v !== null,
        notes: []
    })));
    setGrid(newGrid);
    setSolution(sol);
    setMistakes(0);
    setSelected(null);
  }, [difficulty]);

  useEffect(() => {
    init();
  }, [init]);

  const onNumberInput = (num: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (grid[r][c][1]) return; // Initial cell

    if (isNoteMode) {
      const newGrid = [...grid];
      const cell = { ...newGrid[r][c] };
      if (cell.notes.includes(num)) {
          cell.notes = cell.notes.filter(n => n !== num);
      } else {
          cell.notes = [...cell.notes, num].sort();
      }
      newGrid[r][c] = cell;
      setGrid(newGrid);
    } else {
      if (solution[r][c] === num) {
        const newGrid = [...grid];
        newGrid[r][c] = { ...newGrid[r][c], value: num, notes: [] };
        setGrid(newGrid);
        updateXP(10);
        checkWin(newGrid);
      } else {
        setMistakes(m => m + 1);
        if (mistakes >= 4) {
            // Game Over? Or just keep tracking
        }
      }
    }
  };

  const checkWin = (currentGrid: CellState[][]) => {
      const isComplete = currentGrid.every((row) => row.every((cell) => cell.value !== null));
      if (isComplete) {
          finishGame(1000);
      }
  };

  const erase = () => {
      if (!selected) return;
      const [r, c] = selected;
      if (grid[r][c].isInitial) return;
      const newGrid = [...grid];
      newGrid[r][c] = { ...newGrid[r][c], value: null, notes: [] };
      setGrid(newGrid);
  };

  const hint = () => {
      if (!selected) return;
      const [r, c] = selected;
      if (grid[r][c].value !== null) return;
      const newGrid = [...grid];
      newGrid[r][c] = { ...newGrid[r][c], value: solution[r][c] };
      setGrid(newGrid);
      updateXP(-20); // Penalty
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') init();
      if (e.key >= '1' && e.key <= '9') onNumberInput(parseInt(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete') erase();
      if (e.key === 'n' || e.key === 'N') setIsNoteMode(!isNoteMode);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, isNoteMode, grid, solution]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Logic <span className="text-accent-violet">Grid</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Sudoku V6.0</div>
        </div>
        <button onClick={init} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      {/* HUD Stats */}
      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Mistakes</div>
                  <div className={`text-2xl font-black italic ${mistakes > 2 ? 'text-accent-rose' : 'text-white'}`}>{mistakes}/5</div>
              </div>
              <AlertCircle size={20} className="text-white/10" />
          </div>
          <div className="p-6 bg-accent-violet/10 rounded-3xl border border-accent-violet/20 flex items-center gap-4">
              <Pencil size={20} className={isNoteMode ? 'text-accent-violet' : 'text-white/10'} />
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Notes {isNoteMode ? 'ON' : 'OFF'}</div>
          </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-9 grid-rows-9 gap-1 w-full max-w-sm aspect-square bg-white/5 p-2 rounded-[2rem] border border-white/10 relative">
          {grid.map((row, r) => row.map((cell, c) => {
              const { value: val, isInitial, notes } = cell;
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isSameRegion = selected && (selected[0] === r || selected[1] === c || (Math.floor(selected[0]/3) === Math.floor(r/3) && Math.floor(selected[1]/3) === Math.floor(c/3)));
              const isBorderRight = (c + 1) % 3 === 0 && c < 8;
              const isBorderBottom = (r + 1) % 3 === 0 && r < 8;

              return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => setSelected([r, c])}
                    className={`relative flex items-center justify-center cursor-pointer transition-all rounded-md ${
                        isSelected ? 'bg-accent-violet/40 ring-2 ring-accent-violet' :
                        isSameRegion ? 'bg-white/5' : 'bg-transparent'
                    } ${isBorderRight ? 'mr-1' : ''} ${isBorderBottom ? 'mb-1' : ''}`}
                  >
                      {val !== null ? (
                          <span className={`text-xl font-black ${isInitial ? 'text-white' : 'text-accent-violet'}`}>{val}</span>
                      ) : (
                          <div className="grid grid-cols-3 gap-0.5 p-0.5 w-full h-full">
                              {Array.from({ length: 9 }).map((_, i) => (
                                  <div key={i} className="text-[6px] text-white/20 font-bold flex items-center justify-center">
                                      {notes.includes(i + 1) ? i + 1 : ''}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              );
          }))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-sm">
          {[1,2,3,4,5,6,7,8,9].map(num => (
              <button
                key={num} onClick={() => onNumberInput(num)}
                className="h-12 bg-white/5 rounded-xl border border-white/10 text-white font-black hover:bg-accent-violet/20 hover:border-accent-violet/40 transition-all"
              >
                  {num}
              </button>
          ))}
          <button onClick={erase} className="h-12 bg-white/5 rounded-xl border border-white/10 text-white/40 flex items-center justify-center hover:text-white"><Eraser size={20} /></button>
          <button onClick={() => setIsNoteMode(!isNoteMode)} className={`h-12 rounded-xl border flex items-center justify-center transition-all ${isNoteMode ? 'bg-accent-violet border-accent-violet text-black' : 'bg-white/5 border-white/10 text-white/40'}`}><Pencil size={20} /></button>
          <button onClick={hint} className="h-12 bg-white/5 rounded-xl border border-white/10 text-white/40 flex items-center justify-center hover:text-white"><Lightbulb size={20} /></button>
      </div>
    </div>
  );
};

export default SudokuGame;
