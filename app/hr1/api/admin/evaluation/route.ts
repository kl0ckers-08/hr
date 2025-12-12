// API route to fetch all applicants with their evaluation status
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Application } from "@/models/Applications";
import EvaluationResult from "@/models/EvaluationResult";

export async function GET() {
  try {
    await connectDB();

    // Get all applications with job details
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .lean();

    // Get all jobs for department info
    const jobs = await Job.find().lean();
    const jobMap = new Map(jobs.map((j: any) => [j._id.toString(), j]));

    // Get all evaluation results
    const evaluationResults = await EvaluationResult.find().lean();
    const evalMap = new Map(
      evaluationResults.map((e: any) => [e.applicationId?.toString(), e])
    );

    // Get unique departments
    const departments = [...new Set(jobs.map((j: any) => j.department).filter(Boolean))];

    // Map applications with evaluation status
    const applicantsWithEval = applications.map((app: any) => {
      const job = jobMap.get(app.jobId?.toString());
      const evaluation = evalMap.get(app._id?.toString());

      return {
        _id: app._id?.toString(),
        fullName: app.fullName,
        email: app.email,
        jobId: app.jobId?.toString(),
        jobTitle: job?.title || app.jobTitle || "Unknown Position",
        department: job?.department || "Unassigned",
        employmentType: job?.employmentType || "",
        status: app.status,
        appliedAt: app.appliedAt,
        // Evaluation data
        hasEvaluation: !!evaluation,
        evaluationScore: evaluation?.score ?? null,
        evaluationTotal: evaluation?.totalQuestions ?? null,
        evaluationSubmittedAt: evaluation?.submittedAt ?? null,
        // Documents
        hasResume: !!app.resume?.fileId,
        hasApplicationLetter: !!app.applicationLetter?.fileId,
      };
    });

    // Calculate stats
    const stats = {
      total: applicantsWithEval.length,
      pendingEvaluation: applicantsWithEval.filter((a: any) => !a.hasEvaluation).length,
      completedEvaluation: applicantsWithEval.filter((a: any) => a.hasEvaluation).length,
      departments: departments,
    };

    return NextResponse.json({
      applicants: applicantsWithEval,
      stats,
      departments,
    }, { status: 200 });

  } catch (error) {
    console.error("Error loading applicants for evaluation:", error);
    return NextResponse.json(
      { error: "Failed to load applicants" },
      { status: 500 }
    );
  }
}
