import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Trophy, Lightbulb, Pencil, Eraser, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { SudokuLogic, type SudokuDifficulty } from './logic';

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
  const [gameOver, setGameOver] = useState(false);

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
    setGameOver(false);
  }, [difficulty]);

  useEffect(() => {
    init();
  }, [init]);

  const onNumberInput = (num: number) => {
    if (!selected || gameOver) return;
    const [r, c] = selected;
    if (grid[r][c].isInitial || grid[r][c].value !== null) return;

    if (isNoteMode) {
      const newGrid = grid.map((row, ri) => row.map((cell, ci) => {
          if (ri === r && ci === c) {
              const notes = cell.notes.includes(num)
                ? cell.notes.filter(n => n !== num)
                : [...cell.notes, num].sort();
              return { ...cell, notes };
          }
          return cell;
      }));
      setGrid(newGrid);
    } else {
      if (solution[r][c] === num) {
        const newGrid = grid.map((row, ri) => row.map((cell, ci) => {
            if (ri === r && ci === c) return { ...cell, value: num, notes: [] };
            return cell;
        }));
        setGrid(newGrid);
        updateXP(50);
        JuiceManager.shake(2);
        checkWin(newGrid);
      } else {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= 3) {
            setGameOver(true);
            finishGame(0);
        }
      }
    }
  };

  const checkWin = (currentGrid: CellState[][]) => {
      const isComplete = currentGrid.every((row) => row.every((cell) => cell.value !== null));
      if (isComplete) {
          finishGame(2000);
          setGameOver(true);
      }
  };

  const erase = () => {
      if (!selected || gameOver) return;
      const [r, c] = selected;
      if (grid[r][c].isInitial) return;
      const newGrid = grid.map((row, ri) => row.map((cell, ci) => {
          if (ri === r && ci === c) return { ...cell, value: null, notes: [] };
          return cell;
      }));
      setGrid(newGrid);
  };

  const hint = () => {
      if (!selected || gameOver) return;
      const [r, c] = selected;
      if (grid[r][c].value !== null) return;
      const newGrid = grid.map((row, ri) => row.map((cell, ci) => {
          if (ri === r && ci === c) return { ...cell, value: solution[r][c], notes: [] };
          return cell;
      }));
      setGrid(newGrid);
      updateXP(-100);
      checkWin(newGrid);
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
  }, [selected, isNoteMode, grid, solution, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-4 gap-6 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Logic <span className="text-accent-violet text-glow">Grid</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Sudoku Mastery</div>
        </div>
        <button onClick={init} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Mistakes</div>
                  <div className={`text-2xl font-black italic tabular-nums ${mistakes > 0 ? 'text-accent-rose' : 'text-white'}`}>{mistakes}/3</div>
              </div>
              <ShieldAlert size={20} className={mistakes > 0 ? 'text-accent-rose animate-pulse' : 'text-white/10'} />
          </div>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard', 'expert'] as const).map(d => (
                <button
                  key={d} onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-accent-violet text-black' : 'bg-white/5 text-white/40'}`}
                >
                    {d[0]}
                </button>
            ))}
          </div>
      </div>

      <div className="grid grid-cols-9 grid-rows-9 gap-0.5 w-full max-w-md aspect-square bg-white/5 p-1 rounded-2xl border border-white/10 relative overflow-hidden">
          {grid.map((row, r) => row.map((cell, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isRelated = selected && (selected[0] === r || selected[1] === c || (Math.floor(selected[0]/3) === Math.floor(r/3) && Math.floor(selected[1]/3) === Math.floor(c/3)));

              // Same Number Highlighting (V13 Flow Fix)
              const selectedValue = selected ? grid[selected[0]][selected[1]].value : null;
              const isSameNumber = selectedValue !== null && cell.value === selectedValue;

              const borderR = (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-white/20' : 'border-r border-white/5';
              const borderB = (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-white/20' : 'border-b border-white/5';

              return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => setSelected([r, c])}
                    className={`relative flex items-center justify-center cursor-pointer transition-all ${borderR} ${borderB} ${
                        isSelected ? 'bg-accent-violet/40' :
                        isSameNumber ? 'bg-accent-violet/10 ring-1 ring-inset ring-accent-violet/20' :
                        isRelated ? 'bg-white/5' : ''
                    }`}
                  >
                      {cell.value !== null ? (
                          <span className={`text-xl font-black ${cell.isInitial ? 'text-white' : 'text-accent-violet'}`}>{cell.value}</span>
                      ) : (
                          <div className="grid grid-cols-3 gap-0.5 p-0.5 w-full h-full pointer-events-none">
                              {Array.from({ length: 9 }).map((_, i) => (
                                  <div key={i} className="text-[6px] text-white/20 font-bold flex items-center justify-center">
                                      {cell.notes.includes(i + 1) ? i + 1 : ''}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              );
          }))}

          <AnimatePresence>
              {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center z-50"
                  >
                      <Trophy size={48} className={mistakes < 3 ? 'text-accent-violet' : 'text-accent-rose'} />
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{mistakes < 3 ? 'Grid Solved' : 'Logical Failure'}</h3>
                      <button onClick={init} className="w-full py-4 bg-accent-violet text-black font-black uppercase tracking-widest rounded-2xl">Restart Loop</button>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <div className="grid grid-cols-6 gap-2 w-full max-w-md">
          {[1,2,3,4,5,6].map(num => (
              <button key={num} onClick={() => onNumberInput(num)} className="h-12 bg-white/5 rounded-xl border border-white/10 text-white font-black hover:bg-accent-violet/20 transition-all">{num}</button>
          ))}
          {[7,8,9].map(num => (
              <button key={num} onClick={() => onNumberInput(num)} className="h-12 bg-white/5 rounded-xl border border-white/10 text-white font-black hover:bg-accent-violet/20 transition-all">{num}</button>
          ))}
          <button onClick={erase} className="h-12 bg-white/5 rounded-xl border border-white/10 text-white/40 flex items-center justify-center hover:text-white"><Eraser size={20} /></button>
          <button onClick={() => setIsNoteMode(!isNoteMode)} className={`h-12 rounded-xl border flex items-center justify-center transition-all ${isNoteMode ? 'bg-accent-violet border-accent-violet text-black' : 'bg-white/5 border-white/10 text-white/40'}`}><Pencil size={20} /></button>
          <button onClick={hint} className="h-12 bg-white/5 rounded-xl border border-white/10 text-white/40 flex items-center justify-center hover:text-white"><Lightbulb size={20} /></button>
      </div>
    </div>
  );
};

export default SudokuGame;
