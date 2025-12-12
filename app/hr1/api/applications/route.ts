import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";
import { Types } from "mongoose";
import { jwtVerify } from "jose";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// -------------------------------
// Get userId from auth cookie
// -------------------------------
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

// -------------------------------
// File validation
// -------------------------------
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const validateFile = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Invalid file type: ${file.name}. Only PDF and Word documents are allowed.`;
  }
  if (file.size > 5 * 1024 * 1024) {
    return `File too large: ${file.name}. Maximum size is 5MB.`;
  }
  return null;
};

// -------------------------------
// Upload file to GridFS
// -------------------------------
async function uploadToGridFS(
  file: File,
  bucket: GridFSBucket
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          originalName: file.name,
          size: file.size,
          uploadedAt: new Date(),
          contentType: file.type,
        },
      });

      uploadStream.on("finish", () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.on("error", (error) => {
        reject(error);
      });

      uploadStream.write(buffer);
      uploadStream.end();
    } catch (error) {
      reject(error);
    }
  });
}

// -------------------------------
// POST — Submit Application
// -------------------------------
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const jobId = formData.get("jobId") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const resumeFile = formData.get("resume") as File;
    const applicationLetterFile = formData.get("applicationLetter") as File;
    const supportingDocsFiles = formData.getAll("supportingDocs") as File[];

    if (!jobId || !fullName || !email || !resumeFile || !applicationLetterFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const resumeError = validateFile(resumeFile);
    if (resumeError) return NextResponse.json({ error: resumeError }, { status: 400 });

    const appLetterError = validateFile(applicationLetterFile);
    if (appLetterError) return NextResponse.json({ error: appLetterError }, { status: 400 });

    for (const file of supportingDocsFiles) {
      const docError = validateFile(file);
      if (docError) return NextResponse.json({ error: docError }, { status: 400 });
    }

    await connectDB();


    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const bucket = new GridFSBucket(db, {
      bucketName: "applicationFiles", // Collection name prefix
    });


    let finalJobTitle = jobTitle || "Unknown Job";

    if (!jobTitle) {
      try {
        const job = await db
          .collection("jobs")
          .findOne({ _id: new Types.ObjectId(jobId) });

        if (job?.title) finalJobTitle = job.title;
      } catch (err) {
        console.error("Error fetching job title:", err);
      }
    }

    console.log("📤 Uploading resume to GridFS...");
    const resumeFileId = await uploadToGridFS(resumeFile, bucket);
    console.log("✅ Resume uploaded:", resumeFileId);

    console.log("📤 Uploading application letter to GridFS...");
    const applicationLetterFileId = await uploadToGridFS(applicationLetterFile, bucket);
    console.log("✅ Application letter uploaded:", applicationLetterFileId);

    const supportingDocsData = [];
    for (const file of supportingDocsFiles) {
      console.log(`📤 Uploading supporting doc: ${file.name}...`);
      const fileId = await uploadToGridFS(file, bucket);
      console.log(`✅ Supporting doc uploaded: ${fileId}`);
      
      supportingDocsData.push({
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        fileId: fileId,
        uploadedAt: new Date(),
      });
    }

    const application = await Application.create({
      jobId: new Types.ObjectId(jobId),
      userId: new Types.ObjectId(userId),
      jobTitle: finalJobTitle,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      coverLetter: coverLetter.trim(),
      resume: {
        filename: resumeFile.name,
        size: resumeFile.size,
        mimeType: resumeFile.type,
        fileId: resumeFileId, 
        uploadedAt: new Date(),
      },
      applicationLetter: {
        filename: applicationLetterFile.name,
        size: applicationLetterFile.size,
        mimeType: applicationLetterFile.type,
        fileId: applicationLetterFileId, 
        uploadedAt: new Date(),
      },
      supportingDocs: supportingDocsData,
      status: "pending",
    });

    console.log("✅ Application created successfully:", application._id);

    return NextResponse.json(
      { 
        message: "Application submitted successfully", 
        applicationId: application._id 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /applications error:", error);

    if (error?.message?.includes("E11000")) {
      return NextResponse.json(
        { error: "You already applied to this job." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

// -------------------------------
// GET — Fetch user applications
// -------------------------------
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");

    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const filter: any = { userId: new Types.ObjectId(userId) };
    if (jobId && Types.ObjectId.isValid(jobId)) {
      filter.jobId = new Types.ObjectId(jobId);
    }

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Application.countDocuments(filter);

    const responseApps = applications.map((app: any) => ({
      ...app,
      _id: app._id.toString(),
      jobId: app.jobId.toString(),
      userId: app.userId.toString(),
    }));

    return NextResponse.json(
      {
        applications: responseApps,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ GET /applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}