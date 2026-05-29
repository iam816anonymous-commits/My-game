import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JuiceManager } from '../../shared/systems/JuiceManager';

const OrbitDodge: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const init = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x050816,
        antialias: true,
        resolution: window.devicePixelRatio || 1
      });
      appRef.current = app;
      if (canvasRef.current) canvasRef.current.appendChild(app.canvas);

      const centerX = app.screen.width / 2;
      const centerY = app.screen.height / 2;

      // Sun
      const sun = new PIXI.Graphics();
      sun.circle(0, 0, 40);
      sun.fill({ color: 0xfacc15, alpha: 0.2 });
      sun.circle(0, 0, 30);
      sun.fill({ color: 0xfacc15, alpha: 1 });
      sun.x = centerX;
      sun.y = centerY;
      app.stage.addChild(sun);

      // Orbits
      const orbit1 = new PIXI.Graphics();
      orbit1.circle(centerX, centerY, 100);
      orbit1.stroke({ color: 0xffffff, alpha: 0.1, width: 1 });
      app.stage.addChild(orbit1);

      const orbit2 = new PIXI.Graphics();
      orbit2.circle(centerX, centerY, 180);
      orbit2.stroke({ color: 0xffffff, alpha: 0.1, width: 1 });
      app.stage.addChild(orbit2);

      // Player
      const player = new PIXI.Graphics();
      player.circle(0, 0, 8);
      player.fill({ color: 0x22d3ee });
      player.circle(0, 0, 15);
      player.fill({ color: 0x22d3ee, alpha: 0.3 });
      app.stage.addChild(player);

      let currentOrbit = 100;
      let angle = 0;
      let targetOrbit = 100;
      let gameActive = true;
      let localScore = 0;

      const obstacles: PIXI.Graphics[] = [];
      const pool: PIXI.Graphics[] = [];

      const spawnObstacle = () => {
        if (!gameActive) return;
        const obs = pool.pop() || new PIXI.Graphics();
        obs.clear();
        const isInner = Math.random() > 0.5;
        const radius = isInner ? 100 : 180;
        obs.circle(0, 0, 10);
        obs.fill({ color: 0xf472b6 });

        const startAngle = angle + Math.PI + (Math.random() - 0.5) * 1;
        obs.x = centerX + Math.cos(startAngle) * radius;
        obs.y = centerY + Math.sin(startAngle) * radius;
        (obs as any).orbitRadius = radius;
        (obs as any).angle = startAngle;

        app.stage.addChild(obs);
        obstacles.push(obs);
      };

      const interval = setInterval(spawnObstacle, 1000);

      window.addEventListener('pointerdown', () => {
        targetOrbit = targetOrbit === 100 ? 180 : 100;
      });

      app.ticker.add((ticker) => {
        if (!gameActive) return;
        const delta = ticker.deltaTime;

        // Player Movement
        angle += 0.05 * delta;
        currentOrbit += (targetOrbit - currentOrbit) * 0.2 * delta;

        player.x = centerX + Math.cos(angle) * currentOrbit;
        player.y = centerY + Math.sin(angle) * currentOrbit;

        // Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            (obs as any).angle -= 0.03 * delta;
            const r = (obs as any).orbitRadius;
            const a = (obs as any).angle;
            obs.x = centerX + Math.cos(a) * r;
            obs.y = centerY + Math.sin(a) * r;

            // Collision
            const dx = obs.x - player.x;
            const dy = obs.y - player.y;
            if (dx*dx + dy*dy < 400) {
                gameActive = false;
                setGameOver(true);
                JuiceManager.danger();
                JuiceManager.shake(20);
                finishGame(Math.floor(localScore));
                clearInterval(interval);
            }

            // Score passing
            const playerAngleNormalized = angle % (Math.PI * 2);
            const obsAngleNormalized = a % (Math.PI * 2);
            // This is complex, let's just score based on survival time
        }

        localScore += delta * 0.1;
        setScore(Math.floor(localScore));
      });

      return () => {
        clearInterval(interval);
        app.destroy(true, { children: true });
      };
    };

    const cleanup = init();
    return () => {
        cleanup.then(c => c && c());
    };
  }, []);

  const reset = () => {
      window.location.reload(); // Simple reset for now
  };

  return (
    <div className="relative w-full h-screen bg-[#050816] overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Orbit Score</div>
          <div className="text-6xl font-black italic text-white tracking-tighter">{score}</div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/20 text-[10px] uppercase font-black tracking-widest pointer-events-none">
          Tap to Switch Orbits
      </div>

      <AnimatePresence>
          {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[100]"
              >
                  <h2 className="text-6xl font-black italic uppercase tracking-tighter text-accent-rose mb-2">Impact</h2>
                  <div className="text-white/40 font-bold uppercase tracking-widest text-sm mb-12">Final Score: {score}</div>
                  <button
                    onClick={reset}
                    className="p-8 bg-white text-black rounded-full hover:scale-110 transition-transform"
                  >
                      <RefreshCw size={32} />
                  </button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Exit Button */}
      <button
        onClick={exitToDashboard}
        className="fixed top-8 left-8 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all z-50 text-white/40 hover:text-white"
      >
        <Home size={20} />
      </button>
    </div>
  );
};

export default OrbitDodge;
