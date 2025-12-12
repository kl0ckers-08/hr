import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";

export async function PATCH(request: Request) {
    try {
        await connectDB();

        const { applicantId, onboardingStatus } = await request.json();

        if (!applicantId || !onboardingStatus) {
            return NextResponse.json(
                { error: "Applicant ID and onboarding status are required" },
                { status: 400 }
            );
        }

        // Validate onboarding status
        const validStatuses = ["pending", "in_progress", "completed"];
        if (!validStatuses.includes(onboardingStatus)) {
            return NextResponse.json(
                { error: "Invalid onboarding status" },
                { status: 400 }
            );
        }

        // Update the application
        const application = await Application.findByIdAndUpdate(
            applicantId,
            { 
                onboardingStatus,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                message: "Onboarding status updated successfully",
                application: {
                    _id: application._id,
                    onboardingStatus: application.onboardingStatus
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating onboarding status:", error);
        return NextResponse.json(
            { error: "Failed to update onboarding status" },
            { status: 500 }
        );
    }
}
