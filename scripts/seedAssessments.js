// scripts/seedAssessments.js
// Run with: node scripts/seedAssessments.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const competencyAssessmentSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
  }],
  passingScore: { type: Number, default: 70 },
  duration: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const CompetencyAssessment = mongoose.models.CompetencyAssessment || 
  mongoose.model('CompetencyAssessment', competencyAssessmentSchema);

const assessmentsData = [
  {
    skillName: "Programming",
    category: "Technical Skills",
    description: "Assess your programming knowledge and problem-solving skills",
    passingScore: 70,
    duration: 30,
    questions: [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: "O(log n)"
      },
      {
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: "Stack"
      },
      {
        question: "What does OOP stand for?",
        options: ["Object Oriented Programming", "Open Online Platform", "Operational Output Process", "Ordered Object Protocol"],
        correctAnswer: "Object Oriented Programming"
      },
      {
        question: "Which keyword is used to inherit a class in JavaScript?",
        options: ["inherit", "extends", "implements", "super"],
        correctAnswer: "extends"
      },
      {
        question: "What is a closure in programming?",
        options: ["A way to close a program", "A function with access to its outer scope", "A type of loop", "A database connection"],
        correctAnswer: "A function with access to its outer scope"
      }
    ]
  },
  {
    skillName: "Database Management",
    category: "Technical Skills",
    description: "Test your knowledge of database concepts and SQL",
    passingScore: 70,
    duration: 25,
    questions: [
      {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "System Query Language"],
        correctAnswer: "Structured Query Language"
      },
      {
        question: "Which SQL command is used to retrieve data?",
        options: ["GET", "FETCH", "SELECT", "RETRIEVE"],
        correctAnswer: "SELECT"
      },
      {
        question: "What is a primary key?",
        options: ["The first column in a table", "A unique identifier for each record", "A foreign key reference", "An index"],
        correctAnswer: "A unique identifier for each record"
      },
      {
        question: "Which type of JOIN returns all records from both tables?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctAnswer: "FULL OUTER JOIN"
      },
      {
        question: "What is normalization in databases?",
        options: ["Making data normal", "Organizing data to reduce redundancy", "Encrypting data", "Compressing data"],
        correctAnswer: "Organizing data to reduce redundancy"
      }
    ]
  },
  {
    skillName: "Communication",
    category: "Soft Skills",
    description: "Evaluate your communication and interpersonal skills",
    passingScore: 70,
    duration: 20,
    questions: [
      {
        question: "What is the most important aspect of effective communication in a team?",
        options: ["Speaking loudly and clearly", "Active listening and understanding", "Using complex vocabulary", "Talking more than others"],
        correctAnswer: "Active listening and understanding"
      },
      {
        question: "How should you handle a disagreement with a colleague?",
        options: ["Avoid them completely", "Discuss calmly and seek common ground", "Report to management immediately", "Ignore the issue"],
        correctAnswer: "Discuss calmly and seek common ground"
      },
      {
        question: "What is non-verbal communication?",
        options: ["Written messages", "Body language and facial expressions", "Phone calls", "Email communication"],
        correctAnswer: "Body language and facial expressions"
      },
      {
        question: "Which is the best practice for giving feedback?",
        options: ["Be vague to avoid conflict", "Be specific and constructive", "Only give negative feedback", "Wait until annual review"],
        correctAnswer: "Be specific and constructive"
      },
      {
        question: "What is active listening?",
        options: ["Listening while doing other tasks", "Fully concentrating and responding thoughtfully", "Interrupting to share your opinion", "Taking notes only"],
        correctAnswer: "Fully concentrating and responding thoughtfully"
      }
    ]
  },
  {
    skillName: "Project Management",
    category: "Soft Skills",
    description: "Test your project management and organizational skills",
    passingScore: 70,
    duration: 25,
    questions: [
      {
        question: "What is the purpose of a project scope?",
        options: ["To limit team size", "To define project boundaries and deliverables", "To set the budget only", "To assign tasks"],
        correctAnswer: "To define project boundaries and deliverables"
      },
      {
        question: "What does the acronym SMART stand for in goal setting?",
        options: ["Simple, Measurable, Achievable, Relevant, Timely", "Specific, Measurable, Achievable, Relevant, Time-bound", "Strategic, Managed, Accurate, Realistic, Tracked", "Standard, Monitored, Assigned, Reviewed, Tested"],
        correctAnswer: "Specific, Measurable, Achievable, Relevant, Time-bound"
      },
      {
        question: "What is a Gantt chart used for?",
        options: ["Financial reporting", "Project scheduling and timeline visualization", "Team performance review", "Risk assessment"],
        correctAnswer: "Project scheduling and timeline visualization"
      },
      {
        question: "What is the critical path in project management?",
        options: ["The most expensive tasks", "The longest sequence of dependent tasks", "The easiest tasks to complete", "Tasks assigned to managers"],
        correctAnswer: "The longest sequence of dependent tasks"
      },
      {
        question: "What is stakeholder management?",
        options: ["Managing company stocks", "Identifying and engaging people affected by the project", "Managing team salaries", "Handling customer complaints"],
        correctAnswer: "Identifying and engaging people affected by the project"
      }
    ]
  },
  {
    skillName: "Data Analytics",
    category: "Technical Skills",
    description: "Assess your data analysis and interpretation skills",
    passingScore: 70,
    duration: 30,
    questions: [
      {
        question: "What is the purpose of data visualization?",
        options: ["To make data look pretty", "To communicate insights effectively", "To hide complex data", "To reduce data size"],
        correctAnswer: "To communicate insights effectively"
      },
      {
        question: "What is a KPI?",
        options: ["Key Performance Indicator", "Knowledge Processing Index", "Kernel Programming Interface", "Key Project Initiative"],
        correctAnswer: "Key Performance Indicator"
      },
      {
        question: "What does correlation measure?",
        options: ["Causation between variables", "The relationship strength between variables", "Data accuracy", "Sample size"],
        correctAnswer: "The relationship strength between variables"
      },
      {
        question: "What is the difference between mean and median?",
        options: ["They are the same", "Mean is the average, median is the middle value", "Median is the average, mean is the middle value", "Both measure data spread"],
        correctAnswer: "Mean is the average, median is the middle value"
      },
      {
        question: "What is a dashboard in data analytics?",
        options: ["A car component", "A visual display of key metrics", "A database table", "A programming language"],
        correctAnswer: "A visual display of key metrics"
      }
    ]
  }
];

async function seedAssessments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing assessments
    await CompetencyAssessment.deleteMany({});
    console.log('Cleared existing assessments');

    // Insert new assessments
    const result = await CompetencyAssessment.insertMany(assessmentsData);
    console.log(`✅ Seeded ${result.length} competency assessments`);

    for (const assessment of result) {
      console.log(`  - ${assessment.skillName} (${assessment.questions.length} questions)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAssessments();
