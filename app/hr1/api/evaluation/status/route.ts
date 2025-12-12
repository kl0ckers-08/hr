// app/api/evaluation/status/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import EvaluationResult from "@/models/EvaluationResult";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("cookie")
            ?.split("; ")
            ?.find(c => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ submitted: false }, { status: 200 });
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET!)
        );

        const userId = payload.id;

        const { searchParams } = new URL(req.url);
        const applicationId = searchParams.get("applicationId");

        if (!applicationId) {
            return NextResponse.json(
                { message: "applicationId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const existing = await EvaluationResult.findOne({
            userId,
            applicationId,
        });

        return NextResponse.json({
            submitted: existing ? true : false,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ submitted: false }, { status: 200 });
    }
}
