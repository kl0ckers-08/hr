// ========================================
// FILE 3: components/SignUpForm.tsx
// ========================================
"use client";

import { useState } from "react";

interface SignUpFormProps {
  onSignIn: () => void;
}

export default function SignUpForm({ onSignIn }: SignUpFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/hr1/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create account");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onSignIn();
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-w-[350px] mx-auto my-0 border-r-4 bg-white p-10 shadow-2xl shadow-black rounded-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full mx-auto my-0">

        <div className="logo w-full flex align-center flex-col justify-center mb-5">
          <div className="out w-[4.5em] h-[4.5em] mx-auto mb-5 bg-[rgb(89,85,179)] rounded-3xl flex items-center justify-center">
            <div className="in w-[3em] h-[3em] mx-auto my-0 bg-white rounded-2xl flex items-center justify-center">
              <div className="inr w-[2.5em] h-[2.5em] mx-auto my-0 bg-[rgb(89,85,179)] rounded-xl "></div>
            </div>
          </div>

          <h1 className="text-center text-black">Sign Up</h1>
          <p className="text-center text-[#8b8b86] text-[.7rem]">Create your account</p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {success && (
          <p className="text-green-600 text-sm">✅ Account created successfully! Redirecting...</p>
        )}

        <label className="text-[#524f4f] text-[.75rem]">Full Name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Juan Dela Cruz"
          disabled={loading}
          className="w-full h-[3em] text-black px-3 border border-[#ccc] rounded-xl text-[.75rem] outline-0 disabled:opacity-50"
        />

        <label className="text-[#524f4f] text-[.75rem]">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email@example.com"
          disabled={loading}
          className="w-full h-[3em] text-black px-3 border border-[#ccc] rounded-xl text-[.75rem] outline-0 disabled:opacity-50"
        />

        <label className="text-[#524f4f] text-[.75rem]">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          className="w-full h-[3em] px-3 text-black text-[.75rem] rounded-xl outline-0 border border-[#ccc] disabled:opacity-50"
        />

        <label className="text-[#524f4f] text-[.75rem]">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          disabled={loading}
          className="w-full h-[3em] px-3 text-black text-[.75rem] rounded-xl outline-0 border border-[#ccc] disabled:opacity-50"
        />

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg my-3">
          <p className="text-blue-900 text-[.75rem] font-semibold">📋 Account Type</p>
          <p className="text-blue-800 text-[.7rem] mt-1">You will be created as an <span className="font-semibold">Employee</span></p>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-[2.75em] rounded-xl bg-[rgb(89,85,179)] text-[.85rem] mb-[2em] text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <label className="text-[rgb(89,85,179)] text-[.75rem] text-center">
          Already have an account?{" "}
          <button onClick={onSignIn} type="button" className="underline" disabled={loading}>
            Sign In
          </button>
        </label>

      </form>
    </div>
  );
}