import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export const WordGame: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const { setScene, addMemory, addJournalEntry } = useStore();

  const validWords = ["LIGHT", "STAR", "DREAM", "VOID", "GLOW", "NIGHT", "SPIRIT", "SOUL", "CALM", "PEACE"];

  useEffect(() => {
    // Generate a set of letters that can form at least a few of the valid words
    const alphabet = "ABCDEGHILMNOPRSTUVWY";
    const pool = "LIGHTSTARDREAMVOID".split("");
    while(pool.length < 12) {
        pool.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    setLetters(pool.sort(() => Math.random() - 0.5));
  }, []);

  const addLetter = (l: string, idx: number) => {
    setCurrentWord(prev => prev + l);
    const newLetters = [...letters];
    newLetters.splice(idx, 1);
    setLetters(newLetters);
  };

  const submitWord = () => {
    if (validWords.includes(currentWord) && !foundWords.includes(currentWord)) {
      setFoundWords(prev => [...prev, currentWord]);
      addMemory(20);
      if (foundWords.length + 1 >= 3) {
        addJournalEntry(`Deciphered the runes: ${currentWord}`, 'interaction');
        setTimeout(() => setScene('main'), 1500);
      }
    }
    // Return letters to pool
    setLetters(prev => [...prev, ...currentWord.split("")].sort(() => Math.random() - 0.5));
    setCurrentWord("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(7, 11, 24, 0.95)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-premium" style={{ color: 'var(--color-violet)', fontSize: '24px', marginBottom: '8px' }}>Dream Lexicon</h2>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>Form words from the floating runes to anchor the dream.</p>
      </div>

      <div style={{ height: '40px', fontSize: '32px', color: 'var(--color-cyan)', letterSpacing: '4px', fontWeight: 300 }}>
        {currentWord}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', maxWidth: '300px' }}>
        <AnimatePresence>
          {letters.map((l, i) => (
            <motion.button
              key={`${l}-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => addLetter(l, i)}
              className="premium-button"
              style={{ width: '45px', height: '45px', padding: 0, fontSize: '18px' }}
            >
              {l}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={submitWord} className="premium-button" style={{ padding: '12px 30px' }}>
          Anchor Word
        </button>
        <button onClick={() => setScene('main')} className="premium-button" style={{ padding: '12px 30px', background: 'transparent' }}>
          Leave
        </button>
      </div>

      <div style={{ opacity: 0.4, fontSize: '12px' }}>
        Words Found: {foundWords.join(", ")}
      </div>
    </motion.div>
  );
};
