import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameLoop } from '../game/GameLoop';

const GameView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    const initPixi = async () => {
      if (!containerRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        resizeTo: window,
        backgroundColor: 0x050505,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      const gameLoop = new GameLoop(app);
      gameLoopRef.current = gameLoop;
    };

    initPixi();

    const handleResize = () => {
      if (appRef.current) {
        appRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameLoopRef.current) {
        gameLoopRef.current.destroy();
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    />
  );
};

export default GameView;
