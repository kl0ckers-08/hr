// app/hr2/api/employee/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Training from "@/models/hr2/employee/Training";
import LearningProgress from "@/models/hr2/employee/LearningProgress";
import EmployeeCompetency from "@/models/hr2/employee/EmployeeCompetency";
import ESSRequest from "@/models/hr2/admin/ESSRequest";
import Module from "@/models/module";
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

// GET - Get employee dashboard data
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

    // Get training stats
    const trainings = await Training.find({ employee: user.id }).lean();
    const trainingStats = {
      total: trainings.length,
      completed: trainings.filter(t => t.status === "Completed").length,
      inProgress: trainings.filter(t => t.status === "In Progress").length,
    };

    // Get learning stats
    const modules = await Module.countDocuments();
    const learningProgress = await LearningProgress.find({ employee: user.id }).lean();
    const learningStats = {
      totalModules: modules,
      completed: learningProgress.filter(p => p.status === "Completed").length,
      inProgress: learningProgress.filter(p => p.status === "In Progress").length,
    };

    // Get competency stats
    const competencies = await EmployeeCompetency.find({ employee: user.id }).lean();
    const assessedCompetencies = competencies.filter(c => c.score !== undefined);
    const competencyStats = {
      totalSkills: competencies.length,
      assessed: assessedCompetencies.length,
      averageScore: assessedCompetencies.length > 0
        ? Math.round(assessedCompetencies.reduce((a, b) => a + (b.score || 0), 0) / assessedCompetencies.length)
        : 0,
    };

    // Get ESS requests stats
    const essRequests = await ESSRequest.find({ employee: user.id }).lean();
    const essStats = {
      total: essRequests.length,
      pending: essRequests.filter(r => r.status === "Pending").length,
      approved: essRequests.filter(r => r.status === "Approved").length,
    };

    // Get recent activities
    const recentTrainings = await Training.find({ employee: user.id })
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean();

    const recentLearning = await LearningProgress.find({ employee: user.id })
      .populate("module", "title")
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      stats: {
        training: trainingStats,
        learning: learningStats,
        competency: competencyStats,
        ess: essStats,
      },
      recentActivities: {
        trainings: recentTrainings,
        learning: recentLearning,
      }
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
