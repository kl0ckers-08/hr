import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Types } from "mongoose";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params; // Await params here

  // Validate ObjectId format
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid job ID format" }, { status: 400 });
  }

  try {
    await connectDB();

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}