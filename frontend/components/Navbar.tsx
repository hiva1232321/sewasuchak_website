"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? "glass py-3 bg-white/80 backdrop-blur-md shadow-sm" : "py-5 bg-transparent"}
      `}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Sewasuchak Logo"
            className="w-10 h-10 rounded-lg object-contain shadow-lg shadow-cyan-500/20"
          />
          <span className="text-slate-900">
            सेवा<span className="text-cyan-600">सूचक</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/feed" className="nav-link">Live Feed</Link>
          <Link href="/map" className="nav-link">Issue Map</Link>
          <Link href="/portal" className="nav-link">Government Portal</Link>

          <Link href="/report" className="btn-primary text-sm group">
            Report Issue
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
