"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ClipboardList, Briefcase, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function GovPortalLandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="hidden sm:flex text-2xl font-bold tracking-tighter items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-slate-900">
                            सेवा<span className="text-cyan-600">सूचक</span> <span className="text-gray-500 text-lg ml-2 font-medium">Gov Portal</span>
                        </span>
                    </div>
                    <div className="flex sm:hidden items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-lg font-bold text-slate-900">Gov Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Exit Portal
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 hidden sm:block">Welcome, {user.name}</span>
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold border border-blue-200">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { localStorage.removeItem('auth_token'); window.location.href = '/'; }} 
                                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium border-l pl-4 border-gray-200">
                                Sign In Here
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1">Manage public issues and infrastructure projects.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Issue Tracker Card */}
                    <Link href="/gov-portal/issues" className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between h-64 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Issue Management</h3>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Review reported issues, update statuses, and communicate resolutions to the public.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                            Access Issues <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </Link>

                    {/* Project Tracker Card (Assuming this exists based on logs) */}
                    <Link href="/gov-portal/projects" className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between h-64 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Project Tracking</h3>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Monitor infrastructure projects, track budgets, and post progress updates.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
                            Manage Projects <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
