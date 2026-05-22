import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../state/useStore';

const HUD: React.FC = () => {
  const { energy, level, totalMemories } = useStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      padding: '20px',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      zIndex: 10
    }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Level {level} — {totalMemories} Memories
      </div>

      <div style={{
        width: '300px',
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${energy}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{
            height: '100%',
            backgroundColor: energy < 20 ? '#ff4444' : '#ffffff',
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}
        />
      </div>
    </div>
  );
};

export default HUD;
