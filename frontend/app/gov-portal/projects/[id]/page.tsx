"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Briefcase, Plus, Loader2, AlertCircle } from 'lucide-react';

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const { id } = params;

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Update Form State
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateDesc, setUpdateDesc] = useState('');
    const [updateSpentAmount, setUpdateSpentAmount] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProjectDetails = async () => {
        try {
            const res = await fetch(`http://localhost:3001/projects/${id}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Project not found");
                throw new Error("Failed to fetch project details");
            }
            const data = await res.json();
            setProject(data);
            setUpdateStatus(data.status);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const handleAddUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const bodyData: any = {
                title: updateTitle,
                description: updateDesc,
            };
            if (updateSpentAmount) bodyData.spentAmount = updateSpentAmount;
            if (updateStatus && updateStatus !== project.status) bodyData.status = updateStatus;

            const res = await fetch(`http://localhost:3001/projects/${id}/updates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(bodyData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to add update');
            }

            // reset form and refetch
            setUpdateTitle('');
            setUpdateDesc('');
            setUpdateSpentAmount('');
            setIsUpdateFormOpen(false);
            fetchProjectDetails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-800">Error</h1>
                <p className="text-gray-600">{error || "Project not found"}</p>
                <Link href="/gov-portal/projects" className="text-emerald-600 hover:underline">Back to Projects</Link>
            </div>
        );
    }

    const { department, updates } = project;
    const completedPercentage = project.budget > 0 ? Math.min(100, Math.round((project.spentAmount / project.budget) * 100)) : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PLANNED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ONGOING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'DELAYED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const isAuthorized = user?.role === 'ADMIN' || user?.role === 'OFFICIAL';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/gov-portal/projects" className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects Directory
                    </Link>
                    
                    {user && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden sm:block">Logged in as {user.name}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Project Overview Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                                {department && (
                                    <span className="text-sm text-gray-500 font-medium">| {department.name}</span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                {project.address && (
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.address}</span>
                                )}
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Started {new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed max-w-3xl mb-8">
                        {project.description}
                    </p>

                    {/* Budget Overview */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 mb-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Budget Utilization</p>
                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                    NPR {project.spentAmount.toLocaleString()} <span className="text-base font-medium text-gray-400">/ NPR {project.budget.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-emerald-600 font-bold text-xl">{completedPercentage}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${completedPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Timeline & Updates Section */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-500" /> Project Timeline
                    </h2>
                    {isAuthorized && !isUpdateFormOpen && (
                        <button 
                            onClick={() => setIsUpdateFormOpen(true)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Update
                        </button>
                    )}
                </div>

                {/* Create Update Form */}
                {isAuthorized && isUpdateFormOpen && (
                    <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Record New Update</h3>
                        <form onSubmit={handleAddUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Update Title *</label>
                                <input 
                                    type="text" required
                                    value={updateTitle} onChange={e => setUpdateTitle(e.target.value)}
                                    placeholder="e.g. Phase 1 Completed"
                                    className="w-full rounded-md border-gray-300 border p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Details & Progress *</label>
                                <textarea 
                                    required rows={3}
                                    value={updateDesc} onChange={e => setUpdateDesc(e.target.value)}
                                    className="w-full rounded-md border-gray-300 border p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Budget Spent Since Last Update (NPR)</label>
                                    <input 
                                        type="number" min="0" placeholder="Optional. Amount to add to total spent."
                                        value={updateSpentAmount} onChange={e => setUpdateSpentAmount(e.target.value)}
                                        className="w-full rounded-md border-gray-300 border p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This will be added to the current NPR {project.spentAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Update Project Status</label>
                                    <select 
                                        value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}
                                        className="w-full rounded-md border-gray-300 border p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="PLANNED">Planned</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="DELAYED">Delayed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setIsUpdateFormOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white font-medium hover:bg-emerald-700 rounded-md transition disabled:opacity-70 flex items-center">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Publish Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Timeline Feed */}
                <div className="space-y-6">
                    {updates.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                            <p className="text-gray-500">No updates have been recorded for this project yet.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-8">
                            {updates.map((update: any, idx: number) => (
                                <div key={update.id} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100"></div>
                                    
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                            {new Date(update.createdAt).toLocaleString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                            })}
                                        </span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">{update.title}</h4>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{update.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
