"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, CheckCircle, Eye, Users, Search, Edit2, X, MapPin, Clock, Calendar } from "lucide-react";

export interface Job {
    _id: string;
    title: string;
    department: string;
    employmentType: string;
    location: string;
    deadline: string;
    views: number;
    applicants: number;
    status: string;
    description: string;
    qualifications: string[];
    requirements: string[];
}

export interface JobForm {
    title: string;
    department: string;
    employmentType: string;
    location: string;
    deadline: string;
    description: string;
    qualifications: string[];
    requirements: string[];
    status: string;
}

const AdminJobPosting: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");
    const [formData, setFormData] = useState({
        title: "",
        department: "",
        employmentType: "",
        location: "",
        deadline: "",
        description: "",
        qualifications: [] as string[],
        requirements: [] as string[],
    });
    const [qualificationInput, setQualificationInput] = useState("");
    const [requirementInput, setRequirementInput] = useState("");

    // Fetch all jobs
    const fetchJobs = async () => {
        try {
            const response = await axios.get("/hr1/api/admin-jobs");
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs", error);
            setErrorMessage("Failed to fetch jobs.");
        }
    };

    // Open view modal
    const openViewModal = (job: Job) => {
        setSelectedJob(job);
        setIsViewModalOpen(true);
    };

    // Open edit modal from view modal
    const openEditModalFromView = () => {
        if (selectedJob) {
            setFormData({
                title: selectedJob.title,
                department: selectedJob.department,
                employmentType: selectedJob.employmentType,
                location: selectedJob.location,
                deadline: selectedJob.deadline.split('T')[0],
                description: selectedJob.description || "",
                qualifications: selectedJob.qualifications || [],
                requirements: selectedJob.requirements || [],
            });
            setQualificationInput("");
            setRequirementInput("");
            setIsViewModalOpen(false);
            setIsEditModalOpen(true);
        }
    };

    // Open edit modal for new job
    const openCreateModal = () => {
        setSelectedJob(null);
        setFormData({
            title: "",
            department: "",
            employmentType: "",
            location: "",
            deadline: "",
            description: "",
            qualifications: [],
            requirements: [],
        });
        setQualificationInput("");
        setRequirementInput("");
        setIsEditModalOpen(true);
    };

    const closeAllModals = () => {
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedJob(null);
        setErrorMessage("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addQualification = () => {
        const val = qualificationInput.trim();
        if (!val) return;
        setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, val] }));
        setQualificationInput("");
    };

    const removeQualification = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications.filter((_, i) => i !== idx),
        }));
    };

    const addRequirement = () => {
        const val = requirementInput.trim();
        if (!val) return;
        setFormData(prev => ({ ...prev, requirements: [...prev.requirements, val] }));
        setRequirementInput("");
    };

    const removeRequirement = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== idx),
        }));
    };

    // Submit job (create or update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.department || !formData.location || !formData.deadline) {
            setErrorMessage("Please fill in all required fields");
            return;
        }

        try {
            const payload: JobForm = {
                title: formData.title,
                department: formData.department,
                employmentType: formData.employmentType,
                location: formData.location,
                deadline: formData.deadline,
                description: formData.description,
                qualifications: formData.qualifications,
                requirements: formData.requirements,
                status: selectedJob ? selectedJob.status : "Active",
            };

            if (selectedJob) {
                await axios.put(`/hr1/api/admin-jobs/${selectedJob._id}`, payload);
            } else {
                await axios.post("/hr1/api/admin-jobs", payload);
            }

            fetchJobs();
            closeAllModals();
            setErrorMessage("");
        } catch (error: any) {
            if (error.response?.status === 409) {
                setErrorMessage("This job already exists.");
            } else {
                setErrorMessage(error.response?.data?.message || "Error saving job.");
            }
        }
    };

    // Toggle job status
    const toggleJobStatus = async (job: Job) => {
        try {
            const newStatus = job.status === "Active" ? "Inactive" : "Active";
            await axios.put(`/hr1/api/admin-jobs/${job._id}`, {
                ...job,
                status: newStatus,
            });
            fetchJobs();
            if (selectedJob && selectedJob._id === job._id) {
                setSelectedJob({ ...job, status: newStatus });
            }
        } catch (error) {
            console.error("Error toggling job status", error);
            setErrorMessage("Failed to update job status.");
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Filter jobs
    const filteredJobs = jobs.filter((job) => {
        const matchesStatus = statusFilter === "all" || 
            (statusFilter === "Active" && job.status === "Active") ||
            (statusFilter === "Inactive" && job.status === "Inactive");
        const matchesSearch = 
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="w-full bg-gray-50 p-6 max-h-screen overflow-y-scroll">
            <div className=" mx-auto">
                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Job Postings</h1>
                        <p className="text-gray-600 mt-2">Manage and view all job opportunities</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <Briefcase className="w-5 h-5" />
                        Post New Job
                    </button>
                </div>

                {/* Job Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-purple-100 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-700 font-medium">Total Jobs</h3>
                            <Briefcase className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="font-bold text-3xl text-gray-900">{jobs.length}</p>
                    </div>

                    <div className="bg-green-100 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-700 font-medium">Active Jobs</h3>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="font-bold text-3xl text-gray-900">
                            {jobs.filter((job) => job.status === "Active").length}
                        </p>
                    </div>

                    <div className="bg-blue-100 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-700 font-medium">Total Views</h3>
                            <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="font-bold text-3xl text-gray-900">
                            {jobs.reduce((acc, job) => acc + (job.views ?? 0), 0)}
                        </p>
                    </div>

                    <div className="bg-orange-100 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-700 font-medium">Total Applicants</h3>
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <p className="font-bold text-3xl text-gray-900">
                            {jobs.reduce((acc, job) => acc + (job.applicants ?? 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        {["all", "Active", "Inactive"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                    statusFilter === status
                                        ? "bg-purple-600 text-white"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Job List */}
                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500">No jobs found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div
                                key={job._id}
                                onClick={() => openViewModal(job)}
                                className={`p-6 rounded-lg border transition cursor-pointer ${
                                    job.status === "Inactive"
                                        ? "bg-gray-100 border-gray-300 opacity-70"
                                        : "bg-white border-gray-200 hover:shadow-md hover:border-purple-300"
                                }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {job.title}
                                            </h3>
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                job.status === "Active" 
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-300 text-gray-700"
                                            }`}>
                                                {job.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {job.department}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {job.employmentType}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {job.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-700">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {job.views ?? 0} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.applicants ?? 0} applicants
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                                <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                                    selectedJob.status === "Active" 
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-300 text-gray-700"
                                }`}>
                                    {selectedJob.status}
                                </span>
                            </div>
                            <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Job Info */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    <span>{selectedJob.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    <span>{selectedJob.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{selectedJob.employmentType}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600">{selectedJob.description || "No description provided."}</p>
                            </div>

                            {/* Qualifications */}
                            {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualifications</h3>
                                    <ul className="space-y-2">
                                        {selectedJob.qualifications.map((qual, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-600">
                                                <span className="text-purple-600 mt-1">•</span>
                                                <span>{qual}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Requirements */}
                            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                                    <ul className="space-y-2">
                                        {selectedJob.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-600">
                                                <span className="text-purple-600 mt-1">•</span>
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
                            <button
                                onClick={closeAllModals}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => toggleJobStatus(selectedJob)}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                                    selectedJob.status === "Active"
                                        ? "bg-gray-600 text-white hover:bg-gray-700"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                            >
                                {selectedJob.status === "Active" ? "Mark as Inactive" : "Mark as Active"}
                            </button>
                            <button
                                onClick={openEditModalFromView}
                                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedJob ? "Edit Job" : "Post New Job"}
                            </h2>
                            <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Job Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department *
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            required
                                        >
                                            <option value="" disabled>Select department</option>
                                            <option value="IT">IT</option>
                                            <option value="CS">CS</option>
                                            <option value="CE">CE</option>
                                            <option value="IS">IS</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Employment Type *
                                        </label>
                                        <select
                                            name="employmentType"
                                            value={formData.employmentType}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            required
                                        >
                                            <option value="" disabled>Select employment type</option>
                                            <option value="Part Time">Part Time</option>
                                            <option value="Full Time">Full Time</option>
                                            <option value="Contract">Contract</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Manila, Remote"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deadline *
                                        </label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>

                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qualifications
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={qualificationInput}
                                            onChange={(e) => setQualificationInput(e.target.value)}
                                            placeholder="Add a qualification"
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addQualification}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formData.qualifications.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.qualifications.map((qual, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-sm text-gray-700"
                                                >
                                                    {qual}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQualification(idx)}
                                                        className="text-gray-500 hover:text-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Requirements
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={requirementInput}
                                            onChange={(e) => setRequirementInput(e.target.value)}
                                            placeholder="Add a requirement"
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addRequirement}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formData.requirements.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.requirements.map((req, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-sm text-gray-700"
                                                >
                                                    {req}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRequirement(idx)}
                                                        className="text-gray-500 hover:text-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeAllModals}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                                    >
                                        {selectedJob ? "Update Job" : "Post Job"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobPosting;