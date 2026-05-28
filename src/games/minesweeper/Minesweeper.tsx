import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Bomb, Flag, Timer, ShieldAlert, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MinesweeperLogic, DIFFICULTIES } from './logic';
import type { Difficulty } from './logic';

const Minesweeper: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flagged, setFlagged] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [time, setTime] = useState(0);

  const init = useCallback(() => {
    const { rows, cols } = DIFFICULTIES[difficulty];
    setBoard([]); // Empty until first click
    setRevealed(Array(rows).fill(null).map(() => Array(cols).fill(false)));
    setFlagged(Array(rows).fill(null).map(() => Array(cols).fill(false)));
    setGameOver(false);
    setWin(false);
    setStartTime(null);
    setTime(0);
  }, [difficulty]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (startTime && !gameOver && !win) {
      const t = setInterval(() => setTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
      return () => clearInterval(t);
    }
  }, [startTime, gameOver, win]);

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || win || flagged[r][c]) return;

    if (board.length === 0) {
      // First click: Generate board
      const newBoard = MinesweeperLogic.generate(difficulty, [r, c]);
      setBoard(newBoard);
      setStartTime(Date.now());
      reveal(newBoard, r, c);
    } else {
      reveal(board, r, c);
    }
  };

  const reveal = (currentBoard: number[][], r: number, c: number) => {
    if (revealed[r][c]) return;

    const newRevealed = revealed.map(row => [...row]);
    const queue: [number, number][] = [[r, c]];

    if (currentBoard[r][c] === -1) {
        setGameOver(true);
        // Reveal all mines
        currentBoard.forEach((row, ir) => row.forEach((val, ic) => {
            if (val === -1) newRevealed[ir][ic] = true;
        }));
        setRevealed(newRevealed);
        return;
    }

    while (queue.length > 0) {
        const [currR, currC] = queue.shift()!;
        if (newRevealed[currR][currC]) continue;
        newRevealed[currR][currC] = true;

        if (currentBoard[currR][currC] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = currR + dr;
                    const nc = currC + dc;
                    if (nr >= 0 && nr < DIFFICULTIES[difficulty].rows && nc >= 0 && nc < DIFFICULTIES[difficulty].cols && !newRevealed[nr][nc]) {
                        queue.push([nr, nc]);
                    }
                }
            }
        }
    }
    setRevealed(newRevealed);
    checkWin(newRevealed, currentBoard);
  };

  const checkWin = (currentRevealed: boolean[][], currentBoard: number[][]) => {
      const { rows, cols, mines } = DIFFICULTIES[difficulty];
      let revealedCount = 0;
      currentRevealed.forEach(row => row.forEach(cell => { if(cell) revealedCount++; }));
      if (revealedCount === rows * cols - mines) {
          setWin(true);
          updateXP(mines * 10);
          finishGame(time);
      }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (gameOver || win || revealed[r][c]) return;
      const newFlagged = flagged.map(row => [...row]);
      newFlagged[r][c] = !newFlagged[r][c];
      setFlagged(newFlagged);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 gap-8 overflow-hidden touch-none">
      {/* Header */}
      <div className="flex w-full max-w-4xl justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-accent-rose">Mine <span className="text-white">Clear</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">V6 Stable Logic</div>
        </div>
        <button onClick={init} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl items-center justify-center">
          {/* Stats */}
          <div className="flex flex-col gap-4 w-48">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                  <Timer size={16} className="text-accent-rose" />
                  <div className="text-2xl font-black italic tabular-nums">{time}s</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Mission Time</div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Sector Size</div>
                  <div className="flex flex-col gap-2">
                      {(['beginner', 'intermediate', 'expert'] as const).map(d => (
                          <button
                            key={d} onClick={() => setDifficulty(d)}
                            className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                difficulty === d ? 'bg-accent-rose text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                              {d}
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          {/* Board */}
          <div className="relative bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl overflow-auto max-w-full max-h-[70vh]">
              <div
                className="grid gap-1"
                style={{
                    gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, minmax(30px, 1fr))`,
                }}
              >
                  {revealed.map((row, r) => row.map((isRevealed, c) => {
                      const val = board[r]?.[c];
                      const isFlagged = flagged[r][c];

                      return (
                          <motion.div
                            key={`${r}-${c}`}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCellClick(r, c)}
                            onContextMenu={(e) => handleRightClick(e, r, c)}
                            className={`w-8 h-8 flex items-center justify-center text-sm font-black rounded-sm cursor-pointer transition-all ${
                                isRevealed ?
                                    (val === -1 ? 'bg-accent-rose shadow-[0_0_15px_#f9a8d4]' : 'bg-white/5 opacity-50') :
                                    'bg-white/10 hover:bg-white/20'
                            }`}
                          >
                              {isRevealed ? (
                                  val === -1 ? <Bomb size={16} /> : (val > 0 ? <span style={{ color: getNumColor(val) }}>{val}</span> : '')
                              ) : (
                                  isFlagged ? <Flag size={14} className="text-accent-rose" /> : ''
                              )}
                          </motion.div>
                      );
                  }))}
              </div>

              <AnimatePresence>
                  {(gameOver || win) && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50 rounded-[2rem]"
                      >
                          {win ? <Trophy size={48} className="text-accent-gold mb-4" /> : <ShieldAlert size={48} className="text-accent-rose mb-4" />}
                          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{win ? 'Sector Secure' : 'Void Triggered'}</h3>
                          <div className="text-xs text-white/40 uppercase tracking-[0.3em] font-black mb-8">Final Time: {time}s</div>
                          <button onClick={init} className={`px-12 py-4 ${win ? 'bg-accent-gold' : 'bg-accent-rose'} text-black font-black uppercase tracking-widest rounded-2xl`}>Restart</button>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      </div>
    </div>
  );
};

const getNumColor = (num: number) => {
    const colors = ['', '#67e8f9', '#4ade80', '#f9a8d4', '#8b5cf6', '#facc15', '#fb7185', '#2dd4bf', '#ffffff'];
    return colors[num];
};

export default Minesweeper;
