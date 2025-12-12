import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import { Application } from '@/models/Applications';

export async function GET() {
    try {
        await connectDB();

        // Get all jobs grouped by department
        const jobs = await Job.find().lean();

        // Get unique departments
        const departments = [...new Set(jobs.map((job: any) => job.department).filter(Boolean))];

        // Calculate completion rate per department (hired / total applications)
        const departmentData = await Promise.all(
            departments.map(async (dept) => {
                const deptJobs = jobs.filter((job: any) => job.department === dept);
                const jobIds = deptJobs.map((job: any) => job._id);

                const totalApps = await Application.countDocuments({ jobId: { $in: jobIds } });
                const hiredApps = await Application.countDocuments({
                    jobId: { $in: jobIds },
                    status: 'hired'
                });

                const completionRate = totalApps > 0
                    ? Math.round((hiredApps / totalApps) * 100)
                    : 0;

                return {
                    dept: dept as string,
                    completed: completionRate,
                };
            })
        );

        // If no departments, return mock data
        if (departmentData.length === 0) {
            return NextResponse.json([
                { dept: 'Engineering', completed: 85 },
                { dept: 'Marketing', completed: 72 },
                { dept: 'HR', completed: 65 },
                { dept: 'Finance', completed: 78 },
            ]);
        }

        return NextResponse.json(departmentData);
    } catch (err) {
        console.error('Department data error:', err);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}