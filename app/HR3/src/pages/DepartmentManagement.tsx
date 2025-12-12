import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Users, X, Loader2 } from 'lucide-react';
import { departmentsAPI, usersAPI, type Department, type User } from '../services/api';
import './DepartmentManagement.css';

interface DeptFormData {
    name: string;
    code: string;
    description: string;
    headId: string;
    status: string;
}

const initialFormData: DeptFormData = { name: '', code: '', description: '', headId: '', status: 'active' };

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState<DeptFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptsData, usersData] = await Promise.all([
                departmentsAPI.getAll(),
                usersAPI.getAll().catch(() => [] as User[])
            ]);
            setDepartments(deptsData);
            setUsers(usersData);
        } catch (err) {
            console.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (dept?: Department) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({ name: dept.name, code: dept.code, description: dept.description || '', headId: dept.headId?._id || '', status: dept.status });
        } else {
            setEditingDept(null);
            setFormData(initialFormData);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = { name: formData.name, code: formData.code.toUpperCase(), description: formData.description, headId: formData.headId || undefined, status: formData.status };
            if (editingDept) {
                await departmentsAPI.update(editingDept._id, data as any);
            } else {
                await departmentsAPI.create(data);
            }
            setShowModal(false);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save department');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (dept: Department) => {
        if (!confirm(`Are you sure you want to delete ${dept.name}?`)) return;
        try {
            await departmentsAPI.delete(dept._id);
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete department');
        }
    };

    const getEmployeeCount = (deptName: string) => users.filter(u => u.department === deptName).length;

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
                    <h1 className="page-title">Department Management</h1>
                    <p className="page-subtitle">Manage organizational departments and units</p>
                </div>
                <button className="primary-btn" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    <span>Add Department</span>
                </button>
            </div>

            <div className="departments-grid">
                {departments.map((dept) => (
                    <div key={dept._id} className="department-card">
                        <div className="card-header">
                            <div className="dept-icon"><Building2 size={20} /></div>
                            <div className="card-actions">
                                <button className="action-icon edit" onClick={() => handleOpenModal(dept)}><Pencil size={16} /></button>
                                <button className="action-icon delete" onClick={() => handleDelete(dept)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <h3 className="dept-name">{dept.name}</h3>
                        <p className="dept-code">Code: {dept.code}</p>
                        <div className="dept-info">
                            <div className="info-row"><Users size={16} /><span>{getEmployeeCount(dept.name)} Employees</span></div>
                            <p className="dept-head">Head: {dept.headId?.name || 'Not assigned'}</p>
                        </div>
                        <p className="dept-description">{dept.description || 'No description'}</p>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingDept ? 'Edit Department' : 'Add New Department'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Department Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Department Code</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required placeholder="e.g., CS, ENG, BUS" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                            </div>
                            <div className="form-group">
                                <label>Department Head</label>
                                <select value={formData.headId} onChange={e => setFormData({ ...formData, headId: e.target.value })}>
                                    <option value="">Select Head</option>
                                    {users.filter(u => ['dean', 'hradmin', 'superadmin'].includes(u.role)).map(user => (
                                        <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingDept ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
