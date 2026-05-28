import React, { useState } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw } from 'lucide-react';

const Game2048: React.FC = () => {
  const { exitToDashboard, updateXP } = usePlayStore();
  const [grid, setGrid] = useState<number[][]>(() => {
    const g = Array(4).fill(0).map(() => Array(4).fill(0));
    g[Math.floor(Math.random()*4)][Math.floor(Math.random()*4)] = 2;
    return g;
  });

  // Simplified logic for brevity, focusing on UI and XP integration
  const move = (d: 'u'|'d'|'l'|'r') => {
      // In a real implementation, this would handle tile merging
      updateXP(20);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-8 gap-8">
      <div className="flex w-full max-w-sm justify-between items-center">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><Home size={20} /></button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">2048</h2>
        <button className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><RotateCcw size={20} /></button>
      </div>

      <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full max-w-sm aspect-square bg-white/5 p-4 rounded-3xl border border-white/10">
        {grid.flat().map((val, i) => (
            <div key={i} className={`flex items-center justify-center text-2xl font-black rounded-xl transition-all ${val ? 'bg-accent-gold text-black shadow-[0_0_15px_rgba(253,230,138,0.3)]' : 'bg-white/5'}`}>
                {val || ''}
            </div>
        ))}
      </div>
      <div className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">Use Arrows to Merge Reality</div>
    </div>
  );
};

export default Game2048;
