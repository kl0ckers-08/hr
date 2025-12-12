"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export interface Job {
    _id: string;
    title: string;
    department: string;
    employmentType: string;
    location: string;
    deadline: string;
    views?: number;
    applicants?: number;
    status?: string;
    description?: string;
    qualifications?: string[];
    requirements?: string[];
}

export default function EmployeeJobPostings() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"All" | "IT" | "CS" | "General">("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchJobs();
        fetchAppliedJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await axios.get<Job[]>("/hr1/api/jobs", {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            setJobs(res.data || []);
        } catch (err) {
            console.error("Failed fetching jobs:", err);
            setError("Failed to load job postings.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAppliedJobs = async () => {
        try {
            const res = await fetch("/hr1/api/applications?limit=200", {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            const ids = (data.applications || []).map((a: any) => a.jobId).filter(Boolean);
            setAppliedJobIds(new Set(ids));
        } catch (err) {
            // non-blocking; user can still view jobs
            console.warn("Failed to load applied jobs", err);
        }
    };

    const deptMatches = (job: Job): boolean => {
        if (filter === "All") return true;
        return job.department?.toLowerCase().includes(filter.toLowerCase()) ?? false;
    };

    const filtered = jobs.filter((job) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q ||
            job.title?.toLowerCase().includes(q) ||
            job.department?.toLowerCase().includes(q) ||
            job.location?.toLowerCase().includes(q);
        return matchesSearch && deptMatches(job);
    });

    const formatDate = (iso?: string): string => {
        if (!iso) return "-";
        try {
            return new Date(iso).toLocaleDateString();
        } catch {
            return iso;
        }
    };

    const isJobActive = (job: Job): boolean => {
        return job.status?.toLowerCase() === "active";
    };

    return (
        <div className="w-full bg-gray-50 p-6 max-h-screen overflow-y-scroll">
            <div className="mx-auto w-full ">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Job Postings</h1>
                    <p className="text-gray-600 mt-2">Browse and apply for available positions</p>
                </header>

                {/* Search & Filters */}
                <div className="mb-6 bg-white shadow rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search job postings..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-2xl px-4 py-2 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                {filtered.length} results
                            </span>
                        </div>

                        {/* Department Filters */}
                        <div className="flex gap-2 flex-wrap">
                            {(["All", "IT", "CS", "General"] as const).map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setFilter(dept)}
                                    className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                                        filter === dept
                                            ? "bg-[#5955b3] text-white hover:bg-[#504c9f]"
                                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg text-gray-600 text-center">
                        Loading job postings...
                    </div>
                )}

                {/* Job Listings */}
                <div className="space-y-4">
                    {filtered.length === 0 && !loading ? (
                        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No job postings found matching your criteria.</p>
                        </div>
                    ) : (
                        filtered.map((job) => {
                            const jobActive = isJobActive(job);
                            const alreadyApplied = appliedJobIds.has(job._id);
                            
                            return (
                                <div
                                    key={job._id}
                                    className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition ${
                                        !jobActive ? "opacity-60" : ""
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                        {/* Job Details - Conditionally Clickable */}
                                        {jobActive && !alreadyApplied ? (
                                            <Link
                                                href={`/hr1/employee/job-postings/${job._id}`}
                                                className="flex-1 group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Title & Badges */}
                                                        <div className="flex items-center gap-3 flex-wrap mb-3">
                                                            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                                                                {job.title}
                                                            </h2>
                                                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                                                                {job.employmentType ?? "Full-time"}
                                                            </span>
                                                            {job.status && (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    jobActive 
                                                                        ? "bg-green-100 text-green-700" 
                                                                        : "bg-red-100 text-red-700"
                                                                }`}>
                                                                    {job.status}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Department & Location */}
                                                        <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                                                            <span className="flex items-center gap-1">🏢 {job.department}</span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="flex items-center gap-1">📍 {job.location}</span>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-gray-600 text-sm leading-relaxed">
                                                            {job.description
                                                                ? job.description.length > 220
                                                                    ? `${job.description.slice(0, 220)}...`
                                                                    : job.description
                                                                : "No description provided."}
                                                        </p>

                                                        {/* Qualifications */}
                                                        {job.qualifications && job.qualifications.length > 0 && (
                                                            <div className="flex gap-2 mt-4 flex-wrap">
                                                                {job.qualifications.slice(0, 4).map((qual, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700"
                                                                    >
                                                                        {qual}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Title & Badges */}
                                                        <div className="flex items-center gap-3 flex-wrap mb-3">
                                                            <h2 className="text-xl font-semibold text-gray-900">
                                                                {job.title}
                                                            </h2>
                                                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                                                                {job.employmentType ?? "Full-time"}
                                                            </span>
                                                            {job.status && (
                                                                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                                                    {job.status}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Department & Location */}
                                                        <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                                                            <span className="flex items-center gap-1">🏢 {job.department}</span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="flex items-center gap-1">📍 {job.location}</span>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-gray-600 text-sm leading-relaxed">
                                                            {job.description
                                                                ? job.description.length > 220
                                                                    ? `${job.description.slice(0, 220)}...`
                                                                    : job.description
                                                                : "No description provided."}
                                                        </p>

                                                        {/* Qualifications */}
                                                        {job.qualifications && job.qualifications.length > 0 && (
                                                            <div className="flex gap-2 mt-4 flex-wrap">
                                                                {job.qualifications.slice(0, 4).map((qual, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700"
                                                                    >
                                                                        {qual}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Deadline & Apply Button */}
                                        <div className="flex flex-col gap-4 lg:w-56 lg:pl-4 lg:border-l lg:border-gray-200">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <span>📅 Deadline:</span>
                                                <span className="font-medium">{formatDate(job.deadline)}</span>
                                            </div>

                                            {jobActive && !alreadyApplied ? (
                                                <Link
                                                    href={`/hr1/employee/job-postings/${job._id}/apply`}
                                                    className="w-full text-center bg-[#5955b3] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#504c9f] transition shadow-sm"
                                                >
                                                    Apply Now
                                                </Link>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full text-center bg-gray-300 text-gray-500 px-4 py-2.5 rounded-lg font-medium cursor-not-allowed shadow-sm"
                                                >
                                                    {alreadyApplied ? "Already Applied" : "No Longer Available"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}