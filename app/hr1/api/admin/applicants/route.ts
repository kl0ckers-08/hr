import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";
import Job from "@/models/Job";

export async function GET() {
    try {
        await connectDB();

        const applications = await Application.find()
            .sort({ createdAt: -1 })
            .lean();

        // Get all job IDs and fetch job details for department info
        const jobIds = [...new Set(applications.map((app: any) => app.jobId?.toString()).filter(Boolean))];
        const jobs = await Job.find({ _id: { $in: jobIds } }).lean();

        const jobMap = new Map<string, any>();
        jobs.forEach((job: any) => {
            jobMap.set(job._id.toString(), job);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = applications.map((app: any) => {
            const job = jobMap.get(app.jobId?.toString() || "");
            return {
                _id: app._id?.toString(),
                jobId: app.jobId?.toString(),
                jobTitle: app.jobTitle || job?.title || "Unknown Position",
                fullName: app.fullName || "Unknown",
                email: app.email || "",
                phone: app.phone || "",
                department: app.department || job?.department || "",
                status: app.status || "pending",
                createdAt: app.createdAt,
            };
        });

        return NextResponse.json({ applications: formatted }, { status: 200 });
    } catch (error) {
        console.error("Error loading applicants:", error);
        return NextResponse.json(
            { error: "Failed to load applicants" },
            { status: 500 }
        );
    }
}
