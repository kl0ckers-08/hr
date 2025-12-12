import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
    console.log("🔍 Checking auth status...");

    const token = req.cookies.get("token")?.value;

    if (!token) {
        console.log("❌ No token in cookies");
        return NextResponse.json({ user: null }, { status: 401 });
    }

    if (!JWT_SECRET) {
        return NextResponse.json({ user: null }, { status: 500 });
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
        );

        console.log("✅ User found:", payload);

        return NextResponse.json({
            user: {
                id: payload.id,
                fullName: payload.fullName,
                email: payload.email,
                role: payload.role,
            },
        });
    } catch (error) {
        console.error("❌ Invalid token:", error);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}