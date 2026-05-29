import React from 'react';
import { motion } from 'framer-motion';
import { usePlayStore } from '../store/usePlayStore';
import { RotateCcw, Home, Share2, Award, Zap, Check } from 'lucide-react';
import { copyShareLink } from '../systems/SocialManager';
import { JuiceManager } from '../systems/JuiceManager';

const PostGameOverlay: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const { sessionStats, activeGameId, profile, exitToDashboard, launchGame } = usePlayStore();

  React.useEffect(() => {
    JuiceManager.success();
    JuiceManager.shake(10);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0c]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center space-y-12 shadow-2xl"
      >
        <div className="space-y-4">
            <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-accent-cyan/20 rounded-3xl mx-auto flex items-center justify-center text-accent-cyan"
            >
                <Award size={48} />
            </motion.div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Reality Sync</h2>
            <p className="text-white/40 text-sm font-bold tracking-widest uppercase">{profile.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Score</div>
                <div className="text-3xl font-black italic text-accent-cyan">{sessionStats.lastScore}</div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Streak</div>
                <div className="text-3xl font-black italic text-accent-gold flex items-center justify-center gap-2">
                    <Zap size={24} fill="currentColor" /> {profile.streak}
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-2">
                <span className="text-white/30">Progression</span>
                <span className="text-accent-cyan">LVL {profile.level}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile.xp % 1000) / 10}%` }}
                    className="h-full bg-accent-cyan rounded-full shadow-[0_0_20px_rgba(103,232,249,0.5)]"
                />
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <button
                onClick={exitToDashboard}
                className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-2"
            >
                <Home size={20} className="opacity-40" />
                <span className="text-[8px] font-black uppercase tracking-widest">Hub</span>
            </button>
            <button
                onClick={() => launchGame(activeGameId!)}
                className="p-6 bg-accent-cyan text-black rounded-3xl border border-accent-cyan/20 hover:scale-105 transition-all flex flex-col items-center gap-2 shadow-[0_20px_40px_rgba(103,232,249,0.2)]"
            >
                <RotateCcw size={20} />
                <span className="text-[8px] font-black uppercase tracking-widest">Replay</span>
            </button>
            <button
                onClick={() => {
                    copyShareLink();
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-2 ${copied ? 'bg-accent-rose/20 border-accent-rose/50 text-accent-rose' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
                {copied ? <Check size={20} /> : <Share2 size={20} className="opacity-40" />}
                <span className="text-[8px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Viral'}</span>
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PostGameOverlay;
