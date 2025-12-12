// app/hr1/api/files/delete/route.ts (ADMIN only - secure this)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const fileId = body.fileId;
    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    await bucket.delete(new ObjectId(fileId));
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
