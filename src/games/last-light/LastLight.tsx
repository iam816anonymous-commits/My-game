import React, { useEffect, useRef, useState } from 'react';
import { Engine } from './Engine';
import { Player } from './entities/Player';
import { EntityManager } from './systems/EntityManager';
import { ProgressionManager } from './systems/ProgressionManager';
import { World } from './World';
import { AudioManager } from './systems/AudioManager';
import { usePlayStore } from '../../shared/store/usePlayStore';
import throttle from 'lodash/throttle';
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { motion, AnimatePresence } from 'framer-motion';

const LastLight: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [isDistorted, setIsDistorted] = useState(false);
  const { updateXP, setLastLightState, finishGame, setLiveScore } = usePlayStore();

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
        setLiveScore(s.totalMemoriesCollected);
      }, 100);

      let dashActive = false;
      player.container.on('dash', () => { dashActive = true; });

      engine.ticker.add((ticker) => {
        const delta = ticker.deltaTime;
        const state = progression.update(delta, dashActive);
        dashActive = false;

        if (state.energy <= 0) {
            finishGame(state.totalMemoriesCollected);
            engine.ticker.stop();
        }

        // Trigger flash on level change
        if ((progression as any).lastLevel !== state.evolutionLevel) {
          world.flashLevelTransition();
          (progression as any).lastLevel = state.evolutionLevel;
        }

        const isOverload = (state as any).currentCombo >= 10;
        player.update(delta, state.energy, isOverload);
        entityManager.update(player.x, player.y, delta, state.totalMemoriesCollected, state.evolutionLevel);
        world.update(delta, state.evolutionLevel, player.x, player.y);
        audio.update(state.evolutionLevel);

        // V13 Rare Event Trigger with Distortion
        if (Math.random() < 0.0005 * delta) {
            world.spawnMeteorShower();
            setIsDistorted(true);
            setTimeout(() => setIsDistorted(false), 5000);
            JuiceManager.shake(10);
        }

        throttledSync(state);

        const memories = entityManager.getMemories();
        memories.forEach(m => {
            const dx = m.x - player.x;
            const dy = m.y - player.y;
            if (dx*dx + dy*dy < 400) {
                const type = (m as any).memoryType;
                const clusterId = (m as any).clusterId;

                // Trigger expiry for rest of cluster on first pick
                if (clusterId) {
                    entityManager.getMemories().forEach(rm => {
                        if ((rm as any).clusterId === clusterId && (rm as any).expiry === -1) {
                            (rm as any).expiry = 5.0; // 5 seconds to clear cluster
                        }
                    });
                }

                const newState = progression.collectMemory(type);
                entityManager.collect(m);
                audio.resume();
                audio.playCollect((newState as any).currentCombo);
                player.shake(5);
                updateXP(type === 'gold' ? 100 : type === 'rare' ? 50 : 10);
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
    <div className={`relative w-full h-full bg-[#0a0a0c] rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000 ${isDistorted ? 'hue-rotate-90' : ''}`}>
        <div ref={canvasRef} className={`absolute inset-0 transition-all duration-1000 ${isDistorted ? 'blur-sm opacity-80 scale-[1.05]' : ''}`} />
    </div>
  );
};

export default LastLight;
