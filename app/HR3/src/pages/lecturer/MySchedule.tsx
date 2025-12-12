import { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { schedulesAPI, type Schedule } from '../../services/api';
import './MySchedule.css';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function MySchedule() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await schedulesAPI.getMySchedule();
                // Sort by day of week
                const sorted = data.sort((a, b) => DAYS_ORDER.indexOf(a.dayOfWeek) - DAYS_ORDER.indexOf(b.dayOfWeek));
                setSchedules(sorted);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDayDisplay = (day: string) => {
        return day.charAt(0).toUpperCase() + day.slice(1);
    };

    const getTodaySchedule = () => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        return schedules.find(s => s.dayOfWeek === today);
    };

    const todaySchedule = getTodaySchedule();

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
                    <h1 className="page-title">My Schedule</h1>
                    <p className="page-subtitle">View your work schedule and shifts</p>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Today's Schedule Card */}
            <div style={{ 
                background: 'linear-gradient(135deg, #5d5fdb 0%, #7c3aed 100%)', 
                borderRadius: '16px', 
                padding: '24px', 
                marginBottom: '24px',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Calendar size={24} />
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Today's Schedule</h2>
                </div>
                <p style={{ margin: '0 0 8px', opacity: 0.9 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {todaySchedule ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} />
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {todaySchedule.startTime} - {todaySchedule.endTime}
                            </span>
                        </div>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                            {todaySchedule.shiftName}
                        </span>
                    </div>
                ) : (
                    <p style={{ margin: '16px 0 0', fontSize: '1.2rem', fontWeight: 600 }}>No schedule today</p>
                )}
            </div>

            {/* Weekly Schedule */}
            <h2 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '16px' }}>Weekly Schedule</h2>
            
            {schedules.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {schedules.map((schedule) => {
                        const isToday = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === schedule.dayOfWeek;
                        return (
                            <div 
                                key={schedule._id} 
                                style={{ 
                                    background: 'white', 
                                    borderRadius: '12px', 
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: isToday ? '2px solid #5d5fdb' : '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        background: isToday ? '#5d5fdb' : '#f1f5f9', 
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isToday ? 'white' : '#64748b',
                                        fontWeight: 700,
                                        fontSize: '0.85rem'
                                    }}>
                                        {schedule.dayOfWeek.slice(0, 3).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{getDayDisplay(schedule.dayOfWeek)}</p>
                                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{schedule.shiftName}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5d5fdb', fontWeight: 600 }}>
                                    <Clock size={18} />
                                    <span>{schedule.startTime} - {schedule.endTime}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '40px', 
                    textAlign: 'center',
                    color: '#64748b'
                }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ margin: 0 }}>No schedule assigned yet.</p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>Contact your HR administrator to set up your work schedule.</p>
                </div>
            )}

            {/* Schedule Summary */}
            {schedules.length > 0 && (
                <div style={{ 
                    background: '#f8fafc', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    marginTop: '24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Working Days</p>
                        <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#5d5fdb' }}>{schedules.length}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Hours/Day</p>
                        <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>
                            {schedules.length > 0 ? (() => {
                                const s = schedules[0];
                                const start = parseInt(s.startTime.split(':')[0]);
                                const end = parseInt(s.endTime.split(':')[0]);
                                return end - start;
                            })() : 0}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Hours/Week</p>
                        <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>
                            {schedules.reduce((sum, s) => {
                                const start = parseInt(s.startTime.split(':')[0]);
                                const end = parseInt(s.endTime.split(':')[0]);
                                return sum + (end - start);
                            }, 0)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
