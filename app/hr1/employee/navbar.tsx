"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    Briefcase,
    FileText,
    UserSearch,
    Bell,
    LogOut,
} from "lucide-react";

interface User {
    id: string;
    fullName: string;
    email: string;
    role?: string;
}

export default function EmployeeNavbar() {
    const pathname = usePathname();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        fetch("/hr1/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                    console.log("✅ User loaded in navbar:", data.user);
                } else {
                    console.log("❌ No user found");
                }
            })
            .catch((err) => {
                console.error("Failed to fetch user:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = async () => {
    try {
        // Call API to remove the HttpOnly cookie
        await fetch("/hr1/api/auth/logout", {
            method: "POST",
        });

        console.log("🚪 Logged out successfully");
        
        setUser(null);
        
        router.push("/");
        
        router.refresh();
    } catch (err) {
        console.error("Logout error:", err);
    }
};

    if (loading) {
        return (
            <div className="w-full h-full bg-[#5B55D6] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
        );
    }

    const menu = [
        {
            name: "Job Postings",
            href: "/hr1/employee/job-postings",
            icon: Briefcase,
        },
        {
            name: "My Applications",
            href: "/hr1/employee/my-application",
            icon: UserSearch,
        },

    ];

    return (
        <div className="w-full h-full bg-[#5955b3] text-white flex flex-col justify-between py-6 px-3">
            {/* TOP SECTION */}
            <div>
                {/* Logo + Notifications */}
                <div className="min-h-[5em] flex items-center gap-2 px-3 mb-6">
                    <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                    <span className="text-xl font-semibold">HR Portal</span>

                    {/* Notification Icon */}
                    <div className="relative ml-auto cursor-pointer">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] px-1.5 rounded-full">
                            1
                        </span>
                    </div>
                </div>

                <p className="px-3 mb-3 text-sm text-gray-200">Menu</p>

                {/* MENU ITEMS */}
                <nav className="mx-auto w-50 space-y-1">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                                    ${isActive
                                        ? "bg-white text-[#5B55D6] font-medium"
                                        : "text-gray-200 hover:bg-white/10"
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* USER SECTION */}
            {user ? (
                <div className="bg-gray-100/15 rounded-2xl w-50 mx-auto py-2 px-2 ">
                    <div className="  flex items-center gap-3 px-3 py-3">
                        {/* Profile circle w/ initials */}
                        <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-sm uppercase">
                            {user.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                        </div>

                        <div>
                            <p className="text-[.9rem]">{user.fullName}</p>
                            <p className="text-[.7rem] text-gray-200">
                                {user.role || "Employee"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mx-auto mb-3 w-40 flex items-center gap-2 px-3 py-2 bg-gray-100/15 hover:bg-white/10 rounded-lg text-gray-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <p className="text-[.9rem]">Logout</p>
                    </button>
                </div>
            ) : (
                <div className="px-3 py-3 text-sm text-gray-300">
                    Not logged in
                </div>
            )}
        </div>
    );
}