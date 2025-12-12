// app/hr2/api/employee/competency/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
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

// GET - Get employee's competencies
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

    const competencies = await EmployeeCompetency.find({ employee: user.id })
      .sort({ category: 1, skillName: 1 })
      .lean();

    // Calculate stats
    const totalSkills = competencies.length;
    const assessedSkills = competencies.filter(c => c.score !== undefined && c.score !== null).length;
    const avgScore = assessedSkills > 0 
      ? Math.round(competencies.filter(c => c.score).reduce((a, b) => a + (b.score || 0), 0) / assessedSkills)
      : 0;
    const needsImprovement = competencies.filter(c => c.score && c.score < 70).length;

    return NextResponse.json({
      competencies,
      stats: {
        totalSkills,
        assessedSkills,
        averageScore: avgScore,
        needsImprovement,
        pendingAssessment: totalSkills - assessedSkills,
      }
    });
  } catch (error) {
    console.error("Competency fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch competencies" }, { status: 500 });
  }
}

// POST - Submit assessment result
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
    const { skillName, category, score } = body;

    if (!skillName || !category || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Determine level based on score
    let level = "Beginner";
    if (score >= 90) level = "Expert";
    else if (score >= 75) level = "Advanced";
    else if (score >= 50) level = "Intermediate";

    const competency = await EmployeeCompetency.findOneAndUpdate(
      { employee: user.id, skillName },
      {
        employee: user.id,
        skillName,
        category,
        score,
        level,
        assessedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(competency, { status: 201 });
  } catch (error) {
    console.error("Competency save error:", error);
    return NextResponse.json({ error: "Failed to save competency" }, { status: 500 });
  }
}
