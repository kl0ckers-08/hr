"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Mail,
    Calendar,
    Loader2,
    AlertCircle,
    CheckCheck,
    Award,
    Users,
    Briefcase,
    ChevronDown,
    Search,
    Filter,
    RefreshCw,
    ExternalLink,
    Phone,
    Upload,
    Plus,
    X,
    Save,
} from "lucide-react";

type Document = {
    fileId: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
};

type Application = {
    _id: string;
    userId: string;
    jobId: string;
    fullName: string;
    email: string;
    phone?: string;
    status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
    appliedAt: string;
    resume?: Document;
    applicationLetter?: Document;
    supportingDocs?: Document[];
    validId?: Document;
    portfolio?: Document;
    certificates?: Document[];
    requestedDocsSubmitted?: boolean;
    requestedDocsSubmittedAt?: string | null;
    contract?: Document;
    signedContract?: Document;
    evaluationScore?: number | null;
    evaluationTotal?: number | null;
    evaluationSubmittedAt?: string | null;
    hasEvaluation?: boolean;
};

type Job = {
    _id: string;
    title: string;
    department: string;
    employmentType: string;
};

export default function JobApplicantsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params?.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedApp, setExpandedApp] = useState<string | null>(null);

    // Contract Upload State
    const [showContractModal, setShowContractModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [uploadingContract, setUploadingContract] = useState(false);

    useEffect(() => {
        if (jobId) {
            fetchJobAndApplications();
        }
    }, [jobId]);

    const fetchJobAndApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch job details
            const jobRes = await fetch(`/hr1/api/jobs/${jobId}`, { credentials: "include" });
            if (jobRes.ok) {
                const jobData = await jobRes.json();
                setJob(jobData);
            }

            // Fetch applications
            const appsRes = await fetch(`/hr1/api/admin/evaluation/${jobId}`, {
                credentials: "include",
            });
            if (!appsRes.ok) throw new Error("Failed to load applications");
            const appsData = await appsRes.json();
            setApplications(appsData.applications || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (applicationId: string, status: string) => {
        try {
            setUpdating(applicationId);
            const res = await fetch(`/hr1/api/admin/evaluation/${jobId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ applicationId, status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            await fetchJobAndApplications();
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const approveRequestedDocs = async (applicationId: string, approved: boolean) => {
        try {
            setUpdating(applicationId);
            const res = await fetch(`/hr1/api/admin/evaluation/${jobId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ applicationId, requestedDocsApproved: approved }),
            });
            if (!res.ok) throw new Error("Failed to update document approval");
            await fetchJobAndApplications();
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Failed to update approval");
        } finally {
            setUpdating(null);
        }
    };

    const openContractModal = (application: Application) => {
        setSelectedApplication(application);
        setShowContractModal(true);
        setContractFile(null);
    };

    const closeContractModal = () => {
        setShowContractModal(false);
        setSelectedApplication(null);
        setContractFile(null);
    };

    const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type (PDF)
            if (file.type !== "application/pdf") {
                alert("Please upload a PDF file");
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            setContractFile(file);
        }
    };

    const handleUploadContract = async () => {
        if (!selectedApplication || !contractFile) {
            alert("Please select a contract file");
            return;
        }

        try {
            setUploadingContract(true);
            const formData = new FormData();
            formData.append("contract", contractFile);
            formData.append("applicationId", selectedApplication._id);
            formData.append("jobId", jobId);

            const res = await fetch("/hr1/api/admin/evaluation/upload-contract", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to upload contract");

            alert("Contract uploaded successfully!");
            closeContractModal();
            fetchJobAndApplications(); // Refresh data
        } catch (err) {
            console.error("Error uploading contract:", err);
            alert("Failed to upload contract");
        } finally {
            setUploadingContract(false);
        }
    };

    const downloadFile = (fileId: string, filename: string) => {
        window.open(`/hr1/api/files/${fileId}`, "_blank");
    };

    const previewFile = (fileId: string) => {
        window.open(`/hr1/api/files/${fileId}?inline=1`, "_blank");
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
            pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <Clock className="w-4 h-4" /> },
            reviewed: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: <Eye className="w-4 h-4" /> },
            shortlisted: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: <Award className="w-4 h-4" /> },
            hired: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCheck className="w-4 h-4" /> },
            rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <XCircle className="w-4 h-4" /> },
        };
        return configs[status] || configs.pending;
    };

    const getEvaluationBadge = (app: Application) => {
        if (!app.hasEvaluation || app.evaluationScore === null) return null;

        const percentage = (app.evaluationScore / (app.evaluationTotal || 1)) * 100;
        let colorClass = "bg-red-100 text-red-700 border-red-200";
        if (percentage >= 70) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
        else if (percentage >= 50) colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";

        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
                <Award className="w-4 h-4" />
                {app.evaluationScore}/{app.evaluationTotal} ({Math.round(percentage)}%)
            </div>
        );
    };

    const filteredApplications = applications.filter((app) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q ||
            app.fullName.toLowerCase().includes(q) ||
            app.email.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: applications.length,
        pending: applications.filter(a => a.status === "pending").length,
        reviewed: applications.filter(a => a.status === "reviewed").length,
        shortlisted: applications.filter(a => a.status === "shortlisted").length,
        hired: applications.filter(a => a.status === "hired").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
                        <Users className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading applicants...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchJobAndApplications}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/hr1/admin/evaluation")}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-4 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Evaluations</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{job?.title || "Job Applicants"}</h1>
                                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-sm">{job?.department}</span>
                                        <span>•</span>
                                        <span className="text-sm">{job?.employmentType}</span>
                                        <span>•</span>
                                        <span className="text-sm font-medium text-purple-600">{applications.length} applicant(s)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={fetchJobAndApplications}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl 
                                     text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {[
                            { value: "all", label: "All" },
                            { value: "pending", label: "Pending" },
                            { value: "reviewed", label: "Reviewed" },
                            { value: "shortlisted", label: "Shortlisted" },
                            { value: "hired", label: "Hired" },
                            { value: "rejected", label: "Rejected" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === tab.value
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${statusFilter === tab.value ? "bg-white/20" : "bg-gray-100"
                                    }`}>
                                    {statusCounts[tab.value as keyof typeof statusCounts]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white
                                     outline-none transition-all text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Applicants List */}
                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applicants Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {search || statusFilter !== "all"
                                ? "No applicants match your current filters."
                                : "No one has applied for this position yet."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map((app) => {
                            const statusConfig = getStatusConfig(app.status);
                            const isExpanded = expandedApp === app._id;

                            return (
                                <div
                                    key={app._id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    {/* Applicant Header */}
                                    <div
                                        className="p-6 cursor-pointer"
                                        onClick={() => setExpandedApp(isExpanded ? null : app._id)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Avatar & Info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                                    {app.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{app.fullName}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-4 h-4" />
                                                            {app.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(app.appliedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Score */}
                                            <div className="flex items-center gap-3">
                                                {getEvaluationBadge(app)}
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                    {statusConfig.icon}
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                                            {/* Status Update */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {["pending", "reviewed", "shortlisted", "hired", "rejected"].map((status) => {
                                                        const config = getStatusConfig(status);
                                                        const isActive = app.status === status;
                                                        return (
                                                            <button
                                                                key={status}
                                                                onClick={() => updateApplicationStatus(app._id, status)}
                                                                disabled={updating === app._id}
                                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isActive
                                                                        ? `${config.bg} ${config.text} ${config.border} ring-2 ring-offset-1 ring-${status === "pending" ? "blue" : status === "reviewed" ? "yellow" : status === "shortlisted" ? "purple" : status === "hired" ? "emerald" : "red"}-300`
                                                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                                    } disabled:opacity-50`}
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </button>
                                                        );
                                                    })}
                                                    {updating === app._id && (
                                                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Documents */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Submitted Documents</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {app.resume && (
                                                        <DocumentCard
                                                            label="Resume"
                                                            document={app.resume}
                                                            onDownload={downloadFile}
                                                            onPreview={previewFile}
                                                            formatFileSize={formatFileSize}
                                                        />
                                                    )}
                                                    {app.applicationLetter && (
                                                        <DocumentCard
                                                            label="Application Letter"
                                                            document={app.applicationLetter}
                                                            onDownload={downloadFile}
                                                            onPreview={previewFile}
                                                            formatFileSize={formatFileSize}
                                                        />
                                                    )}
                                                    {app.supportingDocs?.map((doc, idx) => (
                                                        <DocumentCard
                                                            key={doc.fileId}
                                                            label={`Supporting Doc ${idx + 1}`}
                                                            document={doc}
                                                            onDownload={downloadFile}
                                                            onPreview={previewFile}
                                                            formatFileSize={formatFileSize}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Requested Docs Section for Shortlisted */}
                                            {app.status === "shortlisted" && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-gray-700">Additional Requested Documents</h4>
                                                        {app.requestedDocsSubmitted && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => approveRequestedDocs(app._id, true)}
                                                                    disabled={updating === app._id}
                                                                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => approveRequestedDocs(app._id, false)}
                                                                    disabled={updating === app._id}
                                                                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {app.requestedDocsSubmitted ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {app.validId && (
                                                                <DocumentCard
                                                                    label="Valid ID"
                                                                    document={app.validId}
                                                                    onDownload={downloadFile}
                                                                    onPreview={previewFile}
                                                                    formatFileSize={formatFileSize}
                                                                />
                                                            )}
                                                            {app.portfolio && (
                                                                <DocumentCard
                                                                    label="Portfolio"
                                                                    document={app.portfolio}
                                                                    onDownload={downloadFile}
                                                                    onPreview={previewFile}
                                                                    formatFileSize={formatFileSize}
                                                                />
                                                            )}
                                                            {app.certificates?.map((doc, idx) => (
                                                                <DocumentCard
                                                                    key={doc.fileId}
                                                                    label={`Certificate ${idx + 1}`}
                                                                    document={doc}
                                                                    onDownload={downloadFile}
                                                                    onPreview={previewFile}
                                                                    formatFileSize={formatFileSize}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                                            <span className="text-amber-700">Waiting for applicant to submit additional documents.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Contract Section for Hired */}
                                            {app.status === "hired" && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-gray-700">Contract Documents</h4>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openContractModal(app);
                                                            }}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 
                                                                     text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm font-medium"
                                                        >
                                                            <Upload className="w-4 h-4" />
                                                            {app.contract ? "Update Contract" : "Upload Contract"}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {app.contract ? (
                                                            <DocumentCard
                                                                label="Contract (Provided)"
                                                                document={app.contract}
                                                                onDownload={downloadFile}
                                                                onPreview={previewFile}
                                                                formatFileSize={formatFileSize}
                                                            />
                                                        ) : (
                                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                                                <span className="text-sm text-amber-700">No contract uploaded yet</span>
                                                            </div>
                                                        )}
                                                        {app.signedContract ? (
                                                            <DocumentCard
                                                                label="Signed Contract"
                                                                document={app.signedContract}
                                                                onDownload={downloadFile}
                                                                onPreview={previewFile}
                                                                formatFileSize={formatFileSize}
                                                            />
                                                        ) : (
                                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                                                                <Clock className="w-5 h-5 text-blue-500" />
                                                                <span className="text-sm text-blue-700">Waiting for signed contract</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contract Upload Modal */}
            {showContractModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600">
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Upload Contract</h2>
                                <p className="text-emerald-100 text-sm">{selectedApplication.fullName}</p>
                            </div>
                            <button
                                onClick={closeContractModal}
                                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center 
                                         hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Applicant Information</h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium text-gray-900">{selectedApplication.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium text-gray-900">{selectedApplication.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Position:</span>
                                        <span className="font-medium text-gray-900">{job?.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Department:</span>
                                        <span className="font-medium text-gray-900">{job?.department}</span>
                                    </div>
                                    {selectedApplication.contract && (
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <span className="text-gray-500">Current Contract:</span>
                                            <span className="font-medium text-emerald-600">
                                                Uploaded on {new Date(selectedApplication.contract.uploadedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contract File (PDF only, max 10MB)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleContractFileChange}
                                            className="hidden"
                                            id="contract-upload"
                                        />
                                        <label
                                            htmlFor="contract-upload"
                                            className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed 
                                                     border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 
                                                     transition-all cursor-pointer group"
                                        >
                                            <div className="text-center">
                                                {contractFile ? (
                                                    <>
                                                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                                        <p className="text-sm font-medium text-gray-900">{contractFile.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {(contractFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-12 h-12 text-gray-400 group-hover:text-emerald-500 mx-auto mb-2 transition-colors" />
                                                        <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-600 transition-colors">
                                                            Click to select contract file
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">PDF format, max 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {contractFile && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Ready to upload</p>
                                            <p className="text-blue-600">
                                                {selectedApplication.contract 
                                                    ? "This will replace the existing contract file."
                                                    : "This contract will be sent to the applicant for signing."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={closeContractModal}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl 
                                                 hover:bg-gray-50 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUploadContract}
                                        disabled={!contractFile || uploadingContract}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 
                                                 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium 
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingContract ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Upload Contract
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DocumentCard({
    label,
    document,
    onDownload,
    onPreview,
    formatFileSize,
}: {
    label: string;
    document: Document;
    onDownload: (fileId: string, filename: string) => void;
    onPreview: (fileId: string) => void;
    formatFileSize: (bytes: number) => string;
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all group">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 truncate">{document.filename}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(document.fileId); }}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Preview"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(document.fileId, document.filename); }}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}