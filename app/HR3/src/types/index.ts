export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    status: 'Active' | 'On Leave' | 'Terminated';
    joinDate: string;
    avatar?: string;
}

export type UserRole = 'Super Admin' | 'HR Admin' | 'Dean' | 'Lecturer' | 'Admin Staff';
