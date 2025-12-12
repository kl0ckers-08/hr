"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Lottie from "react-lottie-player";
import eyeAnimation from "../../public/Eyeblinking.json";

interface LoginResponse {
    user: {
        _id: string;
        email: string;
        role: "employee" | "admin" | "hr" | "hr1admin";
        name?: string;
    };
    message?: string;
}

export default function LoginForm({
    onCreateAccount,
}: {
    onCreateAccount: () => void;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [play, setPlay] = useState(false);
    const [segment, setSegment] = useState<[number, number]>([80, 80]);

    const router = useRouter();

    const togglePassword = () => {
        if (showPassword) {
            setSegment([0, 80]);
            setTimeout(() => setSegment([80, 80]), 200);
        } else {
            setSegment([80, 0]);
            setTimeout(() => setSegment([0, 0]), 200);
        }
        setPlay(true);
        setTimeout(() => setPlay(false), 230);
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/hr1/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data: LoginResponse = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed. Please try again.");
                setLoading(false);
                return;
            }

            // ✅ Login successful
            console.log("✅ Logged in successfully!");
            console.log("👤 User:", data.user);
            console.log("🔐 Role:", data.user.role);

            // Role-based routing
            if (data.user.role === "hr1admin" ) {
                console.log("📊 Redirecting to Admin Dashboard...");
                router.push("/hr1/admin/");
            } else if (data.user.role === "employee") {
                console.log("💼 Redirecting to Employee Dashboard...");
                router.push("/hr1/employee/job-postings");
            } else {
                setError("Unknown user role. Please contact support.");
                setLoading(false);
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Login error:", err);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[450px] mx-auto my-0 border-r-4 bg-white p-10 shadow-2xl shadow-black rounded-2xl">
            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-2 w-full mx-auto my-0"
            >
                {/* ERROR MESSAGE */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg mb-2">
                        {error}
                    </div>
                )}

                {/* LOGO & HEADER */}
                <div className="logo w-full flex flex-col items-center justify-center mb-6">
                    <div className="out w-[4.5em] h-[4.5em] mx-auto mb-4 bg-[rgb(89,85,179)] rounded-3xl flex items-center justify-center">
                        <div className="in w-[3em] h-[3em] mx-auto bg-white rounded-2xl flex items-center justify-center">
                            <div className="inr w-[2.5em] h-[2.5em] mx-auto bg-[rgb(89,85,179)] rounded-xl"></div>
                        </div>
                    </div>
                    <h1 className="text-center text-gray-900 font-bold text-2xl">Sign In</h1>
                    <p className="text-center text-gray-500 text-sm mt-1">
                        Access HR Management System
                    </p>
                </div>

                {/* EMAIL FIELD */}
                <div className="mb-4">
                    <label className="text-gray-600 text-sm font-medium block mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="your email@qcu.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full text-[#333] h-10 px-3 border border-gray-300 rounded-lg text-sm outline-0 focus:ring-2 focus:ring-[rgb(89,85,179)] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 transition"
                    />
                </div>

                {/* PASSWORD FIELD */}
                <div className="mb-2">
                    <div className="w-full flex justify-between items-center mb-2">
                        <label className="text-gray-600 text-sm font-medium">
                            Password
                        </label>
                        <Link
                            href="#"
                            className="text-[rgb(89,85,179)] text-xs hover:underline transition"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <div className="w-full flex justify-between items-center relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="w-full h-10 pl-3 pr-12 text-gray-900 text-sm rounded-lg outline-0 border border-gray-300 focus:ring-2 focus:ring-[rgb(89,85,179)] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 transition"
                        />

                        <button
                            type="button"
                            onClick={togglePassword}
                            disabled={loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center disabled:opacity-50 transition"
                            aria-label="Toggle password visibility"
                        >
                            <Lottie
                                loop={false}
                                play={play}
                                goTo={segment[0]}
                                segments={segment}
                                animationData={eyeAnimation}
                                style={{ width: 20, height: 20 }}
                            />
                        </button>
                    </div>
                </div>

                {/* SIGN IN BUTTON */}
                <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full h-11 rounded-lg bg-[rgb(89,85,179)] text-white font-semibold text-sm mt-6 mb-4 hover:bg-[rgb(75,72,178)] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Signing in...
                        </span>
                    ) : (
                        "Sign In"
                    )}
                </button>

                {/* CREATE ACCOUNT LINK */}
                <div className="text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{" "}
                        <button
                            onClick={onCreateAccount}
                            type="button"
                            className="text-[rgb(89,85,179)] font-semibold hover:underline transition"
                            disabled={loading}
                        >
                            Create Account
                        </button>
                    </p>
                </div>

                {/* INFO BOX */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
                    <p className="font-semibold text-blue-900 mb-1">ℹ️ Auto-Detection</p>
                    <p>
                        Your role (Employee/Admin) is automatically determined based on your account type. You'll be redirected to the appropriate dashboard after login.
                    </p>
                </div>
            </form>
        </div>
    );
}