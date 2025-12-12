"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, Building2, CheckCircle2, Clock, AlertCircle, CheckCheck, Loader2, X, ChevronRight, ChevronLeft, Upload, File } from "lucide-react";
import { useRouter } from "next/navigation";

interface Document {
    fileId: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    status?: "verified" | "pending" | "rejected";
}

interface Application {
    _id: string;
    jobId: string;
    jobTitle: string;
    status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
    appliedAt: string;
    resume: Document;
    applicationLetter: Document;
    supportingDocs: Document[];
    contract?: Document;
    signedContract?: Document;
    validId?: Document;
    portfolio?: Document;
    certificates?: Document[];
    requestedDocsSubmitted?: boolean;
}

interface TimelineEvent {
    title: string;
    description: string;
    date: string;
    status: "completed" | "in-progress" | "pending";
}

interface Question {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: string;
}

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    onSubmitSuccess: (applicationId: string) => void;
}

interface RequestedDocsModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    onSubmitSuccess: () => void;
}

function RequestedDocsModal({ isOpen, onClose, applicationId, onSubmitSuccess }: RequestedDocsModalProps) {
    const [validId, setValidId] = useState<File | null>(null);
    const [portfolio, setPortfolio] = useState<File | null>(null);
    const [certificates, setCertificates] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setCertificates(files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validId || !portfolio || certificates.length === 0) {
            setError("Please attach all required documents");
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("applicationId", applicationId);
            formData.append("validId", validId);
            formData.append("portfolio", portfolio);
            certificates.forEach((cert) => {
                formData.append("certificates", cert);
            });

            const res = await fetch("/hr1/api/applications/requested-docs", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to upload documents");
            }

            alert("Documents submitted successfully!");
            onSubmitSuccess();
            onClose();
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Failed to upload documents");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setValidId(null);
        setPortfolio(null);
        setCertificates([]);
        setError(null);
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Submit Requested Documents</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Please provide the following documents to proceed with your application
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valid ID <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setValidId(e.target.files?.[0] || null)}
                                className="w-full"
                                required
                            />
                            {validId && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <File className="w-4 h-4" />
                                    {validId.name}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Accepted: Images (JPG, PNG) or PDF
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Portfolio <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setPortfolio(e.target.files?.[0] || null)}
                                className="w-full"
                                required
                            />
                            {portfolio && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <File className="w-4 h-4" />
                                    {portfolio.name}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Accepted: PDF, DOC, DOCX
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificates <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                onChange={handleCertificateChange}
                                className="w-full"
                                required
                            />
                            {certificates.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {certificates.map((cert, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                            <File className="w-4 h-4" />
                                            {cert.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            You can select multiple files. Accepted: Images (JPG, PNG) or PDF
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Submit Documents
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EvaluationModal({ isOpen, onClose, applicationId, onSubmitSuccess }: EvaluationModalProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchQuestions();
        } else {
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setLoading(true);
            setSubmitting(false);
            setError(null);
        }
    }, [isOpen]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await fetch("/hr1/api/evaluation/questions", {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch questions");

            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            setError("Failed to load evaluation questions");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const unanswered = questions.filter(q => !answers[q._id]);
        if (unanswered.length > 0) {
            alert(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
            setSubmitting(false);
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch("/hr1/api/evaluation/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    applicationId,
                    questions,
                    answers,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit evaluation");

            const data = await res.json();
            alert(`Evaluation submitted! Your score: ${data.score}/${questions.length}`);

            onSubmitSuccess(applicationId);
            onClose();
        } catch (err) {
            setError("Failed to submit evaluation");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Employee Evaluation</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                            <p className="text-gray-500 mt-2">Loading questions...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No evaluation questions available yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    {currentQuestion?.question}
                                </h3>

                                <div className="space-y-3">
                                    {currentQuestion?.options.map((option, index) => (
                                        <label
                                            key={index}
                                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                                answers[currentQuestion._id] === option
                                                    ? "border-indigo-600 bg-indigo-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion._id}`}
                                                value={option}
                                                checked={answers[currentQuestion._id] === option}
                                                onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                                                className="w-5 h-5 text-indigo-600"
                                            />
                                            <span className="ml-3 text-gray-900">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6 flex flex-wrap gap-2">
                                {questions.map((q, idx) => (
                                    <div
                                        key={q._id}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            answers[q._id]
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        {idx + 1}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Evaluation
                                                <CheckCircle2 className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Next
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

interface DocumentCardProps {
    document: Document;
    label: string;
    onDownload: (fileId: string, filename: string) => void;
    isDownloading: boolean;
    formatFileSize: (bytes: number) => string;
}

function DocumentCard({ document, label, onDownload, isDownloading, formatFileSize }: DocumentCardProps) {
    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/hr1/api/files/${document.fileId}?inline=1`, "_blank");
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{label}</p>
                        <p className="text-sm text-gray-600 truncate">{document.filename}</p>
                        <p className="text-xs text-gray-500">
                            {formatFileSize(document.size)} • Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="ml-3 flex gap-2 items-center">
                    <button
                        onClick={handlePreview}
                        className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                        aria-label={`Preview ${document.filename}`}
                        type="button"
                    >
                        Preview
                    </button>

                    <button
                        onClick={() => onDownload(document.fileId, document.filename)}
                        disabled={isDownloading}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        aria-label={`Download ${document.filename}`}
                    >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showRequestedDocsModal, setShowRequestedDocsModal] = useState(false);
    const [evaluationSubmittedMap, setEvaluationSubmittedMap] = useState<Record<string, boolean>>({});
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [uploadingContractForApp, setUploadingContractForApp] = useState<string | null>(null);

    const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        pending: { bg: "bg-blue-100", text: "text-blue-700", icon: <Clock className="w-5 h-5" /> },
        reviewed: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Eye className="w-5 h-5" /> },
        shortlisted: { bg: "bg-purple-100", text: "text-purple-700", icon: <CheckCircle2 className="w-5 h-5" /> },
        rejected: { bg: "bg-red-100", text: "text-red-700", icon: <AlertCircle className="w-5 h-5" /> },
        hired: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCheck className="w-5 h-5" /> },
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (selectedApplicationId) {
            checkEvaluationStatus(selectedApplicationId);
        }
    }, [selectedApplicationId]);

    const checkEvaluationStatus = async (appId: string) => {
        try {
            const res = await fetch(`/hr1/api/evaluation/status?applicationId=${appId}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to check evaluation status");

            const data = await res.json();
            setEvaluationSubmittedMap(prev => ({
                ...prev,
                [appId]: data.submitted,
            }));
        } catch (error) {
            console.error("Error checking evaluation status:", error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await fetch("/hr1/api/applications", {
                credentials: "include",
            });

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/hr1/");
                    return;
                }
                throw new Error("Failed to fetch applications");
            }

            const data = await res.json();
            setApplications(data.applications || []);
            if (!selectedApplicationId && data.applications && data.applications.length > 0) {
                setSelectedApplicationId(data.applications[0]._id);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load applications";
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (fileId: string, filename: string) => {
        try {
            setDownloadingFileId(fileId);
            const response = await fetch(`/hr1/api/files/${fileId}`, {
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("Failed to download file. Please try again.");
        } finally {
            setDownloadingFileId(null);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getStatusCounts = () => {
        return {
            total: applications.length,
            pending: applications.filter((a) => a.status === "pending").length,
            reviewed: applications.filter((a) => a.status === "reviewed").length,
            shortlisted: applications.filter((a) => a.status === "shortlisted").length,
            hired: applications.filter((a) => a.status === "hired").length,
        };
    };

    const getTimelineEvents = (app: Application): TimelineEvent[] => {
        const allEvents: TimelineEvent[] = [
            {
                title: "Application Submitted",
                description: "Your application has been received",
                date: new Date(app.appliedAt).toLocaleDateString(),
                status: "completed",
            },
            {
                title: "Under Review",
                description: "We are reviewing your application",
                date: app.status === "reviewed" || app.status === "shortlisted" || app.status === "hired" ? "Completed" : app.status === "pending" ? "Waiting" : "In progress",
                status: app.status === "reviewed" || app.status === "shortlisted" || app.status === "hired" ? "completed" : app.status === "pending" ? "pending" : "in-progress",
            },
            {
                title: "Interview Scheduled",
                description: app.status === "shortlisted" || app.status === "hired" ? "Interview scheduled" : "Pending shortlist",
                date: app.status === "shortlisted" ? "Scheduled" : app.status === "hired" ? "Completed" : "Pending",
                status: app.status === "shortlisted" ? "in-progress" : app.status === "hired" ? "completed" : "pending",
            },
            {
                title: "Final Decision",
                description: app.status === "hired" ? "Congratulations!" : "Waiting for decision",
                date: app.status === "hired" ? "Completed" : "Pending",
                status: app.status === "hired" ? "completed" : "pending",
            },
        ];

        return allEvents;
    };

    const handleEvaluationClose = () => {
        setShowEvaluationModal(false);
        if (selectedApplicationId) {
            checkEvaluationStatus(selectedApplicationId);
        }
    };

    const handleEvaluationSubmitSuccess = (appId: string) => {
        setEvaluationSubmittedMap(prev => ({
            ...prev,
            [appId]: true,
        }));
    };

    const handleRequestedDocsSubmitSuccess = () => {
        fetchApplications();
    };

    const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setContractFile(file);
    };

    const handleContractSubmit = async (appId: string) => {
        if (!contractFile) {
            alert("Please choose a file to upload.");
            return;
        }

        try {
            setUploadingContractForApp(appId);
            const fd = new FormData();
            fd.append("applicationId", appId);
            fd.append("file", contractFile);

            const res = await fetch("/hr1/api/contract/upload", {
                method: "POST",
                credentials: "include",
                body: fd,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to upload signed contract");
            }

            const data = await res.json();
            alert("Signed contract uploaded successfully.");

            await fetchApplications();
            setContractFile(null);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload signed contract. Please try again.");
        } finally {
            setUploadingContractForApp(null);
        }
    };

    const counts = getStatusCounts();
    const selectedApp = applications.find((a) => a._id === selectedApplicationId) || applications[0];
    const timelineEvents = selectedApp ? getTimelineEvents(selectedApp) : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                        <p className="text-gray-500 mt-2">Loading your applications...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-h-screen overflow-y-scroll bg-gray-50 p-6">
            <div className="w-full mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                    <p className="text-gray-600 mt-2">Track the status of your job applications</p>
                </div>

                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Applications</p>
                                <p className="text-2xl font-bold text-blue-700">{counts.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3">
                            <Eye className="w-6 h-6 text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">Under Review</p>
                                <p className="text-2xl font-bold text-yellow-700">{counts.reviewed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Shortlisted</p>
                                <p className="text-2xl font-bold text-purple-700">{counts.shortlisted}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                            <CheckCheck className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Hired</p>
                                <p className="text-2xl font-bold text-green-700">{counts.hired}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center">
                        <p className="text-gray-500 text-lg">No applications yet. Start applying for jobs!</p>
                        <button
                            onClick={() => router.push("/employee/job-postings")}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 space-y-3">
                            {applications.map((app) => (
                                <div
                                    key={app._id}
                                    onClick={() => setSelectedApplicationId(app._id)}
                                    className={`p-4 rounded-lg cursor-pointer transition ${
                                        selectedApplicationId === app._id || (!selectedApplicationId && app._id === applications[0]._id)
                                            ? "bg-indigo-50 border-2 border-indigo-500"
                                            : "bg-white border border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                                    <p className="text-xs text-gray-400 mt-1">ID: {app._id.substring(0, 8)}...</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status].bg} ${statusColors[app.status].text}`}>
                                            {statusColors[app.status].icon}
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedApp && (
                            <div className="lg:col-span-3 space-y-6 max-h-screen">
                                <div className="bg-white rounded-lg p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{selectedApp.jobTitle}</h2>
                                            <p className="text-xs text-gray-400 mt-1">Application ID: {selectedApp._id}</p>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Applied {new Date(selectedApp.appliedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[selectedApp.status].bg} ${statusColors[selectedApp.status].text}`}>
                                            {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Application Progress</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${
                                                        selectedApp.status === "pending"
                                                            ? 25
                                                            : selectedApp.status === "reviewed"
                                                            ? 50
                                                            : selectedApp.status === "shortlisted"
                                                            ? 75
                                                            : selectedApp.status === "hired"
                                                            ? 100
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Application Timeline</h3>
                                    <div className="space-y-4">
                                        {timelineEvents.map((event, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                            event.status === "completed"
                                                                ? "bg-indigo-600"
                                                                : event.status === "in-progress"
                                                                ? "bg-yellow-400"
                                                                : "bg-gray-300"
                                                        }`}
                                                    >
                                                        {event.status === "completed" && <CheckCircle2 className="w-5 h-5 text-white" />}
                                                    </div>
                                                    {index < timelineEvents.length - 1 && <div className="w-1 h-8 bg-gray-200 mt-1" />}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-gray-900">{event.title}</p>
                                                    <p className="text-sm text-gray-600">{event.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedApp.status === "shortlisted" && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                            <div className="flex gap-3 mb-4">
                                                <Eye className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-yellow-900">Additional Documents Required</p>
                                                    <p className="text-sm text-yellow-800">Please submit the requested documents to proceed with your application.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowRequestedDocsModal(true)}
                                                disabled={selectedApp.requestedDocsSubmitted}
                                                className={`w-full px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                                    selectedApp.requestedDocsSubmitted
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                }`}
                                            >
                                                <Upload className="w-5 h-5" />
                                                {selectedApp.requestedDocsSubmitted ? "Documents Submitted" : "Submit Requested Documents"}
                                            </button>
                                        </div>
                                    )}

                                    {selectedApp.status === "hired" && (
                                        <>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                                <div className="flex gap-3 mb-4">
                                                    <CheckCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-green-900">Hired!</p>
                                                        <p className="text-sm text-green-800">Congratulations! You've been hired. Welcome to the team!</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!evaluationSubmittedMap[selectedApp._id]) {
                                                            setShowEvaluationModal(true);
                                                        }
                                                    }}
                                                    disabled={evaluationSubmittedMap[selectedApp._id] || false}
                                                    className={`w-full px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                                        evaluationSubmittedMap[selectedApp._id]
                                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    {evaluationSubmittedMap[selectedApp._id] ? "Evaluation Submitted" : "Start Evaluation"}
                                                </button>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4">
                                                <h4 className="text-lg font-semibold mb-4">Contract</h4>

                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">Provided Contract</p>
                                                    {selectedApp.contract ? (
                                                        <div className="flex items-center justify-between border p-3 rounded-md">
                                                            <div>
                                                                <p className="font-medium text-gray-900 truncate">{selectedApp.contract.filename}</p>
                                                                <p className="text-xs text-gray-500">{new Date(selectedApp.contract.uploadedAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => downloadFile(selectedApp.contract!.fileId, selectedApp.contract!.filename)}
                                                                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                                                                >
                                                                    Download Contract
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">No contract file provided yet.</div>
                                                    )}
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">Signed Contract</p>

                                                    {selectedApp.signedContract ? (
                                                        <div className="flex items-center justify-between border p-3 rounded-md mb-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900 truncate">{selectedApp.signedContract.filename}</p>
                                                                <p className="text-xs text-gray-500">Uploaded {new Date(selectedApp.signedContract.uploadedAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => downloadFile(selectedApp.signedContract!.fileId, selectedApp.signedContract!.filename)}
                                                                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                                                                >
                                                                    Download Signed Contract
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 mb-3">You haven't uploaded a signed contract yet.</div>
                                                    )}

                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,image/*"
                                                            onChange={handleContractFileChange}
                                                            className="text-sm"
                                                            key={uploadingContractForApp ? `${selectedApp._id}-uploading` : "contract-input"}
                                                        />
                                                        <button
                                                            onClick={() => handleContractSubmit(selectedApp._id)}
                                                            disabled={uploadingContractForApp === selectedApp._id || !contractFile}
                                                            className={`px-4 py-2 rounded-md font-medium ${
                                                                uploadingContractForApp === selectedApp._id
                                                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                            }`}
                                                        >
                                                            {uploadingContractForApp === selectedApp._id ? (
                                                                <span className="flex items-center gap-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                                                </span>
                                                            ) : selectedApp.signedContract ? (
                                                                "Resubmit Signed Contract"
                                                            ) : (
                                                                "Submit Signed Contract"
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Allowed: PDF, DOC, DOCX, images. Max file size enforced by server.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="bg-white rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                                    <div className="space-y-3">
                                        <DocumentCard
                                            document={selectedApp.resume}
                                            label="Resume"
                                            onDownload={downloadFile}
                                            isDownloading={downloadingFileId === selectedApp.resume.fileId}
                                            formatFileSize={formatFileSize}
                                        />

                                        <DocumentCard
                                            document={selectedApp.applicationLetter}
                                            label="Application Letter"
                                            onDownload={downloadFile}
                                            isDownloading={downloadingFileId === selectedApp.applicationLetter.fileId}
                                            formatFileSize={formatFileSize}
                                        />

                                        {selectedApp.supportingDocs.map((doc, index) => (
                                            <DocumentCard
                                                key={doc.fileId}
                                                document={doc}
                                                label={`Supporting Document ${index + 1}`}
                                                onDownload={downloadFile}
                                                isDownloading={downloadingFileId === doc.fileId}
                                                formatFileSize={formatFileSize}
                                            />
                                        ))}

                                        {selectedApp.validId && (
                                            <DocumentCard
                                                document={selectedApp.validId}
                                                label="Valid ID"
                                                onDownload={downloadFile}
                                                isDownloading={downloadingFileId === selectedApp.validId.fileId}
                                                formatFileSize={formatFileSize}
                                            />
                                        )}

                                        {selectedApp.portfolio && (
                                            <DocumentCard
                                                document={selectedApp.portfolio}
                                                label="Portfolio"
                                                onDownload={downloadFile}
                                                isDownloading={downloadingFileId === selectedApp.portfolio.fileId}
                                                formatFileSize={formatFileSize}
                                            />
                                        )}

                                        {selectedApp.certificates && selectedApp.certificates.map((doc, index) => (
                                            <DocumentCard
                                                key={doc.fileId}
                                                document={doc}
                                                label={`Certificate ${index + 1}`}
                                                onDownload={downloadFile}
                                                isDownloading={downloadingFileId === doc.fileId}
                                                formatFileSize={formatFileSize}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {selectedApp.status === "shortlisted" && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-green-900">Shortlisted!</p>
                                                <p className="text-sm text-green-800">Congratulations! You've been shortlisted. You will receive further instructions via email.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <EvaluationModal
                isOpen={showEvaluationModal}
                onClose={handleEvaluationClose}
                applicationId={selectedApp?._id || ""}
                onSubmitSuccess={(id) => {
                    handleEvaluationSubmitSuccess(id);
                    handleEvaluationClose();
                }}
            />

            <RequestedDocsModal
                isOpen={showRequestedDocsModal}
                onClose={() => setShowRequestedDocsModal(false)}
                applicationId={selectedApp?._id || ""}
                onSubmitSuccess={handleRequestedDocsSubmitSuccess}
            />
        </div>
    );
}