import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Zap, Sparkles, Trophy, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initGame, move } from './logic';
import type { GameState } from './logic';

const Game2048: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [isDaily, setIsDaily] = useState(false);
  const [state, setState] = useState<GameState>(initGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [combo, setCombo] = useState(1);
  const lastMoveTime = useRef(Date.now());

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
        setHistory(h => [...h, prev].slice(-10)); // Keep 10 undo steps

        const now = Date.now();
        if (now - lastMoveTime.current < 500) {
            setCombo(c => Math.min(10, c + 1));
        } else {
            setCombo(1);
        }
        lastMoveTime.current = now;

        const scoreDiff = nextState.score - prev.score;
        if (scoreDiff > 0) {
            updateXP(scoreDiff * combo);
        }

        if (nextState.gameOver) {
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
      if (e.key === 'ArrowUp') handleMove('up');
      if (e.key === 'ArrowDown') handleMove('down');
      if (e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'ArrowRight') handleMove('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restart, handleMove]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-8 overflow-hidden touch-none">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">2048 <span className="text-accent-gold">Fusion</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">{isDaily ? 'DAILY CHALLENGE' : 'Logic V6.0'}</div>
        </div>
        <div className="flex gap-2">
            {!isDaily && <button onClick={() => restart(true)} className="p-4 bg-accent-gold/10 rounded-2xl border border-accent-gold/20 text-accent-gold hover:bg-accent-gold/20 transition-all"><Sparkles size={20} /></button>}
            <button onClick={undo} disabled={history.length === 0} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white disabled:opacity-20"><Undo2 size={20} /></button>
            <button onClick={() => restart(false)} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"><RotateCcw size={20} /></button>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Score</div>
                  <div className="text-2xl font-black italic text-accent-gold">{state.score}</div>
              </div>
              <Trophy size={20} className="text-white/10" />
          </div>
          <div className="p-6 bg-accent-gold/10 rounded-3xl border border-accent-gold/20 flex items-center gap-4">
              <Zap size={20} className="text-accent-gold" />
              <div className="text-2xl font-black italic">x{combo}</div>
          </div>
      </div>

      <div className="relative w-full max-w-sm aspect-square bg-white/5 p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
            {Array(16).fill(null).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/5" />
            ))}
        </div>

        <div className="absolute inset-4 pointer-events-none">
            <AnimatePresence>
                {state.tiles.map((tile) => (
                    <motion.div
                        key={tile.id}
                        layout
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            x: tile.position[1] * (320 / 4), // Approximate calculation
                            y: tile.position[0] * (320 / 4)
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute w-[calc(25%-9px)] h-[calc(25%-9px)] flex items-center justify-center text-2xl font-black rounded-xl text-black shadow-lg"
                        style={{
                            backgroundColor: getTileColor(tile.value),
                            boxShadow: `0 0 20px ${getTileColor(tile.value)}66`
                        }}
                    >
                        {tile.value}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {state.gameOver && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 z-50"
            >
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-accent-gold">Fusion Failed</h3>
                <p className="text-white/40 font-bold mb-8 uppercase tracking-widest text-xs">Final Score: {state.score}</p>
                <button onClick={() => restart(false)} className="w-full py-4 bg-accent-gold text-black font-black uppercase tracking-widest rounded-2xl">Re-Initiate</button>
            </motion.div>
        )}
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
        2048: '#22c55e'
    };
    return colors[value] || '#22d3ee';
};

export default Game2048;
