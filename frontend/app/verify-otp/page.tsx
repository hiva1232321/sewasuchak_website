"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

function OtpVerificationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'SIGNUP';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only last digit
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Move back on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        // Focus last filled or last
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            setSuccess('Email verified successfully! Redirecting...');
            login(data.token, data.user);

            // Check for redirect
            const savedRedirect = sessionStorage.getItem('auth_redirect');
            setTimeout(() => {
                if (savedRedirect) {
                    sessionStorage.removeItem('auth_redirect');
                    router.push(savedRedirect);
                } else {
                    router.push('/');
                }
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setCanResend(false);
        setResendTimer(60);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('New OTP sent to your email!');
            setTimeout(() => setSuccess(''), 3000);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
            setCanResend(true);
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
                <Link href="/signup" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 mb-6 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Signup
                </Link>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Verify Your Email</h1>
                        <p className="text-slate-500 text-sm mt-2">
                            We sent a 6-digit code to<br />
                            <span className="font-semibold text-slate-700">{email}</span>
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div className="px-8 pb-8">
                        {/* Messages */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-4 flex items-center gap-2"
                            >
                                <span>⚠</span> {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm mb-4 flex items-center gap-2"
                            >
                                <span>✅</span> {success}
                            </motion.div>
                        )}

                        {/* OTP Boxes */}
                        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                                        ${digit
                                            ? 'border-cyan-400 bg-cyan-50 text-cyan-700'
                                            : 'border-slate-200 bg-slate-50 text-slate-800'}
                                        focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white`}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerify}
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Verify Email ✓</>
                            )}
                        </button>

                        {/* Resend */}
                        <div className="mt-5 text-center">
                            <p className="text-sm text-slate-500">
                                Didn&apos;t receive the code?{' '}
                                {canResend ? (
                                    <button
                                        onClick={handleResend}
                                        className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Resend OTP
                                    </button>
                                ) : (
                                    <span className="text-slate-400">
                                        Resend in <span className="font-semibold text-cyan-600">{resendTimer}s</span>
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        }>
            <OtpVerificationForm />
        </Suspense>
    );
}
