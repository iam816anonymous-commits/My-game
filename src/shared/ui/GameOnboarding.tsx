import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, X } from 'lucide-react';

interface Props {
  gameId: string;
  onClose: () => void;
}

const INSTRUCTIONS: Record<string, { title: string, steps: string[] }> = {
  'last-light': {
    title: 'Last Light',
    steps: [
      'Control the light orb with mouse or touch.',
      'Collect memory particles to restore energy.',
      'Avoid running out of energy as the light fades.',
      'Build combos by collecting rapidly to evolve the world.'
    ]
  },
  'chess': {
    title: 'Grandmaster Chess',
    steps: [
      'Classical chess rules apply.',
      'Select a piece to see valid moves.',
      'Promote pawns by reaching the final rank.',
      'Defeat the AI to earn massive XP.'
    ]
  },
  'snake': {
    title: 'Snake Zen',
    steps: [
      'Use Arrow Keys or WASD to move.',
      'Collect food to grow and increase score.',
      'Avoid walls and your own tail.',
      'Higher speed phases yield bigger multipliers.'
    ]
  },
  '2048': {
    title: '2048 Fusion',
    steps: [
      'Use Arrow Keys or Swipe to slide tiles.',
      'Matching tiles merge into their sum.',
      'Reach the 2048 tile to win.',
      'Plan your moves to avoid a locked grid.'
    ]
  }
};

const GameOnboarding: React.FC<Props> = ({ gameId, onClose }) => {
  const info = INSTRUCTIONS[gameId] || { title: 'How to Play', steps: ['Reach the goal and avoid failure.', 'Master the controls to level up.'] };

  return (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0a0f] border border-white/10 rounded-[3rem] p-12 max-w-md w-full shadow-2xl space-y-8 text-center relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-rose" />

            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                <BookOpen size={32} className="text-accent-cyan" />
            </div>

            <div className="space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{info.title}</h2>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Protocol</div>
            </div>

            <div className="space-y-4 text-left">
                {info.steps.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-accent-cyan group-hover:bg-accent-cyan group-hover:text-black transition-colors shrink-0">
                            {i + 1}
                        </div>
                        <p className="text-white/60 font-medium text-sm leading-relaxed">{step}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={onClose}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl"
            >
                <Play size={20} fill="currentColor" /> Initiate Reality
            </button>
        </motion.div>
    </motion.div>
  );
};

export default GameOnboarding;
