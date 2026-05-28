import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 20;

const Snake: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [snake, setSnake] = useState([[10, 10], [10, 11], [10, 12]]);
  const [food, setFood] = useState([5, 5]);
  const [dir, setDir] = useState([0, -1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isSlowMo, setIsSlowMo] = useState(false);

  const lastMoveTime = useRef(Date.now());
  const gameLoopRef = useRef<number>(0);

  const spawnFood = useCallback(() => {
    let newFood;
    do {
      newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    } while (snake.some(s => s[0] === newFood[0] && s[1] === newFood[1]));
    setFood(newFood);
  }, [snake]);

  const restart = () => {
    setSnake([[10, 10], [10, 11], [10, 12]]);
    setDir([0, -1]);
    setScore(0);
    setCombo(1);
    setGameOver(false);
    setIsSlowMo(false);
    spawnFood();
  };

  useEffect(() => {
    const handleMove = () => {
      if (gameOver) return;

      setSnake(prev => {
        const head = [prev[0][0] + dir[0], prev[0][1] + dir[1]];

        // Near-miss / Death check
        const willHitWall = head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE;
        const willHitSelf = prev.some(s => s[0] === head[0] && s[1] === head[1]);

        if (willHitWall || willHitSelf) {
          setGameOver(true);
          finishGame(score);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore(s => s + 10 * combo);
          setCombo(c => Math.min(5, c + 0.5));
          updateXP(50);
          spawnFood();
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };

    const speed = Math.max(50, 150 - (score / 100) * 10);
    const interval = setInterval(handleMove, isSlowMo ? speed * 3 : speed);
    return () => clearInterval(interval);
  }, [dir, food, gameOver, score, combo, isSlowMo, updateXP, spawnFood, finishGame]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir[1] !== 1) setDir([0, -1]);
      if (e.key === 'ArrowDown' && dir[1] !== -1) setDir([0, 1]);
      if (e.key === 'ArrowLeft' && dir[0] !== 1) setDir([-1, 0]);
      if (e.key === 'ArrowRight' && dir[0] !== -1) setDir([1, 0]);
      if (e.key === 'r' || e.key === 'R') restart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex w-full max-w-md justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Snake <span className="text-accent-cyan">Zen</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Arcade Overhaul</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-md aspect-square bg-white/5 rounded-[2.5rem] border border-white/10 p-2 shadow-2xl overflow-hidden">
        {/* Dynamic Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.05)_0%,transparent_70%)]" />

        <div className="grid grid-cols-20 grid-rows-20 w-full h-full gap-0.5">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isHead = snake[0][0] === x && snake[0][1] === y;
                const isSnake = snake.some(s => s[0] === x && s[1] === y);
                const isFood = food[0] === x && food[1] === y;

                return (
                    <div
                        key={i}
                        className={`rounded-sm transition-all duration-200 ${
                            isHead ? 'bg-white shadow-[0_0_15px_white] z-20 scale-110' :
                            isSnake ? 'bg-accent-cyan opacity-80 scale-90' :
                            isFood ? 'bg-accent-rose animate-bounce shadow-[0_0_20px_#f9a8d4]' :
                            'bg-white/5 opacity-20'
                        }`}
                    />
                );
            })}
        </div>

        {/* HUD Overlays */}
        <div className="absolute top-8 left-8 space-y-1 pointer-events-none">
            <div className="text-3xl font-black italic text-white drop-shadow-2xl">{score}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                <Zap size={12} fill="currentColor" /> x{combo.toFixed(1)}
            </div>
        </div>

        {/* Near Miss Alert */}
        <AnimatePresence>
            {isSlowMo && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 border-4 border-accent-rose/30 pointer-events-none animate-pulse"
                />
            )}
        </AnimatePresence>
      </div>

      {/* Mastery Feedback */}
      <div className="flex gap-4 w-full max-w-md">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold"><Sparkles size={20} /></div>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Perfect Turns</div>
                  <div className="text-sm font-bold">128</div>
              </div>
          </div>
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan"><Zap size={20} /></div>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Max Combo</div>
                  <div className="text-sm font-bold">x5.0</div>
              </div>
          </div>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic">Press [R] to Instant Restart</div>
    </div>
  );
};

export default Snake;
