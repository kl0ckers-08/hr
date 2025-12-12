import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Application } from "@/models/Applications";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const searchParams = req.nextUrl.searchParams;
        const range = searchParams.get("range") || "all";

        // Calculate date filter
        let dateFilter = {};
        const now = new Date();
        if (range === "week") {
            dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        } else if (range === "month") {
            dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        } else if (range === "quarter") {
            dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        }

        // Get jobs stats
        const totalJobs = await Job.countDocuments(dateFilter);
        const activeJobs = await Job.countDocuments({ ...dateFilter, status: "Active" });

        // Get applications stats
        const totalApplications = await Application.countDocuments(dateFilter);
        const pendingApplications = await Application.countDocuments({ ...dateFilter, status: "pending" });
        const reviewingApplications = await Application.countDocuments({ ...dateFilter, status: "reviewing" });
        const shortlistedApplications = await Application.countDocuments({ ...dateFilter, status: "shortlisted" });
        const hiredCount = await Application.countDocuments({ ...dateFilter, status: "hired" });
        const rejectedCount = await Application.countDocuments({ ...dateFilter, status: "rejected" });

        // Applications by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const applicationsByMonth = await Application.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthly = applicationsByMonth.map((item) => ({
            month: monthNames[item._id.month - 1],
            count: item.count,
        }));

        // Top departments by job count
        const topDepartments = await Job.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        const formattedDepartments = topDepartments.map((item) => ({
            department: item._id || "Unknown",
            count: item.count,
        }));

        return NextResponse.json({
            totalJobs,
            activeJobs,
            totalApplications,
            pendingApplications,
            reviewingApplications,
            shortlistedApplications,
            hiredCount,
            rejectedCount,
            applicationsByMonth: formattedMonthly,
            topDepartments: formattedDepartments,
        });
    } catch (error) {
        console.error("Error generating reports:", error);
        return NextResponse.json(
            { error: "Failed to generate reports" },
            { status: 500 }
        );
    }
}
