import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";
import Job from "@/models/Job";
import EvaluationResult from "@/models/EvaluationResult";
import { Types } from "mongoose";

// GET - Fetch all applications for a specific job with evaluation scores
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id: jobId } = await params;

        if (!jobId || !Types.ObjectId.isValid(jobId)) {
            return NextResponse.json(
                { error: "Valid jobId is required" },
                { status: 400 }
            );
        }

        // Fetch all applications for this job
        const applications = await Application.find({ jobId: new Types.ObjectId(jobId) })
            .sort({ appliedAt: -1 })
            .lean();

        // Fetch evaluation results for all applications
        const applicationIds = applications.map((app: any) => app._id);
        const evaluationResults = await EvaluationResult.find({
            applicationId: { $in: applicationIds }
        }).lean();

        // Create a map of applicationId -> evaluation result
        const evaluationMap = new Map<string, any>();
        evaluationResults.forEach((result: any) => {
            evaluationMap.set(result.applicationId.toString(), {
                score: result.score,
                totalQuestions: result.totalQuestions,
                submittedAt: result.submittedAt,
            });
        });

        // Combine applications with evaluation data
        const formattedApplications = applications.map((app: any) => {
            const evaluationData = evaluationMap.get(app._id.toString());
            return {
                _id: app._id?.toString(),
                userId: app.userId?.toString(),
                jobId: app.jobId?.toString(),
                fullName: app.fullName || "Unknown",
                email: app.email || "",
                status: app.status || "pending",
                appliedAt: app.appliedAt || app.createdAt,
                resume: app.resume,
                applicationLetter: app.applicationLetter,
                supportingDocs: app.supportingDocs,
                validId: app.validId,
                portfolio: app.portfolio,
                certificates: app.certificates,
                requestedDocsSubmitted: app.requestedDocsSubmitted,
                requestedDocsSubmittedAt: app.requestedDocsSubmittedAt,
                contract: app.contract,
                signedContract: app.signedContract,
                // Evaluation data
                evaluationScore: evaluationData?.score || null,
                evaluationTotal: evaluationData?.totalQuestions || null,
                evaluationSubmittedAt: evaluationData?.submittedAt || null,
                hasEvaluation: !!evaluationData,
            };
        });

        return NextResponse.json({ applications: formattedApplications }, { status: 200 });
    } catch (error) {
        console.error("GET /admin/evaluation/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to load applications" },
            { status: 500 }
        );
    }
}

// PATCH - Update application status or document approval
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id: jobId } = await params;
        const body = await req.json();
        const { applicationId, status, requestedDocsApproved } = body;

        if (!applicationId || !Types.ObjectId.isValid(applicationId)) {
            return NextResponse.json(
                { error: "Valid applicationId is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};

        // Update status if provided
        if (status) {
            const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "hired"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { error: "Invalid status" },
                    { status: 400 }
                );
            }
            updateData.status = status;
        }

        // Handle document approval (when requestedDocsApproved is explicitly set)
        if (requestedDocsApproved !== undefined) {
            if (requestedDocsApproved === true) {
                // Approved - move to hired status
                updateData.status = "hired";
            } else {
                // Rejected - move back to shortlisted or pending
                updateData.status = "shortlisted";
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const result = await Application.findByIdAndUpdate(
            applicationId,
            { $set: updateData },
            { new: true }
        );

        if (!result) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, application: result }, { status: 200 });
    } catch (error) {
        console.error("PATCH /admin/evaluation/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update application" },
            { status: 500 }
        );
    }
}

