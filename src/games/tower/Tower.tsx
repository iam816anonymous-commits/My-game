import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tower: React.FC = () => {
  const { updateXP, finishGame, setLiveScore } = usePlayStore();
  const [blocks, setBlocks] = useState<{ width: number, x: number }[]>([{ width: 60, x: 20 }]);
  const [currentBlock, setCurrentBlock] = useState({ width: 60, x: 0 });
  const [dir, setDir] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectFlash, setPerfectFlash] = useState(false);

  const requestRef = useRef<number>(0);

  const update = useCallback(() => {
    if (gameOver) return;

    // V10: Adaptive Pacing based on height (V11: Slower start)
    const speedFactor = blocks.length < 5 ? 0.7 : 1 + (blocks.length * 0.04);

    setCurrentBlock(prev => {
        let newX = prev.x + dir * 2 * speedFactor;
        if (newX > 80 || newX < 0) setDir(d => -d);
        return { ...prev, x: newX };
    });
    requestRef.current = requestAnimationFrame(update);
  }, [dir, gameOver, blocks.length]);

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

  useEffect(() => {
    setLiveScore(blocks.length - 1);
  }, [blocks]);

  const place = () => {
      if (gameOver) return;
      const last = blocks[blocks.length - 1];
      const diff = currentBlock.x - last.x;
      const newWidth = last.width - Math.abs(diff);

      if (newWidth <= 0) {
          setGameOver(true);
          finishGame(blocks.length);
          return;
      }

      // V10: Authentic Precision Window
      const isPerfect = Math.abs(diff) < 2;
      if (isPerfect) {
          setCombo(c => {
              const next = c + 1;
              setMaxCombo(m => Math.max(m, next));
              return next;
          });
          setPerfectFlash(true);
          setTimeout(() => setPerfectFlash(false), 200);
          updateXP(100 + combo * 50);
      } else {
          setCombo(0);
          updateXP(50);
      }

      const newBlock = { width: newWidth, x: diff > 0 ? currentBlock.x : last.x };
      setBlocks(prev => [...prev, newBlock]);
      setCurrentBlock({ width: newWidth, x: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 overflow-hidden touch-none" onClick={place}>
      <motion.div
        animate={perfectFlash ? { scale: 1.02 } : {}}
        className="relative w-full max-w-sm h-96 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col-reverse p-8"
      >
          {/* Static Blocks */}
          {blocks.slice(-10).map((b, i) => (
              <motion.div
                key={blocks.length - 10 + i}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                className="h-8 bg-white/10 border border-white/20 rounded-md mb-1 relative overflow-hidden"
                style={{ width: `${b.width}%`, marginLeft: `${b.x}%` }}
              >
                  {combo > 5 && <div className="absolute inset-0 bg-accent-violet/20 animate-pulse" />}
              </motion.div>
          ))}

          {/* Moving Block */}
          {!gameOver && (
              <motion.div
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="h-8 bg-accent-violet shadow-[0_0_40px_rgba(139,92,246,0.6)] border border-white/30 rounded-md mb-1"
                style={{ width: `${currentBlock.width}%`, marginLeft: `${currentBlock.x}%` }}
              />
          )}

          <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[110] bg-[#050816]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="max-w-xs w-full space-y-6"
                    >
                        <div className="space-y-1">
                            <div className="text-accent-violet font-black uppercase tracking-widest text-[10px]">Integrity Lost</div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Game Over</h3>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Final Altitude</div>
                            <div className="text-3xl font-black text-white tabular-nums">{blocks.length - 1}</div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); restart(); }}
                            className="w-full py-4 bg-accent-violet text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02] transition-all"
                        >
                            Re-Stack
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); finishGame(blocks.length - 1); }}
                            className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                        >
                            Finalize Session
                        </button>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Perfect Overlay */}
          <AnimatePresence>
              {perfectFlash && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                      <div className="text-accent-violet font-black italic text-4xl uppercase tracking-tighter flex items-center gap-2">
                          <Star fill="currentColor" /> Perfect
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
      </motion.div>

      <div className="flex gap-8 items-center">
          <div className="text-center">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Height</div>
              <div className="text-2xl font-black italic text-white tabular-nums">{blocks.length}</div>
          </div>
          <div className="text-center">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Combo</div>
              <div className="text-2xl font-black italic text-accent-violet flex items-center gap-2 tabular-nums">
                  <Zap size={20} fill="currentColor" /> {combo}
              </div>
          </div>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic text-center">
          Precision placement builds stability energy
      </div>
    </div>
  );
};

export default Tower;
