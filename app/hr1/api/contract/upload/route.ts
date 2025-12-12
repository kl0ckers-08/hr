// app/hr1/api/contract/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { ObjectId } from "mongoose";
import { GridFSBucket } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const form = await req.formData();
    const applicationId = form.get("applicationId")?.toString();
    const file = form.get("file") as File | null;

    if (!applicationId || !file) {
      return NextResponse.json({ error: "applicationId and file are required" }, { status: 400 });
    }

    const app = await Application.findById(applicationId);
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });

    // upload new signed contract
    const uploadStream = bucket.openUploadStream(file.name, { contentType: file.type });
    uploadStream.end(buffer);

    return new Promise<NextResponse>((resolve, reject) => {
      uploadStream.on("finish", async () => {
        const fileId = uploadStream.id.toString();

        const fileDoc = {
          fileId,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
        };

        // If there is an existing signedContract, attempt to delete its GridFS file
        if (app.signedContract?.fileId) {
          try {
            const oldId = new ObjectId(app.signedContract.fileId);
            await bucket.delete(oldId);
          } catch (e) {
            // log but don't fail the upload if deletion fails
            console.warn("Failed to delete old signed contract from GridFS", e);
          }
        }

        await Application.findByIdAndUpdate(applicationId, { signedContract: fileDoc });

        resolve(NextResponse.json({ message: "Signed contract uploaded", file: fileDoc }));
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload error:", err);
        reject(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
      });
    });
  } catch (err) {
    console.error("Signed contract upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
