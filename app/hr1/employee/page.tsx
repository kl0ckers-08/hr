"use client";

import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import Navbar from "./navbar";
import EmployeeJobPostings from "./job-postings/page";

export default function LandingPage() {
    const [name, setName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // Decode token WITHOUT validating signature (safe for client)
            const decoded: any = jwt.decode(token);
            setName(decoded.fullName);
        } catch (e) {
            console.error("Invalid token");
        }
    }, []);

    return (
                <EmployeeJobPostings/>
    );
}
