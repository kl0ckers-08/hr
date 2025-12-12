"use client";

import { CloudUpload, FileText, Paperclip } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function ApplyPage() {
    const params = useParams();
    const JobId = params?.JobId as string;
    const router = useRouter();

    // States for job details
    const [jobTitle, setJobTitle] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);

    // States for form inputs
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [resume, setResume] = useState<File | null>(null);
    const [applicationLetter, setApplicationLetter] = useState<File | null>(null);
    const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch job title and check if already applied
    useEffect(() => {
        if (!JobId) {
            setError("No job ID provided");
            setLoading(false);
            return;
        }

        const fetchJobDetailsAndCheckApplication = async () => {
            try {
                console.log("🔍 Fetching job:", JobId);
                const res = await fetch(`/hr1/api/jobs/${JobId}`);
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch job: ${res.status}`);
                }

                const jobData = await res.json();
                console.log("📦 Job data received:", jobData);
                
                // Check if job is inactive and redirect
                if (jobData.status?.toLowerCase() !== "active") {
                    console.log("Job is inactive, redirecting...");
                    router.push("/hr1/employee/job-postings");
                    return;
                }
                
                setJobTitle(jobData.title || "Unknown Job");

                // Check if user already applied for this job
                const appRes = await fetch(`/hr1/api/applications?jobId=${JobId}`, {
                    credentials: "include",
                });

                if (appRes.ok) {
                    const appData = await appRes.json();
                    if (appData.applications && appData.applications.length > 0) {
                        console.log("⚠️ User already applied for this job");
                        setAlreadyApplied(true);
                    }
                }
            } catch (err) {
                console.error("❌ Error fetching job:", err);
                setError("Unable to load job details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetailsAndCheckApplication();
    }, [JobId, router]);

    const clearError = () => {
        if (error) setError(null);
    };

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `File size must be less than 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return "Only PDF and Word documents are allowed";
        }
        return null;
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: (file: File | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) {
            setFile(null);
            return;
        }

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setFile(null);
            return;
        }

        clearError();
        setFile(file);
    };

    const handleSupportingDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        
        for (const file of files) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        clearError();
        setSupportingDocs(files);
    };

    const validateForm = (): boolean => {
        if (!fullName.trim()) {
            setError("Full name is required");
            return false;
        }
        if (!email.trim() || !email.includes("@")) {
            setError("Valid email is required");
            return false;
        }
        if (!resume) {
            setError("Resume is required");
            return false;
        }
        if (!applicationLetter) {
            setError("Application letter is required");
            return false;
        }
        clearError();
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("jobId", JobId);
        formData.append("jobTitle", jobTitle || "");
        formData.append("fullName", fullName.trim());
        formData.append("email", email.trim());
        formData.append("coverLetter", coverLetter.trim());
        formData.append("resume", resume!);
        formData.append("applicationLetter", applicationLetter!);
        supportingDocs.forEach((file) => formData.append("supportingDocs", file));

        try {
            const res = await fetch("/hr1/api/applications", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Submission failed");
            }

            alert("Application submitted successfully!");
            router.push("/hr1/employee/job-postings");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to submit application";
            setError(errorMessage);
            console.error("❌ Error submitting application:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <h1 className="text-3xl font-semibold text-indigo-700">
                        {loading ? "Loading..." : jobTitle ? `Apply for: ${jobTitle}` : "Job not found"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {loading ? "Fetching job information..." : "Fill out the form below to apply."}
                    </p>
                </div>

                <button
                    onClick={() => router.back()}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                    aria-label="Go back to previous page"
                >
                    ← Back
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-xl shadow-lg max-w-3xl p-8 mx-auto text-center">
                    <p className="text-gray-500">Loading job details...</p>
                </div>
            ) : alreadyApplied ? (
                <div className="bg-white rounded-xl shadow-lg max-w-3xl p-8 mx-auto">
                    <div className="text-center py-12">
                        <div className="mb-4 text-6xl">📋</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Applied</h2>
                        <p className="text-gray-600 mb-6">
                            You have already submitted an application for this position. You can only apply once per job.
                        </p>
                        <button
                            onClick={() => router.push("/employee/my-application")}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                        >
                            View Your Applications
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg max-w-3xl p-8 mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-[#333] text-sm font-medium mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    clearError();
                                }}
                                placeholder="John Doe"
                                className="w-full border text-[#333] border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className=" text-[#333] block text-sm font-medium mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    clearError();
                                }}
                                placeholder="john@example.com"
                                className="w-full border text-[#333] border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label htmlFor="coverLetter" className=" text-[#333] block text-sm font-medium mb-2">
                                Cover Letter
                            </label>
                            <textarea
                                id="coverLetter"
                                value={coverLetter}
                                onChange={(e) => {
                                    setCoverLetter(e.target.value);
                                    clearError();
                                }}
                                rows={5}
                                placeholder="Tell us why you're interested in this position..."
                                className="w-full border text-[#333] border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Resume */}
                        <div>
                            <label htmlFor="resume" className="text-[#333] block text-sm font-medium mb-2">
                                Resume <span className="text-red-500">*</span>
                            </label>

                            <label
                                htmlFor="resume"
                                className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
                            >
                                <input
                                    id="resume"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, setResume)}
                                    accept=".pdf,.doc,.docx"
                                    aria-label="Upload resume"
                                />

                                {resume ? (
                                    <div className="text-center">
                                        <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium">{resume.name}</p>
                                        <p className="text-xs text-gray-500">{(resume.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <CloudUpload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm">Click to upload resume</p>
                                        <p className="text-xs text-gray-500">PDF or Word documents up to 5MB</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Application Letter */}
                        <div>
                            <label htmlFor="applicationLetter" className="text-[#333] block text-sm font-medium mb-2">
                                Application Letter <span className="text-red-500">*</span>
                            </label>

                            <label
                                htmlFor="applicationLetter"
                                className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
                            >
                                <input
                                    id="applicationLetter"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, setApplicationLetter)}
                                    accept=".pdf,.doc,.docx"
                                    aria-label="Upload application letter"
                                />

                                {applicationLetter ? (
                                    <div className="text-center">
                                        <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium">{applicationLetter.name}</p>
                                        <p className="text-xs text-gray-500">{(applicationLetter.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm">Click to upload application letter</p>
                                        <p className="text-xs text-gray-500">PDF or Word documents up to 5MB</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Supporting Documents */}
                        <div>
                            <label htmlFor="supportingDocs" className="text-[#333] block text-sm font-medium mb-2">
                                Supporting Documents <span className="text-gray-500">(Optional)</span>
                            </label>

                            <label
                                htmlFor="supportingDocs"
                                className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
                            >
                                <input
                                    id="supportingDocs"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={handleSupportingDocsChange}
                                    accept=".pdf,.doc,.docx"
                                    aria-label="Upload supporting documents"
                                />

                                {supportingDocs.length > 0 ? (
                                    <div className="text-center">
                                        <Paperclip className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium">{supportingDocs.length} file(s) selected</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Paperclip className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm">Click to upload multiple files</p>
                                        <p className="text-xs text-gray-500">PDF or Word documents up to 5MB each</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-between pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    );
}