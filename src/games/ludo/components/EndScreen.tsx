import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCcw, LayoutDashboard, Target, Zap, Dice5 } from 'lucide-react';
import type { PlayerConfig } from '../types';

interface EndScreenProps {
    winnerIndex: number;
    players: PlayerConfig[];
    turns: number;
    captures: number;
    luckRating: number;
    onReset: () => void;
    onExit: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({
    winnerIndex,
    players,
    turns,
    captures,
    luckRating,
    onReset,
    onExit
}) => {
    const winner = players[winnerIndex];
    const COLORS = ['text-red-500', 'text-blue-500', 'text-yellow-500', 'text-green-500'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[110] bg-[#050816]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-y-auto"
        >
            <div className="max-w-md w-full space-y-8 py-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-24 h-24 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto border border-accent-gold/50 shadow-[0_0_50px_rgba(250,204,21,0.2)]"
                    >
                        <Trophy size={48} className="text-accent-gold" />
                    </motion.div>

                    <div className="space-y-1">
                        <div className="text-accent-gold font-black uppercase tracking-[0.3em] text-[10px]">Victory Sequence Complete</div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                            {winnerIndex === 0 ? 'Cycle Won' : 'System Error'}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-1">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                            <Trophy size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Champion</span>
                        </div>
                        <div className={`text-xl font-black uppercase truncate ${COLORS[winnerIndex]}`}>{winner.name}</div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-1">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                            <Zap size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Efficiency</span>
                        </div>
                        <div className="text-xl font-black text-white uppercase">{turns} Turns</div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-1">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                            <Target size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Aggression</span>
                        </div>
                        <div className="text-xl font-black text-white uppercase">{captures} Captures</div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-1">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                            <Dice5 size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Luck Rating</span>
                        </div>
                        <div className="text-xl font-black text-white uppercase">{luckRating.toFixed(1)}%</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onReset}
                        className="w-full py-5 bg-accent-gold text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent-gold/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <RefreshCcw size={16} />
                        New Cycle
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full py-5 bg-white/5 text-white/60 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 transition-all"
                    >
                        <LayoutDashboard size={16} />
                        Exit to Terminal
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EndScreen;
