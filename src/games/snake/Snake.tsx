import React, { useState, useEffect } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw } from 'lucide-react';

const Snake: React.FC = () => {
  const { exitToDashboard, updateXP } = usePlayStore();
  const [snake, setSnake] = useState([[10, 10], [10, 11], [10, 12]]);
  const [food, setFood] = useState([5, 5]);
  const [dir, setDir] = useState([0, -1]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = [prev[0][0] + dir[0], prev[0][1] + dir[1]];
        if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 20 || prev.some(s => s[0] === head[0] && s[1] === head[1])) {
          setGameOver(true);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head[0] === food[0] && head[1] === food[1]) {
          setFood([Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]);
          updateXP(50);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [dir, food, gameOver, updateXP]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir[1] !== 1) setDir([0, -1]);
      if (e.key === 'ArrowDown' && dir[1] !== -1) setDir([0, 1]);
      if (e.key === 'ArrowLeft' && dir[0] !== 1) setDir([-1, 0]);
      if (e.key === 'ArrowRight' && dir[0] !== -1) setDir([1, 0]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-8 gap-8">
      <div className="flex w-full max-w-md justify-between items-center">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><Home size={20} /></button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Snake <span className="text-accent-cyan">Zen</span></h2>
        <button onClick={() => { setSnake([[10,10],[10,11],[10,12]]); setGameOver(false); }} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><RotateCcw size={20} /></button>
      </div>

      <div className="relative w-full max-w-md aspect-square bg-white/5 rounded-3xl border border-white/10 overflow-hidden grid grid-cols-20 grid-rows-20 p-1">
        {Array.from({ length: 400 }).map((_, i) => {
            const x = i % 20;
            const y = Math.floor(i / 20);
            const isSnake = snake.some(s => s[0] === x && s[1] === y);
            const isFood = food[0] === x && food[1] === y;
            return (
                <div key={i} className={`rounded-sm transition-all duration-300 ${isSnake ? 'bg-accent-cyan scale-95 shadow-[0_0_10px_rgba(103,232,249,0.5)]' : isFood ? 'bg-accent-rose animate-pulse' : 'bg-transparent'}`} />
            );
        })}
        {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Void Reached</h3>
                <button onClick={() => { setSnake([[10,10],[10,11],[10,12]]); setGameOver(false); }} className="px-8 py-3 bg-accent-cyan text-black font-black uppercase tracking-widest rounded-xl">Rebirth</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Snake;
