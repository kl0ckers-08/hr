"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Loader2,
    UserPlus,
    ArrowRight,
    CheckCircle,
    Clock,
    FileText,
    Building2,
    X,
    User,
    Mail,
    Briefcase,
    Send,
    AlertCircle,
} from "lucide-react";

type HiredApplicant = {
    _id: string;
    fullName: string;
    email: string;
    jobTitle: string;
    department?: string;
    hiredDate?: string;
    onboardingStatus: "pending" | "in_progress" | "completed";
    status?: string;
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
};

export default function OnboardingPage() {
    const [hiredApplicants, setHiredApplicants] = useState<HiredApplicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"onboarding" | "transfer">("onboarding");
    
    // Modal State
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<HiredApplicant | null>(null);
    const [transferring, setTransferring] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchHiredApplicants();
    }, []);

    const fetchHiredApplicants = async () => {
        try {
            setLoading(true);
            const res = await fetch("/hr1/api/admin/onboarding", {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setHiredApplicants(data.applicants || []);
            }
        } catch (err) {
            console.error("Failed to fetch hired applicants:", err);
        } finally {
            setLoading(false);
        }
    };

    const openManageModal = (applicant: HiredApplicant) => {
        setSelectedApplicant(applicant);
        setShowManageModal(true);
    };

    const closeManageModal = () => {
        setShowManageModal(false);
        setSelectedApplicant(null);
    };

    const handleTransferToHR2 = async () => {
        if (!selectedApplicant) return;

        if (!confirm(`Transfer ${selectedApplicant.fullName} to HR2 system as an employee?`)) {
            return;
        }

        try {
            setTransferring(true);
            const res = await fetch("/hr1/api/admin/onboarding/transfer-to-hr2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    applicantId: selectedApplicant._id,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to transfer");
            }

            alert("Successfully transferred to HR2! User role changed to employee2.");
            closeManageModal();
            fetchHiredApplicants(); // Refresh list
        } catch (err) {
            console.error("Error transferring:", err);
            alert(err instanceof Error ? err.message : "Failed to transfer to HR2");
        } finally {
            setTransferring(false);
        }
    };

    const updateOnboardingStatus = async (status: "pending" | "in_progress" | "completed") => {
        if (!selectedApplicant) return;

        try {
            setUpdatingStatus(true);
            const res = await fetch("/hr1/api/admin/onboarding/update-status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    applicantId: selectedApplicant._id,
                    onboardingStatus: status,
                }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            // Update local state
            setSelectedApplicant({ ...selectedApplicant, onboardingStatus: status });
            fetchHiredApplicants();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update onboarding status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const filteredApplicants = hiredApplicants.filter((app) => {
        const q = search.toLowerCase();
        return (
            app.fullName.toLowerCase().includes(q) ||
            app.email.toLowerCase().includes(q) ||
            app.jobTitle.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Onboarding & Transfer
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        Manage new hire onboarding and employee transfers
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("onboarding")}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                                activeTab === "onboarding"
                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <UserPlus className="w-5 h-5" />
                            Onboarding
                        </button>
                        <button
                            onClick={() => setActiveTab("transfer")}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                                activeTab === "transfer"
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <ArrowRight className="w-5 h-5" />
                            Transfer
                        </button>
                    </div>
                </div>

                {activeTab === "onboarding" ? (
                    <>
                        {/* Search */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search new hires..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                             focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white
                                             outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform">
                                        <Clock className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {hiredApplicants.filter((a) => a.onboardingStatus === "pending").length}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">Pending</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                        <FileText className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {hiredApplicants.filter((a) => a.onboardingStatus === "in_progress").length}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">In Progress</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
                                        <CheckCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {hiredApplicants.filter((a) => a.onboardingStatus === "completed").length}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        {loading ? (
                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
                                    <UserPlus className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                            </div>
                        ) : filteredApplicants.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No New Hires</h3>
                                <p className="text-gray-500">No applicants pending onboarding</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Hired applicants will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredApplicants.map((applicant) => (
                                    <div
                                        key={applicant._id}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                    {applicant.fullName
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        {applicant.fullName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <Briefcase className="w-4 h-4" />
                                                        {applicant.jobTitle}
                                                        {applicant.department && (
                                                            <>
                                                                <span>•</span>
                                                                <Building2 className="w-4 h-4" />
                                                                {applicant.department}
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                                        statusColors[applicant.onboardingStatus]
                                                    }`}
                                                >
                                                    {applicant.onboardingStatus.replace("_", " ").toUpperCase()}
                                                </span>
                                                <button
                                                    onClick={() => openManageModal(applicant)}
                                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl 
                                                             hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-medium shadow-md"
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Transfer Tab */
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Transfer Management</h3>
                        <p className="text-gray-500">
                            Transfer requests and interdepartmental moves will be managed here
                        </p>
                        <p className="text-sm text-gray-400 mt-4">Coming soon...</p>
                    </div>
                )}
            </div>

            {/* Manage Modal */}
            {showManageModal && selectedApplicant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-600">
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Manage Onboarding</h2>
                                <p className="text-purple-100 text-sm">{selectedApplicant.fullName}</p>
                            </div>
                            <button
                                onClick={closeManageModal}
                                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center 
                                         hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Applicant Info */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-600" />
                                    Applicant Information
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                            {selectedApplicant.fullName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-lg">{selectedApplicant.fullName}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <Mail className="w-4 h-4" />
                                                {selectedApplicant.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Position</p>
                                            <p className="font-medium text-gray-900">{selectedApplicant.jobTitle}</p>
                                        </div>
                                        {selectedApplicant.department && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Department</p>
                                                <p className="font-medium text-gray-900">{selectedApplicant.department}</p>
                                            </div>
                                        )}
                                        {selectedApplicant.hiredDate && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Hired Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(selectedApplicant.hiredDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Status</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                statusColors[selectedApplicant.onboardingStatus]
                                            }`}>
                                                {selectedApplicant.onboardingStatus.replace("_", " ").toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Onboarding Status Update */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Update Onboarding Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(["pending", "in_progress", "completed"] as const).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOnboardingStatus(status)}
                                            disabled={updatingStatus || selectedApplicant.onboardingStatus === status}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                selectedApplicant.onboardingStatus === status
                                                    ? `${statusColors[status]} ring-2 ring-offset-1`
                                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transfer to HR2 Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-emerald-600" />
                                    Transfer to HR2 System
                                </h3>
                                
                                {selectedApplicant.status === "hired" ? (
                                    <>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-emerald-900 mb-1">Ready for Transfer</p>
                                                    <p className="text-emerald-700">
                                                        This applicant is hired and ready to be transferred to the HR2 system. 
                                                        Their role will be changed to <strong>employee2</strong> and they will gain access to the employee portal.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleTransferToHR2}
                                            disabled={transferring}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 
                                                     text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium shadow-md
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {transferring ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                                                    Transferring...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Transfer to HR2 System
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-medium mb-1">Transfer Not Available</p>
                                            <p>
                                                Only applicants with <strong>hired</strong> status can be transferred to HR2. 
                                                Current status: <strong>{selectedApplicant.status || "unknown"}</strong>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={closeManageModal}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl 
                                         hover:bg-gray-100 transition-all font-medium"
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