import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { User, Bot, Play, Users, Brain, Info, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';

type AIPersonality = 'lucky' | 'aggressive' | 'chaotic' | 'balanced';

interface Player {
    id: number;
    name: string;
    type: 'human' | 'ai';
    personality?: AIPersonality;
    position: number;
    color: string;
    stats: {
        laddersClimbed: number;
        snakesHit: number;
        biggestJump: number;
        biggestFall: number;
        totalTurns: number;
        luckRating: number;
    };
}

type GameState = 'lobby' | 'playing' | 'gameover';

const COLORS = ['#F472B6', '#22D3EE', '#8B5CF6', '#FACC15'];
const PERSONALITIES: AIPersonality[] = ['lucky', 'aggressive', 'chaotic', 'balanced'];

const SnakesAndLadders: React.FC = () => {
  const { updateXP, finishGame, setLiveScore } = usePlayStore();

  // V3 State
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [slots, setSlots] = useState<('human' | 'ai' | 'empty')[]>(['human', 'ai', 'empty', 'empty']);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [dice, setDice] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [previewPos, setPreviewPos] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>(['Initialization...']);

  const MAP: Record<number, number> = {
      // Ladders (Destinations must be higher)
      3: 22, 5: 8, 11: 26, 20: 29, 27: 44, 35: 54, 45: 70, 60: 82, 77: 95,
      // Snakes (Destinations must be lower)
      17: 4, 19: 7, 21: 9, 34: 12, 51: 30, 62: 18, 87: 24, 93: 68, 99: 10
  };

  const initGame = () => {
    const activeSlots = isCustomMode ? slots.filter(s => s !== 'empty') : ['human', 'ai'];
    if (activeSlots.length < 2) {
        return;
    }

    const newPlayers: Player[] = activeSlots.map((type, i) => ({
        id: i,
        name: type === 'human' ? `PLAYER ${i + 1}` : `AI CORE ${String.fromCharCode(65 + i)}`,
        type: type as 'human' | 'ai',
        personality: type === 'ai' ? PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)] : undefined,
        position: 1,
        color: COLORS[i],
        stats: { laddersClimbed: 0, snakesHit: 0, biggestJump: 0, biggestFall: 0, totalTurns: 0, luckRating: 0 }
    }));

    setPlayers(newPlayers);
    setGameState('playing');
    setCurrentTurn(0);
    setHistory(['Prism Link Established']);
  };

  const addLog = (msg: string) => setHistory(prev => [msg, ...prev].slice(0, 5));

  const executeMove = useCallback(async (playerId: number) => {
    setIsRolling(true);

    // Simulate dice roll animation duration
    await new Promise(r => setTimeout(r, 600));

    const player = players.find(p => p.id === playerId)!;

    // Update Turn Count
    setPlayers(prev => prev.map(p => p.id === playerId ? {
        ...p,
        stats: { ...p.stats, totalTurns: p.stats.totalTurns + 1 }
    } : p));

    const roll = Math.floor(Math.random() * 6) + 1;
    setDice(roll);
    setIsRolling(false);

    let currentPos = player.position;
    const targetPos = currentPos + roll;

    if (targetPos > 100) {
        addLog(`${player.name} overshot reality`);
        await new Promise(r => setTimeout(r, 600));
        nextTurn();
        return;
    }

    // Movement Preview
    setPreviewPos(targetPos);
    await new Promise(r => setTimeout(r, 800));

    // Step-by-step movement (V2)
    for (let i = currentPos + 1; i <= targetPos; i++) {
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: i } : p));
        await new Promise(r => setTimeout(r, 150));
    }
    setPreviewPos(null);

    // Check for Snake or Ladder
    if (MAP[targetPos]) {
        await new Promise(r => setTimeout(r, 400)); // Pause to see landing

        const destination = MAP[targetPos];
        const isLadder = destination > targetPos;

        addLog(`${player.name} hit ${isLadder ? 'Ladder' : 'Snake'} -> ${destination}`);

        if (isLadder) {
            updateXP(50);
            JuiceManager.success();
        } else {
            JuiceManager.danger();
        }

        // Slide/Climb animation
        setPlayers(prev => prev.map(p => p.id === playerId ? {
            ...p,
            position: destination,
            stats: {
                ...p.stats,
                laddersClimbed: p.stats.laddersClimbed + (isLadder ? 1 : 0),
                snakesHit: p.stats.snakesHit + (isLadder ? 0 : 1),
                biggestJump: isLadder ? Math.max(p.stats.biggestJump, destination - targetPos) : p.stats.biggestJump,
                biggestFall: !isLadder ? Math.max(p.stats.biggestFall, targetPos - destination) : p.stats.biggestFall
            }
        } : p));
    await new Promise(r => setTimeout(r, 600)); // Allow animation to finish
    }

    // Win Check
    const finalPlayer = players.find(p => p.id === playerId)!;
    setLiveScore(finalPlayer.position);

    if (finalPlayer.position === 100) {
        setGameState('gameover');
        JuiceManager.success();
        if (finalPlayer.type === 'human') updateXP(1000);
    } else {
        nextTurn();
    }
  }, [players, updateXP, setLiveScore]);

  const nextTurn = () => {
    setCurrentTurn(prev => (prev + 1) % players.length);
  };

  useEffect(() => {
    if (gameState === 'playing') {
        const activePlayer = players[currentTurn];
        if (activePlayer && activePlayer.type === 'ai' && !isRolling) {
            const timer = setTimeout(() => executeMove(activePlayer.id), 1000);
            return () => clearTimeout(timer);
        }
    }
  }, [currentTurn, players, gameState, isRolling, executeMove]);

  const getCoords = useCallback((tile: number) => {
    const row = Math.floor((tile - 1) / 10);
    const col = (tile - 1) % 10;
    const x = row % 2 === 0 ? col : 9 - col;
    const y = 9 - row;
    return { x, y };
  }, []);

  const connectors = useMemo(() => {
    return Object.entries(MAP).map(([from, to]) => {
        const start = getCoords(parseInt(from));
        const end = getCoords(to);
        const isLadder = to > parseInt(from);
        const x1 = start.x * 10 + 5;
        const y1 = start.y * 10 + 5;
        const x2 = end.x * 10 + 5;
        const y2 = end.y * 10 + 5;

        if (isLadder) {
            return { type: 'ladder', from, x1, y1, x2, y2 };
        } else {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / dist * 6;
            const perpY = dx / dist * 6;

            const cp1x = x1 + dx * 0.3 + perpX;
            const cp1y = y1 + dy * 0.3 + perpY;
            const cp2x = x1 + dx * 0.7 - perpX;
            const cp2y = y1 + dy * 0.7 - perpY;

            return { type: 'snake', from, x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y };
        }
    });
  }, [getCoords]);

  const ConnectorLayer = () => {
    return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="ladderRail" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="50%" stopColor="#0E7490" />
                    <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
                <linearGradient id="snakeBody" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F472B6" />
                    <stop offset="50%" stopColor="#BE185D" />
                    <stop offset="100%" stopColor="#831843" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="0.4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            {connectors.map((c) => {
                if (c.type === 'ladder') {
                    const dx = c.x2 - c.x1;
                    const dy = c.y2 - c.y1;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    const offset = 1.8; // Wider rails for better presence

                    const ox = Math.cos(angle + Math.PI/2) * offset;
                    const oy = Math.sin(angle + Math.PI/2) * offset;

                    return (
                        <g key={`l-${c.from}`} className="opacity-90">
                            {/* Rails with shadow for depth */}
                            <line x1={c.x1-ox+0.3} y1={c.y1-oy+0.3} x2={c.x2-ox+0.3} y2={c.y2-oy+0.3} stroke="black" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
                            <line x1={c.x1+ox+0.3} y1={c.y1+oy+0.3} x2={c.x2+ox+0.3} y2={c.y2+oy+0.3} stroke="black" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

                            <line x1={c.x1-ox} y1={c.y1-oy} x2={c.x2-ox} y2={c.y2-oy} stroke="url(#ladderRail)" strokeWidth="0.9" strokeLinecap="round" filter="url(#glow)" />
                            <line x1={c.x1+ox} y1={c.y1+oy} x2={c.x2+ox} y2={c.y2+oy} stroke="url(#ladderRail)" strokeWidth="0.9" strokeLinecap="round" filter="url(#glow)" />

                            {/* Steps / Rungs with subtle perspective */}
                            {Array.from({ length: Math.floor(dist/3.5) }).map((_, i, arr) => {
                                const t = (i + 1) / (arr.length + 1);
                                const rx1 = (c.x1-ox)*(1-t) + (c.x2-ox)*t;
                                const ry1 = (c.y1-oy)*(1-t) + (c.y2-oy)*t;
                                const rx2 = (c.x1+ox)*(1-t) + (c.x2+ox)*t;
                                const ry2 = (c.y1+oy)*(1-t) + (c.y2+oy)*t;
                                return (
                                    <g key={i}>
                                        <line x1={rx1+0.1} y1={ry1+0.1} x2={rx2+0.1} y2={ry2+0.1} stroke="black" strokeWidth="0.5" opacity="0.3" />
                                        <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#22D3EE" strokeWidth="0.5" strokeLinecap="round" />
                                    </g>
                                );
                            })}
                        </g>
                    );
                } else {
                    const d = `M ${c.x1} ${c.y1} C ${c.cp1x} ${c.cp1y}, ${c.cp2x} ${c.cp2y}, ${c.x2} ${c.y2}`;
                    const angle = Math.atan2(c.y1 - c.cp1y, c.x1 - c.cp1x);
                    return (
                        <g key={`s-${c.from}`} className="opacity-95">
                            {/* Shadow for body */}
                            <path d={d} transform="translate(0.4, 0.4)" stroke="black" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.3" />
                            {/* Snake Body - Tapered look via strokeWidth gradient is hard in SVG paths, so we use refined glow */}
                            <path
                                d={d}
                                stroke="url(#snakeBody)"
                                strokeWidth="2.2"
                                fill="none"
                                strokeLinecap="round"
                                filter="url(#glow)"
                                className="animate-pulse"
                                style={{ animationDuration: '4s' }}
                            />
                            {/* Head Details - Premium look */}
                            <g transform={`translate(${c.x1}, ${c.y1}) rotate(${(angle * 180 / Math.PI) - 90})`}>
                                <path d="M -1.2 0 Q 0 2.5 1.2 0 L 0 -1 Z" fill="#F472B6" />
                                <circle cx="-0.4" cy="0.6" r="0.25" fill="black" />
                                <circle cx="0.4" cy="0.6" r="0.25" fill="black" />
                                <circle cx="-0.4" cy="0.7" r="0.1" fill="white" />
                                <circle cx="0.4" cy="0.7" r="0.1" fill="white" />
                            </g>
                            {/* Tapered Tail */}
                            <circle cx={c.x2} cy={c.y2} r="0.6" fill="#831843" />
                        </g>
                    );
                }
            })}
        </svg>
    );
  };

  const activePlayer = players[currentTurn];

  if (gameState === 'lobby') {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 p-10 bg-[#0a0a0f] rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-rose" />

            <div className="text-center space-y-2">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Prism <span className="text-accent-rose">Ladders</span></h1>
                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Strategic Momentum Simulator</p>
            </div>

            <div className="w-full space-y-6">
                {!isCustomMode ? (
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Standard Protocol</span>
                            <span className="px-2 py-1 bg-accent-cyan/10 text-accent-cyan text-[8px] font-black rounded-lg">2 PARTICIPANTS</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-accent-rose border-2 border-[#0a0a0f] flex items-center justify-center text-[#0a0a0f]"><User size={20} /></div>
                                <div className="w-10 h-10 rounded-xl bg-accent-cyan border-2 border-[#0a0a0f] flex items-center justify-center text-[#0a0a0f]"><Bot size={20} /></div>
                            </div>
                            <div className="text-sm font-bold text-white/60 italic">Human vs AI Core</div>
                        </div>
                        <button
                            onClick={() => setIsCustomMode(true)}
                            className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors border border-dashed border-white/10 rounded-xl"
                        >
                            Configure Custom Match
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Custom Deployment</span>
                            <button onClick={() => setIsCustomMode(false)} className="text-[9px] font-black uppercase text-accent-rose">Cancel</button>
                        </div>
                        <div className="space-y-2">
                            {slots.map((type, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs" style={{ backgroundColor: COLORS[i], color: '#000' }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 grid grid-cols-3 gap-1">
                                        {(['human', 'ai', 'empty'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                disabled={i === 0 && opt !== 'human'}
                                                onClick={() => {
                                                    const newSlots = [...slots];
                                                    newSlots[i] = opt;
                                                    setSlots(newSlots);
                                                }}
                                                className={`py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${type === opt ? 'bg-white text-black' : 'bg-white/5 text-white/20 hover:bg-white/10'} disabled:opacity-0`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={initGame}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10"
            >
                <Play size={20} fill="currentColor" /> Initiate Reality
            </button>
        </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:flex-row items-start gap-8 w-full max-w-6xl animate-in fade-in duration-500">
        {gameState === 'gameover' && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 lg:p-12 text-center rounded-[3rem] border border-white/20 overflow-y-auto"
            >
                <div className="mb-6 p-6 bg-accent-cyan/20 rounded-full border border-accent-cyan/50 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                    <User size={64} className="text-accent-cyan" />
                </div>

                <h2 className="text-4xl lg:text-6xl font-black italic uppercase text-white mb-2">Prism <span className="text-accent-cyan">Conquered</span></h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs mb-12">Session Analytics: {players.find(p => p.position === 100)?.name}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-12">
                    {[
                        { label: 'Total Turns', val: players.find(p => p.position === 100)?.stats.totalTurns, color: 'text-white' },
                        { label: 'Ladders', val: players.find(p => p.position === 100)?.stats.laddersClimbed, color: 'text-accent-cyan' },
                        { label: 'Snakes', val: players.find(p => p.position === 100)?.stats.snakesHit, color: 'text-accent-rose' },
                        { label: 'Max Jump', val: `+${players.find(p => p.position === 100)?.stats.biggestJump}`, color: 'text-accent-cyan' },
                        { label: 'Max Fall', val: `-${players.find(p => p.position === 100)?.stats.biggestFall}`, color: 'text-accent-rose' },
                        { label: 'Luck Rating', val: `${Math.max(0, 50 + (players.find(p => p.position === 100)?.stats.laddersClimbed || 0)*10 - (players.find(p => p.position === 100)?.stats.snakesHit || 0)*10)}%`, color: 'text-yellow-400' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 w-full max-w-md">
                    <button
                        onClick={() => finishGame(100)}
                        className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/20"
                    >
                        Archive Results
                    </button>
                    <button
                        onClick={() => setGameState('lobby')}
                        className="w-full py-4 bg-white/5 text-white/40 font-black uppercase tracking-widest rounded-2xl hover:text-white transition-all"
                    >
                        Re-initialize
                    </button>
                </div>
            </motion.div>
        )}

        {/* Game Board */}
        <div className="relative aspect-square w-full max-w-[min(80vw,520px)] bg-[#050816] rounded-[2.5rem] border border-white/10 p-4 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Elegant Grid Background */}
            <div className="absolute inset-4 grid grid-cols-10 grid-rows-10 gap-1 opacity-20 pointer-events-none">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-sm" />
                ))}
            </div>

            <div className="grid grid-cols-10 grid-rows-10 w-full h-full relative z-10">
                {Array.from({ length: 100 }).map((_, i) => {
                    const id = i + 1;
                    const { x, y } = getCoords(id);
                    const isSpecial = MAP[id];
                    const isPreview = previewPos === id;
                    const isLadder = isSpecial && MAP[id] > id;
                    return (
                        <div
                            key={id}
                            className={`absolute w-[10%] h-[10%] border border-white/5 flex flex-col items-center justify-center transition-all duration-300 ${isSpecial ? (isLadder ? 'bg-accent-cyan/5' : 'bg-accent-rose/5') : ''} ${isPreview ? 'bg-white/20 z-20 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]' : ''}`}
                            style={{ left: `${x * 10}%`, top: `${y * 10}%` }}
                        >
                            <span className={`text-[10px] font-black select-none transition-colors ${isPreview ? 'text-white' : 'text-white/10'}`}>{id}</span>
                            {id === 100 && <div className="absolute inset-0 bg-accent-cyan/10 animate-pulse" />}

                            <AnimatePresence>
                                {isPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
                                    >
                                        <div className="absolute inset-0 border-2 border-white/50 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                        {isSpecial && (
                                            <motion.div
                                                initial={{ y: 5, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className={`mt-6 px-2 py-1 rounded text-[7px] font-black uppercase whitespace-nowrap shadow-xl border ${isLadder ? 'bg-accent-cyan text-black border-accent-cyan/50' : 'bg-accent-rose text-white border-accent-rose/50'}`}
                                            >
                                                {isLadder ? `Climb to ${MAP[id]}` : `Slide to ${MAP[id]}`}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <ConnectorLayer />

            {/* Players */}
            <AnimatePresence>
                {players.map(p => {
                    const { x, y } = getCoords(p.position);
                    const isCurrent = players[currentTurn]?.id === p.id;
                    return (
                        <motion.div
                            key={p.id}
                            initial={false}
                            animate={{
                                left: `${x * 10 + 5}%`,
                                top: `${y * 10 + 5}%`,
                                scale: isCurrent ? 1.2 : 1,
                                zIndex: isCurrent ? 50 : 10
                            }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 100,
                                mass: 0.8
                            }}
                            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
                            style={{ backgroundColor: p.color }}
                        >
                            <div className="w-2 h-2 rounded-full bg-white/40" />
                            {isCurrent && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-white"
                                    animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>

        {/* Sidebar Controls */}
        <div className="flex-1 w-full space-y-6">
            <div className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Active Entity</p>
                        <h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-2">
                            {activePlayer?.type === 'human' ? <User size={20} /> : <Bot size={20} />}
                            {activePlayer?.name}
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Turn</p>
                        <p className="text-2xl font-black text-accent-rose">{activePlayer?.stats.totalTurns || 0}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-white/5">
                    <motion.div
                        animate={isRolling ? {
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.1, 1],
                            boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.3)", "0 0 0px rgba(255,255,255,0)"]
                        } : {}}
                        transition={isRolling ? { repeat: Infinity, duration: 0.3 } : {}}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all bg-white/10 border border-white/20 shadow-inner`}
                    >
                       {dice === 1 && <Dice1 className="text-white" size={32} />}
                       {dice === 2 && <Dice2 className="text-white" size={32} />}
                       {dice === 3 && <Dice3 className="text-white" size={32} />}
                       {dice === 4 && <Dice4 className="text-white" size={32} />}
                       {dice === 5 && <Dice5 className="text-white" size={32} />}
                       {dice === 6 && <Dice6 className="text-white" size={32} />}
                    </motion.div>
                    <div className="flex-1">
                        <button
                            disabled={isRolling || activePlayer?.type === 'ai'}
                            onClick={() => executeMove(activePlayer!.id)}
                            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-white/5"
                        >
                            {isRolling ? 'Cycling...' : 'Pulse Reality'}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Event Log</p>
                    <div className="space-y-1.5">
                        {history.map((h, i) => (
                            <div key={i} className={`text-xs font-medium px-3 py-2 rounded-lg ${i === 0 ? 'bg-white/10 text-white' : 'text-white/30'}`}>
                                {h}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Status Card */}
            {activePlayer?.type === 'ai' && (
                <div className="bg-accent-cyan/10 border border-accent-cyan/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="animate-pulse bg-accent-cyan w-2 h-2 rounded-full" />
                    <p className="text-xs font-bold text-accent-cyan uppercase tracking-wider">AI Thinking: {activePlayer.personality} protocol active...</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SnakesAndLadders;
