import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Target, Timer, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';

const Reaction: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [lastHitTime, setLastHitTime] = useState(Date.now());
  const [grade, setGrade] = useState<'PERFECT' | 'GREAT' | 'GOOD' | null>(null);

  const [hits, setHits] = useState(0);

  const spawn = useCallback(() => {
    const calibration = hits < 5;
    setTarget({
        x: (calibration ? 25 : 15) + Math.random() * (calibration ? 50 : 70),
        y: (calibration ? 25 : 15) + Math.random() * (calibration ? 50 : 70)
    });
    setLastHitTime(Date.now());
  }, [hits]);

  const restart = useCallback(() => {
    setGameOver(false);
    setTimeLeft(30);
    setScore(0);
    setCombo(1);
    setGrade(null);
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
      setHits(h => h + 1);

      let precisionBonus = 1.0;
      let currentGrade: 'PERFECT' | 'GREAT' | 'GOOD' = 'GOOD';

      if (reactionTime < 350) {
          precisionBonus = 2.5;
          currentGrade = 'PERFECT';
      } else if (reactionTime < 550) {
          precisionBonus = 1.8;
          currentGrade = 'GREAT';
      }

      setGrade(currentGrade);
      if (currentGrade === 'PERFECT') JuiceManager.success();
      JuiceManager.shake(currentGrade === 'PERFECT' ? 10 : 5);
      setTimeout(() => setGrade(null), 400);

      const gain = Math.floor(10 * combo * precisionBonus);
      setScore(s => s + gain);
      setCombo(c => Math.min(20, c + (currentGrade === 'PERFECT' ? 1.0 : 0.5)));
      updateXP(Math.floor(gain / 2));
      spawn();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 gap-8 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Reaction <span className="text-accent-cyan text-glow">Arena</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">V10 Precision Combat</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Reality Score</div>
                  <div className="text-2xl font-black italic text-white tabular-nums">{score}</div>
              </div>
              <Sparkles size={24} className="text-white/5 absolute -right-2 -bottom-2 scale-150" />
          </div>
          <div className="p-6 bg-accent-cyan/10 rounded-3xl border border-accent-cyan/20 flex items-center gap-4">
              <Timer size={20} className="text-accent-cyan" />
              <div className="text-2xl font-black italic tabular-nums text-white">{timeLeft}s</div>
          </div>
      </div>

      <div
        onClick={() => setCombo(1)}
        className="relative w-full max-w-sm aspect-square bg-white/5 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-crosshair"
      >
        {/* Grading Indicator */}
        <AnimatePresence>
            {grade && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                    <div className={`text-4xl font-black italic uppercase tracking-tighter ${grade === 'PERFECT' ? 'text-accent-gold' : grade === 'GREAT' ? 'text-accent-cyan' : 'text-white'}`}>
                        {grade}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
            {!gameOver && (
                <motion.div
                    key={`${target.x}-${target.y}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); hit(); }}
                    className={`absolute bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_white] z-10 ${hits < 5 ? 'w-24 h-24' : 'w-20 h-20'}`}
                    style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <Target size={hits < 5 ? 40 : 32} className="text-black" />
                    <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20" />
                </motion.div>
            )}
        </AnimatePresence>

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
                            <div className="text-accent-cyan font-black uppercase tracking-widest text-[10px]">Neural Reflex Terminated</div>
                            <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Reaction Arena</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Targets Hit</div>
                                <div className="text-xl font-black text-white">{hits}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Peak Reflex</div>
                                <div className="text-xl font-black text-accent-cyan">x{(1 + combo * 0.1).toFixed(1)}</div>
                            </div>
                        </div>

                        <div className="p-6 bg-accent-cyan/5 border border-accent-cyan/20 rounded-3xl">
                            <div className="text-[8px] font-black uppercase tracking-widest text-accent-cyan mb-2">Operational Insight</div>
                            <p className="text-xs text-white/60 font-medium leading-relaxed">
                                {hits < 10 ? 'Calibration complete. Target size decreases as your proficiency increases.' :
                                 'Perfect grades (under 350ms) grant massive multipliers. Find the rhythm.'}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={exitToDashboard} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all">Hub</button>
                            <button onClick={restart} className="flex-[2] py-4 bg-accent-cyan text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-all">Re-Engage</button>
                        </div>
                    </motion.div>
                </motion.div>
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
