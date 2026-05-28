import React, { useState } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw } from 'lucide-react';

const Minesweeper: React.FC = () => {
  const { exitToDashboard, updateXP } = usePlayStore();
  const [board] = useState(() => Array(100).fill(0).map(() => Math.random() < 0.15 ? -1 : 0));
  const [revealed, setRevealed] = useState<boolean[]>(Array(100).fill(false));

  const reveal = (i: number) => {
    if (revealed[i]) return;
    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);
    if (board[i] !== -1) updateXP(5);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-8 gap-8">
      <div className="flex w-full max-w-sm justify-between items-center">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><Home size={20} /></button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mines</h2>
        <button onClick={() => setRevealed(Array(100).fill(false))} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><RotateCcw size={20} /></button>
      </div>

      <div className="grid grid-cols-10 grid-rows-10 gap-1 w-full max-w-sm aspect-square bg-white/5 p-2 rounded-3xl border border-white/10">
        {board.map((val, i) => (
            <div
                key={i}
                onClick={() => reveal(i)}
                className={`flex items-center justify-center text-xs font-black rounded-md cursor-pointer transition-all ${revealed[i] ? (val === -1 ? 'bg-accent-rose' : 'bg-white/10 opacity-40') : 'bg-white/10 hover:bg-white/20'}`}
            >
                {revealed[i] && val === -1 ? '!' : ''}
            </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweeper;
