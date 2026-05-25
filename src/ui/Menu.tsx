import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const Menu: React.FC = () => {
  const { isGameOver, totalMemories, startGame, resetGame } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2 } }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-space)',
        zIndex: 2000,
        textAlign: 'center',
        padding: '40px'
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '80px' }}
      >
        <h1 className="text-premium" style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--color-cyan)' }}>Last Light</h1>
        <div style={{ height: '1px', width: '60px', background: 'var(--color-violet)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '13px', opacity: 0.4, maxWidth: '240px', lineHeight: '1.8', fontWeight: 300 }}>
          A collective dream between you and a spirit.
        </p>
      </motion.div>

      {isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginBottom: '40px' }}
        >
          <p style={{ opacity: 0.5, marginBottom: '8px', fontSize: '14px' }}>The dream has faded.</p>
          <p className="text-premium" style={{ fontSize: '20px', color: 'var(--color-gold)' }}>{totalMemories} shards preserved</p>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isGameOver ? resetGame : startGame}
        className="premium-button"
        style={{
          padding: '16px 60px',
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          fontWeight: 500,
          background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.1), rgba(139, 92, 246, 0.1))'
        }}
      >
        {isGameOver ? 'Awaken' : 'Enter'}
      </motion.button>

      <div style={{ position: 'absolute', bottom: '40px', opacity: 0.2, fontSize: '10px' }} className="text-premium">
        v2.0.0 — visual rebuild
      </div>
    </motion.div>
  );
};

export default Menu;
