import React, { useMemo } from 'react';
import { usePlayStore } from '../../shared/store/usePlayStore';
import { AnalyticsManager } from '../../shared/systems/AnalyticsManager';
import { ArrowLeft, TrendingUp, Users, Clock, Play, AlertCircle, BarChart3, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const { exitToDashboard } = usePlayStore();
    const rawEvents = useMemo(() => AnalyticsManager.getRawEvents(), []);

    const metrics = useMemo(() => {
        const stats: any = {
            totalSessions: 0,
            gameOpens: {},
            gameCompletions: {},
            gameRestarts: {},
            gameAbandons: {},
            totalPlayTime: 0,
            returningUsers: 0,
            dau: new Set(),
            sessionLengths: [],
        };

        rawEvents.forEach((ev: any) => {
            if (ev.event === 'session_start') {
                stats.totalSessions++;
                if (ev.is_returning) stats.returningUsers++;
                stats.dau.add(new Date(ev.timestamp).toDateString());
            }
            if (ev.event === 'session_end') stats.sessionLengths.push(ev.duration_seconds);
            if (ev.event === 'game_opened') stats.gameOpens[ev.game_id] = (stats.gameOpens[ev.game_id] || 0) + 1;
            if (ev.event === 'game_completed') {
                stats.gameCompletions[ev.game_id] = (stats.gameCompletions[ev.game_id] || 0) + 1;
                stats.totalPlayTime += ev.duration_seconds || 0;
            }
            if (ev.event === 'game_restarted') stats.gameRestarts[ev.game_id] = (stats.gameRestarts[ev.game_id] || 0) + 1;
            if (ev.event === 'game_abandoned') stats.gameAbandons[ev.game_id] = (stats.gameAbandons[ev.game_id] || 0) + 1;
        });

        const avgSession = stats.sessionLengths.length ? stats.sessionLengths.reduce((a:number,b:number)=>a+b,0) / stats.sessionLengths.length : 0;

        return { stats, avgSession };
    }, [rawEvents]);

    const topGames = Object.entries(metrics.stats.gameOpens)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-[#050816] text-white p-8 space-y-12 pb-32">
            <header className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-6">
                    <button onClick={exitToDashboard} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white"><ArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Command <span className="text-accent-cyan">Center</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Metrics V1</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20 text-accent-cyan font-black text-xs uppercase tracking-widest">
                        DAU: {metrics.stats.dau.size}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* High Level Stats */}
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 text-accent-cyan">
                        <Users size={20} />
                        <h2 className="text-xs font-black uppercase tracking-widest">User Base</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-4xl font-black italic">{metrics.stats.totalSessions}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Sessions</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black italic text-accent-cyan">{((metrics.stats.returningUsers / (metrics.stats.totalSessions || 1)) * 100).toFixed(1)}%</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Return Rate</div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 text-accent-gold">
                        <Clock size={20} />
                        <h2 className="text-xs font-black uppercase tracking-widest">Engagement</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-4xl font-black italic">{Math.round(metrics.avgSession)}s</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Avg Session Length</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black italic text-accent-gold">{Math.round(metrics.stats.totalPlayTime / 60)}m</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Play Time</div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 text-accent-rose">
                        <BarChart3 size={20} />
                        <h2 className="text-xs font-black uppercase tracking-widest">Top Performers</h2>
                    </div>
                    <div className="space-y-3">
                        {topGames.map(([id, count]: any) => (
                            <div key={id} className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{id}</span>
                                <span className="text-sm font-black italic">{count} opens</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Game Specific Table */}
                <div className="md:col-span-3 p-8 bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">Reality Performance Audit</h2>
                        <PieChart size={20} className="text-white/20" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">
                                    <th className="pb-4">Reality ID</th>
                                    <th className="pb-4">Opens</th>
                                    <th className="pb-4">Completions</th>
                                    <th className="pb-4">Restarts</th>
                                    <th className="pb-4">Abandons</th>
                                    <th className="pb-4">Completion %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {Object.keys(metrics.stats.gameOpens).map(id => {
                                    const opens = metrics.stats.gameOpens[id] || 0;
                                    const comps = metrics.stats.gameCompletions[id] || 0;
                                    return (
                                        <tr key={id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 text-[10px] font-black uppercase tracking-widest text-accent-cyan">{id}</td>
                                            <td className="py-4 text-sm font-bold">{opens}</td>
                                            <td className="py-4 text-sm font-bold">{comps}</td>
                                            <td className="py-4 text-sm font-bold text-accent-gold">{metrics.stats.gameRestarts[id] || 0}</td>
                                            <td className="py-4 text-sm font-bold text-accent-rose">{metrics.stats.gameAbandons[id] || 0}</td>
                                            <td className="py-4">
                                                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent-cyan"
                                                        style={{ width: `${(comps / (opens || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
