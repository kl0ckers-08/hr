import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Applications';

export async function GET() {
    try {
        await connectDB();

        // Get application counts by month for the last 6 months
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Get all applications from last 6 months
        const applications = await Application.find({
            appliedAt: { $gte: sixMonthsAgo }
        }).lean();

        // Group by month
        const trendData: { month: string; applications: number; hired: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthApps = applications.filter((app: any) => {
                const appDate = new Date(app.appliedAt);
                return appDate >= monthStart && appDate <= monthEnd;
            });

            const hiredApps = monthApps.filter((app: any) => app.status === 'hired');

            trendData.push({
                month: monthNames[date.getMonth()],
                applications: monthApps.length,
                hired: hiredApps.length,
            });
        }

        return NextResponse.json(trendData);
    } catch (err) {
        console.error('Applicants trend error:', err);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}
