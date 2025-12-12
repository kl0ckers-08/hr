// app/hr2/api/employee/learning/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LearningProgress from "@/models/hr2/employee/LearningProgress";
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

// GET - Get employee's learning progress with modules
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

    // Get all modules
    const modules = await Module.find({}).lean();
    
    // Get user's progress for all modules
    const progressRecords = await LearningProgress.find({ employee: user.id }).lean();
    
    // Create a map of module progress
    const progressMap = new Map(progressRecords.map(p => [p.module.toString(), p]));

    // Combine modules with progress
    const modulesWithProgress = modules.map(module => {
      const progress = progressMap.get(module._id.toString());
      return {
        ...module,
        userProgress: progress || {
          status: "Not Started",
          progress: 0,
          quizScore: null,
          completedTopics: [],
        }
      };
    });

    // Calculate stats
    const totalModules = modules.length;
    const completed = progressRecords.filter(p => p.status === "Completed").length;
    const inProgress = progressRecords.filter(p => p.status === "In Progress").length;

    return NextResponse.json({
      modules: modulesWithProgress,
      stats: {
        totalModules,
        completed,
        inProgress,
        notStarted: totalModules - completed - inProgress,
      }
    });
  } catch (error) {
    console.error("Learning fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch learning data" }, { status: 500 });
  }
}

// POST - Update learning progress
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
    const { moduleId, progress, quizScore, completedTopics, status } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    await connectDB();

    const updateData: any = {
      employee: user.id,
      module: moduleId,
    };

    if (progress !== undefined) updateData.progress = progress;
    if (quizScore !== undefined) updateData.quizScore = quizScore;
    if (completedTopics) updateData.completedTopics = completedTopics;
    
    // Determine status based on progress
    if (status) {
      updateData.status = status;
    } else if (progress === 100) {
      updateData.status = "Completed";
      updateData.completedAt = new Date();
    } else if (progress > 0) {
      updateData.status = "In Progress";
      updateData.startedAt = new Date();
    }

    const learningProgress = await LearningProgress.findOneAndUpdate(
      { employee: user.id, module: moduleId },
      updateData,
      { upsert: true, new: true }
    );

    return NextResponse.json(learningProgress, { status: 200 });
  } catch (error) {
    console.error("Learning progress update error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
