"use client";

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, AlertCircle, Loader2, Check, X } from 'lucide-react';
import StatusCard from '@/components/StatusCard';

export default function GovIssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Correctly unwrap params using React.use()
    const { id } = use(params);

    const { user, isAuthenticated, token } = useAuth();
    const router = useRouter();
    const [issue, setIssue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form State
    const [status, setStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [govNote, setGovNote] = useState('');
    const [departmentId, setDepartmentId] = useState(''); // Could list depts
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        if (!id) return;
        const interactedRaw = localStorage.getItem('interacted_issues');
        const interactedIds = interactedRaw ? JSON.parse(interactedRaw) : [];
        if (interactedIds.includes(id)) {
            setHasInteracted(true);
        }
    }, [id]);

    const handleVerify = async (isConfirm: boolean) => {
        const interactedRaw = localStorage.getItem('interacted_issues');
        const interactedIds = interactedRaw ? JSON.parse(interactedRaw) : [];
        if (!interactedIds.includes(id)) {
            interactedIds.push(id);
            localStorage.setItem('interacted_issues', JSON.stringify(interactedIds));
        }
        setHasInteracted(true);

        if (isConfirm) {
            try {
                const body: any = {};
                if (user?.id) body.userId = user.id;

                await fetch(`http://localhost:3001/issues/${id}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                alert("Thanks! Your confirmation has been officially recorded.");
            } catch (e) {
                console.error("Failed to vote upon confirm", e);
            }
        }
    };

    const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetch('http://localhost:3001/departments')
                .then(res => res.json())
                .then(data => setDepartments(data))
                .catch(err => console.error(err));
        }
    }, [user?.role]);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const res = await fetch(`http://localhost:3001/issues/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setIssue(data);
                    // Init form
                    setStatus(data.status);
                    setRejectionReason(data.rejectionReason || '');
                    setGovNote(data.govNote || '');
                    setDepartmentId(data.departmentId || '');
                }
            } catch (error) {
                console.error("Failed to fetch issue", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setUpdating(true);

        try {
            const formData = new FormData();
            formData.append('status', status);
            if (rejectionReason) formData.append('rejectionReason', rejectionReason);
            if (govNote) formData.append('govNote', govNote);
            if (departmentId) formData.append('departmentId', departmentId);
            if (proofImage) formData.append('proofImage', proofImage);

            const res = await fetch(`http://localhost:3001/issues/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to update status');
            }

            const updatedIssue = await res.json();
            setIssue(updatedIssue);
            alert("Status updated successfully!");
            // Refresh local state/image preview if needed or just rely on setIssue
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!issue) return <div className="p-8">Issue not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/gov-portal/issues" className="flex items-center text-slate-300 hover:text-white transition-colors font-medium text-sm bg-slate-800 px-3 py-1.5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    
                    <div className="hidden sm:flex text-xl font-bold tracking-tighter items-center gap-2">
                        <img src="/logo.png" alt="Sewasuchak Logo" className="w-6 h-6 rounded object-contain bg-white p-0.5 shadow-sm" />
                        <span>
                            सेवा<span className="text-cyan-400">सूचक</span> <span className="text-gray-400 text-sm ml-2 font-medium">Issue Control</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid gap-8">

                    {/* Public View Preview */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Public Status Card Preview</h2>
                        <StatusCard
                            status={issue.status}
                            updatedAt={issue.updatedAt}
                            departmentName={issue.department?.name} // Assumes include: department
                            govNote={issue.govNote}
                            rejectionReason={issue.rejectionReason}
                            proofImageUrl={issue.proofImageUrl}
                        />
                    </section>

                    {/* Community Verification */}
                    {!hasInteracted && (
                        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-sm border border-blue-100 p-6 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Neighborhood Verification</h3>
                            <p className="text-blue-700 mb-5 font-medium text-sm">Are you near this location? We need locals to verify this problem. Have you noticed this similar problem?</p>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleVerify(true)}
                                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Check className="w-5 h-5 group-hover:scale-110 transition-transform" /> Yes, I explicitly confirm
                                </button>
                                <button 
                                    onClick={() => handleVerify(false)}
                                    className="cursor-pointer bg-white border border-blue-200 text-blue-600 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-5 h-5" /> No, doesn't exist
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Update Form - Only for Admin or Official */}
                    {user && (user.role === 'OFFICIAL' || user.role === 'ADMIN') && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Update Issue Status</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-6">

                            {/* Status Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s)}
                                            className={`px-4 py-3 rounded-lg text-sm font-medium border text-center transition-all ${status === s
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            {s.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assign Department - Admin Only */}
                            {user?.role === 'ADMIN' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Department</label>
                                    <select
                                        value={departmentId}
                                        onChange={(e) => setDepartmentId(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">No Department Assigned</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Conditional Fields */}
                            {status === 'REJECTED' && (
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-2">Rejection Reason *</label>
                                    <select
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        required={status === 'REJECTED'}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none"
                                    >
                                        <option value="">Select a reason...</option>
                                        <option value="Duplicate Issue">Duplicate Issue</option>
                                        <option value="Not Government Responsibility">Not Government Responsibility</option>
                                        <option value="Insufficient Evidence">Insufficient Evidence</option>
                                        <option value="Out of Jurisdiction">Out of Jurisdiction</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            {status === 'RESOLVED' && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <label className="block text-sm font-medium text-green-800 mb-2">Proof of Resolution *</label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer flex items-center justify-center bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        {proofImage && <span className="text-sm text-green-600 truncate max-w-xs">{proofImage.name}</span>}
                                        {!proofImage && !issue.proofImageUrl && <span className="text-sm text-red-500">Required</span>}
                                    </div>
                                    <p className="text-xs text-green-600 mt-2">Upload a photo showing the completed work.</p>
                                </div>
                            )}

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Official Note (Optional)</label>
                                <textarea
                                    value={govNote}
                                    onChange={(e) => setGovNote(e.target.value)}
                                    rows={2}
                                    placeholder="Add internal notes or public comments..."
                                    className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Status
                                </button>
                            </div>

                        </form>
                    </section>
                    )}

                    {/* Original Issue Details (Read only) */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-slate-50 rounded-full -mr-24 -mt-24 opacity-50 pointer-events-none"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                             Original Report Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Issue Title</p>
                                <p className="font-medium text-gray-900 text-lg">{issue.title}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                                <p className="font-medium text-gray-800 leading-relaxed text-sm">{issue.description}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Location Address</p>
                                <p className="font-medium text-gray-800 text-sm">{issue.address}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
