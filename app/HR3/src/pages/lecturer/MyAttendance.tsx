import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { attendanceAPI, type Attendance } from '../../services/api';
import './MyAttendance.css';

export default function MyAttendance() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [clockedIn, setClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await attendanceAPI.getMyAttendance();
            setAttendance(data);
            
            // Check if clocked in today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayRecord = data.find(a => {
                const attDate = new Date(a.date);
                attDate.setHours(0, 0, 0, 0);
                return attDate.getTime() === today.getTime();
            });
            setClockedIn(!!todayRecord?.timeIn && !todayRecord?.timeOut);
            
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load attendance');
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

    const filteredAttendance = attendance.filter(a => {
        const attDate = new Date(a.date);
        return attDate.getMonth() === currentMonth.getMonth() && attDate.getFullYear() === currentMonth.getFullYear();
    });

    const stats = {
        totalHours: filteredAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0).toFixed(1),
        presentDays: filteredAttendance.filter(a => a.status === 'present').length,
        lateDays: filteredAttendance.filter(a => a.status === 'late').length,
        absentDays: filteredAttendance.filter(a => a.status === 'absent').length,
        overtime: filteredAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0).toFixed(1)
    };

    const STATS = [
        { label: 'Total Hours', value: stats.totalHours, bgColor: '#eff6ff' },
        { label: 'Present Days', value: stats.presentDays.toString(), color: '#22c55e', bgColor: '#f0fdf4' },
        { label: 'Late Count', value: stats.lateDays.toString(), color: '#f97316', bgColor: '#fff7ed' },
        { label: 'Absent Count', value: stats.absentDays.toString(), color: '#ef4444', bgColor: '#fef2f2' },
        { label: 'Overtime', value: stats.overtime, color: '#5d5fdb', bgColor: '#f5f3ff' },
    ];

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentMonth(newDate);
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
                    <h1 className="page-title">My Attendance</h1>
                    <p className="page-subtitle">View your attendance records and history</p>
                </div>
                <button className="btn-primary" style={{ background: '#64748b' }}>
                    <Download size={18} />
                    <span>Download Report</span>
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Clock In/Out Section */}
            <div style={{ marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Time Clock</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={clockedIn ? handleClockOut : handleClockIn}
                        disabled={clockLoading}
                        style={{
                            padding: '12px 24px',
                            background: clockedIn ? '#ef4444' : '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: clockLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {clockLoading ? <Loader2 className="spin" size={18} /> : <Clock size={18} />}
                        {clockLoading ? 'Processing...' : clockedIn ? 'Clock Out' : 'Clock In'}
                    </button>
                </div>
            </div>

            <div className="month-selector">
                <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
                    <ChevronLeft size={18} />
                </button>
                <span className="current-month">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button className="month-nav-btn" onClick={() => changeMonth(1)}>
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="attendance-stats-grid">
                {STATS.map((stat, index) => (
                    <div key={index} className="attendance-stat-card" style={{ backgroundColor: stat.bgColor }}>
                        <span className="stat-label" style={{ color: stat.color || 'var(--text-muted)' }}>{stat.label}</span>
                        <span className="stat-value" style={{ color: stat.color || 'var(--text-main)' }}>{stat.value}</span>
                    </div>
                ))}
            </div>

            <div className="records-section">
                <h2 className="section-title">Attendance Records - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Total Hours</th>
                                <th>Overtime</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((record) => (
                                    <tr key={record._id}>
                                        <td>{formatDate(record.date)}</td>
                                        <td className="text-primary">{formatTime(record.timeIn)}</td>
                                        <td className="text-primary">{formatTime(record.timeOut)}</td>
                                        <td>{record.hoursWorked?.toFixed(2) || '0'} hrs</td>
                                        <td>{record.overtime?.toFixed(2) || '0'} hrs</td>
                                        <td>
                                            <span className={`status-badge-pill ${record.status}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                        No attendance records for this month
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
