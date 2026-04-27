"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated } = useAuth();
    const redirect = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirect);
        }
    }, [isAuthenticated, redirect, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsVerification) {
                    router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=SIGNUP`);
                    return;
                }
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.user);
            router.push(redirect);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f4ff 100%)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md mx-4"
            >
                {/* Back link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 mb-6 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                        <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2"
                            >
                                <span className="text-red-400">⚠</span> {error}
                            </motion.div>
                        )}

                        {/* Redirect notice */}
                        {searchParams.get('redirect') && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm">
                                🔒 Please sign in to continue with your report
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>

                        {/* Signup Link */}
                        <p className="text-center text-sm text-slate-500 pt-2">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
