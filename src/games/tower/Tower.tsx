import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tower: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [blocks, setBlocks] = useState<{ width: number, x: number }[]>([{ width: 60, x: 20 }]);
  const [currentBlock, setCurrentBlock] = useState({ width: 60, x: 0 });
  const [dir, setDir] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);

  const requestRef = useRef<number>(0);

  const update = useCallback(() => {
    if (gameOver) return;
    setCurrentBlock(prev => {
        let newX = prev.x + dir * 2;
        if (newX > 80 || newX < 0) setDir(d => -d);
        return { ...prev, x: newX };
    });
    requestRef.current = requestAnimationFrame(update);
  }, [dir, gameOver]);

  const restart = useCallback(() => {
    setGameOver(false);
    setBlocks([{ width: 60, x: 20 }]);
    setCombo(0);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart();
      if (e.key === ' ' || e.key === 'Enter') place();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restart]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const place = () => {
      const last = blocks[blocks.length - 1];
      const diff = currentBlock.x - last.x;
      const newWidth = last.width - Math.abs(diff);

      if (newWidth <= 0) {
          setGameOver(true);
          finishGame(blocks.length);
          return;
      }

      const isPerfect = Math.abs(diff) < 2;
      if (isPerfect) setCombo(c => c + 1); else setCombo(0);

      const newBlock = { width: newWidth, x: diff > 0 ? currentBlock.x : last.x };
      setBlocks(prev => [...prev, newBlock]);
      setCurrentBlock({ width: newWidth, x: 0 });
      updateXP(100 + combo * 50);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-8 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Stack <span className="text-accent-violet">Rush</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Rhythm Overhaul</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="relative w-full max-w-sm h-96 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col-reverse p-8" onClick={place}>
          {/* Static Blocks */}
          {blocks.slice(-10).map((b, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                className="h-8 bg-white/10 border border-white/20 rounded-md mb-1"
                style={{ width: `${b.width}%`, marginLeft: `${b.x}%` }}
              />
          ))}

          {/* Moving Block */}
          {!gameOver && (
              <div
                className="h-8 bg-accent-violet shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/20 rounded-md mb-1"
                style={{ width: `${currentBlock.width}%`, marginLeft: `${currentBlock.x}%` }}
              />
          )}

          <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                    <Layers size={48} className="text-accent-violet mb-4" />
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Tower Fell</h3>
                    <button onClick={restart} className="w-full py-4 bg-accent-violet text-white font-black uppercase tracking-widest rounded-2xl shadow-lg">Re-Stack</button>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      <div className="flex gap-8 items-center">
          <div className="text-center">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Height</div>
              <div className="text-2xl font-black italic text-white">{blocks.length}</div>
          </div>
          <div className="text-center">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Perfect</div>
              <div className="text-2xl font-black italic text-accent-cyan flex items-center gap-2">
                  <Zap size={20} fill="currentColor" /> {combo}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Tower;
