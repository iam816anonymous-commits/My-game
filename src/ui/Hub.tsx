import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Sparkles, Music, Wind, Compass,
  Grid3X3, Type, Link, Layers
} from 'lucide-react';
import type { Scene } from '../types/game';

const Hub: React.FC = () => {
  const { setScene, scores } = useStore();

  const games = [
    { id: 'stardust', name: 'Stardust', icon: <Sparkles />, color: 'var(--color-cyan)' },
    { id: 'echoes', name: 'Echoes', icon: <Music />, color: 'var(--color-violet)' },
    { id: 'flow', name: 'Wind Flow', icon: <Wind />, color: 'var(--color-rose)' },
    { id: 'orrery', name: 'Orrery', icon: <Compass />, color: 'var(--color-gold)' },
    { id: 'logic', name: 'Logic', icon: <Grid3X3 />, color: 'var(--color-cyan)' },
    { id: 'words', name: 'Lexicon', icon: <Type />, color: 'var(--color-violet)' },
    { id: 'link', name: 'Link', icon: <Link />, color: 'var(--color-rose)' },
    { id: 'pairs', name: 'Pairs', icon: <Layers />, color: 'var(--color-gold)' },
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--color-space)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px',
      overflowY: 'auto'
    }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <h1 className="text-premium" style={{ fontSize: '32px', color: 'var(--color-cyan)', marginBottom: '8px' }}>Game Collection</h1>
        <p style={{ opacity: 0.4, fontSize: '14px' }}>Choose a meditative experience.</p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '700px'
      }}>
        {games.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScene(game.id as Scene)}
            style={{
              height: '140px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <div style={{ color: game.color }}>{game.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{game.name}</div>
            {scores[game.id] > 0 && (
                <div style={{ fontSize: '10px', opacity: 0.4 }}>Score: {scores[game.id]}</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Hub;
