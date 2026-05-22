import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../state/useStore';

const Menu: React.FC = () => {
  const { isStarted, isGameOver, totalMemories, score, startGame, resetGame } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 5, 5, 0.8)',
        zIndex: 100,
        textAlign: 'center'
      }}
    >
      <motion.h1
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        style={{ fontSize: '3rem', fontWeight: '200', letterSpacing: '8px', marginBottom: '1rem' }}
      >
        LAST LIGHT
      </motion.h1>

      {isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginBottom: '2rem' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>The light has faded.</p>
          <p style={{ fontSize: '1.2rem' }}>{totalMemories} memories collected</p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Final Score: {score}</p>
        </motion.div>
      )}

      {!isStarted && !isGameOver && (
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '300px', marginBottom: '2rem', lineHeight: '1.6' }}>
          Follow the light. Collect memories to keep the glow alive.
        </p>
      )}

      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)', color: '#000' }}
        whileTap={{ scale: 0.95 }}
        onClick={isGameOver ? resetGame : startGame}
        style={{
          padding: '12px 40px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff',
          borderRadius: '30px',
          cursor: 'pointer',
          fontSize: '1rem',
          letterSpacing: '2px',
          transition: 'all 0.3s ease'
        }}
      >
        {isGameOver ? 'RETURN' : 'BEGIN'}
      </motion.button>
    </motion.div>
  );
};

export default Menu;
