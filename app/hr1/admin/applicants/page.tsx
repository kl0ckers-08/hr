"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Loader2,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
} from "lucide-react";

type Application = {
    _id: string;
    jobId: string;
    jobTitle: string;
    fullName: string;
    email: string;
    phone?: string;
    status: string;
    createdAt: string;
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    reviewing: "bg-blue-100 text-blue-700",
    shortlisted: "bg-purple-100 text-purple-700",
    hired: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    reviewing: <Eye className="w-4 h-4" />,
    shortlisted: <FileText className="w-4 h-4" />,
    hired: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
};

export default function ApplicantsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/hr1/api/admin/applicants", {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to load applications");
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            app.fullName.toLowerCase().includes(search.toLowerCase()) ||
            app.email.toLowerCase().includes(search.toLowerCase()) ||
            app.jobTitle.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="w-full bg-gray-50 p-6 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage all job applications
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or job title..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                                       focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-500 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                                       focus:ring-purple-600 focus:border-transparent outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center gap-2 text-gray-600 py-12">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading applications...
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="p-8 bg-white border border-gray-200 rounded-lg text-center text-gray-600">
                        No applications found.
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Applicant
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Job Position
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Applied
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredApplications.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {app.fullName}
                                                </p>
                                                <p className="text-sm text-gray-500">{app.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{app.jobTitle}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[app.status] || "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {statusIcons[app.status]}
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() =>
                                                    router.push(`/hr1/admin/evaluation/${app.jobId}`)
                                                }
                                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {["pending", "reviewing", "shortlisted", "hired", "rejected"].map(
                        (status) => {
                            const count = applications.filter(
                                (a) => a.status === status
                            ).length;
                            return (
                                <div
                                    key={status}
                                    className="bg-white border border-gray-200 rounded-lg p-4 text-center"
                                >
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    <p className="text-sm text-gray-500 capitalize">{status}</p>
                                </div>
                            );
                        }
                    )}
                </div>
            </div>
        </div>
    );
}
