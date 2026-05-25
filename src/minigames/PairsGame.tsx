import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Sparkles, Sun, Moon, Star, Cloud, Ghost } from 'lucide-react';

type Card = { id: number, type: number, flipped: boolean, solved: boolean };

export const PairsGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const { setScene, addMemory, addJournalEntry } = useStore();

  const icons = [
    <Star size={24} />, <Moon size={24} />, <Sun size={24} />,
    <Sparkles size={24} />, <Cloud size={24} />, <Ghost size={24} />
  ];

  useEffect(() => {
    const types = [0,0,1,1,2,2,3,3,4,4,5,5];
    const shuffled = types.sort(() => Math.random() - 0.5);
    setCards(shuffled.map((type, i) => ({ id: i, type, flipped: false, solved: false })));
  }, []);

  const handleFlip = (idx: number) => {
    if (selected.length === 2 || cards[idx].flipped || cards[idx].solved) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [i1, i2] = newSelected;
      if (cards[i1].type === cards[i2].type) {
        setTimeout(() => {
          const solvedCards = [...cards];
          solvedCards[i1].solved = true;
          solvedCards[i2].solved = true;
          setCards(solvedCards);
          setSelected([]);
          if (solvedCards.every(c => c.solved)) {
            addMemory(40);
            addJournalEntry("Reunited the celestial twins.", 'interaction');
            setScene('main');
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[i1].flipped = false;
          resetCards[i2].flipped = false;
          setCards(resetCards);
          setSelected([]);
        }, 1000);
      }
    }
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
        <h2 className="text-premium" style={{ color: 'var(--color-cyan)', fontSize: '24px', marginBottom: '8px' }}>Celestial Pairs</h2>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>Find the fragments that belong together.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 70px)', gap: '15px' }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            onClick={() => handleFlip(i)}
            animate={{ rotateY: card.flipped || card.solved ? 180 : 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              width: '70px',
              height: '90px',
              cursor: 'pointer',
              position: 'relative',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Front */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backfaceVisibility: 'hidden'
            }} />
            {/* Back */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(103, 232, 249, 0.1)',
              borderRadius: '12px',
              border: '1px solid var(--color-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              color: 'var(--color-cyan)'
            }}>
              {icons[card.type]}
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={() => setScene('main')} className="premium-button" style={{ padding: '12px 30px', background: 'transparent' }}>
        Leave
      </button>
    </motion.div>
  );
};
