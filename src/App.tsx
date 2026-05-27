import { useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { loadGame, saveGame } from './systems/PersistenceManager';
import { soundController } from './audio/SoundController';
import type { GameState } from './types/game';
import throttle from 'lodash/throttle';

import Hub from './ui/Hub';
import { StardustView } from './minigames/StardustView';
import { EchoesGame } from './minigames/EchoesGame';
import { FlowView } from './minigames/FlowView';
import { OrreryView } from './minigames/OrreryView';
import { LogicGame } from './minigames/LogicGame';
import { WordGame } from './minigames/WordGame';
import { LinkView } from './minigames/LinkView';
import { PairsGame } from './minigames/PairsGame';

function App() {
  const currentScene = useStore(state => state.currentScene);
  const scores = useStore(state => state.scores);

  useEffect(() => {
    const init = async () => {
      const savedState = await loadGame();
      if (savedState) {
        useStore.setState(savedState as GameState);
      }
      soundController.playBase();
    };
    init();
  }, []);

  const throttledSave = useMemo(
    () => throttle((payload: Partial<GameState>) => {
      saveGame(payload);
    }, 5000),
    []
  );

  useEffect(() => {
      throttledSave({ scores } as Partial<GameState>);
  }, [scores, throttledSave]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#070B18', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {currentScene === 'hub' && <Hub key="hub" />}
        {currentScene === 'stardust' && <div key="stardust" style={{ position: 'absolute', inset: 0 }}><StardustView /></div>}
        {currentScene === 'echoes' && <div key="echoes" style={{ position: 'absolute', inset: 0 }}><EchoesGame /></div>}
        {currentScene === 'flow' && <div key="flow" style={{ position: 'absolute', inset: 0 }}><FlowView /></div>}
        {currentScene === 'orrery' && <div key="orrery" style={{ position: 'absolute', inset: 0 }}><OrreryView /></div>}
        {currentScene === 'logic' && <div key="logic" style={{ position: 'absolute', inset: 0 }}><LogicGame /></div>}
        {currentScene === 'words' && <div key="words" style={{ position: 'absolute', inset: 0 }}><WordGame /></div>}
        {currentScene === 'link' && <div key="link" style={{ position: 'absolute', inset: 0 }}><LinkView /></div>}
        {currentScene === 'pairs' && <div key="pairs" style={{ position: 'absolute', inset: 0 }}><PairsGame /></div>}
      </AnimatePresence>
    </div>
  );
}

export default App;
