import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Star } from 'lucide-react';

interface Props {
  gameName: string;
  score: number;
  title: string;
  level: number;
}

const ShareCard: React.FC<Props> = ({ gameName, score, title, level }) => {
  return (
    <div className="w-[300px] aspect-[4/5] bg-[#050816] border-2 border-white/10 rounded-[3rem] p-8 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-violet/10 pointer-events-none" />

      <div className="space-y-1 z-10">
          <div className="text-[8px] font-black uppercase tracking-[0.5em] text-accent-cyan">Mission Complete</div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{gameName}</h3>
      </div>

      <div className="relative z-10">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mx-auto mb-4">
              <Award size={40} className="text-accent-gold" />
          </div>
          <div className="text-5xl font-black italic text-white tracking-tighter">{score}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Reality Score</div>
      </div>

      <div className="w-full bg-white/5 rounded-2xl p-4 space-y-2 z-10 border border-white/5">
          <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-white/30">{title}</span>
              <span className="text-[10px] font-black text-accent-cyan">LVL {level}</span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent-cyan w-2/3" />
          </div>
      </div>

      <div className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-accent-cyan rounded-lg flex items-center justify-center text-black font-black italic">P</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">Play<span className="text-accent-cyan">verse</span></div>
      </div>
    </div>
  );
};

export default ShareCard;
