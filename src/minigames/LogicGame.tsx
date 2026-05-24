import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Sparkles, Sun, Moon, Star } from 'lucide-react';

type CellValue = 1 | 2 | 3 | 4 | null;

export const LogicGame: React.FC = () => {
  const [grid, setGrid] = useState<CellValue[][]>([]);
  const [initial, setInitial] = useState<boolean[][]>([]);
  const { setScene, addMemory, addJournalEntry } = useStore();

  const symbols = [
    { id: 1, icon: <Star size={20} />, color: 'var(--color-cyan)' },
    { id: 2, icon: <Moon size={20} />, color: 'var(--color-violet)' },
    { id: 3, icon: <Sun size={20} />, color: 'var(--color-gold)' },
    { id: 4, icon: <Sparkles size={20} />, color: 'var(--color-rose)' },
  ];

  useEffect(() => {
    generatePuzzle();
  }, []);

  const generatePuzzle = () => {
    // A simple 4x4 valid grid
    const solution = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 3, 4, 1],
      [4, 1, 2, 3],
    ];

    // Shuffle rows/cols slightly for variety (omitted for brevity in prototype)
    const newGrid = solution.map(row => row.map(cell => (Math.random() > 0.4 ? cell : null)));
    const newInitial = newGrid.map(row => row.map(cell => cell !== null));

    setGrid(newGrid as CellValue[][]);
    setInitial(newInitial);
  };

  const checkSolution = () => {
    const isFull = grid.every(row => row.every(cell => cell !== null));
    if (!isFull) return;

    const rowsValid = grid.every(row => new Set(row).size === 4);
    const colsValid = [0,1,2,3].every(c => {
      const col = grid.map(row => row[c]);
      return new Set(col).size === 4;
    });

    if (rowsValid && colsValid) {
      addMemory(50);
      addJournalEntry("Aligned the celestial symbols in the void.", 'interaction');
      setScene('main');
    } else {
      // Flash red if invalid
      setGrid(prev => prev.map(row => [...row])); // Trigger re-render
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (initial[r][c]) return;
    const nextVal = (((grid[r][c] || 0) % 4) + 1) as CellValue;
    const newGrid = [...grid];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c] = nextVal;
    setGrid(newGrid);
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
        <h2 className="text-premium" style={{ color: 'var(--color-cyan)', fontSize: '24px', marginBottom: '8px' }}>Celestial Logic</h2>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>Balance the four powers in every row and sector.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 60px)',
        gap: '10px',
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {grid.map((row, r) => row.map((cell, c) => (
          <motion.div
            key={`${r}-${c}`}
            whileHover={{ scale: initial[r][c] ? 1 : 1.05 }}
            whileTap={{ scale: initial[r][c] ? 1 : 0.95 }}
            onClick={() => handleCellClick(r, c)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: initial[r][c] ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: initial[r][c] ? 'default' : 'pointer',
              color: cell ? symbols[cell - 1].color : 'transparent'
            }}
          >
            {cell && symbols[cell - 1].icon}
          </motion.div>
        )))}
      </div>

      <motion.div
        animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ fontSize: '12px', color: 'var(--color-cyan)', fontStyle: 'italic' }}
      >
        "Observe the harmony of the stars..."
      </motion.div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={checkSolution} className="premium-button" style={{ padding: '12px 30px' }}>
          Seal Pattern
        </button>
        <button onClick={() => setScene('main')} className="premium-button" style={{ padding: '12px 30px', background: 'transparent' }}>
          Leave
        </button>
      </div>
    </motion.div>
  );
};
