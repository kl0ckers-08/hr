import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Application } from "@/models/Applications";

export async function GET() {
    try {
        await connectDB();

        // get all jobs
        const jobs = await Job.find().lean();

        // add applicant count for each job
        const jobsWithCount = await Promise.all(
            jobs.map(async (job) => {
                const applicantCount = await Application.countDocuments({
                    jobId: job._id,
                });

                return {
                    ...job,
                    applicants: applicantCount,
                };
            })
        );

        return NextResponse.json(jobsWithCount, { status: 200 });
    } catch (error) {
        console.error("Error loading jobs with applicants:", error);
        return NextResponse.json(
            { error: "Failed to load jobs" },
            { status: 500 }
        );
    }
}
