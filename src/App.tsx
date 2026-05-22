import { useEffect, useMemo } from 'react';
import GameView from './rendering/GameView';
import HUD from './ui/HUD';
import Menu from './ui/Menu';
import { useStore } from './store/useStore';
import { loadGame, saveGame } from './systems/PersistenceManager';
import { OfflineSimulationManager } from './systems/OfflineSimulationManager';
import type { GameState } from './types/game';

function App() {
  const isStarted = useStore(state => state.isStarted);
  const isGameOver = useStore(state => state.isGameOver);
  const totalMemories = useStore(state => state.totalMemories);
  const world = useStore(state => state.world);
  const achievements = useStore(state => state.achievements);
  const companion = useStore(state => state.companion);

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

  const savePayload = useMemo(() => ({
    totalMemories,
    world,
    achievements,
    companion,
    lastSeen: Date.now()
  }), [totalMemories, world, achievements, companion]);

  useEffect(() => {
    if (isStarted) {
      saveGame(savePayload as Partial<GameState>);
    }
  }, [savePayload, isStarted]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      <GameView />
      <HUD />
      {(!isStarted || isGameOver) && <Menu />}
    </div>
  );
}

export default App;
