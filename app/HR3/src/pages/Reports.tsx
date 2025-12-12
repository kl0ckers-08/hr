import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { attendanceAPI, payrollAPI, leaveAPI, departmentsAPI, schedulesAPI, type Department } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

interface ReportType {
    id: string;
    name: string;
    description: string;
}

interface GeneratedReport {
    id: number;
    name: string;
    generatedDate: string;
    type: string;
}

const REPORT_TYPES: ReportType[] = [
    { id: 'attendance', name: 'Attendance Summary Report', description: 'Complete attendance records with status and hours' },
    { id: 'payroll', name: 'Payroll Report', description: 'Salary computation breakdown and deductions' },
    { id: 'leave', name: 'Leave Summary Report', description: 'Leave requests and balance overview' },
    { id: 'schedule', name: 'Employee Schedule Report', description: 'Work schedules and shift assignments' },
    { id: 'overtime', name: 'Overtime Report', description: 'Overtime hours and compensation' },
    { id: 'department', name: 'Department Summary', description: 'Per-department HR metrics and analytics' },
];

// Initial reports will be populated from localStorage or empty
const getStoredReports = (): GeneratedReport[] => {
    try {
        const stored = localStorage.getItem('generatedReports');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const formatCurrency = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState('attendance');
    const [startDate, setStartDate] = useState('2025-11-01');
    const [endDate, setEndDate] = useState('2025-11-24');
    const [department, setDepartment] = useState('All Departments');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentlyGeneratedReports, setRecentlyGeneratedReports] = useState<GeneratedReport[]>(getStoredReports);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await departmentsAPI.getAll();
                setDepartments(data);
            } catch (err) {
                console.error('Failed to load departments');
            }
        };
        fetchDepartments();
    }, []);

    const generatePDF = (title: string, headers: string[], rows: any[][]) => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(93, 95, 219);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('HR3 Management System', 14, 20);

        doc.setFontSize(14);
        doc.text(title, 14, 32);

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Report metadata
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-PH')}`, 14, 50);
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 56);
        if (department !== 'All Departments') {
            doc.text(`Department: ${department}`, 14, 62);
        }

        // Table
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 70,
            theme: 'striped',
            headStyles: {
                fillColor: [93, 95, 219],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            }
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('HR3 Management System - Confidential', 105, 295, { align: 'center' });
        }

        return doc;
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            let doc: jsPDF;
            const reportTypeName = REPORT_TYPES.find(r => r.id === selectedReport)?.name || 'Report';

            switch (selectedReport) {
                case 'attendance': {
                    const data = await attendanceAPI.getAll({ startDate, endDate });
                    const headers = ['Employee', 'Date', 'Time In', 'Time Out', 'Status', 'Hours Worked'];
                    const rows = data.map((item: any) => [
                        item.userId?.name || 'Unknown',
                        formatDate(item.date),
                        item.timeIn ? new Date(item.timeIn).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '-',
                        item.timeOut ? new Date(item.timeOut).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '-',
                        item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || '-',
                        item.hoursWorked?.toFixed(2) || '0.00'
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                    break;
                }

                case 'payroll': {
                    const data = await payrollAPI.getAll();
                    const headers = ['Employee', 'Department', 'Basic Salary', 'Gross Pay', 'Deductions', 'Net Pay'];
                    const rows = data.map((item: any) => [
                        item.userId?.name || 'Unknown',
                        item.userId?.department || '-',
                        formatCurrency(item.basicSalary),
                        formatCurrency(item.grossPay),
                        formatCurrency(item.totalDeductions),
                        formatCurrency(item.netPay)
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                    break;
                }

                case 'leave': {
                    const data = await leaveAPI.getAll();
                    const headers = ['Employee', 'Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
                    const rows = data.map((item: any) => [
                        item.userId?.name || 'Unknown',
                        item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || '-',
                        formatDate(item.startDate),
                        formatDate(item.endDate),
                        item.totalDays || 1,
                        item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || '-',
                        (item.reason || '-').substring(0, 30)
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                    break;
                }

                case 'schedule': {
                    const data = await schedulesAPI.getAll();
                    const headers = ['Employee', 'Day', 'Shift Name', 'Start Time', 'End Time', 'Status'];
                    const rows = data.map((item: any) => [
                        typeof item.userId === 'object' ? item.userId?.name : 'Unknown',
                        item.dayOfWeek?.charAt(0).toUpperCase() + item.dayOfWeek?.slice(1) || '-',
                        item.shiftName || '-',
                        item.startTime || '-',
                        item.endTime || '-',
                        item.isActive ? 'Active' : 'Inactive'
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                    break;
                }

                case 'department': {
                    const data = await departmentsAPI.getAll();
                    const headers = ['Department', 'Code', 'Description', 'Status', 'Head'];
                    const rows = data.map((item: any) => [
                        item.name || '-',
                        item.code || '-',
                        (item.description || '-').substring(0, 40),
                        item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || '-',
                        typeof item.headId === 'object' ? item.headId?.name : '-'
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                    break;
                }

                case 'overtime': {
                    const data = await attendanceAPI.getAll({ startDate, endDate });
                    const overtimeRecords = data.filter((item: any) => item.overtime > 0);
                    const headers = ['Employee', 'Date', 'Regular Hours', 'Overtime Hours', 'Total Hours'];
                    const rows = overtimeRecords.map((item: any) => [
                        item.userId?.name || 'Unknown',
                        formatDate(item.date),
                        (item.hoursWorked - item.overtime).toFixed(2),
                        item.overtime?.toFixed(2) || '0.00',
                        item.hoursWorked?.toFixed(2) || '0.00'
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                    break;
                }

                default: {
                    const data = await attendanceAPI.getAll();
                    const headers = ['Employee', 'Date', 'Status'];
                    const rows = data.map((item: any) => [
                        item.userId?.name || 'Unknown',
                        formatDate(item.date),
                        item.status || '-'
                    ]);
                    doc = generatePDF(reportTypeName, headers, rows);
                }
            }

            // Save PDF
            doc.save(`${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`);

            // Add to recently generated reports
            const newReport: GeneratedReport = {
                id: Date.now(),
                name: `${reportTypeName} - ${new Date().toLocaleDateString('en-PH')}`,
                generatedDate: new Date().toLocaleDateString('en-US'),
                type: reportTypeName.split(' ')[0]
            };
            const updatedReports = [newReport, ...recentlyGeneratedReports].slice(0, 10);
            setRecentlyGeneratedReports(updatedReports);
            localStorage.setItem('generatedReports', JSON.stringify(updatedReports));

        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Documentation</h1>
                    <p className="page-subtitle">Generate and download HR reports</p>
                </div>
            </div>

            <div className="reports-layout">
                <div className="reports-main">
                    <h2 className="section-title">Select Report Type</h2>
                    <div className="report-types-list">
                        {REPORT_TYPES.map((report) => (
                            <div
                                key={report.id}
                                className={`report-type-card ${selectedReport === report.id ? 'selected' : ''}`}
                                onClick={() => setSelectedReport(report.id)}
                            >
                                <div className="report-icon">
                                    <FileText size={18} />
                                </div>
                                <div className="report-info">
                                    <span className="report-name">{report.name}</span>
                                    <span className="report-desc">{report.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="section-title mt-32">Recently Generated Reports</h2>
                    <div className="recent-reports-list">
                        {recentlyGeneratedReports.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                No reports generated yet. Generate a report above.
                            </div>
                        ) : (
                            recentlyGeneratedReports.map((report) => (
                                <div key={report.id} className="recent-report-item">
                                    <div className="report-icon small">
                                        <FileText size={16} />
                                    </div>
                                    <div className="report-info">
                                        <span className="report-name">{report.name}</span>
                                        <span className="report-date">Generated on {report.generatedDate}</span>
                                    </div>
                                    <span className="report-type-badge">{report.type}</span>
                                    <button
                                        className="download-icon-btn"
                                        onClick={() => {
                                            const reportTypeId = report.type.toLowerCase();
                                            setSelectedReport(reportTypeId);
                                            setTimeout(() => generateReport(), 100);
                                        }}
                                        title="Regenerate and download"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="reports-sidebar">
                    <div className="filters-card">
                        <div className="filters-header">
                            <Filter size={16} />
                            <span>Report Filters</span>
                        </div>

                        <div className="filter-group">
                            <label>
                                <Calendar size={14} />
                                <span>Start Date</span>
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>
                                <Calendar size={14} />
                                <span>End Date</span>
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option>All Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <button className="generate-btn" onClick={generateReport} disabled={loading}>
                            {loading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                            <span>{loading ? 'Generating...' : 'Generate Report (PDF)'}</span>
                        </button>
                    </div>

                    <div className="quick-stats-card">
                        <h3>Quick Statistics</h3>
                        <div className="stat-row">
                            <span className="stat-name">Total Reports</span>
                            <span className="stat-val primary">156</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-name">This Month</span>
                            <span className="stat-val">24</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-name">Last Generated</span>
                            <span className="stat-val primary">Today</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
