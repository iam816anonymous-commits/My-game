import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { User, Bot, AlertCircle, Play, Settings, Users, Brain, Info, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
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

  // V2 Rebuild State
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [playerCount, setPlayerCount] = useState(1);
  const [useAI, setUseAI] = useState(true);
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
    const newPlayers: Player[] = [];

    // Add Main Player
    newPlayers.push({
        id: 0,
        name: 'PLAYER 1',
        type: 'human',
        position: 1,
        color: COLORS[0],
        stats: { laddersClimbed: 0, snakesHit: 0, biggestJump: 0, biggestFall: 0, totalTurns: 0, luckRating: 0 }
    });

    // Add other players
    for (let i = 1; i < playerCount; i++) {
        newPlayers.push({
            id: i,
            name: `PLAYER ${i + 1}`,
            type: 'human',
            position: 1,
            color: COLORS[i],
            stats: { laddersClimbed: 0, snakesHit: 0, biggestJump: 0, biggestFall: 0, totalTurns: 0, luckRating: 0 }
        });
    }

    // Fill with AI if requested
    if (useAI && newPlayers.length < 4) {
        const aiNeeded = 4 - newPlayers.length;
        for (let i = 0; i < aiNeeded; i++) {
            const id = newPlayers.length;
            newPlayers.push({
                id,
                name: `AI CORE ${String.fromCharCode(65 + i)}`,
                type: 'ai',
                personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
                position: 1,
                color: COLORS[id],
                stats: { laddersClimbed: 0, snakesHit: 0, biggestJump: 0, biggestFall: 0, totalTurns: 0, luckRating: 0 }
            });
        }
    }

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
        JuiceManager.shake(5);
        await new Promise(r => setTimeout(r, 600));
        nextTurn();
        return;
    }

    // Movement Preview
    setPreviewPos(targetPos);
    await new Promise(r => setTimeout(r, 400));

    // Step-by-step movement (V2)
    for (let i = currentPos + 1; i <= targetPos; i++) {
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: i } : p));
        JuiceManager.shake(1); // Micro-shake for steps
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
            JuiceManager.shake(10);
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
  }, [players, gameState]);

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
  }, [currentTurn, players, gameState, isRolling]);

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
            const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 15;
            const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 15;
            return { type: 'snake', from, x1, y1, x2, y2, midX, midY };
        }
    });
  }, []);

  const ConnectorLayer = () => {
    return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="ladderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
                <linearGradient id="snakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#DB2777" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="0.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            {connectors.map((c) => {
                if (c.type === 'ladder') {
                    const offset = 1.5;
                    return (
                        <g key={`l-${c.from}`} opacity="0.6">
                            <line x1={c.x1-offset} y1={c.y1} x2={c.x2-offset} y2={c.y2} stroke="url(#ladderGrad)" strokeWidth="0.8" strokeLinecap="round" />
                            <line x1={c.x1+offset} y1={c.y1} x2={c.x2+offset} y2={c.y2} stroke="url(#ladderGrad)" strokeWidth="0.8" strokeLinecap="round" />
                            {[0.2, 0.4, 0.6, 0.8].map(t => (
                                <line
                                    key={t}
                                    x1={(c.x1-offset)*(1-t) + (c.x2-offset)*t}
                                    y1={c.y1*(1-t) + c.y2*t}
                                    x2={(c.x1+offset)*(1-t) + (c.x2+offset)*t}
                                    y2={c.y1*(1-t) + c.y2*t}
                                    stroke="url(#ladderGrad)"
                                    strokeWidth="0.4"
                                />
                            ))}
                        </g>
                    );
                } else {
                    const d = `M ${c.x1} ${c.y1} Q ${c.midX} ${c.midY} ${c.x2} ${c.y2}`;
                    return (
                        <g key={`s-${c.from}`} opacity="0.7">
                            <path d={d} stroke="url(#snakeGrad)" strokeWidth="1.2" fill="none" strokeLinecap="round" filter="url(#glow)" />
                            <circle cx={c.x1} cy={c.y1} r="1" fill="#F472B6" />
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
        <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 p-12 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl">
            <div className="text-center space-y-2">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Prism <span className="text-accent-rose">Ladders</span></h1>
                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Operational Configuration</p>
            </div>

            <div className="w-full space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <Users size={14} /> Human Presence
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(count => (
                            <button
                                key={count}
                                onClick={() => setPlayerCount(count)}
                                className={`py-4 rounded-2xl font-black transition-all ${playerCount === count ? 'bg-accent-rose text-black shadow-lg shadow-accent-rose/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <Brain size={14} /> AI Occupancy
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setUseAI(true)}
                            className={`flex-1 py-4 rounded-2xl font-black transition-all ${useAI ? 'bg-accent-cyan text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            Enabled
                        </button>
                        <button
                            onClick={() => setUseAI(false)}
                            className={`flex-1 py-4 rounded-2xl font-black transition-all ${!useAI ? 'bg-accent-cyan text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            None
                        </button>
                    </div>
                    {useAI && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
                            <Info size={16} className="text-accent-cyan shrink-0 mt-0.5" />
                            <p className="text-[10px] text-white/40 font-medium leading-relaxed">Empty sectors will be populated by AI entities with randomized neural personalities.</p>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={initGame}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-[2rem] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-white/10"
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
        <div className="relative aspect-square w-full max-w-[min(80vw,500px)] bg-black/40 rounded-3xl border border-white/10 p-2 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-10 grid-rows-10 w-full h-full relative z-10">
                {Array.from({ length: 100 }).map((_, i) => {
                    const id = i + 1;
                    const { x, y } = getCoords(id);
                    const isSpecial = MAP[id];
                    const isPreview = previewPos === id;
                    return (
                        <div
                            key={id}
                            className={`absolute w-[10%] h-[10%] border border-white/5 flex flex-col items-center justify-center transition-all duration-300 ${isSpecial ? (MAP[id] > id ? 'bg-accent-cyan/5' : 'bg-accent-rose/5') : ''} ${isPreview ? 'bg-white/20 z-20 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]' : ''}`}
                            style={{ left: `${x * 10}%`, top: `${y * 10}%` }}
                        >
                            <span className={`text-[10px] font-black select-none transition-colors ${isPreview ? 'text-white' : 'text-white/10'}`}>{id}</span>
                            {id === 100 && <div className="absolute inset-0 bg-accent-cyan/10 animate-pulse" />}
                            {isPreview && (
                                <motion.div
                                    layoutId="preview"
                                    className="absolute inset-1 border-2 border-white/50 rounded-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
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
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isRolling ? 'animate-bounce' : ''} bg-white/10 border border-white/20 shadow-inner`}>
                       {dice === 1 && <Dice1 className="text-white" size={32} />}
                       {dice === 2 && <Dice2 className="text-white" size={32} />}
                       {dice === 3 && <Dice3 className="text-white" size={32} />}
                       {dice === 4 && <Dice4 className="text-white" size={32} />}
                       {dice === 5 && <Dice5 className="text-white" size={32} />}
                       {dice === 6 && <Dice6 className="text-white" size={32} />}
                    </div>
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
