"use client";

import Image from "next/image";
import LoginForm from "../login/page";
import SignUpForm from "../login/signup";
import { useState } from "react";

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-400 to-purple-600 p-4">

      {/* LOGIN FORM */}
      {!showSignup && (
        <LoginForm onCreateAccount={() => setShowSignup(true)} />
      )}

      {/* SIGN-UP FORM */}
      {showSignup && (
        <SignUpForm onSignIn={() => setShowSignup(false)} />
      )}

    </div>
  );
}
