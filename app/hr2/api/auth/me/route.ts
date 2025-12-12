import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return NextResponse.json(
                { message: "Server configuration error" },
                { status: 500 }
            );
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
        );

        return NextResponse.json({
            user: {
                id: payload.id,
                email: payload.email,
                fullName: payload.fullName,
                role: payload.role,
            },
        });
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { message: "Invalid or expired token" },
            { status: 401 }
        );
    }
}
