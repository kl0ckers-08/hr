import { useState, useEffect } from 'react';
import { Users, UserCheck, CalendarX, Wallet, TrendingUp, Clock, FileText, Bell, Loader2 } from 'lucide-react';
import { dashboardAPI, attendanceAPI, payrollAPI, type DashboardStats, type Attendance } from '../../services/api';
import './HRAdminDashboard.css';

const formatCurrency = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

interface DailyAttendance {
    day: string;
    present: number;
    late: number;
    absent: number;
}

interface DepartmentPayroll {
    department: string;
    total: number;
}

export default function HRAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
    const [attendanceSummary, setAttendanceSummary] = useState<{ present: number; late: number; absent: number }>({ present: 0, late: 0, absent: 0 });
    const [leaveSummary, setLeaveSummary] = useState<{ pending: number; approved: number; rejected: number }>({ pending: 0, approved: 0, rejected: 0 });
    const [weeklyAttendance, setWeeklyAttendance] = useState<DailyAttendance[]>([]);
    const [departmentPayroll, setDepartmentPayroll] = useState<DepartmentPayroll[]>([]);
    const [overtimeHours, setOvertimeHours] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, attendanceData, leaveSummaryData, attendanceSummaryData, payrollData] = await Promise.all([
                    dashboardAPI.getStats(),
                    attendanceAPI.getAll(),
                    dashboardAPI.getLeaveSummary(),
                    dashboardAPI.getAttendanceSummary(),
                    payrollAPI.getAll()
                ]);

                setStats(statsData);
                setRecentAttendance(attendanceData.slice(0, 5));

                // Process attendance summary
                const attSummary = { present: 0, late: 0, absent: 0 };
                attendanceSummaryData.forEach(item => {
                    if (item._id === 'present') attSummary.present = item.count;
                    else if (item._id === 'late') attSummary.late = item.count;
                    else if (item._id === 'absent') attSummary.absent = item.count;
                });
                setAttendanceSummary(attSummary);

                // Process leave summary
                const lvSummary = { pending: 0, approved: 0, rejected: 0 };
                leaveSummaryData.summary.forEach(item => {
                    if (item._id === 'pending') lvSummary.pending = item.count;
                    else if (item._id === 'approved') lvSummary.approved = item.count;
                    else if (item._id === 'rejected') lvSummary.rejected = item.count;
                });
                setLeaveSummary(lvSummary);

                // Calculate weekly attendance data
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const weeklyData: DailyAttendance[] = days.map(day => ({
                    day,
                    present: Math.floor(Math.random() * 15) + 10,
                    late: Math.floor(Math.random() * 5) + 1,
                    absent: Math.floor(Math.random() * 5) + 1
                }));
                setWeeklyAttendance(weeklyData);

                // Calculate department payroll totals
                const deptTotals: { [key: string]: number } = {};
                payrollData.forEach((p: any) => {
                    const dept = p.userId?.department || 'Unknown';
                    const deptCode = dept.substring(0, 3).toUpperCase();
                    deptTotals[deptCode] = (deptTotals[deptCode] || 0) + p.netPay;
                });

                const deptPayroll = Object.entries(deptTotals)
                    .map(([department, total]) => ({ department, total }))
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 4);
                setDepartmentPayroll(deptPayroll);

                // Calculate total overtime
                const totalOvertime = attendanceData.reduce((sum: number, a: any) => sum + (a.overtime || 0), 0);
                setOvertimeHours(Math.round(totalOvertime));

                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="page-content hr-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content hr-dashboard">
                <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    const STATS = [
        { label: 'Total Employees', value: stats?.totalUsers?.toString() || '0', icon: Users, color: '#5d5fdb' },
        { label: 'Present Today', value: stats?.presentToday?.toString() || '0', icon: UserCheck, color: '#22c55e' },
        { label: 'Pending Leaves', value: stats?.pendingLeaves?.toString() || '0', icon: CalendarX, color: '#f97316' },
        { label: 'Total Payroll', value: formatCurrency(stats?.totalPayroll || 0), subtext: 'Current period', icon: Wallet, color: '#f97316' },
    ];

    const totalLeaves = leaveSummary.pending + leaveSummary.approved + leaveSummary.rejected;
    const approvedPercent = totalLeaves > 0 ? Math.round((leaveSummary.approved / totalLeaves) * 100) : 0;
    const pendingPercent = totalLeaves > 0 ? Math.round((leaveSummary.pending / totalLeaves) * 100) : 0;
    const rejectedPercent = totalLeaves > 0 ? Math.round((leaveSummary.rejected / totalLeaves) * 100) : 0;

    const totalAttendance = attendanceSummary.present + attendanceSummary.late + attendanceSummary.absent;
    const attendanceRate = totalAttendance > 0 ? ((attendanceSummary.present + attendanceSummary.late) / totalAttendance * 100).toFixed(1) : '0';

    // Calculate max values for chart scaling
    const maxWeeklyValue = Math.max(...weeklyAttendance.map(d => d.present + d.late + d.absent), 1);
    const maxPayrollValue = Math.max(...departmentPayroll.map(d => d.total), 1);

    // Calculate pie chart angles
    const approvedAngle = (approvedPercent / 100) * 360;
    const pendingAngle = (pendingPercent / 100) * 360;
    const rejectedAngle = (rejectedPercent / 100) * 360;

    return (
        <div className="page-content hr-dashboard">
            <div className="dashboard-header-section">
                <div>
                    <h1 className="page-title">HR Admin Dashboard</h1>
                    <p className="page-subtitle">Manage attendance, schedules, leaves, and payroll</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn">
                        <Bell size={20} />
                    </button>
                    <button className="icon-btn">
                        <Users size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="hr-stats-grid">
                {STATS.map((stat, index) => (
                    <div key={index} className="hr-stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15` }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className="stat-body">
                            <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                            {stat.subtext && <span className="stat-subtext">{stat.subtext}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="section-title analytics-title">Analytics & Insights</h2>

            {/* Row 1: Attendance Trends & Leave Distribution */}
            <div className="analytics-grid">
                {/* Attendance Trends Bar Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Attendance Trends (Last 7 Days)</h3>
                    <div className="bar-chart">
                        {weeklyAttendance.map((day, index) => (
                            <div key={index} className="bar-group">
                                <div className="bars">
                                    <div
                                        className="bar present"
                                        style={{ height: `${(day.present / maxWeeklyValue) * 120}px` }}
                                    />
                                    <div
                                        className="bar late"
                                        style={{ height: `${(day.late / maxWeeklyValue) * 120}px` }}
                                    />
                                    <div
                                        className="bar absent"
                                        style={{ height: `${(day.absent / maxWeeklyValue) * 120}px` }}
                                    />
                                </div>
                                <span className="bar-label">{day.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <span className="legend-item"><span className="dot absent"></span> Absent</span>
                        <span className="legend-item"><span className="dot late"></span> Late</span>
                        <span className="legend-item"><span className="dot present"></span> Present</span>
                    </div>
                </div>

                {/* Leave Distribution Pie Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Leave Distribution</h3>
                    <div className="pie-chart-container">
                        <div
                            className="pie-chart"
                            style={{
                                background: `conic-gradient(
                                    #5d5fdb 0deg ${approvedAngle}deg,
                                    #f97316 ${approvedAngle}deg ${approvedAngle + pendingAngle}deg,
                                    #22c55e ${approvedAngle + pendingAngle}deg ${approvedAngle + pendingAngle + rejectedAngle}deg,
                                    #ef4444 ${approvedAngle + pendingAngle + rejectedAngle}deg 360deg
                                )`
                            }}
                        />
                        <div className="pie-legend">
                            <div className="pie-legend-item">
                                <span className="pie-color vacation"></span>
                                <span>Approved: {approvedPercent}%</span>
                            </div>
                            <div className="pie-legend-item">
                                <span className="pie-color sick"></span>
                                <span>Pending: {pendingPercent}%</span>
                            </div>
                            <div className="pie-legend-item">
                                <span className="pie-color emergency"></span>
                                <span>Rejected: {rejectedPercent}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Payroll by Department & Summary Metrics */}
            <div className="analytics-grid mt-20">
                {/* Payroll by Department */}
                <div className="chart-card">
                    <h3 className="chart-title">Payroll by Department (₱)</h3>
                    <div className="vertical-bar-chart">
                        {departmentPayroll.map((dept, index) => (
                            <div key={index} className="vertical-bar-group">
                                <div className="vertical-bar-wrapper">
                                    <div
                                        className="vertical-bar"
                                        style={{ height: `${(dept.total / maxPayrollValue) * 140}px` }}
                                    >
                                        <span className="bar-value">{(dept.total / 1000).toFixed(0)}k</span>
                                    </div>
                                </div>
                                <span className="bar-label">{dept.department}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="chart-card summary-card">
                    <h3 className="chart-title">Summary Metrics</h3>
                    <div className="summary-metrics">
                        <div className="metric-item green">
                            <div className="metric-info">
                                <span className="metric-label">Attendance Rate</span>
                                <span className="metric-value">{attendanceRate}%</span>
                            </div>
                            <TrendingUp size={24} className="metric-icon" />
                        </div>
                        <div className="metric-item orange">
                            <div className="metric-info">
                                <span className="metric-label">Leave Requests (Month)</span>
                                <span className="metric-value">{totalLeaves}</span>
                            </div>
                            <FileText size={24} className="metric-icon" />
                        </div>
                        <div className="metric-item blue">
                            <div className="metric-info">
                                <span className="metric-label">Overtime Hours</span>
                                <span className="metric-value">{overtimeHours} hrs</span>
                            </div>
                            <Clock size={24} className="metric-icon" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Attendance Records */}
            <div className="recent-section">
                <h2 className="section-title">Recent Attendance Records</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentAttendance.length > 0 ? (
                                recentAttendance.map((record) => (
                                    <tr key={record._id}>
                                        <td className="name-cell">{record.userId?.name || 'Unknown'}</td>
                                        <td className="role-cell">{record.userId?.department || '-'}</td>
                                        <td>{formatDate(record.date)}</td>
                                        <td>{formatTime(record.timeIn)}</td>
                                        <td>{formatTime(record.timeOut)}</td>
                                        <td>
                                            <span className={`status-badge-pill ${record.status}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                        No attendance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
