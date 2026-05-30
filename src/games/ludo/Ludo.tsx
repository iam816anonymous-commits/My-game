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

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 5));

  const rollDice = useCallback(() => {
      if (isRolling || canMove || winner !== null) return;
      setIsRolling(true);
      setTimeout(() => {
          const val = Math.floor(Math.random() * 6) + 1;
          setDice(val);
          setIsRolling(false);

          const playable = pieces.filter(p => p.colorIndex === turn && isValidMove(p, val));
          if (playable.length > 0) {
              setCanMove(true);
              // AI logic
              if (turn !== 0) {
                  setTimeout(() => {
                      const bestPiece = playable.sort((a, b) => b.progress - a.progress)[0];
                      executeMove(bestPiece.id, val);
                  }, 400); // V11: Faster AI turns
              }
          } else {
              addLog(`${PLAYER_NAMES[turn]} rolled ${val} - Blocked`);
              setTimeout(() => setTurn((turn + 1) % 4), 800);
          }
      }, 600);
  }, [isRolling, canMove, turn, pieces, winner]);

  const isValidMove = (p: Piece, d: number) => {
      if (p.progress === 56) return false;
      if (p.progress === -1) return d === 6;
      if (p.progress + d > 56) return false;
      return true;
  };

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
      if (rollVal !== 6) setTurn((turn + 1) % 4);
      else addLog(`${PLAYER_NAMES[turn]} bonus roll`);
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

  useEffect(() => {
    const humanPieces = pieces.filter(p => p.colorIndex === 0);
    const progressSum = humanPieces.reduce((acc, p) => acc + (p.progress === -1 ? 0 : p.progress), 0);
    setLiveScore(progressSum);
  }, [pieces]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-6">
      <div className="flex gap-4 w-full max-w-sm">
          <div className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-between ${turn === 0 ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Active Core</div>
                  <div className="text-[10px] font-black italic text-white">{PLAYER_NAMES[turn]}</div>
              </div>
              {turn === 0 ? <User size={16} className="text-red-500" /> : <Bot size={16} className="text-white/20" />}
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
                  // Detailed board coloring could go here
                  if (r < 6 && c < 6) bg = 'bg-red-500/5';
                  if (r < 6 && c > 8) bg = 'bg-blue-500/5';
                  if (r > 8 && c > 8) bg = 'bg-yellow-500/5';
                  if (r > 8 && c < 6) bg = 'bg-green-500/5';
                  return <div key={i} className={`${bg} rounded-sm`} />;
              })}
          </div>

          {/* Pieces */}
          <div className="absolute inset-0 pointer-events-none">
              {pieces.map(p => {
                  if (p.progress === 56) return null;
                  const [r, c] = getCoords(p);
                  const isSelectable = turn === 0 && canMove && p.colorIndex === turn && isValidMove(p, dice);
                  return (
                      <motion.div
                        key={p.id}
                        layout
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        animate={{ left: `${(c / 15) * 100}%`, top: `${(r / 15) * 100}%`, scale: isSelectable ? 1.25 : 1 }}
                        onClick={() => isSelectable && executeMove(p.id, dice)}
                        className={`absolute w-[5.5%] h-[5.5%] rounded-full border border-black/50 shadow-lg pointer-events-auto cursor-pointer flex items-center justify-center
                            ${isSelectable ? 'ring-4 ring-white shadow-white/50 z-50' : 'z-10 opacity-80'}`}
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

      <div className="flex gap-4 items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={canMove || isRolling || turn !== 0 || winner !== null}
            onClick={rollDice}
            className={`w-24 h-24 rounded-3xl border flex items-center justify-center text-4xl font-black italic shadow-xl transition-all
                ${canMove || isRolling || turn !== 0 ? 'bg-white/5 border-white/10 text-white/20' : 'bg-accent-gold border-accent-gold text-black shadow-accent-gold/40 hover:scale-105'}`}
          >
              <AnimatePresence mode="wait">
                  <motion.div key={dice} initial={{ rotate: -45, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} className={isRolling ? 'animate-bounce' : ''}>
                      {dice || '?'}
                  </motion.div>
              </AnimatePresence>
          </motion.button>

          <div className="flex-1 max-w-[200px] h-24 bg-white/5 rounded-2xl border border-white/5 p-4 overflow-hidden space-y-1">
              {log.map((m, i) => <div key={i} className={`text-[10px] font-black truncate uppercase ${i === 0 ? 'text-accent-gold' : 'text-white/20'}`}>{m}</div>)}
          </div>
      </div>
    </div>
  );
};

export default Ludo;
