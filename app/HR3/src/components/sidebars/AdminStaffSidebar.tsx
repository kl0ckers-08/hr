import { useState, useEffect } from 'react';
import { LayoutDashboard, Clock, CalendarDays, CalendarX, FileText, LogOut, X, Menu } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-staff' },
    { icon: Clock, label: 'My Attendance', path: '/admin-staff/attendance' },
    { icon: CalendarDays, label: 'My Schedule', path: '/admin-staff/schedule' },
    { icon: CalendarX, label: 'Leave Requests', path: '/admin-staff/leave' },
    { icon: FileText, label: 'Payslip', path: '/admin-staff/payslip' },
];

export default function AdminStaffSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileOpen(false); };
        if (isMobileOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = ''; }
        return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <>
            <button className="mobile-menu-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle menu"><Menu size={24} /></button>
            {isMobileOpen && <div className="mobile-overlay active" onClick={() => setIsMobileOpen(false)} />}
            <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <button className="sidebar-mobile-close" onClick={() => setIsMobileOpen(false)} aria-label="Close menu"><X size={20} /></button>
                <div className="sidebar-header">
                    <div className="sidebar-logo-icon"><LayoutDashboard size={20} /></div>
                    <div className="sidebar-logo">HR3</div>
                </div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.path === '/admin-staff'} onClick={() => setIsMobileOpen(false)}>
                            <item.icon size={20} /><span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar-placeholder adminstaff">{user?.name?.charAt(0) || 'M'}</div>
                        <div className="user-details">
                            <span className="user-name-snippet">{user?.name || 'Mary Johnson'}</span>
                            <span className="user-role-snippet">Admin Staff</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={() => setShowLogoutModal(true)}><LogOut size={18} /><span>Logout</span></button>
                </div>
                {showLogoutModal && (
                    <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
                        <div className="logout-modal" onClick={e => e.stopPropagation()}>
                            <button className="logout-modal-close" onClick={() => setShowLogoutModal(false)}><X size={20} /></button>
                            <div className="logout-modal-icon"><LogOut size={32} /></div>
                            <h3>Confirm Logout</h3>
                            <p>Are you sure you want to logout from the system?</p>
                            <div className="logout-modal-actions">
                                <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                                <button className="btn-confirm" onClick={handleLogout}>Yes, Logout</button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
