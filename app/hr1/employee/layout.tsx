// app/employee/layout.tsx
import React from "react";
import Navbar from "./navbar";

export const metadata = {
  title: "Employee Portal",
  description: "Employee Dashboard and Job Postings",
};

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar / Navbar */}
      <aside className="w-[250px] bg-[rgb(89,85,179)] text-white">
        <Navbar />
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50  overflow-auto">
        {children}
      </main>
    </div>
  );
}
