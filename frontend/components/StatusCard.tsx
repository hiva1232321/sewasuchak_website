import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Building, FileText, ImageIcon, ExternalLink } from 'lucide-react';

interface StatusCardProps {
    status: string;
    updatedAt: string | Date;
    departmentName?: string | null;
    govNote?: string | null;
    rejectionReason?: string | null;
    proofImageUrl?: string | null;
}

export default function StatusCard({
    status,
    updatedAt,
    departmentName,
    govNote,
    rejectionReason,
    proofImageUrl
}: StatusCardProps) {

    const getStatusConfig = (status: string) => {
        switch (status.toUpperCase()) {
            case 'REPORTED':
                return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Clock className="w-5 h-5 text-gray-500" />, label: 'Reported' };
            case 'ACKNOWLEDGED':
                return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="w-5 h-5 text-blue-500" />, label: 'Acknowledged' };
            case 'IN_PROGRESS':
                return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Clock className="w-5 h-5 text-purple-500" />, label: 'In Progress' };
            case 'RESOLVED':
                return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-5 h-5 text-green-500" />, label: 'Resolved' };
            case 'REJECTED':
                return { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Rejected' };
            default:
                return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Clock className="w-5 h-5 text-gray-500" />, label: status };
        }
    };

    const config = getStatusConfig(status);
    const dateStr = new Date(updatedAt).toLocaleString();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Government Action Status</h3>
                <span className="text-xs text-gray-400">ID: {new Date(updatedAt).getTime().toString().slice(-6)}</span>
            </div>

            <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${config.color.split(' ')[0]}`}>
                        {config.icon}
                    </div>
                    <div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                            {config.label}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Last Updated: {dateStr}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Department */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Responsible Department</p>
                            <p className="text-sm text-gray-800 font-semibold">{departmentName || "Not assigned yet"}</p>
                        </div>
                    </div>

                    {/* Official Note / Reason */}
                    {(govNote || rejectionReason) && (
                        <div className={`flex items-start gap-3 p-3 rounded-lg ${rejectionReason ? 'bg-red-50' : 'bg-blue-50'}`}>
                            <FileText className={`w-5 h-5 mt-0.5 ${rejectionReason ? 'text-red-400' : 'text-blue-400'}`} />
                            <div>
                                <p className={`text-xs font-medium ${rejectionReason ? 'text-red-500' : 'text-blue-500'}`}>
                                    {rejectionReason ? "Rejection Reason" : "Official Note"}
                                </p>
                                <p className={`text-sm font-medium ${rejectionReason ? 'text-red-800' : 'text-blue-800'}`}>
                                    {rejectionReason || govNote}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Proof Image */}
                {status.toUpperCase() === 'RESOLVED' && proofImageUrl && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm font-semibold text-green-800">Resolution Proof</h4>
                        </div>
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-green-200 bg-gray-100 group">
                            <img
                                src={`http://localhost:3001${proofImageUrl}`}
                                alt="Resolution Proof"
                                className="w-full h-full object-cover"
                            />
                            <a
                                href={`http://localhost:3001${proofImageUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="text-white text-sm font-medium flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    View Full Image
                                </span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
