import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Trash2, ChevronRight, Settings2 } from 'lucide-react';
import type { PlayerConfig, PlayerType, Difficulty } from '../types';

interface LobbyProps {
    players: PlayerConfig[];
    onUpdatePlayer: (index: number, config: Partial<PlayerConfig>) => void;
    onStart: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ players, onUpdatePlayer, onStart }) => {
    const COLORS = ['border-red-500', 'border-blue-500', 'border-yellow-500', 'border-green-500'];
    const BG_COLORS = ['bg-red-500/10', 'bg-blue-500/10', 'bg-yellow-500/10', 'bg-green-500/10'];
    const TEXT_COLORS = ['text-red-400', 'text-blue-400', 'text-yellow-400', 'text-green-400'];

    const toggleType = (index: number) => {
        const types: PlayerType[] = ['HUMAN', 'AI', 'EMPTY'];
        const current = players[index].type;
        const next = types[(types.indexOf(current) + 1) % types.length];
        onUpdatePlayer(index, { type: next });
    };

    const toggleDifficulty = (index: number) => {
        const diffs: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
        const current = players[index].difficulty;
        const next = diffs[(diffs.indexOf(current) + 1) % diffs.length];
        onUpdatePlayer(index, { difficulty: next });
    };

    const readyToStart = players.filter(p => p.type !== 'EMPTY').length >= 2;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl p-8 bg-[#0a0a0f] rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Neon Ludo <span className="text-accent-gold">V2</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Configure Pulse Reality Cycle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player, i) => (
                    <div
                        key={i}
                        className={`p-6 rounded-3xl border-2 transition-all ${player.type === 'EMPTY' ? 'border-white/5 bg-white/5 opacity-50' : `${COLORS[i]} ${BG_COLORS[i]}`}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`text-[10px] font-black uppercase tracking-widest ${TEXT_COLORS[i]}`}>
                                Node 0{i + 1}
                            </div>
                            <button onClick={() => toggleType(i)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                {player.type === 'HUMAN' && <User size={18} className="text-white" />}
                                {player.type === 'AI' && <Bot size={18} className="text-white" />}
                                {player.type === 'EMPTY' && <Trash2 size={18} className="text-white/20" />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-xl font-black italic text-white uppercase tracking-tight">
                                {player.type === 'EMPTY' ? 'Empty Slot' : player.type === 'HUMAN' ? 'Human User' : `AI: ${player.difficulty}`}
                            </div>

                            {player.type === 'AI' && (
                                <button
                                    onClick={() => toggleDifficulty(i)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                >
                                    <Settings2 size={10} />
                                    Change Level
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                disabled={!readyToStart}
                onClick={onStart}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 transition-all
                    ${readyToStart ? 'bg-accent-gold text-black shadow-lg shadow-accent-gold/20 hover:scale-[1.02] active:scale-95' : 'bg-white/5 text-white/20'}`}
            >
                Initialize Game Cycle
                <ChevronRight size={16} />
            </button>
        </motion.div>
    );
};

export default Lobby;
