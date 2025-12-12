// app/hr2/api/admin/module/file/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Grid from "gridfs-stream";

await connectDB();

function nodeStreamToWeb(stream: NodeJS.ReadableStream) {
  const reader = stream[Symbol.asyncIterator] ? stream[Symbol.asyncIterator]() : null;
  // Create a Web ReadableStream that pulls from the Node stream
  return new ReadableStream({
    async pull(controller) {
      if (!reader) {
        // fallback: convert using 'data' event
        return;
      }
      try {
        const result = await reader.next();
        if (result.done) controller.close();
        else controller.enqueue(new Uint8Array(result.value));
      } catch (err) {
        controller.error(err);
      }
    },
    cancel(reason) {
      stream.destroy();
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const conn = mongoose.connection;
  const gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("modules");

  const file = await gfs.files.findOne({ filename: params.filename });
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const readstream = gfs.createReadStream({ filename: file.filename });

  // Convert Node stream to Web ReadableStream
  const webStream = nodeStreamToWeb(readstream);

  const res = new NextResponse(webStream as any, { status: 200 });
  res.headers.set("Content-Type", file.contentType || "application/octet-stream");
  res.headers.set("Content-Disposition", `attachment; filename="${file.filename}"`);
  return res;
}
