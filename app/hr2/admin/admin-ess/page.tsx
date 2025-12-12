// app/hr2/ess/page.tsx
import { Clock, CheckCircle, AlertCircle, Calendar, FileText } from "lucide-react";
import StatCard from "@/components/ui/statcard";
const requests = [
    {
        name: "Dr. Sarah Johnson",
        role: "Lecturer • Computer Science",
        type: "Certificate of Employment",
        reason: "Request for employment certificate for bank loan application",
        status: "Approved",
        submitted: "11/15/2024",
        processed: "2024-11-16 10:30 AM",
    },
    {
        name: "Prof. Michael Chen",
        role: "Instructor • Information Technology",
        type: "Training Certificate",
        reason: "Certificate for AI Fundamentals training completion",
        status: "Pending",
        submitted: "11/14/2024",
    },
];

export default function ESSPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900">ESS - Employee Self-Service</h1>
                <p className="text-gray-700 mb-8">Track and manage employee HR2 requests</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Requests" value={12} subtitle="all time" icon={<FileText />} color="purple" />
                    <StatCard title="Pending Requests" value={3} subtitle="awaiting review" icon={<Clock />} color="yellow" />
                    <StatCard title="Approved" value={7} subtitle="completed requests" icon={<CheckCircle />} color="green" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="flex justify-between items-center mb-6">
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="px-4 py-3 border rounded-xl w-80"
                        />
                        <div className="flex gap-3">
                            <select className="px-4 py-3 border rounded-xl">All Statuses</select>
                            <select className="px-4 py-3 border rounded-xl">All Request Types</select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {requests.map((req, i) => (
                            <div key={i} className="border rounded-2xl p-6 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-3">
                                            {req.name}
                                            <span className={`px-3 py-1 text-xs rounded-full ${req.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {req.status}
                                            </span>
                                        </h3>
                                        <p className="text-gray-700">{req.role}</p>
                                        <p className="text-purple-600 text-sm font-medium mt-2">{req.type}</p>
                                        <p className="text-gray-700 text-sm mt-1">{req.reason}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Submission Date: {req.submitted}</span>
                                    </div>
                                    {req.processed && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            Processed: {req.processed}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}