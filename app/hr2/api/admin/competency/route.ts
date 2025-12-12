// app/hr2/api/admin/competency/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Competency from "@/models/hr2/admin/Competency";
import User from "@/models/User"; // Adjust path as needed
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = request.headers.get("authorization")?.split(" ")[1] || 
                cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Get all users with role "employee2" only
    const users = await User.find({ role: "employee2" }).lean();

    // Get all competency assessments
    const competencies = await Competency.find({}).lean();

    // Create a map of employee competencies
    const competencyMap = new Map();
    competencies.forEach(comp => {
      // Check if employee field exists before converting to string
      if (comp.employee) {
        const employeeId = typeof comp.employee === 'string' 
          ? comp.employee 
          : comp.employee.toString();
        competencyMap.set(employeeId, comp);
      }
    });

    // Combine user data with competency data
    const employees = users.map(user => {
      const userId = user._id.toString();
      const competency = competencyMap.get(userId);
      
      return {
        _id: user._id,
        fullname: user.fullName || user.username || "Unknown",
        email: user.email || "",
        department: user.department || "Not assigned",
        role: user.role || "Employee",
        competencyScore: competency?.score || null,
        lastAssessed: competency?.evaluatedAt || null,
        assessmentNotes: competency?.notes || "",
      };
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching competency data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch competency data" 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = request.headers.get("authorization")?.split(" ")[1] || 
                cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { employeeId, assessment } = body;

    if (!employeeId || !assessment) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Calculate overall score from assessment
    const scores = [
      assessment.technicalSkills,
      assessment.communication,
      assessment.problemSolving,
      assessment.teamwork,
      assessment.leadership,
    ].filter(s => s > 0);

    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Update or create competency record
    const competency = await Competency.findOneAndUpdate(
      { employee: employeeId },
      {
        employee: employeeId,
        score: overallScore,
        evaluatedAt: new Date(),
        notes: assessment.notes || "",
        // Store detailed scores
        detailedScores: {
          technicalSkills: assessment.technicalSkills,
          communication: assessment.communication,
          problemSolving: assessment.problemSolving,
          teamwork: assessment.teamwork,
          leadership: assessment.leadership,
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      competency 
    });
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json({ 
      error: "Failed to save assessment" 
    }, { status: 500 });
  }
}