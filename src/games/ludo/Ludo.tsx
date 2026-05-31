import React, { useState, useCallback, useEffect } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { User, Bot, Play, Users, Brain, Info, RefreshCw, Trophy, Target, Zap, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { evaluateAIMove, type AIDifficulty, type LudoPiece } from './ai';

const COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];
const PLAYER_NAMES = ['RED', 'BLUE', 'YELLOW', 'GREEN'];

// Board mapping (15x15 grid)
const BASE_POSITIONS = [
    [[2, 2], [2, 3], [3, 2], [3, 3]], // Red
    [[2, 11], [2, 12], [3, 11], [3, 12]], // Blue
    [[11, 11], [11, 12], [12, 11], [12, 12]], // Yellow
    [[11, 2], [11, 3], [12, 2], [12, 3]], // Green
];

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

const START_OFFSETS = [0, 13, 26, 39];
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47]; // Global indices

const HOME_PATHS: [number, number][][] = [
    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]], // Red
    [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]], // Blue
    [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]], // Yellow
    [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], // Green
];

const Ludo: React.FC = () => {
  const { updateXP, finishGame, setLiveScore } = usePlayStore();

  // V3 State
  const [lobbyState, setLobbyState] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [config, setConfig] = useState<('human' | 'ai' | 'empty')[]>(['human', 'ai', 'empty', 'empty']);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');

  const [pieces, setPieces] = useState<LudoPiece[]>([]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [canMove, setCanMove] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({
      turns: 0,
      captures: 0,
      safeVisits: 0,
      rolls: [] as number[],
      bestMoveDesc: 'None'
  });

  const initGame = () => {
      const p: LudoPiece[] = [];
      config.forEach((type, colorIdx) => {
          if (type !== 'empty') {
              for (let j = 0; j < 4; j++) {
                  p.push({ id: colorIdx * 4 + j, progress: -1, colorIndex: colorIdx });
              }
          }
      });
      setPieces(p);
      setTurn(config.findIndex(c => c !== 'empty'));
      setLobbyState('playing');
      setLog(['Prism Network Established']);
  };

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 5));

  const rollDice = useCallback(() => {
      if (isRolling || canMove || winner !== null) return;
      setIsRolling(true);
      JuiceManager.shake(2);

      setTimeout(() => {
          const val = Math.floor(Math.random() * 6) + 1;
          setDice(val);
          setIsRolling(false);
          setStats(s => ({ ...s, rolls: [...s.rolls, val] }));

          const playable = pieces.filter(p => p.colorIndex === turn && isValidMove(p, val));
          if (playable.length > 0) {
              setCanMove(true);
              if (config[turn] === 'ai') {
                  setTimeout(() => {
                      const bestId = evaluateAIMove({ pieces, turn, dice: val, safeZones: SAFE_ZONES, startOffsets: START_OFFSETS }, difficulty);
                      if (bestId !== -1) executeMove(bestId, val);
                  }, 600);
              }
          } else {
              addLog(`${PLAYER_NAMES[turn]} Sequence Blocked (${val})`);
              setTimeout(nextTurn, 800);
          }
      }, 600);
  }, [isRolling, canMove, turn, pieces, winner, config, difficulty]);

  const isValidMove = (p: LudoPiece, d: number) => {
      if (p.progress === 56) return false;
      if (p.progress === -1) return d === 6;
      if (p.progress + d > 56) return false;
      return true;
  };

  const executeMove = (pieceId: number, rollVal: number) => {
      let captureOccurred = false;
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
                      captureOccurred = true;
                      addLog(`${PLAYER_NAMES[p.colorIndex]} Dissolved ${PLAYER_NAMES[next[victimIdx].colorIndex]}`);
                      next[victimIdx] = { ...next[victimIdx], progress: -1 };
                      if (config[p.colorIndex] === 'human') {
                          updateXP(200);
                          JuiceManager.shake(15);
                          JuiceManager.success();
                          setStats(s => ({ ...s, captures: s.captures + 1, bestMoveDesc: `Captured ${PLAYER_NAMES[next[victimIdx].colorIndex]}` }));
                      }
                  }
              } else {
                  if (config[p.colorIndex] === 'human') setStats(s => ({ ...s, safeVisits: s.safeVisits + 1 }));
              }
          }

          next[idx] = { ...p, progress: newProgress };

          // Win check
          const finishedCount = next.filter(pi => pi.colorIndex === turn && pi.progress === 56).length;
          if (finishedCount === 4) {
              setWinner(turn);
              setLobbyState('gameover');
          }

          return next;
      });

      setCanMove(false);
      if (rollVal === 6 || captureOccurred) {
          addLog(`${PLAYER_NAMES[turn]} Bonus Cycle`);
          JuiceManager.success();
      } else {
          nextTurn();
      }
  };

  const nextTurn = () => {
      setStats(s => ({ ...s, turns: s.turns + 1 }));
      let next = (turn + 1) % 4;
      while (config[next] === 'empty' && next !== turn) {
          next = (next + 1) % 4;
      }
      setTurn(next);
  };

  const getCoords = (p: LudoPiece): [number, number] => {
      if (p.progress === -1) return BASE_POSITIONS[p.colorIndex][p.id % 4] as [number, number];
      if (p.progress >= 51) {
          if (p.progress === 56) return [7, 7];
          return HOME_PATHS[p.colorIndex][p.progress - 51] as [number, number];
      }
      const globalIdx = (START_OFFSETS[p.colorIndex] + p.progress) % 52;
      return PATH_COORDS[globalIdx];
  };

  useEffect(() => {
    const humanPieces = pieces.filter(p => config[p.colorIndex] === 'human');
    const progressSum = humanPieces.reduce((acc, p) => acc + (p.progress === -1 ? 0 : p.progress), 0);
    setLiveScore(progressSum);
  }, [pieces, config, setLiveScore]);

  if (lobbyState === 'setup') {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 p-10 bg-[#0a0a0f] rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500" />

            <div className="text-center space-y-2">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Neon <span className="text-red-500">Ludo</span></h1>
                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Neural Circuit Navigation</p>
            </div>

            <div className="w-full space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Participant Nodes</span>
                        <span className="text-[9px] font-black uppercase text-red-500 flex items-center gap-1"><Users size={12} /> 1-4 SLOTS</span>
                    </div>
                    <div className="space-y-2">
                        {config.map((type, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${type !== 'empty' ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-40'}`}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-lg" style={{ backgroundColor: COLORS[i], color: '#000' }}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <div className="flex-1 grid grid-cols-3 gap-1">
                                    {(['human', 'ai', 'empty'] as const).map(opt => (
                                        <button
                                            key={opt}
                                            disabled={i === 0 && opt !== 'human'}
                                            onClick={() => {
                                                const next = [...config];
                                                next[i] = opt;
                                                setConfig(next);
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

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <Brain size={14} /> AI Complexity
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${difficulty === d ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/40'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={initGame}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10"
            >
                <Play size={20} fill="currentColor" /> Initialize Core
            </button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-6">
      <div className="flex gap-4 w-full max-w-sm">
          <div className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-between shadow-2xl ${turn === 0 ? 'bg-red-500/10 border-red-500/50 shadow-red-500/10' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs" style={{ backgroundColor: COLORS[turn], color: '#000' }}>
                      {String.fromCharCode(65 + turn)}
                  </div>
                  <div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5">Active Core</div>
                      <div className="text-[10px] font-black italic text-white flex items-center gap-1">
                          {config[turn] === 'human' ? <User size={10} /> : <Bot size={10} />}
                          {PLAYER_NAMES[turn]}
                      </div>
                  </div>
              </div>
          </div>
          <div className="w-24 p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Dice</div>
              <div className="text-2xl font-black italic text-white tabular-nums">{dice || '?'}</div>
          </div>
      </div>

      {/* Board */}
      <div className="relative w-full max-w-md aspect-square bg-[#0a0a0f] rounded-[2rem] border border-white/10 p-1 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-15 grid-rows-15 w-full h-full gap-0.5 pointer-events-none">
              {Array.from({ length: 225 }).map((_, i) => {
                  const r = Math.floor(i / 15);
                  const c = i % 15;
                  let bg = 'bg-white/[0.02]';

                  // Highlight Path
                  const isPath = PATH_COORDS.some(pc => pc[0] === r && pc[1] === c);
                  if (isPath) bg = 'bg-white/[0.05]';

                  // Safe Zones
                  const globalIdx = PATH_COORDS.findIndex(pc => pc[0] === r && pc[1] === c);
                  if (globalIdx !== -1 && SAFE_ZONES.includes(globalIdx)) bg = 'bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]';

                  // Base areas
                  if (r < 6 && c < 6) bg = 'bg-red-500/10';
                  if (r < 6 && c > 8) bg = 'bg-blue-500/10';
                  if (r > 8 && c > 8) bg = 'bg-yellow-500/10';
                  if (r > 8 && c < 6) bg = 'bg-green-500/10';

                  // Home lanes
                  HOME_PATHS.forEach((path, ci) => {
                      if (path.some(pc => pc[0] === r && pc[1] === c)) {
                          const laneColors = ['bg-red-500/30', 'bg-blue-500/30', 'bg-yellow-500/30', 'bg-green-500/30'];
                          bg = laneColors[ci];
                      }
                  });

                  if (r === 7 && c === 7) bg = 'bg-white/20 animate-pulse';

                  return <div key={i} className={`${bg} rounded-sm border border-white/[0.02]`} />;
              })}
          </div>

          {/* Pieces */}
          <div className="absolute inset-0 pointer-events-none">
              {pieces.map(p => {
                  if (p.progress === 56) return null;
                  const [r, c] = getCoords(p);
                  const isSelectable = config[turn] === 'human' && canMove && p.colorIndex === turn && isValidMove(p, dice);
                  return (
                      <motion.div
                        key={p.id}
                        layout
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        animate={{ left: `${(c / 15) * 100}%`, top: `${(r / 15) * 100}%`, scale: isSelectable ? 1.25 : 1 }}
                        onClick={() => isSelectable && executeMove(p.id, dice)}
                        className={`absolute w-[5.5%] h-[5.5%] rounded-full border border-black/50 shadow-lg pointer-events-auto cursor-pointer flex items-center justify-center transition-all
                            ${isSelectable ? 'ring-4 ring-white shadow-[0_0_15px_white] z-50' : 'z-10 opacity-90'}`}
                        style={{ backgroundColor: COLORS[p.colorIndex] }}
                      >
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                          {isSelectable && <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 rounded-full border-2 border-white" />}
                      </motion.div>
                  );
              })}
          </div>

          <AnimatePresence>
              {lobbyState === 'gameover' && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[110] bg-[#050816]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                  >
                      <motion.div
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="max-w-md w-full space-y-8"
                      >
                        <div className="space-y-2">
                            <div className="text-accent-gold font-black uppercase tracking-[0.3em] text-[10px]">Session Terminated</div>
                            <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Dominion Established</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[8px] font-black uppercase text-white/20 mb-1">Cycle Victor</div>
                                <div className="text-lg font-black text-white">{PLAYER_NAMES[winner!]}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[8px] font-black uppercase text-white/20 mb-1">Turns Elapsed</div>
                                <div className="text-lg font-black text-white">{stats.turns}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[8px] font-black uppercase text-white/20 mb-1">AI Complexity</div>
                                <div className="text-lg font-black text-white">{difficulty}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-[8px] font-black uppercase text-white/20 mb-1">Valued Action</div>
                                <div className="text-[10px] font-black text-accent-gold uppercase leading-tight">{stats.bestMoveDesc}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { icon: <Target size={12} />, label: 'Dissolved', val: stats.captures },
                                { icon: <Shield size={12} />, label: 'Shielded', val: stats.safeVisits },
                                { icon: <Zap size={12} />, label: 'Luck', val: stats.rolls.length > 0 ? `${Math.round(stats.rolls.reduce((a,b)=>a+b,0)/stats.rolls.length*20)}%` : '0%' }
                            ].map((s, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-center gap-1 text-[8px] font-black uppercase text-white/20 mb-1">{s.icon} {s.label}</div>
                                    <div className="text-sm font-black text-white">{s.val}</div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4">
                            <button
                                onClick={() => setLobbyState('setup')}
                                className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Initiate New Cycle
                            </button>
                            <button
                                onClick={() => finishGame(winner === config.findIndex(c => c === 'human') ? 1000 : 0)}
                                className="w-full py-4 text-white/40 font-black uppercase tracking-widest text-[9px] hover:text-white transition-colors"
                            >
                                Finalize Session
                            </button>
                        </div>
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <div className="flex gap-4 items-center w-full max-w-sm">
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={canMove || isRolling || config[turn] !== 'human' || winner !== null}
            onClick={rollDice}
            className={`w-24 h-24 rounded-3xl border flex items-center justify-center text-4xl font-black italic shadow-xl transition-all shrink-0
                ${canMove || isRolling || config[turn] !== 'human' ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-white text-black shadow-white/20 hover:scale-105'}`}
          >
              <AnimatePresence mode="wait">
                  <motion.div key={dice} initial={{ rotate: -45, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} className={isRolling ? 'animate-bounce' : ''}>
                      {dice || '?'}
                  </motion.div>
              </AnimatePresence>
          </motion.button>

          <div className="flex-1 h-24 bg-white/5 rounded-3xl border border-white/5 p-4 overflow-hidden space-y-1.5 shadow-inner">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/10 mb-1 flex items-center gap-1"><Clock size={8} /> Event Stream</div>
              {log.map((m, i) => (
                  <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={i} className={`text-[9px] font-black truncate uppercase ${i === 0 ? 'text-red-500' : 'text-white/20'}`}>
                      {m}
                  </motion.div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Ludo;
