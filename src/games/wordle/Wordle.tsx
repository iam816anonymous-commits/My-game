import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, HelpCircle, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordleLogic, type LetterStatus } from './logic';

const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

const Wordle: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-4 gap-6">
      {/* Header */}
      <div className="flex w-full max-w-md justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Word <span className="text-accent-cyan">Crypt</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Daily Logic Challenge</div>
        </div>
        <button onClick={restart} className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

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
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl flex items-center gap-4"
          >
            {won ? 'Sequence Solved' : `Sequence Failed: ${target}`}
            <button onClick={restart} className="p-2 bg-black text-white rounded-full"><RotateCcw size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wordle;
