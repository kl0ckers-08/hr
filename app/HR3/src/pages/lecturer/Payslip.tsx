import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { payrollAPI, type Payroll } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Payslip.css';

const formatCurrency = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Payslip() {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState<Payroll[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await payrollAPI.getMyPayslips();
                setPayslips(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load payslips');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentPayslip = payslips[currentIndex];

    const navigatePayslip = (delta: number) => {
        const newIndex = currentIndex + delta;
        if (newIndex >= 0 && newIndex < payslips.length) {
            setCurrentIndex(newIndex);
        }
    };

    const downloadPayslipPDF = () => {
        if (!currentPayslip) return;

        setDownloading(true);

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header with purple background
            doc.setFillColor(89, 85, 179); // Primary color
            doc.rect(0, 0, pageWidth, 45, 'F');

            // Company name
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('HR3 Management System', pageWidth / 2, 20, { align: 'center' });

            // Payslip title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`Payslip for ${currentPayslip.period}`, pageWidth / 2, 32, { align: 'center' });

            // Reset text color
            doc.setTextColor(30, 41, 59);
            let y = 60;

            // Employee Information Header
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('EMPLOYEE INFORMATION', 20, y);
            y += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            // Employee details in two columns
            const leftCol = 20;
            const rightCol = 110;

            doc.setTextColor(100, 116, 139);
            doc.text('Employee Name:', leftCol, y);
            doc.text('Employee ID:', rightCol, y);
            doc.setTextColor(30, 41, 59);
            doc.text(user?.name || 'N/A', leftCol + 35, y);
            doc.text(user?.email || 'N/A', rightCol + 30, y);
            y += 8;

            doc.setTextColor(100, 116, 139);
            doc.text('Department:', leftCol, y);
            doc.text('Position:', rightCol, y);
            doc.setTextColor(30, 41, 59);
            doc.text(user?.department || 'N/A', leftCol + 28, y);
            doc.text(user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A', rightCol + 22, y);
            y += 15;

            // Divider line
            doc.setDrawColor(226, 232, 240);
            doc.line(20, y, pageWidth - 20, y);
            y += 15;

            // Earnings Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 197, 94);
            doc.text('EARNINGS', 20, y);
            y += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);

            const drawPayRow = (label: string, amount: number, isTotal: boolean = false) => {
                if (isTotal) {
                    doc.setFont('helvetica', 'bold');
                }
                doc.text(label, 25, y);
                doc.text(formatCurrency(amount), pageWidth - 25, y, { align: 'right' });
                if (isTotal) {
                    doc.setFont('helvetica', 'normal');
                }
                y += 8;
            };

            drawPayRow('Basic Salary', currentPayslip.basicSalary || 0);
            drawPayRow('Overtime Pay', currentPayslip.overtimePay || 0);
            drawPayRow('Allowances', currentPayslip.allowances || 0);

            doc.setTextColor(34, 197, 94);
            drawPayRow('Gross Pay', currentPayslip.grossPay || 0, true);
            y += 5;

            // Deductions Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(239, 68, 68);
            doc.text('DEDUCTIONS', 20, y);
            y += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);

            drawPayRow('SSS Contribution', currentPayslip.deductions?.sss || 0);
            drawPayRow('PhilHealth Contribution', currentPayslip.deductions?.philhealth || 0);
            drawPayRow('Pag-IBIG Contribution', currentPayslip.deductions?.pagibig || 0);
            drawPayRow('Withholding Tax', currentPayslip.deductions?.tax || 0);
            drawPayRow('Tardiness', currentPayslip.deductions?.tardiness || 0);

            doc.setTextColor(239, 68, 68);
            drawPayRow('Total Deductions', currentPayslip.totalDeductions || 0, true);
            y += 10;

            // Divider line
            doc.setDrawColor(226, 232, 240);
            doc.line(20, y, pageWidth - 20, y);
            y += 15;

            // Net Pay Section
            doc.setFillColor(89, 85, 179);
            doc.roundedRect(20, y - 5, pageWidth - 40, 25, 3, 3, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('NET PAY', 30, y + 10);
            doc.text(formatCurrency(currentPayslip.netPay || 0), pageWidth - 30, y + 10, { align: 'right' });
            y += 35;

            // Status
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const status = currentPayslip.status?.charAt(0).toUpperCase() + currentPayslip.status?.slice(1);
            doc.text(`Status: ${status}`, pageWidth / 2, y, { align: 'center' });
            y += 20;

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, y, { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y + 6, { align: 'center' });

            // Save the PDF
            const fileName = `Payslip_${user?.name?.replace(/\s+/g, '_') || 'Employee'}_${currentPayslip.period?.replace(/\s+/g, '_') || 'Period'}.pdf`;
            doc.save(fileName);

        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content">
                <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    if (payslips.length === 0) {
        return (
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Payslip</h1>
                        <p className="page-subtitle">View and download your salary information</p>
                    </div>
                </div>
                <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#64748b' }}>
                    No payslips available yet.
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payslip</h1>
                    <p className="page-subtitle">View and download your salary information</p>
                </div>
            </div>

            {/* Period Navigator */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={() => navigatePayslip(1)}
                    disabled={currentIndex >= payslips.length - 1}
                    style={{ padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentIndex >= payslips.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex >= payslips.length - 1 ? 0.5 : 1 }}
                >
                    <ChevronLeft size={20} />
                </button>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentPayslip?.period || 'No Period'}</span>
                <button
                    onClick={() => navigatePayslip(-1)}
                    disabled={currentIndex <= 0}
                    style={{ padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer', opacity: currentIndex <= 0 ? 0.5 : 1 }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="payslip-container">
                <div className="payslip-header">
                    <h2 className="company-name">HR3 Management System</h2>
                    <p className="payslip-period">Payslip for {currentPayslip?.period}</p>
                </div>

                <div className="employee-info">
                    <div className="info-row">
                        <div className="info-item">
                            <span className="info-label">Employee Name</span>
                            <span className="info-value">{user?.name || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Employee ID</span>
                            <span className="info-value">{user?.email || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="info-label">Department</span>
                            <span className="info-value">{user?.department || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Position</span>
                            <span className="info-value">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="payslip-section">
                    <h3 className="section-heading">Earnings</h3>
                    <div className="payslip-row">
                        <span className="row-label">Basic Salary</span>
                        <span className="row-amount">{formatCurrency(currentPayslip?.basicSalary || 0)}</span>
                    </div>
                    <div className="payslip-row">
                        <span className="row-label text-primary">Overtime Pay</span>
                        <span className="row-amount text-primary">{formatCurrency(currentPayslip?.overtimePay || 0)}</span>
                    </div>
                    <div className="payslip-row">
                        <span className="row-label text-primary">Allowances</span>
                        <span className="row-amount text-primary">{formatCurrency(currentPayslip?.allowances || 0)}</span>
                    </div>
                    <div className="payslip-row gross-row">
                        <span className="row-label text-primary">Gross Pay</span>
                        <span className="row-amount text-primary">{formatCurrency(currentPayslip?.grossPay || 0)}</span>
                    </div>
                </div>

                <div className="payslip-section">
                    <h3 className="section-heading">Deductions</h3>
                    <div className="payslip-row">
                        <span className="row-label text-primary">SSS Contribution</span>
                        <span className="row-amount">{formatCurrency(currentPayslip?.deductions?.sss || 0)}</span>
                    </div>
                    <div className="payslip-row">
                        <span className="row-label text-primary">PhilHealth Contribution</span>
                        <span className="row-amount">{formatCurrency(currentPayslip?.deductions?.philhealth || 0)}</span>
                    </div>
                    <div className="payslip-row">
                        <span className="row-label text-primary">Pag-IBIG Contribution</span>
                        <span className="row-amount">{formatCurrency(currentPayslip?.deductions?.pagibig || 0)}</span>
                    </div>
                    <div className="payslip-row">
                        <span className="row-label text-primary">Withholding Tax</span>
                        <span className="row-amount">{formatCurrency(currentPayslip?.deductions?.tax || 0)}</span>
                    </div>
                    <div className="payslip-row">
                        <span className="row-label text-primary">Tardiness</span>
                        <span className="row-amount">{formatCurrency(currentPayslip?.deductions?.tardiness || 0)}</span>
                    </div>
                    <div className="payslip-row deductions-row">
                        <span className="row-label text-red">Total Deductions</span>
                        <span className="row-amount text-red">{formatCurrency(currentPayslip?.totalDeductions || 0)}</span>
                    </div>
                </div>

                <div className="net-pay-section">
                    <span className="net-pay-label">Net Pay</span>
                    <span className="net-pay-amount">{formatCurrency(currentPayslip?.netPay || 0)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span className={`status-badge ${currentPayslip?.status}`} style={{ padding: '4px 12px' }}>
                        {currentPayslip?.status?.charAt(0).toUpperCase() + currentPayslip?.status?.slice(1)}
                    </span>
                </div>

                <button className="download-payslip-btn" onClick={downloadPayslipPDF} disabled={downloading}>
                    {downloading ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                    <span>{downloading ? 'Generating PDF...' : 'Download Payslip (PDF)'}</span>
                </button>
            </div>
        </div>
    );
}
