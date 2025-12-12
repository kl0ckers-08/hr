"use client";

import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Briefcase, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

// TYPES
interface ApplicantTrend {
    month: string;
    applications: number;
    hired: number;
}

interface DepartmentData {
    dept: string;
    completed: number;
}

interface TaskCompletion {
    name: string;
    value: number;
    fill: string;
}

interface Activity {
    type: "application" | "interview" | "review" | "onboarding";
    title: string;
    description: string;
    timeAgo: string;
}

interface Stats {
    totalApplications: number;
    applicationChange: number;
    approvalRate: number;
    approvalChange: number;
    openPositions: number;
    openPositionsChange: number;
    avgResponseTime: number;
    responseTimeChange: number;
    activeJobs: number;
    interviewsScheduled: number;
    pendingReview: number;
    candidatesHired: number;
    overallCompletion: number;
    onboarded: number;
    avgTimeToHire: number;
}

// MAIN COMPONENT
export default function AdminDashboard() {
    const [applicantsTrend, setApplicantsTrend] = useState<ApplicantTrend[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
    const [completionData, setCompletionData] = useState<TaskCompletion[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalApplications: 0,
        applicationChange: 0,
        approvalRate: 0,
        approvalChange: 0,
        openPositions: 0,
        openPositionsChange: 0,
        avgResponseTime: 0,
        responseTimeChange: 0,
        activeJobs: 0,
        interviewsScheduled: 0,
        pendingReview: 0,
        candidatesHired: 0,
        overallCompletion: 0,
        onboarded: 0,
        avgTimeToHire: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [trendRes, deptRes, completionRes, activitiesRes, statsRes] = await Promise.all([
                fetch("/hr1/api/dashboard/applicantsTrend", { credentials: "include" }),
                fetch("/hr1/api/dashboard/departmentData", { credentials: "include" }),
                fetch("/hr1/api/dashboard/completionData", { credentials: "include" }),
                fetch("/hr1/api/dashboard/activities", { credentials: "include" }),
                fetch("/hr1/api/dashboard/stats", { credentials: "include" }),
            ]);

            if (!statsRes.ok) throw new Error("Failed to fetch stats");

            const [trendData, deptData, completionDataRes, activitiesData, statsData] = await Promise.all([
                trendRes.ok ? trendRes.json() : [],
                deptRes.ok ? deptRes.json() : [],
                completionRes.ok ? completionRes.json() : [],
                activitiesRes.ok ? activitiesRes.json() : [],
                statsRes.json(),
            ]);

            setApplicantsTrend(Array.isArray(trendData) ? trendData : []);
            setDepartmentData(Array.isArray(deptData) ? deptData : []);
            setCompletionData(Array.isArray(completionDataRes) ? completionDataRes : []);
            setActivities(Array.isArray(activitiesData) ? activitiesData : []);
            setStats(statsData);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data");
            setLoading(false);
        }
    };

    const StatCard = ({
        icon: Icon,
        label,
        value,
        change,
        bgColor,
    }: {
        icon: React.ComponentType<{ className: string }>;
        label: string;
        value: string;
        change: string;
        bgColor: string;
    }) => (
        <div className={`${bgColor} rounded-2xl p-6 text-gray-900 shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium opacity-80">{label}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-xs opacity-70">{change}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const activityColor = (type: Activity["type"]) => {
        switch (type) {
            case "application":
                return { bg: "bg-blue-50", border: "border-blue-500", icon: "text-blue-600" };
            case "interview":
                return { bg: "bg-green-50", border: "border-green-500", icon: "text-green-600" };
            case "review":
            case "onboarding":
                return { bg: "bg-yellow-50", border: "border-yellow-500", icon: "text-yellow-600" };
            default:
                return { bg: "bg-gray-50", border: "border-gray-500", icon: "text-gray-600" };
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">Track your recruitment and hiring metrics</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl 
                                 text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="ml-auto px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        label="Total Applications"
                        value={stats.totalApplications.toString()}
                        change={`↑ ${stats.applicationChange || 0}% from last month`}
                        bgColor="bg-purple-100"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Approval Rate"
                        value={`${stats.approvalRate}%`}
                        change={`↑ ${stats.approvalChange || 0}% from last month`}
                        bgColor="bg-blue-100"
                    />
                    <StatCard
                        icon={Briefcase}
                        label="Open Positions"
                        value={stats.openPositions.toString()}
                        change={`↓ ${stats.openPositionsChange || 0} positions filled`}
                        bgColor="bg-yellow-100"
                    />
                    <StatCard
                        icon={Clock}
                        label="Avg Response Time"
                        value={`${stats.avgResponseTime}h`}
                        change={`↓ ${stats.responseTimeChange || 0}h faster`}
                        bgColor="bg-pink-100"
                    />
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-green-100 rounded-2xl p-6 text-gray-900 shadow-sm hover:shadow-md transition-all">
                        <p className="text-sm font-medium opacity-80">Active Job Postings</p>
                        <p className="text-3xl font-bold mt-2">{stats.activeJobs}</p>
                        <p className="text-xs opacity-70 mt-3">See all jobs</p>
                    </div>
                    <div className="bg-purple-100 rounded-2xl p-6 text-gray-900 shadow-sm hover:shadow-md transition-all">
                        <p className="text-sm font-medium opacity-80">Interviews Scheduled</p>
                        <p className="text-3xl font-bold mt-2">{stats.interviewsScheduled}</p>
                        <p className="text-xs opacity-70 mt-3">View list</p>
                    </div>
                    <div className="bg-red-100 rounded-2xl p-6 text-gray-900 shadow-sm hover:shadow-md transition-all">
                        <p className="text-sm font-medium opacity-80">Pending Review</p>
                        <p className="text-3xl font-bold mt-2">{stats.pendingReview}</p>
                        <p className="text-xs opacity-70 mt-3">Review now</p>
                    </div>
                    <div className="bg-emerald-100 rounded-2xl p-6 text-gray-900 shadow-sm hover:shadow-md transition-all">
                        <p className="text-sm font-medium opacity-80">Candidates Hired</p>
                        <p className="text-3xl font-bold mt-2">{stats.candidatesHired}</p>
                        <p className="text-xs opacity-70 mt-3">View details</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications & Hiring Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={applicantsTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={2} />
                                <Line type="monotone" dataKey="hired" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Completion Rate</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dept" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {completionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                        {activities.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No recent activities</p>
                            </div>
                        ) : (
                            activities.map((a, i) => {
                                const color = activityColor(a.type);
                                return (
                                    <div key={i} className={`${color.bg} rounded-xl p-4 flex items-start gap-3 border-l-4 ${color.border}`}>
                                        {a.type === "review" || a.type === "onboarding" ? (
                                            <AlertCircle className={`w-5 h-5 ${color.icon} mt-1 flex-shrink-0`} />
                                        ) : (
                                            <CheckCircle className={`w-5 h-5 ${color.icon} mt-1 flex-shrink-0`} />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{a.title}</p>
                                            <p className="text-sm text-gray-600">{a.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{a.timeAgo}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <p className="text-sm font-medium opacity-80">Overall Completion</p>
                        <p className="text-4xl font-bold mt-4">{stats.overallCompletion}%</p>
                        <p className="text-xs opacity-70 mt-3">All recruitment processes</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <p className="text-sm font-medium opacity-80">Candidates Onboarded</p>
                        <p className="text-4xl font-bold mt-4">{stats.onboarded}%</p>
                        <p className="text-xs opacity-70 mt-3">Successfully onboarded this quarter</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <p className="text-sm font-medium opacity-80">Avg Time to Hire</p>
                        <p className="text-4xl font-bold mt-4">{stats.avgTimeToHire}d</p>
                        <p className="text-xs opacity-70 mt-3">Down from last quarter</p>
                    </div>
                </div>
            </div>
        </div>
    );
}