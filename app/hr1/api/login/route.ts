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
  role: "employee" | "admin" | "hr";
}

const INVALID_CREDENTIALS = "Invalid email or password";
const SERVER_ERROR = "Server error";
const JWT_CONFIG_ERROR = "Server configuration error";
const JWT_EXPIRATION = "24h";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function POST(req: NextRequest) {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return NextResponse.json(
        { message: "Method not allowed" },
        { status: 405 }
      );
    }

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

    // Validate password is a string
    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { message: INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email (case-insensitive) and explicitly select password
    const user = await User.findOne({ email: trimmedEmail }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json(
        { message: INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    // Check if account is locked (optional - add this field to User model if needed)
    // if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    //   return NextResponse.json(
    //     { message: "Account temporarily locked. Try again later." },
    //     { status: 429 }
    //   );
    // }

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
      // Optional: Track failed login attempts
      // await User.findByIdAndUpdate(user._id, {
      //   $inc: { failedLoginAttempts: 1 },
      //   ...(failedAttempts >= MAX_LOGIN_ATTEMPTS && {
      //     lockedUntil: new Date(Date.now() + LOCKOUT_TIME),
      //   }),
      // });

      return NextResponse.json(
        { message: INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    // Validate JWT_SECRET exists
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined in environment variables");
      return NextResponse.json(
        { message: JWT_CONFIG_ERROR },
        { status: 500 }
      );
    }

    // Create JWT payload with all necessary user info
    const jwtPayload: JWTPayload = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role || "employee",
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

    // Optional: Reset failed login attempts on successful login
    // await User.findByIdAndUpdate(user._id, {
    //   failedLoginAttempts: 0,
    //   lockedUntil: null,
    //   lastLogin: new Date(),
    // });

    // Prepare response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          role: user.role || "employee",
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
      maxAge: 24 * 60 * 60, // 24 hours in seconds
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