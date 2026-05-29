import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, Zap } from 'lucide-react';
import { JuiceManager } from '../../shared/systems/JuiceManager';

const COLORS = [
  { id: 'violet', value: '#8B5CF6', label: 'Violet' },
  { id: 'cyan', value: '#22D3EE', label: 'Cyan' },
  { id: 'pink', value: '#F472B6', label: 'Pink' },
  { id: 'gold', value: '#FACC15', label: 'Gold' },
];

const ColorRush: React.FC = () => {
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [options, setOptions] = useState(COLORS);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [isActive, setIsActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const spawnNext = useCallback(() => {
    const nextTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(nextTarget);
    // Shuffle options
    setOptions([...COLORS].sort(() => Math.random() - 0.5));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(100);
    setIsActive(true);
    spawnNext();
  };

  const handleChoice = (colorId: string) => {
    if (!isActive) return;

    if (colorId === targetColor.id) {
      setScore(s => s + 1);
      setTimeLeft(t => Math.min(100, t + 15 - Math.min(10, score / 5)));
      updateXP(5);
      JuiceManager.shake(2);
      if ((score + 1) % 10 === 0) JuiceManager.success();
      spawnNext();
    } else {
      JuiceManager.danger();
      gameOver();
    }
  };

  const gameOver = () => {
    setIsActive(false);
    if (score > highScore) setHighScore(score);
    finishGame(score);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
            const next = t - (0.5 + (score / 20));
            if (next <= 0) {
                gameOver();
                return 0;
            }
            return next;
        });
      }, 16);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, score]);

  return (
    <div className="relative w-full h-screen bg-[#050816] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{ backgroundColor: targetColor.value }}
        transition={{ duration: 0.5 }}
      />

      <div className="z-10 w-full max-w-md flex flex-col items-center gap-12">
        {/* HUD */}
        <div className="w-full flex justify-between items-end">
            <div className="space-y-1">
                <div className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold">Score</div>
                <div className="text-4xl font-black italic text-white tracking-tighter">{score}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold">Time</div>
                <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="h-full bg-white"
                        animate={{ width: `${timeLeft}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            </div>
        </div>

        {/* Target */}
        <AnimatePresence mode="wait">
            <motion.div
                key={targetColor.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="w-48 h-48 rounded-[3rem] shadow-2xl flex items-center justify-center relative group"
                style={{ backgroundColor: targetColor.value }}
            >
                <div className="absolute inset-0 rounded-[3rem] blur-3xl opacity-50" style={{ backgroundColor: targetColor.value }} />
                <Zap className="text-white w-12 h-12" fill="white" />
            </motion.div>
        </AnimatePresence>

        {/* Options */}
        {!isActive ? (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl"
            >
                Start Rush
            </motion.button>
        ) : (
            <div className="grid grid-cols-2 gap-4 w-full">
                {options.map((c) => (
                    <motion.button
                        key={c.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChoice(c.id)}
                        className="h-24 rounded-2xl border border-white/10 flex items-center justify-center transition-colors hover:border-white/40"
                        style={{ backgroundColor: `${c.value}20` }}
                    >
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                    </motion.button>
                ))}
            </div>
        )}
      </div>

      {/* Exit Button */}
      <button
        onClick={exitToDashboard}
        className="fixed top-8 left-8 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all z-50 text-white/40 hover:text-white"
      >
        <Home size={20} />
      </button>
    </div>
  );
};

export default ColorRush;
