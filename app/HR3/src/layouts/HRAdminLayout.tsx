import { Outlet } from 'react-router-dom';
import HRAdminSidebar from '../components/sidebars/HRAdminSidebar';
import './DashboardLayout.css';

export default function HRAdminLayout() {
    return (
        <div className="dashboard-layout">
            <HRAdminSidebar />
            <div className="main-content">
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
