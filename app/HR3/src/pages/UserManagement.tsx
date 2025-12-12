import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { usersAPI, departmentsAPI, type User, type Department } from '../services/api';
import './UserManagement.css';

interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
}

const initialFormData: UserFormData = { name: '', email: '', password: '', role: 'lecturer', department: '' };

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, deptsData] = await Promise.all([
                usersAPI.getAll(),
                departmentsAPI.getAll()
            ]);
            setUsers(usersData);
            setDepartments(deptsData);
        } catch (err) {
            console.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, password: '', role: user.role, department: user.department });
        } else {
            setEditingUser(null);
            setFormData(initialFormData);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (editingUser) {
                const updateData: Partial<User & { password?: string }> = { name: formData.name, email: formData.email, role: formData.role as User['role'], department: formData.department };
                if (formData.password) updateData.password = formData.password;
                await usersAPI.update(editingUser._id, updateData);
            } else {
                await usersAPI.create(formData);
            }
            setShowModal(false);
            setFormData(initialFormData);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
        try {
            await usersAPI.delete(user._id);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user');
        }
    };

    const getRoleDisplay = (role: string) => {
        const roleMap: Record<string, string> = { superadmin: 'Super Admin', hradmin: 'HR Admin', dean: 'Dean', lecturer: 'Lecturer', adminstaff: 'Admin Staff' };
        return roleMap[role] || role;
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage system users and permissions</p>
                </div>
                <button className="primary-btn" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    <span>Add User</span>
                </button>
            </div>

            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Search users by name, email, or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td className="name-cell">{user.name}</td>
                                <td className="email-cell">{user.email}</td>
                                <td className="role-cell">{getRoleDisplay(user.role)}</td>
                                <td>{user.department || '-'}</td>
                                <td><span className="status-badge active">Active</span></td>
                                <td className="actions-cell">
                                    <button className="action-icon edit" onClick={() => handleOpenModal(user)}><Pencil size={16} /></button>
                                    <button className="action-icon delete" onClick={() => handleDelete(user)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} minLength={6} />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="superadmin">Super Admin</option>
                                    <option value="hradmin">HR Admin</option>
                                    <option value="dean">Dean</option>
                                    <option value="lecturer">Lecturer</option>
                                    <option value="adminstaff">Admin Staff</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept._id} value={dept.name}>{dept.name}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
