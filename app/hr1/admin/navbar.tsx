"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid,
    Briefcase,
    UsersRound,
    UserSearch,
    FileText,
    Bell,
    LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";

interface User {
    role: string;
    id: string;
    fullName: string;
    email: string;
}

export default function AdminNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { name: "Dashboard", href: "/hr1/admin/dashboard", icon: LayoutGrid },
        { name: "Job Postings", href: "/hr1/admin/job-posting", icon: Briefcase },
        { name: "Evaluation", href: "/hr1/admin/evaluation", icon: UsersRound },
        { name: "Applicants", href: "/hr1/admin/applicants", icon: UserSearch },
        { name: "Onboarding & Transfer", href: "/hr1/admin/onboarding", icon: FileText },
        { name: "Reports", href: "/hr1/admin/reports", icon: FileText },
    ];

    // Fetch user data from token
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch("/hr1/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    console.error("Failed to fetch user data");
                    router.push("/hr1/login");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                router.push("/hr1/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await fetch("/hr1/api/auth/logout", { 
                method: "POST",
                credentials: "include"
            });
            router.push("/hr1/");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    const isMenuItemActive = (href: string): boolean => {
        return pathname === href || pathname.startsWith(href + "/");
    };

    // Get user initials
    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Get role display name
    const getRoleDisplay = (role: string | undefined) => {
        if (!role) return "User";
        const roleMap: Record<string, string> = {
            employee: "Employee",
            admin: "Admin",
            hr: "HR Manager",
            hr1admin: "HR1 Admin",
        };
        return roleMap[role] || role;
    };

    if (loading) {
        return (
            <div className="w-full h-full bg-gradient-to-b from-[#5B55D6] to-[#4A48B8] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gradient-to-b from-[#5B55D6] to-[#4A48B8] text-white flex flex-col justify-between py-6 px-4">
            {/* Top Section */}
            <div className="flex-1">
                {/* Logo & Branding */}
                <div className="flex items-center gap-3 px-3 mb-8">
                    <div className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center font-bold text-lg transition">
                        H
                    </div>
                    <span className="text-2xl font-bold tracking-tight">HR1</span>

                    {/* Notification Icon */}
                    <div className="relative ml-auto">
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg transition relative"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>

                        {/* Notifications Dropdown */}
                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-lg shadow-xl p-4 z-50">
                                <h3 className="font-semibold mb-3">Notifications</h3>
                                <div className="space-y-2">
                                    <div className="p-2 bg-blue-50 rounded border border-blue-200 text-sm">
                                        <p className="font-medium">New Application</p>
                                        <p className="text-gray-600">You have 5 new job applications</p>
                                    </div>
                                    <div className="p-2 bg-green-50 rounded border border-green-200 text-sm">
                                        <p className="font-medium">Hiring Complete</p>
                                        <p className="text-gray-600">2 candidates have accepted offers</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Label */}
                <div className="px-3 mb-4">
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Navigation</p>
                </div>

                {/* Menu Items */}
                <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                        const isActive = isMenuItemActive(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition duration-200
                                    ${
                                        isActive
                                            ? "bg-white text-[#5B55D6] font-semibold shadow-md"
                                            : "text-gray-100 hover:bg-white/15 hover:text-white"
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-[#5B55D6] rounded-full" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom User Section */}
            <div className="border-t border-white/20 pt-4 space-y-3">
                {/* User Profile - Dynamic */}
                {user && (
                    <div className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg transition cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {getUserInitials(user.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">{user.fullName}</p>
                            <p className="text-xs text-gray-300">{user.role}</p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
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