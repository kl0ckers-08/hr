// scripts/seedHR2Complete.js
// Run with: node scripts/seedHR2Complete.js
// Seeds all HR2 data: modules, assessments, trainings, ESS requests, and employee progress

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Schemas
const userSchema = new mongoose.Schema({ fullName: String, email: String, password: String, role: String });
const moduleSchema = new mongoose.Schema({
  title: String, description: String, category: String, numberOfTopics: Number, targetRoles: [String], fileName: String, filePath: String
}, { timestamps: true });
const learningProgressSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  status: String, progress: Number, quizScore: Number, startedAt: Date, completedAt: Date
}, { timestamps: true });
const competencyAssessmentSchema = new mongoose.Schema({
  skillName: String, category: String, description: String,
  questions: [{ question: String, options: [String], correctAnswer: String }],
  passingScore: Number, duration: Number, isActive: Boolean
}, { timestamps: true });
const employeeCompetencySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  skillName: String, category: String, level: String, score: Number, assessedAt: Date
}, { timestamps: true });
const trainingProgramSchema = new mongoose.Schema({
  title: String, type: String, description: String, date: Date, time: String, location: String,
  maxParticipants: Number, registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], status: String, rating: Number
}, { timestamps: true });
const essRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, reason: String, status: String, processedAt: Date
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
const LearningProgress = mongoose.models.LearningProgress || mongoose.model('LearningProgress', learningProgressSchema);
const CompetencyAssessment = mongoose.models.CompetencyAssessment || mongoose.model('CompetencyAssessment', competencyAssessmentSchema);
const EmployeeCompetency = mongoose.models.EmployeeCompetency || mongoose.model('EmployeeCompetency', employeeCompetencySchema);
const TrainingProgram = mongoose.models.TrainingProgram || mongoose.model('TrainingProgram', trainingProgramSchema);
const ESSRequest = mongoose.models.ESSRequest || mongoose.model('ESSRequest', essRequestSchema);

// Data
const modulesData = [
  { title: 'AI Fundamentals', description: 'Introduction to Artificial Intelligence and Machine Learning', category: 'Technical', numberOfTopics: 8 },
  { title: 'Advanced Data Analytics', description: 'Deep dive into data analysis techniques and visualization', category: 'Technical', numberOfTopics: 12 },
  { title: 'Teaching Excellence', description: 'Modern teaching methodologies and student engagement', category: 'Pedagogy', numberOfTopics: 10 },
  { title: 'Research Methodology', description: 'Comprehensive guide to academic research and publication', category: 'Pedagogy', numberOfTopics: 8 },
  { title: 'Leadership Essentials', description: 'Core leadership skills and team management', category: 'Leadership', numberOfTopics: 6 },
  { title: 'Web Development Basics', description: 'Introduction to HTML, CSS, JavaScript', category: 'Technical', numberOfTopics: 15 },
  { title: 'Effective Communication', description: 'Professional communication and presentation skills', category: 'Pedagogy', numberOfTopics: 7 },
  { title: 'Project Management', description: 'Project planning, execution, and agile methodologies', category: 'Leadership', numberOfTopics: 9 },
];

const assessmentsData = [
  { skillName: "Programming", category: "Technical Skills", passingScore: 70, duration: 30, isActive: true,
    questions: [
      { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: "O(log n)" },
      { question: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: "Stack" },
      { question: "What does OOP stand for?", options: ["Object Oriented Programming", "Open Online Platform", "Operational Output Process", "Ordered Object Protocol"], correctAnswer: "Object Oriented Programming" },
      { question: "Which keyword inherits a class in JavaScript?", options: ["inherit", "extends", "implements", "super"], correctAnswer: "extends" },
      { question: "What is a closure?", options: ["A way to close a program", "A function with access to its outer scope", "A type of loop", "A database connection"], correctAnswer: "A function with access to its outer scope" }
    ]},
  { skillName: "Database Management", category: "Technical Skills", passingScore: 70, duration: 25, isActive: true,
    questions: [
      { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "System Query Language"], correctAnswer: "Structured Query Language" },
      { question: "Which SQL command retrieves data?", options: ["GET", "FETCH", "SELECT", "RETRIEVE"], correctAnswer: "SELECT" },
      { question: "What is a primary key?", options: ["The first column", "A unique identifier for each record", "A foreign key reference", "An index"], correctAnswer: "A unique identifier for each record" },
      { question: "Which JOIN returns all records from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctAnswer: "FULL OUTER JOIN" },
      { question: "What is normalization?", options: ["Making data normal", "Organizing data to reduce redundancy", "Encrypting data", "Compressing data"], correctAnswer: "Organizing data to reduce redundancy" }
    ]},
  { skillName: "Communication", category: "Soft Skills", passingScore: 70, duration: 20, isActive: true,
    questions: [
      { question: "Most important aspect of team communication?", options: ["Speaking loudly", "Active listening", "Using complex vocabulary", "Talking more"], correctAnswer: "Active listening" },
      { question: "How to handle disagreement with colleague?", options: ["Avoid them", "Discuss calmly and seek common ground", "Report to management", "Ignore"], correctAnswer: "Discuss calmly and seek common ground" },
      { question: "What is non-verbal communication?", options: ["Written messages", "Body language and facial expressions", "Phone calls", "Email"], correctAnswer: "Body language and facial expressions" },
      { question: "Best practice for giving feedback?", options: ["Be vague", "Be specific and constructive", "Only negative feedback", "Wait until annual review"], correctAnswer: "Be specific and constructive" },
      { question: "What is active listening?", options: ["Listening while multitasking", "Fully concentrating and responding thoughtfully", "Interrupting to share opinion", "Taking notes only"], correctAnswer: "Fully concentrating and responding thoughtfully" }
    ]},
  { skillName: "Project Management", category: "Soft Skills", passingScore: 70, duration: 25, isActive: true,
    questions: [
      { question: "Purpose of project scope?", options: ["Limit team size", "Define project boundaries and deliverables", "Set budget only", "Assign tasks"], correctAnswer: "Define project boundaries and deliverables" },
      { question: "What does SMART stand for?", options: ["Simple, Measurable, Achievable, Relevant, Timely", "Specific, Measurable, Achievable, Relevant, Time-bound", "Strategic, Managed, Accurate, Realistic, Tracked", "Standard, Monitored, Assigned, Reviewed, Tested"], correctAnswer: "Specific, Measurable, Achievable, Relevant, Time-bound" },
      { question: "What is a Gantt chart used for?", options: ["Financial reporting", "Project scheduling and timeline", "Team performance review", "Risk assessment"], correctAnswer: "Project scheduling and timeline" },
      { question: "What is the critical path?", options: ["Most expensive tasks", "Longest sequence of dependent tasks", "Easiest tasks", "Tasks for managers"], correctAnswer: "Longest sequence of dependent tasks" },
      { question: "What is stakeholder management?", options: ["Managing stocks", "Identifying and engaging people affected by project", "Managing salaries", "Handling complaints"], correctAnswer: "Identifying and engaging people affected by project" }
    ]},
];

const trainingsData = [
  { title: 'Teaching Excellence Workshop', type: 'Workshop', description: 'Enhance your teaching skills', date: new Date('2024-12-15'), time: '09:00', location: 'Room 301', maxParticipants: 20, status: 'Upcoming', rating: null },
  { title: 'AI in Education Seminar', type: 'Seminar', description: 'Learn about AI applications in education', date: new Date('2024-12-18'), time: '14:00', location: 'Auditorium', maxParticipants: 50, status: 'Upcoming', rating: null },
  { title: 'Research Methodology Masterclass', type: 'Workshop', description: 'Master research techniques', date: new Date('2024-12-20'), time: '10:00', location: 'Conference Room', maxParticipants: 25, status: 'Upcoming', rating: null },
  { title: 'Educational Technology Trends', type: 'Seminar', description: 'Latest trends in EdTech', date: new Date('2024-11-10'), time: '13:00', location: 'Room 201', maxParticipants: 30, status: 'Completed', rating: 4.8 },
  { title: 'Data Analytics Fundamentals', type: 'Workshop', description: 'Introduction to data analytics', date: new Date('2024-11-05'), time: '09:00', location: 'Computer Lab', maxParticipants: 20, status: 'Completed', rating: 4.5 },
];

const essRequestsData = [
  { type: 'Certificate of Employment', reason: 'Bank loan application', status: 'Approved', processedAt: new Date() },
  { type: 'Training Certificate', reason: 'Professional portfolio', status: 'Pending' },
  { type: 'Leave Request', reason: 'Family emergency', status: 'Approved', processedAt: new Date() },
  { type: 'Certificate of Employment', reason: 'Visa application', status: 'Pending' },
];

async function seedAll() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find employee
    const employee = await User.findOne({ role: 'employee2' });
    if (!employee) {
      console.log('❌ No employee2 user found. Run seedHR2Users.js first.');
      process.exit(1);
    }
    console.log(`Found employee: ${employee.fullName}\n`);

    // 1. Seed Modules
    await Module.deleteMany({});
    const modules = await Module.insertMany(modulesData);
    console.log(`✅ Seeded ${modules.length} learning modules`);

    // 2. Seed Learning Progress
    await LearningProgress.deleteMany({ employee: employee._id });
    const progressData = [
      { employee: employee._id, module: modules[0]._id, status: 'Completed', progress: 100, quizScore: 92, completedAt: new Date() },
      { employee: employee._id, module: modules[1]._id, status: 'In Progress', progress: 65, startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { employee: employee._id, module: modules[4]._id, status: 'In Progress', progress: 30, startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ];
    await LearningProgress.insertMany(progressData);
    console.log(`✅ Seeded learning progress for employee`);

    // 3. Seed Competency Assessments
    await CompetencyAssessment.deleteMany({});
    const assessments = await CompetencyAssessment.insertMany(assessmentsData);
    console.log(`✅ Seeded ${assessments.length} competency assessments`);

    // 4. Seed Employee Competencies
    await EmployeeCompetency.deleteMany({ employee: employee._id });
    const competenciesData = [
      { employee: employee._id, skillName: 'Programming', category: 'Technical Skills', level: 'Advanced', score: 85, assessedAt: new Date() },
      { employee: employee._id, skillName: 'Database Management', category: 'Technical Skills', level: 'Intermediate', score: 60, assessedAt: new Date() },
    ];
    await EmployeeCompetency.insertMany(competenciesData);
    console.log(`✅ Seeded employee competencies`);

    // 5. Seed Training Programs
    await TrainingProgram.deleteMany({});
    const trainingsWithRegistrations = trainingsData.map(t => ({
      ...t,
      registrations: t.status === 'Upcoming' ? [employee._id] : [],
      attendees: t.status === 'Completed' ? [employee._id] : [],
    }));
    await TrainingProgram.insertMany(trainingsWithRegistrations);
    console.log(`✅ Seeded ${trainingsData.length} training programs`);

    // 6. Seed ESS Requests
    await ESSRequest.deleteMany({ employee: employee._id });
    const essWithEmployee = essRequestsData.map(e => ({ ...e, employee: employee._id }));
    await ESSRequest.insertMany(essWithEmployee);
    console.log(`✅ Seeded ${essRequestsData.length} ESS requests`);

    console.log('\n🎉 HR2 complete seed finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAll();
