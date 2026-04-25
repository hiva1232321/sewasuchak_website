"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Briefcase, Plus, Loader2, AlertCircle, CheckCircle, Clock, Image as ImageIcon, Crosshair, BarChart3, Info, Wallet } from 'lucide-react';

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
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
    const [updateImageUrl, setUpdateImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProjectDetails = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/projects/${id}`);
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
            if (updateImageUrl) bodyData.imageUrl = updateImageUrl;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/projects/${id}/updates`, {
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
            setUpdateImageUrl('');
            setIsUpdateFormOpen(false);
            fetchProjectDetails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-medium">Loading project dossier...</p>
            </div>
        </div>
    );

    if (error || !project) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
                <AlertCircle className="w-16 h-16 text-rose-500 bg-rose-50 rounded-full p-2" />
                <h1 className="text-3xl font-extrabold text-slate-800">System Error</h1>
                <p className="text-slate-600 font-medium">{error || "Project not found"}</p>
                <Link href="/gov-portal/projects" className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold shadow-sm">
                    Return to Directory
                </Link>
            </div>
        );
    }

    const { department, updates } = project;
    const completedPercentage = project.budget > 0 ? Math.min(100, Math.round((project.spentAmount / project.budget) * 100)) : 0;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PLANNED': return { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', icon: Clock };
            case 'ONGOING': return { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: BarChart3 };
            case 'COMPLETED': return { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle };
            case 'DELAYED': return { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', icon: AlertCircle };
            default: return { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', icon: Info };
        }
    };

    const statusStyle = getStatusStyles(project.status);
    const StatusIcon = statusStyle.icon;
    const isAuthorized = user?.role === 'ADMIN' || user?.role === 'OFFICIAL';

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 transition-all">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/gov-portal/projects" className="flex items-center text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm bg-slate-100 hover:bg-emerald-50 px-3 py-2 rounded-lg">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Projects Directory
                    </Link>
                    
                    {user && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 font-medium hidden sm:block">Identified as {user.name}</span>
                            <div className="h-8 w-8 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200/50">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-10 group">
                    {/* Artistic Background blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-emerald-100/40 to-cyan-100/40 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-gradient-to-tr from-blue-100/40 to-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative p-8 sm:p-12 z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} shadow-sm`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {project.status}
                                    </span>
                                    {department && (
                                        <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-md border border-slate-200 shadow-sm flex items-center">
                                            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            {department.name}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
                                    {project.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-500">
                                    {project.address && (
                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><MapPin className="w-4 h-4 text-emerald-500" /> {project.address}</span>
                                    )}
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Calendar className="w-4 h-4 text-cyan-500" /> {new Date(project.startDate).toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'})}</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-600 mb-10 leading-relaxed font-medium">
                            <p className="text-lg">{project.description}</p>
                        </div>

                        {/* Interactive Budget Dashboard */}
                        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                            <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex-1 w-full space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest">Financial Overview</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-400 mb-1">Total Allocated Budget</p>
                                            <div className="text-3xl font-black text-white">
                                                <span className="text-xl text-emerald-400 mr-1">NPR</span>
                                                {project.budget.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-400 mb-1">Amount Utilized</p>
                                            <div className="text-3xl font-black text-white">
                                                <span className="text-xl text-cyan-400 mr-1">NPR</span>
                                                {project.spentAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Circular Progress Indicator */}
                                <div className="flex items-center justify-center relative w-36 h-36 shrink-0">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        {/* Background track */}
                                        <circle 
                                            className="text-slate-800 stroke-current" 
                                            strokeWidth="8" 
                                            cx="50" cy="50" r="40" 
                                            fill="transparent"
                                        ></circle>
                                        {/* Progress calculation: dasharray is 2 * pi * r (approx 251.2 for r=40). dashoffset dictates fill */}
                                        <circle 
                                            className="text-emerald-400 stroke-current transition-all duration-1000 ease-out" 
                                            strokeWidth="8" 
                                            strokeLinecap="round" 
                                            cx="50" cy="50" r="40" 
                                            fill="transparent" 
                                            strokeDasharray="251.2" 
                                            strokeDashoffset={251.2 - (251.2 * completedPercentage) / 100}
                                            transform="rotate(-90 50 50)"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{completedPercentage}%</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Executed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline & Updates Section */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-5">
                        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                            <Crosshair className="w-6 h-6 text-emerald-600" /> Milestone Tracking
                        </h2>
                        {isAuthorized && !isUpdateFormOpen && (
                            <button 
                                onClick={() => setIsUpdateFormOpen(true)}
                                className="bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 justify-center"
                            >
                                <Plus className="w-5 h-5" /> Publish New Milestone
                            </button>
                        )}
                    </div>

                    {/* Create Update Form */}
                    {isAuthorized && isUpdateFormOpen && (
                        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 mb-10 relative overflow-hidden transform transition-all">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-cyan-500"></div>
                            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Draft Project Update
                            </h3>
                            <form onSubmit={handleAddUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Milestone Headline *</label>
                                        <input 
                                            type="text" required 
                                            value={updateTitle} onChange={e => setUpdateTitle(e.target.value)}
                                            placeholder="e.g. Foundation Successfully Laid"
                                            className="w-full rounded-xl border-slate-200 border p-3.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm bg-slate-50/50 focus:bg-white transition-all font-semibold"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Comprehensive Details *</label>
                                        <textarea 
                                            required rows={4}
                                            value={updateDesc} onChange={e => setUpdateDesc(e.target.value)}
                                            placeholder="Elaborate on the progress made, challenges faced, or next steps..."
                                            className="w-full rounded-xl border-slate-200 border p-3.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm bg-slate-50/50 focus:bg-white transition-all resize-y"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Image URL (Optional)</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input 
                                                type="url" placeholder="https://example.com/site.jpg"
                                                value={updateImageUrl} onChange={e => setUpdateImageUrl(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-slate-200 border outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm bg-slate-50/50 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Additional Expenditure (NPR)</label>
                                        <input 
                                            type="number" min="0" placeholder="Amount to add to utilization"
                                            value={updateSpentAmount} onChange={e => setUpdateSpentAmount(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 border p-3.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm bg-slate-50/50 focus:bg-white transition-all font-mono"
                                        />
                                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide mt-2">Current Total: NPR {project.spentAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="md:col-span-2 border-t border-slate-100 pt-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Adjust Project Status</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['PLANNED', 'ONGOING', 'COMPLETED', 'DELAYED'].map((s) => (
                                                <label key={s} className={`cursor-pointer px-4 py-2 font-bold rounded-lg border-2 transition-all ${updateStatus === s ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                                    <input 
                                                        type="radio" name="status" className="sr-only"
                                                        value={s}
                                                        checked={updateStatus === s}
                                                        onChange={(e) => setUpdateStatus(e.target.value)}
                                                    />
                                                    {s}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-end pt-4">
                                    <button type="button" onClick={() => setIsUpdateFormOpen(false)} className="px-6 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                        Discard
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/30 rounded-xl transition-all disabled:opacity-70 flex items-center">
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Publish Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Timeline Feed */}
                    <div className="space-y-6 lg:mx-8">
                        {updates.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Awaiting First Milestone</h3>
                                <p className="text-slate-500 font-medium">No progress updates have been recorded for this initiative yet.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-[3px] border-emerald-200/50 ml-4 lg:ml-8 pl-8 sm:pl-10 space-y-12 pb-10">
                                {updates.map((update: any, idx: number) => (
                                    <div key={update.id} className="relative group">
                                        {/* Timeline dot */}
                                        <div className="absolute -left-[45px] sm:-left-[53px] top-4 w-6 h-6 bg-white border-[5px] border-emerald-400 rounded-full shadow-[0_0_0_4px_rgba(16,185,129,0.1)] group-hover:bg-emerald-100 group-hover:scale-125 transition-all duration-300 z-10"></div>
                                        
                                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 p-6 sm:p-8 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-100 relative overflow-hidden">
                                            {/* Decorative corner accent */}
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-50 to-transparent"></div>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(update.createdAt).toLocaleString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute:'2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <h4 className="text-2xl font-extrabold text-slate-800 mb-4">{update.title}</h4>
                                            
                                            {update.imageUrl && (
                                                <div className="mb-6 rounded-xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50">
                                                    <img src={update.imageUrl} alt={update.title} className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-700" />
                                                </div>
                                            )}

                                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{update.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
