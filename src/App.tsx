import { useEffect, useMemo } from 'react';
import GameView from './features/core/GameView';
import HUD from './features/ui/HUD';
import Menu from './features/ui/Menu';
import { useStore } from './features/state/useStore';
import { loadGame, saveGame } from './features/persistence/storage';

function App() {
  const isStarted = useStore(state => state.isStarted);
  const isGameOver = useStore(state => state.isGameOver);
  const totalMemories = useStore(state => state.totalMemories);
  const level = useStore(state => state.level);
  const achievements = useStore(state => state.achievements);

  useEffect(() => {
    const init = async () => {
      const savedState = await loadGame();
      if (savedState) {
        useStore.setState(savedState);
      }
    };
    init();
  }, []);

  // Save game state when key values change
  const savePayload = useMemo(() => ({ totalMemories, level, achievements }), [totalMemories, level, achievements]);

  useEffect(() => {
    if (isStarted) {
      saveGame(savePayload);
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
