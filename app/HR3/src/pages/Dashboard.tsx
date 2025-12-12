import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Activity, TrendingUp, Wallet, Settings, Bell, Loader2 } from 'lucide-react';
import { dashboardAPI, type DashboardStats } from '../services/api';
import './Dashboard.css';

const formatCurrency = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await dashboardAPI.getStats();
                setStats(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    const STATS = [
        {
            label: 'Total System Users',
            value: stats?.totalUsers?.toString() || '0',
            subtext: 'Employees, Admins & Deans',
            icon: Users,
            iconColor: '#5d5fdb',
            bg: 'white'
        },
        {
            label: 'Total Departments',
            value: stats?.totalDepartments?.toString() || '0',
            subtext: 'Academic & Admin Units',
            icon: Building2,
            iconColor: '#5d5fdb',
            bg: 'white'
        },
        {
            label: 'System Uptime',
            value: stats?.systemUptime || '99.9%',
            subtext: 'Last 30 days',
            icon: Activity,
            iconColor: '#5d5fdb',
            bg: 'white'
        }
    ];

    const SECOND_ROW_STATS = [
        {
            label: 'Active Users Today',
            value: stats?.presentToday?.toString() || '0',
            icon: TrendingUp,
            iconColor: '#5d5fdb',
            bg: 'white'
        },
        {
            label: 'Total Payroll (current)',
            value: formatCurrency(stats?.totalPayroll || 0),
            icon: Wallet,
            iconColor: '#5d5fdb',
            bg: 'white'
        }
    ];

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-section">
                <div>
                    <h1 className="page-title">Super Admin Dashboard</h1>
                    <p className="page-subtitle">Complete system overview and management</p>
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

            <div className="stats-grid-3">
                {STATS.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper">
                                <stat.icon size={20} color={stat.iconColor} />
                            </div>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className="stat-body">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-subtext">{stat.subtext}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="stats-grid-mixed">
                {SECOND_ROW_STATS.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper">
                                <stat.icon size={20} color={stat.iconColor} />
                            </div>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className="stat-body">
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}

                <div className="stat-card purple-card">
                    <div className="purple-card-content">
                        <Settings size={28} className="spin-slow" />
                        <span className="purple-value">{stats?.pendingLeaves || 0}</span>
                        <span className="purple-label">Pending Actions</span>
                    </div>
                </div>
            </div>

            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
                <button className="action-button" onClick={() => navigate('/dashboard/users')}>
                    <Users size={18} />
                    <span>Manage Users</span>
                </button>
                <button className="action-button" onClick={() => navigate('/dashboard/departments')}>
                    <Building2 size={18} />
                    <span>Manage Departments</span>
                </button>
                <button className="action-button" onClick={() => navigate('/dashboard/reports')}>
                    <Activity size={18} />
                    <span>View Analytics</span>
                </button>
                <button className="action-button" onClick={() => navigate('/dashboard/settings')}>
                    <Settings size={18} />
                    <span>System Settings</span>
                </button>
            </div>

            <div className="system-info-card">
                <h2 className="section-title">System Information</h2>
                <div className="info-list">
                    <div className="info-item">
                        <span>System Version</span>
                        <span className="info-value">HR3 v1.0.0</span>
                    </div>
                    <div className="info-item">
                        <span>Last Backup</span>
                        <span className="info-value">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                        <span>Database Status</span>
                        <span className="info-value status-healthy">● Healthy</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
