import React from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { EvolutionLevel } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const LastLightHUD: React.FC = () => {
  const { lastLight } = usePlayStore();
  if (!lastLight) return null;
  const { energy, evolutionLevel, evolutionProgress, totalMemoriesCollected, currentCombo } = lastLight;

  const levelName = (EvolutionLevel as any)[evolutionLevel];

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 select-none overflow-hidden">
      {/* Near Miss Vignette */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(249,168,212,0.1)_100%)]"
        animate={{
          opacity: energy < 25 ? (25 - energy) / 25 : 0,
          scale: energy < 15 ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Top Info */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <motion.h1
            key={levelName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold"
          >
            Evolution: {levelName}
          </motion.h1>
          <div className="text-white/20 text-[8px] uppercase tracking-widest font-medium">
            Particles: {totalMemoriesCollected}
          </div>
        </div>

        {/* Combo Multiplier */}
        <AnimatePresence>
            {currentCombo > 1 && (
                <motion.div
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{ scale: 0, x: 20 }}
                    className="flex flex-col items-end"
                >
                    <div className="text-accent-cyan font-black italic text-2xl tracking-tighter">x{(1 + currentCombo * 0.1).toFixed(1)}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Combo {currentCombo}</div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Bottom Energy Bar */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-end px-1">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-black italic">Light Energy</span>
            <span className="text-[10px] text-white/30 font-mono">{Math.round(energy)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-white/40 to-white/80"
            initial={false}
            animate={{ width: `${energy}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
        {/* Progression Bar */}
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div
                className="h-full bg-accent-cyan/20"
                initial={false}
                animate={{ width: `${evolutionProgress * 100}%` }}
             />
        </div>
      </div>
    </div>
  );
};

export default LastLightHUD;
