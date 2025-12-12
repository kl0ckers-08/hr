import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getGridFSBucket } from "@/lib/gridfs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        await connectDB();

        // Parse form-data
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "File missing" }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const bucket = getGridFSBucket();

        // Upload to GridFS
        const uploadStream = bucket.openUploadStream(file.name, {
            contentType: file.type,
        });

        uploadStream.end(buffer);

        return new Promise((resolve, reject) => {
            uploadStream.on("finish", (uploadedFile) => {
                resolve(
                    NextResponse.json({
                        message: "File uploaded",
                        fileId: uploadedFile._id.toString(),
                    })
                );
            });

            uploadStream.on("error", (err) => {
                reject(NextResponse.json({ error: err.message }, { status: 500 }));
            });
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
