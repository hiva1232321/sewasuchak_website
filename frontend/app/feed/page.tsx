"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Issue {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    author: {
        name: string | null;
    };
    _count: {
        votes: number;
    };
    location?: { lat: number, lng: number }; // Optional for list view
}

export default function FeedPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await fetch('http://localhost:3001/issues');
                if (res.ok) {
                    const data = await res.json();
                    setIssues(data);
                } else {
                    console.error("Failed to fetch issues");
                }
            } catch (error) {
                console.error("Error fetching issues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="pt-24 pb-12 container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Community Reports</h1>
                        <p className="text-slate-500">Real-time updates on reported issues in your area.</p>
                    </div>
                    <Link href="/report" className="btn-primary flex items-center gap-2 shadow-cyan-500/20">
                        <span>+ New Report</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {issues.map((issue) => (
                            <motion.div
                                key={issue.id}
                                variants={itemVariants}
                            >
                                <Link href={`/report/${issue.id}`} className="block h-full">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                                {issue.category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${issue.status === 'OPEN' ? 'bg-green-100 text-green-600' :
                                                    issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {issue.status}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{issue.title}</h3>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">
                                            {issue.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                    {issue.author.name?.charAt(0) || 'U'}
                                                </div>
                                                <span>{issue.author.name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span>👍 {issue._count.votes}</span>
                                                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}

                        {issues.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400">
                                <p className="text-xl">No reports found yet.</p>
                                <p className="text-sm">Be the first to create one!</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
