"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter, Search, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Issue {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    author: {
        name: string;
    };
    address?: string;
}

export default function GovIssuesPage() {
    const { user, isAuthenticated, token } = useAuth();
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Restrict access removed for public viewing

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/issues`);
                if (res.ok) {
                    const data = await res.json();
                    setIssues(data);
                }
            } catch (error) {
                console.error("Failed to fetch issues", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    const filteredIssues = issues.filter(issue => {
        const matchesStatus = filterStatus === 'ALL' || issue.status === filterStatus;
        const matchesSearch = (issue.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (issue.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REPORTED': return 'bg-gray-100 text-gray-700';
            case 'ACKNOWLEDGED': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Auth checks removed, accessible to public

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="hidden sm:flex text-2xl font-bold tracking-tighter items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-slate-900">
                            सेवा<span className="text-cyan-600">सूचक</span> <span className="text-gray-500 text-lg ml-2 font-medium">Issue Management</span>
                        </span>
                    </div>
                    <div className="flex sm:hidden items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-lg font-bold text-slate-900">Issues</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/gov-portal" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Gov Portal
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                                <span className="text-sm text-gray-500 hidden sm:block">Welcome, {user.name}</span>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold border border-blue-200">
                                    {user.name.charAt(0)}
                                </div>
                                <button 
                                    onClick={() => { localStorage.removeItem('auth_token'); window.location.href = '/'; }} 
                                    className="text-sm text-red-500 hover:text-red-700 font-medium ml-2"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium border-l pl-4 border-gray-200">Sign In Here</Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto max-w-full">
                        {['ALL', 'REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status === 'ALL' ? 'All Issues' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredIssues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{issue.title}</span>
                                                <span className="text-sm text-gray-500 truncate max-w-xs">{issue.description}</span>
                                                {issue.address && (
                                                    <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        📍 {issue.address}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                {issue.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                {issue.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/gov-portal/issues/${issue.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                            >
                                                {user && (user.role === 'OFFICIAL' || user.role === 'ADMIN') ? 'Manage' : 'View'} <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredIssues.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No issues found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
