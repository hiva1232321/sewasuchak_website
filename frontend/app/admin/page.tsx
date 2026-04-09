"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Plus, Trash2, Loader2, AlertCircle, Building2 } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    _count: {
        issues: number;
        projects: number;
    }
}

export default function AdminPanelPage() {
    const { user, isAuthenticated, token } = useAuth();
    const router = useRouter();
    
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Create Department Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [isAuthenticated, user, loading, router]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('http://localhost:3001/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error("Failed to fetch departments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchDepartments();
        } else {
            setLoading(false); // finish loading even if not admin so effect can redirect
        }
    }, [isAuthenticated, user]);

    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsCreating(true);

        try {
            const res = await fetch('http://localhost:3001/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newDeptName,
                    description: newDeptDesc
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to create department');
            }

            setNewDeptName('');
            setNewDeptDesc('');
            fetchDepartments();
            alert("Department created successfully!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteDepartment = async (id: string) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
        
        try {
            const res = await fetch(`http://localhost:3001/departments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to delete department');
            }

            fetchDepartments();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
                <p className="text-gray-600">You must be an Administrator to access this panel.</p>
                <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="hidden sm:flex text-2xl font-bold tracking-tighter items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm" />
                        <span className="text-white">
                            सेवा<span className="text-cyan-400">सूचक</span> <span className="text-gray-400 text-lg ml-2 font-medium break-keep">Admin Panel</span>
                        </span>
                    </div>
                    <div className="flex sm:hidden items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm" />
                        <span className="text-lg font-bold text-white">Admin</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        Welcome, {user.name}
                        <Link href="/" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">
                            Exit to Site
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Create Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <Plus className="w-5 h-5 text-blue-600" /> 
                                Add New Department
                            </h2>
                            
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateDepartment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Department Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                        placeholder="e.g. Roads & Transport"
                                        className="w-full rounded-md border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        value={newDeptDesc}
                                        onChange={(e) => setNewDeptDesc(e.target.value)}
                                        placeholder="Brief description of responsibilities..."
                                        className="w-full rounded-md border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-md font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Department'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-gray-600" />
                                    Managed Departments
                                </h2>
                                <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-white border border-gray-200 rounded-full">
                                    {departments.length} Total
                                </span>
                            </div>
                            
                            {departments.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    No departments exist yet. Add one from the sidebar.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {departments.map((dept) => (
                                        <li key={dept.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900">{dept.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-md">{dept.description || 'No description provided.'}</p>
                                                <div className="flex gap-4 mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    <span>{dept._count.issues} Issues</span>
                                                    <span>•</span>
                                                    <span>{dept._count.projects} Projects</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteDepartment(dept.id)}
                                                className="self-start sm:self-center p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete Department"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
