// app/hr2/api/admin/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

// GET - Get all reports
export async function GET(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Return sample reports data
    const reports = [
      {
        _id: "1",
        title: "Monthly Training Report",
        type: "Training",
        generatedBy: "Admin",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        title: "Competency Assessment Summary",
        type: "Competency",
        generatedBy: "Admin",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: "3",
        title: "Employee Learning Progress",
        type: "Learning",
        generatedBy: "Admin",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    const stats = {
      totalReports: 22,
      thisMonth: 5,
      reportTypes: 6,
      departments: 3,
    };

    return NextResponse.json({ reports, stats });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
