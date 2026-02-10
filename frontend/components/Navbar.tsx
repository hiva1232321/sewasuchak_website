"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/feed" className="nav-link">Live Feed</Link>
          <Link href="/map" className="nav-link">Issue Map</Link>
          <Link href="/portal" className="nav-link">Government Portal</Link>

          <Link href="/report" className="btn-primary text-sm group">
            Report Issue
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          {/* Auth Buttons */}
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            <Link href="/feed" className="py-2 text-slate-700 font-medium" onClick={() => setMenuOpen(false)}>Live Feed</Link>
            <Link href="/map" className="py-2 text-slate-700 font-medium" onClick={() => setMenuOpen(false)}>Issue Map</Link>
            <Link href="/portal" className="py-2 text-slate-700 font-medium" onClick={() => setMenuOpen(false)}>Government Portal</Link>
            <Link href="/report" className="py-2 text-cyan-600 font-semibold" onClick={() => setMenuOpen(false)}>Report Issue →</Link>

            {!isLoading && (
              <div className="pt-3 border-t border-slate-100">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="text-sm text-red-500 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:border-cyan-300 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
