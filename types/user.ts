export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'employee' | 'hr' | 'admin';
  department?: string;
  position?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  fullName: string;
  confirmPassword?: string;
}