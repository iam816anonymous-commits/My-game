import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordleLogic, type LetterStatus } from './logic';

const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

const Wordle: React.FC = () => {
  const { updateXP, finishGame, setLiveScore } = usePlayStore();
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setTarget(WordleLogic.getDailyWord());
  }, []);

  useEffect(() => {
    setLiveScore(guesses.length);
  }, [guesses]);

  const onKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      const res = WordleLogic.checkGuess(currentGuess, target);
      setGuesses(prev => [...prev, currentGuess]);
      setResults(prev => [...prev, res]);

      if (currentGuess === target) {
        setWon(true);
        setGameOver(true);
        updateXP(500);
        finishGame(500);
      } else if (guesses.length >= 5) {
        setGameOver(true);
        finishGame(100);
      }

      setCurrentGuess('');
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameOver, guesses.length, target, updateXP, finishGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      onKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onKeyPress]);

  const getLetterStatus = (letter: string): LetterStatus => {
    let bestStatus: LetterStatus = 'empty';
    guesses.forEach((guess, gIdx) => {
      guess.split('').forEach((l, lIdx) => {
        if (l === letter) {
          const s = results[gIdx][lIdx];
          if (s === 'correct') bestStatus = 'correct';
          else if (s === 'present' && bestStatus !== 'correct') bestStatus = 'present';
          else if (s === 'absent' && bestStatus === 'empty') bestStatus = 'absent';
        }
      });
    });
    return bestStatus;
  };

  const restart = () => {
    setGuesses([]);
    setResults([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-8">
      {/* Grid */}
      <div className="grid grid-rows-6 gap-2">
        {Array(6).fill(0).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
          const res = results[rowIndex];

          return (
            <motion.div
              key={rowIndex}
              animate={shake && rowIndex === guesses.length ? { x: [-5, 5, -5, 5, 0] } : {}}
              className="grid grid-cols-5 gap-2"
            >
              {Array(5).fill(0).map((_, colIndex) => {
                const char = guess[colIndex] || '';
                const status = res ? res[colIndex] : 'empty';

                return (
                  <motion.div
                    key={colIndex}
                    initial={{ scale: 1 }}
                    animate={res ? { rotateX: 360 } : { scale: char ? 1.05 : 1 }}
                    transition={{ delay: colIndex * 0.1, duration: 0.5 }}
                    className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-black rounded-xl transition-colors duration-500
                      ${status === 'correct' ? 'bg-accent-cyan border-accent-cyan text-black' :
                        status === 'present' ? 'bg-white/20 border-white/40 text-white' :
                        status === 'absent' ? 'bg-white/5 border-transparent text-white/20' :
                        char ? 'border-white/40 text-white' : 'border-white/10 text-white/10'}`}
                  >
                    {char}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        {KEYBOARD.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {row.map(key => {
              const status = getLetterStatus(key);
              return (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className={`h-12 flex items-center justify-center rounded-lg font-bold text-sm px-2 transition-all
                    ${key.length > 1 ? 'flex-grow min-w-[3rem]' : 'w-10'}
                    ${status === 'correct' ? 'bg-accent-cyan text-black' :
                      status === 'present' ? 'bg-white/40 text-white' :
                      status === 'absent' ? 'bg-white/5 text-white/20' :
                      'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {key === 'DEL' ? <Delete size={18} /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
          {gameOver && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 z-[110] bg-[#050816]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="max-w-xs w-full space-y-6"
                  >
                    <div className="space-y-1">
                        <div className={`${won ? 'text-accent-cyan' : 'text-accent-rose'} font-black uppercase tracking-widest text-[10px]`}>
                            {won ? 'Deciphered' : 'Failure'}
                        </div>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Game Over</h3>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Target Data</div>
                        <div className="text-2xl font-black text-white uppercase tracking-[0.2em]">{target}</div>
                    </div>

                    <button
                        onClick={restart}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${won ? 'bg-accent-cyan text-black' : 'bg-white text-black'}`}
                    >
                        New Sequence
                    </button>
                    <button
                        onClick={() => finishGame(won ? 500 : 0)}
                        className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                    >
                        Finalize Logic
                    </button>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default Wordle;
