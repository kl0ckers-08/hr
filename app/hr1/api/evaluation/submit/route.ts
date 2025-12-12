// app/api/evaluation/submit/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import EvaluationResult from "@/models/EvaluationResult";

export async function POST(req: NextRequest) {
    try {
        // Verify user
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET!)
        );

        const userId = payload.id; // FIXED

        await connectDB();

        const { applicationId, answers } = await req.json();

        // Prevent submitting twice for the same application (FIXED)
        const existing = await EvaluationResult.findOne({
            userId,
            applicationId,
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: "You already submitted this evaluation." },
                { status: 400 }
            );
        }

        // Get all questions with correct answers
        const questions = await Question.find({
            _id: { $in: Object.keys(answers) }
        });

        // Calculate score
        let score = 0;
        questions.forEach(q => {
            if (answers[q._id.toString()] === q.correctAnswer) {
                score++;
            }
        });

        // Save evaluation snapshot
        await EvaluationResult.create({
            userId,
            applicationId,
            questions: questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer
            })),
            answers,
            score,
            totalQuestions: questions.length,
            submittedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            score,
            totalQuestions: questions.length
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to submit evaluation" },
            { status: 500 }
        );
    }
}
