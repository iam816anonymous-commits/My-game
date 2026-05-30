import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Sparkles, Undo2, Star, Zap, Target, Info, RefreshCw, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { initGame, move, analyzeFailure } from './logic';
import type { GameState } from './logic';
import { AnalyticsManager } from '../../shared/systems/AnalyticsManager';

const COLORS = {
    bg: '#050816',
    board: '#111827',
    text: '#ffffff',
    2: '#22d3ee', // Soft Cyan
    4: '#22d3ee',
    8: '#22d3ee',
    16: '#8b5cf6', // Electric Violet
    32: '#8b5cf6',
    64: '#8b5cf6',
    128: '#facc15', // Warm Gold
    256: '#facc15',
    512: '#facc15',
    1024: '#facc15',
    2048: '#ffffff', // Radiant White-Gold
    4096: '#ffffff',
    8192: '#ffffff'
};

const getTileTier = (value: number) => {
    if (value <= 32) return 'minimal';
    if (value <= 256) return 'glow';
    if (value <= 1024) return 'presence';
    if (value === 2048) return 'celebration';
    return 'legendary';
};

const Game2048: React.FC = () => {
  const { updateXP, finishGame, setLiveScore } = usePlayStore();
  const [state, setState] = useState<GameState>(initGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [combo, setCombo] = useState(1);
  const [fusionEffect, setFusionEffect] = useState(false);
  const [popups, setPopups] = useState<{ id: number, x: number, y: number, value: number }[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const lastMoveTime = useRef(Date.now());
  const boardRef = useRef<HTMLDivElement>(null);

  const restart = useCallback(() => {
    setState(initGame());
    setHistory([]);
    setCombo(1);
    setShowAnalysis(false);
  }, []);

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setState(prev => {
      if (prev.gameOver) return prev;
      const { state: nextState, moved } = move(prev, direction);
      if (moved) {
        setHistory(h => [...h, prev].slice(-20));

        const now = Date.now();
        if (now - lastMoveTime.current < 500) {
            setCombo(c => Math.min(10, c + 1));
        } else {
            setCombo(1);
        }
        lastMoveTime.current = now;

        const scoreDiff = nextState.score - prev.score;
        if (scoreDiff > 0) {
            updateXP(Math.floor(scoreDiff * (1 + combo * 0.1)));

            // Add popups for merges
            const mergedTiles = nextState.tiles.filter(t => t.mergedFrom);
            mergedTiles.forEach(t => {
                const id = Date.now() + Math.random();
                setPopups(prev => [...prev, { id, x: t.position[1], y: t.position[0], value: t.value }]);
                setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1000);
            });

            if (scoreDiff >= 128) {
                setFusionEffect(true);
                JuiceManager.shake(scoreDiff >= 512 ? 10 : 3);
                setTimeout(() => setFusionEffect(false), 200);
            }
        }

        setLiveScore(nextState.score);
        return nextState;
      }
      return prev;
    });
  }, [updateXP, combo]);

  const undo = () => {
    if (history.length > 0) {
      setState(history[history.length - 1]);
      setHistory(h => h.slice(0, -1));
      JuiceManager.shake(2);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart();
      if (e.key === 'u' || e.key === 'U') undo();
      if (['ArrowUp', 'w', 'W'].includes(e.key)) handleMove('up');
      if (['ArrowDown', 's', 'S'].includes(e.key)) handleMove('down');
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleMove('left');
      if (['ArrowRight', 'd', 'D'].includes(e.key)) handleMove('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restart, handleMove]);

  // Touch Swipe
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

  const analysis = state.gameOver ? analyzeFailure(state) : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg gap-8 touch-none select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Header Stat Bar */}
      <div className="flex w-full justify-between items-center px-4">
        <div className="flex gap-4">
            <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Fusion Core</span>
                <span className="text-xl font-black italic text-white tabular-nums">{state.score}</span>
            </div>
            <div className="px-5 py-3 bg-accent-gold/10 rounded-2xl border border-accent-gold/20 flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-accent-gold/40">Multiplier</span>
                <span className="text-xl font-black italic text-accent-gold tabular-nums">x{(1 + combo * 0.1).toFixed(1)}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={undo} disabled={history.length === 0} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-10">
                <Undo2 size={20} />
            </button>
            <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Sparkles size={20} />
            </button>
        </div>
      </div>

      {/* Board */}
      <motion.div
        ref={boardRef}
        animate={fusionEffect ? { scale: [1, 1.01, 1] } : {}}
        className="relative w-full max-w-sm aspect-square bg-[#111827] p-3 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Background Grid */}
        <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
            {Array(16).fill(null).map((_, i) => (
                <div key={i} className="bg-[#050816]/40 rounded-xl border border-white/5" />
            ))}
        </div>

        {/* Dynamic Tiles */}
        <div className="absolute inset-3 pointer-events-none">
            <AnimatePresence>
                {state.tiles.map((tile) => {
                    const tier = getTileTier(tile.value);
                    const isHigh = tile.value >= 512;
                    return (
                        <motion.div
                            key={tile.id}
                            layout
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: tile.position[1] * ((boardRef.current?.offsetWidth || 350) / 4 - 2),
                                y: tile.position[0] * ((boardRef.current?.offsetHeight || 350) / 4 - 2)
                            }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            className={`absolute w-[calc(25%-9px)] h-[calc(25%-9px)] flex flex-col items-center justify-center rounded-xl shadow-2xl border border-white/10
                                ${tier === 'presence' ? 'ring-2 ring-white/20 shadow-[0_0_30px_rgba(250,204,21,0.2)]' : ''}
                                ${tier === 'celebration' ? 'ring-4 ring-white/50 shadow-[0_0_50px_rgba(255,255,255,0.4)]' : ''}
                                ${tier === 'legendary' ? 'ring-[6px] ring-accent-gold shadow-[0_0_80px_rgba(255,255,255,0.6)] animate-pulse' : ''}
                            `}
                            style={{
                                backgroundColor: (COLORS as any)[tile.value] || COLORS[4096],
                                color: tile.value >= 2048 ? '#000000' : '#ffffff',
                            }}
                        >
                            <span className={`font-black italic tracking-tighter relative z-10
                                ${tile.value > 1000 ? 'text-lg' : tile.value > 100 ? 'text-xl' : 'text-3xl'}
                                ${tier === 'legendary' ? 'scale-110 drop-shadow-lg' : ''}
                            `}>
                                {tile.value}
                            </span>

                            {/* Evolution Glows */}
                            {tier === 'glow' && (
                                <div className="absolute inset-0 bg-white/5 rounded-xl blur-md" />
                            )}
                            {tier === 'presence' && (
                                <motion.div
                                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute inset-0 bg-accent-gold/20 rounded-xl blur-lg"
                                />
                            )}
                            {tier === 'celebration' && (
                                <>
                                    <div className="absolute inset-0 bg-white/30 rounded-xl animate-pulse" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                        className="absolute -inset-2 border-2 border-dashed border-white/20 rounded-2xl"
                                    />
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Score Popups */}
            <AnimatePresence>
                {popups.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.2, 1, 0.8],
                            x: p.x * ((boardRef.current?.offsetWidth || 350) / 4 - 2),
                            y: p.y * ((boardRef.current?.offsetHeight || 350) / 4 - 2) - 40
                        }}
                        className="absolute pointer-events-none text-accent-gold font-black italic text-xl drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] z-40"
                    >
                        +{p.value}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Game Over / Analysis Overlay */}
        <AnimatePresence>
            {state.gameOver && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[110] bg-[#050816]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                    {!showAnalysis ? (
                        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="space-y-8 w-full max-w-xs">
                            <div className="space-y-2">
                                <div className="text-accent-gold font-black uppercase tracking-[0.3em] text-[10px]">Logical Exhaustion</div>
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Grid Lock</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-[8px] font-black uppercase text-white/20 mb-1">Max Particle</div>
                                    <div className="text-xl font-black text-white">{state.stats.maxTile}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-[8px] font-black uppercase text-white/20 mb-1">Fusion Score</div>
                                    <div className="text-xl font-black text-white">{state.score}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => setShowAnalysis(true)} className="w-full py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                                    <Target size={14} /> View Operational Insight
                                </button>
                                <button onClick={restart} className="w-full py-5 bg-accent-gold text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-accent-gold/20 hover:scale-105 active:scale-95 transition-all">
                                    Ignite New Fusion
                                </button>
                                <button onClick={() => finishGame(state.score)} className="w-full py-4 text-white/40 font-black uppercase tracking-widest text-[9px] hover:text-white transition-colors">
                                    Finalize Session
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 w-full max-w-sm text-left">
                             <div className="flex items-center gap-3 text-accent-gold mb-4">
                                <Info size={24} />
                                <h4 className="text-xl font-black italic uppercase">Operational Insight</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-2">
                                    <div className="text-[10px] font-black uppercase text-accent-gold tracking-widest">Post-Mortem Analysis</div>
                                    <p className="text-sm font-medium text-white/80">{analysis?.insight}</p>
                                </div>

                                <div className="p-5 bg-accent-cyan/10 rounded-3xl border border-accent-cyan/20 space-y-2">
                                    <div className="text-[10px] font-black uppercase text-accent-cyan tracking-widest">Recommended Adjustment</div>
                                    <p className="text-sm font-medium text-white/80">{analysis?.suggestion}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[8px] font-black uppercase text-white/20">Board Efficiency</div>
                                        <div className="text-xl font-black text-white">{analysis?.efficiency}%</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[8px] font-black uppercase text-white/20">Peak Combo</div>
                                        <div className="text-xl font-black text-white">{analysis?.chain}x</div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowAnalysis(false)} className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                <RefreshCw size={12} /> Back to Results
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      <div className="flex gap-8 items-center text-white/10">
          <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest mb-1">Max Chain</span>
              <span className="text-sm font-black italic">{state.stats.longestChain}x</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest mb-1">Merges</span>
              <span className="text-sm font-black italic">{state.stats.merges}</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest mb-1">Efficiency</span>
              <span className="text-sm font-black italic">
                {state.tiles.length > 0 ? Math.round((Math.max(...state.tiles.map(t => t.value)) / state.tiles.reduce((a, b) => a + b.value, 0)) * 100) : 0}%
              </span>
          </div>
      </div>
    </div>
  );
};

export default Game2048;
