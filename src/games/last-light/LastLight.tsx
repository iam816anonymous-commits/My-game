import React, { useEffect, useRef } from 'react';
import { Engine } from './Engine';
import { Player } from './entities/Player';
import { EntityManager } from './systems/EntityManager';
import { ProgressionManager } from './systems/ProgressionManager';
import { World } from './World';
import { AudioManager } from './systems/AudioManager';
import { usePlayStore } from '../../shared/store/usePlayStore';
import LastLightHUD from './LastLightHUD';
import throttle from 'lodash/throttle';
import { Home } from 'lucide-react';

const LastLight: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const { exitToDashboard, updateXP, setLastLightState, finishGame } = usePlayStore();

  useEffect(() => {
    let progression: ProgressionManager;
    let entityManager: EntityManager;
    let world: World;
    let player: Player;
    let audio: AudioManager;

    const init = async () => {
      const engine = await Engine.getInstance();
      engineRef.current = engine;

      if (canvasRef.current) {
        canvasRef.current.appendChild(engine.view);
      }

      progression = new ProgressionManager();
      entityManager = new EntityManager(engine.stage);
      world = new World(engine.stage);
      player = new Player();
      audio = new AudioManager();

      engine.stage.addChild(player.container);

      const throttledSync = throttle((s: any) => {
        setLastLightState({
          energy: s.energy,
          evolutionLevel: s.evolutionLevel,
          evolutionProgress: s.evolutionProgress,
          totalMemoriesCollected: s.totalMemoriesCollected,
          currentCombo: s.currentCombo || 0
        });
      }, 100);

      engine.ticker.add((ticker) => {
        const delta = ticker.deltaTime;
        const state = progression.update(delta);

        if (state.energy <= 0) {
            finishGame(state.totalMemoriesCollected);
            engine.ticker.stop();
        }

        player.update(delta, state.energy);
        entityManager.update(player.x, player.y, delta, state.totalMemoriesCollected);
        world.update(delta, state.evolutionLevel, player.x, player.y);
        audio.update(state.evolutionLevel);

        throttledSync(state);

        const memories = entityManager.getMemories();
        memories.forEach(m => {
            const dx = m.x - player.x;
            const dy = m.y - player.y;
            if (dx*dx + dy*dy < 400) {
                const type = (m as any).memoryType;
                const newState = progression.collectMemory(type);
                entityManager.collect(m);
                audio.resume();
                audio.playCollect((newState as any).currentCombo);
                player.shake(5);
                updateXP(type === 'rare' ? 50 : 10);
            }
        });
      });
    };

    init();

    return () => {
      if (player) player.cleanup();
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [updateXP]);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0c] overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0" />
      <LastLightHUD />

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

export default LastLight;
