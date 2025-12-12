"use client";

import { useState, useEffect } from "react";
import {
    Users,
    CheckCircle,
    AlertTriangle,
    Target,
    ClipboardCheck,
    Search,
    Edit,
    Save,
    X,
    TrendingUp,
    Award,
    Loader2,
    Plus,
    Eye,
    ChevronDown,
} from "lucide-react";

type Employee = {
    _id: string;
    fullname: string;
    email: string;
    department: string;
    role: string;
    competencyScore: number | null;
    lastAssessed: string | null;
    assessmentNotes: string;
};

type TrainingRecord = {
    title: string;
    date: string;
    location: string;
    type: string;
};

type CompetencyAssessment = {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
    notes: string;
};

type CompetencyStandard = {
    role: string;
    minLevel: string;
    skills: string[];
};

export default function CompetencyManagement() {
    const [activeTab, setActiveTab] = useState("overview");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All Departments");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    
    // Assessment Modal State
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [assessment, setAssessment] = useState<CompetencyAssessment>({
        technicalSkills: 0,
        communication: 0,
        problemSolving: 0,
        teamwork: 0,
        leadership: 0,
        notes: "",
    });
    const [saving, setSaving] = useState(false);

    // Mock competency standards
    const [standards] = useState<CompetencyStandard[]>([
        {
            role: "Instructor",
            minLevel: "Advanced",
            skills: ["Curriculum Design", "Student Assessment", "Classroom Management", "Subject Expertise", "Communication"]
        },
        {
            role: "Lecturer",
            minLevel: "Expert",
            skills: ["Advanced Teaching", "Research", "Publication", "Mentoring", "Academic Leadership"]
        }
    ]);

    // Mock training history data
    const [trainingHistory] = useState<Record<string, TrainingRecord[]>>({
        // This would normally come from an API based on employee ID
        default: [
            {
                title: "Advanced Teaching Methods",
                date: "2024-10-15 09:00 AM",
                location: "Room 301",
                type: "Workshop"
            },
            {
                title: "Educational Technology Summit",
                date: "2024-09-20 08:00 AM",
                location: "Convention Center",
                type: "Conference"
            },
            {
                title: "Research Methodology",
                date: "2024-08-10 02:00 PM",
                location: "Virtual",
                type: "Seminar"
            }
        ]
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await fetch("/hr2/api/admin/competency", {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setEmployees(data.employees || []);
            }
        } catch (err) {
            console.error("Failed to fetch employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const openAssessmentModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setAssessment({
            technicalSkills: 0,
            communication: 0,
            problemSolving: 0,
            teamwork: 0,
            leadership: 0,
            notes: employee.assessmentNotes || "",
        });
        setShowAssessmentModal(true);
    };

    const openTrainingModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowTrainingModal(true);
    };

    const closeAssessmentModal = () => {
        setShowAssessmentModal(false);
        setSelectedEmployee(null);
        setAssessment({
            technicalSkills: 0,
            communication: 0,
            problemSolving: 0,
            teamwork: 0,
            leadership: 0,
            notes: "",
        });
    };

    const closeTrainingModal = () => {
        setShowTrainingModal(false);
        setSelectedEmployee(null);
    };

    const handleSaveAssessment = async () => {
        if (!selectedEmployee) return;

        try {
            setSaving(true);
            const res = await fetch("/hr2/api/admin/competency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    employeeId: selectedEmployee._id,
                    assessment,
                }),
            });

            if (!res.ok) throw new Error("Failed to save assessment");

            alert("Assessment saved successfully!");
            closeAssessmentModal();
            fetchEmployees();
        } catch (err) {
            console.error("Error saving assessment:", err);
            alert("Failed to save assessment");
        } finally {
            setSaving(false);
        }
    };

    const calculateOverallScore = () => {
        const scores = [
            assessment.technicalSkills,
            assessment.communication,
            assessment.problemSolving,
            assessment.teamwork,
            assessment.leadership,
        ].filter(s => s > 0);

        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };

    // Calculate statistics
    const stats = {
        total: employees.length,
        competent: employees.filter(e => e.competencyScore && e.competencyScore >= 70).length,
        needsImprovement: employees.filter(e => e.competencyScore && e.competencyScore < 70).length,
        notAssessed: employees.filter(e => !e.competencyScore).length,
        avgScore: employees.filter(e => e.competencyScore).length > 0
            ? Math.round(
                employees
                    .filter(e => e.competencyScore)
                    .reduce((sum, e) => sum + (e.competencyScore || 0), 0) /
                employees.filter(e => e.competencyScore).length
            )
            : 0,
    };

    const getStatusBadge = (score: number | null) => {
        if (!score) return { label: "Not Assessed", class: "bg-gray-100 text-gray-600" };
        if (score >= 80) return { label: "Competent", class: "bg-emerald-100 text-emerald-700" };
        if (score >= 70) return { label: "Proficient", class: "bg-blue-100 text-blue-700" };
        if (score >= 60) return { label: "Developing", class: "bg-yellow-100 text-yellow-700" };
        return { label: "Needs Improvement", class: "bg-red-100 text-red-700" };
    };

    // Get unique departments and roles for filters
    const departments = ["All Departments", ...new Set(employees.map(e => e.department).filter(Boolean))];
    const roles = ["All Roles", ...new Set(employees.map(e => e.role).filter(Boolean))];

    const filteredEmployees = employees.filter(emp => {
        const q = search.toLowerCase();
        const matchesSearch = (
            (emp.fullname || "").toLowerCase().includes(q) ||
            (emp.email || "").toLowerCase().includes(q) ||
            (emp.department || "").toLowerCase().includes(q) ||
            (emp.role || "").toLowerCase().includes(q)
        );
        
        const matchesDepartment = departmentFilter === "All Departments" || emp.department === departmentFilter;
        const matchesRole = roleFilter === "All Roles" || emp.role === roleFilter;
        
        let matchesStatus = true;
        if (statusFilter === "Competent") matchesStatus = emp.competencyScore ? emp.competencyScore >= 80 : false;
        else if (statusFilter === "Needs Improvement") matchesStatus = emp.competencyScore ? emp.competencyScore < 70 : false;
        else if (statusFilter === "Not Assessed") matchesStatus = !emp.competencyScore;
        
        return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });

    const topPerformers = employees
        .filter(e => e.competencyScore && e.competencyScore >= 80)
        .sort((a, b) => (b.competencyScore || 0) - (a.competencyScore || 0))
        .slice(0, 5);

    const needsAttention = employees
        .filter(e => e.competencyScore && e.competencyScore < 70)
        .sort((a, b) => (a.competencyScore || 0) - (b.competencyScore || 0))
        .slice(0, 5);

    const getScoreBadge = (score: number | null) => {
        if (!score) return "bg-gray-100 text-gray-600";
        if (score >= 80) return "bg-emerald-100 text-emerald-700";
        if (score >= 70) return "bg-blue-100 text-blue-700";
        if (score >= 60) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#333] ">
                        Competency Management (Admin)
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        Manage employee competencies and standards
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500">Total Employees</p>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500 mt-1">in system</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500">Competent</p>
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.competent}</p>
                        <p className="text-xs text-gray-500 mt-1">meet standards</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500">Needs Improvement</p>
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.needsImprovement}</p>
                        <p className="text-xs text-gray-500 mt-1">require training</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500">Average Score</p>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
                        <p className="text-xs text-gray-500 mt-1">organization-wide</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500">Not Assessed</p>
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <ClipboardCheck className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.notAssessed}</p>
                        <p className="text-xs text-gray-500 mt-1">need evaluation</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            { value: "overview", label: "Overview" },
                            { value: "assessments", label: "Employee Assessments" },
                            { value: "standards", label: "Competency Standards" },
                            { value: "pending", label: "Pending Assessments" },
                            { value: "evaluation", label: "Competency Evaluation" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.value
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-600" />
                                Top Performers
                            </h2>
                            {topPerformers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No assessed employees yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {topPerformers.map((emp) => (
                                        <div key={emp._id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-gray-900">{emp.fullname}</p>
                                                <p className="text-sm text-gray-500">{emp.department}</p>
                                            </div>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {emp.competencyScore}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                Needs Attention
                            </h2>
                            {needsAttention.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">All employees are performing well!</p>
                            ) : (
                                <div className="space-y-3">
                                    {needsAttention.map((emp) => (
                                        <div key={emp._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-gray-900">{emp.fullname}</p>
                                                <p className="text-sm text-gray-500">{emp.department}</p>
                                            </div>
                                            <span className="text-2xl font-bold text-yellow-600">
                                                {emp.competencyScore}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "assessments" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search employees..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white
                                                 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <select
                                            value={departmentFilter}
                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700"
                                        >
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700"
                                        >
                                            <option>All Statuses</option>
                                            <option>Competent</option>
                                            <option>Needs Improvement</option>
                                            <option>Not Assessed</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700"
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {loading ? (
                                <div className="px-6 py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                                    <p className="text-gray-500 mt-2">Loading employees...</p>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="px-6 py-12 text-center text-gray-500">
                                    No employees found
                                </div>
                            ) : (
                                filteredEmployees.map((emp) => {
                                    const status = getStatusBadge(emp.competencyScore);
                                    return (
                                        <div key={emp._id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900 text-lg">{emp.fullname || "Unknown"}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.class}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{emp.role || "N/A"} • {emp.department || "N/A"}</p>
                                                    <div className="flex items-center gap-6 mt-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Competency Score</p>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {emp.competencyScore ? `${emp.competencyScore}%` : "—"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Skill Progress</p>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {emp.competencyScore ? `${Math.min(emp.competencyScore + 5, 100)}%` : "—"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Last Assessed</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {emp.lastAssessed ? new Date(emp.lastAssessed).toLocaleDateString() : "Never"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {emp.competencyScore && (
                                                        <div className="mt-3">
                                                            <p className="text-xs text-gray-500 mb-1">Overall Progress</p>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                                                    style={{ width: `${emp.competencyScore}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 text-right mt-1">{emp.competencyScore}%</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => openTrainingModal(emp)}
                                                    className="ml-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                                                             text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Training
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "standards" && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                                             text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium">
                                <Plus className="w-4 h-4" />
                                Create Standard
                            </button>
                        </div>
                        {standards.map((standard, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{standard.role}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Minimum Level: <span className="font-medium text-purple-600">{standard.minLevel}</span></p>
                                    </div>
                                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {standard.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "pending" && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-lg text-gray-900 mb-6">Pending Assessments</h2>
                        <div className="space-y-4">
                            {employees.filter(e => !e.competencyScore).length === 0 ? (
                                <p className="text-gray-500 text-center py-8">All employees have been assessed!</p>
                            ) : (
                                employees
                                    .filter(e => !e.competencyScore)
                                    .map((emp) => (
                                        <div key={emp._id} className="p-5 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{emp.fullname || "Unknown"}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {emp.role || "N/A"} • {emp.department || "N/A"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Submitted: {emp.lastAssessed ? new Date(emp.lastAssessed).toLocaleDateString() : "Not submitted"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => openAssessmentModal(emp)}
                                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg 
                                                             hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
                                                >
                                                    Initiate Assessment
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "evaluation" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search employees..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl 
                                             focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                                             outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl
                                                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700"
                                    >
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl
                                                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredEmployees.filter(e => e.competencyScore).length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                                    <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No evaluated employees found</p>
                                </div>
                            ) : (
                                filteredEmployees
                                    .filter(e => e.competencyScore)
                                    .map((emp) => (
                                        <div key={emp._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg">{emp.fullname || "Unknown"}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {emp.department || "N/A"} / {emp.role || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showAssessmentModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl scale-[.6] shadow-2xl max-w-2xl w-full my-8">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-600">
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Competency Assessment</h2>
                                <p className="text-purple-100 text-sm">{selectedEmployee.fullname}</p>
                            </div>
                            <button
                                onClick={closeAssessmentModal}
                                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-gray-50 rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Department</p>
                                        <p className="font-medium text-gray-900">{selectedEmployee.department || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Role</p>
                                        <p className="font-medium text-gray-900">{selectedEmployee.role || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { key: "technicalSkills", label: "Technical Skills" },
                                    { key: "communication", label: "Communication" },
                                    { key: "problemSolving", label: "Problem Solving" },
                                    { key: "teamwork", label: "Teamwork" },
                                    { key: "leadership", label: "Leadership" },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="font-medium text-gray-900">{label}</label>
                                            <span className="text-lg font-bold text-purple-600">
                                                {assessment[key as keyof CompetencyAssessment]}%
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={assessment[key as keyof CompetencyAssessment] as number}
                                            onChange={(e) =>
                                                setAssessment({
                                                    ...assessment,
                                                    [key]: parseInt(e.target.value),
                                                })
                                            }
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            style={{ accentColor: "#9333ea" }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <label className="block font-medium text-gray-900 mb-2">
                                        Assessment Notes
                                    </label>
                                    <textarea
                                        value={assessment.notes}
                                        onChange={(e) =>
                                            setAssessment({ ...assessment, notes: e.target.value })
                                        }
                                        rows={4}
                                        placeholder="Add notes about the employee's performance..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 
                                                 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">Overall Score</span>
                                        <span className="text-3xl font-bold text-purple-600">
                                            {calculateOverallScore()}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={closeAssessmentModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl 
                                         hover:bg-gray-100 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAssessment}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                                         text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-medium
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Assessment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTrainingModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-600">
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Training History - {selectedEmployee.fullname}</h2>
                            </div>
                            <button
                                onClick={closeTrainingModal}
                                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-6">
                            {trainingHistory.default.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No training history found</p>
                            ) : (
                                <div className="space-y-4">
                                    {trainingHistory.default.map((training, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 text-lg">{training.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    training.type === "Workshop" ? "bg-blue-100 text-blue-700" :
                                                    training.type === "Conference" ? "bg-purple-100 text-purple-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                    {training.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{training.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{training.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={closeTrainingModal}
                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl 
                                         hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}