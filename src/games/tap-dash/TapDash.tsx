import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, Zap, Timer } from 'lucide-react';

const TapDash: React.FC = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; scale: number }[]>([]);
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextId = useRef(0);

  const spawnTarget = useCallback(() => {
    const padding = 100;
    const x = padding + Math.random() * (window.innerWidth - padding * 2);
    const y = padding + Math.random() * (window.innerHeight - padding * 2);
    const newTarget = { id: nextId.current++, x, y, scale: 0.5 + Math.random() * 0.5 };
    setTargets(prev => [...prev, newTarget]);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setIsActive(true);
    spawnTarget();
    spawnTarget();
    spawnTarget();
  };

  const handleTap = (id: number) => {
    if (!isActive) return;
    setScore(s => s + 1);
    updateXP(2);
    setTargets(prev => prev.filter(t => t.id !== id));
    spawnTarget();
    if (score % 5 === 0) spawnTarget(); // Increase density
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0.1) {
            setIsActive(false);
            finishGame(score);
            return 0;
          }
          return t - 0.1;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, score]);

  return (
    <div className="relative w-full h-screen bg-[#050816] flex flex-col items-center justify-center overflow-hidden touch-none">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {!isActive && (
          <div className="z-10 flex flex-col items-center gap-8">
              <div className="text-center">
                  <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white">Tap Dash</h1>
                  <p className="text-white/20 font-black uppercase tracking-widest text-xs mt-2">Clear the void. Fast.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-12 py-6 bg-accent-cyan text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.3)]"
              >
                Initiate
              </motion.button>
          </div>
      )}

      {isActive && (
          <>
            {/* HUD */}
            <div className="fixed top-12 left-0 w-full px-12 flex justify-between items-start pointer-events-none z-50">
                <div className="space-y-1">
                    <div className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Score</div>
                    <div className="text-5xl font-black italic text-white tracking-tighter leading-none">{score}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-accent-rose">
                        <Timer size={16} />
                        <span className="text-2xl font-mono font-black italic">{timeLeft.toFixed(1)}s</span>
                    </div>
                </div>
            </div>

            {/* Targets */}
            <AnimatePresence>
                {targets.map(t => (
                    <motion.button
                        key={t.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: t.scale, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="absolute w-24 h-24 flex items-center justify-center"
                        style={{ left: t.x - 48, top: t.y - 48 }}
                        onClick={() => handleTap(t.id)}
                    >
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors" />
                        <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                        </div>
                    </motion.button>
                ))}
            </AnimatePresence>
          </>
      )}

      {/* Exit Button */}
      <button
        onClick={exitToDashboard}
        className="fixed bottom-8 left-8 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all z-50 text-white/40 hover:text-white"
      >
        <Home size={20} />
      </button>
    </div>
  );
};

export default TapDash;
