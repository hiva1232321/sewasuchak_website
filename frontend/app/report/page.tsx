"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Send, Shield, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/LocationPicker';
import IssueTypeSelector from '@/components/IssueTypeSelector';
import MediaUpload from '@/components/MediaUpload';
import DuplicateCheck from '@/components/DuplicateCheck';
import { useAuth } from '@/context/AuthContext';


export default function ReportPage() {
    const router = useRouter();
    const { user, token, isAuthenticated, isLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [otherType, setOtherType] = useState('');

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [reportOtp, setReportOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Restore form state from sessionStorage (after login redirect)
    useEffect(() => {
        const saved = sessionStorage.getItem('report_draft');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.issueType) setIssueType(data.issueType);
                if (data.description) setDescription(data.description);
                if (data.title) setTitle(data.title);
                if (data.location) setLocation(data.location);
                if (data.otherType) setOtherType(data.otherType);
                if (data.step) setStep(data.step);
                // Note: File objects can't be serialized, so files won't be restored
                sessionStorage.removeItem('report_draft');
            } catch (e) {
                console.error('Failed to restore draft:', e);
            }
        }
    }, []);

    // OTP Resend countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (resendTimer === 0 && otpSent) {
            setCanResend(true);
        }
    }, [resendTimer, otpSent]);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Save form and redirect to login
    const saveAndRedirect = () => {
        const draft = {
            issueType,
            description,
            title,
            location,
            otherType,
            step,
        };
        sessionStorage.setItem('report_draft', JSON.stringify(draft));
        router.push('/login?redirect=/report');
    };

    // Send report OTP
    const sendReportOtp = async () => {
        setOtpLoading(true);
        setOtpError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/send-report-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setOtpSent(true);
            setResendTimer(60);
            setCanResend(false);
            setOtpSuccess('OTP sent to your email!');
            setTimeout(() => setOtpSuccess(''), 3000);
            otpInputRefs.current[0]?.focus();
        } catch (err: any) {
            setOtpError(err.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...reportOtp];
        newOtp[index] = value.slice(-1);
        setReportOtp(newOtp);
        setOtpError('');
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !reportOtp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...reportOtp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setReportOtp(newOtp);
        const focusIndex = Math.min(pasted.length, 5);
        otpInputRefs.current[focusIndex]?.focus();
    };

    // Verify report OTP and submit
    const verifyAndSubmit = async () => {
        const code = reportOtp.join('');
        if (code.length !== 6) {
            setOtpError('Please enter the complete 6-digit code');
            return;
        }

        setOtpLoading(true);
        setOtpError('');

        try {
            // Step 1: Verify OTP
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-report-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ code }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);

            // Step 2: Submit the report
            await submitReport();
        } catch (err: any) {
            setOtpError(err.message || 'Verification failed');
            setOtpLoading(false);
        }
    };

    // Submit report to backend
    const submitReport = async () => {
        setLoading(true);

        const formData = new FormData();
        const finalType = issueType === 'other' ? otherType : issueType;
        formData.append('type', finalType);
        formData.append('description', description);
        formData.append('title', title);
        if (location) {
            formData.append('location', JSON.stringify(location));
        }
        files.forEach(file => {
            formData.append('media', file);
        });
        // Send authenticated user ID
        if (user) {
            formData.append('authorId', user.id);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Response Error:", response.status, errorText);
                throw new Error(`Server Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("Report Submitted:", data);

            setShowOtpModal(false);
            router.push('/feed');

        } catch (error: any) {
            console.error("Submission failed:", error);
            alert(`Failed to submit: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
            setOtpLoading(false);
        }
    };

    // Handle submit button click
    const handleSubmitClick = () => {
        if (!isAuthenticated) {
            saveAndRedirect();
            return;
        }
        // Show OTP modal
        setShowOtpModal(true);
        setReportOtp(['', '', '', '', '', '']);
        setOtpError('');
        setOtpSuccess('');
        setOtpSent(false);
    };

    const isStep1Valid = !!issueType && (issueType !== 'other' || !!otherType);
    const isStep2Valid = !!location;
    const isStep3Valid = !!description && !!title;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4 max-w-2xl">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-cyan-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">New Report</h1>
                        <p className="text-sm text-slate-500">Step {step} of 3</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-cyan-500' : 'bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8"
                >

                    {/* Step 1: Details */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <IssueTypeSelector selected={issueType} onSelect={setIssueType} />

                            {issueType === 'other' && (
                                <div className="animate-fade-in">
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Specify Issue Type</label>
                                    <input
                                        type="text"
                                        value={otherType}
                                        onChange={(e) => setOtherType(e.target.value)}
                                        placeholder="E.g. Fallen Tree, Noise Pollution..."
                                        className="glass-input bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <LocationPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                            {location && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 flex gap-2 items-start">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-cyan-800">Coordinates Captured</p>
                                            <p className="text-xs text-cyan-600 font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                                        </div>
                                    </div>

                                    {/* Duplicate Check Warning */}
                                    <DuplicateCheck location={location} category={issueType} />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Evidence & Description */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <MediaUpload onFileSelect={setFiles} />

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Report Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Brief title (e.g., Broken pipe at Main St)"
                                    className="glass-input bg-slate-50 border-slate-200 focus:bg-white w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the issue in detail..."
                                    rows={4}
                                    className="glass-input bg-slate-50 border-slate-200 focus:bg-white resize-none"
                                />
                            </div>

                            {/* Auth status info */}
                            {!isLoading && !isAuthenticated && (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-center gap-2">
                                    🔒 You&apos;ll need to sign in before submitting your report
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-between gap-3 pt-6 border-t border-slate-50">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all"
                            >
                                ← Back
                            </button>
                        )}
                        <div className="ml-auto">
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitClick}
                                    disabled={!isStep3Valid || loading}
                                    className="btn-primary bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? 'Submitting...' : (isAuthenticated ? 'Verify & Submit' : 'Sign In & Submit')}
                                    <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                </motion.div>
            </div>

            {/* OTP Verification Modal */}
            <AnimatePresence>
                {showOtpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Verify Report</h3>
                                        <p className="text-white/80 text-xs">OTP verification to prevent fake reports</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowOtpModal(false)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                {!otpSent ? (
                                    /* Send OTP Step */
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                                            <Shield className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-slate-700 font-medium">Verify your identity</p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                We&apos;ll send a verification code to<br />
                                                <span className="font-semibold text-slate-700">{user?.email}</span>
                                            </p>
                                        </div>
                                        {otpError && (
                                            <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                                                {otpError}
                                            </div>
                                        )}
                                        <button
                                            onClick={sendReportOtp}
                                            disabled={otpLoading}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {otpLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Send OTP to Email</>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    /* Verify OTP Step */
                                    <div className="space-y-4">
                                        <p className="text-center text-sm text-slate-500">
                                            Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{user?.email}</span>
                                        </p>

                                        {otpError && (
                                            <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                                                ⚠ {otpError}
                                            </div>
                                        )}

                                        {otpSuccess && (
                                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm text-center">
                                                ✅ {otpSuccess}
                                            </div>
                                        )}

                                        {/* OTP Boxes */}
                                        <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                                            {reportOtp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 transition-all outline-none
                                                        ${digit
                                                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-200 bg-slate-50 text-slate-800'}
                                                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white`}
                                                />
                                            ))}
                                        </div>

                                        {/* Verify Button */}
                                        <button
                                            onClick={verifyAndSubmit}
                                            disabled={otpLoading || reportOtp.join('').length !== 6}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {otpLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Verify & Submit Report ✓</>
                                            )}
                                        </button>

                                        {/* Resend */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500">
                                                Didn&apos;t receive the code?{' '}
                                                {canResend ? (
                                                    <button
                                                        onClick={sendReportOtp}
                                                        className="text-cyan-600 font-semibold hover:text-cyan-700 inline-flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Resend
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Resend in <span className="font-semibold text-cyan-600">{resendTimer}s</span>
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
