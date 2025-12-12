import { LayoutDashboard, CalendarClock, Clock, CalendarX, Wallet, FileBarChart, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './HRAdminSidebar.css';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/hr-admin' },
    { icon: CalendarClock, label: 'Shift & Schedule', path: '/hr-admin/schedule' },
    { icon: Clock, label: 'Attendance', path: '/hr-admin/attendance' },
    { icon: CalendarX, label: 'Leave Management', path: '/hr-admin/leave' },
    { icon: Wallet, label: 'Payroll', path: '/hr-admin/payroll' },
    { icon: FileBarChart, label: 'Reports', path: '/hr-admin/reports' },
];

export default function HRAdminSidebar() {
    return (
        <aside className="sidebar hr-admin-sidebar">
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
                        end={item.path === '/hr-admin'}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-snippet">
                    <div className="user-avatar-placeholder hr">H</div>
                    <div className="user-details">
                        <span className="user-name-snippet">HR Admin</span>
                        <span className="user-role-snippet">HR Administrator</span>
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
