// Redirect to the correct route - jobs endpoint for evaluation
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Application } from "@/models/Applications";

export async function GET() {
    try {
        await connectDB();

        // Get all jobs with applicant count
        const jobs = await Job.find().lean();

        const jobsWithCount = await Promise.all(
            jobs.map(async (job) => {
                const applicantCount = await Application.countDocuments({
                    jobId: job._id,
                });

                return {
                    _id: job._id?.toString(),
                    title: job.title || "Untitled",
                    department: job.department || "",
                    employmentType: job.employmentType || "",
                    status: job.status || "Inactive",
                    applicants: applicantCount,
                };
            })
        );

        return NextResponse.json(jobsWithCount, { status: 200 });
    } catch (error) {
        console.error("Error loading jobs:", error);
        return NextResponse.json(
            { error: "Failed to load jobs" },
            { status: 500 }
        );
    }
}
