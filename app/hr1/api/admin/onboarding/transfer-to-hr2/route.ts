import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Applications";
import User from "@/models/User"; // You'll need your User model

export async function POST(request: Request) {
    try {
        await connectDB();

        const { applicantId } = await request.json();

        if (!applicantId) {
            return NextResponse.json(
                { error: "Applicant ID is required" },
                { status: 400 }
            );
        }

        // Find the application
        const application = await Application.findById(applicantId);

        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        // Check if status is "hired"
        if (application.status !== "hired") {
            return NextResponse.json(
                { error: "Only hired applicants can be transferred to HR2" },
                { status: 400 }
            );
        }

        // Find the user by email or userId from the application
        const user = await User.findOne({ 
            $or: [
                { _id: application.userId },
                { email: application.email }
            ]
        });

        if (!user) {
            return NextResponse.json(
                { error: "User account not found" },
                { status: 404 }
            );
        }

        // Check if already transferred
        if (user.role === "employee2") {
            return NextResponse.json(
                { error: "User has already been transferred to HR2" },
                { status: 400 }
            );
        }

        // Update user role to employee2
        user.role = "employee2";
        await user.save();

        // Optional: Update application to mark as transferred
        application.transferredToHR2 = true;
        application.transferredAt = new Date();
        await application.save();

        return NextResponse.json(
            { 
                message: "Successfully transferred to HR2",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error transferring to HR2:", error);
        return NextResponse.json(
            { error: "Failed to transfer to HR2" },
            { status: 500 }
        );
    }
}