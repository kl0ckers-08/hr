"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    Users,
    Briefcase,
    TrendingUp,
    Calendar,
    Download,
    Loader2,
    FileText,
} from "lucide-react";

type ReportStats = {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    reviewingApplications: number;
    shortlistedApplications: number;
    hiredCount: number;
    rejectedCount: number;
    applicationsByMonth: { month: string; count: number }[];
    topDepartments: { department: string; count: number }[];
};

export default function ReportsPage() {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("all");

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/hr1/api/admin/reports?range=${dateRange}`, {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        alert("Export feature coming soon!");
    };

    if (loading) {
        return (
            <div className="w-full bg-gray-50 p-6 min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading reports...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 p-6 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="text-gray-600 mt-1">
                            Recruitment analytics and insights
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                                       focus:ring-purple-600 focus:border-transparent outline-none"
                        >
                            <option value="all">All Time</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="quarter">Last 90 Days</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white 
                                       rounded-lg hover:bg-purple-700 transition"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.totalJobs || 0}
                                </p>
                                <p className="text-sm text-gray-500">Total Jobs</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.totalApplications || 0}
                                </p>
                                <p className="text-sm text-gray-500">Applications</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.hiredCount || 0}
                                </p>
                                <p className="text-sm text-gray-500">Hired</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.pendingApplications || 0}
                                </p>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Applications by Month */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            Applications by Month
                        </h3>
                        {stats?.applicationsByMonth && stats.applicationsByMonth.length > 0 ? (
                            <div className="space-y-3">
                                {stats.applicationsByMonth.map((item) => (
                                    <div key={item.month} className="flex items-center gap-3">
                                        <span className="w-20 text-sm text-gray-600">{item.month}</span>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full"
                                                style={{
                                                    width: `${Math.min(100, (item.count / Math.max(...stats.applicationsByMonth.map(a => a.count))) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-8">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No data available</p>
                        )}
                    </div>

                    {/* Top Departments */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Top Hiring Departments
                        </h3>
                        {stats?.topDepartments && stats.topDepartments.length > 0 ? (
                            <div className="space-y-3">
                                {stats.topDepartments.map((item, idx) => (
                                    <div key={item.department} className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 text-sm text-gray-700">
                                            {item.department}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {item.count} jobs
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No data available</p>
                        )}
                    </div>
                </div>

                {/* Hiring Funnel */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Hiring Funnel</h3>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.totalApplications || 0}
                            </p>
                            <p className="text-sm text-gray-500">Applied</p>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div className="flex-1 text-center">
                            <p className="text-3xl font-bold text-blue-600">
                                {stats?.reviewingApplications || 0}
                            </p>
                            <p className="text-sm text-gray-500">Reviewing</p>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div className="flex-1 text-center">
                            <p className="text-3xl font-bold text-purple-600">
                                {stats?.shortlistedApplications || 0}
                            </p>
                            <p className="text-sm text-gray-500">Shortlisted</p>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div className="flex-1 text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {stats?.hiredCount || 0}
                            </p>
                            <p className="text-sm text-gray-500">Hired</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
