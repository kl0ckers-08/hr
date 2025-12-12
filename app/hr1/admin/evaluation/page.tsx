"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Users,
    CheckCircle,
    Clock,
    Award,
    RefreshCw,
    ChevronDown,
    Mail,
    Briefcase,
    Eye,
    AlertCircle,
    ClipboardCheck,
    TrendingUp,
    Building2,
    Plus,
    Trash2,
    Edit3,
    X,
    FileQuestion,
    Settings,
    Save,
} from "lucide-react";

type Applicant = {
    _id: string;
    fullName: string;
    email: string;
    jobId: string;
    jobTitle: string;
    department: string;
    employmentType: string;
    status: string;
    appliedAt: string;
    hasEvaluation: boolean;
    evaluationScore: number | null;
    evaluationTotal: number | null;
    evaluationSubmittedAt: string | null;
    hasResume: boolean;
    hasApplicationLetter: boolean;
};

type Stats = {
    total: number;
    pendingEvaluation: number;
    completedEvaluation: number;
    departments: string[];
};

type Job = {
    _id: string;
    title: string;
    department: string;
    employmentType: string;
    questionCount?: number;
};

type Question = {
    _id: string;
    jobId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    isActive: boolean;
};

export default function EvaluationDashboard() {
    const router = useRouter();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<"applicants" | "forms">("applicants");
    const [subTab, setSubTab] = useState<"pending" | "completed">("pending");
    const [departments, setDepartments] = useState<string[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        pendingEvaluation: 0,
        completedEvaluation: 0,
        departments: [],
    });
    const [expandedApplicant, setExpandedApplicant] = useState<string | null>(null);

    // Question Modal State
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // New Question Form
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
    });
    const [savingQuestion, setSavingQuestion] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch applicants and jobs in parallel
            const [applicantsRes, jobsRes] = await Promise.all([
                fetch("/hr1/api/admin/evaluation", { credentials: "include" }),
                fetch("/hr1/api/admin/evaluation/jobs", { credentials: "include" }),
            ]);

            if (!applicantsRes.ok) throw new Error("Failed to load applicants");

            const applicantsData = await applicantsRes.json();
            const jobsData = jobsRes.ok ? await jobsRes.json() : [];

            setApplicants(applicantsData.applicants || []);
            setStats(applicantsData.stats || {
                total: 0,
                pendingEvaluation: 0,
                completedEvaluation: 0,
                departments: [],
            });
            setDepartments(applicantsData.departments || []);
            setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (err) {
            setError("Failed to load evaluation data. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestionsForJob = async (jobId: string) => {
        try {
            setLoadingQuestions(true);
            const res = await fetch(`/hr1/api/evaluation/questions?jobId=${jobId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load questions");
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error("Error fetching questions:", err);
            setQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const openQuestionModal = async (job: Job) => {
        setSelectedJob(job);
        setShowQuestionModal(true);
        await fetchQuestionsForJob(job._id);
    };

    const closeQuestionModal = () => {
        setShowQuestionModal(false);
        setSelectedJob(null);
        setQuestions([]);
        setNewQuestion({ question: "", options: ["", "", "", ""], correctAnswer: "" });
    };

    const handleAddQuestion = async () => {
        if (!selectedJob) return;
        if (!newQuestion.question.trim()) {
            alert("Please enter a question");
            return;
        }
        if (newQuestion.options.some(opt => !opt.trim())) {
            alert("Please fill all options");
            return;
        }
        if (!newQuestion.correctAnswer) {
            alert("Please select the correct answer");
            return;
        }

        try {
            setSavingQuestion(true);
            const res = await fetch("/hr1/api/evaluation/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    jobId: selectedJob._id,
                    question: newQuestion.question,
                    options: newQuestion.options,
                    correctAnswer: newQuestion.correctAnswer,
                }),
            });

            if (!res.ok) throw new Error("Failed to add question");

            // Refresh questions
            await fetchQuestionsForJob(selectedJob._id);
            setNewQuestion({ question: "", options: ["", "", "", ""], correctAnswer: "" });
        } catch (err) {
            console.error("Error adding question:", err);
            alert("Failed to add question");
        } finally {
            setSavingQuestion(false);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        try {
            const res = await fetch(`/hr1/api/evaluation/questions/${questionId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to delete question");

            // Refresh questions
            if (selectedJob) {
                await fetchQuestionsForJob(selectedJob._id);
            }
        } catch (err) {
            console.error("Error deleting question:", err);
            alert("Failed to delete question");
        }
    };

    // Filter applicants based on tab, department, and search
    const filteredApplicants = applicants.filter((app) => {
        // Sub-tab filter
        if (subTab === "pending" && app.hasEvaluation) return false;
        if (subTab === "completed" && !app.hasEvaluation) return false;

        // Department filter
        if (departmentFilter !== "all" && app.department !== departmentFilter) return false;

        // Search filter
        const q = search.trim().toLowerCase();
        if (q) {
            return (
                app.fullName.toLowerCase().includes(q) ||
                app.email.toLowerCase().includes(q) ||
                app.jobTitle.toLowerCase().includes(q) ||
                app.department.toLowerCase().includes(q)
            );
        }

        return true;
    });

    // Filter jobs based on search and department
    const filteredJobs = jobs.filter((job) => {
        if (departmentFilter !== "all" && job.department !== departmentFilter) return false;
        const q = search.trim().toLowerCase();
        if (q) {
            return (
                job.title.toLowerCase().includes(q) ||
                job.department.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // Group by department for display
    const groupedByDepartment = filteredApplicants.reduce((acc, app) => {
        const dept = app.department || "Unassigned";
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(app);
        return acc;
    }, {} as Record<string, Applicant[]>);

    const getScoreColor = (score: number, total: number) => {
        const percentage = (score / total) * 100;
        if (percentage >= 70) return "text-emerald-600 bg-emerald-100 border-emerald-200";
        if (percentage >= 50) return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };

    const getScorePercentage = (score: number, total: number) => {
        return Math.round((score / total) * 100);
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
                        <ClipboardCheck className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading evaluations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Applicant Evaluations
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">
                                Track evaluation tests and manage evaluation forms per job
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl 
                                     text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Evaluation</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingEvaluation}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedEvaluation}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Jobs with Forms</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{jobs.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                <FileQuestion className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("applicants")}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "applicants"
                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            Applicants
                        </button>
                        <button
                            onClick={() => setActiveTab("forms")}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "forms"
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <FileQuestion className="w-5 h-5" />
                            Evaluation Forms
                        </button>
                    </div>
                </div>

                {/* Sub Tabs for Applicants */}
                {activeTab === "applicants" && (
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSubTab("pending")}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${subTab === "pending"
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <Clock className="w-5 h-5" />
                                Pending Evaluation
                                <span className={`px-2 py-0.5 rounded-full text-xs ${subTab === "pending" ? "bg-white/20" : "bg-amber-100 text-amber-700"
                                    }`}>
                                    {stats.pendingEvaluation}
                                </span>
                            </button>
                            <button
                                onClick={() => setSubTab("completed")}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${subTab === "completed"
                                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <CheckCircle className="w-5 h-5" />
                                Completed Evaluation
                                <span className={`px-2 py-0.5 rounded-full text-xs ${subTab === "completed" ? "bg-white/20" : "bg-emerald-100 text-emerald-700"
                                    }`}>
                                    {stats.completedEvaluation}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={activeTab === "applicants"
                                    ? "Search by name, email, job title, or department..."
                                    : "Search jobs by title or department..."
                                }
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                         focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white
                                         outline-none transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-400" />
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                         focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                                         outline-none transition-all text-gray-700 cursor-pointer min-w-[180px]"
                            >
                                <option value="all">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchData}
                            className="ml-auto px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* APPLICANTS TAB CONTENT */}
                {activeTab === "applicants" && (
                    <>
                        {filteredApplicants.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {subTab === "pending" ? (
                                        <Clock className="w-10 h-10 text-gray-400" />
                                    ) : (
                                        <CheckCircle className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {subTab === "pending" ? "No Pending Evaluations" : "No Completed Evaluations"}
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {subTab === "pending"
                                        ? "All applicants have completed their evaluation tests."
                                        : "No applicants have completed their evaluation yet."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedByDepartment).map(([department, deptApplicants]) => (
                                    <div key={department} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        {/* Department Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{department}</h3>
                                                        <p className="text-sm text-gray-500">{deptApplicants.length} applicant(s)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Applicants in this Department */}
                                        <div className="divide-y divide-gray-100">
                                            {deptApplicants.map((applicant) => (
                                                <div
                                                    key={applicant._id}
                                                    className="p-4 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div
                                                        className="flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                                                        onClick={() => setExpandedApplicant(
                                                            expandedApplicant === applicant._id ? null : applicant._id
                                                        )}
                                                    >
                                                        {/* Avatar & Name */}
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                                {applicant.fullName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-900 truncate">{applicant.fullName}</h4>
                                                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="w-3.5 h-3.5" />
                                                                        {applicant.email}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Job Info */}
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-700 font-medium">{applicant.jobTitle}</span>
                                                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                                                {applicant.employmentType}
                                                            </span>
                                                        </div>

                                                        {/* Evaluation Status */}
                                                        <div className="flex items-center gap-3">
                                                            {applicant.hasEvaluation ? (
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${getScoreColor(applicant.evaluationScore!, applicant.evaluationTotal!)
                                                                    }`}>
                                                                    <Award className="w-4 h-4" />
                                                                    {applicant.evaluationScore}/{applicant.evaluationTotal}
                                                                    <span className="text-xs opacity-75">
                                                                        ({getScorePercentage(applicant.evaluationScore!, applicant.evaluationTotal!)}%)
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                    <Clock className="w-4 h-4" />
                                                                    Pending
                                                                </div>
                                                            )}
                                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedApplicant === applicant._id ? "rotate-180" : ""
                                                                }`} />
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {expandedApplicant === applicant._id && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Application Info</h5>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-500">Applied</span>
                                                                        <span className="font-medium text-gray-900">
                                                                            {new Date(applicant.appliedAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-500">Status</span>
                                                                        <span className="font-medium text-gray-900 capitalize">
                                                                            {applicant.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Documents</h5>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        {applicant.hasResume ? (
                                                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                        ) : (
                                                                            <AlertCircle className="w-4 h-4 text-gray-300" />
                                                                        )}
                                                                        <span className={applicant.hasResume ? "text-gray-900" : "text-gray-400"}>
                                                                            Resume
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {applicant.hasApplicationLetter ? (
                                                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                        ) : (
                                                                            <AlertCircle className="w-4 h-4 text-gray-300" />
                                                                        )}
                                                                        <span className={applicant.hasApplicationLetter ? "text-gray-900" : "text-gray-400"}>
                                                                            Application Letter
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Evaluation</h5>
                                                                {applicant.hasEvaluation ? (
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-gray-500">Score</span>
                                                                            <span className="font-bold text-gray-900">
                                                                                {applicant.evaluationScore}/{applicant.evaluationTotal}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-gray-500">Completed</span>
                                                                            <span className="font-medium text-gray-900">
                                                                                {applicant.evaluationSubmittedAt
                                                                                    ? new Date(applicant.evaluationSubmittedAt).toLocaleDateString()
                                                                                    : "N/A"
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-2">
                                                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full rounded-full ${getScorePercentage(applicant.evaluationScore!, applicant.evaluationTotal!) >= 70
                                                                                            ? "bg-emerald-500"
                                                                                            : getScorePercentage(applicant.evaluationScore!, applicant.evaluationTotal!) >= 50
                                                                                                ? "bg-yellow-500"
                                                                                                : "bg-red-500"
                                                                                        }`}
                                                                                    style={{
                                                                                        width: `${getScorePercentage(applicant.evaluationScore!, applicant.evaluationTotal!)}%`
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-sm text-amber-600">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>Waiting for applicant</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="md:col-span-3 flex justify-end">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.push(`/hr1/admin/evaluation/${applicant.jobId}`);
                                                                    }}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
                                                                             text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-medium shadow-md"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Full Application
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* EVALUATION FORMS TAB CONTENT */}
                {activeTab === "forms" && (
                    <div className="space-y-4">
                        {filteredJobs.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileQuestion className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Create job postings first to set up evaluation forms.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredJobs.map((job) => (
                                    <div
                                        key={job._id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm text-gray-500">{job.department}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-sm text-gray-500">{job.employmentType}</span>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                                    <FileQuestion className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {applicants.filter(a => a.jobId === job._id).length} applicants
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => openQuestionModal(job)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 
                                                         text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-md"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Manage Evaluation Form
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Question Management Modal */}
            {showQuestionModal && selectedJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600">
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Evaluation Form</h2>
                                <p className="text-blue-100 text-sm">{selectedJob.title} - {selectedJob.department}</p>
                            </div>
                            <button
                                onClick={closeQuestionModal}
                                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center 
                                         hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingQuestions ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Existing Questions */}
                                    <div className="mb-8">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                            Questions ({questions.length})
                                        </h3>

                                        {questions.length === 0 ? (
                                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                                <FileQuestion className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-gray-500">No questions yet. Add your first question below.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {questions.map((q, index) => (
                                                    <div key={q._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900 mb-2">
                                                                    <span className="text-blue-600 mr-2">Q{index + 1}.</span>
                                                                    {q.question}
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                                    {q.options.map((opt, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className={`px-3 py-2 rounded-lg text-sm ${opt === q.correctAnswer
                                                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                                                    : "bg-white text-gray-600 border border-gray-200"
                                                                                }`}
                                                                        >
                                                                            {opt}
                                                                            {opt === q.correctAnswer && (
                                                                                <CheckCircle className="w-4 h-4 inline ml-2" />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteQuestion(q._id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add New Question Form */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-emerald-600" />
                                            Add New Question
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                                <input
                                                    type="text"
                                                    value={newQuestion.question}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                                    placeholder="Enter your question..."
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 
                                                             focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {newQuestion.options.map((opt, i) => (
                                                        <div key={i} className="relative">
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newOptions = [...newQuestion.options];
                                                                    newOptions[i] = e.target.value;
                                                                    setNewQuestion({ ...newQuestion, options: newOptions });
                                                                }}
                                                                placeholder={`Option ${i + 1}`}
                                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 
                                                                         focus:ring-blue-500 focus:border-blue-500 outline-none ${newQuestion.correctAnswer === opt && opt
                                                                        ? "border-emerald-500 bg-emerald-50"
                                                                        : "border-gray-200"
                                                                    }`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (opt) setNewQuestion({ ...newQuestion, correctAnswer: opt });
                                                                }}
                                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${newQuestion.correctAnswer === opt && opt
                                                                        ? "text-emerald-600"
                                                                        : "text-gray-300 hover:text-emerald-500"
                                                                    }`}
                                                                title="Mark as correct answer"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Click the checkmark to mark an option as the correct answer
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleAddQuestion}
                                                disabled={savingQuestion}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 
                                                         text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium 
                                                         disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {savingQuestion ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-5 h-5" />
                                                        Add Question
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
