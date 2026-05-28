import React from 'react';
import { usePlayStore } from '../shared/store/usePlayStore';
import { User, Share2, Zap, TrendingUp, Clock, Play, Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { profile, launchGame, toggleFavorite, favorites } = usePlayStore();

  const GAMES = [
    { id: 'last-light', name: 'Last Light', cat: 'Arcade', color: '#67e8f9', desc: 'Atmospheric light collection.' },
    { id: 'snake', name: 'Snake Zen', cat: 'Arcade', color: '#4ade80', desc: 'Minimalist snake action.' },
    { id: 'chess', name: 'Grandmaster', cat: 'Board', color: '#fde68a', desc: 'Classical strategy.' },
    { id: '2048', name: '2048', cat: 'Logic', color: '#8b5cf6', desc: 'Merge the reality.' },
    { id: 'minesweeper', name: 'Mines', cat: 'Logic', color: '#f9a8d4', desc: 'Clear the void.' },
  ];

  return (
    <div className="min-h-screen p-8 md:p-16 bg-[#0a0a0c] text-white space-y-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <h1 className="text-6xl font-black tracking-tighter italic leading-tight">PLAY<span className="text-accent-cyan">VERSE</span></h1>
           <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-bold mt-2">Premium Browser Mini-Games</p>
        </div>
        <div className="flex items-center gap-4">
            <button className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/20 hover:text-white"><Share2 size={20} /></button>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-violet/20 flex items-center justify-center text-accent-violet"><User size={24} /></div>
                <div>
                    <div className="font-black italic uppercase tracking-tighter text-lg">{profile.name}</div>
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Lvl {profile.level} • {profile.xp} XP</div>
                </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
              { icon: <TrendingUp className="text-accent-cyan" />, label: 'Rank', value: '#42 Global' },
              { icon: <Zap className="text-accent-gold" />, label: 'Streak', value: `${profile.streak} Days` },
              { icon: <Clock className="text-accent-rose" />, label: 'Played', value: '12.4 Hours' },
          ].map((stat, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6">
                  <div className="p-4 bg-white/5 rounded-2xl">{stat.icon}</div>
                  <div>
                      <div className="text-[10px] text-white/20 uppercase font-black tracking-widest">{stat.label}</div>
                      <div className="text-xl font-black italic uppercase tracking-tighter">{stat.value}</div>
                  </div>
              </div>
          ))}
      </div>

      <section className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/5">
                  {['All', 'Board', 'Logic', 'Arcade'].map(c => (
                      <button key={c} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${c === 'All' ? 'bg-accent-cyan text-black' : 'text-white/40 hover:text-white'}`}>{c}</button>
                  ))}
              </div>
              <div className="relative w-full md:w-96">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="text" placeholder="Search Universe..." className="w-full bg-white/5 border border-white/5 rounded-full py-5 pl-16 pr-8 outline-none focus:border-accent-cyan/50 transition-all font-bold tracking-tight text-sm" />
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {GAMES.map(game => (
                  <motion.div
                    key={game.id}
                    whileHover={{ y: -10 }}
                    className="group relative bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-full"
                  >
                    <div className="p-10 flex-1 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="p-5 rounded-2xl bg-white/5" style={{ color: game.color }}>
                                <Play size={24} fill="currentColor" />
                            </div>
                            <button onClick={() => toggleFavorite(game.id)} className={`transition-all ${favorites.includes(game.id) ? 'text-accent-rose' : 'text-white/10 hover:text-white'}`}>
                                <Heart size={24} fill={favorites.includes(game.id) ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{game.name}</h3>
                            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] w-fit opacity-40">{game.cat}</div>
                        </div>
                        <p className="text-xs text-white/40 font-medium leading-relaxed">{game.desc}</p>
                    </div>
                    <button
                        onClick={() => launchGame(game.id)}
                        className="w-full py-6 bg-white/5 hover:bg-accent-cyan hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.3em] border-t border-white/5"
                    >
                        Enter Reality
                    </button>
                  </motion.div>
              ))}
          </div>
      </section>
    </div>
  );
};

export default Dashboard;
