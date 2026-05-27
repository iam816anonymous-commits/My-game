import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { StardustGame } from './StardustGame';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export const StardustView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<StardustGame | null>(null);
  const { setScene, addScore } = useStore();

  useEffect(() => {
    let app: PIXI.Application;

    const init = async () => {
      app = new PIXI.Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        antialias: true
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      gameRef.current = new StardustGame(app, (score) => {
        addScore('stardust', score);
        setScene('hub');
      });
    };

    init();

    return () => {
      gameRef.current?.destroy();
      app?.destroy(true, { children: true, texture: true });
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(7, 11, 24, 0.8)', backdropFilter: 'blur(10px)' }}
    >
      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <h2 className="text-premium" style={{ color: 'var(--color-cyan)', fontSize: '24px', marginBottom: '8px' }}>Stardust Collection</h2>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>Touch the drifting fragments to stabilize them.</p>
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      <button
        onClick={() => setScene('hub')}
        className="premium-button"
        style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', padding: '12px 30px' }}
      >
        Exit
      </button>
    </motion.div>
  );
};
