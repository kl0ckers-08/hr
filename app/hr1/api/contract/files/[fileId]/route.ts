// app/hr1/api/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest, { params }: any) {
  const { fileId } = params;
  const inline = req.nextUrl.searchParams.get("inline") === "1";

  try {
    await connectDB();

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    const _id = new ObjectId(fileId);

    const downloadStream = bucket.openDownloadStream(_id);

    const chunks: Uint8Array[] = [];
    return new Promise<NextResponse>((resolve, reject) => {
      downloadStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      downloadStream.on("end", async () => {
        // try to fetch file metadata to determine content-type/filename
        const filesColl = mongoose.connection.db.collection("uploads.files");
        const fileMeta = await filesColl.findOne({ _id });
        const filename = (fileMeta && fileMeta.filename) ? fileMeta.filename : "file";
        const contentType = (fileMeta && fileMeta.contentType) ? fileMeta.contentType : "application/octet-stream";

        const fileBuffer = Buffer.concat(chunks);
        const headers = {
          "Content-Type": contentType,
          "Content-Length": String(fileBuffer.length),
          "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
        };

        resolve(new NextResponse(fileBuffer, { status: 200, headers }));
      });

      downloadStream.on("error", (err) => {
        console.error("GridFS download error:", err);
        reject(NextResponse.json({ error: "File not found" }, { status: 404 }));
      });
    });
  } catch (err) {
    console.error("File fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
