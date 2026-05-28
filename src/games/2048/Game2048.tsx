import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Game2048: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [grid, setGrid] = useState<(number | null)[]>(Array(16).fill(null));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lastMove, setLastMove] = useState(0);

  const spawn = useCallback((currentGrid: (number|null)[]) => {
      const empty = currentGrid.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
      if (empty.length === 0) return currentGrid;
      const index = empty[Math.floor(Math.random() * empty.length)];
      const newGrid = [...currentGrid];
      newGrid[index] = Math.random() < 0.9 ? 2 : 4;
      return newGrid;
  }, []);

  const restart = useCallback(() => {
    let g = Array(16).fill(null);
    g = spawn(g);
    g = spawn(g);
    setGrid(g);
    setScore(0);
    setCombo(1);
  }, [spawn]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
      setGrid(prev => {
          let newGrid = [...prev];
          let moved = false;

          const getLine = (i: number) => {
              if (direction === 'left') return [i*4, i*4+1, i*4+2, i*4+3];
              if (direction === 'right') return [i*4+3, i*4+2, i*4+1, i*4];
              if (direction === 'up') return [i, i+4, i+8, i+12];
              return [i+12, i+8, i+4, i];
          };

          for (let i = 0; i < 4; i++) {
              const lineIdx = getLine(i);
              const line = lineIdx.map(idx => newGrid[idx]).filter(v => v !== null) as number[];

              const merged: number[] = [];
              for (let j = 0; j < line.length; j++) {
                  if (line[j] === line[j+1]) {
                      const val = line[j] * 2;
                      merged.push(val);
                      handleMerge(val);
                      j++;
                      moved = true;
                  } else {
                      merged.push(line[j]);
                  }
              }

              const newLine = [...merged, ...Array(4 - merged.length).fill(null)];
              lineIdx.forEach((idx, j) => {
                  if (newGrid[idx] !== newLine[j]) moved = true;
                  newGrid[idx] = newLine[j];
              });
          }

          if (moved) {
              newGrid = spawn(newGrid);
              // Check game over
              const hasEmpty = newGrid.some(v => v === null);
              if (!hasEmpty) {
                  // Simple check for merges
                  let canMerge = false;
                  for(let i=0; i<16; i++) {
                      if (i % 4 < 3 && newGrid[i] === newGrid[i+1]) canMerge = true;
                      if (i < 12 && newGrid[i] === newGrid[i+4]) canMerge = true;
                  }
                  if (!canMerge) finishGame(score);
              }
          }
          return newGrid;
      });
  }, [spawn, score, finishGame]);

  useEffect(() => {
    restart();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart();
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restart, move]);

  const handleMerge = (val: number) => {
      const now = Date.now();
      if (now - lastMove < 500) {
          setCombo(c => Math.min(10, c + 1));
      } else {
          setCombo(1);
      }
      setLastMove(now);
      const points = val * combo;
      setScore(s => s + points);
      updateXP(points);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-8">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">2048 <span className="text-accent-gold">Fusion</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Mechanics Overhaul</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      {/* Score HUD */}
      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Score</div>
                  <div className="text-2xl font-black italic text-accent-gold">{score}</div>
              </div>
              <Trophy size={20} className="text-white/10" />
          </div>
          <div className="p-6 bg-accent-gold/10 rounded-3xl border border-accent-gold/20 flex items-center gap-4">
              <Zap size={20} className="text-accent-gold" />
              <div className="text-2xl font-black italic">x{combo}</div>
          </div>
      </div>

      <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full max-w-sm aspect-square bg-white/5 p-4 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
        {grid.map((val, i) => (
            <div key={i} className="bg-white/5 rounded-xl border border-white/5" />
        ))}

        <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-3 pointer-events-none">
            {grid.map((val, i) => val !== null && (
                <motion.div
                    key={`${i}-${val}`}
                    layoutId={`tile-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center text-2xl font-black rounded-xl text-black shadow-lg"
                    style={{
                        backgroundColor: `hsl(${Math.log2(val) * 30 + 30}, 80%, 60%)`,
                        boxShadow: `0 0 20px hsla(${Math.log2(val) * 30 + 30}, 80%, 60%, 0.4)`
                    }}
                >
                    {val}
                </motion.div>
            ))}
        </div>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic">Swift Merges = Combo Multiplier</div>
    </div>
  );
};

export default Game2048;
