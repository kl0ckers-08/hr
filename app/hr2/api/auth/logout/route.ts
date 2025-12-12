import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const response = NextResponse.json(
        { message: "Logged out successfully" },
        { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set({
        name: "token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    return response;
}
