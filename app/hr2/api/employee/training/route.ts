// app/hr2/api/employee/training/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrainingProgram from "@/models/hr2/admin/TrainingProgram";
import { verifyToken } from "@/lib/auth";
import { jwtVerify } from "jose";

async function getUserFromToken(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch {
    return null;
  }
}

// GET - Get all training programs and employee's registrations
export async function GET(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all training programs
    const trainings = await TrainingProgram.find({})
      .sort({ date: 1 })
      .lean();

    // Get user's registrations (training IDs where user is registered)
    const myRegistrations = trainings
      .filter((t) =>
        t.registrations?.some(
          (r: { toString: () => string }) => r.toString() === user.id
        )
      )
      .map((t) => t._id.toString());

    // Get user's completed trainings (where user is in attendees)
    const myCompleted = trainings
      .filter(
        (t) =>
          t.status === "Completed" &&
          t.attendees?.some(
            (a: { toString: () => string }) => a.toString() === user.id
          )
      )
      .map((t) => t._id.toString());

    // Calculate stats
    const upcomingCount = trainings.filter(
      (t) =>
        t.status === "Upcoming" &&
        !t.registrations?.some(
          (r: { toString: () => string }) => r.toString() === user.id
        )
    ).length;
    const registeredCount = myRegistrations.length;
    const completedCount = myCompleted.length;

    return NextResponse.json({
      trainings,
      myRegistrations,
      stats: {
        upcoming: upcomingCount,
        registered: registeredCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    console.error("Training fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trainings" },
      { status: 500 }
    );
  }
}

// POST - Register for a training program
export async function POST(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { trainingId } = body;

    if (!trainingId) {
      return NextResponse.json(
        { error: "Training ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the training program
    const training = await TrainingProgram.findById(trainingId);

    if (!training) {
      return NextResponse.json(
        { error: "Training program not found" },
        { status: 404 }
      );
    }

    // Check if already registered
    if (training.registrations?.includes(user.id)) {
      return NextResponse.json(
        { error: "Already registered for this training" },
        { status: 400 }
      );
    }

    // Check if training is full
    if (training.registrations?.length >= training.maxParticipants) {
      return NextResponse.json(
        { error: "Training is full" },
        { status: 400 }
      );
    }

    // Check if training is still upcoming
    if (training.status !== "Upcoming") {
      return NextResponse.json(
        { error: "Cannot register for this training" },
        { status: 400 }
      );
    }

    // Add user to registrations
    training.registrations.push(user.id);
    await training.save();

    return NextResponse.json(
      { message: "Successfully registered for training" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Training registration error:", error);
    return NextResponse.json(
      { error: "Failed to register for training" },
      { status: 500 }
    );
  }
}
