import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();

    // Support single object or array of questions
    const questionsArray = Array.isArray(data) ? data : [data];

    // Validate each question
    const invalid = questionsArray.find(
      (q) => !q.question || !q.options || !q.correctAnswer
    );
    if (invalid) {
      return NextResponse.json(
        { message: "Missing required fields in one or more questions" },
        { status: 400 }
      );
    }

    // Add default isActive = true if missing
    const preparedQuestions = questionsArray.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      isActive: q.isActive ?? true,
    }));

    // Insert multiple questions at once
    const newQuestions = await Question.insertMany(preparedQuestions);

    return NextResponse.json(
      { success: true, data: newQuestions },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating questions:", error);
    return NextResponse.json(
      { message: "Failed to create questions" },
      { status: 500 }
    );
  }
}
