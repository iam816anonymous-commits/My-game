import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Trophy, History, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessAI } from './ai';

const ChessGame: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ w: string[], b: string[] }>({ w: [], b: [] });
  const [lastMove, setLastMove] = useState<{ from: string, to: string } | null>(null);

  const validMoves = useMemo(() => {
      if (!selectedSquare) return [];
      return game.moves({ square: selectedSquare, verbose: true }).map(m => m.to);
  }, [game, selectedSquare]);

  const makeMove = useCallback((move: any) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory(h => [...h, result.san]);
        setLastMove({ from: result.from, to: result.to });

        // Handle captured pieces
        if (result.captured) {
            const color = result.color === 'w' ? 'b' : 'w';
            setCapturedPieces(prev => ({
                ...prev,
                [color]: [...prev[color as keyof typeof prev], result.captured!]
            }));
            updateXP(50);
        }

        if (game.isGameOver()) {
            finishGame(moveHistory.length);
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, moveHistory.length, finishGame, updateXP]);

  const onSquareClick = (square: Square) => {
    if (game.turn() !== 'w' || game.isGameOver()) return;

    if (selectedSquare === null) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      const moveSuccess = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      setSelectedSquare(null);
    }
  };

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(() => {
        const ai = new ChessAI(game.fen(), difficulty);
        const bestMove = ai.getBestMove();
        if (bestMove) {
          makeMove(bestMove);
        }
      }, 600); // V9: Consistent AI pacing
      return () => clearTimeout(timer);
    }
  }, [game, difficulty, makeMove]);

  const restart = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setMoveHistory([]);
    setCapturedPieces({ w: [], b: [] });
    setLastMove(null);
  };

  const board = game.board();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex w-full max-w-4xl justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Grandmaster <span className="text-accent-cyan text-glow">Chess</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">V9 Strategy Logic</div>
        </div>
        <button onClick={restart} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start justify-center">
          {/* Sidebar Left: Captured Pieces */}
          <div className="hidden lg:flex flex-col gap-4 w-48">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 h-64 overflow-y-auto">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-4">Captured White</div>
                  <div className="grid grid-cols-4 gap-2 text-white/40">
                      {capturedPieces.w.map((p, i) => <div key={i} className="text-lg">{getPieceIcon(p, 'w')}</div>)}
                  </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 h-64 overflow-y-auto">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-4">Captured Black</div>
                  <div className="grid grid-cols-4 gap-2 text-white/40">
                      {capturedPieces.b.map((p, i) => <div key={i} className="text-lg">{getPieceIcon(p, 'b')}</div>)}
                  </div>
              </div>
          </div>

          {/* Main Board */}
          <div className="relative group">
              <div className="absolute inset-0 bg-accent-cyan/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-accent-cyan/10 transition-all duration-1000" />
              <div className="relative bg-[#0a0a0f] p-3 rounded-[1.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden aspect-square w-full max-w-[520px]">
                  <div className="grid grid-cols-8 grid-rows-8 w-full h-full border-2 border-white/5 rounded-lg overflow-hidden">
                      {board.map((row, r) => row.map((cell, c) => {
                          const square = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
                          const isDark = (r + c) % 2 === 1;
                          const isSelected = selectedSquare === square;
                          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
                          const isValidTarget = validMoves.includes(square);
                          const piece = cell;

                          return (
                              <div
                                key={square}
                                onClick={() => onSquareClick(square)}
                                className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
                                    isDark ? 'bg-white/[0.02]' : 'bg-transparent'
                                } ${isSelected ? 'bg-accent-cyan/30 shadow-inner' : ''} ${isLastMove ? 'bg-accent-gold/10' : ''}`}
                              >
                                  {isValidTarget && (
                                      <div className={`absolute w-3 h-3 rounded-full ${piece ? 'border-2 border-accent-cyan/40 scale-150' : 'bg-accent-cyan/20 animate-pulse'}`} />
                                  )}

                                  <AnimatePresence>
                                      {piece && (
                                          <motion.div
                                            layoutId={`piece-${piece.type}-${piece.color}-${r}-${c}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className={`text-3xl md:text-4xl select-none z-10 transition-colors ${piece.color === 'w' ? 'text-white' : 'text-accent-cyan text-glow'}`}
                                          >
                                              {getPieceIcon(piece.type, piece.color)}
                                          </motion.div>
                                      )}
                                  </AnimatePresence>

                                  {/* Coordinate Labels */}
                                  {c === 0 && <span className="absolute top-0.5 left-0.5 text-[6px] text-white/10 font-black">{8 - r}</span>}
                                  {r === 7 && <span className="absolute bottom-0.5 right-0.5 text-[6px] text-white/10 font-black">{String.fromCharCode(97 + c)}</span>}
                              </div>
                          );
                      }))}
                  </div>
              </div>
          </div>

          {/* Sidebar Right: Move History & Controls */}
          <div className="flex flex-col gap-4 w-full lg:w-64">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">AI Intensity</div>
                    <Swords size={14} className="text-accent-cyan" />
                  </div>
                  <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map(d => (
                          <button
                            key={d} onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                difficulty === d ? 'bg-accent-cyan text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                              {d}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 h-80 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Log Stream</div>
                    <History size={14} className="text-white/20" />
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {moveHistory.reduce((acc: any[], move, i) => {
                              if (i % 2 === 0) acc.push([move]);
                              else acc[acc.length - 1].push(move);
                              return acc;
                          }, []).map((pair, i) => (
                              <React.Fragment key={i}>
                                  <div className="text-[10px] font-mono text-white/20">{i + 1}.</div>
                                  <div className="flex justify-between gap-4">
                                      <span className="text-[10px] font-bold text-white/60">{pair[0]}</span>
                                      <span className="text-[10px] font-bold text-accent-cyan/60">{pair[1] || ''}</span>
                                  </div>
                              </React.Fragment>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <AnimatePresence>
          {game.isGameOver() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                  <Trophy size={64} className="text-accent-cyan mb-6" />
                  <h3 className="text-6xl font-black italic uppercase tracking-tighter mb-4 text-white">Logic Victory</h3>
                  <div className="text-accent-cyan font-black uppercase tracking-[0.4em] text-sm mb-12">
                      {game.turn() === 'w' ? 'Opponent Mastery' : 'Human Mastery'}
                  </div>
                  <button onClick={restart} className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)]">Restart Loop</button>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

const getPieceIcon = (type: string, color: string) => {
    const icons: any = {
        p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚'
    };
    return icons[type];
};

export default ChessGame;
