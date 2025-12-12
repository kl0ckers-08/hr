// Seed script for HR1 database
// Run with: npx ts-node scripts/seed-hr1.ts

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in .env.local");
    process.exit(1);
}

// Define schemas inline for the script
const JobSchema = new mongoose.Schema({
    title: String,
    department: String,
    employmentType: String,
    location: String,
    deadline: Date,
    description: String,
    qualifications: [String],
    requirements: [String],
    views: { type: Number, default: 0 },
    applicants: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "employee" },
}, { timestamps: true });

const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    jobTitle: String,
    fullName: String,
    email: String,
    coverLetter: String,
    resume: {
        filename: String,
        size: Number,
        mimeType: String,
        fileId: String,
        uploadedAt: Date,
    },
    applicationLetter: {
        filename: String,
        size: Number,
        mimeType: String,
        fileId: String,
        uploadedAt: Date,
    },
    status: { type: String, default: "pending" },
    appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const QuestionSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    question: String,
    options: [String],
    correctAnswer: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const EvaluationResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    questions: [{
        _id: mongoose.Schema.Types.ObjectId,
        question: String,
        options: [String],
        correctAnswer: String,
    }],
    answers: mongoose.Schema.Types.Mixed,
    score: Number,
    totalQuestions: Number,
    submittedAt: Date,
}, { timestamps: true });

async function seed() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Get or create models
        const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
        const User = mongoose.models.User || mongoose.model("User", UserSchema);
        const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
        const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
        const EvaluationResult = mongoose.models.EvaluationResult || mongoose.model("EvaluationResult", EvaluationResultSchema);

        // Clear existing data
        console.log("🗑️  Clearing existing HR1 data...");
        await Job.deleteMany({});
        await Application.deleteMany({});
        await Question.deleteMany({});
        await EvaluationResult.deleteMany({});
        // Don't delete all users, just create test users if they don't exist

        // Create sample jobs
        console.log("📝 Creating sample jobs...");
        const jobs = await Job.create([
            {
                title: "Senior Software Engineer",
                department: "Engineering",
                employmentType: "Full-time",
                location: "Manila, Philippines",
                deadline: new Date("2025-01-31"),
                description: "We are looking for a Senior Software Engineer to join our team.",
                qualifications: ["5+ years experience", "Bachelor's in CS", "Strong problem-solving skills"],
                requirements: ["React/Next.js", "Node.js", "MongoDB", "TypeScript"],
                status: "Active",
                views: 150,
                applicants: 0,
            },
            {
                title: "Marketing Manager",
                department: "Marketing",
                employmentType: "Full-time",
                location: "Cebu, Philippines",
                deadline: new Date("2025-01-15"),
                description: "Lead our marketing initiatives and brand strategy.",
                qualifications: ["3+ years marketing experience", "Strong communication skills"],
                requirements: ["Digital Marketing", "Social Media Management", "Analytics"],
                status: "Active",
                views: 85,
                applicants: 0,
            },
            {
                title: "HR Coordinator",
                department: "Human Resources",
                employmentType: "Full-time",
                location: "Manila, Philippines",
                deadline: new Date("2025-02-28"),
                description: "Support HR operations and employee engagement programs.",
                qualifications: ["2+ years HR experience", "Excellent interpersonal skills"],
                requirements: ["HRIS Systems", "Recruitment", "Employee Relations"],
                status: "Active",
                views: 65,
                applicants: 0,
            },
            {
                title: "Financial Analyst",
                department: "Finance",
                employmentType: "Full-time",
                location: "Manila, Philippines",
                deadline: new Date("2025-01-20"),
                description: "Analyze financial data and prepare reports.",
                qualifications: ["CPA or equivalent", "3+ years financial analysis"],
                requirements: ["Excel", "Financial Modeling", "SAP"],
                status: "Active",
                views: 40,
                applicants: 0,
            },
            {
                title: "UX/UI Designer",
                department: "Engineering",
                employmentType: "Contract",
                location: "Remote",
                deadline: new Date("2025-01-10"),
                description: "Design beautiful and intuitive user interfaces.",
                qualifications: ["3+ years design experience", "Strong portfolio"],
                requirements: ["Figma", "Adobe XD", "User Research"],
                status: "Active",
                views: 120,
                applicants: 0,
            },
        ]);
        console.log(`✅ Created ${jobs.length} jobs`);

        // Create sample users (applicants)
        console.log("👤 Creating sample users...");
        const users = [];
        const userEmails = [
            { name: "Juan Dela Cruz", email: "juan.delacruz@email.com" },
            { name: "Maria Santos", email: "maria.santos@email.com" },
            { name: "Pedro Reyes", email: "pedro.reyes@email.com" },
            { name: "Ana Garcia", email: "ana.garcia@email.com" },
            { name: "Carlos Mendoza", email: "carlos.mendoza@email.com" },
            { name: "Sofia Rodriguez", email: "sofia.rodriguez@email.com" },
            { name: "Miguel Torres", email: "miguel.torres@email.com" },
            { name: "Isabella Cruz", email: "isabella.cruz@email.com" },
        ];

        for (const userData of userEmails) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = await User.create({
                    name: userData.name,
                    email: userData.email,
                    password: "$2b$10$dummyhash", // Dummy hash
                    role: "employee",
                });
            }
            users.push(user);
        }
        console.log(`✅ Created/Found ${users.length} users`);

        // Create applications
        console.log("📋 Creating sample applications...");
        const applications = await Application.create([
            // Engineering - Senior Software Engineer
            {
                jobId: jobs[0]._id,
                userId: users[0]._id,
                jobTitle: jobs[0].title,
                fullName: users[0].name,
                email: users[0].email,
                coverLetter: "I am excited to apply for this position...",
                resume: { filename: "juan_resume.pdf", size: 150000, mimeType: "application/pdf", fileId: "file1", uploadedAt: new Date() },
                applicationLetter: { filename: "juan_letter.pdf", size: 50000, mimeType: "application/pdf", fileId: "file2", uploadedAt: new Date() },
                status: "reviewed",
                appliedAt: new Date("2024-12-01"),
            },
            {
                jobId: jobs[0]._id,
                userId: users[1]._id,
                jobTitle: jobs[0].title,
                fullName: users[1].name,
                email: users[1].email,
                coverLetter: "With my extensive experience in software development...",
                resume: { filename: "maria_resume.pdf", size: 180000, mimeType: "application/pdf", fileId: "file3", uploadedAt: new Date() },
                status: "pending",
                appliedAt: new Date("2024-12-05"),
            },
            {
                jobId: jobs[0]._id,
                userId: users[2]._id,
                jobTitle: jobs[0].title,
                fullName: users[2].name,
                email: users[2].email,
                coverLetter: "I believe I would be a great fit...",
                resume: { filename: "pedro_resume.pdf", size: 120000, mimeType: "application/pdf", fileId: "file4", uploadedAt: new Date() },
                status: "shortlisted",
                appliedAt: new Date("2024-12-03"),
            },
            // Marketing - Marketing Manager
            {
                jobId: jobs[1]._id,
                userId: users[3]._id,
                jobTitle: jobs[1].title,
                fullName: users[3].name,
                email: users[3].email,
                coverLetter: "As a seasoned marketing professional...",
                resume: { filename: "ana_resume.pdf", size: 140000, mimeType: "application/pdf", fileId: "file5", uploadedAt: new Date() },
                applicationLetter: { filename: "ana_letter.pdf", size: 45000, mimeType: "application/pdf", fileId: "file6", uploadedAt: new Date() },
                status: "reviewed",
                appliedAt: new Date("2024-12-08"),
            },
            {
                jobId: jobs[1]._id,
                userId: users[4]._id,
                jobTitle: jobs[1].title,
                fullName: users[4].name,
                email: users[4].email,
                coverLetter: "Marketing is my passion...",
                resume: { filename: "carlos_resume.pdf", size: 160000, mimeType: "application/pdf", fileId: "file7", uploadedAt: new Date() },
                status: "pending",
                appliedAt: new Date("2024-12-10"),
            },
            // HR - HR Coordinator
            {
                jobId: jobs[2]._id,
                userId: users[5]._id,
                jobTitle: jobs[2].title,
                fullName: users[5].name,
                email: users[5].email,
                coverLetter: "I have a deep understanding of HR practices...",
                resume: { filename: "sofia_resume.pdf", size: 130000, mimeType: "application/pdf", fileId: "file8", uploadedAt: new Date() },
                status: "hired",
                appliedAt: new Date("2024-11-20"),
            },
            // Finance - Financial Analyst
            {
                jobId: jobs[3]._id,
                userId: users[6]._id,
                jobTitle: jobs[3].title,
                fullName: users[6].name,
                email: users[6].email,
                coverLetter: "With my CPA license and analytical skills...",
                resume: { filename: "miguel_resume.pdf", size: 170000, mimeType: "application/pdf", fileId: "file9", uploadedAt: new Date() },
                status: "pending",
                appliedAt: new Date("2024-12-09"),
            },
            // Engineering - UX/UI Designer
            {
                jobId: jobs[4]._id,
                userId: users[7]._id,
                jobTitle: jobs[4].title,
                fullName: users[7].name,
                email: users[7].email,
                coverLetter: "Design is not just what it looks like...",
                resume: { filename: "isabella_resume.pdf", size: 200000, mimeType: "application/pdf", fileId: "file10", uploadedAt: new Date() },
                applicationLetter: { filename: "isabella_letter.pdf", size: 55000, mimeType: "application/pdf", fileId: "file11", uploadedAt: new Date() },
                status: "reviewed",
                appliedAt: new Date("2024-12-02"),
            },
        ]);
        console.log(`✅ Created ${applications.length} applications`);

        // Update job applicant counts
        for (const job of jobs) {
            const count = await Application.countDocuments({ jobId: job._id });
            await Job.findByIdAndUpdate(job._id, { applicants: count });
        }
        console.log("✅ Updated job applicant counts");

        // Create evaluation questions for Engineering jobs
        console.log("❓ Creating evaluation questions...");
        const questions = await Question.create([
            // Questions for Senior Software Engineer
            {
                jobId: jobs[0]._id,
                question: "What is the time complexity of binary search?",
                options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                correctAnswer: "O(log n)",
                isActive: true,
            },
            {
                jobId: jobs[0]._id,
                question: "Which of the following is NOT a JavaScript framework?",
                options: ["React", "Angular", "Django", "Vue"],
                correctAnswer: "Django",
                isActive: true,
            },
            {
                jobId: jobs[0]._id,
                question: "What does REST stand for?",
                options: ["Representational State Transfer", "Remote Execution Service Tool", "Resource State Transfer", "Reliable Service Transport"],
                correctAnswer: "Representational State Transfer",
                isActive: true,
            },
            {
                jobId: jobs[0]._id,
                question: "Which database is a NoSQL database?",
                options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
                correctAnswer: "MongoDB",
                isActive: true,
            },
            {
                jobId: jobs[0]._id,
                question: "What is the purpose of a .env file?",
                options: ["Store environment variables", "Define CSS styles", "Configure routing", "Create database schemas"],
                correctAnswer: "Store environment variables",
                isActive: true,
            },
            // Questions for Marketing Manager
            {
                jobId: jobs[1]._id,
                question: "What does SEO stand for?",
                options: ["Search Engine Optimization", "Social Engagement Online", "Site Enhancement Operation", "Sales Execution Order"],
                correctAnswer: "Search Engine Optimization",
                isActive: true,
            },
            {
                jobId: jobs[1]._id,
                question: "Which social media platform is best for B2B marketing?",
                options: ["TikTok", "LinkedIn", "Snapchat", "Pinterest"],
                correctAnswer: "LinkedIn",
                isActive: true,
            },
            {
                jobId: jobs[1]._id,
                question: "What is a KPI?",
                options: ["Key Performance Indicator", "Knowledge Processing Interface", "Keyword Performance Index", "Known Process Integration"],
                correctAnswer: "Key Performance Indicator",
                isActive: true,
            },
        ]);
        console.log(`✅ Created ${questions.length} evaluation questions`);

        // Create evaluation results for some applicants
        console.log("📊 Creating evaluation results...");
        const engQuestions = questions.filter(q => q.jobId.toString() === jobs[0]._id.toString());
        const mktQuestions = questions.filter(q => q.jobId.toString() === jobs[1]._id.toString());

        const evaluationResults = await EvaluationResult.create([
            // Juan - Completed evaluation (4/5 correct)
            {
                userId: users[0]._id,
                applicationId: applications[0]._id,
                questions: engQuestions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                })),
                answers: {
                    [engQuestions[0]._id.toString()]: "O(log n)",
                    [engQuestions[1]._id.toString()]: "Django",
                    [engQuestions[2]._id.toString()]: "Representational State Transfer",
                    [engQuestions[3]._id.toString()]: "MongoDB",
                    [engQuestions[4]._id.toString()]: "Configure routing", // Wrong
                },
                score: 4,
                totalQuestions: 5,
                submittedAt: new Date("2024-12-02"),
            },
            // Pedro - Completed evaluation (3/5 correct)
            {
                userId: users[2]._id,
                applicationId: applications[2]._id,
                questions: engQuestions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                })),
                answers: {
                    [engQuestions[0]._id.toString()]: "O(n)", // Wrong
                    [engQuestions[1]._id.toString()]: "Django",
                    [engQuestions[2]._id.toString()]: "Representational State Transfer",
                    [engQuestions[3]._id.toString()]: "MySQL", // Wrong
                    [engQuestions[4]._id.toString()]: "Store environment variables",
                },
                score: 3,
                totalQuestions: 5,
                submittedAt: new Date("2024-12-04"),
            },
            // Ana - Completed evaluation (3/3 correct - perfect score)
            {
                userId: users[3]._id,
                applicationId: applications[3]._id,
                questions: mktQuestions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                })),
                answers: {
                    [mktQuestions[0]._id.toString()]: "Search Engine Optimization",
                    [mktQuestions[1]._id.toString()]: "LinkedIn",
                    [mktQuestions[2]._id.toString()]: "Key Performance Indicator",
                },
                score: 3,
                totalQuestions: 3,
                submittedAt: new Date("2024-12-09"),
            },
            // Isabella - Completed evaluation (4/5 correct)
            {
                userId: users[7]._id,
                applicationId: applications[7]._id,
                questions: engQuestions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                })),
                answers: {
                    [engQuestions[0]._id.toString()]: "O(log n)",
                    [engQuestions[1]._id.toString()]: "Django",
                    [engQuestions[2]._id.toString()]: "Resource State Transfer", // Wrong
                    [engQuestions[3]._id.toString()]: "MongoDB",
                    [engQuestions[4]._id.toString()]: "Store environment variables",
                },
                score: 4,
                totalQuestions: 5,
                submittedAt: new Date("2024-12-03"),
            },
        ]);
        console.log(`✅ Created ${evaluationResults.length} evaluation results`);

        // Summary
        console.log("\n" + "=".repeat(50));
        console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(50));
        console.log(`📌 Jobs created: ${jobs.length}`);
        console.log(`📌 Users created/found: ${users.length}`);
        console.log(`📌 Applications created: ${applications.length}`);
        console.log(`📌 Questions created: ${questions.length}`);
        console.log(`📌 Evaluation results: ${evaluationResults.length}`);
        console.log("\n📊 Evaluation Status:");
        console.log(`   - Pending: ${applications.length - evaluationResults.length} applicants`);
        console.log(`   - Completed: ${evaluationResults.length} applicants`);
        console.log("=".repeat(50));

        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seed failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seed();
