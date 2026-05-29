import React, { useEffect, useRef, useState } from 'react';
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
import { JuiceManager } from '../../shared/systems/JuiceManager';
import { motion, AnimatePresence } from 'framer-motion';

const LastLight: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [isDistorted, setIsDistorted] = useState(false);
  const { exitToDashboard, updateXP, setLastLightState, finishGame, lastLight, highScores } = usePlayStore();

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
    <div className={`relative w-full h-screen bg-[#050505] flex items-center justify-center p-4 md:p-12 overflow-hidden transition-all duration-1000 ${isDistorted ? 'hue-rotate-90' : ''}`}>

      {/* Game Frame (V18 Rebuild) */}
      <div className="relative w-full h-full max-w-5xl aspect-video md:aspect-[16/9] bg-[#0a0a0c] rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div ref={canvasRef} className={`absolute inset-0 transition-all duration-1000 ${isDistorted ? 'blur-sm opacity-80 scale-[1.05]' : ''}`} />
        <LastLightHUD />

      <AnimatePresence>
          {lastLight?.energy <= 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed inset-0 z-[110] bg-[#050816]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="max-w-sm w-full space-y-8"
                  >
                    <div className="space-y-2">
                        <div className="text-white/40 font-black uppercase tracking-widest text-[10px]">The Void Prevails</div>
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Last Light</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">State</div>
                            <div className="text-xs font-bold text-white uppercase tracking-widest">Extinguished</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Resonance Peak</div>
                                <div className="text-xl font-black text-accent-cyan">x{(1 + (lastLight?.maxCombo || 0) * 0.15).toFixed(1)}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Personal Best</div>
                            <div className="text-xl font-black text-white">{highScores['last-light'] || 0}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Evolution</div>
                            <div className="text-xl font-black text-accent-gold">LVL {lastLight?.evolutionLevel}</div>
                        </div>
                    </div>

                    <div className="p-6 bg-accent-cyan/5 border border-accent-cyan/20 rounded-3xl">
                        <div className="text-[8px] font-black uppercase tracking-widest text-accent-cyan mb-2">Operational Insight</div>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                            {lastLight?.totalMemoriesCollected < 20 ? 'Maintain speed. Particles restore energy but fade if you linger.' :
                             lastLight?.evolutionLevel < 3 ? 'Trigger rapid Merges (Combos) to accelerate evolution of the void.' :
                             'Rare Meteor Showers detected. Follow the trails for legendary memory resonance.'}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={exitToDashboard} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all">Hub</button>
                        <button onClick={() => window.location.reload()} className="flex-[2] py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all">Relight</button>
                    </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      </div>

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
