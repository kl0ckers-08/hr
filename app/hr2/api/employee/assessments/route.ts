// app/hr2/api/employee/assessments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompetencyAssessment from "@/models/hr2/admin/CompetencyAssessment";
import AssessmentResult from "@/models/hr2/employee/AssessmentResult";
import EmployeeCompetency from "@/models/hr2/employee/EmployeeCompetency";
import { verifyToken } from "@/lib/auth";
import { jwtVerify } from "jose";

async function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}

// GET - Get available assessments for employee
export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all active assessments
    const assessments = await CompetencyAssessment.find({ isActive: true })
      .select("-questions.correctAnswer") // Don't send correct answers to client
      .sort({ category: 1, skillName: 1 })
      .lean();

    // Get employee's assessment results
    const results = await AssessmentResult.find({ employee: user.id })
      .sort({ submittedAt: -1 })
      .lean();

    // Map assessments with completion status
    const assessmentsWithStatus = assessments.map(assessment => {
      const latestResult = results.find(r => r.assessment?.toString() === assessment._id.toString());
      return {
        ...assessment,
        completed: !!latestResult,
        lastScore: latestResult?.score,
        lastAttempt: latestResult?.submittedAt,
        passed: latestResult?.passed,
      };
    });

    return NextResponse.json({ assessments: assessmentsWithStatus });
  } catch (error) {
    console.error("Assessments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

// POST - Submit assessment answers
export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { assessmentId, answers, timeTaken } = body;

    if (!assessmentId || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Get the assessment with correct answers
    const assessment = await CompetencyAssessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    const processedAnswers = assessment.questions.map((q: any) => {
      const selectedAnswer = answers[q._id.toString()];
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        questionId: q._id,
        question: q.question,
        selectedAnswer: selectedAnswer || "",
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const totalQuestions = assessment.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= assessment.passingScore;

    // Determine competency level based on score
    let level = "Beginner";
    if (score >= 90) level = "Expert";
    else if (score >= 75) level = "Advanced";
    else if (score >= 50) level = "Intermediate";

    // Save assessment result
    const result = await AssessmentResult.create({
      employee: user.id,
      assessment: assessmentId,
      skillName: assessment.skillName,
      category: assessment.category,
      answers: processedAnswers,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      passed,
      timeTaken,
    });

    // Update employee competency
    await EmployeeCompetency.findOneAndUpdate(
      { employee: user.id, skillName: assessment.skillName },
      {
        employee: user.id,
        skillName: assessment.skillName,
        category: assessment.category,
        score,
        level,
        assessedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      result: {
        score,
        totalQuestions,
        correctAnswers: correctCount,
        passed,
        level,
        passingScore: assessment.passingScore,
      },
      answers: processedAnswers,
    });
  } catch (error) {
    console.error("Assessment submit error:", error);
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
  }
}
