import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayStore } from '../store/usePlayStore';
import { Home, Settings, Pause, Zap, Trophy, Flame } from 'lucide-react';
import { GAMES } from '../constants';

interface GameShellProps {
  children: React.ReactNode;
}

const GameShell: React.FC<GameShellProps> = ({ children }) => {
  const { activeGameId, liveScore, profile, highScores, exitToDashboard } = usePlayStore();
  const gameMetadata = GAMES.find(g => g.id === activeGameId);
  const bestScore = activeGameId ? (highScores[activeGameId] || 0) : 0;

  return (
    <div className="fixed inset-0 bg-[#02040a] flex flex-col overflow-hidden">
      {/* V18.1 Unified Top Bar */}
      <div className="relative z-[60] w-full h-24 border-b border-white/5 bg-[#050816]/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
            <button
                onClick={exitToDashboard}
                className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"
            >
                <Home size={20} />
            </button>
            <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    {gameMetadata?.name || 'Unknown Reality'}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Active Session</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4 md:gap-12">
            {/* Live Score Display */}
            <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Current</div>
                <motion.div
                    key={liveScore}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-black italic text-white"
                >
                    {liveScore}
                </motion.div>
            </div>

            <div className="hidden md:block h-8 w-px bg-white/5" />

            {/* Platform Stats */}
            <div className="hidden md:flex gap-8">
                <div className="text-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                        <Trophy size={10} /> Best
                    </div>
                    <div className="text-lg font-black italic text-accent-gold">{bestScore}</div>
                </div>
                <div className="text-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                        <Zap size={10} /> Level
                    </div>
                    <div className="text-lg font-black italic text-accent-cyan">{profile.level}</div>
                </div>
                <div className="text-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                        <Flame size={10} /> Streak
                    </div>
                    <div className="text-lg font-black italic text-accent-rose">{profile.streak}</div>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/20 hover:text-white transition-all">
                <Pause size={18} />
            </button>
            <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/20 hover:text-white transition-all">
                <Settings size={18} />
            </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Safe Area Wrapper */}
        <div className="w-full h-full max-w-6xl mx-auto flex items-center justify-center">
            {children}
        </div>
      </div>

      {/* Visual Accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent z-[70]" />
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5" />
    </div>
  );
};

export default GameShell;
