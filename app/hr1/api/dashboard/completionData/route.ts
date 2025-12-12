import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Applications';

export async function GET() {
    try {
        await connectDB();

        // Get application status counts
        const total = await Application.countDocuments({});
        const hired = await Application.countDocuments({ status: 'hired' });
        const pending = await Application.countDocuments({ status: 'pending' });
        const reviewed = await Application.countDocuments({ status: 'reviewed' });
        const shortlisted = await Application.countDocuments({ status: 'shortlisted' });
        const rejected = await Application.countDocuments({ status: 'rejected' });

        // Calculate percentages
        const calculatePercent = (count: number) =>
            total > 0 ? Math.round((count / total) * 100) : 0;

        const completionData = [
            { name: 'Hired', value: calculatePercent(hired), fill: '#10b981' },
            { name: 'Shortlisted', value: calculatePercent(shortlisted), fill: '#3b82f6' },
            { name: 'Reviewed', value: calculatePercent(reviewed), fill: '#8b5cf6' },
            { name: 'Pending', value: calculatePercent(pending), fill: '#f59e0b' },
            { name: 'Rejected', value: calculatePercent(rejected), fill: '#ef4444' },
        ].filter(item => item.value > 0); // Only show non-zero values

        // If no data, return default
        if (completionData.length === 0) {
            return NextResponse.json([
                { name: 'Completed', value: 65, fill: '#10b981' },
                { name: 'In Progress', value: 25, fill: '#3b82f6' },
                { name: 'Pending', value: 10, fill: '#f59e0b' },
            ]);
        }

        return NextResponse.json(completionData);
    } catch (err) {
        console.error('Completion data error:', err);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}