import { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { schedulesAPI, usersAPI, type Schedule, type User } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './FacultySchedules.css';

export default function FacultySchedules() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            let schedulesData: Schedule[] = [];
            let usersData: User[] = [];

            try {
                schedulesData = await schedulesAPI.getAll();
            } catch (err) {
                console.error('Failed to fetch schedules:', err);
                schedulesData = [];
            }

            try {
                usersData = await usersAPI.getAll();
            } catch (err) {
                console.error('Failed to fetch users:', err);
                usersData = [];
            }

            console.log('Dean department:', user?.department);
            console.log('All users:', usersData.map(u => ({ name: u.name, dept: u.department, role: u.role })));
            console.log('All schedules count:', schedulesData.length);

            // Get all faculty/staff users - if dean has department, filter by it, otherwise show all
            let deptUsers: User[] = [];
            if (user?.department) {
                // Try matching with case-insensitive comparison
                deptUsers = usersData.filter(u => {
                    const userDept = (u.department || '').toLowerCase().trim();
                    const deanDept = (user.department || '').toLowerCase().trim();
                    const isMatchingDept = userDept === deanDept || userDept.includes(deanDept) || deanDept.includes(userDept);
                    const isValidRole = ['lecturer', 'adminstaff'].includes(u.role || '');
                    return isMatchingDept && isValidRole;
                });

                // If no matches found with department filter, show all faculty
                if (deptUsers.length === 0) {
                    console.log('No faculty found for department, showing all faculty');
                    deptUsers = usersData.filter(u => ['lecturer', 'adminstaff'].includes(u.role || ''));
                }
            } else {
                deptUsers = usersData.filter(u => ['lecturer', 'adminstaff'].includes(u.role || ''));
            }

            console.log('Filtered faculty:', deptUsers.map(u => u.name));

            // Get schedules for these users
            const deptUserIds = deptUsers.map(u => u._id);
            const deptSchedules = schedulesData.filter(s => {
                const userId = typeof s.userId === 'object' ? s.userId?._id : s.userId;
                return userId && deptUserIds.includes(userId);
            });

            console.log('Filtered schedules:', deptSchedules.length);

            setSchedules(deptSchedules);
            setUsers(deptUsers);
        } catch (err) {
            console.error('FacultySchedules error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const getDayDisplay = (day: string) => {
        if (!day) return 'Unknown';
        return day.charAt(0).toUpperCase() + day.slice(1);
    };

    // Group schedules by user
    const groupedSchedules = users.map(u => {
        const userSchedules = schedules.filter(s => {
            const userId = typeof s.userId === 'object' ? s.userId?._id : s.userId;
            return userId === u._id;
        });
        return { user: u, schedules: userSchedules };
    });

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
                    <h1 className="page-title">Faculty Schedules</h1>
                    <p className="page-subtitle">View faculty work schedules - {user?.department || 'All Departments'}</p>
                </div>
                <button className="primary-btn" onClick={fetchData} style={{ background: '#64748b' }}>
                    <RefreshCw size={18} />
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Faculty</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#5d5fdb' }}>{users.length}</p>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>With Schedules</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>
                        {groupedSchedules.filter(g => g.schedules.length > 0).length}
                    </p>
                </div>
                <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Without Schedules</p>
                    <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#f97316' }}>
                        {groupedSchedules.filter(g => g.schedules.length === 0).length}
                    </p>
                </div>
            </div>

            {/* Faculty Schedule Cards */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {groupedSchedules.map(({ user: faculty, schedules: userSchedules }) => (
                    <div key={faculty._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{faculty.name}</h3>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    {faculty.role} • {faculty.department || 'No Department'} • {faculty.email}
                                </p>
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                background: userSchedules.length > 0 ? '#dcfce7' : '#fee2e2',
                                color: userSchedules.length > 0 ? '#16a34a' : '#dc2626'
                            }}>
                                {userSchedules.length > 0 ? `${userSchedules.length} shifts` : 'No schedule'}
                            </span>
                        </div>

                        {userSchedules.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {userSchedules.sort((a, b) => {
                                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                    return days.indexOf(a.dayOfWeek || '') - days.indexOf(b.dayOfWeek || '');
                                }).map(schedule => (
                                    <div key={schedule._id} style={{
                                        background: '#f8fafc',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#5d5fdb' }}>{getDayDisplay(schedule.dayOfWeek)}</span>
                                        <span style={{ color: '#64748b', marginLeft: '8px' }}>{schedule.startTime || '?'} - {schedule.endTime || '?'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>No schedule assigned</p>
                        )}
                    </div>
                ))}
            </div>

            {groupedSchedules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: 'white', borderRadius: '12px' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📅</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>No faculty members found</p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>Try refreshing or check your department assignment.</p>
                </div>
            )}
        </div>
    );
}
