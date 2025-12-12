"use client";

import {
    Home,
    Users,
    BookOpen,
    GraduationCap,
    FileText,
    BarChart3,
    FileBarChart,
    Bell,
    LogOut,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
    fullName: string;
    role: string;
}

const navItems = [
    { href: "/hr2/employee/dashboard", label: "Dashboard", icon: Home },
    { href: "/hr2/employee/competency", label: "Competency", icon: Users },
    { href: "/hr2/employee/learning", label: "Learning", icon: BookOpen },
    { href: "/hr2/employee/training", label: "Training", icon: GraduationCap },
    { href: "/hr2/employee/employee-ess", label: "ESS", icon: FileText },
    { href: "/hr2/employee/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/hr2/employee/report", label: "Report", icon: FileBarChart },
];

export default function Hr2Sidebar() {
    const pathname = usePathname();
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    // fetch user
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await axios.get("/hr2/api/auth/me");
                setUser(res.data.user);
            } catch (err) {
                console.log("Failed to fetch user.");
            }
        }
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await fetch("/hr2/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            router.push("/hr2/");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || "U";

    return (
        <div className="flex flex-col h-screen w-64 bg-[rgb(89,85,179)] text-white">

            {/* Top section */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center relative">
                        <div className="w-[70%] h-[70%] bg-[rgb(89,85,179)] flex justify-center items-center rounded">
                            <div className="w-[70%] h-[70%] bg-white"></div>
                        </div>
                    </div>
                    <span className="text-xl font-bold">HR2</span>
                </div>

                <div className="relative">
                    <Bell size={22} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        5
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all ${isActive
                                    ? "bg-white text-indigo-600 font-medium shadow-md"
                                    : "hover:bg-white/10"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom user section */}
            <div className="border-t border-indigo-500 p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center font-bold">
                        {firstLetter}
                    </div>

                    <div>
                        <p className="font-semibold text-sm">
                            {user ? user.fullName : "Loading..."}
                        </p>
                        <p className="text-xs text-indigo-200">
                            {user ? user.role : ""}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-red-500/20 text-gray-100 hover:text-red-200 rounded-lg transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LogOut className="w-5 h-5" />
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            </div>
        </div>
    );
}