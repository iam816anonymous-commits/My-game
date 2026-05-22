import { useEffect } from 'react';
import GameView from './features/core/GameView';
import HUD from './features/ui/HUD';
import Menu from './features/ui/Menu';
import { useStore } from './features/state/useStore';
import { loadGame, saveGame } from './features/persistence/storage';

function App() {
  const { isStarted, isGameOver, totalMemories, level, achievements } = useStore();

  useEffect(() => {
    const init = async () => {
      const savedState = await loadGame();
      if (savedState) {
        useStore.setState(savedState);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isStarted) {
      saveGame({ totalMemories, level, achievements });
    }
  }, [totalMemories, level, achievements, isStarted]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      <GameView />
      <HUD />
      {(!isStarted || isGameOver) && <Menu />}
    </div>
  );
}

export default App;
