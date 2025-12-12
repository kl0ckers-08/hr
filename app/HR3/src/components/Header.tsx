import { Bell, Search, User } from 'lucide-react';
import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-search">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Search..." className="search-input" />
            </div>

            <div className="header-actions">
                <button className="action-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>
                <div className="user-profile">
                    <div className="avatar-placeholder">
                        <User size={20} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">Super Admin</span>
                        <span className="user-role">Administrator</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
