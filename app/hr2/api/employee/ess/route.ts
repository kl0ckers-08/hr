// app/hr2/api/employee/ess/route.ts
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
  } catch {
    return null;
  }
}

// GET - Get employee's ESS requests
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

    const requests = await ESSRequest.find({ employee: user.id })
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

// POST - Create new ESS request
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
    const { type, reason } = body;

    if (!type || !reason) {
      return NextResponse.json({ error: "Type and reason are required" }, { status: 400 });
    }

    await connectDB();

    const essRequest = await ESSRequest.create({
      employee: user.id,
      type,
      reason,
      status: "Pending",
    });

    return NextResponse.json(essRequest, { status: 201 });
  } catch (error) {
    console.error("ESS create error:", error);
    return NextResponse.json({ error: "Failed to create ESS request" }, { status: 500 });
  }
}

// DELETE - Cancel a pending ESS request
export async function DELETE(req: NextRequest) {
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
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    await connectDB();

    // Find and delete only if it belongs to the user and is still pending
    const essRequest = await ESSRequest.findOneAndDelete({
      _id: requestId,
      employee: user.id,
      status: "Pending",
    });

    if (!essRequest) {
      return NextResponse.json({ error: "Request not found or cannot be cancelled" }, { status: 404 });
    }

    return NextResponse.json({ message: "Request cancelled successfully" });
  } catch (error) {
    console.error("ESS delete error:", error);
    return NextResponse.json({ error: "Failed to cancel ESS request" }, { status: 500 });
  }
}
