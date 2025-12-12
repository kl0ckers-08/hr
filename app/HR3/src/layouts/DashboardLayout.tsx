import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/sidebars/SuperAdminSidebar';
import './DashboardLayout.css';

export default function DashboardLayout() {
    return (
        <div className="dashboard-layout">
            <SuperAdminSidebar />
            <div className="main-content">
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
