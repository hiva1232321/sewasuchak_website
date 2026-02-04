"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/LocationPicker';
import IssueTypeSelector from '@/components/IssueTypeSelector';
import MediaUpload from '@/components/MediaUpload';

export default function ReportPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [otherType, setOtherType] = useState('');

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
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
        // Author ID handled by backend default for now

        try {
            const response = await fetch('http://localhost:3001/issues', {
                method: 'POST',
                // Content-Type header not needed, FormData sets it with boundary
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Response Error:", response.status, errorText);
                throw new Error(`Server Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("Report Submitted:", data);

            // Redirect to feed page
            router.push('/feed');

        } catch (error: any) {
            console.error("Submission failed:", error);
            alert(`Failed to submit: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
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
                                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 flex gap-2 items-start">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-cyan-800">Coordinates Captured</p>
                                        <p className="text-xs text-cyan-600 font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                                    </div>
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
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
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
                                onClick={handleSubmit}
                                disabled={!isStep3Valid || loading}
                                className="btn-primary bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'} <Send className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
