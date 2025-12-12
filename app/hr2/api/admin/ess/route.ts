// app/hr2/api/admin/ess/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ESSRequest from "@/models/hr2/admin/ESSRequest";
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
  } catch { return null; }
}

// GET - Get all ESS requests (admin view)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const requests = await ESSRequest.find({})
      .populate("employee", "fullName email role")
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === "Pending").length,
      approved: requests.filter(r => r.status === "Approved").length,
      rejected: requests.filter(r => r.status === "Rejected").length,
    };

    return NextResponse.json({ requests, stats });
  } catch (error) {
    console.error("ESS fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch ESS requests" }, { status: 500 });
  }
}

// PUT - Update ESS request status (approve/reject)
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const essRequest = await ESSRequest.findByIdAndUpdate(
      id,
      { 
        status, 
        processedAt: status !== "Pending" ? new Date() : undefined 
      },
      { new: true }
    ).populate("employee", "fullName email role");

    if (!essRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(essRequest);
  } catch (error) {
    console.error("ESS update error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
