import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { BookText, Camera, X, Sparkles as SparklesIcon } from 'lucide-react';
import { ScreenshotExporter } from '../systems/ScreenshotExporter';

const HUD: React.FC = () => {
  const energy = useStore(state => state.world.energy);
  const age = useStore(state => state.world.age);
  const totalMemories = useStore(state => state.totalMemories);
  const emotion = useStore(state => state.companion.emotion);
  const journal = useStore(state => state.journal);
  const dailyChallenge = useStore(state => state.dailyChallenge);
  const unlockedSkins = useStore(state => state.unlockedSkins);
  const activeSkin = useStore(state => state.activeSkin);
  const setSkin = useStore(state => state.setSkin);

  const [showJournal, setShowJournal] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [isZen, setIsZen] = useState(false);

  const handleScreenshot = () => {
    ScreenshotExporter.exportPNG();
  };

  return (
    <>
      {/* Zen Toggle */}
      <button
        onClick={() => setIsZen(!isZen)}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 2000,
          background: 'none',
          border: 'none',
          color: 'white',
          opacity: 0.3,
          cursor: 'pointer',
          fontSize: '10px',
          letterSpacing: '2px'
        }}
      >
        {isZen ? 'RESTORE' : 'ZEN'}
      </button>

      {/* Top Glass Card */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        zIndex: 100,
        pointerEvents: 'none',
        opacity: isZen ? 0 : 1,
        transition: 'opacity 1s ease'
      }} className="glass-panel">
        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '20px' }}>
          <button onClick={() => setShowJournal(true)} className="premium-button" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookText size={20} />
          </button>
          <button onClick={handleScreenshot} className="premium-button" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={20} />
          </button>
          <button onClick={() => setShowWardrobe(true)} className="premium-button" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SparklesIcon size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="text-premium" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>
            {Math.floor(totalMemories / 10) + 1} Dreamers Glowing
          </div>
          <div className="text-premium" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>Daily Focus: <span style={{ color: 'var(--color-gold)' }}>{dailyChallenge}</span></div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-cyan)', textTransform: 'capitalize' }}>{emotion}</div>
        </div>
      </div>

      {/* Floating Energy Capsule */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        pointerEvents: 'none',
        opacity: isZen ? 0 : 1,
        transition: 'opacity 1s ease'
      }}>
        <motion.div
          key={totalMemories}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 0.7 }}
          className="text-premium"
          style={{ fontSize: '11px' }}
        >
          Day {age} &nbsp;•&nbsp; {totalMemories} Shards
        </motion.div>

        <div style={{
          width: '240px',
          height: '12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '3px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${energy}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
            style={{
              height: '100%',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, var(--color-cyan), var(--color-violet))',
              boxShadow: '0 0 15px var(--color-cyan)'
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showJournal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'absolute',
              inset: '40px',
              zIndex: 1000,
              padding: '40px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="glass-panel"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
              <h2 className="text-premium" style={{ fontSize: '18px' }}>Chronicle</h2>
              <button onClick={() => setShowJournal(false)} className="premium-button" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {journal.map((entry) => (
                <div key={entry.id} style={{ padding: '0 0 24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-premium" style={{ fontSize: '9px', opacity: 0.4, marginBottom: '8px' }}>
                    Sol {entry.day} — {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 300, opacity: 0.9 }}>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWardrobe && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: 'absolute',
              top: '100px',
              left: '20px',
              width: '240px',
              padding: '24px',
              zIndex: 1000
            }}
            className="glass-panel"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="text-premium" style={{ fontSize: '14px' }}>Aura Wardrobe</h3>
              <button onClick={() => setShowWardrobe(false)} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.5 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {unlockedSkins.map((skin) => (
                <button
                  key={skin}
                  onClick={() => setSkin(skin)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: activeSkin === skin ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: activeSkin === skin ? '1px solid var(--color-cyan)' : '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '11px',
                    textTransform: 'capitalize'
                  }}
                >
                  {skin}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HUD;
