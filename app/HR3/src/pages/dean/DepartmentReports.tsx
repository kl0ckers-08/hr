import './DepartmentReports.css';

interface ReportCard {
    id: string;
    title: string;
    description: string;
}

const REPORTS: ReportCard[] = [
    { id: 'attendance', title: 'Faculty Attendance Report', description: 'Detailed attendance records' },
    { id: 'leave', title: 'Leave Summary', description: 'Leave requests and approvals' },
    { id: 'schedule', title: 'Schedule Report', description: 'Teaching schedules overview' },
    { id: 'performance', title: 'Performance Metrics', description: 'Faculty performance data' },
];

export default function DepartmentReports() {
    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Department Reports</h1>
                    <p className="page-subtitle">Generate reports for your department</p>
                </div>
            </div>

            <div className="reports-grid">
                {REPORTS.map((report) => (
                    <div key={report.id} className="report-card">
                        <h3 className="report-title">{report.title}</h3>
                        <p className="report-description">{report.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
