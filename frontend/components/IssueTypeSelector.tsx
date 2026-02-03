"use client";
import { Droplets, Lightbulb, Truck, AlertTriangle, Construction } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface IssueTypeSelectorProps {
    selected: string;
    onSelect: (id: string) => void;
}

const options: Option[] = [
    { id: 'drainage', label: 'Drainage', icon: <Droplets className="w-6 h-6" /> },
    { id: 'streetlight', label: 'Street Light', icon: <Lightbulb className="w-6 h-6" /> },
    { id: 'road', label: 'Road Damage', icon: <Construction className="w-6 h-6" /> },
    { id: 'garbage', label: 'Garbage', icon: <Truck className="w-6 h-6" /> },
    { id: 'other', label: 'Other', icon: <AlertTriangle className="w-6 h-6" /> },
];

export default function IssueTypeSelector({ selected, onSelect }: IssueTypeSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Select Issue Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSelect(opt.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${selected === opt.id
                                ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm ring-1 ring-cyan-500'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-slate-50'
                            }`}
                    >
                        <div className={`mb-2 ${selected === opt.id ? 'text-cyan-600' : 'text-slate-400'}`}>
                            {opt.icon}
                        </div>
                        <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
