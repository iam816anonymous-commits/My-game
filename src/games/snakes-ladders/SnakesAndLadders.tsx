import React, { useState, useEffect, useCallback } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { Home, RotateCcw, Trophy, User, Bot, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SnakesAndLadders: React.FC = () => {
  const { exitToDashboard, updateXP, finishGame } = usePlayStore();
  const [dice, setDice] = useState(1);
  const [playerPos, setPos] = useState(1);
  const [aiPos, setAiPos] = useState(1);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<string[]>(['Match Online']);

  const MAP: Record<number, number> = {
      // Ladders
      3: 22, 5: 8, 11: 26, 20: 29, 27: 44, 35: 54, 45: 70, 60: 82, 77: 95,
      // Snakes
      17: 4, 19: 7, 21: 9, 34: 12, 51: 30, 62: 18, 87: 24, 93: 68, 99: 10
  };

  const addLog = (msg: string) => setHistory(prev => [msg, ...prev].slice(0, 5));

  const executeMove = useCallback((currentPos: number, setPosition: React.Dispatch<React.SetStateAction<number>>, name: string) => {
      setIsRolling(true);
      setTimeout(() => {
          const d = Math.floor(Math.random() * 6) + 1;
          setDice(d);
          let newPos = currentPos + d;
          let event = `${name} rolled ${d}`;

          if (newPos > 100) {
              newPos = currentPos;
              event += ' (Overshot)';
          } else if (MAP[newPos]) {
              const jump = MAP[newPos];
              if (jump > newPos) {
                  event += ` -> Ladder to ${jump}!`;
                  if (name === 'PLAYER') updateXP(100);
              } else {
                  event += ` -> Snake to ${jump}...`;
              }
              newPos = jump;
          }

          setPosition(newPos);
          addLog(event);
          setIsRolling(false);

          if (newPos === 100) {
              if (name === 'PLAYER') {
                updateXP(1000);
                finishGame(100);
              } else {
                finishGame(0);
              }
          } else {
              setTurn(name === 'PLAYER' ? 'ai' : 'player');
          }
      }, 800);
  }, [updateXP, finishGame]);

  const roll = () => {
      if (isRolling || turn !== 'player' || playerPos === 100 || aiPos === 100) return;
      executeMove(playerPos, setPos, 'PLAYER');
  };

  useEffect(() => {
      if (turn === 'ai' && !isRolling && playerPos < 100 && aiPos < 100) {
          const t = setTimeout(() => executeMove(aiPos, setAiPos, 'AI CORE'), 800); // V11: Faster AI
          return () => clearTimeout(t);
      }
  }, [turn, isRolling, aiPos, playerPos, executeMove]);

  const reset = () => {
      setPos(1);
      setAiPos(1);
      setTurn('player');
      setHistory(['System Reset']);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050816] p-4 gap-6 overflow-hidden">
      <div className="flex w-full max-w-sm justify-between items-center z-10">
        <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><Home size={20} /></button>
        <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Prism <span className="text-accent-rose text-glow">Ladders</span></h2>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">V10 Authentic Board</div>
        </div>
        <button onClick={reset} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
          <div className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-between ${turn === 'player' ? 'bg-accent-rose/10 border-accent-rose shadow-[0_0_15px_rgba(244,114,182,0.2)]' : 'bg-white/5 border-white/5 opacity-40'}`}>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">PLAYER</div>
                  <div className="text-lg font-black text-white tabular-nums">{playerPos}</div>
              </div>
              <User size={16} className={turn === 'player' ? 'text-accent-rose' : 'text-white/20'} />
          </div>
          <div className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-between ${turn === 'ai' ? 'bg-accent-cyan/10 border-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 opacity-40'}`}>
              <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">AI CORE</div>
                  <div className="text-lg font-black text-white tabular-nums">{aiPos}</div>
              </div>
              <Bot size={16} className={turn === 'ai' ? 'text-accent-cyan' : 'text-white/20'} />
          </div>
      </div>

      <div className="relative w-full max-w-md aspect-square bg-[#0a0a0f] rounded-[2rem] border border-white/10 p-1 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-0.5">
              {Array.from({ length: 100 }).map((_, i) => {
                  const r = Math.floor(i / 10);
                  const c = i % 10;
                  const num = (r % 2 === 0) ? (100 - (r * 10) - c) : (100 - (r * 10) - (9 - c));
                  const isPlayer = playerPos === num;
                  const isAi = aiPos === num;
                  const isLadder = Object.entries(MAP).some(([k, v]) => parseInt(k) === num && v > num);
                  const isSnake = Object.entries(MAP).some(([k, v]) => parseInt(k) === num && v < num);

                  return (
                      <div key={num} className={`relative flex items-center justify-center rounded-sm text-[8px] font-bold transition-all duration-500 ${
                          isPlayer ? 'bg-accent-rose text-black shadow-[0_0_20px_#f472b6] z-20 scale-110' :
                          isAi ? 'bg-accent-cyan text-black shadow-[0_0_20px_#22d3ee] z-10 scale-110' :
                          isLadder ? 'bg-accent-cyan/10 text-accent-cyan/40 shadow-inner' :
                          isSnake ? 'bg-accent-rose/10 text-accent-rose/40 shadow-inner' :
                          'bg-white/[0.02] text-white/10'
                      }`}>
                          {num}
                          {isLadder && <div className="absolute inset-0 border border-accent-cyan/10" />}
                          {isSnake && <div className="absolute inset-0 border border-accent-rose/10" />}
                      </div>
                  );
              })}
          </div>

          <AnimatePresence>
              {(playerPos === 100 || aiPos === 100) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center z-50">
                      <Trophy size={64} className={playerPos === 100 ? 'text-accent-rose' : 'text-white/20'} />
                      <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">{playerPos === 100 ? 'Ascended' : 'Core Dominated'}</h3>
                      <button onClick={reset} className="px-12 py-6 bg-accent-rose text-white font-black uppercase tracking-widest rounded-2xl shadow-lg">New Cycle</button>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <div className="flex gap-4 items-center w-full max-w-md">
          <div className="flex-1 h-24 p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1 overflow-hidden">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Match Stream</div>
              {history.map((h, i) => (
                  <div key={i} className={`text-[10px] font-black truncate uppercase ${i === 0 ? 'text-white' : 'text-white/20'}`}>{h}</div>
              ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={turn !== 'player' || isRolling}
            onClick={roll}
            className={`w-24 h-24 rounded-3xl border flex items-center justify-center text-4xl font-black italic shadow-xl transition-all
                ${turn !== 'player' || isRolling ? 'bg-white/5 border-white/10 text-white/20' : 'bg-accent-rose border-accent-rose text-black shadow-accent-rose/40 hover:scale-105'}`}
          >
              <AnimatePresence mode="wait">
                  <motion.div key={dice} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={isRolling ? 'animate-spin' : ''}>
                      {dice}
                  </motion.div>
              </AnimatePresence>
          </motion.button>
      </div>

      <div className="text-[10px] text-white/10 uppercase font-black tracking-[0.4em] italic flex items-center gap-2">
          <AlertCircle size={12} /> Momentum shifts with every roll
      </div>
    </div>
  );
};

export default SnakesAndLadders;
