// app/api/evaluation/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    // Build query filter
    const filter: any = { isActive: true };
    if (jobId && Types.ObjectId.isValid(jobId)) {
      filter.jobId = new Types.ObjectId(jobId);
    }

    const questions = await Question.find(filter);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { jobId, question, options, correctAnswer } = body;

    // Validate required fields
    if (!jobId || !question || !options || !correctAnswer) {
      return NextResponse.json(
        { message: "Missing required fields: jobId, question, options, correctAnswer" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { message: "Invalid jobId" },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { message: "Options must be an array with at least 2 choices" },
        { status: 400 }
      );
    }

    if (!options.includes(correctAnswer)) {
      return NextResponse.json(
        { message: "Correct answer must be one of the options" },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      jobId: new Types.ObjectId(jobId),
      question,
      options,
      correctAnswer,
      isActive: true,
    });

    return NextResponse.json(
      { message: "Question created successfully", question: newQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { message: "Failed to create question" },
      { status: 500 }
    );
  }
}