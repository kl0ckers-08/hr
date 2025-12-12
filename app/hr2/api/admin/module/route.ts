// app/hr2/api/admin/module/route.ts
import { NextRequest, NextResponse } from "next/server";
import  dbConnect  from "@/lib/db";
import Module from "@/models/module";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/auth";

// ──────────────────────────────────────────────────────────────
// GET → List all modules
// ──────────────────────────────────────────────────────────────
export async function GET() {
  try {
    await dbConnect();
    const modules = await Module.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────
// POST → Create module + file upload (no multer, no config needed)
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // JWT Auth
    const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const numberOfTopics = Number(formData.get("numberOfTopics"));
    const targetRoles = formData.getAll("targetRoles") as string[];
    const file = formData.get("file") as File | null;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    let fileName: string | null = null;
    let filePath: string | null = null;

    if (file && file.size > 0) {
      const ext = path.extname(file.name).toLowerCase();
      if (![".pdf", ".docx", ".pptx"].includes(ext)) {
        return NextResponse.json({ error: "Only PDF, DOCX, PPTX allowed" }, { status: 400 });
      }
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const uploadDir = path.join(process.cwd(), "public/uploads/modules");
      await mkdir(uploadDir, { recursive: true });

      await writeFile(path.join(uploadDir, filename), buffer);

      fileName = file.name;
      filePath = `/uploads/modules/${filename}`;
    }

    const newModule = await Module.create(
      {
      title,
      description,
      category: category || "Technical",
      numberOfTopics,
      targetRoles: targetRoles.length ? targetRoles : [],
      fileName,
      filePath,
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error: any) {
    console.error("Module create error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}