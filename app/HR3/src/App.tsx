import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import HRAdminLayout from './layouts/HRAdminLayout';
import DeanLayout from './layouts/DeanLayout';
import LecturerLayout from './layouts/LecturerLayout';
import AdminStaffLayout from './layouts/AdminStaffLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import ShiftSchedule from './pages/ShiftSchedule';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import SystemSettings from './pages/SystemSettings';
import HRAdminDashboard from './pages/hradmin/HRAdminDashboard';
import DeanDashboard from './pages/dean/DeanDashboard';
import FacultySchedules from './pages/dean/FacultySchedules';
import DeanLeaveRequests from './pages/dean/DeanLeaveRequests';
import AttendanceOverview from './pages/dean/AttendanceOverview';
import DepartmentReports from './pages/dean/DepartmentReports';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import MyAttendance from './pages/lecturer/MyAttendance';
import MySchedule from './pages/lecturer/MySchedule';
import LecturerLeaveRequests from './pages/lecturer/LecturerLeaveRequests';
import Payslip from './pages/lecturer/Payslip';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/HR3">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Super Admin Dashboard Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="schedule" element={<ShiftSchedule />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>
          </Route>

          {/* HR Admin Dashboard Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['hradmin']} />}>
            <Route path="/hr-admin" element={<HRAdminLayout />}>
              <Route index element={<HRAdminDashboard />} />
              <Route path="schedule" element={<ShiftSchedule />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Dean Dashboard Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['dean']} />}>
            <Route path="/dean" element={<DeanLayout />}>
              <Route index element={<DeanDashboard />} />
              <Route path="schedules" element={<FacultySchedules />} />
              <Route path="leave" element={<DeanLeaveRequests />} />
              <Route path="attendance" element={<AttendanceOverview />} />
              <Route path="reports" element={<DepartmentReports />} />
            </Route>
          </Route>

          {/* Lecturer Dashboard Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['lecturer']} />}>
            <Route path="/lecturer" element={<LecturerLayout />}>
              <Route index element={<LecturerDashboard />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="schedule" element={<MySchedule />} />
              <Route path="leave" element={<LecturerLeaveRequests />} />
              <Route path="payslip" element={<Payslip />} />
            </Route>
          </Route>

          {/* Admin Staff Dashboard Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['adminstaff']} />}>
            <Route path="/admin-staff" element={<AdminStaffLayout />}>
              <Route index element={<LecturerDashboard />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="schedule" element={<MySchedule />} />
              <Route path="leave" element={<LecturerLeaveRequests />} />
              <Route path="payslip" element={<Payslip />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
