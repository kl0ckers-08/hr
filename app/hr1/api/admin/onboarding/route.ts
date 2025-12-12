import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";
import Job from "@/models/Job";

export async function GET() {
    try {
        await connectDB();

        // Fetch all hired applicants for onboarding
        const hiredApplicants = await Application.find({ status: "hired" })
            .sort({ updatedAt: -1 })
            .lean();

        // Handle case when no applications found
        if (!hiredApplicants || hiredApplicants.length === 0) {
            return NextResponse.json({ applicants: [] }, { status: 200 });
        }

        // Get all job IDs and fetch job details for department info
        const jobIds = [...new Set(
            hiredApplicants
                .map((app: any) => app.jobId)
                .filter((id) => id != null)
                .map((id) => id.toString())
        )];

        let jobMap = new Map<string, any>();

        if (jobIds.length > 0) {
            try {
                const jobs = await Job.find({ _id: { $in: jobIds } }).lean();
                jobs.forEach((job: any) => {
                    jobMap.set(job._id.toString(), job);
                });
            } catch (jobError) {
                console.error("Error fetching jobs:", jobError);
                // Continue without job data
            }
        }

        // Format the applicants
        const formatted = hiredApplicants.map((app: any) => {
            const jobIdStr = app.jobId?.toString() || "";
            const job = jobMap.get(jobIdStr);
            
            return {
                _id: app._id?.toString() || "",
                fullName: app.fullName || "Unknown",
                email: app.email || "",
                phone: app.phone || "",
                jobTitle: app.jobTitle || job?.title || "Unknown Position",
                department: app.department || job?.department || "",
                hiredDate: app.updatedAt || new Date(),
                onboardingStatus: app.onboardingStatus || "pending",
                status: app.status || "hired",
                transferredToHR2: app.transferredToHR2 || false,
            };
        });

        return NextResponse.json({ applicants: formatted }, { status: 200 });
        
    } catch (error: any) {
        console.error("Error loading hired applicants:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return NextResponse.json(
            { 
                error: "Failed to load data",
                details: error.message 
            },
            { status: 500 }
        );
    }
}