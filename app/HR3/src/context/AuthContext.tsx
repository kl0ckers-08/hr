import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'hradmin' | 'dean' | 'lecturer' | 'adminstaff';
    department?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use /HR3/api path so requests work through Next.js proxy (localhost:3000/HR3)
// Next.js will rewrite /HR3/api/* to the HR3 backend at localhost:5000
const API_URL = '/HR3/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated on mount
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        setToken(storedToken);
                    } else {
                        // Token invalid, clear it
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    department: data.department
                });
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
