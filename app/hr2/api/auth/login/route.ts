import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

interface LoginPayload {
    email?: string;
    password?: string;
}

interface JWTPayload {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

const INVALID_CREDENTIALS = "Invalid email or password";
const SERVER_ERROR = "Server error";
const JWT_CONFIG_ERROR = "Server configuration error";
const JWT_EXPIRATION = "24h";

export async function POST(req: NextRequest) {
    try {
        // Parse and validate request body
        let payload: LoginPayload;
        try {
            payload = await req.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid request format" },
                { status: 400 }
            );
        }

        const { email, password } = payload;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedEmail = email.trim().toLowerCase();
        if (!emailRegex.test(trimmedEmail)) {
            return NextResponse.json(
                { message: INVALID_CREDENTIALS },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Find user by email and explicitly select password
        const user = await User.findOne({ email: trimmedEmail }).select("+password");

        if (!user) {
            return NextResponse.json(
                { message: INVALID_CREDENTIALS },
                { status: 401 }
            );
        }

        // Verify it's an HR2 user (hr2admin or employee2)
        if (!["hr2admin", "employee2"].includes(user.role)) {
            return NextResponse.json(
                { message: "Unauthorized for HR2 system" },
                { status: 403 }
            );
        }

        // Compare passwords using bcrypt
        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            console.error("❌ Password comparison error:", bcryptError);
            return NextResponse.json(
                { message: SERVER_ERROR },
                { status: 500 }
            );
        }

        if (!passwordMatch) {
            return NextResponse.json(
                { message: INVALID_CREDENTIALS },
                { status: 401 }
            );
        }

        // Validate JWT_SECRET exists
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error("❌ JWT_SECRET is not defined");
            return NextResponse.json(
                { message: JWT_CONFIG_ERROR },
                { status: 500 }
            );
        }

        // Create JWT payload
        const jwtPayload: JWTPayload = {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        };

        // Sign JWT token
        let token: string;
        try {
            token = await new SignJWT(jwtPayload)
                .setProtectedHeader({ alg: "HS256" })
                .setExpirationTime(JWT_EXPIRATION)
                .setIssuedAt()
                .sign(new TextEncoder().encode(JWT_SECRET));
        } catch (tokenError) {
            console.error("❌ Token signing error:", tokenError);
            return NextResponse.json(
                { message: JWT_CONFIG_ERROR },
                { status: 500 }
            );
        }

        // Prepare response
        const response = NextResponse.json(
            {
                message: "Login successful",
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            },
            { status: 200 }
        );

        // Set secure HttpOnly cookie
        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60, // 24 hours
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("❌ Login error:", error);
        return NextResponse.json(
            { message: SERVER_ERROR },
            { status: 500 }
        );
    }
}
