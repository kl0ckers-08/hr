// app/hr2/api/employee/assessments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompetencyAssessment from "@/models/hr2/admin/CompetencyAssessment";
import { verifyToken } from "@/lib/auth";

// GET - Get specific assessment for taking the test
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    await connectDB();

    const assessment = await CompetencyAssessment.findById(id)
      .select("-questions.correctAnswer") // Don't send correct answers
      .lean();

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    if (!assessment.isActive) {
      return NextResponse.json({ error: "Assessment is not available" }, { status: 400 });
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Assessment fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 });
  }
}
