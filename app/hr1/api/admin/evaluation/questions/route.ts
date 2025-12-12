import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function POST(req: { url: string | URL; json: () => any; }) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("jobId");

        if (!jobId) {
            return NextResponse.json({ error: "jobId is required" }, { status: 400 });
        }

        const body = await req.json();
        const { question, options, correctAnswer } = body;

        if (!question || !options || !correctAnswer) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        await Question.create({
            jobId,
            question,
            options,
            correctAnswer
        });

        return NextResponse.json({ message: "Question added" });
    } catch (err) {
        return NextResponse.json({ error: "Failed to save question" }, { status: 500 });
    }
}
