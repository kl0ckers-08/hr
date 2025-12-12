// scripts/seedLearningModules.js
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const TopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
});

const QuizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
});

const ModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    numberOfTopics: { type: Number, required: true, default: 1 },
    duration: { type: String, default: "4h" },
    targetRoles: { type: [String], default: [] },
    topics: [TopicSchema],
    quizQuestions: [QuizQuestionSchema],
    fileName: { type: String },
    filePath: { type: String },
}, { timestamps: true });

const Module = mongoose.models.Module || mongoose.model("Module", ModuleSchema);

const learningModules = [
  {
    title: "AI Fundamentals",
    description: "Introduction to Artificial Intelligence and Machine Learning",
    category: "Technical",
    numberOfTopics: 8,
    duration: "4 hours",
    topics: [
      { title: "Introduction and Fundamentals", content: "AI is the simulation of human intelligence in machines.", order: 1 },
      { title: "Core Concepts", content: "Machine learning, neural networks, and deep learning basics.", order: 2 },
      { title: "Advanced Techniques", content: "Supervised, unsupervised, and reinforcement learning.", order: 3 },
      { title: "Practical Applications", content: "Real-world AI applications in various industries.", order: 4 },
    ],
    quizQuestions: [
      { question: "What is the main objective of this learning module?", options: ["To understand fundamental concepts", "To memorize all facts", "To complete assignments quickly", "To skip theoretical knowledge"], correctAnswer: 0 },
      { question: "What is Machine Learning?", options: ["A type of computer hardware", "A subset of AI that learns from data", "A programming language", "A database system"], correctAnswer: 1 },
      { question: "Which is NOT a type of machine learning?", options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Manual Learning"], correctAnswer: 3 },
    ],
  },
  {
    title: "Advanced Data Analytics",
    description: "Deep dive into data analysis techniques and visualization",
    category: "Technical",
    numberOfTopics: 12,
    duration: "6 hours",
    topics: [
      { title: "Data Analytics Overview", content: "Data analytics is the science of analyzing raw data to make conclusions about information. It involves applying an algorithmic or mechanical process to derive insights.", order: 1 },
      { title: "Data Collection Methods", content: "Various methods for collecting and organizing data.", order: 2 },
      { title: "Statistical Analysis", content: "Using statistics to interpret data patterns.", order: 3 },
      { title: "Data Visualization", content: "Creating visual representations of data insights.", order: 4 },
    ],
    quizQuestions: [
      { question: "What is data analytics?", options: ["Storing data in databases", "Analyzing raw data to make conclusions", "Creating websites", "Writing code"], correctAnswer: 1 },
      { question: "Which tool is commonly used for data visualization?", options: ["Microsoft Word", "Tableau", "Notepad", "Calculator"], correctAnswer: 1 },
      { question: "What is the first step in data analysis?", options: ["Visualization", "Data Collection", "Reporting", "Presentation"], correctAnswer: 1 },
    ],
  },
  {
    title: "Teaching Excellence",
    description: "Modern teaching methodologies and student engagement",
    category: "Pedagogy",
    numberOfTopics: 10,
    duration: "5 hours",
    topics: [
      { title: "Modern Teaching Methods", content: "Exploring contemporary approaches to education.", order: 1 },
      { title: "Student Engagement", content: "Techniques to keep students actively involved.", order: 2 },
      { title: "Assessment Strategies", content: "Effective ways to evaluate student learning.", order: 3 },
      { title: "Technology in Education", content: "Integrating digital tools in the classroom.", order: 4 },
    ],
    quizQuestions: [
      { question: "What is active learning?", options: ["Students passively listening", "Students actively participating", "Teachers lecturing only", "Reading textbooks"], correctAnswer: 1 },
      { question: "Which is an effective engagement technique?", options: ["Long lectures", "Interactive discussions", "Silent reading only", "No feedback"], correctAnswer: 1 },
      { question: "Why is assessment important?", options: ["To punish students", "To measure learning progress", "To waste time", "To create stress"], correctAnswer: 1 },
    ],
  },
  {
    title: "Research Methodology",
    description: "Comprehensive guide to academic research and publication",
    category: "Pedagogy",
    numberOfTopics: 8,
    duration: "4 hours",
    topics: [
      { title: "Research Fundamentals", content: "Understanding the basics of academic research.", order: 1 },
      { title: "Literature Review", content: "How to conduct effective literature reviews.", order: 2 },
      { title: "Research Design", content: "Designing robust research methodologies.", order: 3 },
      { title: "Publication Process", content: "Steps to publish academic papers.", order: 4 },
    ],
    quizQuestions: [
      { question: "What is a literature review?", options: ["Reading novels", "Reviewing existing research", "Writing fiction", "Creating art"], correctAnswer: 1 },
      { question: "What is peer review?", options: ["Friends reviewing work", "Expert evaluation of research", "Self-assessment", "Public voting"], correctAnswer: 1 },
      { question: "Which is a primary research method?", options: ["Reading articles", "Conducting surveys", "Watching videos", "Browsing internet"], correctAnswer: 1 },
    ],
  },
];

async function seedLearningModules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Module.deleteMany({});
    console.log("Cleared existing modules");

    const result = await Module.insertMany(learningModules);
    console.log(`Inserted ${result.length} learning modules`);

    console.log("\nLearning Modules seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding learning modules:", error);
    process.exit(1);
  }
}

seedLearningModules();
