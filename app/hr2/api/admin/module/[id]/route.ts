// app/hr2/api/admin/module/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Module from "@/models/module";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import crypto from "crypto";
import path from "path";
import { ObjectId } from "mongodb";

export const config = { api: { bodyParser: false } };

await connectDB();

const storage = new GridFsStorage({
  db: mongoose.connection.db,
  file: (req: any, file: any) =>
    new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname);
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + ext;
        resolve({ filename, bucketName: "modules" });
      });
    }),
});

const upload = multer({ storage }).single("file");

// Helper to delete file from GridFS by ObjectId
async function deleteGridFsFile(fileId?: any) {
  if (!fileId) return;
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "modules" });
    await bucket.delete(new ObjectId(fileId));
  } catch (err) {
    // ignore if file not found
    console.warn("deleteGridFsFile error", err.message || err);
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const module = await Module.findById(params.id);
    if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(module);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // support multipart (possible file) - use multer wrapper
  return new Promise((resolve) => {
    upload(req as any, {} as any, async (err: any) => {
      if (err) return resolve(NextResponse.json({ error: err.message }, { status: 500 }));

      try {
        const body = (req as any).body || {};
        const title = body.title;
        const description = body.description;
        const category = body.category;
        const numberOfTopics = Number(body.numberOfTopics) || 1;

        let targetRoles: string[] = [];
        if (Array.isArray(body.targetRoles)) targetRoles = body.targetRoles;
        else if (typeof body.targetRoles === "string") targetRoles = [body.targetRoles];

        const file = (req as any).file;

        // Find existing module
        const existing = await Module.findById(params.id);
        if (!existing) return resolve(NextResponse.json({ error: "Not found" }, { status: 404 }));

        // If a new file was uploaded, delete old GridFS file (if present) and set new file metadata
        if (file) {
          await deleteGridFsFile(existing.fileId);
          existing.fileName = file.filename;
          existing.filePath = `/hr2/api/admin/module/file/${file.filename}`;
          existing.fileId = file.id;
        }

        existing.title = title ?? existing.title;
        existing.description = description ?? existing.description;
        existing.category = category ?? existing.category;
        existing.numberOfTopics = numberOfTopics ?? existing.numberOfTopics;
        existing.targetRoles = targetRoles.length ? targetRoles : existing.targetRoles;

        await existing.save();
        resolve(NextResponse.json(existing));
      } catch (error: any) {
        resolve(NextResponse.json({ error: error.message }, { status: 500 }));
      }
    });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await Module.findById(params.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // delete GridFS file if present
    await deleteGridFsFile(existing.fileId);

    await Module.deleteOne({ _id: params.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
