"use client";
import { useState, useRef } from 'react';
import { Camera, Upload, X, Video } from 'lucide-react';
import Image from 'next/image';

interface MediaUploadProps {
    onFileSelect: (file: File | null) => void;
}

export default function MediaUpload({ onFileSelect }: { onFileSelect: (files: File[]) => void }) {
    const [previews, setPreviews] = useState<{ url: string; type: 'image' | 'video'; file: File }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newPreviewItems = newFiles.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
                file
            }));

            const updatedPreviews = [...previews, ...newPreviewItems];
            setPreviews(updatedPreviews);
            onFileSelect(updatedPreviews.map(p => p.file));
        }
    };

    const removeFile = (index: number) => {
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
        onFileSelect(updatedPreviews.map(p => p.file));
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                <span>Add Evidence</span>
                <span className="text-xs font-normal text-slate-400">Photos / Videos (Max 5)</span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
                        {preview.type === 'image' ? (
                            <Image src={preview.url} alt="Evidence" fill className="object-cover" />
                        ) : (
                            <video src={preview.url} className="w-full h-full object-cover" />
                        )}
                        <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {previews.length < 5 && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group"
                    >
                        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-cyan-100 mb-1 transition-colors">
                            <Camera className="w-5 h-5 text-slate-400 group-hover:text-cyan-600" />
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 group-hover:text-cyan-700 text-center px-2">
                            Add Photo/Video
                        </p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
