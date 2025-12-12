import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { leaveAPI, type Leave } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './DeanLeaveRequests.css';

export default function DeanLeaveRequests() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [remarksModal, setRemarksModal] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
    const [remarks, setRemarks] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await leaveAPI.getAll();
            // Filter for dean's department
            const filtered = user?.department 
                ? data.filter(l => l.userId?.department === user.department)
                : data;
            setLeaves(filtered);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    const stats = {
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length
    };

    const STATS = [
        { label: 'Pending', value: stats.pending.toString(), color: '#f97316', bgColor: '#fff7ed' },
        { label: 'Approved', value: stats.approved.toString(), color: '#22c55e', bgColor: '#f0fdf4' },
        { label: 'Rejected', value: stats.rejected.toString(), color: '#ef4444', bgColor: '#fef2f2' },
    ];

    const handleAction = (id: string, action: 'approved' | 'rejected') => {
        setRemarksModal({ id, action });
    };

    const submitAction = async () => {
        if (!remarksModal) return;
        try {
            setActionLoading(remarksModal.id);
            await leaveAPI.updateStatus(remarksModal.id, { status: remarksModal.action, remarks });
            setRemarksModal(null);
            setRemarks('');
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update leave status');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const getLeaveTypeDisplay = (type: string) => {
        const typeMap: Record<string, string> = {
            vacation: 'Vacation Leave', sick: 'Sick Leave', personal: 'Personal Leave',
            maternity: 'Maternity Leave', paternity: 'Paternity Leave', emergency: 'Emergency Leave', other: 'Other'
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
                    <p className="page-subtitle">Review and approve faculty leave requests</p>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div className="leave-stats-grid">
                {STATS.map((stat, index) => (
                    <div key={index} className="leave-stat-card" style={{ backgroundColor: stat.bgColor }}>
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table leave-table">
                    <thead>
                        <tr>
                            <th>Faculty</th>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? leaves.map((request) => (
                            <tr key={request._id}>
                                <td className="faculty-name">{request.userId?.name || 'Unknown'}</td>
                                <td>{getLeaveTypeDisplay(request.type)}</td>
                                <td>{formatDate(request.startDate)}</td>
                                <td>{formatDate(request.endDate)}</td>
                                <td>{request.totalDays} day(s)</td>
                                <td>
                                    <span className={`status-text ${request.status}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {request.status === 'pending' && (
                                        <>
                                            <button className="action-icon approve" onClick={() => handleAction(request._id, 'approved')} disabled={actionLoading === request._id}>
                                                <Check size={16} />
                                            </button>
                                            <button className="action-icon reject" onClick={() => handleAction(request._id, 'rejected')} disabled={actionLoading === request._id}>
                                                <X size={16} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No leave requests found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {remarksModal && (
                <div className="modal-overlay" onClick={() => setRemarksModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>{remarksModal.action === 'approved' ? 'Approve' : 'Reject'} Leave</h2>
                            <button className="close-btn" onClick={() => setRemarksModal(null)}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div className="form-group">
                                <label>Remarks (Optional)</label>
                                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Add remarks..." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                <button onClick={() => setRemarksModal(null)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={submitAction} disabled={actionLoading !== null} style={{ padding: '10px 20px', background: remarksModal.action === 'approved' ? '#22c55e' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    {actionLoading ? 'Processing...' : remarksModal.action === 'approved' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
