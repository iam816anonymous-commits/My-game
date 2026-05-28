import { useEffect, lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayStore } from './shared/store/usePlayStore';
import { loadState, saveState } from './shared/systems/PersistenceManager';
import throttle from 'lodash/throttle';

const Dashboard = lazy(() => import('./apps/Dashboard'));
const LastLight = lazy(() => import('./games/last-light/LastLight'));
const Chess = lazy(() => import('./games/chess/Chess'));
const Snake = lazy(() => import('./games/snake/Snake'));
const Game2048 = lazy(() => import('./games/2048/Game2048'));
const Minesweeper = lazy(() => import('./games/minesweeper/Minesweeper'));
const Sudoku = lazy(() => import('./games/sudoku/Sudoku'));
const Wordle = lazy(() => import('./games/wordle/Wordle'));

function App() {
  const { currentScene, activeGameId, profile, highScores, favorites } = usePlayStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState().then(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) {
        const throttledSave = throttle(() => saveState(), 5000);
        throttledSave();
    }
  }, [profile, highScores, favorites, loaded]);

  if (!loaded) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center font-black italic uppercase tracking-tighter text-accent-cyan animate-pulse">Initializing Reality...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-accent-cyan/30">
      <AnimatePresence mode="wait">
        {currentScene === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Suspense fallback={null}><Dashboard /></Suspense>
          </motion.div>
        )}

        {currentScene === 'game' && (
          <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="fixed inset-0 z-50 bg-[#0a0a0c]">
            <Suspense fallback={null}>
                {activeGameId === 'last-light' && <LastLight />}
                {activeGameId === 'chess' && <Chess />}
                {activeGameId === 'snake' && <Snake />}
                {activeGameId === '2048' && <Game2048 />}
                {activeGameId === 'minesweeper' && <Minesweeper />}
                {activeGameId === 'sudoku' && <Sudoku />}
                {activeGameId === 'wordle' && <Wordle />}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
