// app/employee/layout.tsx
import React from "react";
import Navbar from "./navbar";

export const metadata = {
    title: "Employee Portal",
    description: "Employee Dashboard and Job Postings",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-[250px] bg-[rgb(89,85,179)] text-white">
                <Navbar />
            </aside>

            <main className="flex-1 max-h-screen bg-gray-50  overflow-y-scroll">
                {children}
            </main>
        </div>
    );
}
