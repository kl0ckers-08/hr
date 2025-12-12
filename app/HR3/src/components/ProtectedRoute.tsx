import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

// Map roles to their dashboard paths
const roleDashboardMap: Record<string, string> = {
    superadmin: '/dashboard',
    hradmin: '/hr-admin',
    dean: '/dean',
    lecturer: '/lecturer',
    adminstaff: '/admin-staff'
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to user's correct dashboard
        const correctDashboard = roleDashboardMap[user.role] || '/login';
        return <Navigate to={correctDashboard} replace />;
    }

    // User is authenticated and authorized
    return <Outlet />;
}
