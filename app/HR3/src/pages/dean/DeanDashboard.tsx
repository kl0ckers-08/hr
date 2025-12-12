import { useState, useEffect } from 'react';
import { Users, Bell, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { leaveAPI, attendanceAPI, usersAPI, type Leave, type User } from '../../services/api';
import './DeanDashboard.css';

export default function DeanDashboard() {
    const { user } = useAuth();
    const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
    const [stats, setStats] = useState({ totalFaculty: 0, presentToday: 0, pendingRequests: 0, onLeave: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data with individual error handling
            let leavesData: Leave[] = [];
            let usersData: User[] = [];
            let attendanceData: any[] = [];

            try {
                leavesData = await leaveAPI.getAll({ status: 'pending' });
            } catch (err) {
                console.error('Failed to fetch leaves:', err);
                leavesData = [];
            }

            try {
                usersData = await usersAPI.getAll();
            } catch (err) {
                console.error('Failed to fetch users:', err);
                usersData = [];
            }

            try {
                attendanceData = await attendanceAPI.getAll();
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
                attendanceData = [];
            }

            // Filter leaves for the dean's department with null checks
            const deptLeaves = user?.department
                ? leavesData.filter(l => l?.userId?.department === user.department)
                : leavesData;
            setPendingLeaves(deptLeaves || []);

            // Calculate stats with null checks
            const deptUsers = user?.department
                ? usersData.filter((u: User) => u?.department === user.department && ['lecturer', 'adminstaff'].includes(u?.role || ''))
                : usersData.filter((u: User) => ['lecturer', 'adminstaff'].includes(u?.role || ''));

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            const todayAttendance = Array.isArray(attendanceData)
                ? attendanceData.filter(a => {
                    if (!a?.date) return false;
                    try {
                        const attDate = new Date(a.date).toISOString().split('T')[0];
                        return attDate === todayStr && ['present', 'late'].includes(a?.status || '');
                    } catch {
                        return false;
                    }
                })
                : [];

            const onLeaveCount = Array.isArray(leavesData)
                ? leavesData.filter(l => {
                    if (!l?.startDate || !l?.endDate) return false;
                    try {
                        const start = new Date(l.startDate);
                        const end = new Date(l.endDate);
                        return l.status === 'approved' && today >= start && today <= end;
                    } catch {
                        return false;
                    }
                }).length
                : 0;

            setStats({
                totalFaculty: deptUsers?.length || 0,
                presentToday: todayAttendance?.length || 0,
                pendingRequests: deptLeaves?.length || 0,
                onLeave: onLeaveCount || 0
            });

        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleApprove = async (leaveId: string) => {
        if (!leaveId) return;
        try {
            setActionLoading(leaveId);
            await leaveAPI.updateStatus(leaveId, { status: 'approved' });
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to approve leave');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (leaveId: string) => {
        if (!leaveId) return;
        try {
            setActionLoading(leaveId);
            await leaveAPI.updateStatus(leaveId, { status: 'rejected' });
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to reject leave');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    };

    const calculateDays = (start: string | null | undefined, end: string | null | undefined) => {
        if (!start || !end) return 0;
        try {
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
            return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        } catch {
            return 0;
        }
    };

    if (loading) {
        return (
            <div className="page-content dean-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content dean-dashboard">
                <div className="error-container">
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                    <button className="retry-btn" onClick={fetchData}>
                        <RefreshCw size={16} />
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        );
    }

    const STATS = [
        { label: 'Total Faculty', value: stats.totalFaculty.toString(), bgColor: '#eff6ff' },
        { label: 'Present Today', value: stats.presentToday.toString(), color: '#22c55e', bgColor: '#f0fdf4' },
        { label: 'Pending Requests', value: stats.pendingRequests.toString(), color: '#f97316', bgColor: '#fff7ed' },
        { label: 'On Leave', value: stats.onLeave.toString(), bgColor: '#faf5ff' },
    ];

    return (
        <div className="page-content dean-dashboard">
            <div className="dashboard-header-section">
                <div>
                    <h1 className="page-title">Dean Dashboard</h1>
                    <p className="page-subtitle">{user?.department || 'Department'} Overview</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn" onClick={fetchData} title="Refresh data">
                        <RefreshCw size={20} />
                    </button>
                    <button className="icon-btn">
                        <Bell size={20} />
                    </button>
                    <button className="icon-btn">
                        <Users size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="dean-stats-grid">
                {STATS.map((stat, index) => (
                    <div
                        key={index}
                        className="dean-stat-card"
                        style={{ backgroundColor: stat.bgColor }}
                    >
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value" style={{ color: stat.color || '#1e293b' }}>
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Pending Leave Requests */}
            <div className="pending-section">
                <h2 className="section-title">Pending Leave Requests</h2>
                <div className="pending-list">
                    {pendingLeaves && pendingLeaves.length > 0 ? (
                        pendingLeaves.map((request) => (
                            <div key={request._id || Math.random()} className="pending-item">
                                <div className="request-info">
                                    <span className="request-name">{request?.userId?.name || 'Unknown Employee'}</span>
                                    <span className="request-details">
                                        {(request?.type || 'Leave').charAt(0).toUpperCase() + (request?.type || 'leave').slice(1)} Leave - {formatDate(request?.startDate)} to {formatDate(request?.endDate)} ({calculateDays(request?.startDate, request?.endDate)} days)
                                    </span>
                                    {request?.reason && (
                                        <span className="request-reason">Reason: {request.reason}</span>
                                    )}
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleApprove(request._id)}
                                        disabled={actionLoading === request._id || !request._id}
                                    >
                                        {actionLoading === request._id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleReject(request._id)}
                                        disabled={actionLoading === request._id || !request._id}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <span className="empty-text">No pending leave requests</span>
                            <span className="empty-subtext">All caught up! New requests will appear here.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
