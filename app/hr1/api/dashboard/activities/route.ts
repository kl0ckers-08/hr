import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Applications';

export async function GET() {
    try {
        await connectDB();

        // Get recent applications
        const recentApplications = await Application.find()
            .sort({ appliedAt: -1 })
            .limit(5)
            .lean();

        // Transform to activity format
        const activities = recentApplications.map((app: any) => {
            const appliedDate = new Date(app.appliedAt);
            const now = new Date();
            const diffMs = now.getTime() - appliedDate.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = '';
            if (diffDays > 0) {
                timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
                timeAgo = 'Just now';
            }

            // Determine activity type based on status
            let type: 'application' | 'interview' | 'review' | 'onboarding' = 'application';
            let title = '';
            let description = '';

            switch (app.status) {
                case 'pending':
                    type = 'application';
                    title = 'New Application Received';
                    description = `${app.fullName} applied for ${app.jobTitle}`;
                    break;
                case 'reviewed':
                    type = 'review';
                    title = 'Application Under Review';
                    description = `${app.fullName}'s application is being reviewed`;
                    break;
                case 'shortlisted':
                    type = 'interview';
                    title = 'Candidate Shortlisted';
                    description = `${app.fullName} has been shortlisted for ${app.jobTitle}`;
                    break;
                case 'hired':
                    type = 'onboarding';
                    title = 'Candidate Hired';
                    description = `${app.fullName} has been hired for ${app.jobTitle}`;
                    break;
                case 'rejected':
                    type = 'review';
                    title = 'Application Rejected';
                    description = `${app.fullName}'s application was not accepted`;
                    break;
                default:
                    type = 'application';
                    title = 'Application Update';
                    description = `${app.fullName} - ${app.jobTitle}`;
            }

            return {
                type,
                title,
                description,
                timeAgo,
            };
        });

        // If no activities, return some defaults
        if (activities.length === 0) {
            return NextResponse.json([
                {
                    type: 'application',
                    title: 'No Recent Activities',
                    description: 'New applications will appear here',
                    timeAgo: 'Now',
                },
            ]);
        }

        return NextResponse.json(activities);
    } catch (err) {
        console.error('Activities error:', err);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}