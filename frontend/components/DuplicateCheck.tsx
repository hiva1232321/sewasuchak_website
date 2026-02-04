"use client";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface DuplicateCheckProps {
    location: { lat: number, lng: number };
    category: string;
}

interface Issue {
    id: string;
    title: string;
    category: string;
    description: string;
    status: string;
    createdAt: string;
    imageUrl?: string | null;
}

export default function DuplicateCheck({ location, category }: DuplicateCheckProps) {
    const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    // Reset state when location changes significantly (optional, but good for UX)
    useEffect(() => {
        console.log("[DuplicateCheck] Location changed, resetting state...", location);
        setHasChecked(false);
        setIsOpen(false);
    }, [location.lat, location.lng]);

    useEffect(() => {
        const checkNearby = async () => {
            if (!location) return;
            if (hasChecked) {
                console.log("[DuplicateCheck] Already checked for this location, skipping.");
                return;
            }

            console.log("[DuplicateCheck] Starting check...", location);
            setLoading(true);
            try {
                // Increased radius to 50m as requested
                const radius = 50;

                const query = new URLSearchParams({
                    lat: location.lat.toString(),
                    lng: location.lng.toString(),
                    radius: radius.toString()
                    // Removed category filter - show ALL nearby reports within 50m
                });

                console.log(`[DuplicateCheck] Fetching: http://localhost:3001/issues/nearby?${query}`);
                const res = await fetch(`http://localhost:3001/issues/nearby?${query}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log("[DuplicateCheck] Response:", data);
                    if (data.found && data.issues.length > 0) {
                        setNearbyIssues(data.issues);
                        setIsOpen(true); // Auto-open modal if duplicates found
                        console.log("[DuplicateCheck] Duplicates found, opening modal.");
                    } else {
                        setNearbyIssues([]);
                        console.log("[DuplicateCheck] No duplicates found.");
                    }
                } else {
                    console.error("[DuplicateCheck] Server returned error:", res.status);
                }
            } catch (error) {
                console.error("Error checking nearby issues:", error);
            } finally {
                setLoading(false);
                setHasChecked(true); // Prevent re-checking until location changes
            }
        };

        // Reduced debounce to 500ms for snappier response
        const timeout = setTimeout(checkNearby, 500);
        return () => clearTimeout(timeout);
    }, [location, category, hasChecked]);

    // Added visual indicator while checking (optional, nice to have)
    // Only return the portal logic if we need to show the modal


    // Use Portal to avoid z-index/transform issues with parent motion.div
    // We need to render this only on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-cyan-600 bg-cyan-50 p-2 rounded-lg animate-pulse border border-cyan-100">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Checking for similar reports nearby...
            </div>
        );
    }

    // Check logic
    // ... we can keep logic here or move to a custom hook if it gets complex, but this is fine.

    // If we have issues and open, render modal via portal
    // Logic for rendering the query/checking is same
    // We just wrap the return in createPortal if isOpen is true

    if (isOpen) {
        // Ensure document.body exists
        if (typeof document === 'undefined') return null;

        return createPortal(
            <AnimatePresence>
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10"
                    >
                        {/* Header */}
                        <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
                            <div className="p-3 bg-amber-100 rounded-full shrink-0">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Wait a moment!</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    We found <strong className="text-amber-700">{nearbyIssues.length} similar reports</strong> within 50 meters.
                                    Please check if your issue is already listed to avoid duplicates.
                                </p>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto p-4 space-y-3 bg-slate-50 custom-scrollbar">
                            {nearbyIssues.map(issue => (
                                <Link
                                    key={issue.id}
                                    href={`/report/${issue.id}`}
                                    className="block group bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-cyan-700 transition-colors mb-1">
                                                {issue.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                                                {issue.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${issue.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                                    issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {issue.status}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-cyan-50 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
                                        </div>
                                    </div>
                                    {/* Action Hint */}
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </Link>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                No, my issue is different. Create New Report
                            </button>
                            <p className="text-center text-[10px] text-slate-400">
                                Selecting an existing report helps us resolve issues faster!
                            </p>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>,
            document.body
        );
    }

    return null; // Return null if not open (since we invoke check logic in useEffect)
}
