"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ShieldCheck, Plus, Trash2, Loader2, AlertCircle, 
    Building2, Users, FileText, LayoutDashboard, 
    Database, MapPin, CheckCircle2, Briefcase
} from 'lucide-react';

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

interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    _count: { issues: number }
}

interface IssueRecord {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    author: { name: string; email: string };
    department?: { name: string };
    createdAt: string;
}

interface ProjectRecord {
    id: string;
    title: string;
    status: string;
    budget: number;
    department: { name: string };
    _count: { updates: number };
}

type AdminTab = 'dashboard' | 'issues' | 'users' | 'departments' | 'projects' | 'settings';

export default function AdminPanelPage() {
    const { user, isAuthenticated, token } = useAuth();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [stats, setStats] = useState({ users: 0, issues: 0, departments: 0, projects: 0 });
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [issues, setIssues] = useState<IssueRecord[]>([]);
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    
    // Forms
    const [isCreating, setIsCreating] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [isAuthenticated, user, loading, router]);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const statsRes = await fetch('http://127.0.0.1:3001/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (statsRes.ok) {
                const data = await statsRes.json();
                console.log("Fetched stats:", data);
                setStats(data);
            } else {
                const errorData = await statsRes.json().catch(() => ({}));
                console.error("Failed to fetch stats:", statsRes.status, errorData);
                setError(`Failed to load stats: ${errorData.error || statsRes.statusText}`);
            }

            // Fetch specific tab data
            if (activeTab === 'departments') {
                const res = await fetch('http://127.0.0.1:3001/departments');
                if (res.ok) setDepartments(await res.json());
            } else if (activeTab === 'users') {
                const res = await fetch('http://127.0.0.1:3001/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setUsers(await res.json());
            } else if (activeTab === 'issues') {
                const res = await fetch('http://127.0.0.1:3001/admin/issues', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setIssues(await res.json());
            } else if (activeTab === 'projects') {
                const res = await fetch('http://127.0.0.1:3001/admin/projects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setProjects(await res.json());
            }
        } catch (error) {
            console.error("Fetch failed", error);
            setError("Network Error: Could not connect to backend server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, activeTab]);

    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('http://127.0.0.1:3001/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newDeptName, description: newDeptDesc })
            });

            if (res.ok) {
                setNewDeptName('');
                setNewDeptDesc('');
                fetchData();
                alert("Department created!");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        try {
            const endpoint = type === 'department' 
                ? `http://127.0.0.1:3001/departments/${id}`
                : `http://127.0.0.1:3001/admin/${type}s/${id}`;

            console.log(`Deleting ${type} at ${endpoint}...`);
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                console.log(`${type} deleted successfully`);
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
                fetchData();
            } else {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error(`Delete failed:`, err);
                alert(err.error || "Failed to delete record");
            }
        } catch (err: any) {
            console.error("Delete exception:", err);
            alert("Network Error: Failed to delete record");
        }
    };

    if (loading && stats.users === 0) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full sm:w-64 bg-slate-900 text-white sm:min-h-screen sticky top-0 sm:h-screen overflow-y-auto z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded bg-white p-0.5" />
                    <span className="font-bold text-lg tracking-tight">Admin<span className="text-cyan-400">Panel</span></span>
                </div>
                
                <nav className="p-4 space-y-1">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('issues')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'issues' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <FileText className="w-4 h-4" /> Issues
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Users className="w-4 h-4" /> Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('departments')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'departments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Building2 className="w-4 h-4" /> Departments
                    </button>
                    <button 
                        onClick={() => setActiveTab('projects')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Briefcase className="w-4 h-4" /> Projects
                    </button>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-red-600/20 text-red-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Database className="w-4 h-4" /> System Wipe
                        </button>
                    </div>
                </nav>

                <div className="absolute bottom-0 w-full p-4 hidden sm:block">
                    <Link href="/" className="block text-center text-xs text-slate-500 hover:text-white transition-colors">
                        ← Back to Website
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Welcome, {user?.name}</span>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {user?.name?.[0]}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}
                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Issues Reported', value: stats.issues, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { label: 'Active Projects', value: stats.projects, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                            </div>
                                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="w-16 h-16 text-blue-600 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900">System is Operational</h2>
                                <p className="text-gray-500 mt-2 max-w-md">Use the sidebar to manage specific records, departments, and system settings.</p>
                            </div>
                        </div>
                    )}

                    {/* ISSUES TAB */}
                    {activeTab === 'issues' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Issue</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Reporter</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {issues.map(issue => (
                                        <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{issue.title}</div>
                                                <div className="text-xs text-gray-500">{issue.category} • {new Date(issue.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${issue.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{issue.author.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{issue.department?.name || 'Unassigned'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete('issue', issue.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Activity</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.isVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 text-gray-300" />}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{u._count.issues} Reports</td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete('user', u.id)} 
                                                    disabled={u.id === user?.id}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* DEPARTMENTS TAB */}
                    {activeTab === 'departments' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                                        <Plus className="w-5 h-5 text-blue-600" /> Add New
                                    </h2>
                                    <form onSubmit={handleCreateDepartment} className="space-y-4">
                                        <input
                                            type="text" required value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            placeholder="Department Name"
                                            className="w-full rounded-md border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        />
                                        <textarea
                                            rows={3} value={newDeptDesc}
                                            onChange={(e) => setNewDeptDesc(e.target.value)}
                                            placeholder="Description..."
                                            className="w-full rounded-md border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        />
                                        <button disabled={isCreating} className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-md font-semibold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Department'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <ul className="divide-y divide-gray-100">
                                        {departments.map(dept => (
                                            <li key={dept.id} className="p-6 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900">{dept.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{dept._count.issues} Issues • {dept._count.projects} Projects</p>
                                                </div>
                                                <button onClick={() => handleDelete('department', dept.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Project</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Budget</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {projects.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{p.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{p.department.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">NPR {p.budget.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">{p.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete('project', p.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SETTINGS (WIPE) TAB */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl">
                            <div className="bg-white rounded-xl shadow-sm border-2 border-red-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-red-50 bg-red-50 flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-5 h-5" />
                                    <h2 className="text-lg font-bold">Factory Reset</h2>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-900">Wipe Database</h3>
                                    <p className="text-gray-500 mt-2 mb-8">
                                        This will delete all reports, all users (except yourself), all departments, and all projects. 
                                        This action is instantaneous and destructive.
                                    </p>
                                    <button
                                        onClick={async () => {
                                            const confirmation = prompt('Type "WIPE ALL DATA" to confirm:');
                                            if (confirmation !== 'WIPE ALL DATA') return;
                                            setLoading(true);
                                            try {
                                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/wipe-database`, {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    alert("Database wiped!");
                                                    setActiveTab('dashboard');
                                                }
                                            } catch (err: any) { alert(err.message); }
                                            finally { setLoading(false); }
                                        }}
                                        className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" /> Start Wipe Procedure
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
