import React, { useState } from 'react';
import { usePlayStore } from '../shared/store/usePlayStore';
import { User, Share2, Zap, TrendingUp, Clock, Play, Heart, Search, LayoutGrid, Award, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChallengeManager } from '../shared/systems/ChallengeManager';

const Dashboard: React.FC = () => {
  const { profile, launchGame, toggleFavorite, favorites, dailyChallenges } = usePlayStore();
  const modifier = ChallengeManager.getDailyModifier();
  const [activeTab, setActiveTab] = useState('all');

  const GAMES = [
    { id: 'last-light', name: 'Last Light', cat: 'Arcade', color: '#67e8f9', desc: 'Atmospheric light collection.' },
    { id: 'snake', name: 'Snake Zen', cat: 'Arcade', color: '#4ade80', desc: 'Minimalist snake action.' },
    { id: 'color-rush', name: 'Color Rush', cat: 'Skill', color: '#8B5CF6', desc: 'React to colors fast.' },
    { id: 'orbit-dodge', name: 'Orbit Dodge', cat: 'Skill', color: '#22D3EE', desc: 'Evasive maneuvers.' },
    { id: 'tap-dash', name: 'Tap Dash', cat: 'Skill', color: '#F472B6', desc: 'Clear the void fast.' },
    { id: '2048', name: '2048', cat: 'Logic', color: '#8b5cf6', desc: 'Merge the reality.' },
    { id: 'chess', name: 'Chess', cat: 'Logic', color: '#8B5CF6', desc: 'Grandmaster' },
    { id: 'minesweeper', name: 'Mines', cat: 'Logic', color: '#f9a8d4', desc: 'Clear the void.' },
    { id: 'connect4', name: 'Vector 4', cat: 'Logic', color: '#22D3EE', desc: 'Strategy Connect.' },
    { id: 'sudoku', name: 'Logic Grid', cat: 'Logic', color: '#8B5CF6', desc: 'Sudoku Master.' },
    { id: 'wordle', name: 'Word Crypt', cat: 'Logic', color: '#8B5CF6', desc: 'Daily Sequence.' },
    { id: 'tower', name: 'Stack Rush', cat: 'Arcade', color: '#8b5cf6', desc: 'Rhythm Stacking.' },
    { id: 'reaction', name: 'Reaction Arena', cat: 'Skill', color: '#67e8f9', desc: 'Speed test.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-accent-cyan/30">
      {/* Mobile-First Header */}
      <header className="p-6 md:p-12 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-cyan rounded-xl flex items-center justify-center text-black font-black italic text-xl shadow-[0_0_20px_rgba(103,232,249,0.3)]">P</div>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase">Play<span className="text-accent-cyan">verse</span></h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end mr-4 hidden md:block">
                <div className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">{profile.title}</div>
                <div className="text-xs font-bold text-white/40">LVL {profile.level}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40"><User size={20} /></div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 space-y-12 pb-32">
        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                <Zap size={16} className="text-accent-gold" />
                <div className="text-2xl font-black italic">{profile.streak}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Day Streak</div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                <Sparkles size={16} className="text-accent-rose" />
                <div className="text-2xl font-black italic truncate">{modifier.name}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Daily Event</div>
            </div>
            {/* Daily Challenge Preview */}
            <div className="col-span-2 p-6 bg-accent-cyan/10 rounded-3xl border border-accent-cyan/20 flex items-center justify-between group">
                <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-accent-cyan mb-1">Daily Challenge</div>
                    <div className="text-sm font-bold truncate max-w-[200px]">{dailyChallenges[0].description}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/20 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                    <Award size={24} />
                </div>
            </div>
        </section>

        {/* Featured break-out game */}
        <section className="relative group cursor-pointer" onClick={() => launchGame('last-light')}>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/20 to-accent-violet/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-12 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-12 overflow-hidden">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-cyan rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-cyan">Featured Reality</span>
                    </div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Last Light</h2>
                    <p className="text-white/40 max-w-md font-medium">The most played reality in the universe. Can you maintain the light?</p>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-accent-cyan text-black font-black uppercase tracking-widest text-[10px] rounded-xl">Play Now</div>
                        <div className="px-6 py-3 bg-white/5 text-white/40 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/10">1.2M Players</div>
                    </div>
                </div>
                <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse" />
                    <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_50px_white]" />
                </div>
            </div>
        </section>

        {/* Discovery Feed */}
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Discover</h2>
                <div className="flex gap-2">
                    {['all', 'arcade', 'logic'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}>{t}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GAMES.filter(g => activeTab === 'all' || g.cat.toLowerCase() === activeTab).map(game => (
                    <motion.div
                        key={game.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => launchGame(game.id)}
                        className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between h-64 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={32} className="text-accent-cyan" fill="currentColor" />
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center" style={{ color: game.color }}>
                                <Play size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{game.name}</h3>
                                <p className="text-xs text-white/30 font-medium">{game.cat}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-accent-cyan transition-colors">Start Session</div>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }} className={favorites.includes(game.id) ? 'text-accent-rose' : 'text-white/10'}>
                                <Heart size={20} fill={favorites.includes(game.id) ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
      </main>

      {/* Thumb-First Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-3 flex justify-between items-center shadow-2xl z-[100]">
          <button className="flex-1 flex flex-col items-center gap-1 text-accent-cyan">
              <LayoutGrid size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest">Universe</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 text-white/20">
              <Award size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest">Hall</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 text-white/20">
              <Share2 size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest">Social</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 text-white/20">
              <Settings size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest">Core</span>
          </button>
      </nav>
    </div>
  );
};

export default Dashboard;
