"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

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

export default function JobDetailsPage() {
    const { JobId } = useParams(); // dynamic param
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!JobId) return;
        const id = Array.isArray(JobId) ? JobId[0] : JobId;
        fetchJob(id);
    }, [JobId]);

    const fetchJob = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await axios.get<Job>(`/hr1/api/jobs/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            
            // Check if job is inactive and redirect
            if (res.data.status?.toLowerCase() !== "active") {
                console.log("Job is inactive, redirecting...");
                router.push("/hr1/employee/job-postings");
                return;
            }
            
            setJob(res.data);
        } catch (err) {
            console.error("Failed fetching job:", err);
            setError("Failed to load job details.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        try {
            return new Date(iso).toLocaleDateString();
        } catch {
            return iso;
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-600">Loading job details...</div>;
    if (error) return <div className="p-6 bg-red-100 text-red-700 rounded">{error}</div>;
    if (!job) return <div className="p-6 text-gray-600">Job not found.</div>;

    return (
        <div className="bg-gray-50 p-6 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                        <div className="text-gray-500 text-sm mt-1">
                            {job.department} • {job.location} • {job.employmentType}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">Deadline: {formatDate(job.deadline)}</div>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-indigo-600 text-sm hover:underline"
                    >
                        ← Back
                    </button>
                </div>

                {/* Job Stats */}
                <div className="flex gap-4 text-gray-500 text-sm">
                    <div>👁️ {job.views ?? 0} views</div>
                    <div>👥 {job.applicants ?? 0} applicants</div>
                    {job.status && (
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                {job.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div>
                    <h2 className="font-semibold text-gray-800 mb-2">Job Description</h2>
                    <p className="text-gray-600">{job.description ?? "No description provided."}</p>
                </div>

                {/* Qualifications */}
                {job.qualifications && job.qualifications.length > 0 && (
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-2">Qualifications</h2>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {job.qualifications.map((q, i) => (
                                <li key={i}>{q}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-2">Requirements</h2>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {job.requirements.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                    <Link
                        href={`/hr1/employee/job-postings/${job._id}/apply`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Apply for this Job
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}