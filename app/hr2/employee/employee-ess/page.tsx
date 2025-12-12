'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Search, X, Clock, CheckCircle } from 'lucide-react';

interface ESSRequest {
    _id: string;
    type: string;
    reason: string;
    status: string;
    createdAt: string;
    processedAt?: string;
}

type RequestCategory = 'all' | 'Certificate of Employment' | 'Training Certificate' | 'Leave Request' | 'Other Documents';

export default function ESSPage() {
    const [requests, setRequests] = useState<ESSRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ type: 'Certificate of Employment', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<RequestCategory>('all');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/hr2/api/employee/ess');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reason.trim()) return alert('Please provide a reason');
        setSubmitting(true);
        try {
            const res = await fetch('/hr2/api/employee/ess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ type: 'Certificate of Employment', reason: '' });
                fetchRequests();
                alert('Request submitted successfully!');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const cancelRequest = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        setCancellingId(id);
        try {
            const res = await fetch('/hr2/api/employee/ess', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: id }),
            });
            if (res.ok) {
                fetchRequests();
            } else {
                alert('Failed to cancel request');
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
        } finally {
            setCancellingId(null);
        }
    };

    const downloadDocument = async (request: ESSRequest) => {
        // Generate and download a simple document
        const content = `
DOCUMENT REQUEST - ${request.type.toUpperCase()}
================================================

Request ID: ${request._id}
Type: ${request.type}
Status: ${request.status}
Reason: ${request.reason}
Requested On: ${new Date(request.createdAt).toLocaleDateString()}
Approved On: ${request.processedAt ? new Date(request.processedAt).toLocaleDateString() : 'N/A'}

This document certifies that the above request has been approved.
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${request.type.replace(/\s+/g, '_')}_${request._id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Approved') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Approved
                </span>
            );
        }
        if (status === 'Pending') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                    <Clock className="w-3 h-3" />
                    Pending
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <X className="w-3 h-3" />
                Rejected
            </span>
        );
    };

    const categories = [
        { key: 'all', label: 'New Request', icon: FileText },
        { key: 'Certificate of Employment', label: 'Certificate', icon: FileText },
        { key: 'Leave Request', label: 'Leave Request', icon: FileText },
        { key: 'Other Documents', label: 'Other Documents', icon: FileText },
    ];

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.reason.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || req.type === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">New Request</h2>
                        <form onSubmit={submitRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Request Type</label>
                                <select 
                                    value={formData.type} 
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                >
                                    <option>Certificate of Employment</option>
                                    <option>Training Certificate</option>
                                    <option>Leave Request</option>
                                    <option>Other Documents</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Reason / Description</label>
                                <textarea 
                                    value={formData.reason} 
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" 
                                    rows={3} 
                                    placeholder="Explain why you need this document..." 
                                    required 
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => {
                            if (cat.key === 'all') {
                                setShowModal(true);
                            } else {
                                setActiveCategory(cat.key as RequestCategory);
                                setFormData({ type: cat.key, reason: '' });
                                setShowModal(true);
                            }
                        }}
                        className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all"
                    >
                        <cat.icon className="w-6 h-6 text-gray-600 mb-2" />
                        <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Request Status Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Request Status</h2>
                    
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                    </div>

                    {/* Requests List */}
                    <div className="space-y-4">
                        {filteredRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No requests found</p>
                                <p className="text-gray-500 text-sm mt-1">Click on a category above to create a new request</p>
                            </div>
                        ) : (
                            filteredRequests.map((req) => (
                                <div 
                                    key={req._id} 
                                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-bold text-gray-900">{req.type}</h4>
                                                {getStatusBadge(req.status)}
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{req.reason}</p>
                                            <p className="text-xs text-gray-500">
                                                Requested on: {new Date(req.createdAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: '2-digit', 
                                                    day: '2-digit' 
                                                }).replace(/\//g, '-')}
                                            </p>
                                        </div>
                                        <div className="ml-4">
                                            {req.status === 'Approved' && (
                                                <button 
                                                    onClick={() => downloadDocument(req)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                            )}
                                            {req.status === 'Pending' && (
                                                <button 
                                                    onClick={() => cancelRequest(req._id)}
                                                    disabled={cancellingId === req._id}
                                                    className="text-red-600 font-medium text-sm hover:text-red-700 disabled:opacity-50"
                                                >
                                                    {cancellingId === req._id ? 'Cancelling...' : 'Cancel Request'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
