import { useState, useEffect } from 'react';
import { Calculator, Eye, Calendar, Loader2, X, Users, DollarSign } from 'lucide-react';
import { payrollAPI, usersAPI, type Payroll as PayrollType, type User } from '../services/api';
import './Payroll.css';

const formatCurrency = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Payroll() {
    const [payrollPeriod, setPayrollPeriod] = useState('');
    const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showViewModal, setShowViewModal] = useState<PayrollType | null>(null);
    const [showComputeModal, setShowComputeModal] = useState(false);
    const [employees, setEmployees] = useState<User[]>([]);

    // Compute form state
    const [computeForm, setComputeForm] = useState({
        selectedEmployees: 'all' as 'all' | 'selected',
        employeeIds: [] as string[],
        periodType: 'first-half' as 'first-half' | 'second-half' | 'custom',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),
        customPeriod: '',
        basicSalary: 25000,
        includeOvertime: true,
        includeAllowances: true
    });
    const [computing, setComputing] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (payrollPeriod) params.period = payrollPeriod;
            const [payrollData, usersData] = await Promise.all([
                payrollAPI.getAll(params),
                usersAPI.getAll().catch(() => [] as User[])
            ]);
            setPayrolls(payrollData);
            setEmployees(usersData.filter(u => ['lecturer', 'adminstaff', 'dean'].includes(u.role)));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [payrollPeriod]);

    const totalPayroll = payrolls.reduce((sum, record) => sum + record.netPay, 0);
    const periods = [...new Set(payrolls.map(p => p.period))];

    const getPeriodString = () => {
        if (computeForm.periodType === 'custom') return computeForm.customPeriod;
        const dateRange = computeForm.periodType === 'first-half' ? '1-15' : '16-30';
        return `${computeForm.month} ${dateRange}, ${computeForm.year}`;
    };

    const handleComputePayroll = async () => {
        const period = getPeriodString();
        if (!period) return;

        try {
            setComputing(true);
            await payrollAPI.generate({
                period,
                basicSalary: computeForm.basicSalary
            });
            await fetchData();
            setShowComputeModal(false);
            setComputeForm({
                selectedEmployees: 'all',
                employeeIds: [],
                periodType: 'first-half',
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear().toString(),
                customPeriod: '',
                basicSalary: 25000,
                includeOvertime: true,
                includeAllowances: true
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to compute payroll');
        } finally {
            setComputing(false);
        }
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

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
                    <h1 className="page-title">Payroll Management</h1>
                    <p className="page-subtitle">Compute and manage employee salaries</p>
                </div>
                <button className="primary-btn" onClick={() => setShowComputeModal(true)}>
                    <Calculator size={18} />
                    <span>Compute Payroll</span>
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div className="payroll-summary">
                <div className="period-selector">
                    <div className="period-label">
                        <Calendar size={16} />
                        <span>Payroll Period</span>
                    </div>
                    <select className="period-select" value={payrollPeriod} onChange={e => setPayrollPeriod(e.target.value)}>
                        <option value="">All Periods</option>
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="total-payroll-card">
                    <span className="total-label">Total Payroll</span>
                    <span className="total-value">{formatCurrency(totalPayroll)}</span>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table payroll-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Basic Salary</th>
                            <th>Gross Pay</th>
                            <th>Deductions</th>
                            <th>Net Pay</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrolls.map((record) => (
                            <tr key={record._id}>
                                <td>
                                    <div className="employee-cell">
                                        <span className="emp-name">{record.userId?.name || 'Unknown'}</span>
                                        <span className="emp-role">{record.userId?.role || ''}</span>
                                    </div>
                                </td>
                                <td>{record.userId?.department || '-'}</td>
                                <td className="salary-cell">{formatCurrency(record.basicSalary)}</td>
                                <td className="salary-cell">{formatCurrency(record.grossPay)}</td>
                                <td className="deduction-cell">{formatCurrency(record.totalDeductions)}</td>
                                <td className="net-pay-cell">{formatCurrency(record.netPay)}</td>
                                <td>
                                    <button className="view-btn" onClick={() => setShowViewModal(record)}>
                                        <Eye size={14} />
                                        <span>View</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Payslip Modal */}
            {showViewModal && (
                <div className="modal-overlay" onClick={() => setShowViewModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Payslip Details</h2>
                            <button className="close-btn" onClick={() => setShowViewModal(null)}>×</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <p><strong>Employee:</strong> {showViewModal.userId?.name}</p>
                            <p><strong>Period:</strong> {showViewModal.period}</p>
                            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                            <p><strong>Basic Salary:</strong> {formatCurrency(showViewModal.basicSalary)}</p>
                            <p><strong>Overtime Pay:</strong> {formatCurrency(showViewModal.overtimePay)}</p>
                            <p><strong>Allowances:</strong> {formatCurrency(showViewModal.allowances)}</p>
                            <p style={{ color: '#22c55e' }}><strong>Gross Pay:</strong> {formatCurrency(showViewModal.grossPay)}</p>
                            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                            <p><strong>SSS:</strong> {formatCurrency(showViewModal.deductions.sss)}</p>
                            <p><strong>PhilHealth:</strong> {formatCurrency(showViewModal.deductions.philhealth)}</p>
                            <p><strong>Pag-IBIG:</strong> {formatCurrency(showViewModal.deductions.pagibig)}</p>
                            <p><strong>Tax:</strong> {formatCurrency(showViewModal.deductions.tax)}</p>
                            <p><strong>Tardiness (Late + Undertime):</strong> {formatCurrency(showViewModal.deductions.tardiness)}</p>
                            <p style={{ color: '#ef4444' }}><strong>Total Deductions:</strong> {formatCurrency(showViewModal.totalDeductions)}</p>
                            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                            <p style={{ fontSize: '1.2rem', color: '#5d5fdb' }}><strong>Net Pay:</strong> {formatCurrency(showViewModal.netPay)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Compute Payroll Modal */}
            {showComputeModal && (
                <div className="modal-overlay" onClick={() => setShowComputeModal(false)}>
                    <div className="modal-content compute-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <Calculator size={24} className="modal-icon" />
                                <div>
                                    <h2>Compute Payroll</h2>
                                    <p className="modal-subtitle">Generate payroll for employees</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowComputeModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="compute-form">
                            {/* Payroll Period Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <Calendar size={18} />
                                    <h3>Payroll Period</h3>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Period Type</label>
                                        <select
                                            value={computeForm.periodType}
                                            onChange={e => setComputeForm({ ...computeForm, periodType: e.target.value as any })}
                                        >
                                            <option value="first-half">1st Half (1-15)</option>
                                            <option value="second-half">2nd Half (16-30)</option>
                                            <option value="custom">Custom Period</option>
                                        </select>
                                    </div>
                                    {computeForm.periodType !== 'custom' ? (
                                        <>
                                            <div className="form-group">
                                                <label>Month</label>
                                                <select
                                                    value={computeForm.month}
                                                    onChange={e => setComputeForm({ ...computeForm, month: e.target.value })}
                                                >
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Year</label>
                                                <select
                                                    value={computeForm.year}
                                                    onChange={e => setComputeForm({ ...computeForm, year: e.target.value })}
                                                >
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                    <option value="2026">2026</option>
                                                </select>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="form-group full-width">
                                            <label>Custom Period</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., December 1-15, 2025"
                                                value={computeForm.customPeriod}
                                                onChange={e => setComputeForm({ ...computeForm, customPeriod: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Employee Selection Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <Users size={18} />
                                    <h3>Employee Selection</h3>
                                </div>
                                <div className="radio-group">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="employeeSelection"
                                            checked={computeForm.selectedEmployees === 'all'}
                                            onChange={() => setComputeForm({ ...computeForm, selectedEmployees: 'all' })}
                                        />
                                        <span className="radio-label">
                                            <strong>All Employees</strong>
                                            <span className="radio-desc">{employees.length} employees will be included</span>
                                        </span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="employeeSelection"
                                            checked={computeForm.selectedEmployees === 'selected'}
                                            onChange={() => setComputeForm({ ...computeForm, selectedEmployees: 'selected' })}
                                        />
                                        <span className="radio-label">
                                            <strong>Select Employees</strong>
                                            <span className="radio-desc">Choose specific employees</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Salary Configuration Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <DollarSign size={18} />
                                    <h3>Salary Configuration</h3>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Default Basic Salary</label>
                                        <div className="input-with-prefix">
                                            <span className="input-prefix">₱</span>
                                            <input
                                                type="number"
                                                value={computeForm.basicSalary}
                                                onChange={e => setComputeForm({ ...computeForm, basicSalary: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            checked={computeForm.includeOvertime}
                                            onChange={e => setComputeForm({ ...computeForm, includeOvertime: e.target.checked })}
                                        />
                                        <span>Include Overtime Pay</span>
                                    </label>
                                    <label className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            checked={computeForm.includeAllowances}
                                            onChange={e => setComputeForm({ ...computeForm, includeAllowances: e.target.checked })}
                                        />
                                        <span>Include Allowances</span>
                                    </label>
                                </div>
                            </div>

                            {/* Summary Preview */}
                            <div className="compute-summary">
                                <h4>Summary</h4>
                                <div className="summary-row">
                                    <span>Period:</span>
                                    <span>{getPeriodString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Employees:</span>
                                    <span>{computeForm.selectedEmployees === 'all' ? `All (${employees.length})` : `${computeForm.employeeIds.length} selected`}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Base Salary:</span>
                                    <span>{formatCurrency(computeForm.basicSalary)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowComputeModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="compute-btn"
                                onClick={handleComputePayroll}
                                disabled={computing}
                            >
                                {computing ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        <span>Computing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Calculator size={18} />
                                        <span>Compute Payroll</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
