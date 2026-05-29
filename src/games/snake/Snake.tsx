import React, { useState, useEffect, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioController } from '../../shared/systems/AudioController';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { AnalyticsManager } from '../../shared/systems/AnalyticsManager';

import { Engine } from './Engine';
import { SnakePlayer } from './entities/SnakePlayer';
import { FoodManager } from './systems/FoodManager';

const Snake: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const playerRef = useRef<SnakePlayer | null>(null);
  const foodRef = useRef<FoodManager | null>(null);

  const { exitToDashboard, updateXP, finishGame, highScores } = usePlayStore();
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [failureReason, setFailureReason] = useState<string>('');
  const [tunnelTime, setTunnelTime] = useState(0);

  const restart = () => {
    setGameOver(false);
    setScore(0);
    setGameTime(0);
    if (playerRef.current) playerRef.current.reset();
    if (foodRef.current) foodRef.current.reset();
  };

  useEffect(() => {
    let player: SnakePlayer;
    let foodManager: FoodManager;
    let engine: Engine;

    const init = async () => {
        engine = await Engine.getInstance();
        engineRef.current = engine;
        if (canvasRef.current) canvasRef.current.appendChild(engine.view);

        player = new SnakePlayer(engine.stage);
        playerRef.current = player;

        foodManager = new FoodManager(engine.stage);
        foodRef.current = foodManager;

        const keys = { left: false, right: false };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        engine.ticker.add((ticker) => {
            if ((window as any).snakeGameOver) return;

            const delta = ticker.deltaTime;
            setGameTime(t => t + delta/60);

            // V19 Pacing Logic
            if (gameTime > 180) player.speed = 6.0;
            else if (gameTime > 90) player.speed = 5.0;
            else if (gameTime > 30) player.speed = 4.0;
            else player.speed = 3.0;

            const input = {
                left: keys.left || (window as any).snakeLeft,
                right: keys.right || (window as any).snakeRight
            };

            player.update(delta, input);
            setTunnelTime(player.tunneling);
            foodManager.update(delta);

            // V19 Spawning
            if (Math.random() < 0.02 * delta && foodManager.getActive().length < 5) {
                const margin = 50;
                const x = margin + Math.random() * (engine.view.width - margin*2);
                const y = margin + Math.random() * (engine.view.height - margin*2);

                const rand = Math.random();
                const type = rand < 0.05 ? 'legendary' : rand < 0.15 ? 'golden' : rand < 0.3 ? 'rare' : 'common';
                foodManager.spawn(x, y, type);
            }

            // Collision
            const p = player.pos;
            foodManager.getActive().forEach(f => {
                const dx = f.x - p.x;
                const dy = f.y - p.y;
                if (dx*dx + dy*dy < 900) { // Increased radius for better collection feel
                    const type = (f as any).foodType;

                    // Risk/Reward Scoring (V19)
                    const isNearWall = p.x < 100 || p.x > engine.view.width - 100 || p.y < 100 || p.y > engine.view.height - 100;
                    const riskMult = isNearWall ? 2.0 : 1.0;

                    const values = { common: 10, rare: 30, golden: 100, legendary: 500 };
                    const scoreGain = Math.floor(values[type as keyof typeof values] * riskMult);

                    foodManager.collect(f);
                    player.grow(type === 'legendary' ? 50 : 10);
                    if (type === 'legendary') player.tunneling = 10.0;

                    setScore(s => s + scoreGain);
                    updateXP(Math.floor(scoreGain / 10));
                    JuiceManager.shake(type === 'legendary' ? 20 : 5);
                    if (type === 'legendary') JuiceManager.success();

                    AudioController.playSFX('collect');
                }
            });

            // Death Conditions (V19 Rebuild)
            const isOutOfBounds = p.x < 0 || p.x > engine.view.width || p.y < 0 || p.y > engine.view.height;
            const isSelfHit = player.checkSelfCollision();

            if ((isOutOfBounds || isSelfHit) && !(window as any).snakeGameOver) {
                (window as any).snakeGameOver = true;
                setGameOver(true);
                setFailureReason(isOutOfBounds ? 'Boundary Impact' : 'Internal Rupture');
                AnalyticsManager.trackGameComplete('snake', score);
                // V19: Don't call finishGame (scene change) yet to allow local Game Over UI
                updateStats({
                    totalPlayTime: (gameTime)
                });
            }
        });
    };

    init();

    return () => {
        if (engine) engine.destroy();
        (window as any).snakeGameOver = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#02040a] p-4 md:p-12 overflow-hidden transition-all duration-1000">

      {/* Header (V19) */}
      <div className="flex w-full max-w-5xl justify-between items-center z-30 mb-6 px-4">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-emerald-500/20 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Snake <span className="text-emerald-400 text-glow">Zen</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">V19 Engine Rebuild</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-emerald-500/20 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      {/* Game Frame (V19 Rebuild) */}
      <div className="relative w-full h-full max-w-5xl aspect-video md:aspect-[16/9] bg-[#050816] rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div ref={canvasRef} className="absolute inset-0" />

        {/* Mobile Controls Overlay */}
        <div className="absolute inset-0 z-20 md:hidden flex pointer-events-none">
            <div className="flex-1 pointer-events-auto" onTouchStart={() => (window as any).snakeLeft = true} onTouchEnd={() => (window as any).snakeLeft = false} />
            <div className="flex-1 pointer-events-auto" onTouchStart={() => (window as any).snakeRight = true} onTouchEnd={() => (window as any).snakeRight = false} />
        </div>

        {/* HUD Overlays */}
        <div className="absolute top-12 left-12 space-y-1 pointer-events-none z-30">
            <motion.div
                key={score}
                initial={{ scale: 1.5, x: -20 }} animate={{ scale: 1, x: 0 }}
                className="text-8xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                {score}
            </motion.div>
            <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest rounded">
                    x{(1 + (gameTime/60) * 0.1).toFixed(1)} Pacing
                </div>
            </div>

            {tunnelTime > 0 && (
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: `${(tunnelTime / 10) * 100}%` }}
                        className="h-full bg-violet-400 shadow-[0_0_10px_#A78BFA]"
                    />
                    <div className="text-[8px] font-black text-violet-400 uppercase tracking-widest mt-1">Tunneling Active</div>
                </div>
            )}
        </div>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic flex items-center gap-2 mt-8 z-10">
          <ShieldAlert size={12} /> Boundary proximity yields double mastery rewards
      </div>

      <AnimatePresence>
          {gameOver && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed inset-0 z-[110] bg-[#050816]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="max-w-sm w-full space-y-8"
                  >
                    <div className="space-y-2">
                        <div className="text-rose-500 font-black uppercase tracking-widest text-[10px]">Neural Link Severed</div>
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Snake Zen</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Failure</div>
                            <div className="text-xs font-bold text-white truncate">{failureReason}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Pacing Peak</div>
                            <div className="text-xl font-black text-emerald-400">{(1 + (gameTime/60) * 0.1).toFixed(1)}x</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Personal Best</div>
                            <div className="text-xl font-black text-white">{highScores['snake'] || 0}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Next Goal</div>
                            <div className="text-xl font-black text-emerald-400">{(highScores['snake'] || 0) + 100}</div>
                        </div>
                    </div>

                    <div className="p-6 bg-emerald-400/5 border border-emerald-400/20 rounded-3xl">
                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-2">Operational Insight</div>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                            {failureReason === 'Boundary Impact'
                                ? 'Boundary proximity yields 2x score, but requires micro-precision. Use the "Tunneling" effect from Legendary food to phase through walls.'
                                : 'Internal Rupture occurs when you intersect your own tail. As your length increases, wide turns are safer than sharp reversals.'
                            }
                            {score > 1000 && ' High-speed flow detected. Pacing multipliers are currently maximized.'}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={exitToDashboard} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all">Hub</button>
                        <button
                            onClick={() => {
                                (window as any).snakeGameOver = false;
                                restart();
                            }}
                            className="flex-[2] py-4 bg-emerald-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-[1.02] transition-all"
                        >
                            Re-Engage
                        </button>
                    </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default Snake;
