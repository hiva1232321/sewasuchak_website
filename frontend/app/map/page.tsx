"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Loader2, MapPin, Navigation, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Custom Map Styles for a "Civil/Modern" look
const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#444444" }]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{ "color": "#f2f2f2" }]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{ "visibility": "simplified" }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{ "color": "#06b6d4" }, { "visibility": "on" }, { "lightness": 50 }] // Cyan-ish water to match theme
        }
    ]
};

const defaultCenter = {
    lat: 28.3949, // Approximate center of Nepal
    lng: 84.1240
};

const nepalBounds = {
    north: 30.472,
    south: 26.347,
    west: 80.058,
    east: 88.201,
};

interface Issue {
    id: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    status: string;
    priority: string;
    imageUrl: string | null;
    address?: string;
}

export default function MapPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    useEffect(() => {
        fetch('http://localhost:3001/issues')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter out issues without valid coordinates
                    const validIssues = data.filter(i => i.latitude && i.longitude);
                    setIssues(validIssues);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch issues:", err);
                setLoading(false);
            });
    }, []);

    const getMarkerIcon = (priority: string) => {
        // Determine color based on priority
        let color = "red"; // Default/High
        if (priority === 'CRITICAL') color = "purple";
        if (priority === 'NORMAL') color = "blue";
        if (priority === 'LOW') color = "green";

        // We can use Google Charts API for dynamic markers or simple path symbols
        // For a premium feel, let's use SVG path symbols if possible, or standard markers
        return null; // Let's stick to default for now, maybe customize later to ensure reliability first
    };

    if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-cyan-500 animate-spin" /></div>;

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 relative mt-[72px]"> {/* Adjust for navbar height */}
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={defaultCenter}
                    zoom={7}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={mapOptions}
                    onClick={() => setSelectedIssue(null)}
                >
                    {issues.map(issue => (
                        <Marker
                            key={issue.id}
                            position={{ lat: issue.latitude, lng: issue.longitude }}
                            animation={google.maps.Animation.DROP}
                            onClick={() => {
                                setSelectedIssue(issue);
                                map?.panTo({ lat: issue.latitude, lng: issue.longitude });
                                map?.setZoom(15); // Auto zoom on click
                            }}
                        />
                    ))}

                    {selectedIssue && (
                        <InfoWindow
                            position={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
                            onCloseClick={() => setSelectedIssue(null)}
                            options={{
                                pixelOffset: new google.maps.Size(0, -30),
                                maxWidth: 320
                            }}
                        >
                            <div className="p-0 min-w-[280px]">
                                <div className="relative h-32 w-full bg-slate-200 rounded-t-lg overflow-hidden">
                                    {selectedIssue.imageUrl ? (
                                        <img src={`http://localhost:3001${selectedIssue.imageUrl}`} alt={selectedIssue.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100">
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${selectedIssue.priority === 'CRITICAL' ? 'bg-purple-600' :
                                            selectedIssue.priority === 'HIGH' ? 'bg-red-500' :
                                                selectedIssue.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}>
                                            {selectedIssue.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-b-lg">
                                    <h3 className="font-bold text-slate-800 text-lg mb-1 leading-snug">{selectedIssue.title}</h3>
                                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[200px]">{selectedIssue.address || "Unknown Location"}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedIssue.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                            selectedIssue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {selectedIssue.status === 'IN_PROGRESS' ? 'In Progress' :
                                                selectedIssue.status === 'OPEN' ? 'Reported' : selectedIssue.status}
                                        </span>

                                        <Link
                                            href={`/report/${selectedIssue.id}`}
                                            className="text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            View Details <Navigation className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>

                {/* Use My Location Button */}
                <div className="absolute top-24 right-4 z-10 flex flex-col gap-2">
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude,
                                        };
                                        map?.panTo(pos);
                                        map?.setZoom(16);
                                        new google.maps.Marker({
                                            position: pos,
                                            map: map,
                                            title: "You are here",
                                            icon: {
                                                path: google.maps.SymbolPath.CIRCLE,
                                                scale: 8,
                                                fillColor: "#06b6d4",
                                                fillOpacity: 1,
                                                strokeColor: "white",
                                                strokeWeight: 2,
                                            }
                                        });
                                    },
                                    (error) => {
                                        console.error("Error fetching location:", error);
                                        alert("Could not get your location. Please ensure location services are enabled.");
                                    },
                                    {
                                        enableHighAccuracy: true,
                                        timeout: 10000,
                                        maximumAge: 0
                                    }
                                );
                            } else {
                                alert("Geolocation is not supported by this browser.");
                            }
                        }}
                        className="bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                        title="Use My Location"
                    >
                        <Navigation className="w-6 h-6" />
                    </button>
                </div>

                {/* Floating Stats / Legend (Optional "Intresting" Element) */}
                <div className="absolute top-6 left-6 z-10 hidden md:block">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 w-64"
                    >
                        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live Issue Map
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Total Reports</span>
                                <span className="font-mono font-bold text-slate-700">{issues.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Active High Priority</span>
                                <span className="font-mono font-bold text-red-500">{issues.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Zoom in to see exact locations. Click markers for details and voting.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
