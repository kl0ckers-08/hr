// scripts/seedHR2Data.js
// Run with: node scripts/seedHR2Data.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define schemas inline for seeding
const competencySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, min: 0, max: 100 },
  evaluatedAt: Date,
  notes: String,
}, { timestamps: true });

const essRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  reason: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  processedAt: Date,
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  title: String,
  type: String,
  department: String,
  generatedBy: String,
  fileUrl: String,
}, { timestamps: true });

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: "Technical" },
  numberOfTopics: { type: Number, default: 1 },
  targetRoles: [String],
  fileName: String,
  filePath: String,
}, { timestamps: true });

const employeeCompetencySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillName: { type: String, required: true },
  category: { type: String, required: true },
  level: String,
  score: Number,
  assessedAt: Date,
  notes: String,
}, { timestamps: true });

const trainingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, default: "Technical" },
  status: { type: String, default: "Enrolled" },
  startDate: Date,
  endDate: Date,
  score: Number,
  instructor: String,
  location: String,
}, { timestamps: true });

const learningProgressSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  status: { type: String, default: "Not Started" },
  progress: { type: Number, default: 0 },
  quizScore: Number,
  completedTopics: [String],
  startedAt: Date,
  completedAt: Date,
}, { timestamps: true });

const Competency = mongoose.models.Competency || mongoose.model('Competency', competencySchema);
const ESSRequest = mongoose.models.ESSRequest || mongoose.model('ESSRequest', essRequestSchema);
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
const EmployeeCompetency = mongoose.models.EmployeeCompetency || mongoose.model('EmployeeCompetency', employeeCompetencySchema);
const Training = mongoose.models.Training || mongoose.model('Training', trainingSchema);
const LearningProgress = mongoose.models.LearningProgress || mongoose.model('LearningProgress', learningProgressSchema);

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get an employee2 user
    const User = mongoose.model('User', new mongoose.Schema({
      fullName: String,
      email: String,
      password: String,
      role: String,
    }));

    const employee = await User.findOne({ role: 'employee2' });
    if (!employee) {
      console.log('No employee2 user found. Please run seedHR2Users.js first.');
      process.exit(1);
    }

    console.log(`Found employee: ${employee.fullName}`);

    // Seed Modules
    const modulesData = [
      {
        title: 'AI Fundamentals',
        description: 'Introduction to Artificial Intelligence and Machine Learning',
        category: 'Technical',
        numberOfTopics: 8,
        targetRoles: ['employee2', 'hr2admin'],
      },
      {
        title: 'Advanced Data Analytics',
        description: 'Deep dive into data analysis techniques and visualization',
        category: 'Technical',
        numberOfTopics: 12,
        targetRoles: ['employee2', 'hr2admin'],
      },
      {
        title: 'Teaching Excellence',
        description: 'Modern teaching methodologies and student engagement',
        category: 'Pedagogy',
        numberOfTopics: 8,
        targetRoles: ['employee2'],
      },
      {
        title: 'Research Methodology',
        description: 'Comprehensive guide to academic research and publication',
        category: 'Pedagogy',
        numberOfTopics: 8,
        targetRoles: ['employee2'],
      },
    ];

    await Module.deleteMany({});
    const modules = await Module.insertMany(modulesData);
    console.log(`Seeded ${modules.length} modules`);

    // Seed Learning Progress
    const learningProgressData = [
      {
        employee: employee._id,
        module: modules[0]._id,
        status: 'Completed',
        progress: 100,
        quizScore: 92,
        completedAt: new Date(),
      },
      {
        employee: employee._id,
        module: modules[1]._id,
        status: 'In Progress',
        progress: 65,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    await LearningProgress.deleteMany({ employee: employee._id });
    await LearningProgress.insertMany(learningProgressData);
    console.log('Seeded learning progress');

    // Seed Employee Competencies
    const competenciesData = [
      {
        employee: employee._id,
        skillName: 'Programming',
        category: 'Technical Skills',
        level: 'Advanced',
        score: 85,
        assessedAt: new Date('2024-11-01'),
      },
      {
        employee: employee._id,
        skillName: 'Database Management',
        category: 'Technical Skills',
        level: 'Intermediate',
        score: 60,
        assessedAt: new Date('2024-10-15'),
      },
      {
        employee: employee._id,
        skillName: 'Communication',
        category: 'Soft Skills',
      },
      {
        employee: employee._id,
        skillName: 'Project Management',
        category: 'Soft Skills',
      },
    ];

    await EmployeeCompetency.deleteMany({ employee: employee._id });
    await EmployeeCompetency.insertMany(competenciesData);
    console.log('Seeded employee competencies');

    // Seed Trainings
    const trainingsData = [
      {
        employee: employee._id,
        title: 'Web Development Bootcamp',
        type: 'Technical',
        status: 'Completed',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-15'),
        score: 88,
        instructor: 'John Smith',
      },
      {
        employee: employee._id,
        title: 'Leadership Workshop',
        type: 'Leadership',
        status: 'In Progress',
        startDate: new Date('2024-11-01'),
        instructor: 'Jane Doe',
      },
    ];

    await Training.deleteMany({ employee: employee._id });
    await Training.insertMany(trainingsData);
    console.log('Seeded trainings');

    // Seed ESS Requests
    const essData = [
      {
        employee: employee._id,
        type: 'Certificate of Employment',
        reason: 'Bank loan application',
        status: 'Approved',
        processedAt: new Date(),
      },
      {
        employee: employee._id,
        type: 'Training Certificate',
        reason: 'Professional portfolio',
        status: 'Pending',
      },
    ];

    await ESSRequest.deleteMany({ employee: employee._id });
    await ESSRequest.insertMany(essData);
    console.log('Seeded ESS requests');

    // Seed Reports (admin)
    const reportsData = [
      {
        title: 'Learning Progress Summary',
        type: 'Learning Management',
        department: 'IT',
        generatedBy: 'System',
      },
      {
        title: 'Training Attendance Report - October',
        type: 'Training Management',
        department: 'All',
        generatedBy: 'HR Admin',
      },
      {
        title: 'Q3 2024 Competency Report',
        type: 'Competency Assessment',
        department: 'All',
        generatedBy: 'System',
      },
    ];

    await Report.deleteMany({});
    await Report.insertMany(reportsData);
    console.log('Seeded reports');

    // Seed Admin Competency evaluations
    const adminCompetencyData = [
      { employee: employee._id, score: 85, evaluatedAt: new Date(), notes: 'Excellent performance' },
    ];

    await Competency.deleteMany({});
    await Competency.insertMany(adminCompetencyData);
    console.log('Seeded admin competency evaluations');

    console.log('\n✅ HR2 data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
