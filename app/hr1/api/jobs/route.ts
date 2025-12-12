import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import  Job  from "@/models/Job";

export async function GET() {
    try {
        await connectDB();
        const jobs = await Job.find({});
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
