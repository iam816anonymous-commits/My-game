import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Target, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reaction: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [lastHitTime, setLastHitTime] = useState(Date.now());
  const [perfectWindow, setPerfectWindow] = useState(false);

  const spawn = useCallback(() => {
    setTarget({
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70
    });
    setLastHitTime(Date.now());
  }, []);

  const restart = useCallback(() => {
    setGameOver(false);
    setTimeLeft(30);
    setScore(0);
    setCombo(1);
    spawn();
  }, [spawn]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restart]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(prev => {
        if (prev <= 1) { setGameOver(true); finishGame(score); }
        return prev - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [gameOver, timeLeft, score, finishGame]);

  const hit = () => {
      const now = Date.now();
      const reactionTime = now - lastHitTime;

      // V9 Precision Bonus
      let precisionBonus = 1.0;
      if (reactionTime < 400) {
          precisionBonus = 2.0;
          setPerfectWindow(true);
          setTimeout(() => setPerfectWindow(false), 300);
      } else if (reactionTime < 700) {
          precisionBonus = 1.5;
      }

      setScore(s => s + Math.floor(10 * combo * precisionBonus));
      setCombo(c => Math.min(15, c + 0.5));
      updateXP(10);
      spawn();
  };

  const miss = () => {
      setCombo(1);
  };

  // V9 Intensity: Faster depletion or harder spawns could be added here
  // For now, focus on the reaction feedback

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 gap-8 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Reaction <span className="text-accent-cyan text-glow">Arena</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Precision V9</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between overflow-hidden relative">
              <motion.div
                animate={perfectWindow ? { scale: [1, 1.2, 1], color: '#22d3ee' } : {}}
                className="relative z-10"
              >
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Score</div>
                  <div className="text-2xl font-black italic text-white tabular-nums">{score}</div>
              </motion.div>
              <Zap size={20} className="text-white/5 absolute -right-2 -bottom-2 scale-150" />
          </div>
          <div className="p-6 bg-accent-cyan/10 rounded-3xl border border-accent-cyan/20 flex items-center gap-4">
              <Timer size={20} className="text-accent-cyan" />
              <div className="text-2xl font-black italic tabular-nums">{timeLeft}s</div>
          </div>
      </div>

      <div
        onClick={miss}
        className="relative w-full max-w-sm aspect-square bg-white/5 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-crosshair"
      >
        <AnimatePresence mode="popLayout">
            {!gameOver && (
                <motion.div
                    key={`${target.x}-${target.y}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); hit(); }}
                    className="absolute w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_white] z-10"
                    style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <Target size={32} className="text-black" />
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center z-20"
                >
                    <Zap size={48} className="text-accent-cyan mb-4" />
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Focus Failed</h3>
                    <button onClick={restart} className="w-full py-4 bg-accent-cyan text-black font-black uppercase tracking-widest rounded-2xl shadow-xl">Re-Focus</button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Precision Indicators */}
        <AnimatePresence>
            {perfectWindow && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="absolute inset-0 border-8 border-accent-cyan/20 pointer-events-none"
                />
            )}
        </AnimatePresence>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic flex items-center gap-2">
          Combo Multiplier <span className="text-accent-cyan text-sm">x{(1 + combo * 0.1).toFixed(1)}</span>
      </div>
    </div>
  );
};

export default Reaction;
