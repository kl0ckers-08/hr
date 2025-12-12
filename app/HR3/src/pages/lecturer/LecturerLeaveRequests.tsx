import { useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { leaveAPI, type Leave } from '../../services/api';
import './LecturerLeaveRequests.css';

export default function LecturerLeaveRequests() {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await leaveAPI.getMyLeaves();
            setLeaves(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await leaveAPI.create(formData);
            setShowModal(false);
            setFormData({ type: 'vacation', startDate: '', endDate: '', reason: '' });
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to submit leave request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Cancel this leave request?')) return;
        try {
            await leaveAPI.cancel(id);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to cancel leave request');
        }
    };

    // Calculate leave balance (assuming 15 days annual leave)
    const approvedLeaves = leaves.filter(l => l.status === 'approved');
    const usedDays = approvedLeaves.reduce((sum, l) => sum + l.totalDays, 0);
    const totalLeave = 15;
    const remainingDays = totalLeave - usedDays;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const getLeaveTypeDisplay = (type: string) => {
        const typeMap: Record<string, string> = {
            vacation: 'Vacation Leave',
            sick: 'Sick Leave',
            personal: 'Personal Leave',
            maternity: 'Maternity Leave',
            paternity: 'Paternity Leave',
            emergency: 'Emergency Leave',
            other: 'Other'
        };
        return typeMap[type] || type;
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Leave Requests</h1>
                    <p className="page-subtitle">Manage your leave applications</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    <span>Request Leave</span>
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div className="leave-balance-card">
                <h3 className="card-title">Leave Balance</h3>
                <div className="leave-balance-row">
                    <div className="leave-progress-container">
                        <span className="leave-label">Annual Leave Quota</span>
                        <div className="leave-progress-bar">
                            <div className="leave-progress-fill" style={{ width: `${(remainingDays / totalLeave) * 100}%` }}></div>
                        </div>
                    </div>
                    <span className="leave-count">{remainingDays}/{totalLeave} days</span>
                </div>
            </div>

            <div className="history-section">
                <h2 className="section-title">Leave Request History</h2>
                <div className="table-container">
                    <table className="data-table leave-history-table">
                        <thead>
                            <tr>
                                <th>Leave Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.length > 0 ? (
                                leaves.map((request) => (
                                    <tr key={request._id}>
                                        <td className="text-primary">{getLeaveTypeDisplay(request.type)}</td>
                                        <td>{formatDate(request.startDate)}</td>
                                        <td>{formatDate(request.endDate)}</td>
                                        <td className="text-primary">{request.totalDays} day(s)</td>
                                        <td>
                                            <span className={`status-text ${request.status}`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{formatDate(request.createdAt)}</td>
                                        <td>
                                            {request.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleCancel(request._id)}
                                                    style={{ 
                                                        padding: '4px 12px', 
                                                        background: '#fee2e2', 
                                                        color: '#dc2626', 
                                                        border: 'none', 
                                                        borderRadius: '4px', 
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                        No leave requests found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Leave</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                                    <option value="vacation">Vacation Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="personal">Personal Leave</option>
                                    <option value="emergency">Emergency Leave</option>
                                    <option value="maternity">Maternity Leave</option>
                                    <option value="paternity">Paternity Leave</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3} required placeholder="Please provide a reason for your leave request..." />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
