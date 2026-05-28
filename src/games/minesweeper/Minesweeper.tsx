import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Bomb, Zap, ShieldAlert, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Minesweeper: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [board, setBoard] = useState(() => Array(100).fill(0).map(() => Math.random() < 0.15 ? -1 : 0));
  const [revealed, setRevealed] = useState<boolean[]>(Array(100).fill(false));
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);

  const restart = useCallback(() => {
    setBoard(Array(100).fill(0).map(() => Math.random() < 0.15 ? -1 : 0));
    setRevealed(Array(100).fill(false));
    setTimeLeft(60);
    setGameOver(false);
    setCombo(0);
  }, []);

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
        if (prev <= 1) { setGameOver(true); finishGame(combo * 10); }
        return prev - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [gameOver, timeLeft, finishGame, combo]);

  const reveal = (i: number) => {
    if (revealed[i] || gameOver) return;
    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);

    if (board[i] === -1) {
      setGameOver(true);
      finishGame(combo * 10);
    } else {
      setCombo(c => c + 1);
      updateXP(10 * combo);
      // Add a bit of time for each clear
      setTimeLeft(t => Math.min(60, t + 1));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-8 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-accent-rose">Mine <span className="text-white">Rush</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Pressure Mode</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className={`flex-1 p-6 rounded-3xl border transition-all flex items-center justify-between ${timeLeft < 10 ? 'bg-accent-rose/20 border-accent-rose animate-pulse' : 'bg-white/5 border-white/5'}`}>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Stability</div>
                  <div className="text-2xl font-black italic tabular-nums">{timeLeft}s</div>
              </div>
              <Timer size={20} className={timeLeft < 10 ? 'text-accent-rose' : 'text-white/10'} />
          </div>
          <div className="p-6 bg-accent-cyan/10 rounded-3xl border border-accent-cyan/20 flex items-center gap-4">
              <Zap size={20} className="text-accent-cyan" />
              <div className="text-2xl font-black italic">{combo}</div>
          </div>
      </div>

      <div className="grid grid-cols-10 grid-rows-10 gap-1.5 w-full max-w-sm aspect-square bg-white/5 p-3 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
        {board.map((val, i) => (
            <motion.div
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => reveal(i)}
                className={`flex items-center justify-center text-xs font-black rounded-lg cursor-pointer transition-all ${
                    revealed[i] ?
                        (val === -1 ? 'bg-accent-rose shadow-[0_0_20px_#f9a8d4]' : 'bg-white/10 opacity-30') :
                        'bg-white/10 hover:bg-white/20'
                }`}
            >
                {revealed[i] && val === -1 && <Bomb size={12} />}
            </motion.div>
        ))}

        <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center"
                >
                    <ShieldAlert size={48} className="text-accent-rose mb-4" />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Void Triggered</h3>
                    <div className="text-xs text-white/40 uppercase tracking-[0.3em] font-black mb-8">Cleared {combo} sectors</div>
                    <button onClick={restart} className="w-full py-4 bg-accent-rose text-black font-black uppercase tracking-widest rounded-2xl">Reinforce</button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Minesweeper;
