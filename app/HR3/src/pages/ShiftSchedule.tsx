import { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, Search, Pencil, Trash2, Loader2, Plus, X } from 'lucide-react';
import { schedulesAPI, usersAPI, type Schedule, type User } from '../services/api';
import './ShiftSchedule.css';

type ViewType = 'calendar' | 'list';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

// Convert hour string to 24h number
const hourToNumber = (hour: string): number => {
    const num = parseInt(hour);
    if (hour.includes('pm') && num !== 12) return num + 12;
    if (hour.includes('am') && num === 12) return 0;
    return num;
};

// Convert 24h time string to hour index
const timeToHourIndex = (time: string): number => {
    const hour = parseInt(time.split(':')[0]);
    return hour - 6; // 6am is index 0
};

interface ScheduleFormData {
    shiftName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

const initialFormData: ScheduleFormData = {
    shiftName: 'Regular Shift',
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00'
};

export default function ShiftSchedule() {
    const [activeView, setActiveView] = useState<ViewType>('calendar');
    const [searchTerm, setSearchTerm] = useState('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');

    // Modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [assigningEmployee, setAssigningEmployee] = useState<User | null>(null);
    const [formData, setFormData] = useState<ScheduleFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [schedulesData, usersData] = await Promise.all([
                schedulesAPI.getAll(),
                usersAPI.getAll().catch(() => [] as User[])
            ]);
            setSchedules(schedulesData);
            setUsers(usersData);
        } catch (err) {
            console.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const employees = users.filter(u => ['lecturer', 'adminstaff', 'dean'].includes(u.role));

    // Apply search to employees
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEmployeeSchedules = (userId: string) => schedules.filter(s => (typeof s.userId === 'object' ? s.userId._id : s.userId) === userId);

    const getScheduleDisplay = (userId: string) => {
        const userSchedules = getEmployeeSchedules(userId);
        if (userSchedules.length === 0) return 'No schedule assigned';
        const days = [...new Set(userSchedules.map(s => s.dayOfWeek))];
        const times = userSchedules[0];
        return `${days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join('/')} ${times?.startTime || ''}-${times?.endTime || ''}`;
    };

    // Filter schedules based on selected employee or search term
    const filteredSchedules = useMemo(() => {
        let filtered = schedules;

        if (selectedEmployee) {
            filtered = filtered.filter(s =>
                (typeof s.userId === 'object' ? s.userId._id : s.userId) === selectedEmployee
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(s => {
                const employeeName = typeof s.userId === 'object' ? s.userId.name : '';
                return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        return filtered;
    }, [schedules, selectedEmployee, searchTerm]);

    // Group schedules by day for calendar view
    const schedulesByDay = useMemo(() => {
        const grouped: { [day: string]: Schedule[] } = {};
        DAYS.forEach(day => {
            grouped[day.toLowerCase()] = filteredSchedules.filter(s => s.dayOfWeek === day.toLowerCase());
        });
        return grouped;
    }, [filteredSchedules]);

    // Check if an hour falls within a shift
    const isHourInShift = (day: string, hourStr: string) => {
        const daySchedules = schedulesByDay[day.toLowerCase()] || [];
        const currentHour = hourToNumber(hourStr);

        return daySchedules.some(s => {
            const startHour = parseInt(s.startTime.split(':')[0]);
            const endHour = parseInt(s.endTime.split(':')[0]);
            return currentHour >= startHour && currentHour < endHour;
        });
    };

    // Get schedules for a day
    const getSchedulesForDay = (day: string) => {
        return schedulesByDay[day.toLowerCase()] || [];
    };

    // Handle Assign button click
    const handleAssignClick = (employee: User) => {
        setAssigningEmployee(employee);
        setFormData(initialFormData);
        setShowAssignModal(true);
    };

    // Handle Edit button click
    const handleEditClick = (employee: User) => {
        const empSchedules = getEmployeeSchedules(employee._id);
        if (empSchedules.length > 0) {
            const schedule = empSchedules[0];
            setEditingSchedule(schedule);
            setAssigningEmployee(employee);
            setFormData({
                shiftName: schedule.shiftName || 'Regular Shift',
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime
            });
            setShowEditModal(true);
        } else {
            // No schedule to edit, open assign modal instead
            handleAssignClick(employee);
        }
    };

    // Handle Delete button click
    const handleDeleteClick = async (employee: User) => {
        const empSchedules = getEmployeeSchedules(employee._id);
        if (empSchedules.length === 0) {
            alert('No schedules to delete for this employee.');
            return;
        }

        if (!confirm(`Are you sure you want to delete all schedules for ${employee.name}?`)) return;

        try {
            // Delete all schedules for this employee
            await Promise.all(empSchedules.map(s => schedulesAPI.delete(s._id)));
            await fetchData();
            alert('Schedules deleted successfully.');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete schedules');
        }
    };

    // Handle Assign submit
    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assigningEmployee) return;

        try {
            setSubmitting(true);
            await schedulesAPI.create({
                userId: assigningEmployee._id,
                shiftName: formData.shiftName,
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime
            });
            setShowAssignModal(false);
            await fetchData();
            alert('Schedule assigned successfully!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to assign schedule');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Edit submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSchedule) return;

        try {
            setSubmitting(true);
            await schedulesAPI.update(editingSchedule._id, {
                shiftName: formData.shiftName,
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime
            } as any);
            setShowEditModal(false);
            await fetchData();
            alert('Schedule updated successfully!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update schedule');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle clicking on an employee row to show their schedule in calendar
    const handleEmployeeRowClick = (employeeId: string) => {
        setSelectedEmployee(prev => prev === employeeId ? '' : employeeId);
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
                    <h1 className="page-title">Shift & Schedule Manager</h1>
                    <p className="page-subtitle">Assign and manage employee work schedules</p>
                </div>
            </div>

            <div className="view-controls">
                <div className="view-tabs">
                    <button className={`view-tab ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>
                        <Calendar size={16} /><span>Calendar View</span>
                    </button>
                    <button className={`view-tab ${activeView === 'list' ? 'active' : ''}`} onClick={() => setActiveView('list')}>
                        <Users size={16} /><span>Employee List</span>
                    </button>
                </div>
                <div className="search-bar compact">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Employee filter for calendar view */}
            {activeView === 'calendar' && (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Filter by Employee:</label>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                    >
                        <option value="">All Employees</option>
                        {filteredEmployees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                    </select>
                    {selectedEmployee && (
                        <button
                            onClick={() => setSelectedEmployee('')}
                            style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            )}

            {activeView === 'calendar' ? (
                <div className="calendar-container">
                    <div className="calendar-grid">
                        <div className="time-column">
                            <div className="header-cell"></div>
                            {HOURS.map((hour) => <div key={hour} className="time-cell">{hour}</div>)}
                        </div>
                        {DAYS.map((day) => {
                            const daySchedules = getSchedulesForDay(day);

                            return (
                                <div key={day} className="day-column">
                                    <div className={`header-cell ${day === 'Friday' ? 'friday' : ''}`}>{day}</div>
                                    <div className="day-cells">
                                        {HOURS.map((hour) => {
                                            const hasShift = isHourInShift(day, hour);
                                            return (
                                                <div
                                                    key={`${day}-${hour}`}
                                                    className={`schedule-cell ${hasShift ? 'has-shift' : ''}`}
                                                />
                                            );
                                        })}
                                        {daySchedules.map((schedule, idx) => {
                                            const startIndex = timeToHourIndex(schedule.startTime);
                                            const endIndex = timeToHourIndex(schedule.endTime);
                                            const shiftHeight = (endIndex - startIndex) * 40;

                                            // Calculate width and position for multiple shifts
                                            const totalShifts = daySchedules.length;
                                            const cardWidth = totalShifts > 1 ? `calc(${100 / Math.min(totalShifts, 3)}% - 6px)` : 'calc(100% - 8px)';
                                            const leftOffset = totalShifts > 1 ? `calc(${(idx % 3) * (100 / Math.min(totalShifts, 3))}% + 4px)` : '4px';

                                            if (startIndex < 0) return null;

                                            return (
                                                <div
                                                    key={schedule._id || idx}
                                                    className="shift-card"
                                                    style={{
                                                        top: `${startIndex * 40}px`,
                                                        height: `${Math.max(shiftHeight - 6, 60)}px`,
                                                        width: cardWidth,
                                                        left: leftOffset,
                                                        right: 'auto'
                                                    }}
                                                    title={`${typeof schedule.userId === 'object' ? schedule.userId.name : ''} - ${schedule.shiftName || 'Shift'}`}
                                                >
                                                    <span className="shift-time">{schedule.startTime} – {schedule.endTime}</span>
                                                    <span className="shift-location">{schedule.shiftName || 'Office'}</span>
                                                    <span className="shift-employee">
                                                        {typeof schedule.userId === 'object' ? schedule.userId.name : ''}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="list-container">
                    <div className="list-header"><h2>Employee List</h2></div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th>Current Shift</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                            No employees found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr
                                            key={emp._id}
                                            onClick={() => handleEmployeeRowClick(emp._id)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: selectedEmployee === emp._id ? '#eff6ff' : undefined
                                            }}
                                        >
                                            <td className="name-cell">{emp.name}</td>
                                            <td className="role-cell">{emp.department || '-'}</td>
                                            <td className="role-cell">{emp.role}</td>
                                            <td className="shift-cell">{getScheduleDisplay(emp._id)}</td>
                                            <td>
                                                <span className={`status-badge ${getEmployeeSchedules(emp._id).length > 0 ? 'active' : 'pending'}`}>
                                                    {getEmployeeSchedules(emp._id).length > 0 ? 'Scheduled' : 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                                <button className="assign-btn" onClick={() => handleAssignClick(emp)}>
                                                    <Plus size={14} /> Assign
                                                </button>
                                                <button className="action-icon edit" onClick={() => handleEditClick(emp)} title="Edit Schedule">
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="action-icon delete" onClick={() => handleDeleteClick(emp)} title="Delete Schedule">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Assign Schedule Modal */}
            {showAssignModal && assigningEmployee && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>Assign Schedule</h2>
                            <button className="close-btn" onClick={() => setShowAssignModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAssignSubmit}>
                            <div style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '16px', color: '#64748b' }}>
                                    Assigning schedule for: <strong style={{ color: '#1e293b' }}>{assigningEmployee.name}</strong>
                                </p>
                                <div className="form-group">
                                    <label>Shift Name</label>
                                    <input
                                        type="text"
                                        value={formData.shiftName}
                                        onChange={e => setFormData({ ...formData, shiftName: e.target.value })}
                                        placeholder="e.g., Morning Shift"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Day of Week</label>
                                    <select
                                        value={formData.dayOfWeek}
                                        onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                        required
                                    >
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Assign Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Schedule Modal */}
            {showEditModal && assigningEmployee && editingSchedule && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>Edit Schedule</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '16px', color: '#64748b' }}>
                                    Editing schedule for: <strong style={{ color: '#1e293b' }}>{assigningEmployee.name}</strong>
                                </p>
                                <div className="form-group">
                                    <label>Shift Name</label>
                                    <input
                                        type="text"
                                        value={formData.shiftName}
                                        onChange={e => setFormData({ ...formData, shiftName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Day of Week</label>
                                    <select
                                        value={formData.dayOfWeek}
                                        onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                        required
                                    >
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Update Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
