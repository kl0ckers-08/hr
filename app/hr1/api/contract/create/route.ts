// app/hr1/api/contract/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const form = await req.formData();
        const applicationId = form.get("applicationId")?.toString();
        const file = form.get("file") as File | null;

        if (!applicationId || !file) {
            return NextResponse.json({ error: "applicationId and file are required" }, { status: 400 });
        }

        // read file into buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });

        const uploadStream = bucket.openUploadStream(file.name, {
            contentType: file.type,
        });

        uploadStream.end(buffer);

        return new Promise<NextResponse>((resolve, reject) => {
            uploadStream.on("finish", async () => {
                const fileId = uploadStream.id.toString();

                // update application.contract
                const fileDoc = {
                    fileId,
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type,
                    uploadedAt: new Date(),
                };

                await Application.findByIdAndUpdate(applicationId, { contract: fileDoc });

                resolve(NextResponse.json({ message: "Contract uploaded", file: fileDoc }));
            });

            uploadStream.on("error", (err) => {
                console.error("GridFS upload error:", err);
                reject(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
            });
        });
    } catch (err) {
        console.error("Contract create error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
