"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, Briefcase, Loader2, CheckCircle, BarChart3, Clock, AlertCircle } from 'lucide-react';

export default function GovProjectsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchIssues = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/issues`);
            if (res.ok) {
                const data = await res.json();
                // Filter to only include acknowledged, in progress, and resolved
                const trackingIssues = data.filter((issue: any) => 
                    ['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].includes(issue.status)
                );
                setIssues(trackingIssues);
            }
        } catch (error) {
            console.error("Failed to fetch issues", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const filteredIssues = issues.filter(issue => {
        const matchesStatus = filterStatus === 'ALL' || issue.status === filterStatus;
        const matchesSearch = (issue.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACKNOWLEDGED': return { bg: 'bg-blue-50/80', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
            case 'IN_PROGRESS': return { bg: 'bg-amber-50/80', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
            case 'RESOLVED': return { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
            default: return { bg: 'bg-gray-50/80', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };
        }
    };

    // Derived Statistics
    const activeCount = issues.filter(i => i.status === 'ACKNOWLEDGED' || i.status === 'IN_PROGRESS').length;
    const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-gray-500 font-medium">Loading tracking data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="hidden sm:flex text-2xl font-bold tracking-tight items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-slate-900 drop-shadow-sm">
                            सेवा<span className="text-cyan-600">सूचक</span> 
                            <span className="text-gray-400 text-2xl mx-2 font-light">|</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 text-lg font-bold">
                                Issue Tracking
                            </span>
                        </span>
                    </div>
                    <div className="flex sm:hidden items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-lg font-bold text-slate-900">Tracking</span>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <Link href="/gov-portal" className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">
                            Gov Portal
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-3 border-l-2 pl-5 border-gray-100">
                                <span className="text-sm text-gray-600 font-medium hidden sm:block">Welcome, {user.name}</span>
                                <div className="h-9 w-9 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200/50 shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium border-l pl-4 border-gray-200">Sign In Here</Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex items-center gap-5 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Tracked Issues</p>
                            <h3 className="text-3xl font-bold text-slate-800">{issues.length}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex items-center gap-5 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Active / In Progress</p>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                                {activeCount}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex items-center gap-5 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Successfully Resolved</p>
                            <h3 className="text-3xl font-bold text-slate-800">{resolvedCount}</h3>
                        </div>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col lg:flex-row gap-4 mb-8 justify-between items-center z-10 relative">
                    <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 overflow-x-auto w-full lg:w-auto overflow-y-hidden no-scrollbar">
                        {['ALL', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${filterStatus === status
                                        ? 'bg-white text-emerald-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {status === 'ALL' ? 'Overview' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full lg:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search tracked issues..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-0 ring-1 ring-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* List Grid */}
                {filteredIssues.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-gray-50/50">
                                <AlertCircle className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No active issues found</h3>
                            <p className="text-gray-500">There are no acknowledged or resolved issues mapping your criteria.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIssues.map((issue) => {
                            const statusStyles = getStatusStyles(issue.status);
                            
                            return (
                                <Link 
                                    href={`/gov-portal/issues/${issue.id}`} 
                                    key={issue.id} 
                                    className="group relative bg-white rounded-2xl border border-gray-100 p-7 flex flex-col h-full hover:border-emerald-200/60 hover:shadow-[0_12px_30px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 overflow-hidden"
                                >
                                    {/* Ambient top glow on hover */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot} animate-pulse`}></span>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                        {issue.category && (
                                            <span className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                                                {issue.category}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors mb-3 line-clamp-2 leading-tight">
                                        {issue.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-8 flex-grow">
                                        {issue.description}
                                    </p>
                                    
                                    <div className="mt-auto relative z-10 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5 bg-white shadow-sm border border-slate-100 px-2.5 py-1.5 rounded-md">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                Reported: {new Date(issue.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                            </div>
                                            <div className="flex items-center text-emerald-600 font-bold group-hover:translate-x-1.5 transition-transform bg-emerald-50 px-2.5 py-1.5 rounded-md">
                                                View Issue <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
}
