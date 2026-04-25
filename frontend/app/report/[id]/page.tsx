"use client";
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, User, ThumbsUp, MessageSquare, Play, Video } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import StatusCard from '@/components/StatusCard';

interface IssueDetail {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    latitude: number;
    longitude: number;
    address?: string;
    imageUrl: string | null;
    videoUrl: string | null;
    media: {
        id: string;
        url: string;
        type: string;
    }[];
    createdAt: string;
    updatedAt: string;
    author: {
        name: string | null;
        email: string | null;
    };
    department?: {
        name: string;
    };
    govNote?: string;
    rejectionReason?: string;
    proofImageUrl?: string;
    _count: {
        votes: number;
    };
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

export default function ReportDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [issue, setIssue] = useState<IssueDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false); // Local state for immediate feedback
    const [voteCount, setVoteCount] = useState(0);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
    });

    const center = useMemo(() => {
        if (issue) {
            return { lat: issue.latitude, lng: issue.longitude };
        }
        return { lat: 0, lng: 0 };
    }, [issue]);

    useEffect(() => {
        if (!id) return;

        const fetchIssue = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/issues/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setIssue(data);
                    setVoteCount(data._count.votes);
                    // Check if current user voted (Mock logic: check local storage or assume false for now if no auth check)
                    // Logic would go here if we had user ID
                } else {
                    console.error("Failed to fetch issue details");
                }
            } catch (error) {
                console.error("Error fetching issue:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
    }, [id]);

    const handleUpvote = async () => {
        if (!issue || voting) return;

        if (!user) {
            router.push('/login');
            return;
        }

        setVoting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/issues/${issue.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                const data = await res.json();
                setVoteCount(data.votes);
                setHasVoted(data.hasVoted);
            }
        } catch (error) {
            console.error("Failed to vote:", error);
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading details...</div>;
    if (!issue) return <div className="min-h-screen flex items-center justify-center text-slate-500">Report not found.</div>;

    const PriorityBadge = () => {
        if (issue.priority === 'HIGH' || issue.priority === 'CRITICAL') {
            return (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider">
                    {issue.priority} Priority
                </span>
            );
        }
        return null; // Don't show for normal/low to reduce noise
    };

    const mediaItems = issue.media && issue.media.length > 0
        ? issue.media
        : (issue.imageUrl || issue.videoUrl)
            ? [{
                id: 'legacy',
                url: (issue.videoUrl || issue.imageUrl)!,
                type: issue.videoUrl ? 'VIDEO' : 'IMAGE'
            }]
            : [];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="pt-24 pb-12 container mx-auto px-4 max-w-5xl">
                {/* Navigation & Header */}
                <div className="mb-8">
                    <Link href="/feed" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 mb-4 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Feed
                    </Link>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider border border-cyan-200">
                                {issue.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${issue.status === 'OPEN' ? 'bg-green-100 text-green-700 border-green-200' :
                                issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {issue.status.replace('_', ' ')}
                            </span>
                            <PriorityBadge />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">{issue.title}</h1>
                        {issue.address && (
                            <p className="text-slate-500 flex items-center gap-2 text-sm md:text-base">
                                <MapPin className="w-4 h-4 text-slate-400" /> {issue.address}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Status Card */}
                        <StatusCard
                            status={issue.status}
                            updatedAt={issue.updatedAt}
                            departmentName={issue.department?.name}
                            govNote={issue.govNote}
                            rejectionReason={issue.rejectionReason}
                            proofImageUrl={issue.proofImageUrl}
                        />

                        {/* Media Section - Enhanced UI */}
                        {mediaItems.length > 0 ? (
                            <div className={`grid gap-4 ${mediaItems.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {mediaItems.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="rounded-xl overflow-hidden bg-slate-900 relative aspect-video group flex items-center justify-center">
                                            {item.type === 'VIDEO' || item.url.endsWith('.mp4') || item.url.endsWith('.webm') ? (
                                                <video
                                                    controls
                                                    className="w-full h-full object-contain"
                                                    src={`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}${item.url}`}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}${item.url}`}
                                                    alt={`Evidence ${idx + 1}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.classList.add('bg-slate-50', 'text-slate-400');
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 overflow-hidden">
                                <div className="rounded-xl overflow-hidden bg-slate-900 relative aspect-video flex items-center justify-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                                        <div className="p-4 rounded-full bg-slate-800/50">
                                            <Video className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <p className="text-sm font-medium">No media attached to this report</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                Details
                            </h2>
                            <p className="text-slate-600 leading-7 whitespace-pre-wrap text-lg">
                                {issue.description}
                            </p>
                        </div>

                        {/* Location Map */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-cyan-500" /> Location
                            </h2>
                            <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={center}
                                        zoom={15}
                                        options={{
                                            disableDefaultUI: false,
                                            mapTypeControl: false,
                                            streetViewControl: false,
                                        }}
                                    >
                                        <Marker position={center} />
                                    </GoogleMap>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <p>Loading Map...</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-3 font-mono">
                                Coordinates: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 sticky top-24 self-start h-fit">
                        {/* Vote Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                            <div className="mb-6">
                                <span className="block text-4xl font-extrabold text-slate-900 mb-1">{voteCount}</span>
                                <span className="text-slate-500 text-sm uppercase tracking-wide font-medium">Community Votes</span>
                            </div>
                            <button
                                onClick={handleUpvote}
                                disabled={voting}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${hasVoted
                                    ? 'bg-cyan-100 text-cyan-700 border-2 border-cyan-200'
                                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                                    } ${voting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <ThumbsUp className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
                                {voting ? 'Updating...' : hasVoted ? 'Upvoted' : 'Upvote Issue'}
                            </button>
                            <p className="text-xs text-slate-400 mt-4 px-4 leading-relaxed">
                                Upvoting helps prioritize this issue for local authorities.
                            </p>
                        </div>

                        {/* Meta Details */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider text-opacity-70">Report Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase">Reported by</p>
                                        <p className="font-semibold text-slate-700">{issue.author.name || 'Anonymous'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase">Date</p>
                                        <p className="font-semibold text-slate-700">{new Date(issue.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
