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
const Ludo = lazy(() => import('./games/ludo/Ludo'));
const SnakesLadders = lazy(() => import('./games/snakes-ladders/SnakesAndLadders'));
const AdminDashboard = lazy(() => import('./apps/admin/AdminDashboard'));
const PostGameOverlay = lazy(() => import('./shared/ui/PostGameOverlay'));
const GameOnboarding = lazy(() => import('./shared/ui/GameOnboarding'));
const GameShell = lazy(() => import('./shared/ui/GameShell'));

function App() {
  const { currentScene, activeGameId, profile, highScores, favorites, onboardingSeen, markOnboardingSeen, isAdmin } = usePlayStore();
  const [loaded, setLoaded] = useState(false);
  const [shake, setShake] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let intensity = 0;

    const unsub = JuiceManager.subscribe((i: number) => {
        intensity = i;
    });

    const loop = () => {
        if (intensity > 0) {
            setShake({
                x: (Math.random() - 0.5) * intensity,
                y: (Math.random() - 0.5) * intensity
            });
        } else {
            setShake({ x: 0, y: 0 });
        }
        frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => {
        unsub();
        cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    loadState().then(() => {
        setLoaded(true);

        // V13 Analytics: Session & Retention
        const store = usePlayStore.getState();
        const lastLogin = store.profile.lastLogin;
        const now = Date.now();
        const isReturning = lastLogin > 0;
        const dailyReturn = (now - lastLogin) < 24 * 60 * 60 * 1000 * 2 && (now - lastLogin) > 24 * 60 * 60 * 1000;

        AnalyticsManager.trackSessionStart(isReturning, dailyReturn, store.profile.streak);
    });

    const handleBeforeUnload = () => {
        AnalyticsManager.trackSessionEnd();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
            transform: (shake.x !== 0 || shake.y !== 0) ? `translate(${shake.x}px, ${shake.y}px)` : 'none'
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
                <GameShell>
                    <AnimatePresence>
                        {activeGameId && !onboardingSeen[activeGameId] && (
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
                {activeGameId === 'ludo' && <Ludo />}
                {activeGameId === 'snakes-ladders' && <SnakesLadders />}
                </GameShell>
            </Suspense>
          </motion.div>
        )}

        {currentScene === 'postgame' && (
          <motion.div key="postgame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Suspense fallback={null}><PostGameOverlay /></Suspense>
          </motion.div>
        )}

        {currentScene === 'admin' && isAdmin && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Suspense fallback={null}><AdminDashboard /></Suspense>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
