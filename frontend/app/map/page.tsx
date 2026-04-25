"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Loader2, MapPin, Navigation, Search, ChevronDown, X, Filter, RotateCcw } from 'lucide-react';

// Comprehensive 77 Districts of Nepal Data
const nepalLocations = [
    { name: "All Nepal", lat: 28.3949, lng: 84.1240, zoom: 7, province: null },
    // Bagmati
    { name: "Kathmandu", lat: 27.7172, lng: 85.3240, zoom: 13, province: "Bagmati" },
    { name: "Lalitpur", lat: 27.6588, lng: 85.3247, zoom: 13, province: "Bagmati" },
    { name: "Bhaktapur", lat: 27.6710, lng: 85.4298, zoom: 13, province: "Bagmati" },
    { name: "Chitwan", lat: 27.5341, lng: 84.4525, zoom: 11, province: "Bagmati" },
    { name: "Dhading", lat: 27.9154, lng: 84.8908, zoom: 11, province: "Bagmati" },
    { name: "Dolakha", lat: 27.7471, lng: 86.1360, zoom: 11, province: "Bagmati" },
    { name: "Kavrepalanchok", lat: 27.5341, lng: 85.5532, zoom: 11, province: "Bagmati" },
    { name: "Makwanpur", lat: 27.4664, lng: 85.0256, zoom: 11, province: "Bagmati" },
    { name: "Nuwakot", lat: 27.9620, lng: 85.1667, zoom: 11, province: "Bagmati" },
    { name: "Ramechhap", lat: 27.3828, lng: 86.0766, zoom: 11, province: "Bagmati" },
    { name: "Rasuwa", lat: 28.1678, lng: 85.3853, zoom: 11, province: "Bagmati" },
    { name: "Sindhuli", lat: 27.2410, lng: 85.9806, zoom: 11, province: "Bagmati" },
    { name: "Sindhupalchok", lat: 27.9392, lng: 85.7380, zoom: 11, province: "Bagmati" },
    // Gandaki
    { name: "Kaski (Pokhara)", lat: 28.2096, lng: 83.9856, zoom: 13, province: "Gandaki" },
    { name: "Baglung", lat: 28.2718, lng: 83.5900, zoom: 11, province: "Gandaki" },
    { name: "Gorkha", lat: 28.0000, lng: 84.6333, zoom: 11, province: "Gandaki" },
    { name: "Lamjung", lat: 28.2195, lng: 84.3725, zoom: 11, province: "Gandaki" },
    { name: "Manang", lat: 28.6667, lng: 84.0000, zoom: 11, province: "Gandaki" },
    { name: "Mustang", lat: 28.9833, lng: 83.8333, zoom: 11, province: "Gandaki" },
    { name: "Myagdi", lat: 28.4286, lng: 83.4736, zoom: 11, province: "Gandaki" },
    { name: "Nawalpur", lat: 27.6400, lng: 84.1400, zoom: 11, province: "Gandaki" },
    { name: "Parbat", lat: 28.2239, lng: 83.6703, zoom: 11, province: "Gandaki" },
    { name: "Syangja", lat: 28.0934, lng: 83.8821, zoom: 11, province: "Gandaki" },
    { name: "Tanahu", lat: 27.9711, lng: 84.3314, zoom: 11, province: "Gandaki" },
    // Lumbini
    { name: "Rupandehi (Butwal)", lat: 27.7006, lng: 83.4483, zoom: 13, province: "Lumbini" },
    { name: "Arghakhanchi", lat: 27.9575, lng: 83.0031, zoom: 11, province: "Lumbini" },
    { name: "Banke", lat: 28.1368, lng: 81.7111, zoom: 11, province: "Lumbini" },
    { name: "Bardia", lat: 28.3243, lng: 81.3417, zoom: 11, province: "Lumbini" },
    { name: "Dang", lat: 28.0167, lng: 82.3333, zoom: 11, province: "Lumbini" },
    { name: "Gulmi", lat: 28.1064, lng: 83.2428, zoom: 11, province: "Lumbini" },
    { name: "Kapilvastu", lat: 27.5833, lng: 83.0833, zoom: 11, province: "Lumbini" },
    { name: "Palpa", lat: 27.8735, lng: 83.5658, zoom: 11, province: "Lumbini" },
    { name: "Parasi", lat: 27.5255, lng: 83.6700, zoom: 11, province: "Lumbini" },
    { name: "Pyuthan", lat: 28.1250, lng: 82.8875, zoom: 11, province: "Lumbini" },
    { name: "Rolpa", lat: 28.3000, lng: 82.5000, zoom: 11, province: "Lumbini" },
    { name: "Rukum East", lat: 28.6631, lng: 82.7231, zoom: 11, province: "Lumbini" },
    // Koshi
    { name: "Morang (Biratnagar)", lat: 26.6525, lng: 87.4371, zoom: 11, province: "Koshi" },
    { name: "Bhojpur", lat: 27.1714, lng: 87.0458, zoom: 11, province: "Koshi" },
    { name: "Dhankuta", lat: 26.9831, lng: 87.3333, zoom: 11, province: "Koshi" },
    { name: "Ilam", lat: 26.9114, lng: 87.9238, zoom: 11, province: "Koshi" },
    { name: "Jhapa", lat: 26.5414, lng: 87.9897, zoom: 11, province: "Koshi" },
    { name: "Khotang", lat: 27.2014, lng: 86.8406, zoom: 11, province: "Koshi" },
    { name: "Okhaldhunga", lat: 27.3114, lng: 86.4950, zoom: 11, province: "Koshi" },
    { name: "Panchthar", lat: 27.1436, lng: 87.8286, zoom: 11, province: "Koshi" },
    { name: "Sankhuwasabha", lat: 27.5831, lng: 87.2000, zoom: 11, province: "Koshi" },
    { name: "Solukhumbu", lat: 27.8167, lng: 86.7167, zoom: 11, province: "Koshi" },
    { name: "Sunsari", lat: 26.6414, lng: 87.1266, zoom: 11, province: "Koshi" },
    { name: "Taplejung", lat: 27.5458, lng: 87.7950, zoom: 11, province: "Koshi" },
    { name: "Terhathum", lat: 27.1114, lng: 87.5250, zoom: 11, province: "Koshi" },
    { name: "Udayapur", lat: 26.9114, lng: 86.5819, zoom: 11, province: "Koshi" },
    // Madhesh
    { name: "Dhanusa (Janakpur)", lat: 26.8288, lng: 85.9263, zoom: 11, province: "Madhesh" },
    { name: "Parsa (Birgunj)", lat: 27.0104, lng: 84.8821, zoom: 11, province: "Madhesh" },
    { name: "Bara", lat: 27.0167, lng: 85.0167, zoom: 11, province: "Madhesh" },
    { name: "Mahottari", lat: 26.8500, lng: 85.7833, zoom: 11, province: "Madhesh" },
    { name: "Rautahat", lat: 26.9667, lng: 85.3167, zoom: 11, province: "Madhesh" },
    { name: "Saptari", lat: 26.5667, lng: 86.7333, zoom: 11, province: "Madhesh" },
    { name: "Sarlahi", lat: 26.9500, lng: 85.5500, zoom: 11, province: "Madhesh" },
    { name: "Siraha", lat: 26.7000, lng: 86.3000, zoom: 11, province: "Madhesh" },
    // Karnali
    { name: "Surkhet", lat: 28.6000, lng: 81.6333, zoom: 11, province: "Karnali" },
    { name: "Dailekh", lat: 28.8500, lng: 81.7167, zoom: 11, province: "Karnali" },
    { name: "Dolpa", lat: 29.1333, lng: 83.1833, zoom: 11, province: "Karnali" },
    { name: "Humla", lat: 30.0000, lng: 81.7500, zoom: 11, province: "Karnali" },
    { name: "Jajarkot", lat: 28.8333, lng: 82.2000, zoom: 11, province: "Karnali" },
    { name: "Jumla", lat: 29.2742, lng: 82.1939, zoom: 11, province: "Karnali" },
    { name: "Kalikot", lat: 29.1558, lng: 81.7664, zoom: 11, province: "Karnali" },
    { name: "Mugu", lat: 29.5833, lng: 82.1667, zoom: 11, province: "Karnali" },
    { name: "Rukum West", lat: 28.6631, lng: 82.4731, zoom: 11, province: "Karnali" },
    { name: "Salyan", lat: 28.3667, lng: 82.1667, zoom: 11, province: "Karnali" },
    // Sudurpashchim
    { name: "Kailali (Dhangadhi)", lat: 28.6833, lng: 80.6000, zoom: 11, province: "Sudurpashchim" },
    { name: "Achham", lat: 29.1333, lng: 81.3000, zoom: 11, province: "Sudurpashchim" },
    { name: "Baitadi", lat: 29.5167, lng: 80.5000, zoom: 11, province: "Sudurpashchim" },
    { name: "Bajhang", lat: 29.6167, lng: 81.1667, zoom: 11, province: "Sudurpashchim" },
    { name: "Bajura", lat: 29.5167, lng: 81.5667, zoom: 11, province: "Sudurpashchim" },
    { name: "Dadeldhura", lat: 29.3000, lng: 80.5833, zoom: 11, province: "Sudurpashchim" },
    { name: "Darchula", lat: 29.8500, lng: 80.5167, zoom: 11, province: "Sudurpashchim" },
    { name: "Doti", lat: 29.2500, lng: 80.9167, zoom: 11, province: "Sudurpashchim" },
    { name: "Kanchanpur", lat: 28.9667, lng: 80.1667, zoom: 11, province: "Sudurpashchim" },
];

// Category Configuration
const categories = [
    { id: "road", name: "Road Damage", color: "#ef4444", icon: "🛣️" },
    { id: "garbage", name: "Garbage", color: "#f97316", icon: "🗑️" },
    { id: "drainage", name: "Drainage", color: "#3b82f6", icon: "💧" },
    { id: "streetlight", name: "Street Light", color: "#eab308", icon: "⚡" },
    { id: "other", name: "Other", color: "#8b5cf6", icon: "📌" },
];

// Custom Map Styles
const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy', // Enables direct scroll to zoom
    styles: [
        { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
        { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
        { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
        { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
        { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#06b6d4" }, { "visibility": "on" }, { "lightness": 50 }] }
    ]
};

const defaultCenter = { lat: 28.3949, lng: 84.1240 };

interface Issue {
    id: string; title: string; description: string; category: string;
    latitude: number; longitude: number; status: string; priority: string;
    imageUrl: string | null; address?: string;
}

export default function MapPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState(nepalLocations[0]);
    const [locationSearchOpen, setLocationSearchOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>(categories.map(c => c.id));
    const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "CRITICAL">("ALL");
    const [showFilters, setShowFilters] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
    });

    const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);
    const onUnmount = useCallback(() => setMap(null), []);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/issues`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setIssues(data.filter(i => i.latitude && i.longitude));
                }
                setLoading(false);
            })
            .catch(err => { console.error("Failed to fetch issues:", err); setLoading(false); });
    }, []);

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            const categoryMatch = selectedCategories.includes(issue.category) ||
                (selectedCategories.includes("other") && !categories.find(c => c.id === issue.category));
            const priorityMatch = priorityFilter === "ALL" ||
                (priorityFilter === "HIGH" && (issue.priority === "HIGH" || issue.priority === "CRITICAL")) ||
                (priorityFilter === "CRITICAL" && issue.priority === "CRITICAL");
            return categoryMatch && priorityMatch;
        });
    }, [issues, selectedCategories, priorityFilter]);

    const filteredLocations = useMemo(() => {
        if (!locationSearch) return nepalLocations;
        return nepalLocations.filter(loc =>
            loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
            (loc.province && loc.province.toLowerCase().includes(locationSearch.toLowerCase()))
        );
    }, [locationSearch]);

    const handleLocationSelect = (location: typeof nepalLocations[0]) => {
        setSelectedLocation(location);
        setLocationSearchOpen(false);
        setLocationSearch("");
        if (map) {
            map.panTo({ lat: location.lat, lng: location.lng });
            map.setZoom(location.zoom);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    };

    const categoryStats = useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            count: issues.filter(i => i.category === cat.id ||
                (cat.id === "other" && !categories.find(c => c.id === i.category))).length
        }));
    }, [issues]);

    if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-cyan-500 animate-spin" /></div>;

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 relative mt-[72px]">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={defaultCenter}
                    zoom={7}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={mapOptions}
                    onClick={() => setSelectedIssue(null)}
                >
                    {filteredIssues.map(issue => (
                        <Marker
                            key={issue.id}
                            position={{ lat: issue.latitude, lng: issue.longitude }}
                            animation={google.maps.Animation.DROP}
                            label={{ text: categories.find(c => c.id === issue.category)?.icon || "📌", fontSize: "18px" }}
                            onClick={() => {
                                setSelectedIssue(issue);
                                map?.panTo({ lat: issue.latitude, lng: issue.longitude });
                                map?.setZoom(15);
                            }}
                        />
                    ))}

                    {selectedIssue && (
                        <InfoWindow
                            position={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
                            onCloseClick={() => setSelectedIssue(null)}
                            options={{ pixelOffset: new google.maps.Size(0, -30), maxWidth: 320 }}
                        >
                            <div className="p-0 min-w-[280px]">
                                <div className="relative h-32 w-full bg-slate-200 rounded-t-lg overflow-hidden">
                                    {selectedIssue.imageUrl ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}${selectedIssue.imageUrl}`} alt={selectedIssue.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100"><span className="text-xs">No Image</span></div>
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
                                    <h3 className="font-bold text-slate-800 text-lg mb-1">{selectedIssue.title}</h3>
                                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[200px]">{selectedIssue.address || "Unknown Location"}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedIssue.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                            selectedIssue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {selectedIssue.status === 'IN_PROGRESS' ? 'In Progress' :
                                                selectedIssue.status === 'OPEN' ? 'Reported' : selectedIssue.status}
                                        </span>
                                        <Link href={`/report/${selectedIssue.id}`} className="text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                                            Details <Navigation className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>

                <div className="absolute top-24 right-4 z-10 flex flex-col gap-2">
                    <button onClick={() => setShowFilters(!showFilters)} className={`bg-white p-3 rounded-full shadow-lg border border-slate-200 transition-all ${showFilters ? 'text-cyan-600 bg-cyan-50' : 'text-slate-600 hover:text-cyan-600 hover:bg-cyan-50'}`}><Filter className="w-6 h-6" /></button>
                    <button onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((position) => {
                                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                                map?.panTo(pos);
                                map?.setZoom(16);
                            });
                        }
                    }} className="bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all"><Navigation className="w-6 h-6" /></button>
                    <button onClick={() => handleLocationSelect(nepalLocations[0])} className="bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all"><RotateCcw className="w-6 h-6" /></button>
                </div>

                <div className="absolute top-6 left-6 z-10 hidden md:block">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-200 w-80">
                        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />Live Issue Map</h2>
                        <div className="relative mb-4">
                            <button onClick={() => setLocationSearchOpen(!locationSearchOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl text-left">
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-600" /><span className="font-semibold text-slate-700 truncate">{selectedLocation.name}</span></div>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${locationSearchOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {locationSearchOpen && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                                        <div className="p-2 border-b border-slate-100"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search districts..." value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus /></div></div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {filteredLocations.map((location, idx) => (
                                                <button key={idx} onClick={() => handleLocationSelect(location)} className={`w-full px-4 py-2 text-left hover:bg-cyan-50 transition-colors flex items-center justify-between ${selectedLocation.name === location.name ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700'}`}>
                                                    <span className="font-medium text-sm">{location.name}</span>
                                                    {location.province && <span className="text-[10px] text-slate-400">{location.province}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Total Reports</span><span className="font-mono font-bold text-slate-700">{filteredIssues.length}</span></div>
                            <div className="flex justify-between items-center text-sm"><span className="text-slate-500">High Priority</span><span className="font-mono font-bold text-red-500">{filteredIssues.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length}</span></div>
                        </div>
                        <div className="h-px bg-slate-200 my-3" />
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</span>
                            <div className="grid grid-cols-2 gap-2">
                                {categoryStats.map(cat => (
                                    <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${selectedCategories.includes(cat.id) ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400 opacity-60'}`}>
                                        <span>{cat.icon}</span><span className="truncate">{cat.name}</span><span className="ml-auto font-mono font-bold">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-px bg-slate-200 my-3" />
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority Filter</span>
                            <div className="flex gap-2">
                                {[{ id: "ALL", label: "All" }, { id: "HIGH", label: "High+" }, { id: "CRITICAL", label: "Critical" }].map(f => (
                                    <button key={f.id} onClick={() => setPriorityFilter(f.id as any)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${priorityFilter === f.id ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f.label}</button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-20 md:hidden">
                            <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-800">Filters</h3><button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button></div>
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase">Location</label>
                                    <select value={selectedLocation.name} onChange={(e) => { const loc = nepalLocations.find(l => l.name === e.target.value); if (loc) handleLocationSelect(loc); }} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700">
                                        {nepalLocations.map((loc, idx) => <option key={idx} value={loc.name}>{loc.name}</option>)}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase">Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm transition-all ${selectedCategories.includes(cat.id) ? 'bg-cyan-100 text-cyan-700 border border-cyan-300' : 'bg-slate-100 text-slate-500 border border-transparent'}`}><span>{cat.icon}</span><span>{cat.name}</span></button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase">Priority</label>
                                    <div className="flex gap-2">
                                        {[{ id: "ALL", label: "All" }, { id: "HIGH", label: "High+" }, { id: "CRITICAL", label: "Critical" }].map(f => (
                                            <button key={f.id} onClick={() => setPriorityFilter(f.id as any)} className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${priorityFilter === f.id ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{f.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
