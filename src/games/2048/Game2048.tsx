import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Sparkles, Trophy, Undo2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { initGame, move } from './logic';
import type { GameState } from './logic';
import { AnalyticsManager } from '../../shared/systems/AnalyticsManager';

const Game2048: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame, updateStats } = usePlayStore();
  const [isDaily, setIsDaily] = useState(false);
  const [state, setState] = useState<GameState>(initGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [combo, setCombo] = useState(1);
  const [fusionEffect, setFusionEffect] = useState(false);
  const lastMoveTime = useRef(Date.now());
  const boardRef = useRef<HTMLDivElement>(null);

  const restart = useCallback((useSeed: boolean = false) => {
    const seed = useSeed ? new Date().toISOString().split('T')[0] : undefined;
    setState(initGame(seed));
    setHistory([]);
    setCombo(1);
    setIsDaily(useSeed);
  }, []);

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setState(prev => {
      const { state: nextState, moved } = move(prev, direction);
      if (moved) {
        if (prev.score === 0) AnalyticsManager.trackFirstAction('2048');
        setHistory(h => [...h, prev].slice(-15)); // Increased undo steps V9

        const now = Date.now();
        if (now - lastMoveTime.current < 600) {
            setCombo(c => Math.min(20, c + 1));
        } else {
            setCombo(1);
        }
        lastMoveTime.current = now;

        const scoreDiff = nextState.score - prev.score;
        if (scoreDiff > 0) {
            updateXP(Math.floor(scoreDiff * (1 + combo * 0.1)));
            updateStats({ puzzlesSolved: 1 });

            // Fusion Flash for high value merges
            if (scoreDiff >= 128) {
                setFusionEffect(true);
                JuiceManager.shake(scoreDiff >= 512 ? 15 : 5);
                if (scoreDiff >= 1024) JuiceManager.success();
                setTimeout(() => setFusionEffect(false), 300);
            }
        }

        if (nextState.gameOver) {
            AnalyticsManager.trackGameComplete('2048', nextState.score);
            finishGame(nextState.score);
        }

        return nextState;
      }
      return prev;
    });
  }, [updateXP, finishGame, combo]);

  const undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setState(prev);
      setHistory(h => h.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart(false);
      if (e.key === 'u' || e.key === 'U') undo();
      if (e.key === 'ArrowUp' || e.key === 'w') handleMove('up');
      if (e.key === 'ArrowDown' || e.key === 's') handleMove('down');
      if (e.key === 'ArrowLeft' || e.key === 'a') handleMove('left');
      if (e.key === 'ArrowRight' || e.key === 'd') handleMove('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restart, handleMove]);

  // Touch Swipe Logic
  const touchStart = useRef<[number, number] | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStart.current = [e.touches[0].clientX, e.touches[0].clientY];
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current[0];
      const dy = e.changedTouches[0].clientY - touchStart.current[1];
      if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 30) handleMove(dx > 0 ? 'right' : 'left');
      } else {
          if (Math.abs(dy) > 30) handleMove(dy > 0 ? 'down' : 'up');
      }
      touchStart.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 gap-6 overflow-hidden touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">2048 <span className="text-accent-gold text-glow">Fusion</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">{isDaily ? 'DAILY SEED' : 'MECHANICS V9'}</div>
        </div>
        <div className="flex gap-2">
            {!isDaily && <button onClick={() => restart(true)} className="p-4 bg-accent-gold/10 rounded-2xl border border-accent-gold/20 text-accent-gold hover:bg-accent-gold/20 transition-all"><Sparkles size={20} /></button>}
            <button onClick={undo} disabled={history.length === 0} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white disabled:opacity-20"><Undo2 size={20} /></button>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Score</div>
                  <div className="text-2xl font-black italic text-white tabular-nums">{state.score}</div>
              </div>
          </div>
          <div className="p-6 bg-accent-gold/10 rounded-3xl border border-accent-gold/20 flex items-center gap-4 relative overflow-hidden">
              <div className="text-2xl font-black italic tabular-nums">x{(1 + combo * 0.1).toFixed(1)}</div>
              {combo > 10 && <Star size={16} className="text-accent-gold animate-spin-slow" />}
          </div>
      </div>

      <motion.div
        ref={boardRef}
        animate={fusionEffect ? { scale: [1, 1.02, 1], filter: 'brightness(1.5)' } : {}}
        className="relative w-full max-w-sm aspect-square bg-white/5 p-3 rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        <AnimatePresence>
            {state.score === 0 && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                    <div className="bg-accent-gold/20 text-accent-gold px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-gold/30 animate-pulse">
                        Swipe or use Arrows to Merge
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
            {Array(16).fill(null).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/5" />
            ))}
        </div>

        <div className="absolute inset-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {state.tiles.map((tile) => (
                    <motion.div
                        key={tile.id}
                        layout
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            x: tile.position[1] * ((boardRef.current?.offsetWidth || 340) / 4 - 2),
                            y: tile.position[0] * ((boardRef.current?.offsetHeight || 340) / 4 - 2)
                        }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 450 }}
                        className="absolute w-[calc(25%-6px)] h-[calc(25%-6px)] flex items-center justify-center text-2xl font-black rounded-xl text-black shadow-lg"
                        style={{
                            backgroundColor: getTileColor(tile.value),
                            boxShadow: tile.value >= 128 ? `0 0 30px ${getTileColor(tile.value)}99` : `0 0 10px ${getTileColor(tile.value)}44`
                        }}
                    >
                        {tile.value}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        <AnimatePresence>
            {state.gameOver && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 z-50"
                >
                    <Trophy size={48} className="text-accent-gold mb-4" />
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Grid Locked</h3>
                    <button onClick={() => restart(false)} className="w-full py-4 bg-accent-gold text-black font-black uppercase tracking-widest rounded-2xl shadow-xl">Restart Logic</button>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic text-center">
          Swift Merges build Fusion Multipliers
      </div>
    </div>
  );
};

const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
        2: '#e2e8f0',
        4: '#cbd5e1',
        8: '#f9a8d4',
        16: '#f472b6',
        32: '#fb7185',
        64: '#e11d48',
        128: '#fde047',
        256: '#facc15',
        512: '#eab308',
        1024: '#84cc16',
        2048: '#22c55e',
        4096: '#22d3ee',
        8192: '#8b5cf6'
    };
    return colors[value] || '#ffffff';
};

export default Game2048;
