import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import { Types } from "mongoose";

// DELETE - Delete a question by ID
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid question ID" },
                { status: 400 }
            );
        }

        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return NextResponse.json(
                { message: "Question not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Question deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json(
            { message: "Failed to delete question" },
            { status: 500 }
        );
    }
}

// GET - Get a single question by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid question ID" },
                { status: 400 }
            );
        }

        const question = await Question.findById(id);

        if (!question) {
            return NextResponse.json(
                { message: "Question not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(question, { status: 200 });
    } catch (error) {
        console.error("Error fetching question:", error);
        return NextResponse.json(
            { message: "Failed to fetch question" },
            { status: 500 }
        );
    }
}

// PATCH - Update a question by ID
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid question ID" },
                { status: 400 }
            );
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedQuestion) {
            return NextResponse.json(
                { message: "Question not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Question updated successfully", question: updatedQuestion },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json(
            { message: "Failed to update question" },
            { status: 500 }
        );
    }
}
