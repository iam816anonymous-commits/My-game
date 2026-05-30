import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Connect4Logic } from './logic';
import type { Player } from './logic';

const Connect4: React.FC = () => {
  const { updateXP, finishGame, setLiveScore } = usePlayStore();
  const [board, setBoard] = useState<(Player | null)[][]>(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [turn, setTurn] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isProcessing, setIsProcessing] = useState(false);

  const dropDisc = useCallback((c: number) => {
    if (winner || isProcessing) return;

    let r = -1;
    for (let i = 5; i >= 0; i--) {
      if (!board[i][c]) { r = i; break; }
    }

    if (r === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = turn;
    setBoard(newBoard);

    const winResult = Connect4Logic.checkWin(newBoard);
    if (winResult) {
      setWinner(winResult);
      if (winResult === 1) updateXP(100);
      finishGame(1);
    } else {
      setTurn(turn === 1 ? 2 : 1);
    }
  }, [board, turn, winner, isProcessing, updateXP, finishGame]);

  useEffect(() => {
    let count = 0;
    board.forEach(row => row.forEach(cell => { if(cell) count++; }));
    setLiveScore(count);

    if (turn === 2 && !winner) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        const move = Connect4Logic.getBestMove(board, difficulty);
        dropDisc(move);
        setIsProcessing(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, board, difficulty, dropDisc]);

  const restart = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    setTurn(1);
    setWinner(null);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 touch-none">
      {/* Difficulty & Turn HUD */}
      <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 1 ? 'bg-accent-cyan shadow-[0_0_10px_#22d3ee]' : 'bg-accent-rose shadow-[0_0_10px_#f472b6]'}`} />
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{turn === 1 ? 'Your Turn' : 'AI Processing'}</div>
              </div>
          </div>
          <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d} onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                        difficulty === d ? 'bg-white text-black' : 'bg-white/5 text-white/20 hover:bg-white/10'
                    }`}
                  >
                      {d[0]}
                  </button>
              ))}
          </div>
      </div>

      {/* Board */}
      <div className="relative bg-accent-cyan/10 p-4 rounded-[2.5rem] border-4 border-white/5 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-7 gap-3">
              {board[0].map((_, c) => (
                  <button
                    key={c}
                    onClick={() => dropDisc(c)}
                    disabled={!!winner || turn === 2}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center group"
                  >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-accent-cyan animate-bounce" />
                  </button>
              ))}
              {board.map((row, r) => row.map((cell, c) => (
                  <div key={`${r}-${c}`} className="w-10 h-10 rounded-full bg-[#050816] shadow-inner flex items-center justify-center overflow-hidden">
                      <AnimatePresence>
                          {cell && (
                              <motion.div
                                initial={{ y: -300 }}
                                animate={{ y: 0 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                className={`w-8 h-8 rounded-full ${cell === 1 ? 'bg-accent-cyan shadow-[0_0_15px_#22d3ee]' : 'bg-accent-rose shadow-[0_0_15px_#f472b6]'}`}
                              />
                          )}
                      </AnimatePresence>
                  </div>
              )))}
          </div>

          <AnimatePresence>
              {winner && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[110] bg-[#050816]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                  >
                      <motion.div
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="max-w-xs w-full space-y-6"
                      >
                        <div className="space-y-1">
                            <div className={`${winner === 1 ? 'text-accent-cyan' : 'text-accent-rose'} font-black uppercase tracking-widest text-[10px]`}>
                                {winner === 1 ? 'Connected' : 'Broken'}
                            </div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Game Over</h3>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Final Logic</div>
                            <div className={`text-xl font-black uppercase tracking-widest ${winner === 1 ? 'text-accent-cyan' : 'text-accent-rose'}`}>
                                {winner === 1 ? 'Victory' : 'Offline'}
                            </div>
                        </div>

                        <button
                            onClick={restart}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${winner === 1 ? 'bg-accent-cyan text-black' : 'bg-white text-black'}`}
                        >
                            New Cycle
                        </button>
                        <button
                            onClick={() => finishGame(winner === 1 ? 1 : 0)}
                            className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                        >
                            Finalize Logic
                        </button>
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default Connect4;
