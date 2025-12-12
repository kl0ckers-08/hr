// ========================================
// FILE: app/hr1/api/admin-jobs/[id]/route.ts
// ========================================
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Types } from "mongoose";

// GET single job by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        // AWAIT params before accessing properties
        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid job ID" },
                { status: 400 }
            );
        }

        const job = await Job.findById(id);

        if (!job) {
            return NextResponse.json(
                { message: "Job not found" },
                { status: 404 }
            );
        }

        // Increment views
        await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });

        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json(
            { message: "Failed to fetch job" },
            { status: 500 }
        );
    }
}

// PUT update job by ID
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        // AWAIT params before accessing properties
        const { id } = await params;
        const body = await req.json();

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid job ID" },
                { status: 400 }
            );
        }

        const {
            title,
            department,
            employmentType,
            location,
            deadline,
            description,
            qualifications,
            requirements,
            status
        } = body;

        // Validate required fields
        if (!title || !department || !employmentType || !location || !deadline) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const updatedJob = await Job.findByIdAndUpdate(
            id,
            {
                title,
                department,
                employmentType,
                location,
                deadline: new Date(deadline),
                description: description || "",
                qualifications: qualifications || [],
                requirements: requirements || [],
                status: status || "Open",
            },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return NextResponse.json(
                { message: "Job not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Job updated successfully",
                job: updatedJob,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json(
            { message: "Failed to update job" },
            { status: 500 }
        );
    }
}

// DELETE job by ID
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        // AWAIT params before accessing properties
        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid job ID" },
                { status: 400 }
            );
        }

        const deletedJob = await Job.findByIdAndDelete(id);

        if (!deletedJob) {
            return NextResponse.json(
                { message: "Job not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Job deleted successfully",
                job: deletedJob,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json(
            { message: "Failed to delete job" },
            { status: 500 }
        );
    }
}