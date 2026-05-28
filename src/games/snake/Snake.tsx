import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Sparkles, Magnet, Timer, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 20;

const Snake: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [snake, setSnake] = useState([[10, 10], [10, 11], [10, 12]]);
  const [food, setFood] = useState({ pos: [5, 5], type: 'standard' });
  const [dir, setDir] = useState([0, -1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [shake, setShake] = useState(0);
  const [ghostTrail, setGhostTrail] = useState<number[][] | null>(null);

  const lastMoveTime = useRef(Date.now());

  const spawnFood = useCallback(() => {
    let newPos;
    do {
      newPos = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    } while (snake.some(s => s[0] === newPos[0] && s[1] === newPos[1]));

    const rand = Math.random();
    let type = 'standard';
    if (rand < 0.05) type = 'slowmo';
    else if (rand < 0.1) type = 'magnet';
    else if (rand < 0.2) type = 'rare';

    setFood({ pos: newPos, type });
  }, [snake]);

  const restart = () => {
    setSnake([[10, 10], [10, 11], [10, 12]]);
    setDir([0, -1]);
    setScore(0);
    setCombo(1);
    setGameOver(false);
    setIsSlowMo(false);
    setIsMagnet(false);
    setGameTime(0);
    setGhostTrail(null);
    spawnFood();
  };

  useEffect(() => {
    const timer = setInterval(() => {
        if (!gameOver) setGameTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    const handleMove = () => {
      if (gameOver) return;

      setSnake(prev => {
        const newHead = [prev[0][0] + dir[0], prev[0][1] + dir[1]];

        // Boundary check
        if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
          setGameOver(true);
          setGhostTrail(prev);
          finishGame(score);
          return prev;
        }

        // Self-collision check (excluding the tail which will move)
        const hitSelf = prev.slice(0, -1).some(s => s[0] === newHead[0] && s[1] === newHead[1]);
        if (hitSelf) {
          setGameOver(true);
          setGhostTrail(prev);
          finishGame(score);
          return prev;
        }

        // Magnet Logic
        let targetPos = food.pos;
        if (isMagnet) {
            const dx = food.pos[0] - newHead[0];
            const dy = food.pos[1] - newHead[1];
            if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) {
                targetPos = newHead;
            }
        }

        const newSnake = [newHead, ...prev];
        if (newHead[0] === targetPos[0] && newHead[1] === targetPos[1]) {
          const comboMult = 1 + (combo * 0.1);
          const basePoints = food.type === 'rare' ? 50 : 10;
          setScore(s => s + Math.floor(basePoints * comboMult));
          setCombo(c => Math.min(10, c + 1));
          setShake(5);
          updateXP(basePoints);

          if (food.type === 'slowmo') {
              setIsSlowMo(true);
              setTimeout(() => setIsSlowMo(false), 5000);
          } else if (food.type === 'magnet') {
              setIsMagnet(true);
              setTimeout(() => setIsMagnet(false), 8000);
          }

          spawnFood();
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };

    // Pacing Logic: Adaptive difficulty based on length AND time
    const lengthFactor = Math.max(0, (snake.length - 3) * 2);
    const timeFactor = Math.floor(gameTime / 10) * 5;
    const baseSpeed = Math.max(50, 180 - lengthFactor - timeFactor);

    const speed = isSlowMo ? baseSpeed * 2.5 : baseSpeed;
    const interval = setInterval(handleMove, speed);
    return () => clearInterval(interval);
  }, [dir, food, gameOver, score, combo, isSlowMo, isMagnet, gameTime, updateXP, spawnFood, finishGame]);

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

  useEffect(() => {
      if (shake > 0) {
          const t = setTimeout(() => setShake(0), 100);
          return () => clearTimeout(t);
      }
  }, [shake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex w-full max-w-md justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-surface/40 rounded-2xl border border-accent-white/10 hover:bg-accent-violet/20 transition-all text-accent-white/40 hover:text-accent-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Snake <span className="text-accent-cyan">Zen</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-accent-white/20">V5 Mechanics</div>
        </div>
        <button onClick={restart} className="p-4 bg-surface/40 rounded-2xl border border-accent-white/10 hover:bg-accent-violet/20 transition-all text-accent-white/40 hover:text-accent-white"><RotateCcw size={20} /></button>
      </div>

      {/* Game Board */}
      <motion.div
        animate={{ x: [0, shake, -shake, 0], y: [0, -shake, shake, 0] }}
        className="relative w-full max-w-md aspect-square bg-surface/20 rounded-[2.5rem] border border-accent-white/10 p-2 shadow-2xl overflow-hidden"
      >
        {/* Intensity Vignette */}
        <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${gameTime > 60 ? 'opacity-20' : 'opacity-0'} bg-[radial-gradient(circle,transparent_50%,#8B5CF6_150%)]`} />

        <div className="grid grid-cols-20 grid-rows-20 w-full h-full gap-0.5">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isHead = snake[0][0] === x && snake[0][1] === y;
                const isSnake = snake.some(s => s[0] === x && s[1] === y);
                const isFood = food.pos[0] === x && food.pos[1] === y;
                const isGhost = ghostTrail?.some(s => s[0] === x && s[1] === y);

                return (
                    <div
                        key={i}
                        className={`rounded-sm transition-all duration-200 ${
                            isHead ? 'bg-accent-white shadow-[0_0_20px_white] z-20 scale-110' :
                            isSnake ? 'bg-accent-cyan opacity-80 scale-90 shadow-[0_0_10px_#22D3EE]' :
                            isGhost ? 'bg-accent-white/10 scale-75' :
                            isFood ? (
                                food.type === 'rare' ? 'bg-accent-gold shadow-[0_0_20px_#FACC15] animate-pulse' :
                                food.type === 'slowmo' ? 'bg-accent-violet shadow-[0_0_20px_#8B5CF6] animate-bounce' :
                                food.type === 'magnet' ? 'bg-accent-cyan shadow-[0_0_20px_#22D3EE] animate-ping' :
                                'bg-accent-rose shadow-[0_0_15px_#F472B6]'
                            ) :
                            'bg-accent-white/5 opacity-10'
                        }`}
                    />
                );
            })}
        </div>

        {/* Powerup HUD */}
        <div className="absolute bottom-8 right-8 flex gap-2">
            <AnimatePresence>
                {isSlowMo && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="p-3 bg-accent-violet/20 rounded-xl border border-accent-violet/40 text-accent-violet">
                        <Timer size={16} />
                    </motion.div>
                )}
                {isMagnet && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="p-3 bg-accent-cyan/20 rounded-xl border border-accent-cyan/40 text-accent-cyan">
                        <Magnet size={16} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* HUD Overlays */}
        <div className="absolute top-8 left-8 space-y-1 pointer-events-none">
            <motion.div
                key={score}
                initial={{ scale: 1.2, color: '#fff' }} animate={{ scale: 1, color: '#fff' }}
                className="text-4xl font-black italic text-white drop-shadow-2xl"
            >
                {score}
            </motion.div>
            <div className="text-[10px] font-black uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                <Zap size={12} fill="currentColor" /> x{(1 + combo * 0.1).toFixed(1)}
            </div>
        </div>

        {/* Near Miss Alert */}
        <AnimatePresence>
            {isSlowMo && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 border-4 border-accent-violet/30 pointer-events-none animate-pulse"
                />
            )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Footer */}
      <div className="flex gap-4 w-full max-w-md">
          <div className="flex-1 p-6 bg-surface/40 rounded-3xl border border-accent-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold"><Timer size={20} /></div>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-accent-white/20">Survival Time</div>
                  <div className="text-sm font-bold">{gameTime}s</div>
              </div>
          </div>
          <div className="flex-1 p-6 bg-surface/40 rounded-3xl border border-accent-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan"><Ghost size={20} /></div>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-accent-white/20">Intensity</div>
                  <div className="text-sm font-bold uppercase">{gameTime > 120 ? 'Critical' : gameTime > 60 ? 'High' : 'Zen'}</div>
              </div>
          </div>
      </div>

      <div className="text-[10px] text-accent-white/10 uppercase font-black tracking-[0.4em] italic">Swift turns & powerups = Infinite survival</div>
    </div>
  );
};

export default Snake;
