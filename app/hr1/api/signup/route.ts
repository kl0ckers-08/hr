// ========================================
// FILE 2: hr1/api/signup/route.ts
// ========================================
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { fullName, email, password, confirmPassword } = await req.json();

    // Validate fields
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectDB();

    // Check if email exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role: employee
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "employee",
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          _id: newUser._id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}