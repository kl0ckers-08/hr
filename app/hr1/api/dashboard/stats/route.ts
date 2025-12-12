import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Applications';
import Job from '@/models/Job';

export async function GET() {
    try {
        await connectDB();

        // Get real stats from database
        const totalApplications = await Application.countDocuments({});
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const reviewedApplications = await Application.countDocuments({ status: 'reviewed' });
        const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
        const hiredApplications = await Application.countDocuments({ status: 'hired' });
        const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

        const totalJobs = await Job.countDocuments({});
        const activeJobs = await Job.countDocuments({ status: 'Active' });
        const openPositions = await Job.countDocuments({ status: 'Active' });

        // Calculate approval rate (hired / total * 100)
        const approvalRate = totalApplications > 0
            ? Math.round((hiredApplications / totalApplications) * 100)
            : 0;

        const stats = {
            totalApplications,
            applicationChange: 12, // Mock for now
            approvalRate,
            approvalChange: 2, // Mock for now
            openPositions,
            openPositionsChange: 3, // Mock for now
            avgResponseTime: 31.5, // Mock for now
            responseTimeChange: 5, // Mock for now
            activeJobs,
            interviewsScheduled: shortlistedApplications, // Use shortlisted as proxy
            pendingReview: pendingApplications,
            candidatesHired: hiredApplications,
            overallCompletion: approvalRate,
            onboarded: hiredApplications > 0 ? 92 : 0, // Mock
            avgTimeToHire: 28, // Mock for now
        };

        return NextResponse.json(stats);
    } catch (err) {
        console.error('Dashboard stats error:', err);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}