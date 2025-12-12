import { Outlet } from 'react-router-dom';
import LecturerSidebar from '../components/sidebars/LecturerSidebar';
import './DashboardLayout.css';

export default function LecturerLayout() {
    return (
        <div className="dashboard-layout">
            <LecturerSidebar />
            <div className="main-content">
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
