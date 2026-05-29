import { useEffect, lazy, Suspense, useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayStore } from './shared/store/usePlayStore';
import { loadState, saveState } from './shared/systems/PersistenceManager';
import { AnalyticsManager } from './shared/systems/AnalyticsManager';
import { JuiceManager } from './shared/systems/JuiceManager';
import throttle from 'lodash/throttle';

const Dashboard = lazy(() => import('./apps/Dashboard'));
const LastLight = lazy(() => import('./games/last-light/LastLight'));
const Chess = lazy(() => import('./games/chess/Chess'));
const Snake = lazy(() => import('./games/snake/Snake'));
const Game2048 = lazy(() => import('./games/2048/Game2048'));
const Minesweeper = lazy(() => import('./games/minesweeper/Minesweeper'));
const Sudoku = lazy(() => import('./games/sudoku/Sudoku'));
const Wordle = lazy(() => import('./games/wordle/Wordle'));
const Reaction = lazy(() => import('./games/reaction/Reaction'));
const Tower = lazy(() => import('./games/tower/Tower'));
const ColorRush = lazy(() => import('./games/color-rush/ColorRush'));
const OrbitDodge = lazy(() => import('./games/orbit-dodge/OrbitDodge'));
const TapDash = lazy(() => import('./games/tap-dash/TapDash'));
const Connect4 = lazy(() => import('./games/connect4/Connect4'));
const PostGameOverlay = lazy(() => import('./shared/ui/PostGameOverlay'));
const GameOnboarding = lazy(() => import('./shared/ui/GameOnboarding'));

function App() {
  const { currentScene, activeGameId, profile, highScores, favorites, onboardingSeen, markOnboardingSeen } = usePlayStore();
  const [loaded, setLoaded] = useState(false);
  const [shake, setShake] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return JuiceManager.subscribe((intensity) => {
        setShake(intensity);
    });
  }, []);

  useEffect(() => {
    loadState().then(() => {
        setLoaded(true);
        AnalyticsManager.trackSessionStart();
    });
  }, []);

  const throttledSave = useMemo(() => throttle(() => saveState(), 5000), []);

  useEffect(() => {
    if (loaded) {
        throttledSave();
    }
  }, [profile, highScores, favorites, loaded, throttledSave]);

  if (!loaded) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center font-black italic uppercase tracking-tighter text-accent-cyan animate-pulse">Initializing Reality...</div>;

  return (
    <div
        ref={containerRef}
        style={{
            transform: shake > 0 ? `translate(${(Math.random()-0.5)*shake}px, ${(Math.random()-0.5)*shake}px)` : 'none'
        }}
        className="min-h-screen bg-[#0a0a0c] text-white selection:bg-accent-cyan/30"
    >
      <AnimatePresence mode="wait">
        {currentScene === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Suspense fallback={null}><Dashboard /></Suspense>
          </motion.div>
        )}

        {currentScene === 'game' && (
          <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="fixed inset-0 z-50 bg-[#0a0a0c]">
            <Suspense fallback={null}>
                <AnimatePresence>
                    {activeGameId && (!onboardingSeen[activeGameId] || (Date.now() - onboardingSeen[activeGameId] > 24 * 60 * 60 * 1000)) && (
                        <GameOnboarding
                            gameId={activeGameId}
                            onClose={() => markOnboardingSeen(activeGameId)}
                        />
                    )}
                </AnimatePresence>
                {activeGameId === 'last-light' && <LastLight />}
                {activeGameId === 'chess' && <Chess />}
                {activeGameId === 'snake' && <Snake />}
                {activeGameId === '2048' && <Game2048 />}
                {activeGameId === 'minesweeper' && <Minesweeper />}
                {activeGameId === 'sudoku' && <Sudoku />}
                {activeGameId === 'wordle' && <Wordle />}
                {activeGameId === 'reaction' && <Reaction />}
                {activeGameId === 'tower' && <Tower />}
                {activeGameId === 'color-rush' && <ColorRush />}
                {activeGameId === 'orbit-dodge' && <OrbitDodge />}
                {activeGameId === 'tap-dash' && <TapDash />}
                {activeGameId === 'connect4' && <Connect4 />}
            </Suspense>
          </motion.div>
        )}

        {currentScene === 'postgame' && (
          <motion.div key="postgame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Suspense fallback={null}><PostGameOverlay /></Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
