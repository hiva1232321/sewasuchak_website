"use client";
import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const defaultCenter = {
    lat: 27.7172, // Kathmandu
    lng: 85.3240
};

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
    const [center, setCenter] = useState(defaultCenter);
    const [markerPos, setMarkerPos] = useState(defaultCenter);
    const [loadingLoc, setLoadingLoc] = useState(false);

    // Note: Replace with actual API key from env
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
    });

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPos({ lat, lng });
            onLocationSelect(lat, lng);
        }
    }, [onLocationSelect]);

    const handleGetCurrentLocation = () => {
        setLoadingLoc(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setMarkerPos(pos);
                    onLocationSelect(pos.lat, pos.lng);
                    setLoadingLoc(false);
                },
                (error) => {
                    console.error("Error fetching location:", error);
                    let errorMessage = "Error fetching location.";
                    if (error.code === error.PERMISSION_DENIED) errorMessage = "Location permission denied.";
                    if (error.code === error.POSITION_UNAVAILABLE) errorMessage = "Location unavailable.";
                    if (error.code === error.TIMEOUT) errorMessage = "Location request timed out.";
                    alert(errorMessage);
                    setLoadingLoc(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert("Browser doesn't support geolocation.");
            setLoadingLoc(false);
        }
    };

    if (!isLoaded && process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) return <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse" />;

    return (
        <div className="w-full space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    Pinpoint Location
                </label>
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-xs flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium transition-colors bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-100"
                >
                    <Navigation className={`w-3 h-3 ${loadingLoc ? 'animate-spin' : ''}`} />
                    {loadingLoc ? 'Locating...' : 'Use My Location'}
                </button>
            </div>

            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-50">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        onClick={onMapClick}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                        }}
                    >
                        <Marker position={markerPos} draggable={true} onDragEnd={onMapClick} />
                    </GoogleMap>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                        <MapPin className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm">Map unavailable (Missing API Key)</p>
                        <p className="text-xs mt-2">Lat: {markerPos.lat.toFixed(4)}, Lng: {markerPos.lng.toFixed(4)}</p>
                        <button
                            type="button"
                            onClick={() => onLocationSelect(markerPos.lat, markerPos.lng)}
                            className="mt-4 text-xs text-cyan-600 underline"
                        >
                            Simulate Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
