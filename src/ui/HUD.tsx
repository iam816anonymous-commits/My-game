import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Book, Camera, X } from 'lucide-react';
import { ScreenshotExporter } from '../systems/ScreenshotExporter';

const HUD: React.FC = () => {
  const energy = useStore(state => state.world.energy);
  const age = useStore(state => state.world.age);
  const totalMemories = useStore(state => state.totalMemories);
  const emotion = useStore(state => state.companion.emotion);
  const journal = useStore(state => state.journal);

  const [showJournal, setShowJournal] = useState(false);

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) ScreenshotExporter.exportPNG(canvas);
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setShowJournal(true)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}
          >
            <Book size={24} />
          </button>
          <button
            onClick={handleScreenshot}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}
          >
            <Camera size={24} />
          </button>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {emotion}
        </div>
      </div>

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
          Day {age} — {totalMemories} Memories
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

      <AnimatePresence>
        {showJournal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              zIndex: 1000,
              borderRadius: '20px',
              padding: '40px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 style={{ fontWeight: 200, letterSpacing: '4px' }}>JOURNAL</h2>
              <button onClick={() => setShowJournal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={32} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {journal.map((entry) => (
                <div key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>
                    DAY {entry.day} — {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 300 }}>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HUD;
