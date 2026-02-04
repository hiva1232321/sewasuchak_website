"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowUp, MapPin, Activity } from 'lucide-react';
import Link from 'next/link';

interface Issue {
    id: string;
    title: string;
    location: string; // address
    votes: number;
    status: string;
    description: string;
}

export default function LiveIssueTracker() {
    const [trendingIssues, setTrendingIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrendingIssues = async () => {
        try {
            const res = await fetch('http://localhost:3001/issues');
            const data = await res.json();

            if (Array.isArray(data)) {
                // Logic: Filter for OPEN/IN_PROGRESS, Sort by Votes (High -> Low), status 'OPEN' or 'IN_PROGRESS'
                const filtered = data
                    .filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS')
                    .sort((a: any, b: any) => (b._count?.votes || 0) - (a._count?.votes || 0))
                    .slice(0, 4); // Top 4

                setTrendingIssues(filtered.map((i: any) => ({
                    id: i.id,
                    title: i.title,
                    location: i.address || "Unknown Location",
                    votes: i._count?.votes || 0,
                    status: i.status,
                    description: i.description
                })));
            }
        } catch (error) {
            console.error("Error fetching live issues:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrendingIssues();

        // Poll every 5 seconds for "Real-Time" updates
        const interval = setInterval(fetchTrendingIssues, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm">
            <div className="glass-card p-6 border-l-4 border-l-cyan-500 relative overflow-hidden bg-white/60 backdrop-blur-xl shadow-xl border-slate-200">
                {/* Background Decoration */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-600 animate-pulse" />
                        Trending Issues
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-700 font-bold bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                        LIVE FEED
                    </span>
                </div>

                <div className="space-y-4 relative z-10 min-h-[300px]">
                    {loading && trendingIssues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 py-10">
                            <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                            <span className="text-xs">Syncing data...</span>
                        </div>
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {trendingIssues.map((issue, index) => (
                                <motion.div
                                    layout
                                    key={issue.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link href={`/report/${issue.id}`} className="block group">
                                        <div className="p-3 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 transition-all shadow-sm hover:shadow-md">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-cyan-600 transition-colors">
                                                        <span className="mr-2 text-cyan-600/70 text-xs">#{index + 1}</span>
                                                        {issue.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="truncate">{issue.location}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center bg-slate-50 min-w-[40px] h-[40px] rounded-lg border border-slate-200">
                                                    <ArrowUp className="w-3 h-3 text-green-500 mb-0.5" />
                                                    <span className="text-xs font-bold text-slate-700">{issue.votes}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(issue.votes * 5, 100)}%` }}
                                                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                                    />
                                                </div>
                                                <span className={`text-[10px] uppercase font-semibold ${issue.status === 'IN_PROGRESS' ? 'text-amber-600' : 'text-cyan-600'
                                                    }`}>{issue.status}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {trendingIssues.length === 0 && !loading && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No trending issues right now.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
