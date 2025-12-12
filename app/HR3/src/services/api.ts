// API Service Layer - Connects frontend to MongoDB backend
const API_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page for API requests
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (err) {
        if (err instanceof Error) {
            // Network errors (no internet, blocked by browser, etc.)
            if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
                throw new Error('Unable to connect to server. Please check your connection and try again.');
            }
        }
        throw err;
    }
}

// ==================== AUTH API ====================
export const authAPI = {
    login: (email: string, password: string) =>
        fetchAPI<{ _id: string; name: string; email: string; role: string; department: string; token: string }>(
            '/auth/login',
            { method: 'POST', body: JSON.stringify({ email, password }) }
        ),

    register: (data: { name: string; email: string; password: string; role: string; department?: string }) =>
        fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    getMe: () => fetchAPI<{ _id: string; name: string; email: string; role: string; department: string }>('/auth/me')
};

// ==================== USERS API ====================
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'hradmin' | 'dean' | 'lecturer' | 'adminstaff';
    department: string;
    createdAt: string;
}

export const usersAPI = {
    getAll: () => fetchAPI<User[]>('/users'),
    getById: (id: string) => fetchAPI<User>(`/users/${id}`),
    create: (data: { name: string; email: string; password: string; role: string; department?: string }) =>
        fetchAPI<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<User & { password?: string }>) =>
        fetchAPI<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ message: string }>(`/users/${id}`, { method: 'DELETE' })
};

// ==================== DEPARTMENTS API ====================
export interface Department {
    _id: string;
    name: string;
    code: string;
    description: string;
    headId: { _id: string; name: string; email: string } | null;
    status: 'active' | 'inactive';
    createdAt: string;
}

export const departmentsAPI = {
    getAll: () => fetchAPI<Department[]>('/departments'),
    getById: (id: string) => fetchAPI<Department>(`/departments/${id}`),
    create: (data: { name: string; code: string; description?: string; headId?: string; status?: string }) =>
        fetchAPI<Department>('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Department>) =>
        fetchAPI<Department>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ message: string }>(`/departments/${id}`, { method: 'DELETE' })
};


// ==================== ATTENDANCE API ====================
export interface Attendance {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: string;
        department: string;
    };
    date: string;
    timeIn: string | null;
    timeOut: string | null;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
    hoursWorked: number;
    overtime: number;
    notes: string;
    createdAt: string;
}

export const attendanceAPI = {
    getAll: (params?: { date?: string; userId?: string; status?: string; startDate?: string; endDate?: string }) => {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return fetchAPI<Attendance[]>(`/attendance${query}`);
    },
    getMyAttendance: () => fetchAPI<Attendance[]>('/attendance/me'),
    clockIn: () => fetchAPI<Attendance>('/attendance/clock-in', { method: 'POST' }),
    clockOut: () => fetchAPI<Attendance>('/attendance/clock-out', { method: 'POST' }),
    create: (data: { userId: string; date: string; timeIn?: string; timeOut?: string; status?: string; notes?: string }) =>
        fetchAPI<Attendance>('/attendance', { method: 'POST', body: JSON.stringify(data) })
};

// ==================== LEAVE API ====================
export interface Leave {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: string;
        department: string;
    };
    type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency' | 'other';
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy: { _id: string; name: string } | null;
    approvedAt: string | null;
    remarks: string;
    createdAt: string;
}

export const leaveAPI = {
    getAll: (params?: { status?: string; userId?: string; type?: string }) => {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return fetchAPI<Leave[]>(`/leave${query}`);
    },
    getMyLeaves: () => fetchAPI<Leave[]>('/leave/me'),
    create: (data: { type: string; startDate: string; endDate: string; reason: string }) =>
        fetchAPI<Leave>('/leave', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, data: { status: 'approved' | 'rejected'; remarks?: string }) =>
        fetchAPI<Leave>(`/leave/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    cancel: (id: string) => fetchAPI<{ message: string }>(`/leave/${id}`, { method: 'DELETE' })
};

// ==================== PAYROLL API ====================
export interface Payroll {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: string;
        department: string;
    };
    period: string;
    basicSalary: number;
    overtimePay: number;
    allowances: number;
    grossPay: number;
    deductions: {
        sss: number;
        philhealth: number;
        pagibig: number;
        tax: number;
        tardiness: number;
        other: number;
    };
    totalDeductions: number;
    netPay: number;
    status: 'pending' | 'processed' | 'paid';
    paidAt: string | null;
    createdAt: string;
}

export const payrollAPI = {
    getAll: (params?: { period?: string; status?: string; userId?: string }) => {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return fetchAPI<Payroll[]>(`/payroll${query}`);
    },
    getMyPayslips: () => fetchAPI<Payroll[]>('/payroll/me'),
    getById: (id: string) => fetchAPI<Payroll>(`/payroll/${id}`),
    create: (data: {
        userId: string;
        period: string;
        basicSalary: number;
        overtimePay?: number;
        allowances?: number;
        deductions?: Partial<Payroll['deductions']>;
    }) => fetchAPI<Payroll>('/payroll', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Payroll>) =>
        fetchAPI<Payroll>(`/payroll/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ message: string }>(`/payroll/${id}`, { method: 'DELETE' }),
    generate: (data: { period: string; basicSalary?: number }) =>
        fetchAPI<{ message: string; payrolls: Payroll[] }>('/payroll/generate', { method: 'POST', body: JSON.stringify(data) })
};

// ==================== SCHEDULES API ====================
export interface Schedule {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: string;
        department: string;
    };
    shiftName: string;
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdAt: string;
}

export const schedulesAPI = {
    getAll: (params?: { userId?: string }) => {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return fetchAPI<Schedule[]>(`/schedules${query}`);
    },
    getMySchedule: () => fetchAPI<Schedule[]>('/schedules/me'),
    create: (data: { userId: string; shiftName: string; dayOfWeek: string; startTime: string; endTime: string }) =>
        fetchAPI<Schedule>('/schedules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Schedule>) =>
        fetchAPI<Schedule>(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ message: string }>(`/schedules/${id}`, { method: 'DELETE' }),
    bulkCreate: (data: { userId: string; schedules: Array<{ shiftName: string; dayOfWeek: string; startTime: string; endTime: string }> }) =>
        fetchAPI<Schedule[]>('/schedules/bulk', { method: 'POST', body: JSON.stringify(data) })
};

// ==================== DASHBOARD API ====================
export interface DashboardStats {
    totalUsers: number;
    totalDepartments: number;
    presentToday: number;
    pendingLeaves: number;
    totalPayroll: number;
    usersByRole: Array<{ _id: string; count: number }>;
    recentUsers: User[];
    systemUptime: string;
    databaseStatus: string;
}

export interface AttendanceSummary {
    _id: string;
    count: number;
}

export interface LeaveSummary {
    summary: Array<{ _id: string; count: number }>;
    pendingDetails: Leave[];
}

export const dashboardAPI = {
    getStats: () => fetchAPI<DashboardStats>('/dashboard/stats'),
    getAttendanceSummary: () => fetchAPI<AttendanceSummary[]>('/dashboard/attendance-summary'),
    getLeaveSummary: () => fetchAPI<LeaveSummary>('/dashboard/leave-summary')
};

// ==================== SETTINGS API ====================
export interface Setting {
    _id: string;
    key: string;
    value: unknown;
    category: 'general' | 'payroll' | 'attendance' | 'leave' | 'notifications' | 'security';
    description: string;
    updatedAt: string;
}

export const settingsAPI = {
    getAll: (category?: string) => {
        const query = category ? `?category=${category}` : '';
        return fetchAPI<{ settings: Setting[]; settingsObj: Record<string, Record<string, unknown>> }>(`/settings${query}`);
    },
    getByKey: (key: string) => fetchAPI<Setting>(`/settings/${key}`),
    save: (data: { key: string; value: unknown; category?: string; description?: string }) =>
        fetchAPI<Setting>('/settings', { method: 'POST', body: JSON.stringify(data) }),
    bulkUpdate: (settings: Array<{ key: string; value: unknown; category?: string; description?: string }>) =>
        fetchAPI<Setting[]>('/settings/bulk', { method: 'PUT', body: JSON.stringify({ settings }) }),
    delete: (key: string) => fetchAPI<{ message: string }>(`/settings/${key}`, { method: 'DELETE' })
};
