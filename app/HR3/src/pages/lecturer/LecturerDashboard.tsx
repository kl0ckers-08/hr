import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Timer, CalendarX, Bell, Users, Loader2, X, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI, leaveAPI, schedulesAPI, type Attendance, type Leave, type Schedule } from '../../services/api';
import './LecturerDashboard.css';

export default function LecturerDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clockedIn, setClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);
    const [stats, setStats] = useState({
        attendanceRate: '0%',
        totalHours: '0',
        overtime: '0 hrs',
        leaveBalance: '0/0'
    });
    const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
    const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);

    // Leave request modal state
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [leaveSubmitting, setLeaveSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attendanceData, leavesData, schedulesData] = await Promise.all([
                attendanceAPI.getMyAttendance(),
                leaveAPI.getMyLeaves(),
                schedulesAPI.getMySchedule()
            ]);

            const totalRecords = attendanceData.length;
            const presentDays = attendanceData.filter(a => ['present', 'late'].includes(a.status)).length;
            const attendanceRate = totalRecords > 0 ? Math.round((presentDays / totalRecords) * 100) : 0;
            const totalHours = attendanceData.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
            const totalOvertime = attendanceData.reduce((sum, a) => sum + (a.overtime || 0), 0);

            const approvedLeaves = leavesData.filter((l: Leave) => l.status === 'approved');
            const usedDays = approvedLeaves.reduce((sum: number, l: Leave) => sum + l.totalDays, 0);
            const totalLeave = 15;

            setStats({
                attendanceRate: `${attendanceRate}%`,
                totalHours: totalHours.toFixed(0),
                overtime: `${totalOvertime.toFixed(1)} hrs`,
                leaveBalance: `${totalLeave - usedDays}/${totalLeave}`
            });

            setRecentAttendance(attendanceData.slice(0, 7));

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayRecord = attendanceData.find(a => {
                const attDate = new Date(a.date);
                attDate.setHours(0, 0, 0, 0);
                return attDate.getTime() === today.getTime();
            });
            setClockedIn(!!todayRecord?.timeIn && !todayRecord?.timeOut);

            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const todayDay = days[today.getDay()];
            const todaySched = schedulesData.find((s: Schedule) => s.dayOfWeek === todayDay);
            setTodaySchedule(todaySched || null);

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleClockIn = async () => {
        try {
            setClockLoading(true);
            await attendanceAPI.clockIn();
            setClockedIn(true);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to clock in');
        } finally {
            setClockLoading(false);
        }
    };

    const handleClockOut = async () => {
        try {
            setClockLoading(true);
            await attendanceAPI.clockOut();
            setClockedIn(false);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to clock out');
        } finally {
            setClockLoading(false);
        }
    };

    const handleLeaveSubmit = async () => {
        if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLeaveSubmitting(true);
            await leaveAPI.create({
                type: leaveForm.type,
                startDate: leaveForm.startDate,
                endDate: leaveForm.endDate,
                reason: leaveForm.reason
            });
            setShowLeaveModal(false);
            setLeaveForm({ type: 'vacation', startDate: '', endDate: '', reason: '' });
            alert('Leave request submitted successfully!');
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to submit leave request');
        } finally {
            setLeaveSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content lecturer-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content lecturer-dashboard">
                <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>Error: {error}</div>
            </div>
        );
    }

    const STATS_DATA = [
        { icon: Clock, label: 'Attendance Rate', value: stats.attendanceRate, color: '#5d5fdb', bgColor: '#eff6ff' },
        { icon: CheckCircle, label: 'Total Hours', value: stats.totalHours, color: '#22c55e', bgColor: '#f0fdf4' },
        { icon: Timer, label: 'Overtime', value: stats.overtime, color: '#f97316', bgColor: '#fff7ed' },
        { icon: CalendarX, label: 'Leave Balance', value: stats.leaveBalance, color: '#ef4444', bgColor: '#fef2f2' },
    ];

    return (
        <div className="page-content lecturer-dashboard">
            <div className="dashboard-header-section">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name || 'User'}!</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn"><Bell size={20} /></button>
                    <button className="icon-btn"><Users size={20} /></button>
                </div>
            </div>

            <div className="clock-section" style={{ marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Time Clock</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={clockedIn ? handleClockOut : handleClockIn} disabled={clockLoading}
                        style={{ padding: '12px 24px', background: clockedIn ? '#ef4444' : '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: clockLoading ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {clockLoading ? <Loader2 className="spin" size={18} /> : <Clock size={18} />}
                        {clockLoading ? 'Processing...' : clockedIn ? 'Clock Out' : 'Clock In'}
                    </button>
                </div>
            </div>

            <div className="lecturer-stats-grid">
                {STATS_DATA.map((stat, index) => (
                    <div key={index} className="lecturer-stat-card" style={{ backgroundColor: stat.bgColor }}>
                        <div className="stat-header">
                            <div className="stat-icon-circle" style={{ backgroundColor: `${stat.color}20` }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <span className="stat-value">{stat.value}</span>
                    </div>
                ))}
            </div>

            <div className="charts-row">
                <div className="chart-card attendance-trend-card">
                    <h3 className="chart-title">My Attendance <span className="text-primary">Trend</span></h3>
                    <div className="line-chart">
                        <div className="chart-y-axis"><span>1</span><span>0.5</span><span>0</span></div>
                        <div className="chart-area">
                            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="trend-line">
                                <polyline fill="none" stroke="#5d5fdb" strokeWidth="2"
                                    points={recentAttendance.map((a, i) => {
                                        const x = (i / Math.max(recentAttendance.length - 1, 1)) * 300;
                                        const y = a.status === 'present' ? 10 : a.status === 'late' ? 50 : 90;
                                        return `${x},${y}`;
                                    }).join(' ')} />
                                {recentAttendance.map((a, i) => {
                                    const x = (i / Math.max(recentAttendance.length - 1, 1)) * 300;
                                    const y = a.status === 'present' ? 10 : a.status === 'late' ? 50 : 90;
                                    return <circle key={i} cx={x} cy={y} r="4" fill="#5d5fdb" />;
                                })}
                            </svg>
                            <div className="chart-x-axis">
                                {recentAttendance.slice(0, 7).map((a, i) => (
                                    <span key={i}>{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="chart-legend">
                        <span className="legend-item">1 = Present, 0.5 = <span className="text-orange">Late</span>, 0 = <span className="text-red">Absent</span></span>
                    </div>
                </div>

                <div className="chart-card schedule-card">
                    <h3 className="chart-title">My Schedule</h3>
                    <div className="upcoming-shift">
                        <span className="shift-label">Today's Shift</span>
                        <span className="shift-time">{todaySchedule ? `${todaySchedule.startTime} – ${todaySchedule.endTime}` : 'No schedule today'}</span>
                    </div>
                    <button className="view-schedule-btn">View Full Schedule</button>
                </div>
            </div>

            <div className="leave-balance-section">
                <h3 className="section-heading">Leave Balance</h3>
                <div className="leave-balance-row">
                    <div className="leave-progress-container">
                        <span className="leave-label">Annual Leave Quota</span>
                        <div className="leave-progress-bar">
                            <div className="leave-progress-fill" style={{ width: `${(parseInt(stats.leaveBalance.split('/')[0]) / parseInt(stats.leaveBalance.split('/')[1])) * 100}%` }}></div>
                        </div>
                    </div>
                    <span className="leave-count">{stats.leaveBalance} days</span>
                    <button className="request-leave-btn" onClick={() => setShowLeaveModal(true)}>Request Leave</button>
                </div>
            </div>

            {/* Leave Request Modal */}
            {showLeaveModal && (
                <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
                    <div className="modal-content leave-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <Calendar size={24} className="modal-icon" />
                                <div>
                                    <h2>Request Leave</h2>
                                    <p className="modal-subtitle">Submit a new leave request</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowLeaveModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="leave-form">
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select
                                    value={leaveForm.type}
                                    onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                >
                                    <option value="vacation">Vacation Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="emergency">Emergency Leave</option>
                                    <option value="personal">Personal Leave</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={leaveForm.startDate}
                                        onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={leaveForm.endDate}
                                        onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                        min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    rows={3}
                                    placeholder="Please provide a reason for your leave request..."
                                    value={leaveForm.reason}
                                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                            <button className="submit-btn" onClick={handleLeaveSubmit} disabled={leaveSubmitting}>
                                {leaveSubmitting ? <Loader2 size={16} className="spin" /> : null}
                                <span>{leaveSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
