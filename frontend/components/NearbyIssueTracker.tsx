"use client";

import { useEffect, useState, useRef } from 'react';
import { MapPin, X, Check, Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function NearbyIssueTracker() {
    const { user } = useAuth();
    const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
    const [activeNotif, setActiveNotif] = useState<any | null>(null);
    
    // We use a ref so the interval always has the latest location without causing effect re-triggers
    const locationRef = useRef<{lat: number, lng: number} | null>(null);

    // Track geolocation
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentLocation(newLoc);
                locationRef.current = newLoc;
            },
            (err) => console.warn("Geolocation Error:", err),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Poll for nearby issues
    useEffect(() => {
        const fetchNearby = async () => {
            if (!locationRef.current) return;
            // Prevent fetching if a notification is currently active
            if (activeNotif) return;

            try {
                const { lat, lng } = locationRef.current;
                const res = await fetch(`http://localhost:3001/issues/nearby?lat=${lat}&lng=${lng}&radius=100`);
                if (!res.ok) return;

                const data = await res.json();
                if (data.found && data.issues.length > 0) {
                    // Check local storage for interacted issues
                    const interactedRaw = localStorage.getItem('interacted_issues');
                    const interactedIds: string[] = interactedRaw ? JSON.parse(interactedRaw) : [];

                    // Find the first issue we haven't interacted with and wasn't created by us
                    const newIssue = data.issues.find((issue: any) => !interactedIds.includes(issue.id) && issue.authorId !== user?.id);

                    if (newIssue) {
                        setActiveNotif(newIssue);
                    }
                }
            } catch (err) {
                console.error("Failed fetching nearby issues for tracker:", err);
            }
        };

        // Poll every 15 seconds
        const intervalId = setInterval(fetchNearby, 15000);
        // Initial fetch after a short delay
        setTimeout(fetchNearby, 3000);

        return () => clearInterval(intervalId);
    }, [activeNotif]);

    const handleAction = async (isConfirm: boolean) => {
        if (!activeNotif) return;

        const issueId = activeNotif.id;

        // Save to local storage
        const interactedRaw = localStorage.getItem('interacted_issues');
        const interactedIds: string[] = interactedRaw ? JSON.parse(interactedRaw) : [];
        if (!interactedIds.includes(issueId)) {
            interactedIds.push(issueId);
            localStorage.setItem('interacted_issues', JSON.stringify(interactedIds));
        }

        if (isConfirm) {
            // Optional: Register a positive vote, indicating confirmation.
            try {
                const body: any = {};
                if (user?.id) body.userId = user.id;

                await fetch(`http://localhost:3001/issues/${issueId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (e) {
                console.error("Failed to vote upon confirm", e);
            }
        }

        // Close notif (sliding out animation will trigger via state if we add transition, but setting null removes it)
        setActiveNotif(null);
    };

    if (!activeNotif) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full font-sans animate-in slide-in-from-bottom-5 fade-in duration-500 ease-out">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden p-6 ring-1 ring-black/5">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-cyan-400"></div>
                
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shadow-inner mt-1">
                        <MapPin className="w-5 h-5 text-blue-600 animate-bounce" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <Link href={`/report/${activeNotif.id}`} onClick={() => setActiveNotif(null)} className="block cursor-pointer group/notif">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Nearby Alert
                                </span>
                                <span className="text-xs text-slate-400">Within 100m</span>
                            </div>
                            <h4 className="text-lg font-extrabold text-slate-800 leading-tight mb-2 pr-4 group-hover/notif:text-blue-600 transition-colors">{activeNotif.title}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5 font-medium group-hover/notif:text-slate-700">A user reported this recently. Have you noticed this similar problem?</p>
                        </Link>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleAction(true)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" /> Yes
                            </button>
                            <button 
                                onClick={() => handleAction(false)}
                                className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> No
                            </button>
                        </div>
                    </div>
                </div>

                {/* Close Button top-right */}
                <button 
                    onClick={() => setActiveNotif(null)} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <style jsx global>{`
                @keyframes slide-in-bottom {
                    0% { transform: translateY(20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-in {
                    animation: slide-in-bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
