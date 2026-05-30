import React, { useState, useCallback, useEffect, useRef } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { User, Bot, History, Target, Info } from 'lucide-react';
import Lobby from './components/Lobby';
import EndScreen from './components/EndScreen';
import Dice from './components/Dice';
import { getBestMove } from './ai';
import type { Piece, PlayerConfig, PlayerType, Difficulty } from './types';

// Constants
const COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
const START_OFFSETS = [0, 13, 26, 39];

// Board mapping (15x15 grid)
const PATH_COORDS: [number, number][] = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0]
];

const BASE_POSITIONS = [
    [[2, 2], [2, 3], [3, 2], [3, 3]], // Red
    [[2, 11], [2, 12], [3, 11], [3, 12]], // Blue
    [[11, 11], [11, 12], [12, 11], [12, 12]], // Yellow
    [[11, 2], [11, 3], [12, 2], [12, 3]], // Green
];

const HOME_PATHS: [number, number][][] = [
    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]], // Red
    [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]], // Blue
    [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]], // Yellow
    [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], // Green
];

const Ludo: React.FC = () => {
    const { updateXP, finishGame, setLiveScore } = usePlayStore();

    // Game State
    const [scene, setScene] = useState<'LOBBY' | 'GAME' | 'END'>('LOBBY');
    const [players, setPlayers] = useState<PlayerConfig[]>([
        { type: 'HUMAN', difficulty: 'MEDIUM', name: 'PLAYER 1' },
        { type: 'AI', difficulty: 'MEDIUM', name: 'AI ALPHA' },
        { type: 'AI', difficulty: 'MEDIUM', name: 'AI BETA' },
        { type: 'AI', difficulty: 'MEDIUM', name: 'AI GAMMA' }
    ]);

    const [pieces, setPieces] = useState<Piece[]>([]);
    const [turn, setTurn] = useState(0);
    const [dice, setDice] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [canMove, setCanMove] = useState(false);
    const [winner, setWinner] = useState<number | null>(null);
    const [logs, setLogs] = useState<string[]>(['System Ready']);
    const [hoveredPiece, setHoveredPiece] = useState<number | null>(null);

    // Stats
    const [turnsTaken, setTurnsTaken] = useState(0);
    const [captures, setCaptures] = useState(0);
    const [luckTotal, setLuckTotal] = useState(0);

    const initGame = useCallback(() => {
        const p: Piece[] = [];
        players.forEach((player, i) => {
            if (player.type !== 'EMPTY') {
                for (let j = 0; j < 4; j++) {
                    p.push({ id: i * 4 + j, progress: -1, colorIndex: i });
                }
            }
        });
        setPieces(p);
        setTurn(players.findIndex(p => p.type !== 'EMPTY'));
        setScene('GAME');
    }, [players]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const isValidMove = (p: Piece, d: number) => {
        if (p.progress === 56) return false;
        if (p.progress === -1) return d === 6;
        if (p.progress + d > 56) return false;
        return true;
    };

    const rollDice = useCallback(() => {
        if (isRolling || canMove || winner !== null) return;
        setIsRolling(true);

        setTimeout(() => {
            const val = Math.floor(Math.random() * 6) + 1;
            setDice(val);
            setIsRolling(false);
            setLuckTotal(prev => prev + val);
            setTurnsTaken(prev => prev + 1);

            const activePlayer = players[turn];
            const playable = pieces.filter(p => p.colorIndex === turn && isValidMove(p, val));

            if (playable.length > 0) {
                setCanMove(true);
                if (activePlayer.type === 'AI') {
                    setTimeout(() => {
                        const bestId = getBestMove(pieces, turn, val, activePlayer.difficulty, isValidMove);
                        if (bestId !== null) executeMove(bestId, val);
                    }, 600);
                }
            } else {
                addLog(`${activePlayer.name} rolled ${val} - Blocked`);
                setTimeout(nextTurn, 800);
            }
        }, 800);
    }, [isRolling, canMove, winner, turn, players, pieces]);

    const executeMove = (pieceId: number, rollVal: number) => {
        setPieces(prev => {
            const next = [...prev];
            const idx = next.findIndex(pi => pi.id === pieceId);
            const p = next[idx];
            let newProgress = p.progress === -1 ? 0 : p.progress + rollVal;

            // Capture logic
            if (newProgress >= 0 && newProgress <= 50) {
                const globalPos = (START_OFFSETS[p.colorIndex] + newProgress) % 52;
                if (!SAFE_ZONES.includes(globalPos)) {
                    const victimIdx = next.findIndex(pi =>
                        pi.colorIndex !== p.colorIndex &&
                        pi.progress >= 0 && pi.progress <= 50 &&
                        (START_OFFSETS[pi.colorIndex] + pi.progress) % 52 === globalPos
                    );

                    if (victimIdx !== -1) {
                        addLog(`${players[p.colorIndex].name} captured ${players[next[victimIdx].colorIndex].name}`);
                        next[victimIdx] = { ...next[victimIdx], progress: -1 };
                        setCaptures(prev => prev + 1);
                        if (p.colorIndex === 0) {
                            updateXP(150);
                            JuiceManager.shake(15);
                            JuiceManager.success();
                        }
                    }
                }
            }

            next[idx] = { ...p, progress: newProgress };

            // Win check
            const finishedCount = next.filter(pi => pi.colorIndex === turn && pi.progress === 56).length;
            if (finishedCount === 4) {
                setWinner(turn);
                setScene('END');
            }

            return next;
        });

        setCanMove(false);
        if (rollVal !== 6) setTimeout(nextTurn, 400);
        else addLog(`${players[turn].name} bonus roll`);
    };

    const nextTurn = () => {
        let next = (turn + 1) % 4;
        while (players[next].type === 'EMPTY') {
            next = (next + 1) % 4;
        }
        setTurn(next);
    };

    const getCoords = (p: Piece): [number, number] => {
        if (p.progress === -1) return BASE_POSITIONS[p.colorIndex][p.id % 4] as [number, number];
        if (p.progress >= 51) {
            if (p.progress === 56) return [7, 7];
            return HOME_PATHS[p.colorIndex][p.progress - 51] as [number, number];
        }
        const globalIdx = (START_OFFSETS[p.colorIndex] + p.progress) % 52;
        return PATH_COORDS[globalIdx];
    };

    if (scene === 'LOBBY') {
        return (
            <div className="w-full h-full flex items-center justify-center p-4">
                <Lobby
                    players={players}
                    onUpdatePlayer={(i, cfg) => setPlayers(prev => {
                        const next = [...prev];
                        next[i] = { ...next[i], ...cfg };
                        return next;
                    })}
                    onStart={initGame}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 p-4 max-w-6xl mx-auto">
            {/* Game Stats Sidebar */}
            <div className="hidden lg:flex flex-col w-64 gap-4 self-start mt-8">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 text-white/40">
                        <History size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Telemetry</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Active Node</div>
                            <div className={`text-sm font-black italic uppercase flex items-center gap-2`} style={{ color: COLORS[turn] }}>
                                {players[turn].type === 'HUMAN' ? <User size={14} /> : <Bot size={14} />}
                                {players[turn].name}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20">System Phase</div>
                            <div className="text-sm font-black text-white uppercase italic">
                                {canMove ? 'Awaiting Action' : isRolling ? 'Pulse Analysis' : 'Input Required'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-3 overflow-hidden">
                    <div className="flex items-center gap-3 text-white/40">
                        <Target size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Feed</span>
                    </div>
                    <div className="space-y-2">
                        {logs.map((m, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`text-[9px] font-black truncate uppercase ${i === 0 ? 'text-accent-gold' : 'text-white/10'}`}>
                                {m}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Board Container */}
            <div className="relative aspect-square w-full max-w-[min(85vh,600px)] bg-[#0a0a0f] rounded-[2.5rem] border border-white/10 p-1.5 shadow-2xl overflow-hidden">
                {/* Grid Background */}
                <div className="grid grid-cols-15 grid-rows-15 w-full h-full gap-1 pointer-events-none">
                    {Array.from({ length: 225 }).map((_, i) => {
                        const r = Math.floor(i / 15);
                        const c = i % 15;
                        let bg = 'bg-white/[0.01]';

                        // Bases
                        if (r < 6 && c < 6) bg = 'bg-red-500/5';
                        if (r < 6 && c > 8) bg = 'bg-blue-500/5';
                        if (r > 8 && c > 8) bg = 'bg-yellow-500/5';
                        if (r > 8 && c < 6) bg = 'bg-green-500/5';

                        // Home Paths
                        if (r === 7 && c > 0 && c < 7) bg = 'bg-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]';
                        if (c === 7 && r > 0 && r < 7) bg = 'bg-blue-500/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]';
                        if (r === 7 && c > 8 && c < 14) bg = 'bg-yellow-500/20 shadow-[inset_0_0_10px_rgba(234,179,8,0.2)]';
                        if (c === 7 && r > 8 && r < 14) bg = 'bg-green-500/20 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]';

                        // Goal Lane Entries
                        if (r === 6 && c === 1) bg = 'bg-red-500/40';
                        if (r === 1 && c === 8) bg = 'bg-blue-500/40';
                        if (r === 8 && c === 13) bg = 'bg-yellow-500/40';
                        if (r === 13 && c === 6) bg = 'bg-green-500/40';

                        // Center
                        if (r >= 6 && r <= 8 && c >= 6 && c <= 8) bg = 'bg-white/5 border border-white/10';

                        return <div key={i} className={`${bg} rounded-md transition-colors duration-500`} />;
                    })}
                </div>

                {/* Path Indicators (Safe Zones) */}
                <div className="absolute inset-0 pointer-events-none">
                    {SAFE_ZONES.map(idx => {
                        const [r, c] = PATH_COORDS[idx];
                        return (
                            <div
                                key={idx}
                                className="absolute w-[6.66%] h-[6.66%] border border-white/20 rounded-md flex items-center justify-center"
                                style={{ left: `${(c / 15) * 100}%`, top: `${(r / 15) * 100}%` }}
                            >
                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                            </div>
                        );
                    })}
                </div>

                {/* Path Preview */}
                <div className="absolute inset-0 pointer-events-none">
                    {hoveredPiece !== null && (() => {
                        const p = pieces.find(pi => pi.id === hoveredPiece);
                        if (!p) return null;
                        const nextProgress = p.progress === -1 ? 0 : p.progress + dice;
                        const [r, c] = getCoords({ ...p, progress: nextProgress });
                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 0.4, scale: 1 }}
                                className="absolute w-[6%] h-[6%] rounded-full border-2 border-dashed border-white flex items-center justify-center"
                                style={{
                                    left: `${(c / 15) * 100}%`,
                                    top: `${(r / 15) * 100}%`,
                                    backgroundColor: COLORS[p.colorIndex]
                                }}
                            >
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </motion.div>
                        );
                    })()}
                </div>

                {/* Pieces */}
                <div className="absolute inset-0 pointer-events-none">
                    {pieces.map(p => {
                        if (p.progress === 56) return null;
                        const [r, c] = getCoords(p);
                        const isTurn = turn === p.colorIndex;
                        const isSelectable = isTurn && canMove && players[turn].type === 'HUMAN' && isValidMove(p, dice);

                        return (
                            <motion.div
                                key={p.id}
                                layout
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                animate={{
                                    left: `${(c / 15) * 100}%`,
                                    top: `${(r / 15) * 100}%`,
                                    scale: isSelectable ? 1.4 : 1,
                                    zIndex: isSelectable ? 50 : 10
                                }}
                                onMouseEnter={() => isSelectable && setHoveredPiece(p.id)}
                                onMouseLeave={() => setHoveredPiece(null)}
                                onClick={() => {
                                    if (isSelectable) {
                                        setHoveredPiece(null);
                                        executeMove(p.id, dice);
                                    }
                                }}
                                className={`absolute w-[6%] h-[6%] rounded-full border-2 border-black/40 shadow-xl pointer-events-auto cursor-pointer flex items-center justify-center
                                    ${isSelectable ? 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.5)] z-50' : 'opacity-90'}`}
                                style={{ backgroundColor: COLORS[p.colorIndex] }}
                            >
                                <div className="w-2 h-2 bg-white/30 rounded-full blur-[1px]" />
                                {isSelectable && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 1 }}
                                        className="absolute inset-0 rounded-full border border-white animate-ping"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Interaction Hub */}
            <div className="flex flex-col gap-6 items-center md:items-start">
                <Dice
                    value={dice}
                    isRolling={isRolling}
                    onRoll={rollDice}
                    disabled={isRolling || canMove || players[turn].type !== 'HUMAN' || winner !== null}
                />

                <div className="md:hidden flex gap-2">
                    {logs.slice(0, 3).map((m, i) => (
                        <div key={i} className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-white/5 bg-white/5 ${i === 0 ? 'text-accent-gold' : 'text-white/20'}`}>
                            {m}
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {winner !== null && (
                    <EndScreen
                        winnerIndex={winner}
                        players={players}
                        turns={turnsTaken}
                        captures={captures}
                        luckRating={(luckTotal / turnsTaken) * 16.66} // Normalize luck
                        onReset={() => {
                            setWinner(null);
                            setTurnsTaken(0);
                            setCaptures(0);
                            setLuckTotal(0);
                            setScene('LOBBY');
                        }}
                        onExit={() => finishGame(winner === 0 ? 2000 : 500)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Ludo;
