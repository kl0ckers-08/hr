import { Outlet } from 'react-router-dom';
import DeanSidebar from '../components/sidebars/DeanSidebar';
import './DashboardLayout.css';

export default function DeanLayout() {
    return (
        <div className="dashboard-layout">
            <DeanSidebar />
            <div className="main-content">
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
