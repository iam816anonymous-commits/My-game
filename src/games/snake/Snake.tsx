import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Sparkles, Magnet, Timer, Ghost, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioController } from '../../shared/systems/AudioController';
import { JuiceManager } from '../../shared/systems/JuiceManager';

const GRID_SIZE = 20;

type FoodType = 'standard' | 'rare' | 'legendary' | 'slowmo' | 'magnet';

const Snake: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [snake, setSnake] = useState([[10, 10], [10, 11], [10, 12]]);
  const [food, setFood] = useState<{pos: number[], type: FoodType}>({ pos: [5, 5], type: 'standard' });
  const [dir, setDir] = useState([0, -1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isMagnet, setIsMagnet] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [shake, setShake] = useState(0);
  const [ghostTrail, setGhostTrail] = useState<number[][] | null>(null);
  const [nearMiss, setNearMiss] = useState(false);
  const [zoom, setZoom] = useState(1);

  const lastKeyTime = useRef(0);

  const spawnFood = useCallback(() => {
    let newPos;
    do {
      newPos = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    } while (snake.some(s => s[0] === newPos[0] && s[1] === newPos[1]));

    const rand = Math.random();
    let type: FoodType = 'standard';
    if (rand < 0.05) type = 'legendary';
    else if (rand < 0.1) type = 'slowmo';
    else if (rand < 0.15) type = 'magnet';
    else if (rand < 0.3) type = 'rare';

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
    setZoom(1);
    spawnFood();
  };

  useEffect(() => {
    const timer = setInterval(() => {
        if (!gameOver) {
            setGameTime(t => {
                const nt = t + 1;
                if (nt === 1) AudioController.start();
                if (nt === 60) AudioController.setIntensity('mid');
                if (nt === 120) AudioController.setIntensity('high');
                return nt;
            });
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    const handleMove = () => {
      if (gameOver) return;

      setSnake(prev => {
        const head = prev[0];
        const newHead = [head[0] + dir[0], head[1] + dir[1]];

        // 1. Slow-motion survival / Near Miss Detection
        const willHitWall = newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE;
        const willHitSelf = prev.slice(0, -1).some(s => s[0] === newHead[0] && s[1] === newHead[1]);

        if ((willHitWall || willHitSelf) && !isSlowMo) {
            setNearMiss(true);
            JuiceManager.danger();
            setTimeout(() => setNearMiss(false), 500);
        }

        if (willHitWall || willHitSelf) {
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
          // Score Calculation
          let basePoints = 10;
          if (food.type === 'rare') basePoints = 30;
          if (food.type === 'legendary') basePoints = 100;

          // Risky Movement Bonus (Near Walls)
          const isNearWall = newHead[0] === 0 || newHead[0] === GRID_SIZE - 1 || newHead[1] === 0 || newHead[1] === GRID_SIZE - 1;
          const riskyBonus = isNearWall ? 1.5 : 1.0;

          // Perfect Turn Bonus (Key pressed recently)
          const isPerfectTurn = Date.now() - lastKeyTime.current < 150;
          const turnBonus = isPerfectTurn ? 1.2 : 1.0;

          const totalGain = Math.floor(basePoints * (1 + combo * 0.1) * riskyBonus * turnBonus);
          setScore(s => s + totalGain);
          setCombo(c => Math.min(20, c + 1));

          if (food.type === 'legendary') JuiceManager.success();
          JuiceManager.shake(8);
          setZoom(1.05);
          setTimeout(() => setZoom(1), 200);
          updateXP(Math.floor(totalGain / 2));

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

    // V9 Pacing Logic: 4 Phases
    // Phase 1: Intro (0-20s) -> Very Slow
    // Phase 2: Engagement (20-60s) -> Gradual
    // Phase 3: Flow (60-120s) -> High Speed
    // Phase 4: Intensity (120s+) -> Critical

    let baseSpeed = 300; // V11 Gentle Onboarding: Start slower
    if (gameTime > 120) baseSpeed = 60;
    else if (gameTime > 60) baseSpeed = 100;
    else if (gameTime > 30) baseSpeed = 150;
    else if (gameTime > 15) baseSpeed = 200;

    // Length modifier
    const speed = (isSlowMo ? baseSpeed * 2.5 : baseSpeed) - (Math.min(50, snake.length * 1.5));

    const interval = setInterval(handleMove, Math.max(40, speed));
    return () => clearInterval(interval);
  }, [dir, food, gameOver, score, combo, isSlowMo, isMagnet, gameTime, snake.length, updateXP, spawnFood, finishGame]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      lastKeyTime.current = Date.now();
      if ((e.key === 'ArrowUp' || e.key === 'w') && dir[1] !== 1) setDir([0, -1]);
      if ((e.key === 'ArrowDown' || e.key === 's') && dir[1] !== -1) setDir([0, 1]);
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dir[0] !== 1) setDir([-1, 0]);
      if ((e.key === 'ArrowRight' || e.key === 'd') && dir[0] !== -1) setDir([1, 0]);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex w-full max-w-md justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-accent-cyan/20 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Snake <span className="text-accent-cyan text-glow">Zen</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">V9 Pacing Overhaul</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-accent-cyan/20 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      {/* Game Board */}
      <motion.div
        animate={{
            x: [0, shake, -shake, 0],
            y: [0, -shake, shake, 0],
            scale: zoom
        }}
        className="relative w-full max-w-md aspect-square bg-white/5 rounded-[2.5rem] border border-white/10 p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Phase Vignettes */}
        <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${gameTime > 120 ? 'opacity-40' : gameTime > 60 ? 'opacity-20' : 'opacity-0'} bg-[radial-gradient(circle,transparent_50%,#F472B6_150%)]`} />

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
                        className={`rounded-sm transition-all duration-300 ${
                            isHead ? 'bg-white shadow-[0_0_30px_white] z-20 scale-110' :
                            isSnake ? 'bg-accent-cyan opacity-80 scale-90 shadow-[0_0_15px_#22D3EE]' :
                            isGhost ? 'bg-white/10 scale-75' :
                            isFood ? (
                                food.type === 'legendary' ? 'bg-accent-gold shadow-[0_0_30px_#FACC15] animate-pulse scale-125' :
                                food.type === 'rare' ? 'bg-accent-cyan shadow-[0_0_20px_#22D3EE] animate-bounce' :
                                food.type === 'slowmo' ? 'bg-accent-violet shadow-[0_0_20px_#8B5CF6] animate-ping' :
                                food.type === 'magnet' ? 'bg-accent-rose shadow-[0_0_20px_#F472B6] animate-pulse' :
                                'bg-accent-rose/60 shadow-[0_0_10px_#F472B6]'
                            ) :
                            'bg-white/5 opacity-5'
                        }`}
                    />
                );
            })}
        </div>

        {/* Near Miss Flash */}
        <AnimatePresence>
            {nearMiss && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-accent-rose pointer-events-none"
                />
            )}
        </AnimatePresence>

        {/* HUD Overlays */}
        <div className="absolute top-8 left-8 space-y-1 pointer-events-none">
            <motion.div
                key={score}
                initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                className="text-5xl font-black italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            >
                {score}
            </motion.div>
            <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-accent-cyan text-black text-[10px] font-black uppercase tracking-widest rounded">
                    x{(1 + combo * 0.1).toFixed(1)}
                </div>
                {combo > 10 && (
                    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-accent-gold font-black italic text-xs uppercase">Flow State</motion.div>
                )}
            </div>
        </div>
      </motion.div>

      {/* Powerup Footer */}
      <div className="flex gap-4 w-full max-w-md">
          <div className={`flex-1 p-4 rounded-3xl border transition-all flex items-center gap-4 ${isSlowMo ? 'bg-accent-violet/20 border-accent-violet/50 text-accent-violet' : 'bg-white/5 border-white/5 text-white/20'}`}>
              <Timer size={20} />
              <div className="text-[10px] font-black uppercase tracking-widest">Slow-Mo</div>
          </div>
          <div className={`flex-1 p-4 rounded-3xl border transition-all flex items-center gap-4 ${isMagnet ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan' : 'bg-white/5 border-white/5 text-white/20'}`}>
              <Magnet size={20} />
              <div className="text-[10px] font-black uppercase tracking-widest">Magnet</div>
          </div>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic flex items-center gap-2">
          <ShieldAlert size={12} /> Risks yield higher reality rewards
      </div>
    </div>
  );
};

export default Snake;
