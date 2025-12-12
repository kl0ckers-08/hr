import { useState, useEffect } from 'react';
import { Search, Check, X, Loader2 } from 'lucide-react';
import { leaveAPI, type Leave } from '../services/api';
import './LeaveManagement.css';

export default function LeaveManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (statusFilter !== 'All Status') params.status = statusFilter.toLowerCase();
            const data = await leaveAPI.getAll(params);
            setLeaves(data);
        } catch (err) {
            console.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [statusFilter]);

    const filteredRequests = leaves.filter(request => {
        const matchesSearch = request.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const stats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            setActionLoading(id);
            await leaveAPI.updateStatus(id, { status: action });
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update leave status');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    const getLeaveTypeDisplay = (type: string) => {
        const typeMap: Record<string, string> = { vacation: 'Vacation Leave', sick: 'Sick Leave', personal: 'Personal Leave', maternity: 'Maternity Leave', paternity: 'Paternity Leave', emergency: 'Emergency Leave', other: 'Other' };
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
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">Process and approve employee leave requests</p>
                </div>
            </div>

            <div className="stats-row four-cols">
                <div className="stat-mini-card no-border">
                    <span className="stat-mini-label">Total Requests</span>
                    <span className="stat-mini-value" style={{ color: '#1e293b' }}>{stats.total}</span>
                </div>
                <div className="stat-mini-card no-border">
                    <span className="stat-mini-label">Pending</span>
                    <span className="stat-mini-value" style={{ color: '#f97316' }}>{stats.pending}</span>
                </div>
                <div className="stat-mini-card no-border">
                    <span className="stat-mini-label">Approved</span>
                    <span className="stat-mini-value" style={{ color: '#22c55e' }}>{stats.approved}</span>
                </div>
                <div className="stat-mini-card no-border">
                    <span className="stat-mini-label">Rejected</span>
                    <span className="stat-mini-value" style={{ color: '#ef4444' }}>{stats.rejected}</span>
                </div>
            </div>

            <div className="filters-inline">
                <div className="search-bar flex-grow">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search by employee or leave type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                </select>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map((request) => (
                            <tr key={request._id}>
                                <td>
                                    <div className="employee-cell">
                                        <span className="emp-name">{request.userId?.name || 'Unknown'}</span>
                                        <span className="emp-email">{request.userId?.email || ''}</span>
                                    </div>
                                </td>
                                <td>{request.userId?.department || '-'}</td>
                                <td>{getLeaveTypeDisplay(request.type)}</td>
                                <td>{formatDate(request.startDate)}</td>
                                <td>{formatDate(request.endDate)}</td>
                                <td>{request.totalDays} day(s)</td>
                                <td>
                                    <span className={`status-badge ${request.status}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {request.status === 'pending' ? (
                                        <>
                                            <button className="action-icon approve" onClick={() => handleAction(request._id, 'approved')} disabled={actionLoading === request._id}><Check size={16} /></button>
                                            <button className="action-icon reject" onClick={() => handleAction(request._id, 'rejected')} disabled={actionLoading === request._id}><X size={16} /></button>
                                        </>
                                    ) : (
                                        <span className="action-text">{request.status}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
