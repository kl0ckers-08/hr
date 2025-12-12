import { LayoutDashboard, Users, Building2, CalendarClock, Clock, CalendarX, Wallet, FileBarChart, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'User Management', path: '/dashboard/users' },
    { icon: Building2, label: 'Department Management', path: '/dashboard/departments' },
    { icon: CalendarClock, label: 'Shift & Schedule', path: '/dashboard/schedule' },
    { icon: Clock, label: 'Attendance', path: '/dashboard/attendance' },
    { icon: CalendarX, label: 'Leave Management', path: '/dashboard/leave' },
    { icon: Wallet, label: 'Payroll', path: '/dashboard/payroll' },
    { icon: FileBarChart, label: 'Reports', path: '/dashboard/reports' },
    { icon: Settings, label: 'System Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo-icon">
                    <LayoutDashboard size={20} />
                </div>
                <div className="sidebar-logo">HR3</div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end={item.path === '/dashboard'}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-snippet">
                    <div className="user-avatar-placeholder">S</div>
                    <div className="user-details">
                        <span className="user-name-snippet">Super Admin</span>
                        <span className="user-role-snippet">Super Admin</span>
                    </div>
                </div>
                <button className="logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
