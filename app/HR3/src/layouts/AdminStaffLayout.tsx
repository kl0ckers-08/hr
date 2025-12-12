import { Outlet } from 'react-router-dom';
import AdminStaffSidebar from '../components/sidebars/AdminStaffSidebar';
import './DashboardLayout.css';

export default function AdminStaffLayout() {
    return (
        <div className="dashboard-layout">
            <AdminStaffSidebar />
            <div className="main-content">
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
