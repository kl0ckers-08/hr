import { useState, useEffect } from 'react';
import { Download, Search, Filter, Clock, Loader2 } from 'lucide-react';
import { attendanceAPI, departmentsAPI, type Attendance as AttendanceType, type Department } from '../services/api';
import './Attendance.css';

export default function Attendance() {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All Departments');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [dateFilter, setDateFilter] = useState('');
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (dateFilter) params.date = dateFilter;
            if (statusFilter !== 'All Status') params.status = statusFilter.toLowerCase();

            const [attData, deptsData] = await Promise.all([
                attendanceAPI.getAll(params),
                departmentsAPI.getAll().catch(() => [] as Department[])
            ]);
            setAttendance(attData);
            setDepartments(deptsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [dateFilter, statusFilter]);

    const filteredRecords = attendance.filter(record => {
        const matchesSearch = record.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesDepartment = departmentFilter === 'All Departments' || record.userId?.department === departmentFilter;
        return matchesSearch && matchesDepartment;
    });

    const stats = {
        present: filteredRecords.filter(r => r.status === 'present').length,
        late: filteredRecords.filter(r => r.status === 'late').length,
        absent: filteredRecords.filter(r => r.status === 'absent').length,
        overtime: filteredRecords.reduce((sum, r) => sum + (r.overtime || 0), 0).toFixed(1)
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
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
                    <h1 className="page-title">Time & Attendance Management</h1>
                    <p className="page-subtitle">Track and manage employee attendance records</p>
                </div>
                <button className="primary-btn">
                    <Download size={18} />
                    <span>Download Report</span>
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div className="stats-row">
                <div className="stat-mini-card" style={{ borderLeftColor: '#22c55e' }}>
                    <span className="stat-mini-label">Total Present</span>
                    <span className="stat-mini-value" style={{ color: '#22c55e' }}>{stats.present}</span>
                </div>
                <div className="stat-mini-card" style={{ borderLeftColor: '#f97316' }}>
                    <span className="stat-mini-label">Total Late</span>
                    <span className="stat-mini-value" style={{ color: '#f97316' }}>{stats.late}</span>
                </div>
                <div className="stat-mini-card" style={{ borderLeftColor: '#ef4444' }}>
                    <span className="stat-mini-label">Total Absent</span>
                    <span className="stat-mini-value" style={{ color: '#ef4444' }}>{stats.absent}</span>
                </div>
                <div className="stat-mini-card" style={{ borderLeftColor: '#8b5cf6' }}>
                    <span className="stat-mini-label">Total Overtime</span>
                    <span className="stat-mini-value" style={{ color: '#8b5cf6' }}>{stats.overtime} hrs</span>
                </div>
            </div>

            <div className="filters-section">
                <div className="filters-header">
                    <Filter size={18} />
                    <span>Filters</span>
                </div>
                <div className="filters-row">
                    <div className="search-bar filter-search">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="filter-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                        <option>All Departments</option>
                        {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option>All Status</option>
                        <option>Present</option>
                        <option>Late</option>
                        <option>Absent</option>
                    </select>
                    <div className="date-picker">
                        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} placeholder="mm/dd/yyyy" />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table attendance-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Total Hours</th>
                            <th>Overtime</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record._id}>
                                    <td className="name-cell">{record.userId?.name || 'Unknown'}</td>
                                    <td className="role-cell">{record.userId?.department || '-'}</td>
                                    <td>{formatDate(record.date)}</td>
                                    <td>
                                        <span className="time-cell">
                                            <Clock size={14} />
                                            {formatTime(record.timeIn)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="time-cell">
                                            <Clock size={14} />
                                            {formatTime(record.timeOut)}
                                        </span>
                                    </td>
                                    <td>{record.hoursWorked?.toFixed(2) || '0.00'} hrs</td>
                                    <td className="overtime-cell">{record.overtime?.toFixed(2) || '0.00'} hrs</td>
                                    <td>
                                        <span className={`status-badge-alt ${record.status}`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No attendance records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
