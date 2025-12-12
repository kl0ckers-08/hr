// app/hr2/api/admin/assessments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompetencyAssessment from "@/models/hr2/admin/CompetencyAssessment";
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

// GET - Get all assessments (admin)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const assessments = await CompetencyAssessment.find({})
      .sort({ category: 1, skillName: 1 })
      .lean();

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Assessments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

// POST - Create new assessment (admin only)
export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== "hr2admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { skillName, category, description, questions, passingScore, duration } = body;

    if (!skillName || !category || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || !q.options || q.options.length < 2 || !q.correctAnswer) {
        return NextResponse.json({ error: "Invalid question format" }, { status: 400 });
      }
      if (!q.options.includes(q.correctAnswer)) {
        return NextResponse.json({ error: "Correct answer must be one of the options" }, { status: 400 });
      }
    }

    await connectDB();

    const assessment = await CompetencyAssessment.create({
      skillName,
      category,
      description,
      questions,
      passingScore: passingScore || 70,
      duration: duration || 30,
      createdBy: user.id,
      isActive: true,
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error: any) {
    console.error("Assessment create error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Assessment for this skill already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}

// PUT - Update assessment
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== "hr2admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Assessment ID required" }, { status: 400 });
    }

    await connectDB();

    const assessment = await CompetencyAssessment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Assessment update error:", error);
    return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 });
  }
}

// DELETE - Delete assessment
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== "hr2admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Assessment ID required" }, { status: 400 });
    }

    await connectDB();

    const assessment = await CompetencyAssessment.findByIdAndDelete(id);

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Assessment deleted" });
  } catch (error) {
    console.error("Assessment delete error:", error);
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 });
  }
}
