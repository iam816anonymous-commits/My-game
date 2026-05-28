import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reaction: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const spawn = useCallback(() => {
    setTarget({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80
    });
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
      setScore(s => s + 10 * combo);
      setCombo(c => Math.min(10, c + 0.5));
      updateXP(10);
      spawn();
  };

  const miss = () => {
      setCombo(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-8 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Reaction <span className="text-accent-cyan">Arena</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Speed Overhaul</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Reality Score</div>
                  <div className="text-2xl font-black italic text-white tabular-nums">{score}</div>
              </div>
          </div>
          <div className="p-6 bg-accent-cyan/10 rounded-3xl border border-accent-cyan/20 flex items-center gap-4">
              <div className="text-2xl font-black italic tabular-nums">{timeLeft}s</div>
          </div>
      </div>

      <div
        onClick={miss}
        className="relative w-full max-w-sm aspect-square bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden cursor-crosshair"
      >
        <AnimatePresence mode="popLayout">
            {!gameOver && (
                <motion.div
                    key={`${target.x}-${target.y}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); hit(); }}
                    className="absolute w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_white]"
                    style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <Target size={24} className="text-black" />
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                    <Zap size={48} className="text-accent-cyan mb-4" />
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Focus Lost</h3>
                    <button onClick={restart} className="w-full py-4 bg-accent-cyan text-black font-black uppercase tracking-widest rounded-2xl">Re-Focus</button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic flex items-center gap-2">
          Combo Multiplier <span className="text-accent-cyan text-sm">x{combo.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default Reaction;
