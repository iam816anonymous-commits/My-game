import React, { useState, useCallback, useEffect } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';

type Piece = {
    id: number;
    progress: number; // -1: base, 0-50: path, 51-55: home path, 56: finished
    colorIndex: number;
};

const COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];
const PLAYER_NAMES = ['HUMAN', 'AI CORE ALPHA', 'AI CORE BETA', 'AI CORE GAMMA'];

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
  const [pieces, setPieces] = useState<Piece[]>(() => {
      const p: Piece[] = [];
      for(let i=0; i<4; i++) {
          for(let j=0; j<4; j++) {
              p.push({ id: i*4+j, progress: -1, colorIndex: i });
          }
      }
      return p;
  });

  const [turn, setTurn] = useState(0);
  const [isSimulation, setIsSimulation] = useState(false);
  const [dice, setDice] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [canMove, setCanMove] = useState(false);
  const [log, setLog] = useState<string[]>(['System Online']);
  const [winner, setWinner] = useState<number | null>(null);

  const reset = useCallback(() => {
    setPieces(() => {
        const p: Piece[] = [];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                p.push({ id: i*4+j, progress: -1, colorIndex: i });
            }
        }
        return p;
    });
    setTurn(0);
    setDice(0);
    setIsRolling(false);
    setCanMove(false);
    setLog(['System Reset']);
    setWinner(null);
  }, []);

  const addLog = (msg: string) => {
    console.log(`[LUDO LOG]: ${msg}`);
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const rollDice = useCallback(() => {
      if (isRolling || canMove || winner !== null) return;

      setIsRolling(true);

      setTimeout(() => {
          const val = Math.floor(Math.random() * 6) + 1;
          setDice(val);
          setIsRolling(false);

          const playable = pieces.filter(p => p.colorIndex === turn && isValidMove(p, val));

          if (playable.length > 0) {
              // V5: Auto-Move System (Apply to Human & AI)
              if (playable.length === 1) {
                  addLog(`${PLAYER_NAMES[turn]} Auto-Executing`);
                  setTimeout(() => executeMove(playable[0].id, val), 600);
                  return;
              }

              setCanMove(true);
              // AI logic for multiple pieces
              if (turn !== 0 || isSimulation) {
                  // Strategy: Prioritize capture, then goal entry, then most advanced
                  const bestPiece = playable.sort((a, b) => {
                      // Check capture potential
                      const aGlobal = (START_OFFSETS[a.colorIndex] + a.progress + val) % 52;
                      const bGlobal = (START_OFFSETS[b.colorIndex] + b.progress + val) % 52;
                      const aCanCapture = pieces.some(pi => pi.colorIndex !== a.colorIndex && pi.progress >= 0 && pi.progress <= 50 && (START_OFFSETS[pi.colorIndex] + pi.progress) % 52 === aGlobal);
                      const bCanCapture = pieces.some(pi => pi.colorIndex !== b.colorIndex && pi.progress >= 0 && pi.progress <= 50 && (START_OFFSETS[pi.colorIndex] + pi.progress) % 52 === bGlobal);

                      if (aCanCapture && !bCanCapture) return -1;
                      if (bCanCapture && !aCanCapture) return 1;

                      // Prioritize finishing
                      if (a.progress + val === 56) return -1;
                      if (b.progress + val === 56) return 1;

                      return b.progress - a.progress;
                  })[0];

                  setTimeout(() => {
                      executeMove(bestPiece.id, val);
                  }, 600);
              }
          } else {
              addLog(`${PLAYER_NAMES[turn]} Sequence Blocked (${val})`);
              setTimeout(() => {
                  console.log(`[LUDO] No moves possible. Ending turn for Player ${turn}.`);
                  setTurn((turn + 1) % 4);
              }, 1000);
          }
      }, 800);
  }, [isRolling, canMove, turn, pieces, winner]);

  const isValidMove = (p: Piece, d: number) => {
      if (p.progress === 56) return false;
      if (p.progress === -1) return d === 6;
      if (p.progress + d > 56) return false;
      return true;
  };

  const executeMove = (pieceId: number, rollVal: number) => {
      console.log(`[LUDO] Executing move: Piece ${pieceId} by Player ${turn} (Roll: ${rollVal})`);
      let captureOccurred = false;
      setDice(0); // V12: Reset dice visually during movement
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
                      addLog(`${PLAYER_NAMES[p.colorIndex]} captured ${PLAYER_NAMES[next[victimIdx].colorIndex]}`);
                      next[victimIdx] = { ...next[victimIdx], progress: -1 };
                      if (p.colorIndex === 0) {
                          updateXP(200);
                          JuiceManager.shake(15);
                          JuiceManager.success();
                      }
                  }
              }
          }

          next[idx] = { ...p, progress: newProgress };

          // Win check for player
          const finishedCount = next.filter(pi => pi.colorIndex === turn && pi.progress === 56).length;
          if (finishedCount === 4) setWinner(turn);

          return next;
      });

      setCanMove(false);
      if (rollVal === 6 || captureOccurred) {
          console.log(`[LUDO] Player ${turn} awarded bonus roll (Roll: ${rollVal}, Capture: ${captureOccurred}).`);
          addLog(`${PLAYER_NAMES[turn]} Bonus Cycle`);
      } else {
          console.log(`[LUDO] Move complete. Next turn.`);
          setTurn((turn + 1) % 4);
      }
  };

  const getCoords = (p: Piece): [number, number] => {
      if (p.progress === -1) return BASE_POSITIONS[p.colorIndex][p.id % 4] as [number, number];
      if (p.progress >= 51) {
          if (p.progress === 56) return [7, 7]; // Center
          return HOME_PATHS[p.colorIndex][p.progress - 51] as [number, number];
      }
      const globalIdx = (START_OFFSETS[p.colorIndex] + p.progress) % 52;
      return PATH_COORDS[globalIdx];
  };

  // AI Automation Effect
  useEffect(() => {
    const isAITurn = turn !== 0 || isSimulation;
    if (isAITurn && !isRolling && !canMove && winner === null) {
        console.log(`[LUDO] AI/Simulation Turn Detection: Player ${turn} active. Triggering auto-roll.`);
        const timer = setTimeout(rollDice, isSimulation ? 200 : 1000);
        return () => clearTimeout(timer);
    }
  }, [turn, isRolling, canMove, winner, rollDice, dice, isSimulation]);

  useEffect(() => {
    const humanPieces = pieces.filter(p => p.colorIndex === 0);
    const progressSum = humanPieces.reduce((acc, p) => acc + (p.progress === -1 ? 0 : p.progress), 0);
    setLiveScore(progressSum);
  }, [pieces]);

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-8 w-full max-w-7xl animate-in fade-in duration-500 min-h-[600px]">
      {/* Game Board - Priority Rebuild (70% Attention) */}
      <div className="relative aspect-square w-full lg:w-[70%] bg-[#0a0a0f] rounded-[3rem] border-2 border-white/10 p-4 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="grid grid-cols-15 grid-rows-15 w-full h-full gap-1 pointer-events-none p-2">
              {Array.from({ length: 225 }).map((_, i) => {
                  const r = Math.floor(i / 15);
                  const c = i % 15;
                  let bg = 'bg-white/[0.03]';

                  // Base areas
                  if (r < 6 && c < 6) bg = 'bg-red-500/10 border border-red-500/20';
                  if (r < 6 && c > 8) bg = 'bg-blue-500/10 border border-blue-500/20';
                  if (r > 8 && c > 8) bg = 'bg-yellow-500/10 border border-yellow-500/20';
                  if (r > 8 && c < 6) bg = 'bg-green-500/10 border border-green-500/20';

                  // Home paths
                  if (r === 7 && c > 0 && c < 7) bg = 'bg-red-500/40 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
                  if (c === 7 && r > 0 && r < 7) bg = 'bg-blue-500/40 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
                  if (r === 7 && c > 7 && c < 14) bg = 'bg-yellow-500/40 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
                  if (c === 7 && r > 7 && r < 14) bg = 'bg-green-500/40 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]';

                  // Special spots
                  const globalIdx = PATH_COORDS.findIndex(([pr, pc]) => pr === r && pc === c);
                  if (SAFE_ZONES.includes(globalIdx)) bg = 'bg-white/10 ring-1 ring-white/20';

                  return <div key={i} className={`${bg} rounded-md transition-all duration-500`} />;
              })}
          </div>

          {/* Premium Center Hub */}
          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] z-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl transform rotate-45 shadow-[0_0_40px_rgba(255,255,255,0.1)]" />
              <div className="relative z-30 flex flex-col items-center justify-center scale-75 lg:scale-100">
                  <div className="grid grid-cols-2 gap-1">
                      {COLORS.map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: c, color: c }} />
                      ))}
                  </div>
              </div>
          </div>

          {/* Pieces */}
          <div className="absolute inset-0 pointer-events-none z-30 p-2">
              {pieces.map(p => {
                  if (p.progress === 56) return null;
                  const [r, c] = getCoords(p);
                  const isSelectable = turn === 0 && canMove && p.colorIndex === turn && isValidMove(p, dice);

                  // Smart Assist (V5)
                  const isRecommended = isSelectable && (() => {
                    const globalIdx = (START_OFFSETS[p.colorIndex] + p.progress + dice) % 52;
                    const canCapture = pieces.some(pi => pi.colorIndex !== p.colorIndex && pi.progress >= 0 && pi.progress <= 50 && (START_OFFSETS[pi.colorIndex] + pi.progress) % 52 === globalIdx);
                    const isGoal = p.progress + dice === 56;
                    return canCapture || isGoal;
                  })();

                  return (
                      <motion.div
                        key={p.id}
                        layout
                        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                        animate={{
                            left: `${(c / 15) * 100}%`,
                            top: `${(r / 15) * 100}%`,
                            scale: isSelectable ? 1.4 : 1.1,
                            boxShadow: isRecommended ? [`0 0 10px ${COLORS[p.colorIndex]}`, `0 0 30px ${COLORS[p.colorIndex]}`] : `0 0 20px rgba(0,0,0,0.4)`
                        }}
                        onClick={() => isSelectable && executeMove(p.id, dice)}
                        className={`absolute w-[6%] h-[6%] rounded-full border-2 border-white/30 shadow-2xl pointer-events-auto cursor-pointer flex items-center justify-center
                            ${isSelectable ? 'z-50' : 'z-10 opacity-90'}`}
                        style={{ backgroundColor: COLORS[p.colorIndex] }}
                      >
                          <div className="w-1 h-1 bg-white/20 rounded-full" />
                      </motion.div>
                  );
              })}
          </div>

          <AnimatePresence>
              {winner !== null && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[110] bg-[#050816]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                  >
                      <motion.div
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="max-w-xs w-full space-y-6"
                      >
                        <div className="space-y-1">
                            <div className={`${winner === 0 ? 'text-accent-gold' : 'text-accent-rose'} font-black uppercase tracking-widest text-[10px]`}>
                                {winner === 0 ? 'Mastery' : 'Interrupted'}
                            </div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Game Over</h3>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Cycle Victor</div>
                            <div className="text-lg font-black text-white uppercase tabular-nums">{PLAYER_NAMES[winner]}</div>
                        </div>

                        <button
                            onClick={reset}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${winner === 0 ? 'bg-accent-gold text-black' : 'bg-white text-black'}`}
                        >
                            New Cycle
                        </button>
                        <button
                            onClick={() => finishGame(winner === 0 ? 1000 : 0)}
                            className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                        >
                            Finalize Session
                        </button>
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      {/* Sidebar Controls - Reduced Width (30%) */}
      <div className="flex-1 w-full lg:w-[30%] space-y-6 flex flex-col">
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 space-y-8 flex-1">
              <div className="flex gap-4 items-center">
                  <div
                    onClick={() => setIsSimulation(!isSimulation)}
                    className={`flex-1 p-6 rounded-[2rem] border transition-all flex items-center justify-between cursor-pointer ${turn === 0 ? 'bg-accent-cyan/10 border-accent-cyan/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/5 opacity-50'} ${isSimulation ? 'ring-2 ring-accent-rose animate-pulse' : ''}`}>
                      <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Active Entity</div>
                          <div className="text-sm font-black italic text-white">{PLAYER_NAMES[turn]}</div>
                      </div>
                      {turn === 0 ? <User size={20} className="text-accent-cyan" /> : <Bot size={20} className="text-white/40" />}
                  </div>
              </div>

              <div className="flex items-center gap-6 py-8 border-y border-white/5">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={canMove || isRolling || turn !== 0 || winner !== null}
                    onClick={rollDice}
                    className={`w-24 h-24 rounded-[2rem] border-2 flex items-center justify-center text-4xl font-black italic shadow-2xl transition-all
                        ${canMove || isRolling || turn !== 0 ? 'bg-white/5 border-white/10 text-white/10' : 'bg-white border-white text-black shadow-white/20 hover:scale-105 active:scale-95'}`}
                  >
                      <AnimatePresence mode="wait">
                          <motion.div
                            key={dice}
                            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                            animate={{ rotate: 0, scale: 1, opacity: 1 }}
                            className={isRolling ? 'animate-spin' : ''}
                          >
                              {dice || '?'}
                          </motion.div>
                      </AnimatePresence>
                  </motion.button>
                  <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Operational Protocol</p>
                      <p className="text-xs font-bold text-white/60 leading-relaxed uppercase">
                          {isRolling ? 'Rolling Core...' : canMove ? 'Awaiting Piece Selection' : 'Pulse to initiate sequence'}
                      </p>
                  </div>
              </div>

              <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">System Event Log</p>
                  <div className="space-y-2">
                      {log.map((m, i) => (
                        <div key={i} className={`text-xs font-bold px-4 py-3 rounded-xl transition-all ${i === 0 ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 opacity-50'}`}>
                            {m}
                        </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Ludo;
