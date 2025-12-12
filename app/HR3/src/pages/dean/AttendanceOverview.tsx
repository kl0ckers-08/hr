import { useState, useEffect } from 'react';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { attendanceAPI, usersAPI, type Attendance, type User } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AttendanceOverview.css';

interface FacultyStats {
    userId: string;
    name: string;
    department: string;
    totalHours: number;
    lateCount: number;
    absentCount: number;
    presentCount: number;
    attendanceRate: number;
}

export default function AttendanceOverview() {
    const { user } = useAuth();
    const [facultyStats, setFacultyStats] = useState<FacultyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            let attendanceData: Attendance[] = [];
            let usersData: User[] = [];

            try {
                attendanceData = await attendanceAPI.getAll();
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
                attendanceData = [];
            }

            try {
                usersData = await usersAPI.getAll();
            } catch (err) {
                console.error('Failed to fetch users:', err);
                usersData = [];
            }

            console.log('Dean department:', user?.department);
            console.log('All users count:', usersData.length);
            console.log('All attendance count:', attendanceData.length);

            // Get all faculty/staff users - flexible department matching
            let deptUsers: User[] = [];
            if (user?.department) {
                deptUsers = usersData.filter(u => {
                    const userDept = (u.department || '').toLowerCase().trim();
                    const deanDept = (user.department || '').toLowerCase().trim();
                    const isMatchingDept = userDept === deanDept || userDept.includes(deanDept) || deanDept.includes(userDept);
                    const isValidRole = ['lecturer', 'adminstaff'].includes(u.role || '');
                    return isMatchingDept && isValidRole;
                });

                // Fallback: show all faculty if no matches
                if (deptUsers.length === 0) {
                    console.log('No faculty found for department, showing all faculty');
                    deptUsers = usersData.filter(u => ['lecturer', 'adminstaff'].includes(u.role || ''));
                }
            } else {
                deptUsers = usersData.filter(u => ['lecturer', 'adminstaff'].includes(u.role || ''));
            }

            console.log('Filtered faculty count:', deptUsers.length);

            // Calculate stats for each faculty
            const stats: FacultyStats[] = deptUsers.map(faculty => {
                const userAttendance = attendanceData.filter(a => {
                    const attUserId = typeof a.userId === 'object' ? a.userId?._id : a.userId;
                    return attUserId === faculty._id;
                });

                const totalHours = userAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
                const lateCount = userAttendance.filter(a => a.status === 'late').length;
                const absentCount = userAttendance.filter(a => a.status === 'absent').length;
                const presentCount = userAttendance.filter(a => ['present', 'late'].includes(a.status || '')).length;
                const totalRecords = userAttendance.length;
                const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

                return {
                    userId: faculty._id,
                    name: faculty.name || 'Unknown',
                    department: faculty.department || 'No Department',
                    totalHours,
                    lateCount,
                    absentCount,
                    presentCount,
                    attendanceRate
                };
            });

            console.log('Faculty stats:', stats);
            setFacultyStats(stats);
        } catch (err) {
            console.error('AttendanceOverview error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

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
                    <h1 className="page-title">Attendance Overview</h1>
                    <p className="page-subtitle">Monitor faculty attendance and hours - {user?.department || 'All Departments'}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="primary-btn" onClick={fetchData} style={{ background: '#64748b' }}>
                        <RefreshCw size={18} />
                        <span>Refresh</span>
                    </button>
                    <button className="primary-btn" style={{ background: '#5d5fdb' }}>
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Faculty</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#5d5fdb' }}>{facultyStats.length}</p>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Avg Attendance Rate</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>
                        {facultyStats.length > 0 ? (facultyStats.reduce((sum, f) => sum + f.attendanceRate, 0) / facultyStats.length).toFixed(1) : 0}%
                    </p>
                </div>
                <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Late</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#f97316' }}>
                        {facultyStats.reduce((sum, f) => sum + f.lateCount, 0)}
                    </p>
                </div>
                <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Absent</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>
                        {facultyStats.reduce((sum, f) => sum + f.absentCount, 0)}
                    </p>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table attendance-overview-table">
                    <thead>
                        <tr>
                            <th>Faculty</th>
                            <th>Department</th>
                            <th>Total Hours</th>
                            <th>Present Days</th>
                            <th>Late Count</th>
                            <th>Absent Count</th>
                            <th>Attendance Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facultyStats.length > 0 ? facultyStats.map((record) => (
                            <tr key={record.userId}>
                                <td className="faculty-name">{record.name}</td>
                                <td style={{ color: '#64748b' }}>{record.department}</td>
                                <td>{record.totalHours.toFixed(1)} hrs</td>
                                <td style={{ color: '#22c55e', fontWeight: 500 }}>{record.presentCount}</td>
                                <td className="late-count">{record.lateCount}</td>
                                <td className="absent-count">{record.absentCount}</td>
                                <td className="rate-cell">
                                    <span style={{
                                        color: record.attendanceRate >= 90 ? '#22c55e' : record.attendanceRate >= 75 ? '#f97316' : '#ef4444',
                                        fontWeight: 600
                                    }}>
                                        {record.attendanceRate.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📊</p>
                                    <p style={{ margin: 0, fontWeight: 500 }}>No faculty attendance data found</p>
                                    <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>Attendance records will appear here once faculty clock in.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
