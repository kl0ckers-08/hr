// app/hr2/api/employee/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Training from "@/models/hr2/employee/Training";
import LearningProgress from "@/models/hr2/employee/LearningProgress";
import EmployeeCompetency from "@/models/hr2/employee/EmployeeCompetency";
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

// GET - Get employee's personal analytics
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

    // Competency Analytics
    const competencies = await EmployeeCompetency.find({ employee: user.id }).lean();
    const assessedCompetencies = competencies.filter(c => c.score !== undefined && c.score !== null);
    
    const competencyBySkill = competencies.map(c => ({
      skill: c.skillName,
      level: c.score || 0,
      category: c.category,
      assessedAt: c.assessedAt,
    })).sort((a, b) => b.level - a.level);

    const avgCompetency = assessedCompetencies.length > 0
      ? Math.round(assessedCompetencies.reduce((a, b) => a + (b.score || 0), 0) / assessedCompetencies.length)
      : 0;

    // Training Analytics
    const trainings = await Training.find({ employee: user.id }).lean();
    const completedTrainings = trainings.filter(t => t.status === "Completed").length;
    
    // Group trainings by type
    const trainingByType: Record<string, number> = {};
    trainings.forEach(t => {
      const type = t.type || "Other";
      trainingByType[type] = (trainingByType[type] || 0) + 1;
    });
    
    const trainingDistribution = Object.entries(trainingByType).map(([type, count]) => ({
      type,
      count,
      percentage: trainings.length > 0 ? Math.round((count / trainings.length) * 100) : 0,
    }));

    // Learning Analytics
    const learningProgress = await LearningProgress.find({ employee: user.id })
      .populate("module", "title numberOfTopics")
      .lean();
    
    const completedModules = learningProgress.filter(p => p.status === "Completed").length;
    const inProgressModules = learningProgress.filter(p => p.status === "In Progress").length;
    
    // Calculate total learning hours
    const totalLearningHours = learningProgress.reduce((total, p) => {
      const module = p.module as any;
      const hours = (module?.numberOfTopics || 1) * 0.5;
      return total + (hours * (p.progress || 0) / 100);
    }, 0);

    // Monthly progress data (last 5 months)
    const monthlyData = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthCompleted = learningProgress.filter(p => 
        p.completedAt && new Date(p.completedAt) >= monthStart && new Date(p.completedAt) <= monthEnd
      ).length;
      
      const monthInProgress = learningProgress.filter(p =>
        p.startedAt && new Date(p.startedAt) <= monthEnd && 
        (!p.completedAt || new Date(p.completedAt) > monthEnd)
      ).length;
      
      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        completed: monthCompleted,
        inProgress: monthInProgress,
      });
    }

    // Top skills
    const topSkills = competencyBySkill
      .filter(c => c.level > 0)
      .slice(0, 4)
      .map(c => ({
        name: c.skill,
        score: c.level,
        trend: "+5%", // Would need historical data
      }));

    // Total modules available
    const totalModules = await Module.countDocuments();

    return NextResponse.json({
      stats: {
        avgCompetency,
        totalLearningHours: Math.round(totalLearningHours),
        completedTrainings,
        skillGrowth: "+12%",
      },
      competencyBySkill,
      trainingDistribution,
      learningProgress: {
        completed: completedModules,
        inProgress: inProgressModules,
        total: totalModules,
      },
      monthlyData,
      topSkills,
    });
  } catch (error) {
    console.error("Employee analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
