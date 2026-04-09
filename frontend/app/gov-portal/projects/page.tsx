"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, Briefcase, Loader2, Plus, Calendar } from 'lucide-react';

export default function GovProjectsPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Create Project Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        budget: '',
        startDate: '',
        departmentId: '',
        address: ''
    });

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:3001/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        if (user?.role === 'ADMIN' || user?.role === 'OFFICIAL') {
            fetch('http://localhost:3001/departments')
                .then(res => res.json())
                .then(data => setDepartments(data))
                .catch(err => console.error(err));
        }
    }, [user?.role]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(newProject)
            });

            if (res.ok) {
                setIsCreateModalOpen(false);
                setNewProject({ title: '', description: '', budget: '', startDate: '', departmentId: '', address: '' });
                fetchProjects();
                alert("Project created successfully!");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to create project");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus;
        const matchesSearch = (project.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PLANNED': return 'bg-blue-100 text-blue-700';
            case 'ONGOING': return 'bg-yellow-100 text-yellow-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'DELAYED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="hidden sm:flex text-2xl font-bold tracking-tighter items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-slate-900">
                            सेवा<span className="text-cyan-600">सूचक</span> <span className="text-gray-500 text-lg ml-2 font-medium">Project Tracking</span>
                        </span>
                    </div>
                    <div className="flex sm:hidden items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                        <span className="text-lg font-bold text-slate-900">Projects</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Link href="/gov-portal" className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                            Back to Gov Portal
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                                <span className="text-sm text-gray-500 hidden sm:block">Welcome, {user.name}</span>
                                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold border border-emerald-200">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm text-emerald-600 hover:underline border-l pl-4 border-gray-200">Sign In Here</Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto max-w-full">
                        {['ALL', 'PLANNED', 'ONGOING', 'COMPLETED', 'DELAYED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status === 'ALL' ? 'All Projects' : status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                            />
                        </div>
                        
                        {(user?.role === 'ADMIN' || user?.role === 'OFFICIAL') && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Create
                            </button>
                        )}
                    </div>
                </div>

                {/* List Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const completedPercentage = project.budget > 0 ? Math.min(100, Math.round((project.spentAmount / project.budget) * 100)) : 0;
                            
                            return (
                                <Link href={`/gov-portal/projects/${project.id}`} key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                        {project.department && (
                                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                                {project.department.name}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow">
                                        {project.description}
                                    </p>
                                    
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-sm font-medium mb-1">
                                            <span className="text-gray-700">Budget Spent</span>
                                            <span className="text-emerald-600">{completedPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Started {new Date(project.startDate).getFullYear()}
                                            </div>
                                            <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                                                View <ChevronRight className="w-3 h-3 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Create Government Project</h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                    <input 
                                        type="text" required 
                                        value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        required rows={3}
                                        value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (NPR)</label>
                                        <input 
                                            type="number" required min="0"
                                            value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})}
                                            className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input 
                                            type="date" required 
                                            value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})}
                                            className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select 
                                        required
                                        value={newProject.departmentId} onChange={e => setNewProject({...newProject, departmentId: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    >
                                        <option value="">Select a department...</option>
                                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location/Address</label>
                                    <input 
                                        type="text" 
                                        value={newProject.address} onChange={e => setNewProject({...newProject, address: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
