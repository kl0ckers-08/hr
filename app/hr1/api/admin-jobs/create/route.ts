// api/admin-jobs/create/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const { title, department, employmentType, location, deadline, description, qualifications, requirements, status } = body;

        // Validate required fields
        if (!title || !department || !employmentType || !location || !deadline) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if job already exists
        const existingJob = await Job.findOne({ title, department, location });
        if (existingJob) {
            return NextResponse.json(
                { message: "This job already exists" },
                { status: 409 }
            );
        }

        // Create new job
        const newJob = await Job.create({
            title,
            department,
            employmentType,
            location,
            deadline: new Date(deadline),
            description: description || "",
            qualifications: qualifications || [],
            requirements: requirements || [],
            status: status || "Open",
            views: 0,
            applicants: 0,
        });

        return NextResponse.json(
            {
                message: "Job created successfully",
                job: newJob,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { message: "Failed to create job" },
            { status: 500 }
        );
    }
}