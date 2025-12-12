import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import type { Employee } from '../types';
import './Employees.css';

const DUMMY_EMPLOYEES: Employee[] = [
    { id: 'EMP001', firstName: 'John', lastName: 'Doe', email: 'john.doe@hr3.com', role: 'Lecturer', department: 'Computer Science', status: 'Active', joinDate: '2023-01-15' },
    { id: 'EMP002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@hr3.com', role: 'Dean', department: 'Engineering', status: 'Active', joinDate: '2022-03-10' },
    { id: 'EMP003', firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@hr3.com', role: 'Lecturer', department: 'Mathematics', status: 'On Leave', joinDate: '2023-06-01' },
    { id: 'EMP004', firstName: 'Mary', lastName: 'Johnson', email: 'mary.johnson@hr3.com', role: 'Admin Staff', department: 'Human Resources', status: 'Active', joinDate: '2021-11-20' },
    { id: 'EMP005', firstName: 'Michael', lastName: 'Wilson', email: 'michael.wilson@hr3.com', role: 'Lecturer', department: 'Physics', status: 'Terminated', joinDate: '2020-08-05' },
];

export default function Employees() {
    const [employees] = useState<Employee[]>(DUMMY_EMPLOYEES);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: Employee['status']) => {
        switch (status) {
            case 'Active': return 'status-active';
            case 'On Leave': return 'status-leave';
            case 'Terminated': return 'status-terminated';
            default: return '';
        }
    };

    return (
        <div className="employees-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">All Employees</h1>
                    <p className="page-subtitle">Manage your employee directory</p>
                </div>
                <button className="add-btn">
                    <Plus size={20} />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <Search size={20} className="control-search-icon" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="control-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="filter-btn">
                    <Filter size={20} />
                    <span>Filter</span>
                </button>
            </div>

            <div className="table-container">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.id}>
                                <td>
                                    <div className="employee-cell">
                                        <div className="employee-avatar">
                                            {employee.firstName[0]}{employee.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="employee-name">{employee.firstName} {employee.lastName}</div>
                                            <div className="employee-email">{employee.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{employee.role}</td>
                                <td>{employee.department}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(employee.status)}`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td>{employee.joinDate}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button className="icon-btn delete" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
