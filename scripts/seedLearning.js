// scripts/seedLearning.js
// Run with: node scripts/seedLearning.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Module Schema
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: "Technical" },
  numberOfTopics: { type: Number, default: 1 },
  targetRoles: [String],
  fileName: String,
  filePath: String,
}, { timestamps: true });

// Learning Progress Schema
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

// User Schema (minimal for finding employee)
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: String,
});

const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
const LearningProgress = mongoose.models.LearningProgress || mongoose.model('LearningProgress', learningProgressSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const modulesData = [
  {
    title: 'AI Fundamentals',
    description: 'Introduction to Artificial Intelligence and Machine Learning concepts, algorithms, and applications.',
    category: 'Technical',
    numberOfTopics: 8,
    targetRoles: ['employee2', 'hr2admin'],
  },
  {
    title: 'Advanced Data Analytics',
    description: 'Deep dive into data analysis techniques, visualization tools, and statistical methods for business insights.',
    category: 'Technical',
    numberOfTopics: 12,
    targetRoles: ['employee2', 'hr2admin'],
  },
  {
    title: 'Teaching Excellence',
    description: 'Modern teaching methodologies, student engagement strategies, and classroom management techniques.',
    category: 'Pedagogy',
    numberOfTopics: 10,
    targetRoles: ['employee2'],
  },
  {
    title: 'Research Methodology',
    description: 'Comprehensive guide to academic research, publication process, and scholarly writing.',
    category: 'Pedagogy',
    numberOfTopics: 8,
    targetRoles: ['employee2'],
  },
  {
    title: 'Leadership Essentials',
    description: 'Core leadership skills, team management, and organizational behavior fundamentals.',
    category: 'Leadership',
    numberOfTopics: 6,
    targetRoles: ['employee2', 'hr2admin'],
  },
  {
    title: 'Web Development Basics',
    description: 'Introduction to HTML, CSS, JavaScript, and modern web development frameworks.',
    category: 'Technical',
    numberOfTopics: 15,
    targetRoles: ['employee2'],
  },
  {
    title: 'Effective Communication',
    description: 'Professional communication skills, presentation techniques, and interpersonal effectiveness.',
    category: 'Pedagogy',
    numberOfTopics: 7,
    targetRoles: ['employee2', 'hr2admin'],
  },
  {
    title: 'Project Management Fundamentals',
    description: 'Project planning, execution, monitoring, and agile methodologies for successful project delivery.',
    category: 'Leadership',
    numberOfTopics: 9,
    targetRoles: ['employee2', 'hr2admin'],
  },
];

async function seedLearning() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an employee2 user
    const employee = await User.findOne({ role: 'employee2' });
    if (!employee) {
      console.log('No employee2 user found. Creating modules only...');
    } else {
      console.log(`Found employee: ${employee.fullName}`);
    }

    // Clear existing modules and progress
    await Module.deleteMany({});
    console.log('Cleared existing modules');

    if (employee) {
      await LearningProgress.deleteMany({ employee: employee._id });
      console.log('Cleared existing learning progress');
    }

    // Insert modules
    const modules = await Module.insertMany(modulesData);
    console.log(`✅ Seeded ${modules.length} learning modules:`);
    modules.forEach(m => console.log(`  - ${m.title} (${m.numberOfTopics} topics, ${m.category})`));

    // Create learning progress for employee
    if (employee) {
      const progressData = [
        {
          employee: employee._id,
          module: modules[0]._id, // AI Fundamentals - Completed
          status: 'Completed',
          progress: 100,
          quizScore: 92,
          startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          employee: employee._id,
          module: modules[1]._id, // Advanced Data Analytics - In Progress
          status: 'In Progress',
          progress: 65,
          startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          employee: employee._id,
          module: modules[4]._id, // Leadership Essentials - In Progress
          status: 'In Progress',
          progress: 30,
          startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ];

      await LearningProgress.insertMany(progressData);
      console.log('\n✅ Seeded learning progress:');
      console.log('  - AI Fundamentals: Completed (92% quiz score)');
      console.log('  - Advanced Data Analytics: In Progress (65%)');
      console.log('  - Leadership Essentials: In Progress (30%)');
    }

    console.log('\n✅ Learning seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedLearning();
