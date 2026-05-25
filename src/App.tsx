import { useEffect, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import GameView from './rendering/GameView';
import HUD from './ui/HUD';
import Menu from './ui/Menu';
import { useStore } from './store/useStore';
import { loadGame, saveGame } from './systems/PersistenceManager';
import { OfflineSimulationManager } from './systems/OfflineSimulationManager';
import type { GameState } from './types/game';
import { soundController } from './audio/SoundController';
import throttle from 'lodash/throttle';
import { StardustView } from './minigames/StardustView';
import { EchoesGame } from './minigames/EchoesGame';
import { FlowView } from './minigames/FlowView';
import { OrreryView } from './minigames/OrreryView';
import { LogicGame } from './minigames/LogicGame';
import { WordGame } from './minigames/WordGame';
import { LinkView } from './minigames/LinkView';
import { PairsGame } from './minigames/PairsGame';

const ThreeCanvas = lazy(() => import('./rendering/ThreeCanvas').then(m => ({ default: m.ThreeCanvas })));

function App() {
  const isStarted = useStore(state => state.isStarted);
  const isGameOver = useStore(state => state.isGameOver);
  const totalMemories = useStore(state => state.totalMemories);
  const world = useStore(state => state.world);
  const achievements = useStore(state => state.achievements);
  const companion = useStore(state => state.companion);
  const currentScene = useStore(state => state.currentScene);

  useEffect(() => {
    const init = async () => {
      const savedState = await loadGame();
      if (savedState) {
        useStore.setState(savedState as GameState);
        OfflineSimulationManager.simulate();
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isStarted) {
      soundController.playBase();
    }
  }, [isStarted]);

  useEffect(() => {
    soundController.updateWeatherAudio(world.weather);
  }, [world.weather]);

  useEffect(() => {
    soundController.setEmotionMusic(companion.emotion);
  }, [companion.emotion]);

  const throttledSave = useMemo(
    () => throttle((payload: Partial<GameState>) => {
      saveGame(payload);
    }, 5000),
    []
  );

  const savePayload = useMemo(() => ({
    totalMemories,
    world,
    achievements,
    companion,
    lastSeen: Date.now()
  }), [totalMemories, world, achievements, companion]);

  useEffect(() => {
    if (isStarted) {
      throttledSave(savePayload as Partial<GameState>);
    }
  }, [savePayload, isStarted, throttledSave]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#070B18', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      {/* Background World Layer (Stays active in back) */}
      <div style={{ opacity: currentScene === 'main' ? 1 : 0.3, transition: 'opacity 1s ease' }}>
        <GameView />
      </div>

      {isStarted && currentScene === 'main' && (
        <Suspense fallback={null}>
          <ThreeCanvas />
        </Suspense>
      )}

      {/* Mini-game Layers */}
      <AnimatePresence mode="wait">
        {currentScene === 'stardust' && (
          <div key="stardust" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <StardustView />
          </div>
        )}
        {currentScene === 'echoes' && (
          <div key="echoes" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <EchoesGame />
          </div>
        )}
        {currentScene === 'flow' && (
          <div key="flow" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <FlowView />
          </div>
        )}
        {currentScene === 'orrery' && (
          <div key="orrery" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <OrreryView />
          </div>
        )}
        {currentScene === 'logic' && (
          <div key="logic" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <LogicGame />
          </div>
        )}
        {currentScene === 'words' && (
          <div key="words" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <WordGame />
          </div>
        )}
        {currentScene === 'link' && (
          <div key="link" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <LinkView />
          </div>
        )}
        {currentScene === 'pairs' && (
          <div key="pairs" style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
            <PairsGame />
          </div>
        )}
      </AnimatePresence>

      <HUD />
      {(!isStarted || isGameOver) && <Menu />}
    </div>
  );
}

export default App;
