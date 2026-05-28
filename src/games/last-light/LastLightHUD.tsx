import React from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { EvolutionLevel } from './types';
import { motion } from 'framer-motion';

const LastLightHUD: React.FC = () => {
  const { lastLight } = usePlayStore();
  if (!lastLight) return null;
  const { energy, evolutionLevel, evolutionProgress, totalMemoriesCollected } = lastLight;

  const levelName = (EvolutionLevel as any)[evolutionLevel];

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 select-none">
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
