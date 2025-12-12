// app/api/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import { Types } from "mongoose";
import mongoose from "mongoose";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUserIdFromCookie(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.id as string;
  } catch {
    return null;
  }
}

// Helper to unwrap params
async function getParams(params: any) {
  return params instanceof Promise ? await params : params;
}

async function streamFromBucket(bucket: GridFSBucket, fileId: string) {
  const id = Types.ObjectId.isValid(fileId) ? new Types.ObjectId(fileId) : null;
  if (!id) return { stream: null, file: null };

  const files = await bucket.find({ _id: id }).toArray();
  if (!files || files.length === 0) return { stream: null, file: null };

  const file = files[0];
  const downloadStream = bucket.openDownloadStream(id);

  const stream = new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk) => controller.enqueue(chunk));
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (err) => controller.error(err));
    },
  });

  return { stream, file };
}

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const userId = await getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fileId } = await getParams(context.params);

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Try primary bucket, then fallback to legacy "uploads" bucket for older files
    const primaryBucket = new GridFSBucket(db, { bucketName: "uploads" });
    const legacyBucket = new GridFSBucket(db, { bucketName: "uploads" });

    let { stream, file } = await streamFromBucket(primaryBucket, fileId);
    if (!stream || !file) {
      ({ stream, file } = await streamFromBucket(legacyBucket, fileId));
    }

    if (!stream || !file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    // allow inline preview with ?inline=1
    const url = new URL(req.url);
    const inline = url.searchParams.get("inline") === "1";
    const disposition = `${inline ? "inline" : "attachment"}; filename="${file.filename}"`;

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": (file as any).contentType || "application/octet-stream",
        "Content-Disposition": disposition,
      },
    });
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: any }) {
  try {
    const userId = await getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fileId } = await getParams(context.params);

    if (!Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    await bucket.delete(new Types.ObjectId(fileId));

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
