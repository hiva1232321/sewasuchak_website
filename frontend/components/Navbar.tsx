"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    // Todo: Add scroll listener to toggle isScrolled

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-3 bg-white/80' : 'py-5 bg-transparent'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="text-white text-lg">C</span>
                    </div>
                    <span className="text-slate-900">Civic<span className="text-cyan-600">Connect</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/feed" className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors">Live Feed</Link>
                    <Link href="/map" className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors">Issue Map</Link>
                    <Link href="/portal" className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors">Government Portal</Link>

                    <Link href="/report" className="btn-primary text-sm group">
                        Report Issue
                        <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
